import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Badge, Modal, message } from "antd";
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";
import VideoConsultationButton from "../VideoConsultationButton";
import io from "socket.io-client";

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
const isReadyToJoin = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  let startDate = dayjs(consultation.startingDatetime.date || consultation.startingDatetime);
  const minutesUntil = startDate.diff(dayjs(), "minute");
  return minutesUntil <= 5 && minutesUntil >= 0;
};

const isInProgress = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false;
  let startDate = dayjs(consultation.startingDatetime.date || consultation.startingDatetime);
  const minutesSinceStart = dayjs().diff(startDate, "minute");
  return minutesSinceStart >= 0;
};

const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 1) return false;
  let startDate = dayjs(consultation.startingDatetime.date || consultation.startingDatetime);
  const minutesSinceStart = dayjs().diff(startDate, "minute");
  return minutesSinceStart > 60;
};

const isCompleted = (consultation) => consultation.consultationStatus?.id === 4;
const isCancelled = (consultation) => consultation.consultationStatus?.id === 5;

const getStatusDisplay = (consultation) => {
  if (!consultation || !consultation.consultationStatus) {
    return { text: "—", color: "default", key: "Unknown" };
  }
  const statusId = consultation.consultationStatus.id;
  if (isExpired(consultation)) return { text: "Expired", color: "volcano", key: "Expired" };
  if (isCompleted(consultation)) return { text: "Completed", color: "purple", key: "Completed" };
  if (isCancelled(consultation)) return { text: "Cancelled", color: "red", key: "Cancelled" };
  if (isInProgress(consultation)) return { text: "In Progress", color: "orange", key: "InProgress" };
  if (isReadyToJoin(consultation)) return { text: "Ready to Join", color: "green", key: "ReadyToJoin" };
  if (statusId === 1) return { text: "Pending", color: "blue", key: "Pending" };
  if (statusId === 2) return { text: "Accepted", color: "green", key: "Accepted" };
  return { text: consultation.consultationStatus.nom || "—", color: "default", key: "Unknown" };
};

const isPending = (consultation) => consultation.consultationStatus?.id === 1 && !isExpired(consultation);
const shouldShowVideoButtonForVet = (consultation) => consultation.consultationType?.id === 1 && consultation.consultationStatus?.id === 2;
const isVideoReadyForVet = (consultation) => {
  if (!shouldShowVideoButtonForVet(consultation)) return false;
  let startDate = dayjs(consultation.startingDatetime.date || consultation.startingDatetime);
  return startDate.diff(dayjs(), "minute") <= 5;
};
const isFinishable = (consultation) => consultation.consultationStatus?.id === 2 && !isExpired(consultation) && dayjs(consultation.startingDatetime).isBefore(dayjs());
const isAboutToStart = (startingDatetime) => {
  if (!startingDatetime) return false;
  let start = dayjs(startingDatetime.date || startingDatetime);
  let minutesUntil = start.diff(dayjs(), "minute");
  return minutesUntil > 0 && minutesUntil <= 5;
};

const sortConsultations = (consultations) => {
  return [...consultations].sort((a, b) => {
    const getPriority = (c) => {
      if (isPending(c)) return 1;
      if (isInProgress(c)) return 2;
      if (isExpired(c)) return 3;
      if (isCompleted(c)) return 4;
      if (isCancelled(c)) return 5;
      return 6;
    };
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    const aDate = dayjs(a.startingDatetime.date || a.startingDatetime);
    const bDate = dayjs(b.startingDatetime.date || b.startingDatetime);
    if (isPending(a) && isPending(b)) return aDate.isBefore(bDate) ? -1 : 1;
    return bDate.isBefore(aDate) ? -1 : 1;
  });
};

