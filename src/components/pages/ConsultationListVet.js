// src/components/ConsultationListVet.js
import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { Select, Input, Button, Tag, Spin, Empty, Badge, Modal, message, Tooltip, ConfigProvider } from "antd";
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined, ReloadOutlined, SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
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

// Status tagRef mapping - using tagRef for internationalization
const STATUS_TAG_REFS = {
  1: 'cmp_vetonest.com_StatusPending_Txt',
  2: 'cmp_vetonest.com_StatusAccepted_Txt',
  3: 'cmp_vetonest.com_StatusInProgress_Txt',
  4: 'cmp_vetonest.com_StatusFinished_Txt',
  5: 'cmp_vetonest.com_StatusCancelled_Txt',
};

// Consultation type tagRef mapping - using tagRef for internationalization
// NOTE: do NOT add a hardcoded id→tagRef map here. The API returns
// `consultationType.tagRef` directly; use that. A local id→string map
// will always risk going out of sync with the DB (as happened with id=3
// being mapped to 'AtClinic' when it was actually an online consultation).
//
// To determine whether a consultation is video-based we check the tagRef
// rather than a hardcoded id, so adding new consultation types in the DB
// doesn't require a front-end change.
const isVideoConsultationType = (consultationType) => {
  if (!consultationType) return false;
  // id=1 is the canonical video/online consultation type in the DB.
  // Also check tagRef/nom as a belt-and-suspenders fallback.
  if (consultationType.id === 1) return true;
  const tagRef = (consultationType.tagRef ?? '').toLowerCase();
  const nom    = (consultationType.nom   ?? '').toLowerCase();
  return tagRef.includes('online') || tagRef.includes('video')
      || nom.includes('online')    || nom.includes('video')
      || nom.includes('remote');
};

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
  if (statusId !== 2) return false;
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

// ── Get status display with i18n ─────────────────────────────────────────────
const getStatusDisplay = (consultation, getAContentFn) => {
  if (!consultation || !consultation.consultationStatus) { 
    return { text: "—", color: "default", key: "Unknown" }; 
  }
  
  const statusId = consultation.consultationStatus.id;
  const statusObj = consultation.consultationStatus;
  
  // Check for special states first
  if (isExpired(consultation)) {
    const text = getAContentFn('cmp_vetonest.com_StatusExpired_Txt') || 'Expired';
    return { text, color: "volcano", key: "Expired" };
  }
  if (isCompleted(consultation)) {
    const text = getAContentFn('cmp_vetonest.com_StatusCompleted_Txt') || 'Completed';
    return { text, color: "purple", key: "Completed" };
  }
  if (isCancelled(consultation)) {
    const text = getAContentFn('cmp_vetonest.com_StatusCancelled_Txt') || 'Cancelled';
    return { text, color: "red", key: "Cancelled" };
  }
  if (isInProgress(consultation)) {
    const text = getAContentFn('cmp_vetonest.com_StatusInProgress_Txt') || 'In Progress';
    return { text, color: "orange", key: "InProgress" };
  }
  if (isReadyToJoin(consultation)) {
    const text = getAContentFn('cmp_vetonest.com_StatusReadyToJoin_Txt') || 'Ready to Join';
    return { text, color: "green", key: "ReadyToJoin" };
  }
  
  // Use tagRef from status object if available
  if (statusObj.tagRef) {
    const translated = getAContentFn(statusObj.tagRef);
    if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
      return { text: translated, color: "default", key: statusObj.code || `Status_${statusId}` };
    }
  }
  
  // Fallback to mapping
  const fallbackTagRef = STATUS_TAG_REFS[statusId];
  if (fallbackTagRef) {
    const translated = getAContentFn(fallbackTagRef);
    if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
      return { text: translated, color: "default", key: statusObj.code || `Status_${statusId}` };
    }
  }
  
  // Ultimate fallback
  return { text: statusObj.nom || "—", color: "default", key: "Unknown" };
};

