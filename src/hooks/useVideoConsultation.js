// src/hooks/useVideoConsultation.js
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import SimplePeerLib from 'simple-peer';

// Lazily resolve useSocket so the hook stays usable on the vet side where
// SocketProvider may not wrap the tree (it won't throw at import time).
let _useSocket = null;
try {
  // eslint-disable-next-line
  _useSocket = require('../context/SocketProvider').useSocket;
} catch (_) {}

let SimplePeer = SimplePeerLib;
const loadSimplePeer = async () => { return SimplePeer; };

const getSignalingUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SIGNALING_URL) {
    return process.env.REACT_APP_SIGNALING_URL;
  }
  return 'https://vetonest.com';
};

const CHANNEL_NAME = 'vetonest-chat';

export const useVideoConsultation = (
  currentUserId,
  targetUserId,
  onCallEnd,
  isInitiator = true,
  consultationId = null,
  useProviderSocket = null,
  vetSocket = null,
  vetListenersAttached = null  // shared ref from ConsultationListVet — prevents duplicate listener registration across all card buttons
) => {
  // The pet owner (isInitiator=true) reuses the SocketProvider's socket.
  // The vet (isInitiator=false) reuses its own vetSocketRef from ConsultationListVet.
  // Both strategies prevent double-registration under the same userId.
  const shouldUseProviderSocket = useProviderSocket !== null ? useProviderSocket : isInitiator;
  const socketContext = (shouldUseProviderSocket && _useSocket) ? _useSocket() : null;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [dataChannelReady, setDataChannelReady] = useState(false);

  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const callInProgressRef = useRef(false);
  const isInitiatorRef = useRef(isInitiator);
  const dataChannelRef = useRef(null);
  const onMessageRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const missedCallTimeoutRef = useRef(null);
  const callConnectedRef = useRef(false);
  const initiatingCallRef = useRef(false);
  const isEndingCallRef = useRef(false);
  const listenersAttachedRef = useRef(false);
  const ownsSocketRef = useRef(false); // true only when we created the socket ourselves

  // Stable refs for callbacks used inside socket listeners.
  // Socket listeners are attached once — these refs let them always call the
  // latest version of each function without stale closure issues.
  const resetCallStateRef = useRef(null);
  const wirePeerRef = useRef(null);
  const endCallRef = useRef(null);

  const saveCallHistory = useCallback(async (startedAt, endedAt, duration, missed = false, endedBy = 'system') => {
    if (!consultationId) return;
    try {
      await fetch('/api/call-history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), duration, missed, endedBy }),
      });
    } catch (err) { console.error('Failed to save call history:', err); }
  }, [consultationId]);

  const setupDataChannel = useCallback((channel) => {
    if (!channel) return;
    dataChannelRef.current = channel;
    const markOpen = () => { setDataChannelReady(true); };
    const markClose = () => { dataChannelRef.current = null; setDataChannelReady(false); };
    if (channel.readyState === 'open') markOpen();
    channel.onopen = markOpen;
    channel.onclose = markClose;
    channel.onerror = (e) => console.error('Data channel error:', e);
    channel.onmessage = (event) => { if (onMessageRef.current) onMessageRef.current(event.data); };
  }, []);

  const resetCallState = useCallback(() => {
    if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
    callInProgressRef.current = false;
    initiatingCallRef.current = false;
    dataChannelRef.current = null;
    setDataChannelReady(false);
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (_) {} peerRef.current = null; }
  }, []);
  resetCallStateRef.current = resetCallState;

  const wirePeer = useCallback((peer, role) => {
    peer.on('datachannel', (ch) => { setupDataChannel(ch); });
    peer.on('connect', () => {
      console.log(`🔗 Peer connected (${role})`);
      if (peer._channel && !dataChannelRef.current) setupDataChannel(peer._channel);
      callConnectedRef.current = true;
      callStartTimeRef.current = new Date();
      if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
    });
    peer.on('stream', (stream) => {
      console.log('📹 Remote stream received');
      setRemoteStream(stream);
      setConnectionStatus('connected');
    });
    peer.on('close', () => {
      console.log('🔌 Peer closed');
      if (callConnectedRef.current && callStartTimeRef.current) {
        const endedAt = new Date();
        const duration = Math.round((endedAt - callStartTimeRef.current) / 1000);
        saveCallHistory(callStartTimeRef.current, endedAt, duration, false, isInitiator ? 'owner' : 'vet');
        callStartTimeRef.current = null;
        callConnectedRef.current = false;
      }
      resetCallState();
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      if (onCallEnd) onCallEnd();
    });
    peer.on('error', (err) => { console.error('❌ Peer error:', err); resetCallState(); setConnectionStatus('error'); });
  }, [setupDataChannel, resetCallState, onCallEnd, saveCallHistory, isInitiator]);
  wirePeerRef.current = wirePeer;

  const endCall = useCallback(() => {
    if (isEndingCallRef.current) return;
    isEndingCallRef.current = true;
    console.log('Ending call');
    if (socketRef.current?.connected) {
      socketRef.current.emit('call-ended', { to: targetUserId, from: currentUserId });
    }
    if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
    resetCallState();
    setRemoteStream(null);
    setConnectionStatus('disconnected');
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    setLocalStream(null);
    setTimeout(() => { isEndingCallRef.current = false; }, 1000);
    if (onCallEnd) onCallEnd();
  }, [targetUserId, currentUserId, resetCallState, onCallEnd]);
  endCallRef.current = endCall;

  // Attach WebRTC signaling listeners once per socket lifetime.
  // All callbacks inside use *Ref.current so they always invoke the latest
  // function version — no stale closure issues even across multiple calls.
  // When vetListenersAttached is provided, it acts as a shared guard across
  // all card button instances so listeners attach exactly once.
  const attachListeners = useCallback((socket) => {
    // Use the shared guard (vet) or the local one (everyone else)
    const alreadyAttached = vetListenersAttached ? vetListenersAttached.current : listenersAttachedRef.current;
    if (alreadyAttached) return;
    if (vetListenersAttached) vetListenersAttached.current = true;
    listenersAttachedRef.current = true;
    console.log('📡 Attaching WebRTC listeners to socket', socket.id);

    socket.on('incoming-call', async ({ from, offer: incomingOffer }) => {
      if (String(from) === String(currentUserId)) return;
      if (isInitiatorRef.current) { console.log('Initiator ignoring incoming call'); return; }
      if (callInProgressRef.current) { console.log('Call already in progress — rejecting'); return; }
      resetCallStateRef.current?.();
      callInProgressRef.current = true;
      setConnectionStatus('ringing');
      await loadSimplePeer();
      // Read localStreamRef.current NOW (at call time) — it's always current
      const peer = new SimplePeer({ initiator: false, trickle: true, stream: localStreamRef.current, channelName: CHANNEL_NAME });
      wirePeerRef.current?.(peer, 'receiver');
      peer.on('signal', (data) => {
        if (data.type === 'answer') {
          socket.emit('answer-call', { to: from, answer: data });
        } else {
          socket.emit('ice-candidate', { to: from, from: currentUserId, candidate: data });
        }
      });
      peer.signal(incomingOffer);
      peerRef.current = peer;
    });

    socket.on('call-answered', ({ answer }) => {
      if (peerRef.current && isInitiatorRef.current) {
        try { peerRef.current.signal(answer); } catch (e) { console.error(e); }
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (peerRef.current) { try { peerRef.current.signal(candidate); } catch (e) { console.error(e); } }
    });

    socket.on('user-not-found', ({ to }) => {
      console.error('❌ User not found:', to);
      resetCallStateRef.current?.();
      setConnectionStatus('error');
    });

    socket.on('call-missed', ({ from, vetName }) => {
      if (!isInitiatorRef.current) {
        console.warn(`Appel manqué de Dr. ${vetName}`);
        resetCallStateRef.current?.();
        setConnectionStatus('disconnected');
      }
    });

    socket.on('call-ended', ({ from }) => {
      if (!callInProgressRef.current) return;
      console.info("L'autre partie a raccroché.");
      endCallRef.current?.();
    });
  }, [currentUserId, vetListenersAttached]);

  const initializeCall = useCallback(async () => {
    if (socketRef.current?.connected && localStreamRef.current) {
      console.log('Already initialized');
      return;
    }
    try {
      setConnectionStatus('initializing');

      // (Re-)acquire media — endCall() stops tracks
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log('Local stream acquired');
      }

      // --- SOCKET RESOLUTION (priority order) ---

      // 0. Vet's own socket (passed from ConsultationListVet via vetSocket ref).
      //    ConsultationListVet already registered this socket as the vet's userId.
      //    Reusing it keeps a single registration and ensures incoming-call events
      //    arrive on the same socket that has our listeners.
      const vetSocketInstance = vetSocket?.current;
      if (vetSocketInstance) {
        if (!vetSocketInstance.connected) {
          console.log('Vet socket not yet connected, waiting...');
          await new Promise((resolve) => {
            if (vetSocketInstance.connected) { resolve(); return; }
            vetSocketInstance.once('connect', resolve);
            setTimeout(resolve, 3000);
          });
        }
        if (socketRef.current !== vetSocketInstance) {
          console.log('✅ Reusing vet socket — single registration, no conflict');
          socketRef.current = vetSocketInstance;
          ownsSocketRef.current = false;
          attachListeners(socketRef.current);
        }
        setConnectionStatus('disconnected');
        return;
      }

      // 1. SocketProvider socket (pet owner): read fresh from context ref.
      //    This is always the registered socket — reusing it avoids double-registration.
      const providerSocket = socketContext?.socketRef?.current;
      if (providerSocket) {
        if (!providerSocket.connected) {
          // Socket exists but not yet connected — wait for it
          console.log('Provider socket not yet connected, waiting...');
          await new Promise((resolve) => {
            if (providerSocket.connected) { resolve(); return; }
            providerSocket.once('connect', resolve);
            // Fallback timeout so we don't hang forever
            setTimeout(resolve, 3000);
          });
        }
        if (socketRef.current !== providerSocket) {
          console.log('✅ Using SocketProvider socket — single registration, no conflict');
          socketRef.current = providerSocket;
          ownsSocketRef.current = false;
          attachListeners(socketRef.current);
        }
        setConnectionStatus('disconnected');
        return;
      }

      // 2. Our own socket from a previous call that's still alive
      if (socketRef.current?.connected) {
        console.log('Reusing existing hook socket');
        setConnectionStatus('disconnected');
        return;
      }

      // 3. No provider, no existing socket — create one (vet side)
      const url = getSignalingUrl();
      console.log('Creating new socket (no SocketProvider)');
      const socket = io(url, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      ownsSocketRef.current = true;
      socket.on('connect', () => {
        console.log('Connected to signaling server as userId:', currentUserId);
        socket.emit('register', { userId: String(currentUserId) });
      });
      socket.on('users-online', (users) => console.log('Online users:', users));
      attachListeners(socket);

      setConnectionStatus('disconnected');
    } catch (err) {
      console.error('initializeCall failed:', err);
      setConnectionStatus('error');
      throw err;
    }
  }, [currentUserId, socketContext, attachListeners]);

  const startCall = useCallback(async () => {
    if (!isInitiatorRef.current) { console.log('Not initiator – waiting for incoming call'); return; }
    if (initiatingCallRef.current) { console.log('Call already being initiated, ignoring duplicate'); return; }
    if (callInProgressRef.current) { endCall(); await new Promise(r => setTimeout(r, 500)); }
    if (!socketRef.current?.connected || !localStreamRef.current) { await initializeCall(); }
    await new Promise(r => setTimeout(r, 300));
    resetCallState();
    callInProgressRef.current = true;
    initiatingCallRef.current = true;
    setConnectionStatus('calling');
    callConnectedRef.current = false;
    try {
      console.log('📞 Starting call to:', targetUserId);
      await loadSimplePeer();
      const peer = new SimplePeer({ initiator: true, trickle: true, stream: localStreamRef.current, channelName: CHANNEL_NAME });
      wirePeer(peer, 'initiator');
      peer.on('signal', (data) => {
        if (data.type === 'offer') {
          socketRef.current.emit('call-user', { to: targetUserId, from: currentUserId, offer: data });
        } else {
          socketRef.current.emit('ice-candidate', { to: targetUserId, from: currentUserId, candidate: data });
        }
      });
      missedCallTimeoutRef.current = setTimeout(() => {
        if (!callConnectedRef.current && callInProgressRef.current) {
          console.log('⏰ Call not answered within 30s – marking missed');
          socketRef.current?.emit('call-missed', { to: targetUserId, from: currentUserId, vetName: 'Veterinarian' });
          const now = new Date();
          saveCallHistory(now, now, 0, true, 'system');
          endCall();
        }
        initiatingCallRef.current = false;
      }, 30000);
      peerRef.current = peer;
    } catch (err) {
      console.error('startCall failed:', err);
      setConnectionStatus('error');
      resetCallState();
      initiatingCallRef.current = false;
    }
  }, [targetUserId, currentUserId, initializeCall, resetCallState, wirePeer, saveCallHistory, endCall]);

  const setOnMessage = useCallback((fn) => { onMessageRef.current = fn; }, []);

  const sendChatMessage = useCallback((text) => {
    const ch = dataChannelRef.current;
    if (!ch || ch.readyState !== 'open') { console.warn('Cannot send — channel not open. State:', ch?.readyState); return false; }
    ch.send(JSON.stringify({ type: 'chat', message: text, sender: 'me' }));
    return true;
  }, []);

  useEffect(() => {
    return () => {
      if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
      resetCallState();
      if (ownsSocketRef.current && socketRef.current) {
        socketRef.current.disconnect();
      }
      listenersAttachedRef.current = false;
      // Only reset the shared guard if we're the component that set it
      // (i.e. the one that actually called attachListeners)
      if (vetListenersAttached && listenersAttachedRef.current === false) {
        vetListenersAttached.current = false;
      }
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [resetCallState]);

  return {
    localStream, remoteStream, connectionStatus, dataChannelReady,
    initializeCall, startCall, endCall, setOnMessage, sendChatMessage,
    getPeer: () => peerRef.current,
  };
};