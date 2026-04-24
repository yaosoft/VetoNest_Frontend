import React, { useState, useEffect, useContext } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Rate, Drawer, message, Modal, Avatar, Tooltip, Dropdown } from "antd";
import { SearchOutlined, CalendarOutlined, PlusOutlined, StarOutlined, UserOutlined, LikeOutlined, LikeFilled, DeleteOutlined, FlagOutlined, MoreOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";
import VideoConsultationButton from "../VideoConsultationButton";

const { RangePicker } = DatePicker;
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

// Check if consultation is within 5 minutes before start (video ready)
// ONLY for ACCEPTED consultations (status ID 2)
const isReadyToJoin = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only for ACCEPTED (2)
  if (statusId !== 2) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  
  const now = dayjs();
  const minutesUntil = startDate.diff(now, 'minute');
  
  // Available within 5 minutes before start
  return minutesUntil <= 5 && minutesUntil >= 0;
};

// Check if consultation is in progress (after start time)
// ONLY for ACCEPTED consultations (status ID 2)
const isInProgress = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only for ACCEPTED (2)
  if (statusId !== 2) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  
  const now = dayjs();
  const minutesSinceStart = now.diff(startDate, 'minute');
  
  // In progress from start time onward (vet must finish manually)
  return minutesSinceStart >= 0;
};

// Check if consultation has expired (more than 1 hour after start)
// ONLY for PENDING consultations (status ID 1)
const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only for PENDING (1) - NOT for accepted
  if (statusId !== 1) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  
  const now = dayjs();
  const minutesSinceStart = now.diff(startDate, 'minute');
  
  // Expired after 1 hour from start time
  return minutesSinceStart > 60;
};

// Check if consultation is completed (status 4)
const isCompleted = (consultation) => {
  return consultation.consultationStatus?.id === 4;
};

// Check if consultation is cancelled (status 5)
const isCancelled = (consultation) => {
  return consultation.consultationStatus?.id === 5;
};

// Get status display text and color
const getStatusDisplay = (consultation) => {
  const statusId = consultation.consultationStatus?.id;
  const status = consultation.consultationStatus?.nom?.toLowerCase() ?? "";
  
  // EXPIRED - only for pending consultations that passed the time window
  if (isExpired(consultation)) {
    return { text: 'Expired', color: 'volcano', key: 'Expired' };
  }
  
  // COMPLETED
  if (isCompleted(consultation)) {
    return { text: 'Completed', color: 'purple', key: 'Completed' };
  }
  
  // CANCELLED
  if (isCancelled(consultation)) {
    return { text: 'Cancelled', color: 'red', key: 'Cancelled' };
  }
  
  // IN PROGRESS - accepted consultations after start time
  if (isInProgress(consultation)) {
    return { text: 'In Progress', color: 'orange', key: 'InProgress' };
  }
  
  // READY TO JOIN - accepted consultations within 5 min before start
  if (isReadyToJoin(consultation)) {
    return { text: 'Ready to Join', color: 'green', key: 'ReadyToJoin' };
  }
  
  // PENDING (not expired)
  if (statusId === 1 || status === "pending") {
    return { text: 'Pending', color: 'blue', key: 'Pending' };
  }
  
  // ACCEPTED (default)
  if (statusId === 2 || status === "accepted") {
    return { text: 'Accepted', color: 'green', key: 'Accepted' };
  }
  
  return { text: status, color: 'default', key: status };
};

// Check if video button should be shown (only when vet has ACCEPTED)
const shouldShowVideoButton = (consultation) => {
  // Must be video consultation type (1 = Online/Video)
  if (consultation.consultationType?.id !== 1) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only show if ACCEPTED (2)
  if (statusId !== 2) return false;
  
  return true;
};

// Check if consultation is video ready (within time window)
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
  
  // Ready within 5 minutes before start and up to ... (vet must finish manually)
  return minutesUntil <= 5;
};

// Check if consultation can be cancelled (more than 1 hour before start)
const canCancel = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId === 4 || statusId === 5) return false; // Completed or Cancelled
  if (isExpired(consultation)) return false;
  if (isInProgress(consultation)) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  const diff = startDate.diff(dayjs(), "minute");
  return diff > 60; // Can cancel if more than 1 hour before start
};

const ConsultationListPetOwner = () => {
  const { profileId, profileTypeId } = useContext(AuthContext);
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
  
  const [filterVet, setFilterVet] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDates, setFilterDates] = useState(null);

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

  const fetchConsultations = async (statusId = null) => {
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

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!deleteComment || typeof deleteComment !== 'function') {
      console.error('deleteComment is not available in context');
      message.error('Delete function not available. Please refresh the page.');
      return;
    }
    
    Modal.confirm({
      title: getAContent && typeof getAContent === 'function' 
        ? (getAContent('cmp_vetonest.com_DeleteComment') || 'Delete Comment')
        : 'Delete Comment',
      content: getAContent && typeof getAContent === 'function'
        ? (getAContent('cmp_vetonest.com_ConfirmDeleteComment') || 'Are you sure you want to delete this comment?')
        : 'Are you sure you want to delete this comment?',
      okText: getAContent && typeof getAContent === 'function'
        ? (getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete')
        : 'Delete',
      cancelText: getAContent && typeof getAContent === 'function'
        ? (getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel')
        : 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const result = await deleteComment(commentId, profileId);
          if (result && result.success !== false) {
            const successMsg = getAContent && typeof getAContent === 'function'
              ? (getAContent('cmp_vetonest.com_CommentDeleted') || 'Comment deleted')
              : 'Comment deleted';
            message.success(successMsg);
            await fetchConsultations();
          } else {
            throw new Error(result?.error || 'Failed to delete comment');
          }
        } catch (error) {
          console.error('Error deleting comment:', error);
          const errorMsg = getAContent && typeof getAContent === 'function'
            ? (getAContent('cmp_vetonest.com_ErrorDeletingComment') || 'Error deleting comment')
            : 'Error deleting comment';
          message.error(errorMsg);
        }
      }
    });
  };

  useEffect(() => {
    if (profileId) fetchConsultations();
  }, [profileId]);

  const filtered = consultations.filter((c) => {
    if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
    if (filterType && c.consultationType?.id !== filterType) return false;
    if (filterVet) {
      const name = `${c.profileVeto?.prenom ?? ""} ${c.profileVeto?.nom ?? ""}`.toLowerCase();
      if (!name.includes(filterVet.toLowerCase())) return false;
    }
    if (filterDates?.[0] && filterDates?.[1]) {
      let startDate;
      if (typeof c.startingDatetime === 'object' && c.startingDatetime.date) {
        startDate = dayjs(c.startingDatetime.date);
      } else {
        startDate = dayjs(c.startingDatetime);
      }
      if (startDate.isBefore(filterDates[0], "day") || startDate.isAfter(filterDates[1], "day")) return false;
    }
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

  const CommentDisplay = ({ comment, consultationId }) => {
    const [showActions, setShowActions] = useState(false);
    
    if (!comment) return null;
    
    return (
      <div 
        style={{ 
          marginTop: 8, 
          padding: '8px 12px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: 8,
          borderLeft: '3px solid #faad14'
        }}
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
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              "{comment.commentText}"
            </p>
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteComment(comment.id);
                }}
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

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={getAContent('cmp_vetonest.com_SearchByVetName_Placeholder')}
          value={filterVet}
          onChange={(e) => setFilterVet(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder={getAContent('cmp_vetonest.com_AllStatuses_Filter')}
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationStatuses || []).map((s) => ({ value: s.id, label: s.nom }))}
        />
        <Select
          placeholder={getAContent('cmp_vetonest.com_AllTypes_Filter')}
          value={filterType}
          onChange={setFilterType}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationTypes || []).map((t) => ({ value: t.id, label: t.nom }))}
        />
        <div style={{ marginLeft: "auto" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/consultation/creation")}
          >
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
            // Determine if video button should be shown
            // Only show if:
            // 1. It's a video consultation (type id = 1)
            // 2. Status is ACCEPTED (2)
            // 3. Not expired
            const showVideoButton = c.consultationType?.id === 1 && 
                                    c.consultationStatus?.id === 2 &&
                                    !isExpired(c);
            const videoReady = isVideoReady(c);
            const statusDisplay = getStatusDisplay(c);
            const isCompletedConsultation = isCompleted(c);  // Only completed consultations can be rated
            const isPending = c.consultationStatus?.id === 1;
            
            return (
              <div
                key={c.id}
                onClick={() => openDrawer(c)}
                style={{
                  background: "#fff",
                  border: isPending ? "1px solid #91caff" : "1px solid #f0f0f0",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  boxShadow: isPending
                    ? "0 0 0 2px #e6f4ff"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = isPending ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <img
                    src={c.carnetAnimal.picture ? base_url + 'uploads/files/pets/' + c.carnetAnimal.picture : photoDefaultSrc}
                    alt={c.carnetAnimal.nom}
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => { e.target.src = photoDefaultSrc; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>
                      {c.carnetAnimal?.nom}
                      <span style={{ fontWeight: 400, color: "#888", fontSize: "13px" }}>
                        {" "}{getAContent('cmp_vetonest.com_WithDr_Prefix')} {c.profileVeto?.prenom} {c.profileVeto?.nom}
                      </span>
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
                    {/* Status Tag */}
                    <Tag color={statusDisplay.color}>
                      {getAContent(`cmp_vetonest.com_Status_${statusDisplay.key}_Txt`) || statusDisplay.text}
                    </Tag>
                    
                    {/* Video Consultation Button - Only shows after vet accepts (status 2) and not expired */}
                    {showVideoButton && (
<VideoConsultationButton
  currentUserId={userProfile?.userId}
  targetUserId={c.profileVeto?.userId}
  vetName={`${c.profileVeto?.prenom || ''} ${c.profileVeto?.nom || ''}`}
  ownerName={`${userProfile?.prenom || ''} ${userProfile?.nom || ''}`.trim() || 'Client'}
  buttonText={videoReady
    ? (getAContent('cmp_vetonest.com_JoinCall_Btn')          || 'Rejoindre')
    : (getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Consultation vidéo')}
  getAContent={getAContent}
  navigate={navigate}
  skipValidation={true}
  isInitiator={true}
/>
)}
                    
                    {/* Rating Button - Only shows for COMPLETED consultations (status 4) */}
                    {isCompletedConsultation && (
                      <Button
                        size="small"
                        icon={<StarOutlined />}
                        onClick={(e) => openRateDrawer(c, e)}
                        style={{ borderColor: "#faad14", color: "#faad14" }}
                      >
                        {c.rating || c.comment ? 
                          (getAContent('cmp_vetonest.com_EditReview_Btn') || 'Edit Review') : 
                          (getAContent('cmp_vetonest.com_RateAndComment_Btn') || 'Rate')}
                      </Button>
                    )}
                  </div>
                </div>
                
                {c.comment && (
                  <CommentDisplay comment={c.comment} consultationId={c.id} />
                )}
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
              {getAContent('cmp_vetonest.com_CancelConsultation_Btn')}
            </Button>
          ) : null
        }
      />

      <Drawer
        title={
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {getAContent('cmp_vetonest.com_RateAndComment_Btn') || 'Rate & Comment'}
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
              {getAContent('cmp_vetonest.com_Pa8Rk2sYnB') || 'Cancel'}
            </Button>
            <Button
              type="primary"
              loading={submitting}
              disabled={ratingValue === 0 && !commentValue.trim()}
              onClick={handleSubmitRating}
            >
              {getAContent('cmp_vetonest.com_Submit_Btn') || 'Submit'}
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
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>
                {getAContent('cmp_vetonest.com_YourRating_Label') || 'Your rating'}
              </p>
              <Rate value={ratingValue} onChange={setRatingValue} style={{ fontSize: "28px" }} allowClear={false} />
              {ratingValue > 0 && (
                <p style={{ marginTop: "8px", color: "#888", fontSize: "12px" }}>
                  {ratingValue} {getAContent('cmp_vetonest.com_StarRating_Txt') || 'star(s)'}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>
                {getAContent('cmp_vetonest.com_YourComment_Label') || 'Your comment'}
              </p>
              <textarea
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                rows={5}
                placeholder={getAContent('cmp_vetonest.com_CommentPlaceholder_Txt') || 'Share your experience...'}
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

    </ConsultationLayout>
  );
};

export default ConsultationListPetOwner;