const isPending = (consultation) => consultation.consultationStatus?.id === 1 && !isExpired(consultation);
const shouldShowVideoButtonForVet = (consultation) => isVideoConsultationType(consultation.consultationType) && consultation.consultationStatus?.id === 2;
const isFinishable = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;
  if (isExpired(consultation)) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const now = dayjs().tz(tz);
  const isStarted = startDate.isBefore(now);
  const isInProgressStatus = statusId === 3;
  return isStarted || isInProgressStatus;
};

const isAboutToStart = (startingDatetime, consultationTimezone) => {
  if (!startingDatetime) return false;
  const tz = consultationTimezone || 'Europe/Paris';
  const start = dayjs.tz(startingDatetime.date || startingDatetime, tz);
  const minutesUntil = start.diff(dayjs().tz(tz), "minute");
  return minutesUntil > 0 && minutesUntil <= 5;
};

const canVetStartVideo = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  if (!isVideoConsultationType(consultation.consultationType)) return false;
  if (consultation.consultationStatus?.id !== 2) return false;
  const tz = consultation.timezone || 'Europe/Paris';
  const startDate = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, tz);
  const minutesUntil = startDate.diff(dayjs().tz(tz), "minute");
  return minutesUntil <= 5;
};

const sortConsultations = (consultations, sortOrder) => {
  return [...consultations].sort((a, b) => {
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
};

// ── Helper to get consultation type localized text ──────────────────────────
const getConsultationTypeText = (consultationType, getAContentFn) => {
  if (!consultationType) return '';
  // Use tagRef from the API object — it's the single source of truth.
  // A hardcoded id→tagRef fallback map has been removed because it went
  // out of sync with the DB (id=3 was mapped to 'AtClinic' but was
  // actually used for online-only consultations).
  if (consultationType.tagRef) {
    const translated = getAContentFn(consultationType.tagRef);
    if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
      return translated;
    }
  }
  return consultationType.nom || '';
};

const ConsultationListVet = () => {
  const { profileId, user } = useContext(AuthContext);
  const {
    base_url,
    allConsultationTypes,
    allConsultationStatuses,
    getVetConsultationList,
    consultationAccept,
    consultationCancel,
    consultationFinish,
    getAContent,
    siteLocale,
    postNotification,
    sendEmail,
    siteName,
    siteURL,
    siteDomainName,
    siteEmail,
  } = useContext(SiteContext);

  // ── Socket ───────────────────────────────────────────────────────────────────
  const {
    vetSocketRef,
    vetListenersAttachedRef,
    onlineUsers,
    registerRefetchCallback,
    emitConsultationStatus,
    emitCallRequest,
  } = useSocket();

  const t = (tagRef, fallback = '') => {
    const val = getAContent(tagRef);
    return (val && val !== '***' && val !== '...') ? val : fallback;
  };

  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterPet, setFilterPet] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [callingConsultationId, setCallingConsultationId] = useState(null);

  // Helper function to get vet name with title as plain text
  const getVetNamePlainText = useCallback((vet) => {
    if (!vet) return '';
    let titleCode = '';
    if (vet.vetTitle?.tagRefCode) {
      titleCode = getAContent(vet.vetTitle.tagRefCode);
    } else if (vet.vetTitle?.code) {
      titleCode = vet.vetTitle.code;
    }
    const title = titleCode ? `${titleCode} ` : '';
    const fullName = `${vet.prenom || ''} ${vet.nom || ''}`.trim();
    return `${title}${fullName}`.trim();
  }, [getAContent]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const rep = await getVetConsultationList(profileId);
      if (rep?.success) setConsultations(rep.consultations);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [profileId]);

  useEffect(() => { if (profileId) fetchConsultations(); }, [profileId]);

  useEffect(() => {
    const unregister = registerRefetchCallback?.(fetchConsultations);
    return () => unregister?.();
  }, [registerRefetchCallback]);

  // ── Filters / sorting ────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    const filtered = consultations.filter(c => {
      if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
      if (filterType && c.consultationType?.id !== filterType) return false;
      if (filterPet && !(c.carnetAnimal?.nom ?? "").toLowerCase().includes(filterPet.toLowerCase())) return false;
      return true;
    });
    return sortConsultations(filtered, sortOrder);
  }, [consultations, filterStatus, filterType, filterPet, sortOrder]);

  const pendingCount = consultations.filter(c => c.consultationStatus?.id === 1 && !isExpired(c)).length;

  // ── Status options with i18n ────────────────────────────────────────────────
  const statusOptions = useMemo(() => {
    const source = allConsultationStatuses?.length
      ? allConsultationStatuses
      : Array.from(consultations.reduce((map, c) => {
          const s = c.consultationStatus;
          if (s && !map.has(s.id)) map.set(s.id, s);
          return map;
        }, new Map()).values());
    
    return source.map(s => {
      let label = s.nom || `Status ${s.id}`;
      
      // 1. Try using tagRef from status object
      if (s.tagRef) {
        const translated = getAContent(s.tagRef);
        if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
          label = translated;
        }
      }
      
      // 2. Fallback to mapping
      if (!label || label === '***' || label === '...') {
        const fallbackTagRef = STATUS_TAG_REFS[s.id];
        if (fallbackTagRef) {
          const translated = getAContent(fallbackTagRef);
          if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
            label = translated;
          }
        }
      }
      
      return { value: s.id, label };
    });
  }, [allConsultationStatuses, consultations, getAContent]);

  // ── Type options with i18n ──────────────────────────────────────────────────
  const typeOptions = useMemo(() => {
    const source = allConsultationTypes?.length
      ? allConsultationTypes
      : Array.from(consultations.reduce((map, c) => {
          const type = c.consultationType;
          if (type && !map.has(type.id)) map.set(type.id, type);
          return map;
        }, new Map()).values());
    
    return source.map(type => {
      let label = type.nom || `Type ${type.id}`;
      if (type.tagRef) {
        const translated = getAContent(type.tagRef);
        if (translated && translated !== '***' && translated !== '...' && !translated.includes('undefined')) {
          label = translated;
        }
      }
      return { value: type.id, label };
    });
  }, [allConsultationTypes, consultations, getAContent]);

  // ── Action handlers ──────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
        const rep = await consultationAccept(selected.id);
        if (rep?.success) {
            emitConsultationStatus(selected.id, 2, selected.carnetAnimal?.profileUser?.userId);

            const petOwnerUserId = selected.carnetAnimal?.profileUser?.userId;
            if (petOwnerUserId) {
                try { await postNotification({ notificationTypeId: 5, receiverId: petOwnerUserId }); }
                catch { console.warn("Failed to send acceptance notification"); }
            }

            if (rep.ownerEmail) {
                const consultationTypeText = getConsultationTypeText(selected.consultationType, getAContent);
                
                const subject = siteLocale?.startsWith('fr') 
                    ? `Votre consultation a été confirmée — ${siteName}`
                    : `Your consultation has been confirmed — ${siteName}`;
                
                await sendEmail({
                    to_email:             rep.ownerEmail,
                    to_domain:            rep.ownerEmail.split('@')[1],
                    subject:              subject,
                    siteURL:              siteURL,
                    siteName:             siteName,
                    siteDomain:           siteDomainName,
                    siteEmail:            siteEmail,
                    siteLocale:           siteLocale,
                    emailTemplate:        'consultation_accepted',
                    vetName:              rep.vetName ?? getVetNamePlainText(selected.profileVeto),
                    ownerName:            rep.ownerName ?? '',
                    petName:              rep.petName ?? selected.carnetAnimal?.nom ?? '',
                    consultationDate:     rep.consultationDate ?? '',
                    consultationTime:     rep.consultationTime ?? '',
                    consultationDateTime: rep.consultationDateTime ?? '',
                    timezone:             rep.timezone ?? 'Europe/Paris',
                    consultationType:     consultationTypeText,
                });
            }

            setDrawerOpen(false);
            fetchConsultations();
            message.success(getAContent("cmp_vetonest.com_ConsultationAccepted_Txt") || "Consultation accepted");
        } else message.error(rep?.message || getAContent("cmp_vetonest.com_CouldNotAcceptConsultation_Txt") || "Could not accept");
    } catch { message.error(getAContent("cmp_vetonest.com_CouldNotAcceptConsultation_Txt") || "Could not accept"); }
    finally { setAccepting(false); }
};

  const handleDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        emitConsultationStatus(selected.id, 5, selected.carnetAnimal?.profileUser?.userId);
        setDrawerOpen(false);
        fetchConsultations();
        message.success(getAContent("cmp_vetonest.com_ConsultationDeclined_Txt") || "Consultation declined");
      } else message.error(rep?.message || getAContent("cmp_vetonest.com_CouldNotDeclineConsultation_Txt") || "Could not decline");
    } catch { message.error(getAContent("cmp_vetonest.com_CouldNotDeclineConsultation_Txt") || "Could not decline"); }
    finally { setDeclining(false); }
  };

  const handleFinish = async (consultationItem) => {
    Modal.confirm({
      title: getAContent("cmp_vetonest.com_FinishConsultation_Title") || "Finish Consultation",
      content: getAContent("cmp_vetonest.com_ConfirmFinishConsultation") || "Mark as finished?",
      okText: getAContent("cmp_vetonest.com_Finish_Btn") || "Finish",
      cancelText: getAContent("cmp_vetonest.com_Cancel_Btn") || "Cancel",
      onOk: async () => {
        setFinishing(true);
        try {
          const result = await consultationFinish(consultationItem.id);
          if (result?.success) {
            emitConsultationStatus(consultationItem.id, 4, consultationItem.carnetAnimal?.profileUser?.userId);
            message.success(getAContent("cmp_vetonest.com_ConsultationFinished_Txt") || "Finished");
            setDrawerOpen(false);
            fetchConsultations();
          } else throw new Error(result?.message || "Finish failed");
        } catch { message.error(getAContent("cmp_vetonest.com_ErrorFinishingConsultation") || "Error finishing"); }
        finally { setFinishing(false); }
      },
    });
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  const handleCallRequest = useCallback((petOwnerId, vetName, consultationId) => {
    setCallingConsultationId(consultationId);
    emitCallRequest(petOwnerId, vetName, consultationId, user?.userId);
  }, [emitCallRequest, user?.userId]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ConsultationLayout title={getAContent("cmp_vetonest.com_FLBx5ixGp5")} hideBookButton={true}>
      <div className="consultation-list-vet">
        <div className="filter-bar">
          <ConfigProvider theme={{ token: { colorBgContainer: '#ffffff', colorBorder: '#d9d9d9' } }}>
            <Input prefix={<SearchOutlined />} placeholder={t("cmp_vetonest.com_SearchByPetName_Placeholder", "Search by pet name")} value={filterPet} onChange={(e) => setFilterPet(e.target.value)} className="filter-search" allowClear />
          </ConfigProvider>
          <Select
            placeholder={t("cmp_vetonest.com_FilterAllStatuses_Label", "All statuses")}
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="filter-select"
            style={{ minWidth: 150 }}
            options={statusOptions}
          />
          <Select
            placeholder={t("cmp_vetonest.com_FilterAllTypes_Label", "All types")}
            value={filterType}
            onChange={setFilterType}
            allowClear
            className="filter-select"
            style={{ minWidth: 150 }}
            options={typeOptions}
          />
          <Button
            icon={sortOrder === "desc" ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
            onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
            className="filter-sort-btn"
          >
            {sortOrder === "desc" ? t("cmp_vetonest.com_NewestFirst_Label", "Newest first") : t("cmp_vetonest.com_OldestFirst_Label", "Oldest first")}
          </Button>
          <Tooltip title={getAContent("cmp_vetonest.com_Refresh_Tooltip") || "Refresh list"}>
            <Button icon={<ReloadOutlined />} onClick={() => fetchConsultations()} loading={loading} />
          </Tooltip>
          {pendingCount > 0 && (
            <Badge count={pendingCount} className="pending-badge">
              <Tag color="blue" className="pending-tag">{pendingCount} {getAContent("cmp_vetonest.com_PendingRequests_Txt")}</Tag>
            </Badge>
          )}
        </div>

        {loading
          ? <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
          : filteredAndSorted.length === 0
            ? <Empty description={getAContent("cmp_vetonest.com_NoAppointmentsFound_Txt")} style={{ marginTop: "60px" }} />
            : <div className="consultations-list">
                {(() => {
                  let pendingHeaderShown = false;
                  let nonPendingHeaderShown = false;
                  const hasPending = filteredAndSorted.some(c => isPending(c));

                  const renderConsultationCard = (c) => {
                  const statusDisplay = getStatusDisplay(c, getAContent);
                  const isPendingStatus = isPending(c);
                  const showVideoButton = shouldShowVideoButtonForVet(c);
                  const videoAllowed = canVetStartVideo(c);
                  const aboutToStart = isAboutToStart(c.startingDatetime, c.timezone);
                  const petOwnerId = c.carnetAnimal?.profileUser?.userId;
                  const vetDisplayName = getVetNamePlainText(c.profileVeto);
                  const isCalling = callingConsultationId === c.id;
                  const isInProgressStatus = statusDisplay.key === 'InProgress' || c.consultationStatus?.id === 2;
                  const isPetOwnerOnline = onlineUsers.has(String(petOwnerId));
                  const consultationTypeText = getConsultationTypeText(c.consultationType, getAContent);

                  return (
                    <div
                      key={c.id}
                      onClick={() => openDrawer(c)}
                      className={`consultation-card ${isPendingStatus ? 'pending' : ''}`}
                      style={{ 
                        background: "#fff", 
                        border: isPendingStatus ? "1px solid #91caff" : "1px solid #f0f0f0", 
                        borderRadius: "10px", 
                        padding: "16px 20px", 
                        cursor: "pointer", 
                        transition: "box-shadow 0.15s", 
                        boxShadow: isPendingStatus ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)" 
                      }}
                    >
                      {isCalling && (
                        <div className="calling-banner" style={{ backgroundColor: "#e6f7ff", borderLeft: "4px solid #1890ff", padding: "8px 12px", marginBottom: "12px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📞</span>
                          <span>{getAContent('cmp_vetonest.com_CallingVet_Banner') || 'Calling pet owner... please wait.'}</span>
                        </div>
                      )}
                      {aboutToStart && !isCalling && (
                        <div className="warning-banner" style={{ backgroundColor: "#fff7e6", borderLeft: "4px solid #faad14", padding: "8px 12px", marginBottom: "12px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🔔</span>
                          <span>{getAContent("cmp_vetonest.com_ConsultationStartsSoon_Txt", "La consultation commence dans quelques minutes. Préparez-vous !")}</span>
                        </div>
                      )}
                      <div className="card-content" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div className="card-image" style={{ flexShrink: 0 }}>
                          <img 
                            src={c.carnetAnimal?.picture ? base_url + "uploads/files/pets/" + c.carnetAnimal.picture : "/img/user/1.jpg"} 
                            alt={c.carnetAnimal?.nom} 
                            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} 
                          />
                        </div>
                        <div className="card-details" style={{ flex: 1, minWidth: 0 }}>
                          <p className="pet-name" style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {c.carnetAnimal?.nom}
                            {isInProgressStatus && isPetOwnerOnline && (
                              <Tooltip title="Propriétaire en ligne">
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#52c41a', boxShadow: '0 0 0 1px white, 0 0 0 2px #52c41a', marginLeft: '4px', animation: 'pulse-green 1.5s ease-in-out infinite' }} />
                              </Tooltip>
                            )}
                            {c.symptom?.urgency && (
                              <span className="urgency-badge" style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "#f57c00", borderRadius: 10, padding: "1px 8px" }}>
                                {typeof c.symptom.urgency === "object" ? c.symptom.urgency.name : c.symptom.urgency}
                              </span>
                            )}
                          </p>
                          <p className="datetime" style={{ margin: 0, fontSize: 13, color: "#888" }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {formatLocalDateTime(c.startingDatetime, getAContent("cmp_vetonest.com_At_Prefix") || "at", siteLocale)}
                            {c.timezone && (
                              <span style={{ marginLeft: 6, color: "#bbb", fontSize: 12 }}>
                                ({getTimezoneDisplay(c.timezone)})
                              </span>
                            )}
                            {c.consultationType && (
                              <span className="consultation-type" style={{ marginLeft: 10, color: "#aaa" }}>
                                · {consultationTypeText}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="card-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {showVideoButton && (
                            <Tooltip title={!videoAllowed ? (getAContent("cmp_vetonest.com_VideoNotYetAvailable_Tooltip") || "Video available 5 minutes before consultation time") : ""}>
                              <span style={{ display: 'inline-block' }}>
                                <VideoConsultationButton
                                  currentUserId={user?.userId}
                                  targetUserId={petOwnerId}
                                  vetName={vetDisplayName}
                                  ownerName={`${c.carnetAnimal?.profileUser?.prenom || ''} ${c.carnetAnimal?.profileUser?.nom || ''}`.trim()}
                                  buttonText={videoAllowed ? getAContent("cmp_vetonest.com_StartVideoCall_Btn") || "Start Call" : getAContent("cmp_vetonest.com_VideoNotYet_Btn") || "Video soon"}
                                  getAContent={getAContent}
                                  navigate={navigate}
                                  isInitiator={false}
                                  disabled={!videoAllowed}
                                  onAfterInit={() => { if (petOwnerId) handleCallRequest(petOwnerId, vetDisplayName, c.id); }}
                                  consultationId={c.id}
                                  onCallEnd={() => setCallingConsultationId(null)}
                                  vetSocket={vetSocketRef}
                                  vetListenersAttached={vetListenersAttachedRef}
                                  style={{
                                    background: videoAllowed ? "#1677ff" : "#f5f5f5",
                                    border: videoAllowed ? "none" : "1px solid #d9d9d9",
                                    color: videoAllowed ? "#fff" : "#bfbfbf",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    cursor: videoAllowed ? "pointer" : "not-allowed",
                                  }}
                                  iconStyle={{ color: videoAllowed ? "#52c41a" : "#bfbfbf", fontSize: "15px" }}
                                />
                              </span>
                            </Tooltip>
                          )}
                          <Tag color={statusDisplay.color}>{statusDisplay.text}</Tag>
                        </div>
                      </div>
                    </div>
                  );
                  };

                  return filteredAndSorted.map(c => {
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
        extraActions={selected && isPending(selected) ? (
          <>
            <Button danger loading={declining} onClick={handleDecline}>{getAContent("cmp_vetonest.com_Decline_Btn") || "Decline"}</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} loading={accepting} onClick={handleAccept} style={{ background: "#52c41a", borderColor: "#52c41a" }}>
              {getAContent("cmp_vetonest.com_AcceptAppointment_Btn") || "Accept"}
            </Button>
          </>
        ) : selected && isFinishable(selected) ? (
          <Button type="primary" loading={finishing} onClick={() => handleFinish(selected)}>{getAContent("cmp_vetonest.com_Finish_Btn") || "Finish"}</Button>
        ) : null}
      />

      <style jsx>{`
        .consultation-list-vet { width: 100%; }
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
        .filter-search { flex: 1; min-width: 180px; }
        .filter-select { min-width: 150px; }
        .filter-sort-btn { white-space: nowrap; }
        .pending-badge { margin-left: auto; }
        .pending-tag { padding: 4px 10px; font-size: 13px; }
        .consultations-list { display: flex; flex-direction: column; gap: 12px; }
        .consultation-card { transition: all 0.2s ease; }
        .consultation-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important; }
        .warning-banner { background-color: #fff7e6; border-left: 4px solid #faad14; padding: 8px 12px; margin-bottom: 12px; border-radius: 4px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .card-content { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .card-image { flex-shrink: 0; }
        .card-image img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
        .card-details { flex: 1; min-width: 0; }
        .pet-name { margin: 0 0 2px; font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .urgency-badge { font-size: 11px; font-weight: 600; color: #fff; background: #f57c00; border-radius: 10px; padding: 1px 8px; }
        .datetime { margin: 0; font-size: 13px; color: #888; }
        .consultation-type { margin-left: 10px; color: #aaa; }
        .card-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.55); }
          70% { box-shadow: 0 0 0 6px rgba(82, 196, 26, 0); }
          100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
        }
        @media (max-width: 768px) {
          .filter-bar { flex-direction: column; position: sticky; top: 0; z-index: 100; background: #fff; padding: 12px 0; }
          .filter-search, .filter-select, .filter-sort-btn { width: 100%; }
          .pending-badge { margin-left: 0; }
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

export default ConsultationListVet;