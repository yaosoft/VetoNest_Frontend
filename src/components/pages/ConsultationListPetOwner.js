import React, { useState, useEffect, useContext } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Rate, Drawer } from "antd";
import { SearchOutlined, CalendarOutlined, PlusOutlined, StarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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

const ConsultationListPetOwner = () => {
  const { profileId } = useContext(AuthContext);
  const { base_api_url, allConsultationTypes, allConsultationStatuses, consultationCancel, getPetOwnerConsultationList, base_url, getAContent, siteLocale, saveRating, saveComment } = useContext(SiteContext);
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');
  
  // Define filterVet
  const [filterVet, setFilterVet] = useState("");  // This line was missing
  
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDates, setFilterDates] = useState(null);

  const fetchConsultations = async (statusId = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ profileId });
      if (statusId) params.append("statusId", statusId);
      const rep = await getPetOwnerConsultationList(profileId);
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

  const filtered = consultations.filter((c) => {
    if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
    if (filterType && c.consultationType?.id !== filterType) return false;
    if (filterVet) {
      const name = `${c.profileVeto?.prenom ?? ""} ${c.profileVeto?.nom ?? ""}`.toLowerCase();
      if (!name.includes(filterVet.toLowerCase())) return false;
    }
    if (filterDates?.[0] && filterDates?.[1]) {
      const dt = dayjs(c.startingDatetime);
      if (dt.isBefore(filterDates[0], "day") || dt.isAfter(filterDates[1], "day")) return false;
    }
    return true;
  });

  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const rep = await consultationCancel(selected.id);
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? getAContent('cmp_vetonest.com_CancelConsultation_Btn'));
      }
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (c) => {
    if (!c?.startingDatetime) return false;
    const status = c.consultationStatus?.nom?.toLowerCase() ?? "";
    if (status === "cancelled" || status === "completed") return false;
    const diff = dayjs(c.startingDatetime).diff(dayjs(), "minute");
    return diff > 60;
  };

  // Date is past AND status is not pending(1) or cancelled(5)
  const isFinished = (c) => {
    const statusId = c?.consultationStatus?.id;
    if (statusId === 1 || statusId === 5) return false;
    return dayjs(c?.startingDatetime).isBefore(dayjs());
  };

  // ── Rate & Comment drawer ─────────────────────────────────────────────────
  const [rateDrawerOpen, setRateDrawerOpen]       = useState(false);
  const [ratingConsultation, setRatingConsultation] = useState(null);
  const [ratingValue, setRatingValue]             = useState(0);
  const [commentValue, setCommentValue]           = useState('');
  const [submitting, setSubmitting]               = useState(false);

  const openRateDrawer = (c, e) => {
    e.stopPropagation();
    setRatingConsultation(c);
    setRatingValue(0);
    setCommentValue('');
    setRateDrawerOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingConsultation) return;
    setSubmitting(true);
    try {
      if (ratingValue > 0) {
        await saveRating({
          consultationId: ratingConsultation.id,
          profileVetoId:  ratingConsultation.profileVeto?.id,
          rating:         ratingValue,
        });
      }
      if (commentValue.trim()) {
        await saveComment({
          consultationId: ratingConsultation.id,
          profileVetoId:  ratingConsultation.profileVeto?.id,
          comment:        commentValue.trim(),
        });
      }
      setRateDrawerOpen(false);
      fetchConsultations();
    } finally {
      setSubmitting(false);
    }
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

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
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => openDrawer(c)}
              style={{
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
            >
              <img
                src={c.carnetAnimal.picture ? base_url + 'uploads/files/pets/' + c.carnetAnimal.picture : photoDefaultSrc}
                alt={c.carnetAnimal.nom}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
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

              <Tag color={statusColor(c.consultationStatus?.nom ?? "")}>
                {c.consultationStatus ? getAContent(STATUS_TAG[c.consultationStatus.id]) || c.consultationStatus.nom : "—"}
              </Tag>
              {isFinished(c) && (
                <Button
                  size="small"
                  icon={<StarOutlined />}
                  onClick={(e) => openRateDrawer(c, e)}
                  style={{ marginLeft: 4, borderColor: "#faad14", color: "#faad14" }}
                >
                  {getAContent('cmp_vetonest.com_RateAndComment_Btn') || 'Rate'}
                </Button>
              )}
            </div>
          ))}
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

      {/* ── Rate & Comment drawer ── */}
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
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>
            {getAContent('cmp_vetonest.com_YourRating_Label') || 'Your rating'}
          </p>
          <Rate value={ratingValue} onChange={setRatingValue} style={{ fontSize: "28px" }} />
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
      </Drawer>

    </ConsultationLayout>
  );
};

export default ConsultationListPetOwner;