import React, { useState, useEffect, useContext, useMemo } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Badge, Modal, message } from "antd";
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";
import VideoConsultationButton from "../VideoConsultationButton";

const { RangePicker } = DatePicker;

// ── Locale-aware date+time formatter ─────────────────────────────────────────
const formatDateTime = (dateStr, atLabel, locale = "en-GB") => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  const date = d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${date} ${atLabel} ${time}`;
};

// ── i18n maps ─────────────────────────────────────────────────────────────────
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

// ── Time-based status functions ─────────────────────────────────────────────

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

// Check if consultation is pending (status 1) and not expired
const isPending = (consultation) => {
  return consultation.consultationStatus?.id === 1 && !isExpired(consultation);
};

// Check if video button should be shown for vet
const shouldShowVideoButtonForVet = (consultation) => {
  // Must be video consultation type (1 = Online/Video)
  if (consultation.consultationType?.id !== 1) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only show if ACCEPTED (2)
  if (statusId !== 2) return false;
  
  return true;
};

// Check if video is ready for vet (within time window)
const isVideoReadyForVet = (consultation) => {
  if (!shouldShowVideoButtonForVet(consultation)) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = dayjs(consultation.startingDatetime.date);
  } else {
    startDate = dayjs(consultation.startingDatetime);
  }
  
  const now = dayjs();
  const minutesUntil = startDate.diff(now, 'minute');
  
  // Ready within 5 minutes before start
  return minutesUntil <= 5;
};

// Consultation date is past AND status is accepted (id=2) - can be finished
const isFinishable = (consultation) => {
  if (consultation?.consultationStatus?.id !== 2) return false;
  if (isExpired(consultation)) return false;
  return dayjs(consultation.startingDatetime).isBefore(dayjs());
};

// Helper function to sort consultations by priority: Pending > In Progress > Expired > Completed > others
const sortConsultations = (consultations) => {
  return [...consultations].sort((a, b) => {
    const getPriority = (consultation) => {
      if (isPending(consultation)) return 1;     // Highest priority - Pending
      if (isInProgress(consultation)) return 2;  // Second priority - In Progress
      if (isExpired(consultation)) return 3;     // Third priority - Expired
      if (isCompleted(consultation)) return 4;   // Fourth priority - Completed
      if (isCancelled(consultation)) return 5;   // Fifth priority - Cancelled
      return 6; // Accepted or others
    };
    
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    const aDate = dayjs(a.startingDatetime);
    const bDate = dayjs(b.startingDatetime);
    
    if (isPending(a) && isPending(b)) {
      return aDate.isBefore(bDate) ? -1 : 1;
    } else {
      return bDate.isBefore(aDate) ? -1 : 1;
    }
  });
};

const ConsultationListVet = () => {
  const { profileId } = useContext(AuthContext);
  const { 
    base_url, 
    allConsultationTypes, 
    allConsultationStatuses, 
    getVetConsultationList, 
    consultationAccept, 
    consultationCancel, 
    consultationFinish, 
    postNotification, 
    getAContent, 
    siteLocale, 
    sendEmail, 
    siteURL, 
    siteName, 
    siteDomain, 
    siteEmail 
  } = useContext(SiteContext);

  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterPet, setFilterPet] = useState("");
  const [filterDates, setFilterDates] = useState(null);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const rep = await getVetConsultationList(profileId);
      if (rep?.success) setConsultations(rep.consultations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (profileId) fetchConsultations(); }, [profileId]);

  // Apply filters and then sort
  const filteredAndSorted = useMemo(() => {
    const filtered = consultations.filter((c) => {
      if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
      if (filterType && c.consultationType?.id !== filterType) return false;
      if (filterPet) {
        const name = (c.carnetAnimal?.nom ?? "").toLowerCase();
        if (!name.includes(filterPet.toLowerCase())) return false;
      }
      if (filterDates?.[0] && filterDates?.[1]) {
        const dt = dayjs(c.startingDatetime);
        if (dt.isBefore(filterDates[0], "day") || dt.isAfter(filterDates[1], "day")) return false;
      }
      return true;
    });
    
    return sortConsultations(filtered);
  }, [consultations, filterStatus, filterType, filterPet, filterDates]);

  // Pending count excludes expired consultations
  const pendingCount = consultations.filter(
    (c) => c.consultationStatus?.id === 1 && !isExpired(c)
  ).length;

  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const rep = await consultationAccept(selected.id);
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
        message.success(getAContent('cmp_vetonest.com_ConsultationAccepted_Txt') || 'Consultation accepted');
      } else {
        message.error((rep?.message ?? getAContent('cmp_vetonest.com_CouldNotAcceptConsultation_Txt')) || 'Could not accept consultation');
      }
    } catch (error) {
      console.error('Error accepting consultation:', error);
      message.error(getAContent('cmp_vetonest.com_CouldNotAcceptConsultation_Txt') || 'Could not accept consultation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
        message.success(getAContent('cmp_vetonest.com_ConsultationDeclined_Txt') || 'Consultation declined');
      } else {
        message.error((rep?.message ?? getAContent('cmp_vetonest.com_CouldNotDeclineConsultation_Txt')) || 'Could not decline consultation');
      }
    } catch (error) {
      console.error('Error declining consultation:', error);
      message.error(getAContent('cmp_vetonest.com_CouldNotDeclineConsultation_Txt') || 'Could not decline consultation');
    } finally {
      setDeclining(false);
    }
  };

  const handleFinish = async (consultationItem) => {
    const consultationId = consultationItem.id;
    
    Modal.confirm({
      title: getAContent('cmp_vetonest.com_FinishConsultation_Title') || 'Finish Consultation',
      content: getAContent('cmp_vetonest.com_ConfirmFinishConsultation') || 'Are you sure you want to mark this consultation as finished?',
      okText: getAContent('cmp_vetonest.com_Finish_Btn') || 'Finish',
      cancelText: getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel',
      onOk: async () => {
        setFinishing(true);
        try {
          const result = await consultationFinish(consultationId);
          if (result && result.success) {
            message.success(getAContent('cmp_vetonest.com_ConsultationFinished_Txt') || 'Consultation marked as finished');
            setDrawerOpen(false);
            fetchConsultations();
          } else {
            throw new Error(result?.message || 'Failed to finish consultation');
          }
        } catch (error) {
          console.error('Error finishing consultation:', error);
          message.error(getAContent('cmp_vetonest.com_ErrorFinishingConsultation') || 'Error finishing consultation');
        } finally {
          setFinishing(false);
        }
      }
    });
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  return (
    <ConsultationLayout 
      title={getAContent('cmp_vetonest.com_FLBx5ixGp5')}
      hideBookButton={true}
    >

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={getAContent('cmp_vetonest.com_SearchByPetName_Placeholder')}
          value={filterPet}
          onChange={(e) => setFilterPet(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder={getAContent('cmp_vetonest.com_FilterAllStatuses_Label')}
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationStatuses || []).map((s) => ({ value: s.id, label: s.nom }))}
        />
        <Select
          placeholder={getAContent('cmp_vetonest.com_FilterAllTypes_Label')}
          value={filterType}
          onChange={setFilterType}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationTypes || []).map((t) => ({ value: t.id, label: t.nom }))}
        />

        {pendingCount > 0 && (
          <Badge count={pendingCount} style={{ marginLeft: "auto" }}>
            <Tag color="blue" style={{ padding: "4px 10px", fontSize: "13px" }}>
              {pendingCount} {getAContent('cmp_vetonest.com_PendingRequests_Txt')}
            </Tag>
          </Badge>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
      ) : filteredAndSorted.length === 0 ? (
        <Empty description={getAContent('cmp_vetonest.com_NoAppointmentsFound_Txt')} style={{ marginTop: "60px" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAndSorted.map((c) => {
            const statusDisplay = getStatusDisplay(c);
            const isPendingStatus = isPending(c);
            const showVideoButton = shouldShowVideoButtonForVet(c);
            const videoReady = isVideoReadyForVet(c);
            
            return (
              <div
                key={c.id}
                onClick={() => openDrawer(c)}
                style={{
                  background: "#fff",
                  border: isPendingStatus ? "1px solid #91caff" : "1px solid #f0f0f0",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  boxShadow: isPendingStatus
                    ? "0 0 0 2px #e6f4ff"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                  flexWrap: "wrap",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = isPendingStatus ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)"}
              >
                <img
                  src={c.carnetAnimal?.picture ? base_url + 'uploads/files/pets/' + c.carnetAnimal.picture : "/img/user/1.jpg"}
                  alt={c.carnetAnimal?.nom}
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>
                    {c.carnetAnimal?.nom}
                    {c.symptom?.urgency && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#fff",
                        background: (() => {
                          const urgency = c.symptom.urgency.name || c.symptom.urgency;
                          if (urgency.toLowerCase().includes("emergency")) return "#d32f2f";
                          if (urgency.toLowerCase().includes("high")) return "#f57c00";
                          if (urgency.toLowerCase().includes("moderate")) return "#f9a825";
                          return "#388e3c";
                        })(),
                        borderRadius: "10px",
                        padding: "1px 8px",
                      }}>
                        {typeof c.symptom.urgency === 'object' ? c.symptom.urgency.name : c.symptom.urgency}
                      </span>
                    )}
                  </p>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {formatDateTime(c.startingDatetime, getAContent('cmp_vetonest.com_At_Prefix'), siteLocale)}
                    {c.consultationType && (
                      <span style={{ marginLeft: 10, color: "#aaa" }}>· {getAContent(TYPE_TAG[c.consultationType.id]) || c.consultationType.nom}</span>
                    )}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Video Consultation Button for Vet - LEFT */}
                  {/* Video Consultation Button for Vet */}

{showVideoButton && (
<VideoConsultationButton
  currentUserId={c.profileVeto?.userId}
  targetUserId={c.carnetAnimal?.profileUser?.userId}
  vetName={`${c.profileVeto?.prenom || ''} ${c.profileVeto?.nom || ''}`}
  ownerName={`${c.carnetAnimal?.profileUser?.prenom || ''} ${c.carnetAnimal?.profileUser?.nom || ''}`.trim() || 'Client'}
  buttonText={videoReady
    ? (getAContent('cmp_vetonest.com_JoinCall_Btn')          || 'Rejoindre')
    : (getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Consultation vidéo')}
  getAContent={getAContent}
  navigate={navigate}
  skipValidation={true}
  isInitiator={false}
/>
)}
                  
                  {/* Status Tag - RIGHT */}
                  <Tag color={statusDisplay.color}>
                    {getAContent(`cmp_vetonest.com_Status_${statusDisplay.key}_Txt`) || statusDisplay.text}
                  </Tag>
                </div>
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
          selected && isPending(selected) ? (
            <>
              <Button danger loading={declining} onClick={handleDecline}>
                {getAContent('cmp_vetonest.com_Decline_Btn') || 'Decline'}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={accepting}
                onClick={handleAccept}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                {getAContent('cmp_vetonest.com_AcceptAppointment_Btn') || 'Accept'}
              </Button>
            </>
          ) : selected && isFinishable(selected) ? (            
            <Button 
              type="primary"
              loading={finishing}
              onClick={() => handleFinish(selected)}
            >
              {getAContent('cmp_vetonest.com_Finish_Btn') || 'Finish'}
            </Button>
          ) : null
        }
      />

    </ConsultationLayout>
  );
};

export default ConsultationListVet;