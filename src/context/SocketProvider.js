// src/context/SocketProvider.js
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AuthContext } from './AuthProvider';
import { SiteContext } from './site';
import { message } from 'antd';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, profileTypeId } = useContext(AuthContext);
  const { getAContent } = useContext(SiteContext);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const socketRef = useRef(null);               // pet owner socket
  const vetSocketRef = useRef(null);            // vet socket
  const vetListenersAttachedRef = useRef(false);
  const refetchCallbacks = useRef(new Set());
  const triggerRefetchTimerRef = useRef(null);

  // Stable callback refs — updated every render so effects never need
  // callbacks in their dependency arrays (prevents socket teardown on re-render)
  const triggerRefetchRef = useRef(null);
  const notifyVetCallingRef = useRef(null);
  const closeCallNotificationRef = useRef(null);
  const notifyNewConsultationRequestRef = useRef(null);

  // ── State ────────────────────────────────────────────────────────────────────
  const [vetCallReady, setVetCallReady] = useState(() => {
    const stored = sessionStorage.getItem('vetonest_incoming_call');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return {}; }
    }
    return {};
  });
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const activeNotificationsRef = useRef({});

  // ── Helper function to format vet name with title (plain text for notifications) ──
  const getVetNameWithTitle = useCallback((vet) => {
    if (!vet) return '';
    
    // If vet is an object with vetTitle property
    let titleCode = '';
    if (vet.vetTitle?.tagRefCode) {
      titleCode = getAContent(vet.vetTitle.tagRefCode);
    } else if (vet.vetTitle?.code) {
      titleCode = vet.vetTitle.code;
    } else if (vet.titleCode) {
      // Handle case where title code is passed directly
      titleCode = getAContent(vet.titleCode) || vet.titleCode;
    }
    
    const title = titleCode ? `${titleCode} ` : '';
    
    // Get vet name
    let fullName = '';
    if (vet.prenom && vet.nom) {
      fullName = `${vet.prenom} ${vet.nom}`;
    } else if (vet.name) {
      fullName = vet.name;
    } else if (typeof vet === 'string') {
      // If vet is just a string, return it as is
      return vet;
    }
    
    return `${title}${fullName}`.trim();
  }, [getAContent]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const t = useCallback((key, fallback) => {
    return (getAContent && typeof getAContent === 'function' ? getAContent(key) : null) || fallback;
  }, [getAContent]);

  const closeCallNotification = useCallback((consultationId) => {
    const key = String(consultationId);
    if (activeNotificationsRef.current[key]) {
      try { activeNotificationsRef.current[key].close(); } catch (_) {}
      delete activeNotificationsRef.current[key];
    }
  }, []);

  // ── Refetch registry ─────────────────────────────────────────────────────────
  const registerRefetchCallback = useCallback((callback) => {
    refetchCallbacks.current.add(callback);
    return () => refetchCallbacks.current.delete(callback);
  }, []);

  // Debounced: collapses bursts of socket events into a single fetch call
  const triggerRefetch = useCallback(() => {
    if (triggerRefetchTimerRef.current) clearTimeout(triggerRefetchTimerRef.current);
    triggerRefetchTimerRef.current = setTimeout(() => {
      refetchCallbacks.current.forEach(callback => {
        try { callback(); } catch (e) { console.error('Refetch callback error:', e); }
      });
    }, 300);
  }, []);

  // ── Keep stable refs current on every render ─────────────────────────────────
  // (must be assigned before the useEffects that use them)
  triggerRefetchRef.current = triggerRefetch;
  closeCallNotificationRef.current = closeCallNotification;

  // ── Persist vetCallReady to sessionStorage ───────────────────────────────────
  useEffect(() => {
    const activeCalls = Object.entries(vetCallReady).filter(([_, active]) => active === true);
    if (activeCalls.length > 0) {
      sessionStorage.setItem('vetonest_incoming_call', JSON.stringify(vetCallReady));
    } else {
      sessionStorage.removeItem('vetonest_incoming_call');
    }
  }, [vetCallReady]);

  // ── Pet owner: incoming call notification ────────────────────────────────────
  const notifyVetCalling = useCallback((vetName, consultationId) => {
    // Format vet name with title if it's an object
    const formattedVetName = typeof vetName === 'object' 
      ? getVetNameWithTitle(vetName) 
      : vetName;
    
    const title = t('cmp_vetonest.com_IncomingCallFrom_Vet', `Appel entrant de ${formattedVetName}`);
    const body = t('cmp_vetonest.com_ClickToJoinNotification_Body', 'Cliquez pour rejoindre la consultation vidéo.');
    const joinLinkText = t('cmp_vetonest.com_JoinNow_Btn', 'Rejoindre');
    const callStartedMessage = t('cmp_vetonest.com_VetStartedCall_Msg', 'souhaite démarrer la consultation. Rejoignez la vidéo.');

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://vetonest.com/img/logo01.png',
          tag: `vet-call-${consultationId}`,
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          window.location.href = '/consultation/list';
          notif.close();
        };
        activeNotificationsRef.current[String(consultationId)] = notif;
      } catch (err) { console.warn(err); }
    }

    message.info({
      content: (
        <span>
          📞 <strong>{formattedVetName}</strong> {callStartedMessage}{' '}
          <a href="/consultation/list">{joinLinkText}</a>
        </span>
      ),
      duration: 15,
    });
  }, [t, getVetNameWithTitle]);

  // ── Vet: new consultation request notification ───────────────────────────────
  const notifyNewConsultationRequest = useCallback((consultationId) => {
    const title = t('cmp_vetonest.com_NewConsultationRequest_Title', 'Nouvelle demande de consultation');
    const body = t('cmp_vetonest.com_NewConsultationRequest_Body', 'Un propriétaire a soumis une nouvelle demande. Cliquez pour consulter.');
    const viewText = t('cmp_vetonest.com_View_Btn', 'Voir');

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://vetonest.com/img/logo01.png',
          tag: `new-consultation-${consultationId}`,
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          window.location.href = '/consultation/list';
          notif.close();
        };
      } catch (err) { console.warn(err); }
    }

    message.info({
      content: (
        <span>
          🐾 <strong>{title}</strong> —{' '}
          <a href="/consultation/list">{viewText}</a>
        </span>
      ),
      duration: 15,
    });
  }, [t]);

  // Keep notification refs current
  notifyVetCallingRef.current = notifyVetCalling;
  notifyNewConsultationRequestRef.current = notifyNewConsultationRequest;

  // ── PET OWNER SOCKET ─────────────────────────────────────────────────────────
  // Deps: only user?.userId and profileTypeId — callbacks accessed via refs
  // so this effect never tears down the socket due to a callback re-creation.
  useEffect(() => {
    if (!user?.userId || profileTypeId !== 1) return;

    const url = process.env.REACT_APP_SIGNALING_URL || 'https://vetonest.com';
    const socket = io(url, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const doRegister = () => {
      socket.emit('register', { userId: String(user.userId) });
    };

    const handleVetCallStarted = (data) => {
      let consultationId = data.consultationId || data.consultation_id || data.id;
      let vetName = data.vetName || data.vet_name || t('cmp_vetonest.com_Veterinarian_Default', 'Veterinarian');
      
      // If vetName is an object with vetTitle, format it
      if (typeof vetName === 'object' && vetName !== null) {
        vetName = getVetNameWithTitle(vetName);
      }
      
      if (!consultationId) return;
      const idStr = String(consultationId);
      setVetCallReady(prev => ({ ...prev, [idStr]: true }));
      notifyVetCallingRef.current?.(vetName, idStr);
    };

    const handleVetCallEnded = ({ consultationId }) => {
      if (consultationId) {
        setVetCallReady(prev => ({ ...prev, [String(consultationId)]: false }));
        closeCallNotificationRef.current?.(String(consultationId));
      } else {
        setVetCallReady({});
        Object.keys(activeNotificationsRef.current).forEach(k => closeCallNotificationRef.current?.(k));
      }
    };

    const handleCallMissed = ({ consultationId }) => {
      if (consultationId) {
        setVetCallReady(prev => ({ ...prev, [String(consultationId)]: false }));
        closeCallNotificationRef.current?.(String(consultationId));
      } else {
        setVetCallReady({});
        Object.keys(activeNotificationsRef.current).forEach(k => closeCallNotificationRef.current?.(k));
      }
    };

    const handleCallEnded = () => {
      setVetCallReady({});
      Object.keys(activeNotificationsRef.current).forEach(k => closeCallNotificationRef.current?.(k));
    };

    const handleConsultationStatusUpdate = (data) => {
      console.log('🔄 consultation-status-updated received:', data);
      triggerRefetchRef.current?.();
    };

    socket.on('connect', doRegister);
    socket.on('vet-call-started', handleVetCallStarted);
    socket.on('vet-call-ended', handleVetCallEnded);
    socket.on('call-missed', handleCallMissed);
    socket.on('call-ended', handleCallEnded);
    socket.on('consultation-status-updated', handleConsultationStatusUpdate);

    if (socket.connected) doRegister();

    return () => {
      socket.off('connect', doRegister);
      socket.off('vet-call-started', handleVetCallStarted);
      socket.off('vet-call-ended', handleVetCallEnded);
      socket.off('call-missed', handleCallMissed);
      socket.off('call-ended', handleCallEnded);
      socket.off('consultation-status-updated', handleConsultationStatusUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.userId, profileTypeId, t, getVetNameWithTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── VET SOCKET ───────────────────────────────────────────────────────────────
  // Same pattern: callbacks via refs, deps minimal.
  useEffect(() => {
    if (!user?.userId || profileTypeId !== 2) return;

    const url = process.env.REACT_APP_SIGNALING_URL || 'https://vetonest.com';
    const socket = io(url, { transports: ['websocket', 'polling'] });
    vetSocketRef.current = socket;
    vetListenersAttachedRef.current = false;

    const doRegister = () => {
      socket.emit('register', { userId: String(user.userId) });
    };

    socket.on('connect', () => {
      console.log('✅ Vet socket connected:', socket.id);
      doRegister();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Vet socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Vet socket connect_error:', err.message);
    });

    socket.on('users-online', (users) => {
      setOnlineUsers(new Set(users.map(String)));
    });

    socket.on('call-ended', () => {
      message.info(t('cmp_vetonest.com_CallEnded_Msg', 'The call has ended.'));
    });

    socket.on('new-consultation-request', ({ consultationId }) => {
      console.log('🆕 New consultation request received:', consultationId);
      notifyNewConsultationRequestRef.current?.(consultationId);
      triggerRefetchRef.current?.();
    });

    if (socket.connected) doRegister();

    return () => {
      socket.disconnect();
      vetSocketRef.current = null;
      vetListenersAttachedRef.current = false;
    };
  }, [user?.userId, profileTypeId, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Request notification permission ─────────────────────────────────────────
  useEffect(() => {
    if (user && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

  // ── Vet emit helpers ─────────────────────────────────────────────────────────
  const emitConsultationStatus = useCallback((consultationId, newStatusId, petOwnerUserId) => {
    const socket = vetSocketRef.current;
    if (!socket) { console.error('❌ No vet socket instance'); return; }

    const payload = {
      to: String(petOwnerUserId),
      consultationId,
      newStatusId,
      petOwnerUserId: String(petOwnerUserId),
    };

    if (socket.connected) {
      socket.emit('consultation-status-updated', payload);
    } else {
      socket.once('connect', () => socket.emit('consultation-status-updated', payload));
    }
  }, []);

  const emitCallRequest = useCallback((petOwnerId, vetName, consultationId, callerUserId) => {
    if (!petOwnerId) return;
    const socket = vetSocketRef.current;
    if (!socket || !socket.connected) { message.warning('Connection lost'); return; }
    
    // Format vet name with title if it's an object
    const formattedVetName = typeof vetName === 'object' 
      ? getVetNameWithTitle(vetName) 
      : vetName;
    
    setTimeout(() => {
      socket.emit('vet-call-started', {
        to: String(petOwnerId),
        from: String(callerUserId),
        vetName: formattedVetName,
        consultationId,
      });
    }, 700);
  }, [getVetNameWithTitle]);

  // ── Pet owner emit helper ────────────────────────────────────────────────────
  const emitNewConsultationRequest = useCallback((vetUserId, consultationId) => {
    const socket = socketRef.current;
    if (!socket) return;

    const payload = { to: String(vetUserId), consultationId };

    if (socket.connected) {
      socket.emit('new-consultation-request', payload);
    } else {
      socket.once('connect', () => socket.emit('new-consultation-request', payload));
    }
  }, []);

  // ── Context value ────────────────────────────────────────────────────────────
  const value = {
    // Refs (still needed by VideoConsultationButton)
    socketRef,
    vetSocketRef,
    vetListenersAttachedRef,
    // State
    vetCallReady,
    onlineUsers,
    // Pet owner
    closeCallNotification,
    registerRefetchCallback,
    emitNewConsultationRequest,
    // Vet
    emitConsultationStatus,
    emitCallRequest,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};