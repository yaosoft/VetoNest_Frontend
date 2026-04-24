// src/components/VideoConsultationButton.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoCallModal from './VideoCallModal';
import { useVideoConsultation } from '../hooks/useVideoConsultation';

const VideoConsultationButton = ({
  currentUserId,        // socket-registered userId of the person clicking
  targetUserId,         // userId to call (only used by initiator)
  vetName,
  ownerName = '',
  buttonText = 'Video Consultation',
  className = '',
  getAContent,
  navigate,
  skipValidation = false,
  isInitiator = true,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  const {
    localStream,
    remoteStream,
    connectionStatus,
    dataChannelReady,   // ← from hook
    initializeCall,
    startCall,
    endCall,
    setOnMessage,       // ← from hook
    sendChatMessage,    // ← from hook
  } = useVideoConsultation(
    currentUserId,
    targetUserId,
    () => setShowVideoModal(false),
    isInitiator,
  );

  const t = useCallback((key, fallback) =>
    (getAContent && typeof getAContent === 'function' ? getAContent(key) : null) || fallback,
  [getAContent]);

  // Pre-initialize (camera + socket registration) when the component mounts
  // so the vet is already registered before the owner starts calling.
  useEffect(() => {
    if (!skipValidation || initializedRef.current) return;
    initializedRef.current = true;
    initializeCall().catch(err => console.error('Pre-init failed:', err));
  }, [skipValidation, initializeCall]);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      // initializeCall is idempotent — safe to call again
      await initializeCall();
      if (isInitiator) {
        await startCall();
      } else {
        console.log('Vet ready — waiting for incoming call');
      }
      setShowVideoModal(true);
    } catch (err) {
      console.error('Error opening video call:', err);
      setValidationError(t(
        'cmp_vetonest.com_ErrorStartingVideo_Txt',
        'Impossible de démarrer la vidéo. Vérifiez vos permissions caméra/micro.',
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`btn btn-primary profileBtn ${className}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          opacity: isLoading ? 0.7 : 1,
          cursor:  isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? (
          <>
            <span style={{
              display: 'inline-block', width: '14px', height: '14px',
              border: '2px solid white', borderTop: '2px solid transparent',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            {t('cmp_vetonest.com_Checking_Txt', 'Chargement...')}
          </>
        ) : (
          <>🎥 {buttonText}</>
        )}
      </button>

      {validationError && (
        <div style={{ marginTop: '8px', color: '#ff4d4f', fontSize: '12px', maxWidth: '260px' }}>
          {validationError}
        </div>
      )}

      {showVideoModal && (
        <VideoCallModal
          localStream={localStream}
          remoteStream={remoteStream}
          connectionStatus={connectionStatus}
          onEndCall={endCall}
          vetName={vetName}
          ownerName={ownerName}
          isInitiator={isInitiator}
          getAContent={getAContent}
          dataChannelReady={dataChannelReady}
          sendChatMessage={sendChatMessage}
          setOnMessage={setOnMessage}
        />
      )}

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default VideoConsultationButton;
