import React, { useState, useContext, useEffect, useMemo } from "react";
import { AutoComplete } from "antd";
import { SiteContext } from "../context/site";
import { AuthContext } from "../context/AuthProvider";
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
const VetCard = ({ vet, isRecommended, isSameLocation, availability, onBook, getAContent }) => (
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
        ✓ Best match
      </div>
    )}
    {!isRecommended && isSameLocation && (
      <div style={{ background: "#66bb6a", padding: "3px 14px", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
        📍 Same location
      </div>
    )}

    <div style={{ display: "flex", gap: "14px", padding: "14px", alignItems: "flex-start" }}>
      {/* Photo */}
      <img
        src={vet.picture || "/img/user/1.jpg"}
        alt={vet.fullName}
        style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "15px" }}>{vet.fullName}</p>

        {/* Speciality */}
        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#666" }}>
          {vet.specialityName || "—"}
        </p>

        {/* Clinic name + type — only if linked to a clinic */}
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

        {/* Tags row */}
		<div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px", color: "#555", marginTop: "4px" }}>
		  {vet.villes?.[0] && <span>📍 {vet.villes[0]}</span>}
		  {vet.tarifConsultation && <span>💶 {vet.tarifConsultation} €</span>}
		  {availability === null && <span style={{ color: "#aaa", fontSize: "12px" }}>⏳ {getAContent('cmp_vetonest.com_CheckingAvailability_Txt')}</span>}
		  {availability === true && <span style={{ color: "#4caf50", fontWeight: 600, fontSize: "12px" }}>✓ {getAContent('cmp_vetonest.com_AvailableSelectedDate_Txt')}</span>}
		   {vet.hasVideoConsult && (
			<p style={{ margin: "6px 0 0", fontSize: "12px", color: "#1565c0" }}>🎥 {getAContent( 'cmp_vetonest.com_VideoConsultationAvailable_Label' )}</p>
			)}
		  {availability === false && <span style={{ fontSize: "12px" }}>⚠️ {getAContent('cmp_vetonest.com_NotAvailableSelectedDate_Txt')}</span>}
		</div>

      </div>

      {/* Actions */}
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
);

// ════════════════════════════════════════════════════════════════════════════
const ConsultationBooking = ({ params }) => {
	
  const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		setUser,
  } = useContext( AuthContext );
  
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
	siteDomain,
	siteEmail,
  } = useContext(SiteContext);

  //
  

  const getSpecialityName = (id) => {
console.log( 'iiiiiiiiiiiiiiiiii id', id );
    if (!id) return "—";
    const found = allSpecialities?.find((s) => Number(s.id) === Number(id));
    if (!found) return "—";
    const translated = found.tagRef ? getAContent(found.tagRef) : null;
    return translated || found.name || found.nom || "—";
  };

  const getClinicTypeName = (id) => {

    if (!id) return "—";
    const list  = Array.isArray(allEtablissementTypes) ? allEtablissementTypes : [];
    const found = list.find((c) => Number(c.id) === Number(id));
    if (!found) return "—";
    return found.tagRef ? getAContent(found.tagRef) : (found.nom ?? "—");
  };

  const { 
	selectedPet, 
	selectedDate, 
	selectedTime, 
	symptomData,
	preselectedVet,
	recommendedSpecialityId,
	recommendedClinicTypeId, 
  } = params;

  // Normalize to Number — the AI returns integers but context state may hold strings
  const recSpecialityId = recommendedSpecialityId ? Number(recommendedSpecialityId) : null;
  const recClinicTypeId = recommendedClinicTypeId ? Number(recommendedClinicTypeId) : null;
  const symptoms        = symptomData?.symptoms ?? [];
  const urgency         = symptomData?.urgency  ?? "";
  // ── Filters ────────────────────────────────────────────────────────────
  const [filterSpeciality, setFilterSpeciality] = useState("");
  const [filterClinicType, setFilterClinicType] = useState("");
  const [searchText, setSearchText]             = useState("");
  const [filterLocation, setFilterLocation]     = useState("");
  const [locationOptions, setLocationOptions]   = useState([]);

  // ── Modal ───────────────────────────────────────────────────────────────
  const [selectedVet, setSelectedVet] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [consultationType, setConsultationType] = useState("physical"); // "physical" | "online"
  const [savedSymptomId, setSavedSymptomId] = useState(null); // set after symptom is persisted
  const [isSaving, setIsSaving]             = useState(false); // prevent double-submit
  const [userCity, setUserCity]           = useState(null); // loaded from user profile
  const [vetAvailability, setVetAvailability] = useState({}); // { [vetId]: true|false|null }
  const [loadingAvailability, setLoadingAvailability] = useState({}); // { [vetId]: true|false }
  const [showUnavailableAlert, setShowUnavailableAlert] = useState(false);

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

  // ── Build vet list from real data shape ──────────────────────────────────
  // veto.vetoSpecialite = { id, name }
  // veto.villes = ["Paris"]  (directly on veto, not on clinic)
  const vetList = useMemo(() => (vetos || []).map((veto) => {
    const clinic = (etablissements || []).find((e) => e.creatorProfile?.id === veto.id);
    const specialityId = Number(veto.vetoSpecialite?.id ?? veto.vetoSpecialiteTab?.id ?? null);
    return {
      id:                veto.id,
      fullName:          `${veto.prenom ?? ""} ${veto.nom ?? ""}`.trim(),
      picture:           veto.picture ? `${base_url}uploads/files/profile/${veto.picture}` : null,
      specialityId,
      specialityName:    getSpecialityName(specialityId),
      villes:            veto.villes               ?? [],
      atHome:            veto.atHome               ?? false,
      tarifConsultation: veto.tarifConsultation     ?? null,
      hasVideoConsult:   !!veto.tarifConsultationVideo && veto.tarifConsultationVideo !== "0",
      clinicId:          clinic?.id                    ?? null,
      clinicTypeId:      clinic?.etablissementType?.id ?? null,
      clinicTypeName:    getClinicTypeName(clinic?.etablissementType?.id),
      clinicName:        clinic?.nom                   ?? null,
    };
  }), [vetos, etablissements, allSpecialities, allEtablissementTypes]);

  // ── Build preselected vet card data (same shape as vetList) ────────────
  const preselectedVetCard = preselectedVet ? (() => {
    const clinic = (etablissements || []).find((e) => e.creatorProfile?.id === preselectedVet.id);
    const specialityId = Number(preselectedVet.vetoSpecialite?.id ?? null);
    return {
      id:                preselectedVet.id,
      fullName:          `${preselectedVet.prenom ?? ""} ${preselectedVet.nom ?? ""}`.trim(),
      picture:           preselectedVet.picture ? `${base_url}uploads/files/profile/${preselectedVet.picture}` : null,
      specialityId,
      specialityName:    getSpecialityName(specialityId),
      villes:            preselectedVet.villes ?? [],
      atHome:            preselectedVet.atHome ?? false,
      tarifConsultation: preselectedVet.tarifConsultation ?? null,
      hasVideoConsult:   false,
      clinicId:          clinic?.id ?? null,
      clinicTypeId:      clinic?.etablissementType?.id ?? null,
      clinicTypeName:    getClinicTypeName(clinic?.etablissementType?.id),
      clinicName:        clinic?.nom ?? null,
    };
  })() : null;

  // ── Apply filters ────────────────────────────────────────────────────────
  const filtered = vetList.filter((v) => {
    const matchSpec   = !filterSpeciality || v.specialityId === Number(filterSpeciality);
    const matchClinic = !filterClinicType || v.clinicTypeId === Number(filterClinicType);
    const matchSearch = !searchText ||
      v.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      (v.clinicName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      v.villes.some((ville) => ville.toLowerCase().includes(searchText.toLowerCase()));
    const matchLocation = !filterLocation ||
      v.villes.some((ville) => ville.toLowerCase().includes(filterLocation.toLowerCase()));
    return matchSpec && matchClinic && matchSearch && matchLocation;
  });

  // ── Split: best match vs others ──────────────────────────────────────────
  const isMatch        = (v) => recSpecialityId && v.specialityId === recSpecialityId;
  const isSameCity     = (v) => userCity &&
    v.villes.some((ville) => ville.toLowerCase() === userCity.toLowerCase());
  const suggested        = filtered.filter(isMatch);
  const sameLocationVets = filtered.filter((v) => !isMatch(v) && isSameCity(v));
  const otherVets        = filtered.filter((v) => !isMatch(v) && !isSameCity(v));

  // ── Booking ───────────────────────────────────────────────────────────────
  const handleBook = (vet) => {
    setSelectedVet(vet);
    setBookingDone(false);
    setConsultationType("physical"); // reset to default each time
    setSavedSymptomId(null);         // reset symptom ID for fresh booking
    const avail = vetAvailability[vet.id];
    if (avail === false) {
      setShowUnavailableAlert(true);
    } else {
      setShowUnavailableAlert(false);
      setShowModal(true);
    }
  };
  // Trigger availability check for all vets once vetList + selectedDate + selectedTime are ready
  useEffect(() => {
    if (!selectedDate || !selectedTime || vetList.length === 0) return;
    // Reset so checks re-run with the new time
    setVetAvailability({});
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (!selectedDate || !selectedTime || vetList.length === 0) return;
    vetList.forEach((vet) => {
      if (vetAvailability[vet.id] === undefined) {
        checkVetAvailability(vet.id);
      }
    });
  }, [selectedDate, selectedTime, vetList.length, vetAvailability]);

  const handleConfirmBooking = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let symptomId = savedSymptomId;

      // ── Step 1: persist symptom if AI data exists and not already saved ──
      if (symptomData && !symptomId) {
        const symptomPayload = {
          primaryComplaint:        symptomData.complaint                              ?? null,
          detectedSymptoms:        JSON.stringify(symptomData.symptoms               ?? []),
          urgency:                 symptomData.urgency                               ?? null,
          followUpAnswers:         JSON.stringify(symptomData.followUpAnswers        ?? null),
          recommendedSpecialityId: symptomData.recommendedSpecialityId               ?? null,
          recommendedClinicTypeId: symptomData.recommendedClinicTypeId               ?? null,
        };

        const rep = await saveSymtom(symptomPayload);

        if (rep?.success && rep?.symptomId) {
          symptomId = rep.symptomId;
          setSavedSymptomId(symptomId);
        } else {
          console.warn("Symptom save failed — continuing without symptomId", rep);
        }
      }

      // ── Step 2: persist the consultation ────────────────────────────────
      // Map consultationType UI value to API ID: 1=Online, 2=At home, 3=At clinic
      const consultationTypeId =
        consultationType === "online"                            ? 1 :
        consultationType === "physical" && selectedVet?.clinicId ? 3 : 2;

      const consultationPayload = {
        carnetAnimalId:       selectedPet?.id                  ?? null,
        profileVetoId:        selectedVet?.id                  ?? null,
        startingDatetime:     `${selectedDate} ${selectedTime}`,   // "YYYY-MM-DD HH:mm"
        consultationTypeId,
        consultationStatusId: 1,                                    // pending
        etablissementId:      selectedVet?.clinicId            ?? null,
        description:          symptomData?.complaint           ?? '',
        symptomId,
        enabled:              true,
      };

      const consultationRep = await saveConsultation(consultationPayload);

      if (consultationRep?.success) {
        // ── Step 3: notify vet (type 4 = appointment request received)
        try {
          const { vetUserId, vetEmail, vetDisplayName } = consultationRep;
          if (vetUserId) await postNotification({ notificationTypeId: 4, receiverId: vetUserId });

          // ── Step 4: send email to vet ──────────────────────────────────
          if (vetEmail) {
            await sendEmail({
              to_email:         vetEmail,
              to_domain:        siteDomain,
              subject:          `New consultation request — ${siteName}`,
              siteURL,
              siteName,
              siteDomain,
              siteEmail,
              emailTemplate:    'consultation_request',
              vetName:          vetDisplayName ?? selectedVet?.fullName ?? '',
              ownerName:        `${profile?.prenom ?? ''} ${profile?.nom ?? ''}`.trim(),
              petName:          selectedPet?.nom ?? '',
              consultationDate: selectedDate ?? '',
              consultationTime: selectedTime ?? '',
              complaint:        symptomData?.complaint ?? '',
            });
          }
        } catch {
          console.warn("Notification/email sending failed — booking still confirmed");
        }
        setBookingDone(true);
      } else {
        console.error("Consultation save failed:", consultationRep);
      }

    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const [ profile, setProfile ] = useState( '' );
  useEffect(() => {
	const a = async() => {
		// profile data
		const profile = await profileGet( profileId, profileTypeId );
		if (profile?.city) setUserCity(profile.city);
		setProfile( profile );
	}
	a()
  }, []);
	
  // ── Check vet availability for selectedDate ─────────────────────────────
  const checkVetAvailability = async (vetId) => {
    if (vetAvailability[vetId] !== undefined) return; // already loaded
    setLoadingAvailability((prev) => ({ ...prev, [vetId]: true }));
    try {
      const timeslot = await getTimeslot(vetId);
      const slots    = timeslot; // object keyed 0–6

      // JS getDay(): 0=Sun … 6=Sat → remap to 0=Mon … 6=Sun (matches slot index)
      const jsDay     = new Date(selectedDate).getDay();
      const slotIndex = jsDay === 0 ? 6 : jsDay - 1;

      const slot = slots[slotIndex];

      // Slot must be open AND have valid times
      if (!slot?.opened || !slot.startTime?.date || !slot.endTime?.date) {
        setVetAvailability((prev) => ({ ...prev, [vetId]: false }));
        return;
      }

      // Build a comparable time from selectedTime (e.g. "14:30")
      // and the slot's startTime/endTime (e.g. "2025-11-22 08:04:00.000000")
      const [chosenHour, chosenMin] = (selectedTime || "00:00").split(":").map(Number);
      const chosenMinutes = chosenHour * 60 + chosenMin;

      const parseSlotTime = (dateStr) => {
        const timePart = dateStr.split(" ")[1]; // "08:04:00.000000"
        const [h, m]   = timePart.split(":").map(Number);
        return h * 60 + m;
      };

      const startMinutes = parseSlotTime(slot.startTime.date);
      const endMinutes   = parseSlotTime(slot.endTime.date);

      const isAvailable = chosenMinutes >= startMinutes && chosenMinutes < endMinutes;

      setVetAvailability((prev) => ({ ...prev, [vetId]: isAvailable }));
    } catch {
      setVetAvailability((prev) => ({ ...prev, [vetId]: null })); // unknown
    } finally {
      setLoadingAvailability((prev) => ({ ...prev, [vetId]: false }));
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="consultation-booking-container">
      <div className="booking-layout">

        {/* ══ MIDDLE-LEFT COLUMN — filters ══ */}
        <div className="booking-filters">

      {/* ── Filters ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {/* Search by name */}
        <input
          type="text"
          placeholder={getAContent('cmp_vetonest.com_SearchVetClinic_Placeholder')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, minWidth: "160px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
        />

        {/* Location autocomplete */}
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

        {/* Speciality */}
        <select value={filterSpeciality} onChange={(e) => setFilterSpeciality(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd" }}>
          <option value="">{getAContent('cmp_vetonest.com_AllSpecialities_Filter')}</option>
          {(allSpecialities || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.tagRef ? getAContent(s.tagRef) || s.name : s.name}
            </option>
          ))}
        </select>

        {/* Clinic type */}
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
        </div>{/* end booking-filters */}

        {/* ══ MIDDLE-RIGHT COLUMN — vet list ══ */}
        <div className="booking-vets">

      {/* ── Empty state — only when vetos context is truly empty ── */}
      {vetList.length === 0 && <p style={{ color: "#888", marginTop: "20px" }}>{getAContent('cmp_vetonest.com_NoVetsAvailable_Txt')}</p>}

      {/* ── Book a vet ── */}
      {vetList.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 12px" }}>
            <span style={{ fontSize: "16px" }}>📅</span>
            <span style={{ fontSize: "15px", color: "#333", whiteSpace: "nowrap" }}>
              {selectedDate ? `${getAContent('cmp_vetonest.com_SelectedDate_Label')}: ${formatDate(selectedDate, siteLocale)}${selectedTime ? " " + getAContent('cmp_vetonest.com_At_Prefix') + " " + selectedTime : ""}` : ""}
            </span>
            {(() => {
              const availableCount = filtered.filter(v => vetAvailability[v.id] === true).length;
              const checkedCount   = filtered.filter(v => vetAvailability[v.id] !== undefined).length;
              return checkedCount > 0 && availableCount > 0 ? (
                <span style={{ background: "#e6f7e6", color: "#388e3c", borderRadius: "10px", padding: "1px 8px", fontSize: "12px", fontWeight: 600 }}>
                  ✓ {availableCount}
                </span>
              ) : checkedCount < filtered.length ? (
                <span style={{ background: "#f0f0f0", color: "#aaa", borderRadius: "10px", padding: "1px 8px", fontSize: "12px" }}>
                  ⏳
                </span>
              ) : null;
            })()}
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* ── Preselected vet (from vet profile page) — always first ── */}
            {preselectedVetCard && (
              <div style={{ borderRadius: "10px", border: "1px solid #90caf9", background: "#fff", overflow: "hidden", boxShadow: "0 0 0 2px #1976d2" }}>
                <div style={{ background: "#1976d2", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                  📌 Your chosen vet
                </div>
                <VetCard vet={preselectedVetCard} isRecommended={false} isSameLocation={false} availability={vetAvailability[preselectedVetCard.id] ?? null} onBook={handleBook} getAContent={getAContent} />
              </div>
            )}
            {suggested.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => <VetCard key={vet.id} vet={vet} isRecommended={true} isSameLocation={false} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />)}
            {sameLocationVets.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => <VetCard key={vet.id} vet={vet} isRecommended={false} isSameLocation={true} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />)}
            {otherVets.filter(v => !preselectedVetCard || v.id !== preselectedVetCard.id).map((vet) => <VetCard key={vet.id} vet={vet} isRecommended={false} isSameLocation={false} availability={vetAvailability[vet.id] ?? null} onBook={handleBook} getAContent={getAContent} />)}
          </div>
        </>
      )}

        </div>{/* end booking-vets */}

        {/* ══ RIGHT COLUMN — AI panel (sticky) ══ */}
        <div className="booking-right">
          {/* ── AI recommendation banner ── */}
      {(recSpecialityId || recClinicTypeId || urgency || symptoms.length > 0) && (
        <div style={{ background: "#f0f7ff", border: "1px solid #c5deff", borderRadius: "8px", padding: "16px", marginBottom: "16px", fontSize: "13px" }}>
          <strong style={{ fontSize: "14px" }}>{ getAContent( 'cmp_vetonest.com_RecommendationAITool_Label' ) }</strong>

          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Urgency */}
            {urgency && (
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{ getAContent( 'cmp_vetonest.com_Urgency_Label' ) }</p> 
                <span style={{ background: urgencyColor(urgency), color: "#fff", borderRadius: "12px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
                  {urgency}
                </span>
              </div>
            )}

            {/* Symptoms + Suggested speciality side by side */}
            {(symptoms.length > 0 || recSpecialityId) && (
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {symptoms.length > 0 && (
                  <div style={{ flex: 2, minWidth: "160px" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#555" }}>{ getAContent( 'cmp_vetonest.com_Symptoms_Label' ) }</p>
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

            {/* Suggested clinic type */}
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
        </div>{/* end booking-right */}

      </div>{/* end booking-layout */}

      {/* ── Unavailability alert ── */}
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

      {/* ── Booking modal ── */}
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
                <button onClick={() => setShowModal(false)} className="consultation-next-button" style={{ marginTop: "16px" }}>{getAContent('cmp_vetonest.com_Close_Btn')}</button>
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
                    {selectedVet.villes?.[0] && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>📍 {selectedVet.villes[0]}</p>
                    )}
                  </div>
                </div>
                <hr style={{ borderColor: "#eee" }} />
                <div style={{ margin: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
                    <img
                      src={selectedPet?.picture ? `${base_url}uploads/files/pets/${selectedPet.picture}` : "/img/user/1.jpg"}
                      alt={selectedPet?.nom}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Pet_Label')}:</strong> {selectedPet?.nom}</span>
                  </div>

                  {/* ── Consultation type ── */}
                  <div style={{ margin: "10px 0 6px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_ConsultationType_Label')}:</strong></p>
                    {selectedVet.hasVideoConsult ? (
                      // Vet offers video — let user choose
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
                      // Vet has a clinic — at clinic
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>🏥 At {selectedVet.clinicName}</p>
                    ) : (
                      // No clinic, no video — at home
                      <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>🏠 At home</p>
                    )}
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Date_Label')}:</strong> {formatDate(selectedDate, siteLocale)}</p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>{getAContent('cmp_vetonest.com_Time_Label')}:</strong> {selectedTime || "—"}</p>
                  {urgency && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      <strong>{getAContent('cmp_vetonest.com_Urgency_Label')}:</strong>{" "}
                      <span style={{ color: urgencyColor(urgency), fontWeight: 600 }}>{urgency}</span>
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