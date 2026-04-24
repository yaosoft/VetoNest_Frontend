// src/hooks/useVideoConsultation.js
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

let SimplePeer = null;
let loadingPromise = null;

const loadSimplePeer = async () => {
  if (SimplePeer) return SimplePeer;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      const module = await import('simple-peer');
      SimplePeer = module.default || module;
      console.log('SimplePeer loaded successfully');
      return SimplePeer;
    } catch (err) {
      console.error('Failed to load simple-peer:', err);
      throw err;
    }
  })();
  return loadingPromise;
};

const CHANNEL_NAME = 'vetonest-chat';

export const useVideoConsultation = (
  currentUserId,
  targetUserId,
  onCallEnd,
  isInitiator = true,
  consultationId = null
) => {
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

  // Save call history to backend
  const saveCallHistory = useCallback(async (startedAt, endedAt, duration, missed = false, endedBy = 'system') => {
    if (!consultationId) return;
    try {
      await fetch('/api/call-history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          duration,
          missed,
          endedBy,
        }),
      });
    } catch (err) {
      console.error('Failed to save call history:', err);
    }
  }, [consultationId]);

  const setupDataChannel = useCallback((channel) => {
    if (!channel) return;
    console.log(`📡 setupDataChannel — readyState: ${channel.readyState}`);
    dataChannelRef.current = channel;

    const markOpen = () => {
      console.log('✅ Data channel open');
      setDataChannelReady(true);
    };
    const markClose = () => {
      console.log('❌ Data channel closed');
      dataChannelRef.current = null;
      setDataChannelReady(false);
    };

    if (channel.readyState === 'open') markOpen();
    channel.onopen = markOpen;
    channel.onclose = markClose;
    channel.onerror = (e) => console.error('Data channel error:', e);
    channel.onmessage = (event) => {
      if (onMessageRef.current) onMessageRef.current(event.data);
    };
  }, []);

  const resetCallState = useCallback(() => {
    if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
    callInProgressRef.current = false;
    dataChannelRef.current = null;
    setDataChannelReady(false);
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (_) {}
      peerRef.current = null;
    }
  }, []);

  const wirePeer = useCallback((peer, role) => {
    peer.on('datachannel', (ch) => {
      console.log(`📡 datachannel event (${role}) — label: ${ch.label}`);
      setupDataChannel(ch);
    });

    peer.on('connect', () => {
      console.log(`🔗 Peer connected (${role})`);
      if (peer._channel && !dataChannelRef.current) {
        console.log('📡 Catching channel via connect event');
        setupDataChannel(peer._channel);
      }
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

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err);
      resetCallState();
      setConnectionStatus('error');
    });
  }, [setupDataChannel, resetCallState, onCallEnd, saveCallHistory, isInitiator]);

  // ========== endCall is defined FIRST so it can be used in initializeCall ==========
  const endCall = useCallback(() => {
    console.log('Ending call');
    if (callConnectedRef.current && socketRef.current?.connected) {
      socketRef.current.emit('call-ended', {
        to: targetUserId,
        from: currentUserId,
      });
    }
    if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
    resetCallState();
    setRemoteStream(null);
    setConnectionStatus('disconnected');
    if (socketRef.current) socketRef.current.disconnect();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    if (onCallEnd) onCallEnd();
  }, [targetUserId, currentUserId, resetCallState, onCallEnd]);

  const initializeCall = useCallback(async () => {
    if (socketRef.current?.connected && localStreamRef.current) {
      console.log('Already initialized');
      return;
    }

    try {
      setConnectionStatus('initializing');

      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log('Local stream acquired');
      }

      if (!socketRef.current || !socketRef.current.connected) {
        const url = process.env.REACT_APP_SIGNALING_URL || 'http://localhost:5000';
        socketRef.current = io(url, { transports: ['websocket', 'polling'] });

        socketRef.current.on('connect', () => {
          console.log('Connected to signaling server as userId:', currentUserId);
          socketRef.current.emit('register', { userId: String(currentUserId) });
        });

        socketRef.current.on('users-online', (users) => console.log('Online users:', users));

        socketRef.current.on('incoming-call', async ({ from, offer: incomingOffer }) => {
          console.log('📞 Incoming call from:', from);
          if (String(from) === String(currentUserId)) return;
          if (isInitiatorRef.current) {
            console.log('Initiator ignoring incoming call');
            return;
          }
          if (callInProgressRef.current) {
            console.log('Call already in progress — rejecting');
            return;
          }

          resetCallState();
          callInProgressRef.current = true;
          setConnectionStatus('ringing');
          await loadSimplePeer();

          const peer = new SimplePeer({
            initiator: false,
            trickle: true,
            stream: localStreamRef.current,
            channelName: CHANNEL_NAME,
          });

          wirePeer(peer, 'receiver');

          peer.on('signal', (data) => {
            console.log('📤 Sending answer to:', from);
            socketRef.current.emit('answer-call', { to: from, answer: data });
          });

          peer.signal(incomingOffer);
          peerRef.current = peer;
        });

        socketRef.current.on('call-answered', ({ answer }) => {
          console.log('📞 Call answered — signaling');
          if (peerRef.current && isInitiatorRef.current) {
            try { peerRef.current.signal(answer); } catch (e) { console.error(e); }
          }
        });

        socketRef.current.on('ice-candidate', ({ candidate }) => {
          if (peerRef.current) {
            try { peerRef.current.signal(candidate); } catch (e) { console.error(e); }
          }
        });

        socketRef.current.on('user-not-found', ({ to }) => {
          console.error('❌ User not found:', to);
          resetCallState();
          setConnectionStatus('error');
        });

        socketRef.current.on('call-missed', ({ from, vetName }) => {
          if (!isInitiatorRef.current) {
            console.warn(`Appel manqué de Dr. ${vetName}`);
            resetCallState();
            setConnectionStatus('disconnected');
          }
        });

        // Now endCall is defined, safe to use
        socketRef.current.on('call-ended', ({ from }) => {
          console.info("L'autre partie a raccroché.");
          endCall();
        });
      }

      setConnectionStatus('disconnected');
    } catch (err) {
      console.error('initializeCall failed:', err);
      setConnectionStatus('error');
      throw err;
    }
  }, [currentUserId, resetCallState, wirePeer, endCall]);

  const startCall = useCallback(async () => {
    if (!isInitiatorRef.current) {
      console.log('Not initiator – waiting for incoming call');
      return;
    }
    if (callInProgressRef.current) {
      endCall();
      await new Promise(r => setTimeout(r, 500));
    }
    if (!socketRef.current?.connected || !localStreamRef.current) {
      await initializeCall();
    }
    await new Promise(r => setTimeout(r, 300));

    resetCallState();
    callInProgressRef.current = true;
    setConnectionStatus('calling');
    callConnectedRef.current = false;

    try {
      console.log('📞 Starting call to:', targetUserId);
      await loadSimplePeer();

      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream: localStreamRef.current,
        channelName: CHANNEL_NAME,
      });

      wirePeer(peer, 'initiator');

      peer.on('signal', (data) => {
        console.log('📤 Sending offer to:', targetUserId);
        socketRef.current.emit('call-user', {
          to: targetUserId,
          from: currentUserId,
          offer: data,
        });
      });

      missedCallTimeoutRef.current = setTimeout(() => {
        if (!callConnectedRef.current && callInProgressRef.current) {
          console.log('⏰ Call not answered within 30s – marking missed');
          socketRef.current?.emit('call-missed', {
            to: targetUserId,
            from: currentUserId,
            vetName: 'Veterinarian',
          });
          const now = new Date();
          saveCallHistory(now, now, 0, true, 'system');
          endCall();
        }
      }, 30000);

      peerRef.current = peer;
    } catch (err) {
      console.error('startCall failed:', err);
      setConnectionStatus('error');
      resetCallState();
    }
  }, [targetUserId, currentUserId, initializeCall, resetCallState, wirePeer, saveCallHistory, endCall]);

  const setOnMessage = useCallback((fn) => {
    onMessageRef.current = fn;
  }, []);

  const sendChatMessage = useCallback((text) => {
    const ch = dataChannelRef.current;
    if (!ch || ch.readyState !== 'open') {
      console.warn('Cannot send — channel not open. State:', ch?.readyState);
      return false;
    }
    ch.send(JSON.stringify({ type: 'chat', message: text, sender: 'me' }));
    return true;
  }, []);

  useEffect(() => {
    return () => {
      if (missedCallTimeoutRef.current) clearTimeout(missedCallTimeoutRef.current);
      resetCallState();
      if (socketRef.current) socketRef.current.disconnect();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [resetCallState]);

  return {
    localStream,
    remoteStream,
    connectionStatus,
    dataChannelReady,
    initializeCall,
    startCall,
    endCall,
    setOnMessage,
    sendChatMessage,
    getPeer: () => peerRef.current,
  };
};