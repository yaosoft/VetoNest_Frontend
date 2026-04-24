// src/components/VideoCallModal.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

const VideoCallModal = ({
  localStream,
  remoteStream,
  connectionStatus,
  onEndCall,
  vetName,
  ownerName = '',
  isInitiator = true,
  getAContent,
  dataChannelReady,
  sendChatMessage,
  setOnMessage,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Register incoming message handler
  useEffect(() => {
    if (!setOnMessage) return;
    setOnMessage((rawData) => {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.type === 'chat') {
          setMessages(prev => [...prev, {
            text: parsed.message,
            sender: 'them',
            timestamp: new Date(),
          }]);
        }
      } catch (e) {
        console.error('Error parsing chat message:', e);
      }
    });
    return () => { if (setOnMessage) setOnMessage(null); };
  }, [setOnMessage]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Attach video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  const handleSend = useCallback(() => {
    const text = inputMessage.trim();
    if (!text) return;
    const ok = sendChatMessage(text);
    if (ok) {
      setMessages(prev => [...prev, { text, sender: 'me', timestamp: new Date() }]);
      setInputMessage('');
    }
  }, [inputMessage, sendChatMessage]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const t = (key, fallback) =>
    (getAContent && typeof getAContent === 'function' ? getAContent(key) : null) || fallback;

  const remoteLabel = isInitiator
    ? (vetName ? `avec Dr. ${vetName}` : '')
    : (ownerName ? `avec ${ownerName}` : '');

  const statusBg =
    connectionStatus === 'connected'  ? '#52c41a' :
    connectionStatus === 'connecting' ? '#1890ff' : '#faad14';

  const statusLabel =
    connectionStatus === 'connected'  ? t('cmp_vetonest.com_Connected_Txt', 'Connecté')      :
    connectionStatus === 'connecting' ? t('cmp_vetonest.com_Connecting_Txt', 'Connexion...')  :
    connectionStatus === 'calling'    ? t('cmp_vetonest.com_Calling_Txt', 'Appel en cours...') :
    connectionStatus === 'ringing'    ? t('cmp_vetonest.com_Ringing_Txt', 'Sonnerie...')   :
    connectionStatus;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            {t('cmp_vetonest.com_VideoConsultation_Title', 'Consultation vidéo')}
            {remoteLabel && (
              <span style={{ fontSize: '13px', marginLeft: '10px', color: '#aaa' }}>
                {remoteLabel}
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowChat(v => !v)}
            style={{
              background: showChat ? '#1890ff' : 'rgba(255,255,255,0.12)',
              border: 'none', color: 'white',
              padding: '6px 14px', borderRadius: '20px',
              cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            💬 {showChat ? t('cmp_vetonest.com_HideChat_Btn', 'Masquer le chat') : t('cmp_vetonest.com_ShowChat_Btn', 'Afficher le chat')}
            {!dataChannelReady && <span style={{ fontSize: '10px', color: '#faad14' }}>(connecting...)</span>}
          </button>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: '20px',
          backgroundColor: statusBg, fontSize: '12px',
        }}>
          {statusLabel}
        </span>
        <button onClick={onEndCall} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer',
        }}>✕</button>
      </div>

      {/* Main body: video + chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
        {/* Video area */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          position: 'relative',
          minHeight: isMobile ? '60vh' : 'auto',
        }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 'calc(100vh - 150px)',
              backgroundColor: '#222',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: isMobile ? '120px' : '160px',
              height: isMobile ? '90px' : '120px',
              borderRadius: '8px',
              border: '2px solid white',
              backgroundColor: '#333',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Chat panel – conditionally shown, full‑width on mobile */}
        {showChat && (
          <div style={{
            width: isMobile ? '100%' : '320px',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: isMobile ? 'none' : '1px solid #444',
            maxHeight: isMobile ? '40vh' : '100%',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #444',
              backgroundColor: '#333',
              color: 'white',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                💬 {t('cmp_vetonest.com_Chat_Title', 'Chat')}
              </span>
              <span style={{ fontSize: '11px', color: dataChannelReady ? '#52c41a' : '#faad14', marginLeft: '8px' }}>
                {dataChannelReady ? '✅ Connecté' : '⏳ Connexion...'}
              </span>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', padding: '40px 16px' }}>
                  {dataChannelReady
                    ? t('cmp_vetonest.com_NoMessages_Txt', 'Aucun message. Commencez la conversation.')
                    : t('cmp_vetonest.com_ConnectingChat_Txt', 'Connexion au chat...')}
                </div>
              ) : messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: msg.sender === 'me' ? '#1890ff' : '#3a3a3a',
                    color: 'white',
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '10px', color: '#555', marginTop: '3px' }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #444',
              display: 'flex',
              gap: '8px',
              backgroundColor: '#333',
            }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!dataChannelReady}
                placeholder={dataChannelReady
                  ? t('cmp_vetonest.com_TypeMessage_Placeholder', 'Écrire un message...')
                  : t('cmp_vetonest.com_WaitingForConnection_Txt', 'En attente de connexion...')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '20px',
                  border: '1px solid #555',
                  backgroundColor: '#2a2a2a',
                  color: 'white',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!dataChannelReady || !inputMessage.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: (dataChannelReady && inputMessage.trim()) ? '#1890ff' : '#555',
                  color: 'white',
                  cursor: (dataChannelReady && inputMessage.trim()) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                {t('cmp_vetonest.com_Send_Btn', 'Envoyer')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {!showChat && !isMobile && (
          <button onClick={() => setShowChat(true)} style={{
            padding: '12px 24px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            💬 {t('cmp_vetonest.com_OpenChat_Btn', 'Ouvrir le chat')}
            {!dataChannelReady && <span style={{ fontSize: '10px', color: '#faad14' }}>(connecting...)</span>}
          </button>
        )}
        <button onClick={onEndCall} style={{
          padding: '12px 24px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          cursor: 'pointer',
        }}>
          {t('cmp_vetonest.com_EndCall_Btn', 'Raccrocher')}
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;