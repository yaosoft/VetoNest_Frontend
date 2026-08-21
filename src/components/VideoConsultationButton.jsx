// src/components/VideoConsultationButton.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoCallModal from './VideoCallModal';
import { useVideoConsultation } from '../hooks/useVideoConsultation';

const VideoConsultationButton = ({
  currentUserId,
  targetUserId,
  vetName,
  ownerName = '',
  buttonText = 'Video Consultation',
  className = '',
  getAContent,
  navigate,
  skipValidation = false,
  isInitiator = true,
  disabled = false,
  title = '',
  style = {},
  iconStyle = {},
  onBeforeCall,
  onAfterInit,
  onCallEnd,
  useProviderSocket = null,
  vetSocket = null,
  vetListenersAttached = null,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  // Combined handler: close modal + notify parent
  const handleCallEnd = useCallback(() => {
    setShowVideoModal(false);
    if (typeof onCallEnd === 'function') {
      onCallEnd();
    }
  }, [onCallEnd]);

  const {
    localStream,
    remoteStream,
    connectionStatus,
    dataChannelReady,
    initializeCall,
    startCall,
    endCall,
    setOnMessage,
    sendChatMessage,
  } = useVideoConsultation(
    currentUserId,
    targetUserId,
    handleCallEnd,
    isInitiator,
    undefined,              // consultationId
    useProviderSocket,      // null = auto-detect
    vetSocket,              // vet's own socket ref to avoid double-registration
    vetListenersAttached,   // shared listeners guard across all vet card buttons
  );

  const t = useCallback((key, fallback) =>
    (getAContent && typeof getAContent === 'function' ? getAContent(key) : null) || fallback,
  [getAContent]);

  // Pre‑initialize (camera + socket) when the component mounts
  useEffect(() => {
    if (!skipValidation || initializedRef.current) return;
    initializedRef.current = true;
    initializeCall().catch(err => console.error('Pre‑init failed:', err));
  }, [skipValidation, initializeCall]);

  const handleButtonClick = async () => {
    // Call the optional callback before anything else
    if (typeof onBeforeCall === 'function') {
      onBeforeCall();
    }

    // Do nothing if externally disabled
    if (disabled) return;

    setIsLoading(true);
    setValidationError(null);
    try {
      await initializeCall();

      // Fire AFTER the socket is registered — safe to emit vet-call-started now
      if (typeof onAfterInit === 'function') {
        onAfterInit();
      }

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
        disabled={isLoading || disabled}
        title={title}
        className={`btn btn-primary profileBtn ${className}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          opacity: (isLoading || disabled) ? 0.7 : 1,
          cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
          ...style,
        }}
      >
        {isLoading ? (
          <>
            <span style={{
              display: 'inline-block', width: '14px', height: '14px',
              border: '2px solid currentColor', borderTop: '2px solid transparent',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            {t('cmp_vetonest.com_Checking_Txt', 'Chargement...')}
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '15px', height: '15px', flexShrink: 0, ...iconStyle }}
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span style={{ marginLeft: '2px' }}>{buttonText}</span>
          </>
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