import React, { useContext } from "react";
import { Drawer, Tag, Divider, Avatar, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
  if (s.includes("expired"))   return "volcano";
  return "default";
};

// ── Helper function to check if consultation is expired ──────────────────────
// ── Helper function to check if consultation is expired ──────────────────────
// ONLY for PENDING consultations (status ID 1)
const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  
  const statusId = consultation.consultationStatus?.id;
  // Only for PENDING (1) - NOT for accepted
  if (statusId !== 1) return false;
  
  let startDate;
  if (typeof consultation.startingDatetime === 'object' && consultation.startingDatetime.date) {
    startDate = new Date(consultation.startingDatetime.date);
  } else {
    startDate = new Date(consultation.startingDatetime);
  }
  
  const now = new Date();
  const minutesSinceStart = (now - startDate) / 1000 / 60;
  
  return minutesSinceStart > 60;
};

// ── Helper function to format dates from Symfony DateTime object ─────────────
const formatDate = (dateTimeData, siteLocale, atLabel) => {
  if (!dateTimeData) return "—";
  
  let date;
  
  // Handle the DateTime object format from Symfony
  if (typeof dateTimeData === 'object' && dateTimeData.date) {
    date = new Date(dateTimeData.date);
  } 
  // Handle string format
  else if (typeof dateTimeData === 'string') {
    date = new Date(dateTimeData.replace(" ", "T"));
  }
  // Handle timestamp or other formats
  else {
    date = new Date(dateTimeData);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateTimeData);
    return "—";
  }
  
  const formattedDate = date.toLocaleDateString(siteLocale || "en-GB", { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
  const time = date.toLocaleTimeString(siteLocale || "en-GB", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
  return `${formattedDate} ${atLabel} ${time}`;
};

const ConsultationDetailDrawer = ({ consultation, open, onClose, extraActions }) => {
  const { base_url, siteLocale, getAContent, truncateString, photoAnimalDefaultSrc } = useContext(SiteContext);
  
  const Row = ({ label, value }) => value ? (
    <div style={{ marginBottom: "10px", fontSize: "14px" }}>
      <span style={{ color: "#888", minWidth: "160px", display: "inline-block" }}>
        {getAContent('cmp_vetonest.com_' + label + '_Label') || label}:
      </span>
      <span style={{ color: "#222", fontWeight: 500 }}>{value}</span>
    </div>
  ) : null;

  if (!consultation) return null;

  const { profileVeto, carnetAnimal, consultationType, consultationStatus,
          etablissement, symptom, startingDatetime, creationDate, description } = consultation;
  
  const atLabel = getAContent('cmp_vetonest.com_At_Prefix') || 'at';
  const formattedStartDate = formatDate(startingDatetime, siteLocale, atLabel);
  const formattedCreationDate = formatDate(creationDate, siteLocale, atLabel);
  
  // Check if consultation is expired
  const expired = isExpired(consultation);
  
  // Get status display text
  const getStatusDisplayText = () => {
    if (expired) return 'Expired';
    if (consultationStatus?.nom) return consultationStatus.nom;
    return '—';
  };
  
  // Get status color
  const getStatusColorValue = () => {
    if (expired) return 'volcano';
    return statusColor(consultationStatus?.nom || '');
  };

  // Get full vet name with fallback and truncate to 20 characters
  const getFullVetName = () => {
    if (!profileVeto) return '';
    const prenom = profileVeto.prenom || '';
    const nom = profileVeto.nom || '';
    if (!prenom && !nom) return 'Veterinarian';
    const fullName = `${prenom} ${nom}`.trim();
    return truncateString(fullName, 20);
  };

  // Get vet picture URL
  const getVetPictureUrl = () => {
    if (!profileVeto) return null;
    if (profileVeto.picture && profileVeto.picture !== '') {
      let baseUrl = base_url;
      if (!baseUrl.endsWith('/')) {
        baseUrl = baseUrl + '/';
      }
      let picturePath = profileVeto.picture;
      if (picturePath.startsWith('/')) {
        picturePath = picturePath.substring(1);
      }
      return `${baseUrl}uploads/files/profile/${picturePath}`;
    }
    return null;
  };

  // Get pet picture URL
  const getPetPictureUrl = () => {
    if (!carnetAnimal) return null;
    if (carnetAnimal.picture && carnetAnimal.picture !== '') {
      let baseUrl = base_url;
      if (!baseUrl.endsWith('/')) {
        baseUrl = baseUrl + '/';
      }
      let picturePath = carnetAnimal.picture;
      if (picturePath.startsWith('/')) {
        picturePath = picturePath.substring(1);
      }
      return `${baseUrl}uploads/files/pets/${picturePath}`;
    }
    return null;
  };

  // Get full pet owner name with truncate to 20 characters
  const getPetOwnerName = () => {
    if (!carnetAnimal?.profileUser) return '';
    const prenom = carnetAnimal.profileUser.prenom || '';
    const nom = carnetAnimal.profileUser.nom || '';
    if (!prenom && !nom) return 'Pet Owner';
    const fullName = `${prenom} ${nom}`.trim();
    return truncateString(fullName, 20);
  };

  // Get pet name with truncate to 20 characters
  const getPetName = () => {
    if (!carnetAnimal) return '';
    const petName = carnetAnimal.nom || '';
    return truncateString(petName, 20);
  };

  const vetPictureUrl = getVetPictureUrl();
  const petPictureUrl = getPetPictureUrl();
  const fullVetName = getFullVetName();
  const fullVetNameTooltip = () => {
    if (!profileVeto) return '';
    const prenom = profileVeto.prenom || '';
    const nom = profileVeto.nom || '';
    return `${prenom} ${nom}`.trim();
  };
  const petOwnerName = getPetOwnerName();
  const petName = getPetName();
  const petFullName = carnetAnimal?.nom || '';

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>
            {getAContent('cmp_vetonest.com_ConsultationDetails_Title') || 'Consultation Details'}
          </span>
          <Tag color={getStatusColorValue()} style={{ margin: 0 }}>
            {getAContent(`cmp_vetonest.com_Status_${getStatusDisplayText()}_Txt`) || getStatusDisplayText()}
          </Tag>
          {expired && (
            <Tag icon={<ClockCircleOutlined />} color="volcano" style={{ margin: 0 }}>
              {getAContent('cmp_vetonest.com_ConsultationExpired_Label') || 'Consultation window has passed'}
            </Tag>
          )}
        </div>
      }
      placement="right"
      width={480}
      onClose={onClose}
      open={open}
      footer={extraActions && !expired ? (
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {extraActions}
        </div>
      ) : expired ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <span style={{ color: "#999", fontSize: "13px" }}>
            {getAContent('cmp_vetonest.com_ExpiredConsultationFooter_Txt') || 'This consultation can no longer be modified.'}
          </span>
        </div>
      ) : null}
    >

      {/* ── Vet & pet header ── */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
        {/* Vet */}
        {profileVeto && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <Avatar
              src={vetPictureUrl}
              icon={!vetPictureUrl && <UserOutlined />}
              size={48}
              style={{ flexShrink: 0 }}
            />
            <div>
              <Tooltip title={fullVetNameTooltip()} placement="top">
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
                  Dr. {fullVetName}
                </p>
              </Tooltip>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                {getAContent('cmp_vetonest.com_Veterinarian_Label') || 'Veterinarian'}
              </p>
            </div>
          </div>
        )}

        {/* Pet */}
        {carnetAnimal && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <Avatar
              src={petPictureUrl || photoAnimalDefaultSrc}
              size={48}
              style={{ flexShrink: 0 }}
            />
            <div>
              <Tooltip title={petFullName} placement="top">
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>{petName}</p>
              </Tooltip>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                {getAContent('cmp_vetonest.com_Pet_Label') || 'Pet'}
                {petOwnerName && (
                  <Tooltip title={petOwnerName} placement="top">
                    <span> · {petOwnerName}</span>
                  </Tooltip>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* ── Appointment info ── */}
      <Row label="DateTime" value={formattedStartDate} />
      <Row label="ConsultationType" value={consultationType?.tagRef ? getAContent(consultationType.tagRef) : consultationType?.nom} />
      <Row label="Clinic" value={etablissement?.nom} />
      <Row label="RequestedOn" value={formattedCreationDate} />
      {description && <Row label="Description" value={description} />}

      {/* ── Symptom report ── */}
      {symptom && (
        <>
          <Divider style={{ margin: "16px 0 12px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>
              {getAContent('cmp_vetonest.com_SymptomReport_Label') || 'Symptom Report'}
            </span>
          </Divider>

          {symptom.primaryComplaint && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "#444" }}>
              <strong>{getAContent('cmp_vetonest.com_Complaint_Label') || 'Primary Complaint'}:</strong> {symptom.primaryComplaint}
            </div>
          )}

          {symptom.urgency && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>
                {getAContent('cmp_vetonest.com_Urgency_Label') || 'Urgency'}:
              </span>{" "}
              <Tag color={urgencyColor(symptom.urgency.name)}>
                {symptom.urgency.tagRef ? getAContent(symptom.urgency.tagRef) || symptom.urgency.name : symptom.urgency.name}
              </Tag>
            </div>
          )}

          {symptom.detectedSymptoms && symptom.detectedSymptoms.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", color: "#888", fontSize: "13px" }}>
                {getAContent('cmp_vetonest.com_DetectedSymptoms_Label') || 'Detected Symptoms'}:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {symptom.detectedSymptoms.map((s, i) => (
                  <Tag key={i} color="blue">{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {symptom.followUpAnswers && Object.keys(symptom.followUpAnswers).length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ margin: "0 0 8px", color: "#888", fontSize: "13px" }}>
                {getAContent('cmp_vetonest.com_FollowUpAnswers_Label') || 'Follow-up Answers'}:
              </p>
              {Object.entries(symptom.followUpAnswers).map(([q, a], i) => (
                <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#555" }}>
                    {getAContent('cmp_vetonest.com_Question_Short') || 'Q'} {q}:
                  </span><br />
                  <span style={{ color: "#222", fontWeight: 500 }}>
                    {getAContent('cmp_vetonest.com_Answer_Short') || 'A'} {Array.isArray(a) ? a.join(", ") : a}
                  </span>
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