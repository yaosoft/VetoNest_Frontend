import React, { useState, useEffect, useContext } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Badge } from "antd";
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import ConsultationLayout from "../ConsultationLayout";
import ConsultationDetailDrawer from "../ConsultationDetailDrawer";

const { RangePicker } = DatePicker;

const statusColor = (nom = "") => {
  const s = nom.toLowerCase();
  if (s.includes("pending")) return "blue";
  if (s.includes("accepted")) return "green";
  if (s.includes("cancelled")) return "red";
  if (s.includes("completed")) return "purple";
  return "default";
};

const urgencyColor = (u = "") => {
  const s = u.toLowerCase();
  if (s.includes("emergency")) return "#d32f2f";
  if (s.includes("high")) return "#f57c00";
  if (s.includes("moderate")) return "#f9a825";
  return "#388e3c";
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

// ── Locale-aware date+time formatter ─────────────────────────────────────────
const formatDateTime = (dateStr, atLabel, locale = "en-GB") => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  const date = d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${date} ${atLabel} ${time}`;
};

const ConsultationListVet = () => {
  const { profileId } = useContext(AuthContext);
  const { base_url, allConsultationTypes, allConsultationStatuses, getVetConsultationList, consultationAccept, consultationCancel, consultationFinish, postNotification, getAContent, siteLocale, sendEmail, siteURL, siteName, siteDomain, siteEmail } = useContext(SiteContext);

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Add missing filter states
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

  const pendingCount = consultations.filter(
    (c) => c.consultationStatus?.nom?.toLowerCase().includes("pending")
  ).length;

  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const rep = await consultationAccept(selected.id);
      if (rep?.success) {
        // Notify pet owner — type 6 = appointment accepted
        try {
          const petOwnerUserId = selected.carnetAnimal?.userId;
          if (petOwnerUserId) await postNotification({ notificationTypeId: 6, receiverId: petOwnerUserId });
        } catch {
          console.warn("Accept notification failed — status still updated");
        }
        // Send email to pet owner
        try {
          const ownerEmail = rep?.ownerEmail ?? selected.carnetAnimal?.ownerEmail;
          if (ownerEmail) {
            await sendEmail({
              to_email:         ownerEmail,
              to_domain:        siteDomain,
              subject:          `Consultation confirmed — ${siteName}`,
              siteURL,
              siteName,
              siteDomain,
              siteEmail,
              emailTemplate:    'consultation_accepted',
              vetName:          `${selected.profileVeto?.prenom ?? ''} ${selected.profileVeto?.nom ?? ''}`.trim(),
              ownerName:        `${selected.carnetAnimal?.ownerPrenom ?? ''} ${selected.carnetAnimal?.ownerNom ?? ''}`.trim(),
              petName:          selected.carnetAnimal?.nom ?? '',
              consultationDate: selected.startingDatetime ? selected.startingDatetime.split(' ')[0] : '',
              consultationTime: selected.startingDatetime ? selected.startingDatetime.split(' ')[1] : '',
            });
          }
        } catch {
          console.warn("Accept email failed — status still updated");
        }
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? getAContent('cmp_vetonest.com_CouldNotAcceptConsultation_Txt'));
      }
    } finally {
      setAccepting(false);
    }
  };

  const [declining, setDeclining] = useState(false);

  const handleDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        // Notify pet owner — type 5 = appointment declined
        try {
          const petOwnerUserId = selected.carnetAnimal?.userId;
          if (petOwnerUserId) await postNotification({ notificationTypeId: 5, receiverId: petOwnerUserId });
        } catch {
          console.warn("Decline notification failed — status still updated");
        }
        // Send email to pet owner
        try {
          const ownerEmail = rep?.ownerEmail ?? selected.carnetAnimal?.ownerEmail;
          if (ownerEmail) {
            await sendEmail({
              to_email:         ownerEmail,
              to_domain:        siteDomain,
              subject:          `Consultation update — ${siteName}`,
              siteURL,
              siteName,
              siteDomain,
              siteEmail,
              emailTemplate:    'consultation_refused',
              vetName:          `${selected.profileVeto?.prenom ?? ''} ${selected.profileVeto?.nom ?? ''}`.trim(),
              ownerName:        `${selected.carnetAnimal?.ownerPrenom ?? ''} ${selected.carnetAnimal?.ownerNom ?? ''}`.trim(),
              petName:          selected.carnetAnimal?.nom ?? '',
              consultationDate: selected.startingDatetime ? selected.startingDatetime.split(' ')[0] : '',
              consultationTime: selected.startingDatetime ? selected.startingDatetime.split(' ')[1] : '',
            });
          }
        } catch {
          console.warn("Decline email failed — status still updated");
        }
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? getAContent('cmp_vetonest.com_CouldNotDeclineConsultation_Txt'));
      }
    } finally {
      setDeclining(false);
    }
  };

  const isPending = (c) =>
    c?.consultationStatus?.nom?.toLowerCase().includes("pending");

  // Consultation date is past AND status is accepted (id=2)
  const isFinishable = (c) => {
    if (c?.consultationStatus?.id !== 2) return false;
    return dayjs(c.startingDatetime).isBefore(dayjs());
  };

  const [finishing, setFinishing] = useState(false);

  const handleFinish = async () => {
    if (!selected) return;
    setFinishing(true);
    try {
      const rep = await consultationFinish(selected.id);
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? getAContent('cmp_vetonest.com_CouldNotFinishConsultation_Txt'));
      }
    } finally {
      setFinishing(false);
    }
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  return (
    <ConsultationLayout title={getAContent('cmp_vetonest.com_FLBx5ixGp5')}>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={getAContent('cmp_vetonest.com_SearchByPetName_Placeholder')}
          value={filterPet}
          onChange={(e) => setFilterPet(e.target.value)}  // <-- Updated to handle filterPet
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
      ) : filtered.length === 0 ? (
        <Empty description={getAContent('cmp_vetonest.com_NoAppointmentsFound_Txt')} style={{ marginTop: "60px" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => openDrawer(c)}
              style={{
                background: "#fff",
                border: isPending(c) ? "1px solid #91caff" : "1px solid #f0f0f0",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
                boxShadow: isPending(c)
                  ? "0 0 0 2px #e6f4ff"
                  : "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = isPending(c) ? "0 0 0 2px #e6f4ff" : "0 1px 4px rgba(0,0,0,0.04)"}
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
                      background: urgencyColor(c.symptom.urgency),
                      borderRadius: "10px",
                      padding: "1px 8px",
                    }}>
                      {c.symptom.urgency}
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

              <Tag color={statusColor(c.consultationStatus?.nom ?? "")}>
                {c.consultationStatus ? getAContent(STATUS_TAG[c.consultationStatus.id]) || c.consultationStatus.nom : "—"}
              </Tag>
            </div>
          ))}
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
                {getAContent('cmp_vetonest.com_Decline_Btn')}
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={accepting}
                onClick={handleAccept}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                {getAContent('cmp_vetonest.com_AcceptAppointment_Btn')}
              </Button>
            </>
          ) : selected && isFinishable(selected) ? (
            <Button
              type="primary"
              loading={finishing}
              onClick={handleFinish}
              style={{ background: "#722ed1", borderColor: "#722ed1" }}
            >
              {getAContent('cmp_vetonest.com_MarkAsFinished_Btn') || '✓ Mark as finished'}
            </Button>
          ) : null
        }
      />

    </ConsultationLayout>
  );
};

export default ConsultationListVet;