// ── Component ────────────────────────────────────────────────────────────────
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
  } = useContext(SiteContext);

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
  const [filterDates, setFilterDates] = useState(null);

  // ── Persistent socket (completely separate from useVideoConsultation) ──
  const vetSocketRef = useRef(null);

  useEffect(() => {
    const url = process.env.REACT_APP_SIGNALING_URL || "http://localhost:5000";
    const socket = io(url, { transports: ["websocket", "polling"] });
    vetSocketRef.current = socket;

    socket.on("connect", () => {
      console.log("Vet persistent socket connected, registering userId:", user?.userId);
      if (user?.userId) {
        socket.emit("register", { userId: String(user.userId) });
      }
    });

	socket.on('call-ended', ({ from }) => {
	  message.info('The other party has ended the call.');
	});

    return () => {
      socket.disconnect();
      vetSocketRef.current = null;
    };
  }, []);

  // Re-register if user ID changes
  useEffect(() => {
    const socket = vetSocketRef.current;
    if (socket && socket.connected && user?.userId) {
      socket.emit("register", { userId: String(user.userId) });
    }
  }, [user?.userId]);

  // ── Emit call request (with a 700ms delay to ensure pet owner's socket is ready) ──
  const emitCallRequest = (petOwnerId, vetName) => {
    if (!petOwnerId) {
      console.error("emitCallRequest called with undefined petOwnerId");
      return;
    }
    const socket = vetSocketRef.current;
    if (!socket || !socket.connected) {
      console.warn("Vet persistent socket not connected, cannot emit call request");
      message.warning("Connexion au serveur de signalisation en cours, veuillez réessayer");
      return;
    }
    // Add a safety delay to allow the pet owner's socket registration to settle
    setTimeout(() => {
      console.log(`📞 Emitting vet-call-started to ${petOwnerId} (${vetName})`);
      socket.emit("vet-call-started", {
        to: String(petOwnerId),
        from: String(user?.userId),
        vetName,
      });
    }, 700);
  };

  // ── Data fetching ────────────────────────────────────────────────────────
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
  useEffect(() => {
    if (profileId) fetchConsultations();
  }, [profileId]);

  const filteredAndSorted = useMemo(() => {
    const filtered = consultations.filter((c) => {
      if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
      if (filterType && c.consultationType?.id !== filterType) return false;
      if (filterPet) {
        const name = (c.carnetAnimal?.nom ?? "").toLowerCase();
        if (!name.includes(filterPet.toLowerCase())) return false;
      }
      if (filterDates?.[0] && filterDates?.[1]) {
        const dt = dayjs(c.startingDatetime.date || c.startingDatetime);
        if (dt.isBefore(filterDates[0], "day") || dt.isAfter(filterDates[1], "day")) return false;
      }
      return true;
    });
    return sortConsultations(filtered);
  }, [consultations, filterStatus, filterType, filterPet, filterDates]);

  const pendingCount = consultations.filter((c) => c.consultationStatus?.id === 1 && !isExpired(c)).length;

  // ── Action handlers ──────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const rep = await consultationAccept(selected.id);
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
        message.success(getAContent("cmp_vetonest.com_ConsultationAccepted_Txt") || "Consultation accepted");
      } else {
        message.error(rep?.message || getAContent("cmp_vetonest.com_CouldNotAcceptConsultation_Txt") || "Could not accept");
      }
    } catch (error) {
      console.error(error);
      message.error(getAContent("cmp_vetonest.com_CouldNotAcceptConsultation_Txt") || "Could not accept");
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
        message.success(getAContent("cmp_vetonest.com_ConsultationDeclined_Txt") || "Consultation declined");
      } else {
        message.error(rep?.message || getAContent("cmp_vetonest.com_CouldNotDeclineConsultation_Txt") || "Could not decline");
      }
    } catch (error) {
      console.error(error);
      message.error(getAContent("cmp_vetonest.com_CouldNotDeclineConsultation_Txt") || "Could not decline");
    } finally {
      setDeclining(false);
    }
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
            message.success(getAContent("cmp_vetonest.com_ConsultationFinished_Txt") || "Finished");
            setDrawerOpen(false);
            fetchConsultations();
          } else throw new Error(result?.message || "Finish failed");
        } catch (error) {
          console.error(error);
          message.error(getAContent("cmp_vetonest.com_ErrorFinishingConsultation") || "Error finishing");
        } finally {
          setFinishing(false);
        }
      },
    });
  };

  const openDrawer = (c) => {
    setSelected(c);
    setDrawerOpen(true);
  };

  return (
    <ConsultationLayout title={getAContent("cmp_vetonest.com_FLBx5ixGp5")} hideBookButton={true}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={getAContent("cmp_vetonest.com_SearchByPetName_Placeholder")}
          value={filterPet}
          onChange={(e) => setFilterPet(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder={getAContent("cmp_vetonest.com_FilterAllStatuses_Label")}
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationStatuses || []).map((s) => ({ value: s.id, label: s.nom }))}
        />
        <Select
          placeholder={getAContent("cmp_vetonest.com_FilterAllTypes_Label")}
          value={filterType}
          onChange={setFilterType}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationTypes || []).map((t) => ({ value: t.id, label: t.nom }))}
        />
        {pendingCount > 0 && (
          <Badge count={pendingCount} style={{ marginLeft: "auto" }}>
            <Tag color="blue" style={{ padding: "4px 10px", fontSize: "13px" }}>
              {pendingCount} {getAContent("cmp_vetonest.com_PendingRequests_Txt")}
            </Tag>
          </Badge>
        )}
      </div>

      {/* Consultation list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
      ) : filteredAndSorted.length === 0 ? (
        <Empty description={getAContent("cmp_vetonest.com_NoAppointmentsFound_Txt")} style={{ marginTop: "60px" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAndSorted.map((c) => {
            const statusDisplay = getStatusDisplay(c);
            const isPendingStatus = isPending(c);
            const showVideoButton = shouldShowVideoButtonForVet(c);
            const videoReady = isVideoReadyForVet(c);
            const aboutToStart = isAboutToStart(c.startingDatetime);
            const petOwnerId = c.carnetAnimal?.profileUser?.userId;
            const vetDisplayName = `${c.profileVeto?.prenom || ""} ${c.profileVeto?.nom || ""}`.trim();

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
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  boxShadow: isPendingStatus ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = isPendingStatus ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)")
                }
              >
                {aboutToStart && (
                  <div
                    style={{
                      backgroundColor: "#fff7e6",
                      borderLeft: "4px solid #faad14",
                      padding: "8px 12px",
                      marginBottom: "12px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>🔔</span>
                    <span>
                      {getAContent("cmp_vetonest.com_ConsultationStartsSoon_Txt", "La consultation commence dans quelques minutes. Préparez-vous !")}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <img
                    src={
                      c.carnetAnimal?.picture
                        ? base_url + "uploads/files/pets/" + c.carnetAnimal.picture
                        : "/img/user/1.jpg"
                    }
                    alt={c.carnetAnimal?.nom}
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>
                      {c.carnetAnimal?.nom}
                      {c.symptom?.urgency && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#fff",
                            background: "#f57c00",
                            borderRadius: "10px",
                            padding: "1px 8px",
                          }}
                        >
                          {typeof c.symptom.urgency === "object" ? c.symptom.urgency.name : c.symptom.urgency}
                        </span>
                      )}
                    </p>
                    <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {formatDateTime(c.startingDatetime, getAContent("cmp_vetonest.com_At_Prefix"), siteLocale)}
                      {c.consultationType && (
                        <span style={{ marginLeft: 10, color: "#aaa" }}>
                          · {getAContent(TYPE_TAG[c.consultationType.id]) || c.consultationType.nom}
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    {showVideoButton && (
                      <VideoConsultationButton
                        currentUserId={user?.userId}
                        targetUserId={petOwnerId}
                        vetName={vetDisplayName}
                        ownerName={`${c.carnetAnimal?.profileUser?.prenom || ""} ${
                          c.carnetAnimal?.profileUser?.nom || ""
                        }`.trim()}
                        buttonText={
                          videoReady
                            ? getAContent("cmp_vetonest.com_StartVideoCall_Btn") || "Rejoindre"
                            : getAContent("cmp_vetonest.com_VideoConsultation_Btn") || "Consultation vidéo"
                        }
                        getAContent={getAContent}
                        navigate={navigate}
                        skipValidation={true}
                        isInitiator={false}
                        onAfterInit={() => {
                          if (petOwnerId) {
                            emitCallRequest(petOwnerId, vetDisplayName);
                          } else {
                            console.error("petOwnerId missing for consultation", c.id);
                          }
                        }}
						consultationId={c.id}
                      />
                    )}
                    <Tag color={statusDisplay.color}>
                      {getAContent(`cmp_vetonest.com_Status_${statusDisplay.key}_Txt`) || statusDisplay.text}
                    </Tag>
                  </div>
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
                {getAContent("cmp_vetonest.com_Decline_Btn") || "Decline"}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={accepting}
                onClick={handleAccept}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                {getAContent("cmp_vetonest.com_AcceptAppointment_Btn") || "Accept"}
              </Button>
            </>
          ) : selected && isFinishable(selected) ? (
            <Button type="primary" loading={finishing} onClick={() => handleFinish(selected)}>
              {getAContent("cmp_vetonest.com_Finish_Btn") || "Finish"}
            </Button>
          ) : null
        }
      />
    </ConsultationLayout>
  );
};

export default ConsultationListVet;