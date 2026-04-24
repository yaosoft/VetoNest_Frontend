import React, { useState, useEffect, useContext, useRef } from "react";
import { Input, Button, Tag, Spin, Empty, Rate, Drawer, message, Modal, Avatar, Tooltip, Dropdown } from "antd";
import { SearchOutlined, PlusOutlined, StarOutlined, UserOutlined, DeleteOutlined, FlagOutlined, MoreOutlined, VideoCameraOutlined, CalendarOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";
import VideoConsultationButton from "../VideoConsultationButton";
import io from "socket.io-client";

const { TextArea } = Input;

const statusColor = (statusText) => {
  const s = statusText.toLowerCase();
  if (s.includes("pending")) return "blue";
  if (s.includes("accepted")) return "green";
  if (s.includes("in progress")) return "orange";
  if (s.includes("cancelled")) return "red";
  if (s.includes("completed")) return "purple";
  if (s.includes("expired")) return "volcano";
  return "default";
};

const STATUS_TAG = {
  1: 'cmp_vetonest.com_StatusPending_Txt',
  2: 'cmp_vetonest.com_StatusAccepted_Txt',
  3: 'cmp_vetonest.com_StatusInProgress_Txt',
  4: 'cmp_vetonest.com_StatusFinished_Txt',
  5: 'cmp_vetonest.com_StatusCancelled_Txt',
};
const TYPE_TAG = {
  1: 'cmp_vetonest.com_Online_Txt',
  2: 'cmp_vetonest.com_AtHome_Txt',
  3: 'cmp_vetonest.com_AtClinic_Txt',
};

const formatDateTime = (dateTimeData, atLabel, locale = "en-GB") => {
  if (!dateTimeData) return "—";
  
  let date;
  if (typeof dateTimeData === 'object' && dateTimeData.date) {
    date = new Date(dateTimeData.date);
  } else if (typeof dateTimeData === 'string') {
    date = new Date(dateTimeData.replace(" ", "T"));
  } else {
    date = new Date(dateTimeData);
  }
  
  if (isNaN(date.getTime())) return "—";
  
  const formattedDate = date.toLocaleDateString(locale, { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
  const time = date.toLocaleTimeString(locale, { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
  return `${formattedDate} ${atLabel} ${time}`;
};

// ── Time-based status functions ─────────────────────────────────────

const isReadyToJoin = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const now = dayjs();
  const minutesUntil = startDate.diff(now, 'minute');
  return minutesUntil <= 5 && minutesUntil >= 0;
};

const isInProgress = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const now = dayjs();
  const minutesSinceStart = now.diff(startDate, 'minute');
  return minutesSinceStart >= 0;
};

const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 1) return false;
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const now = dayjs();
  const minutesSinceStart = now.diff(startDate, 'minute');
  return minutesSinceStart > 60;
};

const isCompleted = (consultation) => {
  return consultation.consultationStatus?.id === 4;
};

const isCancelled = (consultation) => {
  return consultation.consultationStatus?.id === 5;
};

const getStatusDisplay = (consultation) => {
  const statusId = consultation.consultationStatus?.id;
  const status = consultation.consultationStatus?.nom?.toLowerCase() ?? "";
  
  if (isExpired(consultation)) {
    return { text: 'Expired', color: 'volcano', key: 'Expired' };
  }
  if (isCompleted(consultation)) {
    return { text: 'Completed', color: 'purple', key: 'Completed' };
  }
  if (isCancelled(consultation)) {
    return { text: 'Cancelled', color: 'red', key: 'Cancelled' };
  }
  if (isInProgress(consultation)) {
    return { text: 'In Progress', color: 'orange', key: 'InProgress' };
  }
  if (isReadyToJoin(consultation)) {
    return { text: 'Ready to Join', color: 'green', key: 'ReadyToJoin' };
  }
  if (statusId === 1 || status === "pending") {
    return { text: 'Pending', color: 'blue', key: 'Pending' };
  }
  if (statusId === 2 || status === "accepted") {
    return { text: 'Accepted', color: 'green', key: 'Accepted' };
  }
  return { text: status, color: 'default', key: status };
};

const shouldShowVideoButton = (consultation) => {
  if (consultation.consultationType?.id !== 1) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  return true;
};

const isVideoReady = (consultation) => {
  if (!shouldShowVideoButton(consultation)) return false;
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const now = dayjs();
  const minutesUntil = startDate.diff(now, 'minute');
  return minutesUntil <= 5;
};

const canCancel = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId === 4 || statusId === 5) return false;
  if (isExpired(consultation)) return false;
  if (isInProgress(consultation)) return false;
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const diff = startDate.diff(dayjs(), "minute");
  return diff > 60;
};

