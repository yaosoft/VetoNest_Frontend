import React, { useState, useEffect, useContext } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty } from "antd";
import { SearchOutlined, CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import ConsultationLayout from "./ConsultationLayout";
import ConsultationDetailDrawer from "./ConsultationDetailDrawer";

const { RangePicker } = DatePicker;

const statusColor = (nom = "") => {
  const s = nom.toLowerCase();
  if (s.includes("pending"))   return "blue";
  if (s.includes("accepted"))  return "green";
  if (s.includes("cancelled")) return "red";
  if (s.includes("completed")) return "purple";
  return "default";
};

const ConsultationListPetOwner = () => {
  const { userId }                    = useContext(AuthContext);
  const { base_api_url, fetchData, allConsultationTypes, allConsultationStatuses }
                                      = useContext(SiteContext);
  const navigate                      = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [cancelling, setCancelling]       = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus]     = useState(null);
  const [filterType, setFilterType]         = useState(null);
  const [filterVet, setFilterVet]           = useState("");
  const [filterDates, setFilterDates]       = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchConsultations = async (statusId = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId });
      if (statusId) params.append("statusId", statusId);
      const url = `${base_api_url}consultation/list/pet-owner?${params}`;
      const rep = await fetchData(url, null, "GET");
      if (rep?.success) setConsultations(rep.consultations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchConsultations(); }, [userId]);

  // ── Client-side filter ────────────────────────────────────────────────────
  const filtered = consultations.filter((c) => {
    if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
    if (filterType   && c.consultationType?.id  !== filterType)   return false;
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

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const rep = await fetchData(`${base_api_url}consultation/cancel`, { consultationId: selected.id }, "POST");
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? "Cannot cancel this consultation.");
      }
    } finally {
      setCancelling(false);
    }
  };

  // ── Can cancel? (> 1 hour away) ───────────────────────────────────────────
  const canCancel = (c) => {
    if (!c?.startingDatetime) return false;
    const status = c.consultationStatus?.nom?.toLowerCase() ?? "";
    if (status === "cancelled" || status === "completed") return false;
    const diff = dayjs(c.startingDatetime).diff(dayjs(), "minute");
    return diff > 60;
  };

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  return (
    <ConsultationLayout title="My consultations">

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by vet name…"
          value={filterVet}
          onChange={(e) => setFilterVet(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="All statuses"
          value={filterStatus}
          onChange={setFilterStatus}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationStatuses || []).map((s) => ({ value: s.id, label: s.nom }))}
        />
        <Select
          placeholder="All types"
          value={filterType}
          onChange={setFilterType}
          allowClear
          style={{ width: 160 }}
          options={(allConsultationTypes || []).map((t) => ({ value: t.id, label: t.nom }))}
        />
        <RangePicker
          value={filterDates}
          onChange={setFilterDates}
          format="DD/MM/YYYY"
        />
        <div style={{ marginLeft: "auto" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/consultation/creation")}
          >
            Book a consultation
          </Button>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description="No consultations found" style={{ marginTop: "60px" }} />
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
              {/* Pet photo */}
              <img
                src={c.carnetAnimal?.picture || "/img/user/1.jpg"}
                alt={c.carnetAnimal?.nom}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>
                  {c.carnetAnimal?.nom}
                  <span style={{ fontWeight: 400, color: "#888", fontSize: "13px" }}>
                    {" "}with Dr {c.profileVeto?.prenom} {c.profileVeto?.nom}
                  </span>
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(c.startingDatetime).format("dddd D MMMM YYYY [at] HH:mm")}
                  {c.consultationType && (
                    <span style={{ marginLeft: 10, color: "#aaa" }}>· {c.consultationType.nom}</span>
                  )}
                </p>
              </div>

              {/* Status */}
              <Tag color={statusColor(c.consultationStatus?.nom ?? "")}>
                {c.consultationStatus?.nom ?? "—"}
              </Tag>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail drawer ── */}
      <ConsultationDetailDrawer
        consultation={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extraActions={
          selected && canCancel(selected) ? (
            <Button danger loading={cancelling} onClick={handleCancel}>
              Cancel consultation
            </Button>
          ) : null
        }
      />

    </ConsultationLayout>
  );
};

export default ConsultationListPetOwner;
