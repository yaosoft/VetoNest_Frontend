import React, { useContext } from "react";
import { Drawer, Tag, Divider } from "antd";
import { SiteContext } from "../context/site";

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



const ConsultationDetailDrawer = ({ consultation, open, onClose, extraActions }) => {
  const { base_url, siteLocale, getAContent } = useContext(SiteContext);
  
  const Row = ({ label, value }) => value ? (
	  <div style={{ marginBottom: "10px", fontSize: "14px" }}>
		<span style={{ color: "#888", minWidth: "160px", display: "inline-block" }}>{getAContent('cmp_vetonest.com_' + label + '_Label')}:</span>
		<span style={{ color: "#222", fontWeight: 500 }}>{value}</span>
	  </div>
	) : null;

  if (!consultation) return null;

  const { profileVeto, carnetAnimal, consultationType, consultationStatus,
          etablissement, symptom, startingDatetime, creationDate, description } = consultation;
console.log( 'ccccccccc consultationType', consultationType );
  const formatDt = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt.replace(" ", "T"));
    const date = d.toLocaleDateString(siteLocale || "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const time = d.toLocaleTimeString(siteLocale || "en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${getAContent('cmp_vetonest.com_At_Prefix')} ${time}`;
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>{getAContent('cmp_vetonest.com_ConsultationDetails_Title')}</span>
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
              src={profileVeto.picture ? base_url + 'uploads/files/profile/' + profileVeto.picture : "/img/user/1.jpg"}
              alt={profileVeto.nom}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
                {profileVeto.prenom} {profileVeto.nom}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{getAContent('cmp_vetonest.com_Veterinarian_Label')}</p>
            </div>
          </div>
        )}

        {/* Pet */}
        {carnetAnimal && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <img
              src={carnetAnimal.picture ? base_url + 'uploads/files/pets/' + carnetAnimal.picture : "/img/user/1.jpg"}
              alt={carnetAnimal.nom}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>{carnetAnimal.nom}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{getAContent('cmp_vetonest.com_Pet_Label')}</p>
            </div>
          </div>
        )}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* ── Appointment info ── */}
      <Row label="DateTime" value={formatDt(startingDatetime)} />
      <Row label="ConsultationType" value={ getAContent( consultationType.tagRef ) } />
      <Row label="Clinic" value={etablissement?.nom} />
      <Row label="RequestedOn" value={formatDt(creationDate)} />
      {description && <Row label="Description" value={description} />}

      {/* ── Symptom report ── */}
      {symptom && (
        <>
          <Divider style={{ margin: "16px 0 12px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>{getAContent('cmp_vetonest.com_SymptomReport_Label')}</span>
          </Divider>

          {symptom.primaryComplaint && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "#444" }}>
              <strong>{getAContent('cmp_vetonest.com_Complaint_Label')}:</strong> {symptom.primaryComplaint}
            </div>
          )}

          {symptom.urgency && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>{getAContent('cmp_vetonest.com_Urgency_Label')}: </span>
              <Tag color={urgencyColor(symptom.urgency)}>{symptom.urgency}</Tag>
            </div>
          )}

          {symptom.detectedSymptoms?.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", color: "#888", fontSize: "13px" }}>{getAContent('cmp_vetonest.com_DetectedSymptoms_Label')}:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {symptom.detectedSymptoms.map((s, i) => (
                  <Tag key={i} color="blue">{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {symptom.followUpAnswers && Object.keys(symptom.followUpAnswers).length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ margin: "0 0 8px", color: "#888", fontSize: "13px" }}>{getAContent('cmp_vetonest.com_FollowUpAnswers_Label')}:</p>
              {Object.entries(symptom.followUpAnswers).map(([q, a], i) => (
                <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#555" }}>{getAContent('cmp_vetonest.com_Question_Short')} {q}</span><br />
                  <span style={{ color: "#222", fontWeight: 500 }}>{getAContent('cmp_vetonest.com_Answer_Short')} {Array.isArray(a) ? a.join(", ") : a}</span>
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