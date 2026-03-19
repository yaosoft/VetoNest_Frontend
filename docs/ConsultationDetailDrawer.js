import React, { useContext } from "react";
import { Drawer, Tag, Divider } from "antd";
import { SiteContext } from "../context/site";
import dayjs from "dayjs";

// ── Urgency colour ────────────────────────────────────────────────────────────
const urgencyColor = (u = "") => {
  const s = u.toLowerCase();
  if (s.includes("emergency")) return "red";
  if (s.includes("high"))      return "orange";
  if (s.includes("moderate"))  return "gold";
  return "green";
};

// ── Status colour ─────────────────────────────────────────────────────────────
const statusColor = (nom = "") => {
  const s = nom.toLowerCase();
  if (s.includes("pending"))   return "blue";
  if (s.includes("accepted"))  return "green";
  if (s.includes("cancelled")) return "red";
  if (s.includes("completed")) return "purple";
  return "default";
};

const Row = ({ label, value }) => value ? (
  <div style={{ marginBottom: "10px", fontSize: "14px" }}>
    <span style={{ color: "#888", minWidth: "160px", display: "inline-block" }}>{label}:</span>
    <span style={{ color: "#222", fontWeight: 500 }}>{value}</span>
  </div>
) : null;

const ConsultationDetailDrawer = ({ consultation, open, onClose, extraActions }) => {
  const { base_url } = useContext(SiteContext);

  if (!consultation) return null;

  const { profileVeto, carnetAnimal, consultationType, consultationStatus,
          etablissement, symptom, startingDatetime, creationDate, description } = consultation;

  const formatDt = (dt) => dt ? dayjs(dt).format("dddd D MMMM YYYY [at] HH:mm") : "—";

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Consultation details</span>
          {consultationStatus && (
            <Tag color={statusColor(consultationStatus.nom)} style={{ margin: 0 }}>
              {consultationStatus.nom}
            </Tag>
          )}
        </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={open}
      footer={extraActions && (
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {extraActions}
        </div>
      )}
    >

      {/* ── Vet & pet header ── */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
        {/* Vet */}
        {profileVeto && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <img
              src={profileVeto.picture || "/img/user/1.jpg"}
              alt={profileVeto.nom}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
                {profileVeto.prenom} {profileVeto.nom}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Veterinarian</p>
            </div>
          </div>
        )}

        {/* Pet */}
        {carnetAnimal && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <img
              src={carnetAnimal.picture || "/img/user/1.jpg"}
              alt={carnetAnimal.nom}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>{carnetAnimal.nom}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Pet</p>
            </div>
          </div>
        )}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* ── Appointment info ── */}
      <Row label="Date & time"        value={formatDt(startingDatetime)} />
      <Row label="Consultation type"  value={consultationType?.nom} />
      <Row label="Clinic"             value={etablissement?.nom} />
      <Row label="Requested on"       value={formatDt(creationDate)} />
      {description && <Row label="Description" value={description} />}

      {/* ── Symptom report ── */}
      {symptom && (
        <>
          <Divider style={{ margin: "16px 0 12px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>🩺 Symptom report</span>
          </Divider>

          {symptom.primaryComplaint && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "#444" }}>
              <strong>Complaint:</strong> {symptom.primaryComplaint}
            </div>
          )}

          {symptom.urgency && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>Urgency: </span>
              <Tag color={urgencyColor(symptom.urgency)}>{symptom.urgency}</Tag>
            </div>
          )}

          {symptom.detectedSymptoms?.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", color: "#888", fontSize: "13px" }}>Detected symptoms:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {symptom.detectedSymptoms.map((s, i) => (
                  <Tag key={i} color="blue">{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {symptom.followUpAnswers && Object.keys(symptom.followUpAnswers).length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ margin: "0 0 8px", color: "#888", fontSize: "13px" }}>Follow-up answers:</p>
              {Object.entries(symptom.followUpAnswers).map(([q, a], i) => (
                <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#555" }}>Q: {q}</span><br />
                  <span style={{ color: "#222", fontWeight: 500 }}>A: {Array.isArray(a) ? a.join(", ") : a}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </Drawer>
  );
};

export default ConsultationDetailDrawer;
