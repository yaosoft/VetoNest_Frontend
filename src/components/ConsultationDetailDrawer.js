import React, { useContext } from "react";
import { Drawer, Tag, Divider, Avatar, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined as TimeOutlined } from '@ant-design/icons';
import { SiteContext } from "../context/site";
import VetName from "./VetName";

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
  if (s.includes("in progress")) return "orange";
  if (s.includes("cancelled")) return "red";
  if (s.includes("finished"))  return "purple";
  if (s.includes("completed")) return "purple";
  if (s.includes("expired"))   return "volcano";
  return "default";
};

// ── Helper function to check if consultation is expired ──────────────────────
const isExpired = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
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

// ── Helper function to format dates in the consultation's timezone ───────────
const formatDateInTimezone = (consultation, siteLocale, atLabel) => {
  if (!consultation?.startingDatetime) return "—";
  
  const timezone = consultation.timezone || 'UTC';
  
  let date;
  if (typeof consultation.startingDatetime === 'string') {
    if (consultation.startingDatetime.includes('T')) {
      date = new Date(consultation.startingDatetime);
    } else {
      date = new Date(consultation.startingDatetime + ' UTC');
    }
  } else if (consultation.startingDatetime?.date) {
    date = new Date(consultation.startingDatetime.date + ' UTC');
  } else {
    date = new Date(consultation.startingDatetime);
  }
  
  if (isNaN(date.getTime())) return "—";
  
  const formattedDate = date.toLocaleDateString(siteLocale || "en-GB", { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric",
    timeZone: timezone
  });
  
  const time = date.toLocaleTimeString(siteLocale || "en-GB", { 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: timezone
  });
  
  // Get timezone display
  const getTimezoneDisplay = (tz) => {
    try {
      const formatter = new Intl.DateTimeFormat(siteLocale || "en-GB", {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(new Date());
      const offsetPart = parts.find(p => p.type === 'timeZoneName');
      if (offsetPart && offsetPart.value) {
        let offset = offsetPart.value;
        offset = offset.replace('GMT', 'UTC');
        return ` (${offset})`;
      }
    } catch {
      try {
        const shortFormatter = new Intl.DateTimeFormat(siteLocale || "en-GB", {
          timeZone: tz,
          timeZoneName: 'short'
        });
        const parts = shortFormatter.formatToParts(new Date());
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart && tzPart.value) return ` (${tzPart.value})`;
      } catch {}
    }
    return '';
  };
  
  const tzDisplay = getTimezoneDisplay(timezone);
  
  return `${formattedDate} ${atLabel} ${time}${tzDisplay}`;
};

// ── Payment status helper ─────────────────────────────────────────────────────
const getPaymentStatusDisplay = (payment, getAContentFn) => {
  if (!payment) return null;
  
  const status = payment.paymentStatus;
  if (status === 'captured') {
    return {
      label: getAContentFn('cmp_vetonest.com_PaymentCaptured_Label') || 'Payment Captured',
      color: 'success',
      icon: <CheckCircleOutlined />,
      description: getAContentFn('cmp_vetonest.com_PaymentCaptured_Description') || 'Payment has been successfully captured'
    };
  } else if (status === 'authorized') {
    return {
      label: getAContentFn('cmp_vetonest.com_PaymentAuthorized_Label') || 'Payment Authorized',
      color: 'warning',
      icon: <DollarOutlined />,
      description: getAContentFn('cmp_vetonest.com_PaymentAuthorized_Description') || 'Payment is authorized but not yet captured'
    };
  } else if (status === 'pending') {
    return {
      label: getAContentFn('cmp_vetonest.com_PaymentPending_Label') || 'Payment Pending',
      color: 'processing',
      icon: <TimeOutlined />,
      description: getAContentFn('cmp_vetonest.com_PaymentPending_Description') || 'Payment is being processed'
    };
  } else if (status === 'failed') {
    return {
      label: getAContentFn('cmp_vetonest.com_PaymentFailed_Label') || 'Payment Failed',
      color: 'error',
      icon: <ClockCircleOutlined />,
      description: getAContentFn('cmp_vetonest.com_PaymentFailed_Description') || 'Payment attempt failed'
    };
  } else if (status === 'refunded') {
    return {
      label: getAContentFn('cmp_vetonest.com_PaymentRefunded_Label') || 'Payment Refunded',
      color: 'default',
      icon: <DollarOutlined />,
      description: getAContentFn('cmp_vetonest.com_PaymentRefunded_Description') || 'Payment has been refunded'
    };
  }
  return null;
};

const ConsultationDetailDrawer = ({ consultation, open, onClose, extraActions }) => {
  const { base_url, siteLocale, getAContent, truncateString, photoAnimalDefaultSrc } = useContext(SiteContext);
  
  // Helper to safely get translation with fallback
  const safeGetContent = (key, fallback) => {
    const val = getAContent(key);
    return (val && val !== '***' && val !== '...') ? val : fallback;
  };
  
  const Row = ({ labelKey, labelFallback, value }) => value ? (
    <div style={{ marginBottom: "10px", fontSize: "14px" }}>
      <span style={{ color: "#888", minWidth: "160px", display: "inline-block" }}>
        {safeGetContent(labelKey, labelFallback)}:
      </span>
      <span style={{ color: "#222", fontWeight: 500 }}>{value}</span>
    </div>
  ) : null;

  if (!consultation) return null;

  const { profileVeto, carnetAnimal, consultationType, consultationStatus,
          etablissement, symptom, startingDatetime, creationDate, description, timezone, payment } = consultation;
  
  const atLabel = safeGetContent('cmp_vetonest.com_At_Prefix', 'at');
  const formattedStartDate = formatDateInTimezone(consultation, siteLocale, atLabel);
  
  // Format creation date (no timezone conversion needed)
  const formatCreationDate = () => {
    if (!creationDate) return "—";
    let date;
    if (typeof creationDate === 'object' && creationDate.date) {
      date = new Date(creationDate.date);
    } else if (typeof creationDate === 'string') {
      date = new Date(creationDate.replace(" ", "T"));
    } else {
      date = new Date(creationDate);
    }
    if (isNaN(date.getTime())) return "—";
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
  
  const formattedCreationDate = formatCreationDate();
  const expired = isExpired(consultation);
  
  const getStatusDisplayText = () => {
    if (expired) return 'Expired';
    if (consultationStatus?.nom) return consultationStatus.nom;
    return '—';
  };
  
  const getStatusColorValue = () => {
    if (expired) return 'volcano';
    return statusColor(consultationStatus?.nom || '');
  };

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

  const getPetOwnerName = () => {
    if (!carnetAnimal?.profileUser) return '';
    const prenom = carnetAnimal.profileUser.prenom || '';
    const nom = carnetAnimal.profileUser.nom || '';
    if (!prenom && !nom) return 'Pet Owner';
    const fullName = `${prenom} ${nom}`.trim();
    return truncateString(fullName, 25);
  };

  const getPetName = () => {
    if (!carnetAnimal) return '';
    return truncateString(carnetAnimal.nom || '', 25);
  };

  const vetPictureUrl = getVetPictureUrl();
  const petPictureUrl = getPetPictureUrl();
  const petOwnerName = getPetOwnerName();
  const petName = getPetName();
  const petFullName = carnetAnimal?.nom || '';

  // ── Payment status ──────────────────────────────────────────────────────────
  const paymentStatus = getPaymentStatusDisplay(payment, getAContent);
  const paymentAmount = payment?.amount || consultation?.paymentAmount || null;
  const paymentCurrency = payment?.currency || 'EUR';
  const paymentDate = payment?.capturedAt || payment?.authorizedAt || payment?.createdAt || null;

  const formatPaymentDate = () => {
    if (!paymentDate) return null;
    let date;
    if (typeof paymentDate === 'object' && paymentDate.date) {
      date = new Date(paymentDate.date);
    } else if (typeof paymentDate === 'string') {
      date = new Date(paymentDate);
    } else {
      date = new Date(paymentDate);
    }
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(siteLocale || "en-GB", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const formattedPaymentDate = formatPaymentDate();

  return (
    <Drawer
     title={
		<div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
		  <span style={{ fontWeight: 700, fontSize: "16px" }}>
			{safeGetContent('cmp_vetonest.com_ConsultationDetails_Title', 'Consultation Details')}
		  </span>
		  <Tag color={getStatusColorValue()} style={{ margin: 0 }}>
			{safeGetContent(`cmp_vetonest.com_Status_${getStatusDisplayText()}_Txt`, getStatusDisplayText())}
		  </Tag>
		  {expired && (
			<Tag icon={<ClockCircleOutlined />} color="volcano" style={{ margin: 0 }}>
			  {safeGetContent('cmp_vetonest.com_ConsultationExpired_Label', 'Consultation window has passed')}
			</Tag>
		  )}
		  {/* REMOVED: timezone tag from header - it's already shown in the date/time section */}
		</div>
	  }
      placement="right"
      width={480}
      onClose={onClose}
      open={open}
      footer={
        extraActions ? (
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            {extraActions}
          </div>
        ) : expired ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <span style={{ color: "#999", fontSize: "13px" }}>
              {safeGetContent('cmp_vetonest.com_ExpiredConsultationFooter_Txt', 'This consultation can no longer be modified.')}
            </span>
          </div>
        ) : null
      }
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
              <Tooltip title={`${profileVeto.prenom || ''} ${profileVeto.nom || ''}`.trim()} placement="top">
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
                  <VetName 
                    vet={profileVeto}
                    showTitle={true}
                    format="full"
                    withTooltip={false}
                  />
                </p>
              </Tooltip>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                {safeGetContent('cmp_vetonest.com_Veterinarian_Label', 'Veterinarian')}
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
                {safeGetContent('cmp_vetonest.com_Pet_Label', 'Pet')}
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
      <Row labelKey="cmp_vetonest.com_DateTime_Label" labelFallback="Date and Time" value={formattedStartDate} />
      {timezone && (
        <div style={{ marginBottom: "10px", fontSize: "12px", color: "#aaa" }}>
          <ClockCircleOutlined style={{ marginRight: "4px" }} />
          {safeGetContent('cmp_vetonest.com_Timezone_Label', 'Timezone')}: {timezone}
        </div>
      )}
      <Row labelKey="cmp_vetonest.com_ConsultationType_Label" labelFallback="Consultation Type" value={consultationType?.tagRef ? safeGetContent(consultationType.tagRef, consultationType.nom) : consultationType?.nom} />
      <Row labelKey="cmp_vetonest.com_Clinic_Label" labelFallback="Clinic" value={etablissement?.nom} />
      <Row labelKey="cmp_vetonest.com_RequestedOn_Label" labelFallback="Requested on" value={formattedCreationDate} />
      {description && <Row labelKey="cmp_vetonest.com_Description_Label" labelFallback="Description" value={description} />}

      {/* ── Payment Information ── */}
      {paymentStatus && (
        <>
          <Divider style={{ margin: "16px 0 12px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>
              💳 {safeGetContent('cmp_vetonest.com_PaymentInformation_Title', 'Payment Information')}
            </span>
          </Divider>

          <div style={{ 
            background: paymentStatus.color === 'success' ? '#f6ffed' : 
                       paymentStatus.color === 'warning' ? '#fffbe6' : 
                       paymentStatus.color === 'error' ? '#fff1f0' : 
                       '#fafafa',
            border: `1px solid ${paymentStatus.color === 'success' ? '#b7eb8f' : 
                                   paymentStatus.color === 'warning' ? '#ffe58f' : 
                                   paymentStatus.color === 'error' ? '#ffa39e' : 
                                   '#d9d9d9'}`,
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px", color: paymentStatus.color === 'success' ? '#52c41a' : 
                                                    paymentStatus.color === 'warning' ? '#faad14' : 
                                                    paymentStatus.color === 'error' ? '#ff4d4f' : 
                                                    '#888' }}>
                {paymentStatus.icon}
              </span>
              <Tag color={paymentStatus.color} style={{ margin: 0, fontSize: "13px", padding: "2px 12px" }}>
                {paymentStatus.label}
              </Tag>
            </div>
            
            <p style={{ margin: "4px 0 0 28px", fontSize: "13px", color: "#555" }}>
              {paymentStatus.description}
            </p>

            {/* Payment Amount */}
            {paymentAmount && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#888", fontSize: "13px" }}>
                    {safeGetContent('cmp_vetonest.com_Amount_Label', 'Amount')}:
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "#222" }}>
                    {paymentAmount.toFixed(2)} {paymentCurrency}
                  </span>
                </div>
                {formattedPaymentDate && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      {paymentStatus.label === (safeGetContent('cmp_vetonest.com_PaymentCaptured_Label') || 'Payment Captured') ? 
                        safeGetContent('cmp_vetonest.com_CapturedOn_Label', 'Captured on') :
                        safeGetContent('cmp_vetonest.com_AuthorizedOn_Label', 'Authorized on')}:
                    </span>
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      {formattedPaymentDate}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method (if available) */}
            {payment?.paymentMethod && (
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#aaa" }}>
                {safeGetContent('cmp_vetonest.com_PaymentMethod_Label', 'Method')}: {payment.paymentMethod}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Symptom report ── */}
      {symptom && (
        <>
          <Divider style={{ margin: "16px 0 12px" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>
              {safeGetContent('cmp_vetonest.com_SymptomReport_Label', 'Symptom Report')}
            </span>
          </Divider>

          {symptom.primaryComplaint && (
            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "#444" }}>
              <strong>{safeGetContent('cmp_vetonest.com_Complaint_Label', 'Primary Complaint')}:</strong> {symptom.primaryComplaint}
            </div>
          )}

          {symptom.urgency && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{ color: "#888", fontSize: "13px" }}>
                {safeGetContent('cmp_vetonest.com_Urgency_Label', 'Urgency')}:
              </span>{" "}
              <Tag color={urgencyColor(symptom.urgency.name)}>
                {symptom.urgency.tagRef ? safeGetContent(symptom.urgency.tagRef, symptom.urgency.name) : symptom.urgency.name}
              </Tag>
            </div>
          )}

          {symptom.detectedSymptoms && symptom.detectedSymptoms.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ margin: "0 0 6px", color: "#888", fontSize: "13px" }}>
                {safeGetContent('cmp_vetonest.com_DetectedSymptoms_Label', 'Detected Symptoms')}:
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
                {safeGetContent('cmp_vetonest.com_FollowUpAnswers_Label', 'Follow-up Answers')}:
              </p>
              {Object.entries(symptom.followUpAnswers).map(([q, a], i) => (
                <div key={i} style={{ marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#555" }}>
                    {safeGetContent('cmp_vetonest.com_Question_Short', 'Q')} {q}:
                  </span><br />
                  <span style={{ color: "#222", fontWeight: 500 }}>
                    {safeGetContent('cmp_vetonest.com_Answer_Short', 'A')} {Array.isArray(a) ? a.join(", ") : a}
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