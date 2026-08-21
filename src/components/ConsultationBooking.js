import React, { useState, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { AutoComplete, message, Tag, Tooltip, Spin } from "antd";
import { CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";
import { AuthContext } from "../context/AuthProvider";
import { useCachedData } from "../hooks/useCachedData";
import { useSocket } from "../context/SocketProvider";
import { useConsultationRules } from "../context/ConsultationRulesContext";
import VetName from "./VetName";
import VerificationStatusBadge from "./VerificationStatusBadge";
import BookingPriceSummary from "./BookingPriceSummary";

// ── Human-readable date formatter ────────────────────────────────────────────
const formatDate = (dateStr, siteLocale) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  const locale = siteLocale || "en-GB";
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

// ── Urgency badge colour ─────────────────────────────────────────────────────
const urgencyColor = (urgency = "") => {
  const u = urgency.toLowerCase();
  if (u.includes("emergency")) return "#d32f2f";
  if (u.includes("high"))      return "#f57c00";
  if (u.includes("moderate"))  return "#f9a825";
  return "#388e3c";
};

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ title, count, dim }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 12px" }}>
    <span style={{ fontWeight: 700, fontSize: "15px", color: dim ? "#aaa" : "#333", whiteSpace: "nowrap" }}>
      {title}
    </span>
    {count > 0 && (
      <span style={{ background: "#f0f0f0", color: "#666", borderRadius: "10px", padding: "1px 8px", fontSize: "12px" }}>
        {count}
      </span>
    )}
    <div style={{ flex: 1, height: 1, background: "#eee" }} />
  </div>
);

