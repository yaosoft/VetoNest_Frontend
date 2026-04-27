import React, { useState, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";
import { AuthContext } from "../context/AuthProvider";
import { useCachedData } from "../hooks/useCachedData";

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

// ── Vet card ─────────────────────────────────────────────────────────────────
const VetCard = React.memo(({ vet, isRecommended, isSameLocation, availability, onBook, getAContent }) => (
  <div style={{
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    overflow: "hidden",
    boxShadow: isRecommended ? "0 0 0 2px #FFDE59" : isSameLocation ? "0 0 0 2px #66bb6a" : "none",
    transition: "box-shadow 0.15s",
  }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = isRecommended
      ? "0 0 0 2px #FFDE59, 0 2px 12px rgba(0,0,0,0.1)"
      : isSameLocation
        ? "0 0 0 2px #66bb6a, 0 2px 12px rgba(0,0,0,0.1)"
        : "0 2px 12px rgba(0,0,0,0.1)"}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = isRecommended ? "0 0 0 2px #FFDE59" : isSameLocation ? "0 0 0 2px #66bb6a" : "none"}
  >
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

    <div style={{ display: "flex", gap: "14px", padding: "14px", alignItems: "flex-start" }}>
      <img
        src={vet.picture || "/img/user/1.jpg"}
        alt={vet.fullName}
        style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>{vet.fullName}</p>
        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#666" }}>
          {vet.specialityName || "—"}
        </p>

        {vet.clinicName && (
          <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#888" }}>
            🏥 {vet.clinicName}
          </p>
        )}
        {vet.clinicTypeName && (
          <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#aaa" }}>
            {vet.clinicTypeName}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px", color: "#555", marginTop: "4px" }}>
          {(vet.city || vet.villes?.[0]) && <span>📍 {vet.city || vet.villes[0]}</span>}
          {vet.tarifConsultation && <span>💶 {vet.tarifConsultation} €</span>}
        </div>

        {vet.videoAllowed === true && (
          <div style={{ marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "#1565c0", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              🎥 {getAContent('cmp_vetonest.com_VideoConsultationAvailable_Label')}
            </span>
          </div>
        )}

        <div style={{ marginTop: "8px", paddingTop: "4px" }}>
          {availability === null && <span style={{ color: "#aaa", fontSize: "12px" }}>⏳ {getAContent('cmp_vetonest.com_CheckingAvailability_Txt')}</span>}
          {availability === true && <span style={{ color: "#4caf50", fontWeight: 600, fontSize: "12px" }}>✓ {getAContent('cmp_vetonest.com_AvailableSelectedDate_Txt')}</span>}
          {availability === false && <span style={{ fontSize: "12px" }}>⚠️ {getAContent('cmp_vetonest.com_NotAvailableSelectedDate_Txt')}</span>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
        <button
          onClick={() => onBook(vet)}
          className="consultation-next-button"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          {getAContent('cmp_vetonest.com_Booking_Label')}
        </button>
        <a
          href={`/vet-profile?vetId=${vet.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "#888", textDecoration: "underline" }}
          onClick={(e) => e.stopPropagation()}
        >
          {getAContent('cmp_vetonest.com_ViewProfile_Btn')} →
        </a>
      </div>
    </div>
  </div>
));

VetCard.displayName = 'VetCard';

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

  // ✅ Moved inside the component - this is correct!
  const { fetchWithCache } = useCachedData();

  // Cache for availability results to prevent duplicate API calls
  const vetListCache = useRef({});
  const availabilityCache = useRef(new Map());
  const abortControllers = useRef(new Map());
  const checkedVetsRef = useRef(new Set());
  const profileLoadedRef = useRef(false);

  // ── Fetch vets on mount if not already loaded ────────────────────────────
  useEffect(() => {
    if (!vetos.length) getVetos();
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

  const recSpecialityId = recommendedSpecialityId ? Number(recommendedSpecialityId) : null;
  const recClinicTypeId = recommendedClinicTypeId ? Number(recommendedClinicTypeId) : null;
  const symptoms = symptomData?.symptoms ?? [];
  const urgency = symptomData?.urgency ?? "";
  
  // ── Filters ────────────────────────────────────────────────────────────
  const [filterSpeciality, setFilterSpeciality] = useState("");
  const [filterClinicType, setFilterClinicType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [filterVideoOnly, setFilterVideoOnly] = useState(false);

  // ── Modal ───────────────────────────────────────────────────────────────
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

  // ── Location autocomplete loader ─────────────────────────────────────────
  const loadLocation = useMemo(() => {
    let timer;
    return (text) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const data = await getPlaceAutocomplete(text.trim(), 8);
          const unique = Array.from(new Map(data.map((x) => [x.value, x])).values());
          setLocationOptions(unique.map((x) => ({
            value: x.value,
            label: (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa fa-map-marker" />
                {x.value}
              </div>
            ),
          })));
        } catch {
          setLocationOptions([]);
        }
      }, 300);
    };
  }, [getPlaceAutocomplete]);

  // ── Build vet list ──────────────────────────────────────────────────────
  const vetList = useMemo(() => {
    const cacheKey = `vetList_${JSON.stringify(vetos?.map(v => v.id))}_${JSON.stringify(etablissements?.map(e => e.id))}`;
    
    if (vetListCache.current[cacheKey]) {
      return vetListCache.current[cacheKey];
    }
    
    const result = (vetos || []).map((veto) => {
      const clinic = (etablissements || []).find((e) => e.creatorProfile?.id === veto.id);
      const specialityId = Number(veto.vetoSpecialite?.id ?? veto.vetoSpecialiteTab?.id ?? null);
      
      // Extract city from veto profile
      let vetoCity = null;
      let vetoCityId = null;
      
      if (veto.locationCity) {
        vetoCity = veto.locationCity;
        vetoCityId = veto.locationCityId;
      } else if (veto.villes && veto.villes.length > 0) {
        vetoCity = veto.villes[0];
      }
      
      return {
        id:                veto.id,
        fullName:          `${veto.prenom ?? ""} ${veto.nom ?? ""}`.trim(),
        picture:           veto.picture ? `${base_url}uploads/files/profile/${veto.picture}` : null,
        specialityId,
        specialityName:    getSpecialityName(specialityId),
        villes:            veto.villes ?? [],
        city:              vetoCity,
        cityId:            vetoCityId,
        atHome:            veto.atHome ?? false,
        tarifConsultation: veto.tarifConsultation ?? null,
        videoAllowed:      veto.videoAllowed === true || veto.videoAllowed === 1 || veto.videoAllowed === "1",
        clinicId:          clinic?.id ?? null,
        clinicTypeId:      clinic?.etablissementType?.id ?? null,
        clinicTypeName:    getClinicTypeName(clinic?.etablissementType?.id),
        clinicName:        clinic?.nom ?? null,
      };
    });
    
    vetListCache.current[cacheKey] = result;
    return result;
  }, [vetos, etablissements, base_url, getSpecialityName, getClinicTypeName]);

  // ── Build preselected vet card data ────────────────────────────────────────
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
      id:                preselectedVet.id,
      fullName:          `${preselectedVet.prenom ?? ""} ${preselectedVet.nom ?? ""}`.trim(),
      picture:           preselectedVet.picture ? `${base_url}uploads/files/profile/${preselectedVet.picture}` : null,
      specialityId,
      specialityName:    getSpecialityName(specialityId),
      villes:            preselectedVet.villes ?? [],
      city:              vetoCity,
      cityId:            vetoCityId,
      atHome:            preselectedVet.atHome ?? false,
      tarifConsultation: preselectedVet.tarifConsultation ?? null,
      videoAllowed:      preselectedVet.videoAllowed === true || preselectedVet.videoAllowed === 1 || preselectedVet.videoAllowed === "1",
      clinicId:          clinic?.id ?? null,
      clinicTypeId:      clinic?.etablissementType?.id ?? null,
      clinicTypeName:    getClinicTypeName(clinic?.etablissementType?.id),
      clinicName:        clinic?.nom ?? null,
    };
  }, [preselectedVet, etablissements, base_url, getSpecialityName, getClinicTypeName]);

  // ── Apply filters ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const result = vetList.filter((v) => {
      if (!v) return false;
      
      const matchSpec = !filterSpeciality || v.specialityId === Number(filterSpeciality);
      const matchClinic = !filterClinicType || v.clinicTypeId === Number(filterClinicType);
      const matchVideo = !filterVideoOnly || v.videoAllowed === true;
      const matchSearch = !searchText ||
        (v.fullName || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (v.clinicName || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (v.villes || []).some((ville) => (ville || "").toLowerCase().includes(searchText.toLowerCase()));
      const matchLocation = !filterLocation ||
        (v.villes || []).some((ville) => (ville || "").toLowerCase().includes(filterLocation.toLowerCase()));
      
      return matchSpec && matchClinic && matchVideo && matchSearch && matchLocation;
    });
    
    return result;
  }, [vetList, filterSpeciality, filterClinicType, filterVideoOnly, searchText, filterLocation]);

  // ── Split: best match vs others (using city) ──────────────────────────
  const isMatch = useCallback((v) => {
    if (!recSpecialityId) return false;
    const vetSpecialityId = v?.specialityId ?? 0;
    return vetSpecialityId === recSpecialityId;
  }, [recSpecialityId]);

  // ── Check if vet is in the same city as user ──────────────────────────────
  const isSameCity = useCallback((v) => {
    if (!userCity) return false;
    
    // Get vet city from the vet object
    const vetCity = v?.city || (v?.villes && v.villes[0]);
    
    if (!vetCity) return false;
    
    // Compare trimmed, case-insensitive city names
    const normalizedUserCity = userCity.toLowerCase().trim();
    const normalizedVetCity = vetCity.toLowerCase().trim();
    
    return normalizedUserCity === normalizedVetCity;
  }, [userCity]);

  const suggested = useMemo(() => filtered.filter(isMatch), [filtered, isMatch]);
  const sameCityVets = useMemo(() => filtered.filter((v) => !isMatch(v) && isSameCity(v)), [filtered, isMatch, isSameCity]);
  const otherVets = useMemo(() => filtered.filter((v) => !isMatch(v) && !isSameCity(v)), [filtered, isMatch, isSameCity]);

  // ── Check vet availability for selectedDate with caching ─────────────────
  const checkVetAvailability = useCallback(async (vetId) => {
    // Check cache first
    const cacheKey = `${vetId}_${selectedDate}_${selectedTime}`;
    if (availabilityCache.current.has(cacheKey)) {
      setVetAvailability(prev => ({ ...prev, [vetId]: availabilityCache.current.get(cacheKey) }));
      return;
    }

    // Cancel any pending request for this vet
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
      const slotIndex = jsDay === 0 ? 6 : jsDay - 1;
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

  // ── Batch availability check (only for visible vets) ─────────────────────
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

  // Trigger availability check ONLY when date or time actually changes.
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

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // ── Booking ───────────────────────────────────────────────────────────────
  const handleBook = useCallback((vet) => {
    setSelectedVet(vet);
    setBookingDone(false);
    setConsultationType("physical");
    setSavedSymptomId(null);
    const avail = vetAvailability[vet.id];
    if (avail === false) {
      setShowUnavailableAlert(true);
    } else {
      setShowUnavailableAlert(false);
      setShowModal(true);
    }
  }, [vetAvailability]);

  const handleConfirmBooking = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
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

      const consultationTypeId = consultationType === "online" ? 1 :
                                  consultationType === "physical" && selectedVet?.clinicId ? 3 : 2;

      const consultationPayload = {
        carnetAnimalId: selectedPet?.id ?? null,
        profileVetoId: selectedVet?.id ?? null,
        startingDatetime: `${selectedDate} ${selectedTime}`,
        consultationTypeId,
        consultationStatusId: 1,
        etablissementId: selectedVet?.clinicId ?? null,
        description: symptomData?.complaint ?? '',
        symptomId,
        enabled: true,
      };

      const consultationRep = await saveConsultation(consultationPayload);

      if (consultationRep?.success) {
        try {
          const { vetUserId, vetEmail, vetDisplayName } = consultationRep;
          if (vetUserId) await postNotification({ notificationTypeId: 4, receiverId: vetUserId });

          if (vetEmail) {
            await sendEmail({
              to_email: vetEmail,
              to_domain: vetEmail.split('@')[1],
              subject: `New consultation request — ${siteName}`,
              siteURL: siteURL,
              siteName: siteName,
              siteDomain: siteDomainName,
              siteEmail: siteEmail,
              siteLocale: siteLocale,
              emailTemplate: 'consultation_request',
              vetName: vetDisplayName ?? selectedVet?.fullName ?? '',
              ownerName: `${profile?.prenom ?? user?.prenom ?? ''} ${profile?.nom ?? user?.nom ?? ''}`.trim(),
              petName: selectedPet?.nom ?? '',
              consultationDate: selectedDate ?? '',
              consultationTime: selectedTime ?? '',
              complaint: symptomData?.complaint ?? '',
            });
          }
        } catch {
          console.warn("Notification/email sending failed");
        }
        setBookingDone(true);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Load user profile with city — run once only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!profileId || !profileTypeId || profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    const loadProfile = async () => {
      try {
        const profileData = await profileGet(profileId, profileTypeId);
        
        console.log('=== PROFILE DATA ===');
        console.log('locationCity:', profileData?.locationCity);
        console.log('locationCityId:', profileData?.locationCityId);
        
        // Extract city from profile (locationCity)
        let cityValue = null;
        let cityIdValue = null;

        if (profileData?.locationCity) {
          cityValue = profileData.locationCity;
          cityIdValue = profileData.locationCityId;
          console.log('Found city:', cityValue, 'ID:', cityIdValue);
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

  return (
    <div className="consultation-booking-container">
      <div className="booking-layout">
        {/* Filters Column */}
        <div className="booking-filters">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* Search by name - First */}
            <input
              type="text"
              placeholder={getAContent('cmp_vetonest.com_SearchVetClinic_Placeholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: "160px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
            />

            {/* VIDEO CONSULTATION FILTER */}
            <select
              value={filterVideoOnly ? "yes" : ""}
              onChange={(e) => setFilterVideoOnly(e.target.value === "yes")}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
            >
              <option value="">🎥 {getAContent('cmp_vetonest.com_VideoConsultationAvailable_Label') || "Consultation vidéo"}</option>
              <option value="yes">{getAContent('cmp_vetonest.com_P91ms6QaTf') || "🎥 Oui — vidéo uniquement"}</option>
            </select>

            {/* City/Location filter */}
            <AutoComplete
              value={filterLocation}
              options={locationOptions}
              onSearch={(t) => { setFilterLocation(t); loadLocation(t); }}
              onSelect={(val) => setFilterLocation(val)}
              onFocus={() => loadLocation(filterLocation)}
              allowClear
              onClear={() => setFilterLocation("")}
              style={{ flex: 1, minWidth: "160px" }}
            >
              <input
                placeholder={getAContent('cmp_vetonest.com_City_Label')}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </AutoComplete>

            {/* Speciality filter */}
            <select value={filterSpeciality} onChange={(e) => setFilterSpeciality(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}>
              <option value="">{getAContent('cmp_vetonest.com_AllSpecialities_Filter')}</option>
              {(allSpecialities || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tagRef ? getAContent(s.tagRef) || s.name : s.name}
                </option>
              ))}
            </select>

            {/* Clinic type filter */}
            <select value={filterClinicType} onChange={(e) => setFilterClinicType(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}>
              <option value="">{getAContent('cmp_vetonest.com_AllClinicTypes_Filter')}</option>
              {(allEtablissementTypes || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tagRef ? getAContent(c.tagRef) || c.nom : c.nom}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Vet List Column */}
        <div className="booking-vets">
          {vetList.length === 0 && <p style={{ color: "#888", marginTop: "20px" }}>{getAContent('cmp_vetonest.com_NoVetsAvailable_Txt')}</p>}

          {vetList.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 12px", flexWrap: "wrap" }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {preselectedVetCard && (
                  <div style={{ borderRadius: "10px", border: "1px solid #90caf9", background: "#fff", overflow: "hidden", boxShadow: "0 0 0 2px #1976d2" }}>
                    <div style={{ background: "#1976d2", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      📌 { getAContent('cmp_vetonest.com_YourChosenVet_Badge') }
                    </div>
                    <VetCard vet={preselectedVetCard} isRecommended={false} isSameLocation={false} availability={vetAvailability[preselectedVetCard.id] ?? null} onBook={handleBook} getAContent={getAContent} />
                  </div>
                )}
                {suggested.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => (
                  <VetCard key={vet.id} vet={vet} isRecommended={true} isSameLocation={false} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />
                ))}
                {sameCityVets.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => (
                  <VetCard key={vet.id} vet={vet} isRecommended={false} isSameLocation={true} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />
                ))}
                {otherVets.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => (
                  <VetCard key={vet.id} vet={vet} isRecommended={false} isSameLocation={false} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* AI Panel Column */}
        <div className="booking-right">
          {(recSpecialityId || recClinicTypeId || urgency || symptoms.length > 0) && (
            <div style={{ background: "#f0f7ff", border: "1px solid #c5deff", borderRadius: "8px", padding: "16px", marginBottom: "16px", fontSize: "13px" }}>
              <strong style={{ fontSize: "14px" }}>{getAContent('cmp_vetonest.com_RecommendationAITool_Label')}</strong>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {urgency && (
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_Urgency_Label')}</p>
                    <span style={{ background: urgencyColor(urgency), color: "#fff", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                      {getAContent(urgency)}
                    </span>
                  </div>
                )}
                {(symptoms.length > 0 || recSpecialityId) && (
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {symptoms.length > 0 && (
                      <div style={{ flex: 2, minWidth: "160px" }}>
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
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{getAContent('cmp_vetonest.com_SuggestedClinicType_Label')}</p>
                    <span style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                      {getClinicTypeName(recClinicTypeId)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unavailability Alert Modal */}
      {showUnavailableAlert && selectedVet && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUnavailableAlert(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <p style={{ fontSize: "40px", margin: "0 0 8px" }}>⚠️</p>
            <h3 style={{ margin: "0 0 12px", color: "#333" }}>{getAContent('cmp_vetonest.com_Warning_Label')}</h3>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px" }}>
              <strong>{selectedVet?.fullName}</strong> {getAContent('cmp_vetonest.com_IsNotOpenOn_Txt')} <strong>{formatDate(selectedDate, siteLocale)}</strong> {getAContent('cmp_vetonest.com_At_Prefix')} <strong>{selectedTime}</strong>.<br/>
              {getAContent('cmp_vetonest.com_TryAnotherDateOrVet_Txt')}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
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

      {/* Booking Modal */}
      {showModal && selectedVet && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
            {bookingDone ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "48px", margin: 0 }}>✅</p>
                <h3 style={{ marginTop: "12px" }}>{getAContent('cmp_vetonest.com_ApptRequestSent_Title')}</h3>
                <p style={{ color: "#555" }}>
                  {getAContent('cmp_vetonest.com_ApptBookedFor_Txt')} <strong>{formatDate(selectedDate, siteLocale)}</strong> at <strong>{selectedTime}</strong>.
                </p>
                <p style={{ color: "#555" }}>
                  {getAContent('cmp_vetonest.com_ConfirmationFrom_Txt')} <strong>{selectedVet.fullName}</strong> {getAContent('cmp_vetonest.com_MailboxInfo_Txt')}
                </p>
                <button onClick={() => { setShowModal(false); navigate('/consultation/list'); }} className="consultation-next-button" style={{ marginTop: "16px" }}>{getAContent('cmp_vetonest.com_Close_Btn')}</button>
              </div>
            ) : (
              <>
                <h3 style={{ marginTop: 0 }}>{getAContent('cmp_vetonest.com_ApptRecap_Title')}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <img src={selectedVet.picture || "/img/user/1.jpg"} alt={selectedVet.fullName}
                    style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedVet.fullName}</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{selectedVet.specialityName}</p>
                    {selectedVet.clinicName && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>🏥 {selectedVet.clinicName}</p>
                    )}
                    {(selectedVet.city || selectedVet.villes?.[0]) && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>📍 {selectedVet.city || selectedVet.villes[0]}</p>
                    )}
                  </div>
                </div>
                <hr style={{ borderColor: "#eee" }} />
                <div style={{ margin: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
                    <img
                      src={selectedPet?.picture ? `${base_url}uploads/files/pets/${selectedPet.picture}` : photoAnimalDefaultSrc}
                      alt={selectedPet?.nom}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Pet_Label')}:</strong> {selectedPet?.nom}</span>
                  </div>

                  <div style={{ margin: "10px 0 6px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_ConsultationType_Label')}:</strong></p>
                    {selectedVet.videoAllowed === true ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        {[
                          {
                            value: "physical",
                            label: selectedVet.clinicName ? `🏥 ${getAContent('cmp_vetonest.com_At_Prefix')} ${selectedVet.clinicName}` : `🏠 ${getAContent('cmp_vetonest.com_AtHome_Label')}`,
                          },
                          { value: "online", label: `🎥 ${getAContent('cmp_vetonest.com_Online_Label')}` },
                        ].map(({ value, label }) => (
                          <label
                            key={value}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: `2px solid ${consultationType === value ? "#1565c0" : "#ddd"}`,
                              background: consultationType === value ? "#e3f2fd" : "#fafafa",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: consultationType === value ? 600 : 400,
                              color: consultationType === value ? "#1565c0" : "#555",
                              transition: "all 0.15s",
                            }}
                          >
                            <input
                              type="radio"
                              name="consultationType"
                              value={value}
                              checked={consultationType === value}
                              onChange={() => setConsultationType(value)}
                              style={{ display: "none" }}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    ) : selectedVet.clinicName ? (
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>🏥 { getAContent( 'cmp_vetonest.com_At_LocationPrefix' ) } {selectedVet.clinicName}</p>
                    ) : (
					<p style={{ margin: 0, fontSize: "13px", color: "#555" }}>🏠 { getAContent( 'cmp_vetonest.com_AtHome_Label' ) }</p>
                    )}
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Date_Label')}:</strong> {formatDate(selectedDate, siteLocale)}</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Time_Label')}:</strong> {selectedTime || "—"}</p>
                  {urgency && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      <strong>{getAContent('cmp_vetonest.com_Urgency_Label')}:</strong>{" "}
                      <span style={{ color: urgencyColor(urgency), fontWeight: 600 }}>{getAContent(urgency)}</span>
                    </p>
                  )}
                  {symptoms.length > 0 && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Symptoms_Label')}:</strong> {symptoms.join(", ")}</p>
                  )}
                </div>
                <hr style={{ borderColor: "#eee" }} />
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button 
                    onClick={handleConfirmBooking} 
                    className="consultation-next-button" 
                    style={{ 
                      flex: 2, 
                      opacity: isSaving ? 0.7 : 1, 
                      cursor: isSaving ? "not-allowed" : "pointer" 
                    }} 
                    disabled={isSaving}
                  >
                    {isSaving 
                      ? getAContent('cmp_vetonest.com_Saving_Status') 
                      : `${getAContent('cmp_vetonest.com_ConfirmAppt_Btn')} →`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationBooking;