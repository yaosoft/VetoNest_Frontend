// src/components/ConsultationListPetOwner.js
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Input, Button, Tag, Spin, Empty, Rate, Drawer, Modal, message, Tooltip, ConfigProvider, Badge } from "antd";
import { SearchOutlined, PlusOutlined, StarOutlined, UserOutlined, DeleteOutlined, CalendarOutlined, ReloadOutlined, SortAscendingOutlined, SortDescendingOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTimezoneDisplay } from "../../utils/timezoneUtils";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { useSocket } from "../../context/SocketProvider";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";
import VideoConsultationButton from "../VideoConsultationButton";
import VetName from "../VetName";

dayjs.extend(utc);
dayjs.extend(timezone);

const { TextArea } = Input;

// ── Helper to format local datetime from backend string ─────────────────────
const formatLocalDateTime = (dateTimeStr, atLabel, locale) => {
  if (!dateTimeStr) return "—";
  const [datePart, timePart] = dateTimeStr.split(' ');
  if (!datePart || !timePart) return dateTimeStr;
  const [year, month, day] = datePart.split('-');
  const date = new Date(year, month - 1, day);
  const formattedDate = date.toLocaleDateString(locale || "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return `${formattedDate} ${atLabel} ${timePart}`;
};

const isReadyToJoin = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const minutesUntil = startDate.diff(dayjs().tz(tz), "minute");
  return minutesUntil <= 5 && minutesUntil >= 0;
};

const isInProgress = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const minutesSinceStart = dayjs().tz(tz).diff(startDate, "minute");
  return minutesSinceStart >= 0;
};

const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 1) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const minutesSinceStart = dayjs().tz(tz).diff(startDate, "minute");
  return minutesSinceStart > 60;
};

const isCompleted = (consultation) => consultation.consultationStatus?.id === 4;
const isCancelled = (consultation) => consultation.consultationStatus?.id === 5;
const isPending = (consultation) => consultation.consultationStatus?.id === 1 && !isExpired(consultation);

const isCallable = (consultation) => {
  const statusId = consultation.consultationStatus?.id;
  return statusId === 2 || statusId === 3;
};

const getVetPhone = (profileVeto) => {
  if (!profileVeto) return null;
  return profileVeto.phonePro || profileVeto.phone || null;
};

const getStatusDisplay = (consultation) => {
  const statusId = consultation.consultationStatus?.id;
  if (isExpired(consultation)) return { text: 'Expired', color: 'volcano', key: 'Expired' };
  if (isCompleted(consultation)) return { text: 'Completed', color: 'purple', key: 'Completed' };
  if (isCancelled(consultation)) return { text: 'Cancelled', color: 'red', key: 'Cancelled' };
  if (statusId === 3) return { text: 'In Progress', color: 'orange', key: 'InProgress' };
  if (isInProgress(consultation)) return { text: 'In Progress', color: 'orange', key: 'InProgress' };
  if (isReadyToJoin(consultation)) return { text: 'Ready to Join', color: 'green', key: 'ReadyToJoin' };
  if (statusId === 1) return { text: 'Pending', color: 'blue', key: 'Pending' };
  if (statusId === 2) return { text: 'Accepted', color: 'green', key: 'Accepted' };
  return { text: consultation.consultationStatus?.nom || '—', color: 'default', key: 'Unknown' };
};

const shouldShowVideoButton = (consultation) => {
  const statusId = consultation.consultationStatus?.id;
  return isVideoConsultationType(consultation.consultationType) && (statusId === 2 || statusId === 3);
};

const canPetJoinVideo = (consultation, isCallReady) => {
  if (!consultation?.startingDatetime) return false;
  if (!isVideoConsultationType(consultation.consultationType)) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;
  if (isCallReady) return true;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const minutesUntil = startDate.diff(dayjs().tz(tz), "minute");
  return minutesUntil <= 5;
};

const canCancel = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId === 4 || statusId === 5) return false;
  if (isExpired(consultation)) return false;
  if (isInProgress(consultation)) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const diff = startDate.diff(dayjs().tz(tz), "minute");
  return diff > 60;
};

const isAboutToStart = (startingDatetime, consultationTimezone) => {
  if (!startingDatetime) return false;
  const tz = consultationTimezone || 'Europe/Paris';
  const start = dayjs.tz(startingDatetime.date || startingDatetime, tz);
  const minutesUntil = start.diff(dayjs().tz(tz), "minute");
  return minutesUntil > 0 && minutesUntil <= 5;
};

// Helper function to get consultation type localized text
const getConsultationTypeText = (consultationType, getAContentFn) => {
  if (!consultationType) return '';
  
  // Use tagRef if available for localization
  if (consultationType.tagRef) {
    const translated = getAContentFn(consultationType.tagRef);
    if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
      return translated;
    }
  }
  
  // Fallback to nom if tagRef not available or translation failed
  return consultationType.nom || '';
};

// id=1 is the canonical video/online consultation type in the DB.
// Also checks tagRef/nom as a belt-and-suspenders fallback so any new
// video type added to the DB is handled without a front-end change.
const isVideoConsultationType = (consultationType) => {
  if (!consultationType) return false;
  if (consultationType.id === 1) return true;
  const tagRef = (consultationType.tagRef ?? '').toLowerCase();
  const nom    = (consultationType.nom   ?? '').toLowerCase();
  return tagRef.includes('online') || tagRef.includes('video')
      || nom.includes('online')    || nom.includes('video')
      || nom.includes('remote');
};

// Styled consultation type badge — colour-coded, consistent with VetCard.
const ConsultationTypeBadge = ({ consultationType, getAContent }) => {
  if (!consultationType) return null;
  const isVideo = isVideoConsultationType(consultationType);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '10px',
      fontWeight: 600,
      color:      isVideo ? '#1565c0' : '#2e7d32',
      background: isVideo ? '#e3f2fd' : '#e8f5e9',
      border:     `1px solid ${isVideo ? '#bbdefb' : '#c8e6c9'}`,
      borderRadius: '10px',
      padding: '1px 8px',
      lineHeight: '18px',
      marginLeft: '8px',
      whiteSpace: 'nowrap',
    }}>
      <i className={isVideo ? 'fa fa-video-camera' : 'fa fa-map-marker'} />
      {getConsultationTypeText(consultationType, getAContent)}
    </span>
  );
};

// Vet practice mode badge — mirrors the VetCard badge in ConsultationBooking.
const PracticeModeBadge = ({ profileVeto, getAContent }) => {
  if (!profileVeto) return null;
  const modeName = profileVeto.vetoMode?.name
    ?? (profileVeto.atHome === true  ? 'home'
      : profileVeto.atHome === false ? 'clinic'
      : null);
  if (!modeName) return null;
  const cfg = {
    home:   { color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9' },
    clinic: { color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb' },
    online: { color: '#6a1b9a', bg: '#f3e5f5', border: '#ce93d8' },
  }[modeName] || { color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb' };
  const label = profileVeto.vetoMode?.tagRef
    ? getAContent(profileVeto.vetoMode.tagRef) || modeName
    : modeName;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '10px',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '10px',
      padding: '1px 8px',
      lineHeight: '18px',
      marginLeft: '6px',
      whiteSpace: 'nowrap',
    }}>
      <i className="fa fa-map-marker" /> {label}
    </span>
  );
};

// Helper function to get vet name as plain text (for buttons, emails, filters where JSX can't be used)
const getVetNamePlainText = (vet, getAContentFn) => {
  if (!vet) return '';
  let titleCode = '';
  if (vet.vetTitle?.tagRefCode) {
    titleCode = getAContentFn(vet.vetTitle.tagRefCode);
  } else if (vet.vetTitle?.code) {
    titleCode = vet.vetTitle.code;
  }
  const title = titleCode ? `${titleCode} ` : '';
  const fullName = `${vet.prenom || ''} ${vet.nom || ''}`.trim();
  return `${title}${fullName}`.trim();
};

const ConsultationListPetOwner = () => {
  const { profileId, profileTypeId, user } = useContext(AuthContext);
  const {
    consultationCancel,
    getPetOwnerConsultationList,
    base_url,
    getAContent,
    siteLocale,
    saveRating,
    saveComment,
    deleteComment,
    profileGet,
  } = useContext(SiteContext);

  const t = (tagRef, fallback = '') => {
    const val = getAContent(tagRef);
    return (val && val !== '***' && val !== '...') ? val : fallback;
  };

  const { vetCallReady, closeCallNotification, registerRefetchCallback } = useSocket();
  const navigate = useNavigate();

  // ── Stable refs for SiteContext functions ────────────────────────────────────
  const getPetOwnerConsultationListRef = useRef(getPetOwnerConsultationList);
  const getAContentRef = useRef(getAContent);
  getPetOwnerConsultationListRef.current = getPetOwnerConsultationList;
  getAContentRef.current = getAContent;

  // ── State ────────────────────────────────────────────────────────────────────
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [photoDefaultSrc] = useState('/img/user/1.jpg');
  const [userProfile, setUserProfile] = useState(null);
  const [filterVet, setFilterVet] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [rateDrawerOpen, setRateDrawerOpen] = useState(false);
  const [ratingConsultation, setRatingConsultation] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [commentValue, setCommentValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [existingComment, setExistingComment] = useState(null);
  const [loadingExistingData, setLoadingExistingData] = useState(false);

  // ── Fetch user profile ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (profileId && profileTypeId) {
        const profile = await profileGet(profileId, profileTypeId);
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, [profileId, profileTypeId]);

  // ── fetchConsultations — stable: only changes when profileId changes ─────────
  const fetchConsultations = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const rep = await getPetOwnerConsultationListRef.current(profileId);
      console.debug('[PetOwner] fetchConsultations response:', rep);
      if (rep?.success && Array.isArray(rep.consultations)) {
        setConsultations(rep.consultations);
      } else {
        console.warn('[PetOwner] Unexpected response shape:', rep);
      }
    } catch (e) {
      console.error(e);
      message.error(getAContentRef.current('cmp_vetonest.com_ErrorLoading_Txt') || 'Error loading consultations');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // ── Single effect: initial fetch + socket refetch registration ───────────────
  useEffect(() => {
    if (!profileId) return;
    const unregister = registerRefetchCallback?.(fetchConsultations);
    fetchConsultations();
    return () => unregister?.();
  }, [profileId, fetchConsultations, registerRefetchCallback]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        message.success(getAContent('cmp_vetonest.com_ConsultationCancelled_Txt') || 'Consultation cancelled');
        setDrawerOpen(false);
        fetchConsultations();
      } else message.error(rep?.message || getAContent('cmp_vetonest.com_CancelFailed_Txt') || 'Failed to cancel');
    } catch (error) {
      console.error(error);
      message.error(getAContent('cmp_vetonest.com_CancelFailed_Txt') || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: getAContent('cmp_vetonest.com_DeleteComment') || 'Delete Comment',
      content: getAContent('cmp_vetonest.com_ConfirmDeleteComment') || 'Are you sure?',
      okText: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
      cancelText: getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const result = await deleteComment(commentId, profileId);
          if (result && result.success !== false) {
            message.success(getAContent('cmp_vetonest.com_CommentDeleted') || 'Comment deleted');
            await fetchConsultations();
          } else throw new Error('Failed');
        } catch (error) {
          console.error(error);
          message.error(getAContent('cmp_vetonest.com_ErrorDeletingComment') || 'Error deleting comment');
        }
      }
    });
  };

  const fetchExistingRatingAndComment = async (consultation) => {
    setLoadingExistingData(true);
    try {
      if (consultation.rating?.evaluation) {
        setExistingRating(consultation.rating);
        setRatingValue(consultation.rating.evaluation);
      } else {
        setExistingRating(null);
        setRatingValue(0);
      }
      if (consultation.comment?.commentText) {
        setExistingComment(consultation.comment);
        setCommentValue(consultation.comment.commentText);
      } else {
        setExistingComment(null);
        setCommentValue('');
      }
    } catch (error) {
      console.error(error);
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
      const languageCode = (siteLocale || 'en-GB').split('-')[0];
      const vetId = ratingConsultation.profileVeto?.id;
      const vetName = getVetNamePlainText(ratingConsultation.profileVeto, getAContent);
      if (ratingValue > 0) {
        await saveRating({
          ratingId: existingRating?.id,
          consultationId: ratingConsultation.id,
          profileVetoId: vetId,
          rating: ratingValue,
          profileId,
          locale: languageCode,
          vetUserId: ratingConsultation.profileVeto?.userId,
          vetEmail: ratingConsultation.profileVeto?.userEmail,
          vetName, ownerName, petName, vetId,
        });
      }
      if (commentValue && commentValue.trim()) {
        await saveComment({
          commentId: existingComment?.id,
          consultationId: ratingConsultation.id,
          comment: commentValue.trim(),
          profileId,
          locale: languageCode,
          vetUserId: ratingConsultation.profileVeto?.userId,
          vetEmail: ratingConsultation.profileVeto?.userEmail,
          vetName, ownerName, petName, vetId,
        });
      }
      await fetchConsultations();
      setRateDrawerOpen(false);
      message.success(getAContent('cmp_vetonest.com_RatingSaved_Txt') || 'Rating saved!');
    } catch (error) {
      console.error(error);
      message.error(getAContent('cmp_vetonest.com_ErrorSaving_Txt') || 'Error saving');
    } finally {
      setSubmitting(false);
    }
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  // ── Filtered & sorted list ───────────────────────────────────────────────────
  const filtered = consultations
    .filter(c => {
      if (filterVet) {
        const vetName = getVetNamePlainText(c.profileVeto, getAContent).toLowerCase();
        if (!vetName.includes(filterVet.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aIsPending = isPending(a);
      const bIsPending = isPending(b);
      
      // Pending consultations come first
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;
      
      // For pending consultations, sort by creation date (newest first)
      if (aIsPending && bIsPending) {
        const aDate = dayjs(a.creationDate?.date || a.creationDate);
        const bDate = dayjs(b.creationDate?.date || b.creationDate);
        return bDate.diff(aDate); // Newest first
      }
      
      // For non-pending, sort by starting date
      const aDate = dayjs(a.startingDatetime?.date || a.startingDatetime);
      const bDate = dayjs(b.startingDatetime?.date || b.startingDatetime);
      return sortOrder === "desc" ? bDate.diff(aDate) : aDate.diff(bDate);
    });

  const pendingCount = consultations.filter(c => isPending(c)).length;

  // ── Sub-components ───────────────────────────────────────────────────────────
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
              <span style={{ fontSize: 12, color: '#888' }}>{getAContent('cmp_vetonest.com_YourComment_Label') || 'Your comment'}:</span>
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

  const CallVetButton = ({ consultation }) => {
    const phone = getVetPhone(consultation.profileVeto);
    if (!phone) return null;
    const vetName = getVetNamePlainText(consultation.profileVeto, getAContent);
    const label = t('cmp_vetonest.com_CallVet_Btn', 'Call vet');
    const tooltipTitle = `${t('cmp_vetonest.com_CallVet_Tooltip', 'Call')} ${vetName} · ${phone}`;
    return (
      <Tooltip title={tooltipTitle} placement="top">
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px', borderRadius: '6px', border: '1px solid #333333',
            color: '#333333', backgroundColor: '#fff', fontSize: '13px',
            fontWeight: 600, textDecoration: 'none', lineHeight: '22px',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333333'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#333333'; }}
        >
          <PhoneOutlined style={{ fontSize: 13 }} />
          {label}
        </a>
      </Tooltip>
    );
  };

  // ── Render Consultation Card ─────────────────────────────────────────────────
  const renderConsultationCard = (c) => {
    const showVideoButton = shouldShowVideoButton(c);
    const statusDisplay = getStatusDisplay(c);
    const isCompletedConsultation = isCompleted(c);
    const isPendingConsultation = isPending(c);
    const aboutToStart = isAboutToStart(c.startingDatetime, c.timezone);
    const isCallReady = !!vetCallReady[String(c.id)];
    const videoJoinAllowed = canPetJoinVideo(c, isCallReady);
    const buttonDisabled = !isCallReady || !videoJoinAllowed;
    const buttonTooltip = !videoJoinAllowed
      ? (getAContent('cmp_vetonest.com_VideoNotYetAvailable_Tooltip') || "Video available 5 minutes before consultation time")
      : (!isCallReady ? (getAContent('cmp_vetonest.com_VetNotCalledYet_Tooltip') || "Vet hasn't started the call yet") : "");
    const showCallButton = isCallable(c);
    const vetNameWithTitle = getVetNamePlainText(c.profileVeto, getAContent);
    const consultationTypeText = getConsultationTypeText(c.consultationType, getAContent);

    return (
      <div
        key={c.id}
        onClick={() => openDrawer(c)}
        className={`consultation-card ${isCallReady ? 'call-ready' : ''} ${isPendingConsultation ? 'pending' : ''}`}
        style={{
          background: isCallReady ? '#f6ffed' : '#fff',
          border: isCallReady ? '1px solid #b7eb8f' : isPendingConsultation ? "1px solid #91caff" : "1px solid #f0f0f0",
          borderRadius: "10px",
          padding: "16px 20px",
          cursor: "pointer",
          transition: "box-shadow 0.15s, background 0.3s, border 0.3s",
          boxShadow: isCallReady ? '0 0 0 2px #d9f7be' : isPendingConsultation ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {isCallReady && (
          <div className="call-banner" style={{ backgroundColor: "#f6ffed", borderLeft: "4px solid #52c41a", padding: "8px 12px", marginBottom: "12px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px", animation: "pulse-green 1.5s ease-in-out infinite" }}>
            <span>📹</span>
            <span>{vetNameWithTitle} {getAContent('cmp_vetonest.com_VetIsCallingBanner_Suffix') || 'is calling you — join now!'}</span>
          </div>
        )}

        {aboutToStart && !isCallReady && (
          <div className="warning-banner" style={{ backgroundColor: "#fff7e6", borderLeft: "4px solid #faad14", padding: "8px 12px", marginBottom: "12px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔔</span>
            <span>{getAContent('cmp_vetonest.com_ConsultationStartsSoon_Txt', 'La consultation commence dans quelques minutes. Préparez-vous !')}</span>
          </div>
        )}

        <div className="card-content" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="card-image" style={{ flexShrink: 0 }}>
            <img
              src={c.carnetAnimal?.picture ? base_url + 'uploads/files/pets/' + c.carnetAnimal.picture : photoDefaultSrc}
              alt={c.carnetAnimal?.nom || 'Pet'}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => e.target.src = photoDefaultSrc}
            />
          </div>

          <div className="card-details" style={{ flex: 1, minWidth: 0 }}>
            <p className="pet-name" style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {c.carnetAnimal?.nom || 'Pet'}
              <span className="vet-name" style={{ fontWeight: 400, color: "#888", fontSize: 13 }}>
                {getAContent('cmp_vetonest.com_WithDr_Prefix') || 'with'}{' '}
                <VetName 
                  vet={c.profileVeto}
                  showTitle={true}
                  format="full"
                  withTooltip={true}
                />
              </span>
            </p>
            <p className="datetime" style={{ margin: 0, fontSize: 13, color: "#888", display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatLocalDateTime(c.startingDatetime, getAContent('cmp_vetonest.com_At_Prefix') || "at", siteLocale)}
              {c.timezone && (
                <span style={{ marginLeft: 6, color: "#bbb", fontSize: 12 }}>
                  ({getTimezoneDisplay(c.timezone)})
                </span>
              )}
              <ConsultationTypeBadge consultationType={c.consultationType} getAContent={getAContent} />
              <PracticeModeBadge profileVeto={c.profileVeto} getAContent={getAContent} />
            </p>
          </div>

          <div className="card-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Tag color={statusDisplay.color}>
              {getAContent(`cmp_vetonest.com_Status_${statusDisplay.key}_Txt`) || statusDisplay.text}
            </Tag>

            {showVideoButton && (
              <Tooltip title={buttonTooltip} placement="top">
                <span style={{ display: 'inline-block' }}>
                  <VideoConsultationButton
                    currentUserId={user?.userId}
                    targetUserId={c.profileVeto?.userId}
                    vetName={vetNameWithTitle}
                    ownerName={`${userProfile?.prenom || ''} ${userProfile?.nom || ''}`.trim()}
                    buttonText={isCallReady ? getAContent('cmp_vetonest.com_JoinCall_Btn') || "Rejoindre l'appel" : getAContent('cmp_vetonest.com_VideoConsultation_Btn') || "Consultation vidéo"}
                    getAContent={getAContent}
                    navigate={navigate}
                    isInitiator={true}
                    disabled={buttonDisabled}
                    title={buttonTooltip}
                    consultationId={c.id}
                    onBeforeCall={() => closeCallNotification(String(c.id))}
                    style={{
                      background: isCallReady ? "#52c41a" : !buttonDisabled ? "#1677ff" : "#f5f5f5",
                      border: "none",
                      color: !buttonDisabled ? "#fff" : "#bfbfbf",
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: buttonDisabled ? "not-allowed" : "pointer",
                    }}
                    iconStyle={{ color: !buttonDisabled ? "#52c41a" : "#bfbfbf", fontSize: "15px" }}
                  />
                </span>
              </Tooltip>
            )}

            {showCallButton && <CallVetButton consultation={c} />}

            {isCompletedConsultation && (
              <Button
                size="small"
                icon={<StarOutlined />}
                onClick={(e) => openRateDrawer(c, e)}
                className="rate-button"
                style={{ borderColor: "#faad14", color: "#faad14" }}
              >
                {c.rating || c.comment ? getAContent('cmp_vetonest.com_ModifyReview_Btn') || 'Modifier avis' : getAContent('cmp_vetonest.com_Rate_Btn') || 'Noter'}
              </Button>
            )}
          </div>
        </div>

        {c.comment && <CommentDisplay comment={c.comment} />}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ConsultationLayout title={getAContent('cmp_vetonest.com_MyConsultations_Txt')}>
      <div className="consultation-list-petowner">
		<div className="filter-bar">
		  <ConfigProvider theme={{ token: { colorBgContainer: '#ffffff', colorBorder: '#d9d9d9' } }}>
			<Input
			  prefix={<SearchOutlined />}
			  placeholder={getAContent('cmp_vetonest.com_SearchByVetName_Placeholder') || "Search by vet name"}
			  value={filterVet}
			  onChange={(e) => setFilterVet(e.target.value)}
			  className="filter-search"
			  allowClear
			/>
		  </ConfigProvider>
		  <Button
			icon={sortOrder === "desc" ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
			onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
			className="filter-sort-btn"
		  >
			{sortOrder === "desc" ? t("cmp_vetonest.com_NewestFirst_Label", "Newest first") : t("cmp_vetonest.com_OldestFirst_Label", "Oldest first")}
		  </Button>
		  <div className="filter-actions">
			<Tooltip title={getAContent('cmp_vetonest.com_Refresh_Tooltip') || "Refresh list"}>
			  <Button icon={<ReloadOutlined />} onClick={() => fetchConsultations()} loading={loading} style={{ marginRight: 8 }} />
			</Tooltip>
			<Button 
			  type="primary" 
			  icon={<i className="fa fa-stethoscope" style={{ marginRight: '4px' }} />} 
			  onClick={() => navigate("/consultation/creation")} 
			  className="book-button"
			  style={{ 
				backgroundColor: '#52c41a', 
				borderColor: '#52c41a',
				transition: 'all 0.3s ease'
			  }}
			  onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = '#1677ff';
				e.currentTarget.style.borderColor = '#1677ff';
			  }}
			  onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = '#52c41a';
				e.currentTarget.style.borderColor = '#52c41a';
			  }}
			>
			  {getAContent('cmp_vetonest.com_BookConsultation_Btn')}
			</Button>
		  </div>
		</div>

        {loading
          ? <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
          : filtered.length === 0
            ? <Empty description={getAContent('cmp_vetonest.com_NoConsultationsFound_Txt')} style={{ marginTop: "60px" }} />
            : <div className="consultations-list">
                {(() => {
                  let pendingHeaderShown = false;
                  let nonPendingHeaderShown = false;
                  const hasPending = filtered.some(c => isPending(c));
                  const hasNonPending = filtered.some(c => !isPending(c));
                  
                  return filtered.map(c => {
                    const isPendingConsultation = isPending(c);
                    
                    // Show pending section header before first pending consultation
                    if (isPendingConsultation && !pendingHeaderShown) {
                      pendingHeaderShown = true;
                      return (
                        <React.Fragment key={`pending-header`}>
                          <div style={{ 
                            margin: "16px 0 8px 0", 
                            padding: "8px 14px", 
                            backgroundColor: "#e6f4ff", 
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            border: "1px solid #91caff"
                          }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#1677ff" }}>
                              📋 {getAContent('cmp_vetonest.com_PendingRequests_Txt') || 'Pending requests'}
                            </span>
                            <Badge count={pendingCount} style={{ backgroundColor: "#1677ff" }} />
                          </div>
                          {renderConsultationCard(c)}
                        </React.Fragment>
                      );
                    }
                    
                    // Show non-pending section header before first non-pending consultation
                    if (!isPendingConsultation && !nonPendingHeaderShown && hasPending) {
                      nonPendingHeaderShown = true;
                      return (
                        <React.Fragment key={`non-pending-header`}>
                          <div style={{ 
                            margin: "16px 0 8px 0", 
                            padding: "8px 14px", 
                            backgroundColor: "#f6ffed", 
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            border: "1px solid #b7eb8f"
                          }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#52c41a" }}>
                              ✅ {getAContent('cmp_vetonest.com_ConfirmedConsultations_Txt') || 'Confirmed consultations'}
                            </span>
                          </div>
                          {renderConsultationCard(c)}
                        </React.Fragment>
                      );
                    }
                    
                    // Regular card rendering
                    return renderConsultationCard(c);
                  });
                })()}
              </div>
        }
      </div>

      <ConsultationDetailDrawer
        consultation={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extraActions={selected && canCancel(selected)
          ? <Button danger loading={cancelling} onClick={handleCancel}>{getAContent('cmp_vetonest.com_CancelConsultation_Btn') || 'Annuler'}</Button>
          : null
        }
      />

      <Drawer
        title={
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>{getAContent('cmp_vetonest.com_RateAndComment_Btn') || 'Noter et commenter'}</p>
            {ratingConsultation?.profileVeto && (
              <p style={{ margin: 0, fontSize: "13px", color: "#888", fontWeight: 400 }}>
                <VetName 
                  vet={ratingConsultation.profileVeto}
                  showTitle={true}
                  format="full"
                  withTooltip={true}
                />
              </p>
            )}
          </div>
        }
        placement="right"
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 400}
        open={rateDrawerOpen}
        onClose={() => setRateDrawerOpen(false)}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button onClick={() => setRateDrawerOpen(false)}>{getAContent('cmp_vetonest.com_Pa8Rk2sYnB') || 'Annuler'}</Button>
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
        {loadingExistingData
          ? <div style={{ textAlign: "center", padding: "40px" }}><Spin /></div>
          : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Votre note</p>
                <Rate value={ratingValue} onChange={setRatingValue} style={{ fontSize: "28px" }} allowClear={false} />
                {ratingValue > 0 && <p style={{ marginTop: "8px", color: "#888", fontSize: "12px" }}>{ratingValue} étoile(s)</p>}
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Votre commentaire</p>
                <textarea
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  rows={5}
                  placeholder="Partagez votre expérience..."
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", resize: "vertical" }}
                />
              </div>
            </>
          )
        }
      </Drawer>

      <style jsx>{`
	  .consultation-list-petowner { width: 100%; }
	  .filter-bar { 
		display: flex; 
		gap: 10px; 
		flex-wrap: wrap; 
		align-items: center;
		position: sticky;
		top: 178px;
		z-index: 100;
		background-color: #fff;
		padding: 12px 0;
		margin-bottom: 20px;
		border-bottom: 1px solid #f0f0f0;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	  }
	  .filter-search { flex: 1; min-width: 200px; }
	  .filter-sort-btn { white-space: nowrap; background: #fff; border-color: #d9d9d9; }
	  .filter-actions { margin-left: auto; display: flex; gap: 8px; }
	  .consultations-list { display: flex; flex-direction: column; gap: 12px; }
	  .consultation-card { transition: all 0.2s ease; }
	  .consultation-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important; }
	  @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(82,196,26,0.55); } 70% { box-shadow: 0 0 0 7px rgba(82,196,26,0); } 100% { box-shadow: 0 0 0 0 rgba(82,196,26,0); } }
	  @media (max-width: 768px) {
		.filter-bar { flex-direction: column; position: sticky; top: 0; z-index: 100; background: #fff; padding: 12px 0; }
		.filter-search, .filter-sort-btn { width: 100%; }
		.filter-actions { margin-left: 0; width: 100%; justify-content: space-between; }
		.book-button { flex: 1; }
		.card-content { flex-direction: column; align-items: flex-start; }
		.card-details { width: 100%; }
		.card-actions { width: 100%; justify-content: flex-start; }
		.consultation-card { padding: 14px !important; }
	  }
	  @media (max-width: 480px) {
		.pet-name { font-size: 14px; }
		.datetime { font-size: 12px; }
		.card-actions button, .card-actions .ant-tag { font-size: 12px; }
	  }
	`}</style>
	  
    </ConsultationLayout>
  );
};

export default ConsultationListPetOwner;