// ── Vet card (responsive, wider) ────────────────────────────────────────────
// ── Vet card (responsive, wider) ────────────────────────────────────────────
const VetCard = React.memo(({ vet, isRecommended, isSameLocation, isSelected, availability, leadTimeStatus, onBook, getAContent }) => {
  const isActive = vet.profileStatus === 'active';

  // Friendly "available from" label — same logic as ConsultationProcess.js
  const formatAvailableFrom = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 86400000);
    const afterTomorrowStart = new Date(todayStart.getTime() + 2 * 86400000);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d >= todayStart && d < tomorrowStart) return `today at ${timeStr}`;
    if (d >= tomorrowStart && d < afterTomorrowStart) return `tomorrow at ${timeStr}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
  };

  // Book button is disabled when vet has no available consultation types
  // for the selected date/time (lead-time rules or no matching modality).
  const isLeadTimeBlocked = leadTimeStatus?.isFullyBlocked === true;

  const hasValidClinicInfo = () => {
    const hasValidName = vet.clinicName &&
                         vet.clinicName !== '—' &&
                         vet.clinicName !== '-' &&
                         vet.clinicName.trim() !== '';
    const hasValidType = vet.clinicTypeName &&
                         vet.clinicTypeName !== '—' &&
                         vet.clinicTypeName !== '-' &&
                         vet.clinicTypeName.trim() !== '';
    return hasValidName || hasValidType;
  };

  const getLocalizedLocation = useCallback(() => {
    const cityTagRef = vet.locationCityTagRef || vet.cityTagRef;
    const countryTagRef = vet.locationCountryTagRef || vet.countryTagRef;
    let cityName = vet.locationCity || vet.city;
    let countryName = vet.locationCountry || vet.country || vet.countryName;
    const countryIso = vet.locationCountryIso || vet.countryIso;

    if (!cityName && vet.villes && vet.villes.length > 0) {
      if (typeof vet.villes[0] === 'string') {
        cityName = vet.villes[0];
      } else if (typeof vet.villes[0] === 'object') {
        cityName = vet.villes[0].nom || vet.villes[0].name;
      }
    }

    let localizedCity = cityName;
    let localizedCountry = countryName;

    if (cityTagRef) {
      const translated = getAContent(cityTagRef);
      if (translated && translated !== cityTagRef) {
        localizedCity = translated;
      }
    }

    if (countryTagRef) {
      const translated = getAContent(countryTagRef);
      if (translated && translated !== countryTagRef) {
        localizedCountry = translated;
      }
    }

    if (localizedCity && localizedCountry) {
      return {
        text: `${localizedCity} / ${localizedCountry}`,
        iso: countryIso,
        hasFlag: !!countryIso
      };
    } else if (localizedCity) {
      return {
        text: localizedCity,
        iso: countryIso,
        hasFlag: !!countryIso
      };
    } else if (localizedCountry) {
      return {
        text: localizedCountry,
        iso: countryIso,
        hasFlag: !!countryIso
      };
    }

    return null;
  }, [vet, getAContent]);

  const location = getLocalizedLocation();

  // Check if vet can accept bookings
  const canBook = isActive;

  return (
    <div className="vet-card" style={{
      position: "relative",
      borderRadius: "10px",
      border: (isRecommended || isSameLocation) ? "1px solid #e0e0e0" : "1.5px solid #90caf9",
      background: "#fff",
      overflow: "hidden",
      boxShadow: isRecommended ? "0 0 0 2px #FFDE59" : isSameLocation ? "0 0 0 2px #66bb6a" : "0 0 0 1px #90caf9",
      transition: "box-shadow 0.15s",
      opacity: isActive ? 1 : 0.7,
    }}>
      {/* Header with badges */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 14px 0 0"
      }}>
        <div>
          {isRecommended && (
            <div style={{ background: "#FFDE59", padding: "3px 14px", fontSize: "11px", fontWeight: 700, color: "#333" }}>
              ✓ { getAContent( 'cmp_vetonest.com_BestMatch_Badge' ) }
            </div>
          )}
          {!isRecommended && isSameLocation && (
            <div style={{ background: "#66bb6a", padding: "3px 14px", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
              📍  { getAContent( 'cmp_vetonest.com_SameCity_Badge' ) }
            </div>
          )}
        </div>

        {isSelected && (
          <div
            title={getAContent('cmp_vetonest.com_SelectedVet_Tooltip') || 'Selected veterinarian'}
            style={{
              fontSize: "14px",
            }}
          >
            🏅
          </div>
        )}
      </div>

      <div className="vet-card-content" style={{
        display: "flex",
        gap: "20px",
        padding: "16px",
        flexWrap: "wrap",
        width: "100%",
        boxSizing: "border-box"
      }}>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
          width: "128px",
          minWidth: "112px"
        }}>
          <img
            src={vet.picture || "/img/user/1.jpg"}
            alt={vet.fullName}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "3px solid #fff",
              boxShadow: (isRecommended || isSameLocation) ? "0 0 0 2px #f0f0f0" : "0 0 0 2px #e3f2fd"
            }}
          />

          <div className="vet-price-row" style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "4px 10px",
            minWidth: "0",
            width: "100%",
            fontSize: "13px",
            color: "#333",
            whiteSpace: "nowrap"
          }}>
            {vet.practiceMode === 'online' ? (
              vet.tarifConsultationVideo
                ? <span><i className="fa fa-desktop" /> {parseInt(vet.tarifConsultationVideo)}€</span>
                : <span>{getAContent('cmp_vetonest.com_PriceOnRequest_Label') || 'Price on request'}</span>
            ) : (
              <>
                {vet.tarifConsultation && (
                  <span>💵 {parseInt(vet.tarifConsultation)}€</span>
                )}
                {vet.videoAllowed && vet.tarifConsultationVideo && (
                  <span><i className="fa fa-desktop" /> {parseInt(vet.tarifConsultationVideo)}€</span>
                )}
                {!vet.tarifConsultation && !(vet.videoAllowed && vet.tarifConsultationVideo) && (
                  <span>{getAContent('cmp_vetonest.com_PriceOnRequest_Label') || 'Price on request'}</span>
                )}
              </>
            )}
          </div>

          {/* Booking Button - Only show if vet is active */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%" }}>
            {isActive ? (
              <button
                onClick={() => !isLeadTimeBlocked && onBook(vet)}
                className="consultation-next-button"
                disabled={isLeadTimeBlocked}
                style={{
                  fontSize: "12px",
                  padding: "7px 10px",
                  flex: "1 1 auto",
                  backgroundColor: isLeadTimeBlocked ? "#e0e0e0" : "#FFDE59",
                  color: isLeadTimeBlocked ? "#999" : "#333",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: isLeadTimeBlocked ? "not-allowed" : "pointer",
                  opacity: isLeadTimeBlocked ? 0.7 : 1,
                }}
              >
                {getAContent('cmp_vetonest.com_Booking_Label') || 'Book'}
              </button>
            ) : null}
            <a
              href={`/vet-profile?vetId=${vet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px",
                color: "#888",
                textDecoration: "underline",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {getAContent('cmp_vetonest.com_ViewProfile_Btn')} →
            </a>
          </div>
        </div>

        <div className="vet-info" style={{ flex: "2 1 280px", display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "4px"
          }}>
            <span style={{ fontWeight: "bold", fontSize: "15px", color: "#333" }}>
              <VetName
                vet={vet}
                showTitle={true}
                format="full"
                withTooltip={true}
              />
            </span>
            {!isActive && (
              <Tag color="error" icon={<CloseCircleOutlined />} style={{ margin: 0, fontSize: "10px", padding: "0 6px", lineHeight: "18px" }}>
                {vet.profileStatus === 'vacation'
                  ? getAContent('cmp_vetonest.com_OnVacation_Label') || 'Vacation'
                  : getAContent('cmp_vetonest.com_Disabled_Status') || 'Disabled'}
              </Tag>
            )}
            {/* ── Practice mode badge ── */}
            {vet.practiceMode && (() => {
              const modeConfig = {
                home:   { color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9' },
                clinic: { color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb' },
                online: { color: '#6a1b9a', bg: '#f3e5f5', border: '#ce93d8' },
              };
              const cfg = modeConfig[vet.practiceMode] || modeConfig.clinic;
              const label = vet.vetoMode?.tagRef
                ? getAContent(vet.vetoMode.tagRef) || vet.practiceMode
                : vet.practiceMode;
              return (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: cfg.color,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "10px",
                  padding: "1px 8px",
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                }}>
                  <i className="fa fa-map-marker" /> {label}
                </span>
              );
            })()}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "10px"
          }}>
            <span style={{ fontSize: "13px", color: "#666", lineHeight: "1.3" }}>
              {vet.specialityName || "—"}
            </span>
            <VerificationStatusBadge
              status={vet.verificationStatus}
              showTooltip={true}
              showIcon={true}
              size="small"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {vet.videoAllowed === true && (
              <Tooltip title={getAContent('cmp_vetonest.com_VideoConsultationAvailable_Label') || 'Video consultation available'}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1565c0",
                  background: "#e3f2fd",
                  border: "1px solid #bbdefb",
                  borderRadius: "10px",
                  padding: "1px 8px",
                  lineHeight: "16px",
                  cursor: "default"
                }}>
                  ✅ <i class="fa fa-video-camera"></i>
                </span>
              </Tooltip>
            )}

            {availability !== undefined && (
              <Tooltip title={
                availability === null
                  ? (getAContent('cmp_vetonest.com_CheckingAvailability_Txt') || 'Checking availability')
                  : availability === true
                    ? (getAContent('cmp_vetonest.com_AvailableSelectedDate_Txt') || 'Available for the selected date')
                    : (getAContent('cmp_vetonest.com_NotAvailableSelectedDate_Txt') || 'Unavailable on the selected date.')
              }>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: availability === null ? "#888" : availability === true ? "#2e7d32" : "#f44336",
                  background: availability === null ? "#f5f5f5" : availability === true ? "#e8f5e9" : "#ffebee",
                  border: `1px solid ${availability === null ? "#e0e0e0" : availability === true ? "#c8e6c9" : "#ffcdd2"}`,
                  borderRadius: "10px",
                  padding: "1px 8px",
                  lineHeight: "16px",
                  cursor: "default"
                }}>
                  {availability === null && "⏳"}
                  {availability === true && "✓"}
                  {availability === false && <InfoCircleOutlined style={{ fontSize: "11px" }} />}
                  {availability === null
                    ? (getAContent('cmp_vetonest.com_CheckingAvailability_Txt') || 'Checking')
                    : availability === true
                      ? (getAContent('cmp_vetonest.com_AvailableSelectedDate_Txt') || 'Available')
                      : (getAContent('cmp_vetonest.com_Unavailable_Label') || 'Unavailable')}
                </span>
              </Tooltip>
            )}

            {/* ─── Per-type lead-time / booking-rule notifications ─────── */}
            {leadTimeStatus?.hasIssue && (
              <div style={{ width: "100%", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {[...leadTimeStatus.unavailable, ...leadTimeStatus.notOffered]
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const isNotOffered = item.status === 'notOffered';
                    return (
                      <Tooltip
                        key={item.type}
                        title={
                          isNotOffered
                            ? (getAContent('cmp_vetonest.com_TypeNotOffered_Message') || "this vet doesn't offer this consultation type")
                            : (getAContent('cmp_vetonest.com_TypeUnavailable_Message') || 'select a time after {time}')
                                .replace(/\{time\}/g, formatAvailableFrom(item.availableFrom))
                        }
                      >
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "10px",
                          fontWeight: 500,
                          color: isNotOffered ? "#f44336" : "#e65100",
                          background: isNotOffered ? "#ffebee" : "#fff3e0",
                          border: `1px solid ${isNotOffered ? "#ffcdd2" : "#ffe0b2"}`,
                          borderRadius: "10px",
                          padding: "1px 7px",
                          lineHeight: "16px",
                          cursor: "default",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          <InfoCircleOutlined style={{ fontSize: "10px", flexShrink: 0 }} />
                          {item.displayName}
                          {isNotOffered
                            ? ` — ${getAContent('cmp_vetonest.com_TypeNotOfferedShort_Label') || 'not offered'}`
                            : ` — ${getAContent('cmp_vetonest.com_TypeUnavailableShort_Label') || 'select a later time'}`}
                        </span>
                      </Tooltip>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="vet-meta" style={{
          flex: "1 1 200px",
          minWidth: "180px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          borderLeft: "1px solid #f0f0f0",
          paddingLeft: "20px"
        }}>
          {hasValidClinicInfo() && (
            <p style={{ margin: 0, fontSize: "12px", color: "#555", lineHeight: "1.3" }}>
              🏥{' '}
              {vet.clinicName && vet.clinicName !== '—' && vet.clinicName !== '-' ? vet.clinicName : ''}
              {vet.clinicName && vet.clinicName !== '—' && vet.clinicName !== '-' &&
               vet.clinicTypeName && vet.clinicTypeName !== '—' && vet.clinicTypeName !== '-' ? " • " : ''}
              {vet.clinicTypeName && vet.clinicTypeName !== '—' && vet.clinicTypeName !== '-' ? vet.clinicTypeName : ''}
            </p>
          )}

          {location && location.text && (
            <div style={{
              fontSize: "12px",
              color: "#777",
              lineHeight: "1.3",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap"
            }}>
              {location.iso && location.hasFlag && (
                <div style={{
                  width: "16px",
                  height: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backgroundImage: `url(/img/flags/${location.iso.toLowerCase()}.svg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: "2px",
                  border: "1px solid #e0e0e0"
                }} />
              )}
              <span>{location.text}</span>
            </div>
          )}

          {!location && (vet.locationCity || vet.city) && (
            <p style={{ margin: 0, fontSize: "12px", color: "#777", lineHeight: "1.3" }}>
              📍 {vet.locationCity || vet.city}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

VetCard.displayName = 'VetCard';

VetCard.displayName = 'VetCard';



// ── Responsive hook ──────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

// ════════════════════════════════════════════════════════════════════════════
const ConsultationBooking = ({ params }) => {
  
  const { 
    profileTypeId,
    profileId,
    user,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const {
    base_url,
    getAContent,
    getPlaceAutocomplete,
    allSpecialities,
    allEtablissementTypes,
    vetos,
    etablissements,
    profileGet,
    getTimeslot,
    saveSymtom,
    saveConsultation,
    postNotification,
    siteLocale,
    sendEmail,
    siteURL,
    siteName,
    siteDomainName,
    siteEmail,
    getVetos,
    photoAnimalDefaultSrc,
  } = useContext(SiteContext);

  const { fetchWithCache } = useCachedData();
  const { emitNewConsultationRequest } = useSocket();

  // ─── Consultation Rules ──────────────────────────────────────────────────
  const {
    allTypes,
    getCurrentRules,
    loading: rulesLoading,
    formatLeadTime,
    fetchAllTypes,
  } = useConsultationRules();

  // Cache for availability results
  const vetListCache = useRef({});
  const availabilityCache = useRef(new Map());
  const abortControllers = useRef(new Map());
  const checkedVetsRef = useRef(new Set());
  const profileLoadedRef = useRef(false);

  // Fetch vets and consultation rules on mount
  useEffect(() => {
    if (!vetos.length) getVetos();
    // allTypes starts as [] inside useConsultationRules until fetchAllTypes
    // is explicitly called - without this, getVetLeadTimeStatus returns null
    // for every vet so no lead-time notifications ever appear on the cards.
    if (!allTypes.length) fetchAllTypes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getSpecialityName = useCallback((id) => {
    if (!id) return "—";
    const found = allSpecialities?.find((s) => Number(s.id) === Number(id));
    if (!found) return "—";
    const translated = found.tagRef ? getAContent(found.tagRef) : null;
    return translated || found.name || found.nom || "—";
  }, [allSpecialities, getAContent]);

  const getClinicTypeName = useCallback((id) => {
    if (!id) return "—";
    const list = Array.isArray(allEtablissementTypes) ? allEtablissementTypes : [];
    const found = list.find((c) => Number(c.id) === Number(id));
    if (!found) return "—";
    return found.tagRef ? getAContent(found.tagRef) : (found.nom ?? "—");
  }, [allEtablissementTypes, getAContent]);

  const { 
    selectedPet, 
    selectedDate, 
    selectedTime, 
    symptomData,
    preselectedVet,
    recommendedSpecialityId,
    recommendedClinicTypeId, 
  } = params;

	const [ vetEmail, setVetEmail ] = useState('');

  const recSpecialityId = recommendedSpecialityId ? Number(recommendedSpecialityId) : null;
  const recClinicTypeId = recommendedClinicTypeId ? Number(recommendedClinicTypeId) : null;
  const symptoms = symptomData?.symptoms ?? [];
  const urgency = symptomData?.urgency ?? "";
  const hasAiPanel = Boolean(recSpecialityId || recClinicTypeId || urgency || symptoms.length > 0);
  
  // Filters
  const [filterSpeciality, setFilterSpeciality] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterVideoOnly, setFilterVideoOnly] = useState(null);
  const [filterConsultationPlace, setFilterConsultationPlace] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
	const ThinDivider = () => (
	  <div style={{ height: 1, background: '#000', margin: '8px 0' }} />
	);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedVet, setSelectedVet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [consultationType, setConsultationType] = useState("physical");
  const [savedSymptomId, setSavedSymptomId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userCity, setUserCity] = useState(null);
  const [userCityId, setUserCityId] = useState(null);
  const [vetAvailability, setVetAvailability] = useState({});
  const [showUnavailableAlert, setShowUnavailableAlert] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Booking state
  const [consultationId, setConsultationId] = useState(null);

  // Responsive state
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build vet list
  const vetList = useMemo(() => {
    const cacheKey = `vetList_${JSON.stringify(vetos?.map(v => v.id))}_${JSON.stringify(etablissements?.map(e => e.id))}`;
    
    if (vetListCache.current[cacheKey]) {
      return vetListCache.current[cacheKey];
    }
    
    const result = (vetos || []).map((veto) => {
      const clinic = (etablissements || []).find((e) => e.creatorProfile?.id === veto.id);
      const specialityId = Number(veto.vetoSpecialite?.id ?? veto.vetoSpecialiteTab?.id ?? null);
      
      let vetoCity = null;
      let vetoCityId = null;
      
      if (veto.locationCity) {
        vetoCity = veto.locationCity;
        vetoCityId = veto.locationCityId;
      } else if (veto.villes && veto.villes.length > 0) {
        vetoCity = veto.villes[0];
      }
      
      return {
        id: veto.id,
        fullName: `${veto.prenom ?? ""} ${veto.nom ?? ""}`.trim(),
        originalVet: veto,
        prenom: veto.prenom,
        nom: veto.nom,
        vetTitle: veto.vetTitle || null,
        verificationStatus: veto.verificationStatus || null,
        profileStatus: veto.profileStatus || 'active',
        picture: veto.picture ? `${base_url}uploads/files/profile/${veto.picture}` : null,
        specialityId,
        specialityName: getSpecialityName(specialityId),
        villes: veto.villes ?? [],
        city: vetoCity,
        cityId: vetoCityId,
        locationCity: veto.locationCity,
        locationCityId: veto.locationCityId,
        locationCityTagRef: veto.locationCityTagRef,
        locationCountry: veto.locationCountry,
        locationCountryId: veto.locationCountryId,
        locationCountryTagRef: veto.locationCountryTagRef,
        locationCountryIso: veto.locationCountryIso,
        atHome: veto.atHome ?? false,
        practiceMode: veto.vetoMode?.name
          ?? ( veto.atHome === true  ? 'home'
             : veto.atHome === false ? 'clinic'
             : null ),
        vetoMode: veto.vetoMode ?? null,
        tarifConsultation: veto.tarifConsultation ?? null,
        tarifConsultationVideo: veto.tarifConsultationVideo ?? null,
        videoAllowed: veto.videoAllowed === true || veto.videoAllowed === 1 || veto.videoAllowed === "1",
        hasVideoConsult: veto.videoAllowed === true || veto.videoAllowed === 1 || veto.videoAllowed === "1",
        clinicId: clinic?.id ?? null,
        clinicTypeId: clinic?.etablissementType?.id ?? null,
        clinicTypeName: getClinicTypeName(clinic?.etablissementType?.id),
        clinicName: clinic?.nom ?? null,
        timezone: veto.timezone ?? null,
      };
    });
    
    vetListCache.current[cacheKey] = result;
    return result;
  }, [vetos, etablissements, base_url, getSpecialityName, getClinicTypeName]);

  // Preselected vet
  const preselectedVetCard = useMemo(() => {
    if (!preselectedVet) return null;
    const clinic = (etablissements || []).find((e) => e.creatorProfile?.id === preselectedVet.id);
    const specialityId = Number(preselectedVet.vetoSpecialite?.id ?? null);
    
    let vetoCity = null;
    let vetoCityId = null;
    if (preselectedVet.locationCity) {
      vetoCity = preselectedVet.locationCity;
      vetoCityId = preselectedVet.locationCityId;
    } else if (preselectedVet.villes && preselectedVet.villes.length > 0) {
      vetoCity = preselectedVet.villes[0];
    }
    
    return {
      id: preselectedVet.id,
      fullName: `${preselectedVet.prenom ?? ""} ${preselectedVet.nom ?? ""}`.trim(),
      originalVet: preselectedVet,
      prenom: preselectedVet.prenom,
      nom: preselectedVet.nom,
      vetTitle: preselectedVet.vetTitle || null,
      verificationStatus: preselectedVet.verificationStatus || null,
      profileStatus: preselectedVet.profileStatus || 'active',
      picture: preselectedVet.picture ? `${base_url}uploads/files/profile/${preselectedVet.picture}` : null,
      specialityId,
      specialityName: getSpecialityName(specialityId),
      villes: preselectedVet.villes ?? [],
      city: vetoCity,
      cityId: vetoCityId,
      atHome: preselectedVet.atHome ?? false,
      practiceMode: preselectedVet.vetoMode?.name
        ?? ( preselectedVet.atHome === true  ? 'home'
           : preselectedVet.atHome === false ? 'clinic'
           : null ),
      vetoMode: preselectedVet.vetoMode ?? null,
      tarifConsultation: preselectedVet.tarifConsultation ?? null,
      tarifConsultationVideo: preselectedVet.tarifConsultationVideo ?? null,
      videoAllowed: preselectedVet.videoAllowed === true || preselectedVet.videoAllowed === 1 || preselectedVet.videoAllowed === "1",
      hasVideoConsult: preselectedVet.videoAllowed === true || preselectedVet.videoAllowed === 1 || preselectedVet.videoAllowed === "1",
      clinicId: clinic?.id ?? null,
      clinicTypeId: clinic?.etablissementType?.id ?? null,
      clinicTypeName: getClinicTypeName(clinic?.etablissementType?.id),
      clinicName: clinic?.nom ?? null,
      timezone: preselectedVet.timezone ?? null,
    };
  }, [preselectedVet, etablissements, base_url, getSpecialityName, getClinicTypeName]);

  // Apply filters - only show active vets
  const filtered = useMemo(() => {
    const result = vetList.filter((v) => {
      if (!v) return false;
      
      if (v.profileStatus !== 'active') return false;
      
      if (filterVideoOnly === true && !v.videoAllowed) return false;
      if (filterVideoOnly === false && v.videoAllowed) return false;
      
      if (filterConsultationPlace === "atClinic" && v.practiceMode !== 'clinic') return false;
      if (filterConsultationPlace === "atHome"   && v.practiceMode !== 'home')   return false;
      if (filterConsultationPlace === "online"   && v.practiceMode !== 'online') return false;
      
      if (priceMin && v.tarifConsultation) {
        const price = parseInt(v.tarifConsultation);
        if (price < parseInt(priceMin)) return false;
      }
      if (priceMax && v.tarifConsultation) {
        const price = parseInt(v.tarifConsultation);
        if (price > parseInt(priceMax)) return false;
      }
      
      const matchSpec = !filterSpeciality || v.specialityId === Number(filterSpeciality);
      const matchSearch = !searchText ||
        (v.fullName || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (v.clinicName || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (v.villes || []).some((ville) => (ville || "").toLowerCase().includes(searchText.toLowerCase()));
      
      return matchSpec && matchSearch;
    });
    
    return result;
  }, [vetList, filterSpeciality, filterVideoOnly, filterConsultationPlace, priceMin, priceMax, searchText]);

  // Best match & same city helpers
  const isMatch = useCallback((v) => {
    if (!recSpecialityId) return false;
    const vetSpecialityId = v?.specialityId ?? 0;
    return vetSpecialityId === recSpecialityId;
  }, [recSpecialityId]);

  const isSameCity = useCallback((v) => {
    if (!userCity) return false;
    const vetCity = v?.city || (v?.villes && v.villes[0]);
    if (!vetCity) return false;
    return userCity.toLowerCase().trim() === vetCity.toLowerCase().trim();
  }, [userCity]);

  const suggested = useMemo(() => filtered.filter(isMatch), [filtered, isMatch]);
  const sameCityVets = useMemo(() => filtered.filter((v) => !isMatch(v) && isSameCity(v)), [filtered, isMatch, isSameCity]);
  const otherVets = useMemo(() => filtered.filter((v) => !isMatch(v) && !isSameCity(v)), [filtered, isMatch, isSameCity]);

  // Sort priority: 1) selected vet, 2) verified vet, 3) best match, 4) same city, 5) everyone else
  const selectedVetId = selectedVet?.id ?? preselectedVetCard?.id ?? null;
  const getSortTier = useCallback((v) => {
    if (selectedVetId && v.id === selectedVetId) return 0;
    if (v.verificationStatus?.code === 'verified') return 1;
    if (isMatch(v)) return 2;
    if (isSameCity(v)) return 3;
    return 4;
  }, [selectedVetId, isMatch, isSameCity]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => getSortTier(a) - getSortTier(b));
  }, [filtered, getSortTier]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSpeciality, filterVideoOnly, filterConsultationPlace, priceMin, priceMax, searchText]);

  // Pagination calculations
  const totalVets = filtered.length;
  const totalPages = Math.ceil(totalVets / itemsPerPage);
  const paginatedVets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedFiltered.slice(startIndex, endIndex);
  }, [sortedFiltered, currentPage, itemsPerPage]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const vetListElement = document.querySelector('.vet-list');
      if (vetListElement) {
        vetListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Get visible page numbers
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Availability check
  const checkVetAvailability = useCallback(async (vetId) => {
    const cacheKey = `${vetId}_${selectedDate}_${selectedTime}`;
    if (availabilityCache.current.has(cacheKey)) {
      setVetAvailability(prev => ({ ...prev, [vetId]: availabilityCache.current.get(cacheKey) }));
      return;
    }

    if (abortControllers.current.has(vetId)) {
      abortControllers.current.get(vetId).abort();
    }

    const abortController = new AbortController();
    abortControllers.current.set(vetId, abortController);

    try {
      const timeslot = await fetchWithCache(
        `timeslot_${vetId}`,
        () => getTimeslot(vetId),
        300000
      );
      const slots = timeslot;

      const jsDay = new Date(selectedDate).getDay();
      const slotIndex = new Date(selectedDate).getDay(); // 0=Sunday, 6=Saturday
      const slot = slots[slotIndex];

      let isAvailable = false;
      if (slot?.opened && slot.startTime?.date && slot.endTime?.date) {
        const [chosenHour, chosenMin] = (selectedTime || "00:00").split(":").map(Number);
        const chosenMinutes = chosenHour * 60 + chosenMin;

        const parseSlotTime = (dateStr) => {
          const timePart = dateStr.split(" ")[1];
          const [h, m] = timePart.split(":").map(Number);
          return h * 60 + m;
        };

        const startMinutes = parseSlotTime(slot.startTime.date);
        const endMinutes = parseSlotTime(slot.endTime.date);
        isAvailable = chosenMinutes >= startMinutes && chosenMinutes < endMinutes;
      }

      availabilityCache.current.set(cacheKey, isAvailable);
      setVetAvailability(prev => ({ ...prev, [vetId]: isAvailable }));
    } catch (error) {
      if (error.name !== 'AbortError') {
        setVetAvailability(prev => ({ ...prev, [vetId]: null }));
      }
    } finally {
      abortControllers.current.delete(vetId);
    }
  }, [selectedDate, selectedTime, getTimeslot, fetchWithCache]);

  // ── Per-vet lead-time / booking-rule check ───────────────────────────────
  const getVetLeadTimeStatus = useCallback((vet) => {
    if (!selectedDate || !selectedTime || rulesLoading || !allTypes?.length) {
      return null;
    }

    const selectedDateTime = new Date(selectedDate + 'T' + selectedTime);
    const now = new Date();
    const hoursUntil = (selectedDateTime - now) / (1000 * 60 * 60);

    const practiceMode = vet.practiceMode
      ?? vet.vetoMode?.name
      ?? ( (vet.atHome === true || vet.atHome === 1 || vet.atHome === '1') ? 'home' : 'clinic' );
    const videoAllowed = vet.videoAllowed === true || vet.videoAllowed === 1 || vet.videoAllowed === '1';

    const result = { available: [], unavailable: [], notOffered: [], hasIssue: false };

    allTypes.forEach((type, index) => {
      // Video: always shown; tagged notOffered if vet doesn't offer it
      if (type.type === 'video') {
        if (!videoAllowed) {
          result.notOffered.push({ type: type.type, displayName: type.display_name, status: 'notOffered', order: index });
          result.hasIssue = true;
          return;
        }
      }

      // Home: only for home-visiting vets
      if (type.type === 'home') {
        if (practiceMode !== 'home') return;
      }

      // Clinic: only for clinic-based vets
      if (type.type === 'clinic') {
        if (practiceMode !== 'clinic') return;
      }

      // Online vets only offer video — home and clinic are already skipped above

      // Lead-time check for types this vet offers
      const rules = getCurrentRules(type.type);
      if (!rules) return;
      const minLeadTime = rules.min_booking_lead_time_hours ||
                          rules.effective_min_booking_lead_time ||
                          24;

      if (hoursUntil >= minLeadTime) {
        result.available.push({ type: type.type, displayName: type.display_name, status: 'available', order: index });
      } else {
        const availableFrom = new Date(now.getTime() + minLeadTime * 60 * 60 * 1000);
        result.unavailable.push({
          type: type.type,
          displayName: type.display_name,
          status: 'unavailable',
          minLeadTime,
          formattedLeadTime: formatLeadTime ? formatLeadTime(minLeadTime) : `${minLeadTime}h`,
          availableFrom,
          order: index,
        });
        result.hasIssue = true;
      }
    });

    result.isFullyBlocked = result.available.length === 0;
    return result;
  }, [selectedDate, selectedTime, allTypes, getCurrentRules, formatLeadTime, rulesLoading]);

  // Compute for every vet in the filtered list; recomputed on date/time/rules changes
  const vetLeadTimeStatus = useMemo(() => {
    const map = {};
    filtered.forEach(vet => { map[vet.id] = getVetLeadTimeStatus(vet); });
    return map;
  }, [filtered, getVetLeadTimeStatus]);

  const batchCheckAvailability = useCallback(async (vetsToCheck) => {
    if (!selectedDate || !selectedTime || !vetsToCheck.length) return;
    setIsLoadingAvailability(true);
    const chunkSize = 5;
    for (let i = 0; i < vetsToCheck.length; i += chunkSize) {
      const chunk = vetsToCheck.slice(i, i + chunkSize);
      await Promise.all(chunk.map(vet => checkVetAvailability(vet.id)));
    }
    setIsLoadingAvailability(false);
  }, [selectedDate, selectedTime, checkVetAvailability]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    availabilityCache.current.clear();
    checkedVetsRef.current.clear();
    setVetAvailability({});

    const vetsToCheck = filtered.filter(v => !checkedVetsRef.current.has(v.id));
    vetsToCheck.forEach(v => checkedVetsRef.current.add(v.id));

    if (vetsToCheck.length === 0) return;

    const timer = setTimeout(() => {
      batchCheckAvailability(vetsToCheck);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate, selectedTime, filtered, batchCheckAvailability]);

  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // ── Helper function to get vet name with title for display ─────────────────
  const getVetNameWithTitle = useCallback((vet) => {
    if (!vet) return '';
    
    let titleCode = '';
    if (vet.vetTitle?.tagRefCode) {
      titleCode = getAContent(vet.vetTitle.tagRefCode);
    } else if (vet.vetTitle?.code) {
      titleCode = vet.vetTitle.code;
    }
    
    const title = titleCode ? `${titleCode} ` : '';
    const fullName = `${vet.prenom || ''} ${vet.nom || ''}`.trim();
    
    return `${title}${fullName}`.trim();
  }, [getAContent]);

  // ── Force correct consultation type for online-only vets ──────────────────
  // consultationType state starts as 'physical'. For online-only vets the
  // physical radio is hidden in the recap modal, but the state is never
  // reset automatically — so the wrong type would be sent to the API.
  // This effect keeps it in sync whenever selectedVet changes.
  useEffect(() => {
    if (selectedVet?.practiceMode === 'online') {
      setConsultationType('online');
    }
  }, [selectedVet]);

  // ── Create consultation first ──────────────────────────────────────────────
  const handleCreateConsultation = async (vet, type) => {
    try {
      // Safety net: online-only vets always book a video consultation
      // regardless of what the consultationType state says.
      const effectiveType = vet?.practiceMode === 'online' ? 'online' : type;

      // consultation_type table:
      //   id=1 → video / online   (cmp_vetonest.com_Online_Txt)
      //   id=2 → at home          (cmp_vetonest.com_AtHome_Txt)
      //   id=3 → at clinic        (cmp_vetonest.com_AtClinic_Txt)
      const consultationTypeId = effectiveType === 'online'                    ? 1
                               : effectiveType === 'physical' && vet?.clinicId ? 3
                               :                                                 2;

      const consultationPayload = {
        carnetAnimalId: selectedPet?.id ?? null,
        profileVetoId: vet?.id ?? null,
        startingDatetime: `${selectedDate} ${selectedTime}`,
        consultationTypeId,
        consultationStatusId: 1,
        etablissementId: vet?.clinicId ?? null,
        description: symptomData?.complaint ?? '',
        symptomId: savedSymptomId,
        enabled: true,
      };

      const response = await saveConsultation(consultationPayload);
      
      if (response?.success) {
        return response;
      } else {
        throw new Error(response?.message || 'Failed to create consultation');
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  };

  // ── Handle booking ───────────────────────────────────────────────────────
  const handleBook = useCallback((vet) => {
    if (vet.profileStatus !== 'active') {
      const statusMessage = vet.profileStatus === 'vacation'
        ? getAContent('cmp_vetonest.com_VetOnVacation_Error') || 'This veterinarian is currently on vacation and cannot accept new consultations.'
        : getAContent('cmp_vetonest.com_VetDisabled_Error') || 'This veterinarian\'s profile is currently disabled and cannot accept new consultations.';
      
      message.error({
        content: statusMessage,
        duration: 6,
        style: {
          marginTop: '20vh',
          zIndex: 1001,
        },
      });
      
      return;
    }

    setSelectedVet(vet);
    setBookingDone(false);
    setConsultationType("physical");
    setSavedSymptomId(null);
    setConsultationId(null);

    const avail = vetAvailability[vet.id];
    const leadTime = vetLeadTimeStatus[vet.id];
    if (avail === false || leadTime?.isFullyBlocked) {
      setShowUnavailableAlert(true);
    } else {
      setShowUnavailableAlert(false);
      setShowModal(true);
    }
  }, [vetAvailability, vetLeadTimeStatus, getAContent]);

  // ── Handle "Confirm booking" click ──────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (selectedVet && selectedVet.profileStatus !== 'active') {
      const statusMessage = selectedVet.profileStatus === 'vacation'
        ? getAContent('cmp_vetonest.com_VetOnVacation_Error') || 'This veterinarian is currently on vacation and cannot accept new consultations.'
        : getAContent('cmp_vetonest.com_VetDisabled_Error') || 'This veterinarian\'s profile is currently disabled and cannot accept new consultations.';
      
      message.error(statusMessage);
      setShowModal(false);
      return;
    }

    if (isSaving) return;
    
    setIsSaving(true);
    setShowModal(false);

    try {
      // Step 1: Save symptom if needed
      let symptomId = savedSymptomId;
      if (symptomData?.complaint && !symptomId) {
        const symptomPayload = {
          primaryComplaint: symptomData.complaint ?? null,
          detectedSymptoms: JSON.stringify(symptomData.symptoms ?? []),
          urgency: symptomData.urgency ?? null,
          followUpAnswers: JSON.stringify(symptomData.followUpAnswers ?? null),
          recommendedSpecialityId: symptomData.recommendedSpecialityId ?? null,
          recommendedClinicTypeId: symptomData.recommendedClinicTypeId ?? null,
        };

        const rep = await saveSymtom(symptomPayload);
        if (rep?.success && rep?.symptomId) {
          symptomId = rep.symptomId;
          setSavedSymptomId(symptomId);
        }
      }

      // Step 2: Create the consultation — this is the booking itself, no payment step
      const consultationRep = await handleCreateConsultation(selectedVet, consultationType);
      
      if (!consultationRep?.success || !consultationRep?.consultationId) {
        throw new Error('Failed to create consultation');
      }

      const createdConsultationId = consultationRep.consultationId;
      setConsultationId(createdConsultationId);

      const consultationVetEmail = consultationRep.vetEmail;
      setVetEmail(consultationVetEmail);

      setBookingDone(true);
      setShowModal(true);

      // ─── SEND NOTIFICATIONS WITH PROPER ERROR HANDLING ────────────────
      try {
        // Extract data from the consultation creation response
        const { vetUserId, vetDisplayName, timezone } = consultationRep;

        // Get vet email from multiple sources
        let finalVetEmail = consultationVetEmail;

        // If vetEmail not in response, try to get from selectedVet
        if (!finalVetEmail && selectedVet?.originalVet?.email) {
          finalVetEmail = selectedVet.originalVet.email;
        }

        // If still no email, try from originalVet's user object
        if (!finalVetEmail && selectedVet?.originalVet?.user?.email) {
          finalVetEmail = selectedVet.originalVet.user.email;
        }

        // ─── 1. Send in-app notification ──────────────────────────────────
        if (vetUserId) {
          try {
            await postNotification({
              notificationTypeId: 4,
              receiverId: vetUserId,
              data: {
                consultationId: createdConsultationId,
                petName: selectedPet?.nom || '',
                ownerName: `${profile?.prenom ?? user?.prenom ?? ''} ${profile?.nom ?? user?.nom ?? ''}`.trim(),
                date: selectedDate,
                time: selectedTime,
              }
            });
            console.log('✅ In-app notification sent to vet:', vetUserId);
          } catch (notifError) {
            console.error('❌ Failed to send in-app notification:', notifError);
            // Don't throw - this shouldn't block the booking flow
          }
        }

        // ─── 2. Send email notification ──────────────────────────────────
        if (finalVetEmail) {
          try {
            // Prepare consultation details
            const consultationDateTimeStr = `${selectedDate} ${selectedTime}:00`;
            const vetTimezone = timezone || selectedVet?.timezone || 'Europe/Paris';

            // Get consultation type name
            let consultationTypeTagRef = '';
            let consultationTypeName = '';

            if (consultationType === 'online') {
              consultationTypeTagRef = 'cmp_vetonest.com_Online_Txt';
              consultationTypeName = getAContent(consultationTypeTagRef) || 'Online';
            } else if (consultationType === 'physical' && selectedVet?.clinicId) {
              consultationTypeTagRef = 'cmp_vetonest.com_AtClinic_Txt';
              consultationTypeName = getAContent(consultationTypeTagRef) || 'At clinic';
            } else {
              consultationTypeTagRef = 'cmp_vetonest.com_AtHome_Txt';
              consultationTypeName = getAContent(consultationTypeTagRef) || 'At home';
            }

            // Get vet name with title
            const vetName = vetDisplayName || getVetNameWithTitle(selectedVet) || selectedVet?.fullName || 'Veterinarian';

            // Get owner name
            const ownerName = `${profile?.prenom ?? user?.prenom ?? ''} ${profile?.nom ?? user?.nom ?? ''}`.trim() || 'Pet owner';

            // Prepare email data
            const emailData = {
              to_email: finalVetEmail,
              to_domain: finalVetEmail.split('@')[1],
              subject: siteLocale?.startsWith('fr')
                ? `Nouvelle demande de consultation — ${siteName}`
                : `New consultation request — ${siteName}`,
              siteURL: siteURL,
              siteName: siteName,
              siteDomain: siteDomainName,
              siteEmail: siteEmail,
              siteLocale: siteLocale,
              emailTemplate: 'consultation_request',
              vetName: vetName,
              ownerName: ownerName,
              petName: selectedPet?.nom || '',
              petType: selectedPet?.type?.nom || selectedPet?.type?.name || '',
              petBreed: selectedPet?.race?.nom || selectedPet?.race?.name || '',
              petAge: selectedPet?.age || '',
              consultationDate: selectedDate || '',
              consultationTime: selectedTime || '',
              consultationDateTime: consultationDateTimeStr,
              timezone: vetTimezone,
              consultationType: consultationTypeName,
              complaint: symptomData?.complaint || '',
              symptoms: symptomData?.symptoms?.join(', ') || '',
              urgency: symptomData?.urgency || '',
              clinicName: selectedVet?.clinicName || '',
              consultationId: createdConsultationId,
              bookingLink: `${siteURL}/vet/consultations/${createdConsultationId}`,
            };

            // Send the email with proper error handling
            console.log('📧 Attempting to send email to:', finalVetEmail);
            const emailResult = await sendEmail(emailData);

            if (emailResult?.success) {
              console.log('✅ Email sent successfully to vet:', finalVetEmail);
            } else {
              console.error('❌ Email sending failed:', emailResult?.error || 'Unknown error');
            }
          } catch (emailError) {
            console.error('❌ Email sending threw an exception:', emailError);
            // Log the error but don't block the booking flow
          }
        } else {
          console.warn('⚠️ No vet email available to send notification');
        }

        // ─── 3. Emit socket event for real-time notification ──────────────
        if (vetUserId) {
          try {
            emitNewConsultationRequest(vetUserId, createdConsultationId);
            console.log('✅ Socket event emitted for vet:', vetUserId);
          } catch (socketError) {
            console.error('❌ Socket event failed:', socketError);
          }
        }

      } catch (notificationError) {
        // Catch any unexpected errors in the notification block
        console.error('❌ Unexpected error in notification flow:', notificationError);
        // The booking is still confirmed, so we don't want to throw here
      }

      // Show success message to user
      message.success(
        getAContent('cmp_vetonest.com_BookingConfirmed_Message') ||
        'Booking confirmed! The veterinarian will be notified.'
      );

    } catch (error) {
      console.error('Booking error:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
      setShowModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Load user profile with city
  useEffect(() => {
    if (!profileId || !profileTypeId || profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    const loadProfile = async () => {
      try {
        const profileData = await profileGet(profileId, profileTypeId);
        let cityValue = null;
        let cityIdValue = null;

        if (profileData?.locationCity) {
          cityValue = profileData.locationCity;
          cityIdValue = profileData.locationCityId;
        }

        setUserCity(cityValue);
        setUserCityId(cityIdValue);
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [profileId, profileTypeId]);

  // ─────────────────────────────────────────────────────────────────────────
  // RESPONSIVE LAYOUT – using CSS grid with media queries
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="consultation-booking-container">
      <div className={`booking-layout ${hasAiPanel ? "" : "booking-layout--no-ai"}`}>
        {/* Filters Column */}
        <div className="booking-filters">
          {isMobile && (
            <button
              onClick={() => setFiltersOpen(o => !o)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0 8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              <span>🔍 {getAContent('cmp_vetonest.com_Filters_Label') || "Filters"}</span>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{filtersOpen ? "▲" : "▼"}</span>
            </button>
          )}

          {(!isMobile || filtersOpen) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder={getAContent('cmp_vetonest.com_SearchVetClinic_Placeholder') || "Search vet or clinic..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                flex: 1, 
                minWidth: "160px", 
                padding: "10px 12px", 
                borderRadius: "8px", 
                border: "1px solid #ddd",
                fontSize: "14px"
              }}
            />
			<ThinDivider />
            <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "#555" }}>
                <i className="fa fa-video-camera" style={{ marginRight: '4px' }} /> {getAContent('cmp_vetonest.com_VideoConsultation_Btn') || "Video consultation"}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { value: "", label: getAContent('cmp_vetonest.com_All_Option') || "All" },
                  { value: "yes", label: getAContent('cmp_vetonest.com_P91ms6QaTf') || "Yes" },
                  { value: "no", label: getAContent('cmp_vetonest.com_Wq71bn20Dx') || "No" }
                ].map(option => (
                  <label key={option.value} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="videoFilter"
                      value={option.value}
                      checked={
                        option.value === "yes" ? filterVideoOnly === true :
                        option.value === "no" ? filterVideoOnly === false :
                        filterVideoOnly === null || filterVideoOnly === ""
                      }
                      onChange={() => {
                        if (option.value === "yes") setFilterVideoOnly(true);
                        else if (option.value === "no") setFilterVideoOnly(false);
                        else setFilterVideoOnly(null);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "13px" }}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
			<ThinDivider />
            <div style={{ marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "#555" }}>
                📍 {getAContent('cmp_vetonest.com_ConsultationPlace_Label') || "Consultation place"}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { value: "", label: getAContent('cmp_vetonest.com_All_Option') || "All" },
                  { value: "atClinic", label: getAContent('cmp_vetonest.com_Fn1Qp8vMrT') || "Clinic" },
                  { value: "atHome",   label: getAContent('cmp_vetonest.com_Domicile_Label') || "Home" },
                  { value: "online",   label: getAContent('cmp_vetonest.com_Online_Label') || "Online only" },
                ].map(option => (
                  <label key={option.value} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="consultationPlace"
                      value={option.value}
                      checked={filterConsultationPlace === option.value}
                      onChange={() => setFilterConsultationPlace(option.value)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "13px" }}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
<ThinDivider />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "#555" }}>
                🔬 {getAContent('cmp_vetonest.com_Sp44Ma27Kw') || "Speciality"}
              </div>
              <select 
                value={filterSpeciality} 
                onChange={(e) => setFilterSpeciality(e.target.value)}
                style={{ 
                  padding: "10px 12px", 
                  borderRadius: "8px", 
                  border: "1px solid #ddd",
                  width: "100%",
                  fontSize: "13px",
                  backgroundColor: "#fff"
                }}
              >
                <option value="">{getAContent('cmp_vetonest.com_AllSpecialities_Filter') || "All specialities"}</option>
                {(allSpecialities || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tagRef ? getAContent(s.tagRef) || s.name : s.name}
                  </option>
                ))}
              </select>
            </div>
<ThinDivider />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "#555" }}>
                💶 {getAContent('cmp_vetonest.com_PriceRange_Label') || "Price range"}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="number"
                  placeholder={getAContent('cmp_vetonest.com_Mn82Qa17Xf') || "Min"}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: "10px 12px", 
                    borderRadius: "8px", 
                    border: "1px solid #ddd",
                    fontSize: "13px"
                  }}
                />
                <span style={{ color: "#999" }}>-</span>
                <input
                  type="number"
                  placeholder={getAContent('cmp_vetonest.com_Mx39Lp84Rt') || "Max"}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: "10px 12px", 
                    borderRadius: "8px", 
                    border: "1px solid #ddd",
                    fontSize: "13px"
                  }}
                />
              </div>
            </div>

            {(filterSpeciality || filterVideoOnly === true || filterVideoOnly === false || filterConsultationPlace || priceMin || priceMax) && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #eee" }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  🔍 {getAContent('cmp_vetonest.com_ActiveFilters_Label') || "Active filters"}:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {filterSpeciality && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      {allSpecialities.find(s => Number(s.id) === Number(filterSpeciality))?.name || filterSpeciality}
                      <button onClick={() => setFilterSpeciality("")} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  {filterVideoOnly === true && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      <i className="fa fa-video-camera" style={{ marginRight: '4px' }} /> Video available
                      <button onClick={() => setFilterVideoOnly(null)} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  {filterVideoOnly === false && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      <i className="fa fa-video-camera" style={{ marginRight: '4px' }} /> No video
                      <button onClick={() => setFilterVideoOnly(null)} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  {filterConsultationPlace === "atClinic" && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      🏥 At clinic
                      <button onClick={() => setFilterConsultationPlace("")} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  {filterConsultationPlace === "atHome" && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      🏠 At home
                      <button onClick={() => setFilterConsultationPlace("")} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  {(priceMin || priceMax) && (
                    <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px" }}>
                      💶 {priceMin || "0"} - {priceMax || "∞"} €
                      <button onClick={() => { setPriceMin(""); setPriceMax(""); }} style={{ marginLeft: "6px", border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setFilterSpeciality("");
                      setFilterVideoOnly(null);
                      setFilterConsultationPlace("");
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    style={{ 
                      background: "#FFDE59", 
                      border: "none", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      fontSize: "11px",
                      cursor: "pointer",
                      color: "#333"
                    }}
                  >
                    {getAContent('cmp_vetonest.com_ClearAll_Label') || "Clear all"}
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Vet List Column */}
        <div className="booking-vets">
          {vetList.length === 0 && <p style={{ color: "#888", marginTop: "20px" }}>{getAContent('cmp_vetonest.com_NoVetsAvailable_Txt')}</p>}

          {vetList.length > 0 && (
            <>
              <div className="selected-date-banner" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "16px" }}>📅</span>
                <span style={{ fontSize: "14px", color: "#333", flex: 1 }}>
                  {selectedDate ? `${getAContent('cmp_vetonest.com_SelectedDate_Label')}: ${formatDate(selectedDate, siteLocale)}${selectedTime ? " " + getAContent('cmp_vetonest.com_At_Prefix') + " " + selectedTime : ""}` : ""}
                </span>
                {isLoadingAvailability && (
                  <span style={{ background: "#f0f0f0", color: "#aaa", borderRadius: "10px", padding: "2px 8px", fontSize: "11px" }}>
                    ⏳ Loading...
                  </span>
                )}
              </div>

              <div className="total-vets-bar" style={{ 
                marginBottom: "12px",
                padding: "10px 0",
                display: "flex",
                alignItems: "center",
                gap: "0px",
                flexWrap: "wrap",
                position: "sticky",
				top: "var(--sticky-offset, 177px)",
                background: "#fff",
                zIndex: 5
              }}>
                <span style={{ fontSize: "14px", color: "#555" }}>
                  🔍 {getAContent('cmp_vetonest.com_TotalVets_Label') || "Total veterinarians"}: <strong>{totalVets}</strong>
                </span>
                {totalVets > 0 && (
                  <>
                    <span style={{ fontSize: "14px", color: "#999" }}>,&nbsp;</span>
                    <span style={{ fontSize: "13px", color: "#888" }}>
                      {getAContent('cmp_vetonest.com_Showing_Label') || "Showing"}: {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalVets)} / {totalVets}
                    </span>
                  </>
                )}
              </div>

              <div className="vet-list" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "4px", }}>
                {paginatedVets.map((vet) => {
                  const isSuggested = suggested.includes(vet);
                  const isSameCityVet = !isSuggested && sameCityVets.includes(vet);
                  const isSelectedVetCard = !!selectedVetId && vet.id === selectedVetId;
                  
                  return (
                    <VetCard 
                      key={vet.id} 
                      vet={vet} 
                      isRecommended={isSuggested} 
                      isSameLocation={isSameCityVet} 
                      isSelected={isSelectedVetCard}
                      availability={vetAvailability[vet.id] ?? null} 
                      leadTimeStatus={vetLeadTimeStatus[vet.id] ?? null}
                      onBook={handleBook} 
                      getAContent={getAContent} 
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #eee",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      fontSize: "13px"
                    }}
                  >
                    ← {getAContent('cmp_vetonest.com_Previous_Label') || "Previous"}
                  </button>
                  
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {getPageNumbers().map((page, idx) => (
                      page === '...' ? (
                        <span key={idx} style={{ padding: "6px 8px", color: "#999" }}>...</span>
                      ) : (
                        <button
                          key={idx}
                          onClick={() => goToPage(page)}
                          style={{
                            minWidth: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            border: currentPage === page ? "1px solid #FFDE59" : "1px solid #ddd",
                            backgroundColor: currentPage === page ? "#FFDE59" : "#fff",
                            cursor: "pointer",
                            fontWeight: currentPage === page ? 600 : 400,
                            color: currentPage === page ? "#333" : "#666",
                            fontSize: "14px"
                          }}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      fontSize: "13px"
                    }}
                  >
                    {getAContent('cmp_vetonest.com_Next_Label') || "Next"} →
                  </button>
                </div>
              )}

              {totalVets > itemsPerPage && (
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#666"
                }}>
                  <span>{getAContent('cmp_vetonest.com_Show_Label') || "Show"}:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "12px",
                      cursor: "pointer",
                      backgroundColor: "#fff"
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>{getAContent('cmp_vetonest.com_PerPage_Label') || "per page"}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Panel Column */}
        {hasAiPanel && (
        <div className="booking-right">
            <div className="ai-panel" style={{
              background: "#f0f7ff",
              border: "1px solid #c5deff",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              fontSize: "13px"
            }}>
              <strong style={{ fontSize: "14px" }}>{getAContent('cmp_vetonest.com_RecommendationAITool_Label')}</strong>
              <div style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: isTablet ? "row" : "column",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                {urgency && (
                  <div style={{ flex: isTablet ? "0 0 auto" : "unset" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_Urgency_Label')}</p>
                    <span style={{ background: urgencyColor(urgency), color: "#fff", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                      {getAContent(urgency)}
                    </span>
                  </div>
                )}
                {(symptoms.length > 0 || recSpecialityId) && (
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", flex: isTablet ? 1 : "unset" }}>
                    {symptoms.length > 0 && (
                      <div style={{ flex: 2, minWidth: "140px" }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_Symptoms_Label')}</p>
                        <p style={{ margin: 0, color: "#333" }}>{symptoms.join(", ")}</p>
                      </div>
                    )}
                    {recSpecialityId && (
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_SuggestedSpeciality_Label')}</p>
                        <span style={{ background: "#e3f2fd", color: "#1565c0", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                          {getSpecialityName(recSpecialityId)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {recClinicTypeId && (
                  <div style={{ flex: isTablet ? "0 0 auto" : "unset" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_SuggestedClinicType_Label')}</p>
                    <span style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                      {getClinicTypeName(recClinicTypeId)}
                    </span>
                  </div>
                )}
              </div>
            </div>
        </div>
        )}
      </div>

      {/* Unavailability Alert Modal */}
      {showUnavailableAlert && selectedVet && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUnavailableAlert(false); }}
        >
          <div className="modal-content" style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <p style={{ fontSize: "40px", margin: "0 0 8px" }}>⚠️</p>
            <h3 style={{ margin: "0 0 12px", color: "#333" }}>{getAContent('cmp_vetonest.com_Warning_Label')}</h3>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px" }}>
              <strong>{selectedVet?.fullName}</strong> {getAContent('cmp_vetonest.com_IsNotOpenOn_Txt')} <strong>{formatDate(selectedDate, siteLocale)}</strong> {getAContent('cmp_vetonest.com_At_Prefix')} <strong>{selectedTime}</strong>.<br/>
              {getAContent('cmp_vetonest.com_TryAnotherDateOrVet_Txt')}
            </p>
            <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
              <button
                onClick={() => setShowUnavailableAlert(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: "13px" }}
              >
                {getAContent('cmp_vetonest.com_ChooseAnotherVet_Btn')}
              </button>
              <button
                onClick={() => { setShowUnavailableAlert(false); setShowModal(true); }}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #f44336", background: "#fff5f5", color: "#f44336", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
              >
                {getAContent('cmp_vetonest.com_ContinueAnyway_Btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal - Compact Version */}
	{showModal && selectedVet && selectedVet.profileStatus === 'active' && (
	  <div
		className="modal-overlay"
		style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}
		onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
	  >
		<div className="modal-content" style={{ 
		  background: "#fff", 
		  borderRadius: "14px", 
		  padding: "20px", 
		  width: "100%", 
		  maxWidth: "480px",
		  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
		  // No maxHeight / overflowY — let content breathe naturally.
		  // If the device is very short, the overlay padding handles clipping.
		}}>
				  {/* Override BookingPriceSummary's yellow total to black bold */}
		  <style>{`
		    .booking-price-summary-wrap strong,
		    .booking-price-summary-wrap b,
		    .booking-price-summary-wrap [style*="color: #FF"],
		    .booking-price-summary-wrap [style*="color:#FF"],
		    .booking-price-summary-wrap [style*="color: gold"],
		    .booking-price-summary-wrap [style*="color: rgb(255"] {
		      color: #111 !important;
		      font-weight: 700 !important;
		    }
		  `}</style>
		  {bookingDone ? (
			// ─── SUCCESS STATE ────────────────────────────────────────────────
			<div style={{ textAlign: "center", padding: "8px 0" }}>
			  <p style={{ fontSize: "40px", margin: 0 }}>⏳</p>
			  <h3 style={{ marginTop: "8px", marginBottom: "4px", fontSize: "18px" }}>
				{getAContent('cmp_vetonest.com_PendingApproval_Title') || 'Awaiting Vet Approval'}
			  </h3>
			  <p style={{ color: "#555", marginBottom: "4px", fontSize: "14px" }}>
				{getAContent('cmp_vetonest.com_PendingApproval_Message') || 
				  'Your booking request has been sent. You will be notified once the veterinarian accepts your request.'}
			  </p>
			 
			  <div style={{ 
				padding: "8px 12px", 
				background: "#f0f7ff", 
				borderRadius: "8px",
				border: "1px solid #c5deff",
				textAlign: "left",
				marginBottom: "12px"
			  }}>
				<p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
				  <strong>📅 {getAContent('cmp_vetonest.com_Date_Label')}:</strong> {formatDate(selectedDate, siteLocale)}
				</p>
				<p style={{ margin: "2px 0 0", fontSize: "13px", color: "#555" }}>
				  <strong>🕐 {getAContent('cmp_vetonest.com_Time_Label')}:</strong> {selectedTime}
				  {selectedVet?.timezone && (
				    <span style={{ marginLeft: "4px", fontSize: "11px", color: "#888", fontWeight: 400 }}>
				      ({selectedVet.timezone})
				    </span>
				  )}
				</p>
			  </div>
			  <button 
				onClick={() => { setShowModal(false); navigate('/consultation/list'); }} 
				className="consultation-next-button" 
				style={{ marginTop: "8px", padding: "10px 20px" }}
			  >
				{getAContent('cmp_vetonest.com_TrackRequest_Btn') || 'Track Request →'}
			  </button>
			</div>
		  ) : (
			// ─── BOOKING FORM ──────────────────────────────────────────────────
			<>
			  <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "17px" }}>
				{getAContent('cmp_vetonest.com_ApptRecap_Title')}
			  </h3>
			  
			  {/* ─── Vet Info - Compact ──────────────────────────────────────── */}
			  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
				<img 
				  src={selectedVet.picture || "/img/user/1.jpg"} 
				  alt={selectedVet.fullName}
				  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
				/>
				<div style={{ flex: 1 }}>
				  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
					<span style={{ fontWeight: 600, fontSize: "14px" }}>{selectedVet.fullName}</span>
					{selectedVet.vetTitle?.code && (
					  <span style={{ fontSize: "10px", color: "#1565c0", background: "#e3f2fd", padding: "1px 6px", borderRadius: "8px" }}>
						{selectedVet.vetTitle.code}
					  </span>
					)}
					{selectedVet.verificationStatus && selectedVet.verificationStatus.code === 'verified' && (
					  <span style={{ fontSize: "9px", color: "#4caf50", background: "#e8f5e9", padding: "1px 6px", borderRadius: "8px" }}>
						✓ Verified
					  </span>
					)}
				  </div>
				  <div style={{ fontSize: "12px", color: "#666", display: "flex", flexWrap: "wrap", gap: "4px" }}>
					<span>{selectedVet.specialityName || ""}</span>
					{selectedVet.clinicName && <span>• {selectedVet.clinicName}</span>}
					{(selectedVet.city || selectedVet.villes?.[0]) && <span>• {selectedVet.city || selectedVet.villes[0]}</span>}
				  </div>
				</div>
			  </div>

			  <hr style={{ borderColor: "#eee", margin: "6px 0" }} />

			  {/* ─── Pet & Consultation Details - Compact ────────────────────── */}
			  <div style={{ margin: "0" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
				  <img
					src={selectedPet?.picture ? `${base_url}uploads/files/pets/${selectedPet.picture}` : photoAnimalDefaultSrc}
					alt={selectedPet?.nom}
					style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
				  />
				  <span style={{ fontSize: "13px" }}>
					<strong>{getAContent('cmp_vetonest.com_Pet_Label')}:</strong> {selectedPet?.nom}
				  </span>
				</div>

				{/* ─── Consultation Type - Compact ────────────────────────────── */}
				<div style={{ margin: "6px 0 4px" }}>
				  <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>
					{getAContent('cmp_vetonest.com_ConsultationType_Label') || 'Consultation type'}:
				  </p>

				  {/* ── Build the two possible options as proper JSX ─────────────
				      Physical option is hidden for online-only vets (they have no
				      in-person consultations). Video option is always rendered so
				      the pet owner can confirm which format they're booking. */}
				  {(() => {
					const isOnlineOnly = selectedVet.practiceMode === 'online';
					const physicalLabel = selectedVet.practiceMode === 'clinic'
					  ? getAContent('cmp_vetonest.com_AtClinic_Txt') || 'At clinic'
					  : getAContent('cmp_vetonest.com_AtHome_Txt')   || 'At home';
					const physicalPrice = selectedVet.tarifConsultation;
					const videoPrice    = selectedVet.tarifConsultationVideo;

					const OptionBtn = ({ value, icon, iconClass, label, price }) => {
					  const isSelected = consultationType === value;
					  return (
						<label style={{
						  flex: 1,
						  display: "flex",
						  alignItems: "center",
						  justifyContent: "center",
						  gap: "6px",
						  padding: "6px 8px",
						  borderRadius: "6px",
						  border: `2px solid ${isSelected ? "#1565c0" : "#ddd"}`,
						  background: isSelected ? "#e3f2fd" : "#fafafa",
						  cursor: price ? "pointer" : "not-allowed",
						  opacity: price ? 1 : 0.5,
						  fontSize: "12px",
						  fontWeight: isSelected ? 600 : 400,
						  color: isSelected ? "#1565c0" : "#555",
						  transition: "all 0.15s",
						}}>
						  <input
							type="radio"
							name="consultationType"
							value={value}
							checked={isSelected}
							onChange={() => price && setConsultationType(value)}
							disabled={!price}
							style={{ display: "none" }}
						  />
						  <i className={iconClass} />
						  {label}
						  {!price && (
							<span style={{ fontSize: "9px", color: "#999" }}>
							  ({getAContent('cmp_vetonest.com_NotAvailable_Label') || 'N/A'})
							</span>
						  )}
						</label>
					  );
					};

					return (
					  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
						{!isOnlineOnly && (
						  <OptionBtn
							value="physical"
							iconClass="fa fa-map-marker"
							label={physicalLabel}
							price={physicalPrice}
						  />
						)}
						{selectedVet.videoAllowed && (
						  <OptionBtn
							value="online"
							iconClass="fa fa-video-camera"
							label={getAContent('cmp_vetonest.com_Online_Txt') || 'Remote'}
							price={videoPrice}
						  />
						)}
					  </div>
					);
				  })()}
				</div>

				{/* ─── Date & Time ─────────────────────────────────────────────── */}
				<div style={{ display: "flex", gap: "16px", margin: "4px 0", flexWrap: "wrap" }}>
				  <p style={{ margin: 0, fontSize: "13px" }}>
					<strong>{getAContent('cmp_vetonest.com_Date_Label')}:</strong> {formatDate(selectedDate, siteLocale)}
				  </p>
				  <p style={{ margin: 0, fontSize: "13px" }}>
					<strong>{getAContent('cmp_vetonest.com_Time_Label')}:</strong> {selectedTime || "—"}
					{selectedVet?.timezone && (
					  <span style={{ marginLeft: "4px", fontSize: "11px", color: "#888", fontWeight: 400 }}>
					    ({selectedVet.timezone})
					  </span>
					)}
				  </p>
				</div>
				
				{/* ─── Price Summary ───────────────────────────────────────────── */}
				<div style={{ margin: "6px 0" }}>
				  <div className="booking-price-summary-wrap">
					  <BookingPriceSummary 
						vet={selectedVet}
						consultationType={consultationType}
						compact={false}
					  />
					</div>
				</div>
				
				{/* ─── Urgency & Symptoms (if present) ────────────────────────── */}
				{urgency && (
				  <p style={{ margin: "2px 0", fontSize: "13px" }}>
					<strong>{getAContent('cmp_vetonest.com_Urgency_Label')}:</strong>{" "}
					<span style={{ color: urgencyColor(urgency), fontWeight: 600 }}>{getAContent(urgency)}</span>
				  </p>
				)}
				{symptoms.length > 0 && (
				  <p style={{ margin: "2px 0", fontSize: "13px" }}>
					<strong>{getAContent('cmp_vetonest.com_Symptoms_Label')}:</strong> {symptoms.join(", ")}
				  </p>
				)}
			  </div>

			  <hr style={{ borderColor: "#eee", margin: "6px 0" }} />

			  {/* ─── Confirm Button ────────────────────────────────────────────── */}
			  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
				<button 
				  onClick={handleConfirmBooking} 
				  className="consultation-next-button" 
				  style={{ 
					flex: 2, 
					opacity: isSaving ? 0.7 : 1, 
					cursor: isSaving ? "not-allowed" : "pointer",
					padding: "10px",
					fontSize: "14px"
				  }} 
				  disabled={isSaving}
				>
				  {isSaving 
					? getAContent('cmp_vetonest.com_Saving_Status') || 'Processing...'
					: `${getAContent('cmp_vetonest.com_Zx71Pa91Qm') || 'Confirm'} →`}
				</button>
			  </div>
			</>
		  )}
		</div>
	  </div>
	)}

      {/* Global responsive styles */}
		<style jsx>{`
		  .consultation-booking-container {
			width: 100%;
			max-width: 1920px;
			margin: 0 auto;
			padding: 0 24px;
			box-sizing: border-box;
		  }
		  .booking-layout {
			display: grid;
			grid-template-columns: minmax(220px, 0.6fr) minmax(500px, 3.4fr) minmax(260px, 0.85fr);
			gap: 24px;
			align-items: start;
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
		  }
		  .booking-layout.booking-layout--no-ai {
			grid-template-columns: minmax(220px, 0.6fr) minmax(500px, 3.8fr);
		  }
		  .booking-filters {
			background: #fafafa;
			border-radius: 12px;
			padding: 16px;
			position: sticky;
			top: var(--sticky-offset, 230px);
			min-width: 0;
			overflow: hidden;
		  }
		  .booking-filters input,
		  .booking-filters select {
			max-width: 100%;
			box-sizing: border-box;
		  }
		  .booking-vets {
			overflow: visible;
			min-width: 0;
			width: 100%;
		  }
		  .vet-card {
			width: 100%;
			max-width: none !important;
			margin-bottom: 0 !important;
			box-sizing: border-box;
		  }
		  .booking-right {
			position: sticky;
			top: var(--sticky-offset, 230px);
			min-width: 0;
		  }
		  
		  /* Vet card responsive adjustments */
		  .vet-card-content {
			display: flex !important;
			gap: 16px !important;
			padding: 14px !important;
			flex-wrap: wrap !important;
		  }
		  
		  .vet-info {
			flex: 2 1 280px !important;
			min-width: 0 !important;
			display: flex !important;
			flex-direction: column !important;
			align-items: flex-start !important;
		  }
		  
		  .vet-meta {
			flex: 1 1 200px !important;
			min-width: 180px !important;
			display: flex !important;
			flex-direction: column !important;
			align-items: flex-start !important;
			gap: 10px !important;
			text-align: left !important;
			border-left: 1px solid #f0f0f0 !important;
			padding-left: 20px !important;
		  }
		  
		  @media (max-width: 1200px) {
			.booking-layout {
			  grid-template-columns: minmax(200px, 0.65fr) minmax(440px, 3fr) minmax(240px, 0.9fr);
			  gap: 20px;
			}
			.booking-layout.booking-layout--no-ai {
			  grid-template-columns: minmax(200px, 0.65fr) minmax(460px, 3.4fr);
			}
		  }
		  
		  @media (max-width: 992px) {
			.booking-layout {
			  grid-template-columns: minmax(180px, 0.7fr) minmax(360px, 2.6fr) minmax(200px, 0.85fr);
			  gap: 16px;
			}
			.booking-layout.booking-layout--no-ai {
			  grid-template-columns: minmax(180px, 0.7fr) minmax(380px, 2.9fr);
			}
		  }
		  
		  @media (max-width: 768px) {
			.booking-layout {
			  grid-template-columns: 1fr;
			  gap: 16px;
			}
			.booking-layout.booking-layout--no-ai {
			  grid-template-columns: 1fr;
			}
			.booking-filters {
			  position: static;
			  width: 100%;
			  border: 1px solid #e8e8e8;
			}
			.booking-right {
			  grid-column: 1;
			  position: static;
			}
			.selected-date-banner {
			  margin-top: 0 !important;
			}
			.total-vets-bar {
			  top: 0 !important;
			}
			.ai-panel {
			  margin-bottom: 0 !important;
			}
			.vet-card-content {
			  flex-direction: column !important;
			  align-items: stretch !important;
			}
			.vet-info {
			  flex-direction: column !important;
			  gap: 8px !important;
			}
			.vet-meta {
			  align-items: flex-start !important;
			  text-align: left !important;
			  width: 100% !important;
			  border-left: none !important;
			  padding-left: 0 !important;
			  border-top: 1px solid #f0f0f0 !important;
			  padding-top: 10px !important;
			  margin-top: 4px !important;
			}
		  }
		  
		  @media (max-width: 480px) {
			.consultation-booking-container {
			  padding: 0 8px;
			}
			.booking-filters {
			  padding: 12px;
			}
			.vet-card-content {
			  padding: 12px !important;
			}
			.modal-content {
			  padding: 20px !important;
			  border-radius: 10px !important;
			}
			.vet-list {
			  gap: 12px !important;
			}
			.booking-filters input,
			.booking-filters select {
			  font-size: 13px !important;
			  padding: 8px 10px !important;
			}
		  }
		`}</style>
    </div>
  );
};

export default ConsultationBooking;