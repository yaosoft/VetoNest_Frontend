import React, { useState, useEffect, useContext } from "react";
import { Select, DatePicker, Input, Button, Tag, Spin, Empty, Badge } from "antd";
import { SearchOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
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

const urgencyColor = (u = "") => {
  const s = u.toLowerCase();
  if (s.includes("emergency")) return "#d32f2f";
  if (s.includes("high"))      return "#f57c00";
  if (s.includes("moderate"))  return "#f9a825";
  return "#388e3c";
};

const ConsultationListVet = () => {
  const { profileId }                = useContext(AuthContext);
  const { base_api_url, fetchData, allConsultationTypes, allConsultationStatuses }
                                     = useContext(SiteContext);

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [accepting, setAccepting]         = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType]     = useState(null);
  const [filterPet, setFilterPet]       = useState("");
  const [filterDates, setFilterDates]   = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ profileVetoId: profileId });
      const url = `${base_api_url}consultation/list/vet?${params}`;
      const rep = await fetchData(url, null, "GET");
      if (rep?.success) setConsultations(rep.consultations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (profileId) fetchConsultations(); }, [profileId]);

  // ── Client-side filter ────────────────────────────────────────────────────
  const filtered = consultations.filter((c) => {
    if (filterStatus && c.consultationStatus?.id !== filterStatus) return false;
    if (filterType   && c.consultationType?.id  !== filterType)   return false;
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

  // Pending count for badge
  const pendingCount = consultations.filter(
    (c) => c.consultationStatus?.nom?.toLowerCase().includes("pending")
  ).length;

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!selected) return;
    setAccepting(true);
    try {
      const rep = await fetchData(
        `${base_api_url}consultation/accept`,
        { consultationId: selected.id },
        "POST"
      );
      if (rep?.success) {
        setDrawerOpen(false);
        fetchConsultations();
      } else {
        alert(rep?.message ?? "Could not accept consultation.");
      }
    } finally {
      setAccepting(false);
    }
  };

  const isPending = (c) =>
    c?.consultationStatus?.nom?.toLowerCase().includes("pending");

  const openDrawer = (c) => { setSelected(c); setDrawerOpen(true); };

  return (
    <ConsultationLayout title="My appointments">

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by pet name…"
          value={filterPet}
          onChange={(e) => setFilterPet(e.target.value)}
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
        {pendingCount > 0 && (
          <Badge count={pendingCount} style={{ marginLeft: "auto" }}>
            <Tag color="blue" style={{ padding: "4px 10px", fontSize: "13px" }}>
              {pendingCount} pending request{pendingCount > 1 ? "s" : ""}
            </Tag>
          </Badge>
        )}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty description="No appointments found" style={{ marginTop: "60px" }} />
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
                  {dayjs(c.startingDatetime).format("dddd D MMMM YYYY [at] HH:mm")}
                  {c.consultationType && (
                    <span style={{ marginLeft: 10, color: "#aaa" }}>· {c.consultationType.nom}</span>
                  )}
                </p>
                {c.symptom?.primaryComplaint && (
                  <p style={{ margin: 0, fontSize: "12px", color: "#aaa", fontStyle: "italic" }}>
                    "{c.symptom.primaryComplaint.slice(0, 80)}{c.symptom.primaryComplaint.length > 80 ? "…" : ""}"
                  </p>
                )}
              </div>

              {/* Status */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <Tag color={statusColor(c.consultationStatus?.nom ?? "")}>
                  {c.consultationStatus?.nom ?? "—"}
                </Tag>
                {isPending(c) && (
                  <span style={{ fontSize: "11px", color: "#1677ff" }}>
                    <CheckCircleOutlined /> Action needed
                  </span>
                )}
              </div>
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
          selected && isPending(selected) ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={accepting}
              onClick={handleAccept}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Accept appointment
            </Button>
          ) : null
        }
      />

    </ConsultationLayout>
  );
};

export default ConsultationListVet;