const isAboutToStart = (startingDatetime) => {
  if (!startingDatetime) return false;
  const start = dayjs(startingDatetime);
  const now = dayjs();
  const minutesUntil = start.diff(now, 'minute');
  return minutesUntil > 0 && minutesUntil <= 5;
};

const ConsultationListPetOwner = () => {
  const { profileId, profileTypeId, user } = useContext(AuthContext);
  const { 
    base_api_url, 
    allConsultationTypes, 
    allConsultationStatuses, 
    consultationCancel, 
    getPetOwnerConsultationList, 
    base_url, 
    getAContent, 
    siteLocale, 
    saveRating, 
    saveComment,
    deleteComment,
    profileGet
  } = useContext(SiteContext);
  
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');
  const [userProfile, setUserProfile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [vetCallReady, setVetCallReady] = useState({});
  const socketRef = useRef(null);

  const [filterVet, setFilterVet] = useState("");
  // Removed filterStatus and filterType states
  
  // ── Request notification permission on mount ──────────────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Socket connection to track online vets and listen for call events ──────
  useEffect(() => {
    if (!user?.userId) return;

    const url = process.env.REACT_APP_SIGNALING_URL || 'http://localhost:5000';
    const socket = io(url, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const notifyVetCalling = (vetName, vetUserId) => {
      const body = 'Cliquez pour rejoindre la consultation vidéo.';
      const title = `Appel entrant de Dr. ${vetName}`;

      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(title, {
            body,
            icon: '/logo192.png',
            tag: `vet-call-${vetUserId}`,
            requireInteraction: true,
          });
          notif.onclick = () => { window.focus(); notif.close(); };
        } catch (err) {
          console.warn('Browser notification failed:', err);
        }
      }

      message.info({
        content: (
          <span>
            📞 <strong>Dr. {vetName}</strong>{' '}
            souhaite démarrer la consultation. Rejoignez la vidéo.
          </span>
        ),
        duration: 12,
        key: `vet-call-toast-${vetUserId}`,
      });
    };

    const handleConnect = () => {
      console.log('Pet owner presence socket connected, registering userId:', user.userId);
      socket.emit('register', { userId: String(user.userId) });
    };

    const handleUsersOnline = (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users.map(String));
    };

    const handleVetCallStarted = ({ from, vetName }) => {
      console.log(`📞 vet-call-started from vet ${vetName} (${from})`);
      setVetCallReady(prev => ({ ...prev, [String(from)]: true }));
      notifyVetCalling(vetName, from);
    };

    const handleVetCallEnded = ({ from }) => {
      console.log(`📴 vet-call-ended from vet ${from}`);
      setVetCallReady(prev => ({ ...prev, [String(from)]: false }));
    };

    socket.on('connect',          handleConnect);
    socket.on('users-online',     handleUsersOnline);
    socket.on('vet-call-started', handleVetCallStarted);
    socket.on('vet-call-ended',   handleVetCallEnded);
    socket.on('call-ended', ({ from }) => {
      message.info('The other party has ended the call.');
    });

    if (socket.connected) {
      socket.emit('register', { userId: String(user.userId) });
    }

    return () => {
      socket.off('connect',          handleConnect);
      socket.off('users-online',     handleUsersOnline);
      socket.off('vet-call-started', handleVetCallStarted);
      socket.off('vet-call-ended',   handleVetCallEnded);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.userId]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (profileId && profileTypeId) {
        const profile = await profileGet(profileId, profileTypeId);
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, [profileId, profileTypeId]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const rep = await getPetOwnerConsultationList(profileId);
      if (rep?.success && Array.isArray(rep.consultations)) {
        setConsultations(rep.consultations);
      }
    } catch (e) {
      console.error(e);
      message.error(getAContent('cmp_vetonest.com_ErrorLoading_Txt') || 'Error loading consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        message.success(getAContent('cmp_vetonest.com_ConsultationCancelled_Txt') || 'Consultation cancelled');
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        message.error((rep?.message ?? getAContent('cmp_vetonest.com_CancelFailed_Txt')) || 'Failed to cancel consultation');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      message.error(getAContent('cmp_vetonest.com_CancelFailed_Txt') || 'Failed to cancel consultation');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!deleteComment || typeof deleteComment !== 'function') {
      console.error('deleteComment is not available in context');
      message.error('Delete function not available. Please refresh the page.');
      return;
    }
    Modal.confirm({
      title: getAContent?.('cmp_vetonest.com_DeleteComment') || 'Delete Comment',
      content: getAContent?.('cmp_vetonest.com_ConfirmDeleteComment') || 'Are you sure you want to delete this comment?',
      okText: getAContent?.('cmp_vetonest.com_Delete_Btn') || 'Delete',
      cancelText: getAContent?.('cmp_vetonest.com_Cancel_Btn') || 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const result = await deleteComment(commentId, profileId);
          if (result && result.success !== false) {
            message.success(getAContent?.('cmp_vetonest.com_CommentDeleted') || 'Comment deleted');
            await fetchConsultations();
          } else {
            throw new Error(result?.error || 'Failed to delete comment');
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
          message.error(getAContent?.('cmp_vetonest.com_ErrorDeletingComment') || 'Error deleting comment');
        }
      }
    });
  };

  useEffect(() => {
    if (profileId) fetchConsultations();
  }, [profileId]);

  // Filter only by vet name (and optionally date range if implemented, but date range is not used in UI)
  const filtered = consultations.filter((c) => {
    if (filterVet) {
      const name = `${c.profileVeto?.prenom ?? ""} ${c.profileVeto?.nom ?? ""}`.toLowerCase();
      if (!name.includes(filterVet.toLowerCase())) return false;
    }
    // No status/type filters anymore
    return true;
  });

  const [rateDrawerOpen, setRateDrawerOpen] = useState(false);
  const [ratingConsultation, setRatingConsultation] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [existingComment, setExistingComment] = useState(null);
  const [loadingExistingData, setLoadingExistingData] = useState(false);

  const fetchExistingRatingAndComment = async (consultation) => {
    setLoadingExistingData(true);
    try {
        if (consultation.rating && consultation.rating.evaluation) {
            setExistingRating(consultation.rating);
            setRatingValue(consultation.rating.evaluation);
        } else {
            setExistingRating(null);
            setRatingValue(0);
        }
        if (consultation.comment && consultation.comment.commentText) {
            setExistingComment(consultation.comment);
            setCommentValue(consultation.comment.commentText);
        } else {
            setExistingComment(null);
            setCommentValue('');
        }
    } catch (error) {
        console.error('Error fetching existing data:', error);
        setRatingValue(0);
        setCommentValue('');
    } finally {
        setLoadingExistingData(false);
    }
  };

  const openRateDrawer = (c, e) => {
    e.stopPropagation();
    setRatingConsultation(c);
    fetchExistingRatingAndComment(c);
    setRateDrawerOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingConsultation) return;
    setSubmitting(true);
    try {
        const ownerName = userProfile ? `${userProfile.prenom || ''} ${userProfile.nom || ''}`.trim() : 'Client';
        const petName = ratingConsultation.carnetAnimal?.nom || '';
        const currentLocale = siteLocale || 'en-GB';
        const languageCode = currentLocale.split('-')[0];
        const vetId = ratingConsultation.profileVeto?.id;
        const vetName = `${ratingConsultation.profileVeto?.prenom || ''} ${ratingConsultation.profileVeto?.nom || ''}`.trim();
        
        if (ratingValue > 0) {
            await saveRating({
                ratingId: existingRating?.id,
                consultationId: ratingConsultation.id,
                profileVetoId: vetId,
                rating: ratingValue,
                profileId: profileId,
                locale: languageCode,
                vetUserId: ratingConsultation.profileVeto?.userId,
                vetEmail: ratingConsultation.profileVeto?.userEmail,
                vetName: vetName,
                ownerName: ownerName,
                petName: petName,
                vetId: vetId
            });
        }
        if (commentValue && commentValue.trim()) {
            await saveComment({
                commentId: existingComment?.id,
                consultationId: ratingConsultation.id,
                comment: commentValue.trim(),
                profileId: profileId,
                locale: languageCode,
                vetUserId: ratingConsultation.profileVeto?.userId,
                vetEmail: ratingConsultation.profileVeto?.userEmail,
                vetName: vetName,
                ownerName: ownerName,
                petName: petName,
                vetId: vetId
            });
        }
        await fetchConsultations();
        setRateDrawerOpen(false);
        message.success(getAContent('cmp_vetonest.com_RatingSaved_Txt') || 'Rating and comment saved!');
    } catch (error) {
        console.error('Error submitting rating:', error);
        message.error(getAContent('cmp_vetonest.com_ErrorSaving_Txt') || 'Error saving rating');
    } finally {
        setSubmitting(false);
    }
  };
  
  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  const CommentDisplay = ({ comment }) => {
    const [showActions, setShowActions] = useState(false);
    if (!comment) return null;
    return (
      <div 
        style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: 8, borderLeft: '3px solid #faad14' }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <UserOutlined style={{ color: '#888', fontSize: 12 }} />
              <span style={{ fontSize: 12, color: '#888' }}>
                {getAContent('cmp_vetonest.com_YourComment_Label') || 'Your comment'}:
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>"{comment.commentText}"</p>
            <div style={{ marginTop: 4, fontSize: 11, color: '#bbb' }}>
              {dayjs(comment.dateCreated?.date || comment.dateCreated).format('DD/MM/YYYY')}
            </div>
          </div>
          {showActions && (
            <Tooltip title={getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete comment'}>
              <Button 
                type="text" 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }}
                style={{ padding: '0 4px', height: 'auto' }}
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  return (
    <ConsultationLayout title={getAContent('cmp_vetonest.com_MyConsultations_Txt')}>
      {/* Filter bar: only vet name search */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={getAContent('cmp_vetonest.com_SearchByVetName_Placeholder') || "Search by vet name"}
          value={filterVet}
          onChange={(e) => setFilterVet(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        {/* Status and Type filters have been removed */}
        <div style={{ marginLeft: "auto" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/consultation/creation")}>
            {getAContent('cmp_vetonest.com_BookConsultation_Btn')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description={getAContent('cmp_vetonest.com_NoConsultationsFound_Txt')} style={{ marginTop: "60px" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((c) => {
            const showVideoButton = c.consultationType?.id === 1 && c.consultationStatus?.id === 2 && !isExpired(c);
            const videoReady = isVideoReady(c);
            const statusDisplay = getStatusDisplay(c);
            const isCompletedConsultation = isCompleted(c);
            const isPending = c.consultationStatus?.id === 1;
            const vetUserId = String(c.profileVeto?.userId);
            const isVetOnline = onlineUsers.includes(vetUserId);
            const isVetCallReady = !!vetCallReady[vetUserId];
            const aboutToStart = isAboutToStart(c.startingDatetime);

            const buttonDisabled = !isVetCallReady;
            const buttonTooltip = !isVetOnline
              ? (getAContent('cmp_vetonest.com_VetNotOnline_Tooltip') || 'Le vétérinaire n\'est pas encore en ligne')
              : !isVetCallReady
              ? (getAContent('cmp_vetonest.com_VetNotCalledYet_Tooltip') || 'Le vétérinaire n\'a pas encore lancé l\'appel')
              : '';

            return (
              <div
                key={c.id}
                onClick={() => openDrawer(c)}
                style={{
                  background: isVetCallReady ? '#f6ffed' : '#fff',
                  border: isVetCallReady ? '1px solid #b7eb8f' : isPending ? "1px solid #91caff" : "1px solid #f0f0f0",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s, background 0.3s, border 0.3s",
                  boxShadow: isVetCallReady ? '0 0 0 2px #d9f7be' : isPending ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = isVetCallReady ? '0 0 0 2px #d9f7be' : isPending ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)"}
              >
                {isVetCallReady && (
                  <div style={{
                    backgroundColor: '#f6ffed',
                    borderLeft: '4px solid #52c41a',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'pulse-green 1.5s ease-in-out infinite',
                  }}>
                    <span>📹</span>
                    <span>
                      {getAContent('cmp_vetonest.com_VetIsCallingBanner_Txt') ||
                        `Dr. ${c.profileVeto?.prenom} ${c.profileVeto?.nom} vous appelle — rejoignez maintenant !`}
                    </span>
                  </div>
                )}

                {aboutToStart && !isVetCallReady && (
                  <div style={{
                    backgroundColor: '#fff7e6',
                    borderLeft: '4px solid #faad14',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🔔</span>
                    <span>
                      {getAContent('cmp_vetonest.com_ConsultationStartsSoon_Txt', 'La consultation commence dans quelques minutes. Préparez-vous !')}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <img
                    src={c.carnetAnimal.picture ? base_url + 'uploads/files/pets/' + c.carnetAnimal.picture : photoDefaultSrc}
                    alt={c.carnetAnimal.nom}
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => { e.target.src = photoDefaultSrc; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px", display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {c.carnetAnimal?.nom}
                      <span style={{ fontWeight: 400, color: "#888", fontSize: "13px" }}>
                        {" "}{getAContent('cmp_vetonest.com_WithDr_Prefix')} {c.profileVeto?.prenom} {c.profileVeto?.nom}
                      </span>
                      {showVideoButton && (
                        <Tooltip title={
                          isVetCallReady ? (getAContent('cmp_vetonest.com_VetCalling_Tooltip') || 'Le vétérinaire vous appelle !') :
                          isVetOnline    ? (getAContent('cmp_vetonest.com_VetOnline_Txt')      || 'Vétérinaire en ligne') :
                                           (getAContent('cmp_vetonest.com_VetOffline_Txt')     || 'Vétérinaire hors ligne')
                        }>
                          <span style={{
                            display: 'inline-block',
                            width: '9px', height: '9px',
                            borderRadius: '50%',
                            backgroundColor: isVetCallReady ? '#52c41a' : isVetOnline ? '#52c41a' : '#d9d9d9',
                            boxShadow: isVetCallReady
                              ? '0 0 0 3px rgba(82,196,26,0.35)'
                              : isVetOnline
                              ? '0 0 0 2px #f6ffed'
                              : 'none',
                            animation: isVetCallReady ? 'pulse-green 1s ease-in-out infinite' : 'none',
                            flexShrink: 0,
                          }} />
                        </Tooltip>
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {formatDateTime(c.startingDatetime, getAContent('cmp_vetonest.com_At_Prefix'), siteLocale)}
                      {c.consultationType && (
                        <span style={{ marginLeft: 10, color: "#aaa" }}>· {getAContent(TYPE_TAG[c.consultationType.id]) || c.consultationType.nom}</span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <Tag color={statusDisplay.color}>
                      {getAContent(`cmp_vetonest.com_Status_${statusDisplay.key}_Txt`) || statusDisplay.text}
                    </Tag>
                    
                    {showVideoButton && (
                      <Tooltip title={buttonTooltip} placement="top">
                        <span style={{ display: 'inline-block' }}>
                         <VideoConsultationButton
                              currentUserId={user?.userId}
                              targetUserId={c.profileVeto?.userId}
                              vetName={`${c.profileVeto?.prenom || ""} ${c.profileVeto?.nom || ""}`}
                              ownerName={`${userProfile?.prenom || ""} ${userProfile?.nom || ""}`.trim()}
                              buttonText={isVetCallReady ? "Rejoindre l'appel" : "Consultation vidéo"}
                              getAContent={getAContent}
                              navigate={navigate}
                              isInitiator={true}
                              disabled={!isVetCallReady}
                              title={!isVetCallReady ? "Le vétérinaire n'a pas encore lancé l'appel" : ""}
                            />
                        </span>
                      </Tooltip>
                    )}
                    
                    {isCompletedConsultation && (
                      <Button
                        size="small"
                        icon={<StarOutlined />}
                        onClick={(e) => openRateDrawer(c, e)}
                        style={{ borderColor: "#faad14", color: "#faad14" }}
                      >
                        {c.rating || c.comment ? 'Modifier avis' : 'Noter'}
                      </Button>
                    )}
                  </div>
                </div>
                {c.comment && <CommentDisplay comment={c.comment} />}
              </div>
            );
          })}
        </div>
      )}

      <ConsultationDetailDrawer
        consultation={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extraActions={
          selected && canCancel(selected) ? (
            <Button danger loading={cancelling} onClick={handleCancel}>
              {getAContent('cmp_vetonest.com_CancelConsultation_Btn') || 'Annuler'}
            </Button>
          ) : null
        }
      />

      <Drawer
        title={
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {getAContent('cmp_vetonest.com_RateAndComment_Btn') || 'Noter et commenter'}
            </p>
            {ratingConsultation?.profileVeto && (
              <p style={{ margin: 0, fontSize: "13px", color: "#888", fontWeight: 400 }}>
                Dr {ratingConsultation.profileVeto.prenom} {ratingConsultation.profileVeto.nom}
              </p>
            )}
          </div>
        }
        placement="right"
        width={400}
        open={rateDrawerOpen}
        onClose={() => setRateDrawerOpen(false)}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button onClick={() => setRateDrawerOpen(false)}>
              {getAContent('cmp_vetonest.com_Pa8Rk2sYnB') || 'Annuler'}
            </Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={ratingValue === 0 && !commentValue.trim()}
              onClick={handleSubmitRating}
            >
              {getAContent('cmp_vetonest.com_Submit_Btn') || 'Envoyer'}
            </Button>
          </div>
        }
      >
        {loadingExistingData ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>Votre note</p>
              <Rate value={ratingValue} onChange={setRatingValue} style={{ fontSize: "28px" }} allowClear={false} />
              {ratingValue > 0 && (
                <p style={{ marginTop: "8px", color: "#888", fontSize: "12px" }}>
                  {ratingValue} étoile(s)
                </p>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>Votre commentaire</p>
              <textarea
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                rows={5}
                placeholder="Partagez votre expérience..."
                style={{
                  width: "100%", boxSizing: "border-box", padding: "10px",
                  borderRadius: "6px", border: "1px solid #d9d9d9",
                  fontSize: "14px", resize: "vertical",
                }}
              />
            </div>
          </>
        )}
      </Drawer>

      <style>{`
        @keyframes pulse-green {
          0%   { box-shadow: 0 0 0 0   rgba(82,196,26,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(82,196,26,0);    }
          100% { box-shadow: 0 0 0 0   rgba(82,196,26,0);    }
        }
      `}</style>
    </ConsultationLayout>
  );
};

export default ConsultationListPetOwner;