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

export const useVideoConsultation = (currentUserId, targetUserId, onCallEnd, isInitiator = true) => {
  const [localStream,      setLocalStream]      = useState(null);
  const [remoteStream,     setRemoteStream]     = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  // Exposed as React state so VideoCallModal re-renders when channel opens
  const [dataChannelReady, setDataChannelReady] = useState(false);

  const peerRef           = useRef(null);
  const socketRef         = useRef(null);
  const localStreamRef    = useRef(null);
  const callInProgressRef = useRef(false);
  const isInitiatorRef    = useRef(isInitiator);

  // Stable ref shared with VideoCallModal — always points to the live channel
  const dataChannelRef = useRef(null);
  // Callback registered by VideoCallModal to receive incoming messages
  const onMessageRef   = useRef(null);

  // ── Wire a newly acquired RTCDataChannel ────────────────────────────────
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

    channel.onopen    = markOpen;
    channel.onclose   = markClose;
    channel.onerror   = (e) => console.error('Data channel error:', e);
    channel.onmessage = (event) => {
      if (onMessageRef.current) onMessageRef.current(event.data);
    };
  }, []);

  // ── Tear down a call ────────────────────────────────────────────────────
  const resetCallState = useCallback(() => {
    callInProgressRef.current = false;
    dataChannelRef.current    = null;
    setDataChannelReady(false);
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (_) {}
      peerRef.current = null;
    }
  }, []);

  // ── Attach all peer events (works for both roles) ───────────────────────
  const wirePeer = useCallback((peer, role) => {
    // Both initiator and receiver can receive a 'datachannel' event.
    // For the initiator, SimplePeer also fires it on the created channel.
    peer.on('datachannel', (ch) => {
      console.log(`📡 datachannel event (${role}) — label: ${ch.label}`);
      setupDataChannel(ch);
    });

    // When the peer is fully connected, also check peer._channel directly.
    // This catches cases where 'datachannel' fired before this listener was attached.
    peer.on('connect', () => {
      console.log(`🔗 Peer connected (${role})`);
      if (peer._channel && !dataChannelRef.current) {
        console.log('📡 Catching channel via connect event');
        setupDataChannel(peer._channel);
      }
    });

    peer.on('stream', (stream) => {
      console.log('📹 Remote stream received');
      setRemoteStream(stream);
      setConnectionStatus('connected');
    });

    peer.on('close', () => {
      console.log('🔌 Peer closed');
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
  }, [setupDataChannel, resetCallState, onCallEnd]);

  // ── Initialize: camera + socket registration ────────────────────────────
  const initializeCall = useCallback(async () => {
    // Idempotent — skip if already set up
    if (socketRef.current?.connected && localStreamRef.current) {
      console.log('Already initialized');
      return;
    }

    try {
      setConnectionStatus('initializing');

      // Camera / mic
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log('Local stream acquired');
      }

      // Socket
      if (!socketRef.current || !socketRef.current.connected) {
        const url = process.env.REACT_APP_SIGNALING_URL || 'http://localhost:5000';
        socketRef.current = io(url, { transports: ['websocket', 'polling'] });

        socketRef.current.on('connect', () => {
          console.log('Connected to signaling server as userId:', currentUserId);
          socketRef.current.emit('register', { userId: currentUserId });
        });

        socketRef.current.on('users-online', (users) => console.log('Online users:', users));

        // ── Incoming call (receiver side) ──────────────────────────────
        socketRef.current.on('incoming-call', async ({ from, offer: incomingOffer }) => {
          console.log('📞 Incoming call from:', from);

          if (String(from) === String(currentUserId)) {
            console.log('Ignoring self-echo');
            return;
          }
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
            initiator:   false,
            trickle:     true,
            stream:      localStreamRef.current,
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

        // ── Answer received (initiator side) ───────────────────────────
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
      }

      setConnectionStatus('disconnected'); // ready, waiting
    } catch (err) {
      console.error('initializeCall failed:', err);
      setConnectionStatus('error');
      throw err;
    }
  }, [currentUserId, resetCallState, wirePeer]);

  // ── Start call (initiator only) ─────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (!isInitiatorRef.current) {
      console.log('Not initiator — waiting for incoming call');
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

    try {
      console.log('📞 Starting call to:', targetUserId);
      await loadSimplePeer();

      const peer = new SimplePeer({
        initiator:   true,
        trickle:     true,
        stream:      localStreamRef.current,
        channelName: CHANNEL_NAME,
      });

      wirePeer(peer, 'initiator');

      peer.on('signal', (data) => {
        console.log('📤 Sending offer to:', targetUserId);
        socketRef.current.emit('call-user', {
          to:    targetUserId,
          from:  currentUserId,
          offer: data,
        });
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('startCall failed:', err);
      setConnectionStatus('error');
      resetCallState();
    }
  }, [targetUserId, currentUserId, initializeCall, resetCallState, wirePeer]);

  // ── End call ─────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    console.log('Ending call');
    resetCallState();
    setRemoteStream(null);
    setConnectionStatus('disconnected');
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    if (onCallEnd) onCallEnd();
  }, [resetCallState, onCallEnd]);

  // ── Register incoming-message handler (called by VideoCallModal) ─────────
  const setOnMessage = useCallback((fn) => {
    onMessageRef.current = fn;
  }, []);

  // ── Send a chat message ──────────────────────────────────────────────────
  const sendChatMessage = useCallback((text) => {
    const ch = dataChannelRef.current;
    if (!ch || ch.readyState !== 'open') {
      console.warn('Cannot send — channel not open. State:', ch?.readyState);
      return false;
    }
    ch.send(JSON.stringify({ type: 'chat', message: text, sender: 'me' }));
    return true;
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      resetCallState();
      if (socketRef.current) socketRef.current.disconnect();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    localStream,
    remoteStream,
    connectionStatus,
    dataChannelReady,   // React state — triggers re-render when channel opens/closes
    dataChannelRef,     // Stable ref — VideoCallModal reads this directly
    initializeCall,
    startCall,
    endCall,
    setOnMessage,       // Register incoming-message callback
    sendChatMessage,    // Send helper — always uses current channel
    getPeer: () => peerRef.current,
  };
};
