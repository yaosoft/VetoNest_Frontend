// src/components/ConsultationProcess.js

import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { SiteContext } from "../context/site";
import { AuthContext } from "../context/AuthProvider";
import { DatePicker, TimePicker, Button, ConfigProvider, Spin, Tooltip, Tag, Avatar, Alert } from "antd";
import { 
  GlobalOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Ant Design locale imports
import locale_it from 'antd/locale/it_IT';
import locale_fr from 'antd/locale/fr_FR';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_en from 'antd/locale/en_US';
import locale_et from 'antd/locale/et_EE';

// Day.js locales
import 'dayjs/locale/it';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/et';

// Component imports
import ConsultationPetSelection from "./ConsultationPetSelection";
import ConsultationSymptoms from "./ConsultationSymptoms";
import ConsultationBooking from "./ConsultationBooking";
import { usePetList } from "../hooks/usePetList";

// Utils imports
import { getTimezoneDisplay, getTimezoneOffset } from "../utils/timezoneUtils";
import { useConsultationRules } from "../context/ConsultationRulesContext";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Memoized StepNav component
const StepNav = React.memo(({ step, maxReached, onStepClick, steps, getAContent }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "5px",
    marginLeft: "24px",
    marginRight: "24px",
    userSelect: "none",
  }}>
    {steps.map((s, i) => {
      const isActive    = s.id === step;
      const isCompleted = s.id < step;
      const isReachable = s.id <= maxReached;

      return (
        <React.Fragment key={s.id}>
          <div
            onClick={() => isReachable && onStepClick(s.id)}
            title={s.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isReachable ? "pointer" : "default",
              flex: "0 0 auto",
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isCompleted ? "16px" : "18px",
              fontWeight: 700,
              transition: "all 0.2s",
              background: isActive ? "#FFDE59" : isCompleted ? "#52c41a" : "#f0f0f0",
              color: isActive ? "#333" : isCompleted ? "#fff" : "#bbb",
              boxShadow: isActive ? "0 2px 8px rgba(22,119,255,0.35)" : "none",
              border: isActive ? "2px solid #FFDE59" : "2px solid transparent",
            }}>
              {isCompleted ? "✓" : s.icon}
            </div>
            <span style={{
              marginTop: 5,
              fontSize: 11,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#b8a000" : isCompleted ? "#52c41a" : "#aaa",
              whiteSpace: "nowrap",
            }}>
              {s.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: 3,
              margin: "0 6px",
              marginBottom: 18,
              borderRadius: 2,
              background: s.id < step ? "#52c41a" : "#f0f0f0",
              transition: "background 0.3s",
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
));

StepNav.displayName = 'StepNav';

const ConsultationProcess = ({ animals: propAnimals }) => {
  const navigate = useNavigate();

  const {
    base_url,
    getAContent,
    photoAnimalDefaultSrc,
    currentConsultationDate,
    setCurrentConsultationDate,
    currentConsultationPet,
    setCurrentConsultationPet,
    consultationSelectedVet,
    currentConsultationTimeslot,
    setConsultationTimeslot,
    recommendedSpecialityId,
    recommendedClinicTypeId,
    siteLocale,
    vetos,
    profileGet,
    setConsultationSelectedVet,
    getTimeslot,
    getAbsences,
    consultationSelectedDate,
    setConsultationSelectedDate,
    getVetConsultationList,
  } = useContext(SiteContext);

  const { profileId, profileTypeId, user } = useContext(AuthContext);

  // ─── Consultation Rules Context ──────────────────────────────────────────
  const {
    allTypes,
    rules,
    loading: rulesLoading,
    fetchAllTypes,
    fetchRulesForType,
    selectedType,
    getCurrentRules,
    canBookAtTime,
    getEarliestBookingTime,
    formatLeadTime,
  } = useConsultationRules();

  // Use the cached pet list hook
  const { pets: cachedPets, loading: petsLoading, error: petsError } = usePetList();
  
  // Use propAnimals if provided (for backward compatibility), otherwise use cached pets
  const animals = propAnimals && propAnimals.length > 0 ? propAnimals : cachedPets;

  // ─── ALL STATE DECLARATIONS MUST COME FIRST ─────────────────────────────
  
  // State for user profile (to get timezone from backend)
  const [userProfile, setUserProfile] = useState(null);
  const profileFetchedRef = useRef(false);

  // State for vet absences (closed dates)
  const [vetAbsences, setVetAbsences] = useState([]);
  const [loadingVetData, setLoadingVetData] = useState(false);
  const vetDataFetchedRef = useRef(null);

  // Add local state for timeslot to avoid context issues
  const [localTimeslot, setLocalTimeslot] = useState(null);
  const localTimeslotRef = useRef(null);

  // State for vet consultations (for slot validation)
  const [vetConsultations, setVetConsultations] = useState([]);
  const [slotAvailable, setSlotAvailable] = useState(true);
  const [slotChecking, setSlotChecking] = useState(false);
  const vetConsultationsFetchedRef = useRef(null);

  // Fresh vet capabilities (atHome / videoAllowed), refetched from the
  // profileVeto/show endpoint whenever a vet is selected - consultationSelectedVet
  // is often just a snapshot taken at selection time (from search results, the
  // public profile page, etc.) and can go stale if the vet's own settings
  // change afterwards, so this must not be trusted on its own for filtering
  // consultation types.
  const [vetCapabilities, setVetCapabilities] = useState(null);
  const vetCapabilitiesFetchedRef = useRef(null);

  // ─── Min Booking Lead Time Validation State ─────────────────────────────
  const [leadTimeValidation, setLeadTimeValidation] = useState({
    isValid: false,
    message: null,
    type: null,
    availableTypes: [],
    unavailableTypes: [],
    earliestTime: null,
  });

  // ─── Pet Selection State ──────────────────────────────────────────────────
  const [selectedPet, setSelectedPet] = useState(() => currentConsultationPet);

  // ─── Step Navigation State ───────────────────────────────────────────────
  const initialStep = useMemo(() => (currentConsultationPet ? 2 : 1), [currentConsultationPet]);
  const [step, setStep] = useState(initialStep);
  const [maxReached, setMaxReached] = useState(1);
  const [symptomData, setSymptomData] = useState(null);

  // ─── Symptom State ────────────────────────────────────────────────────────
  const [symptomComplaint, setSymptomComplaint] = useState("");
  const [symptomAiSymptoms, setSymptomAiSymptoms] = useState([]);
  const [symptomAiUrgency, setSymptomAiUrgency] = useState("");
  const [symptomFollowUpQs, setSymptomFollowUpQs] = useState([]);
  const [symptomAnswers, setSymptomAnswers] = useState({});
  const [symptomAiData, setSymptomAiData] = useState(null);

  // ─── Date and Time State ──────────────────────────────────────────────────
  const getInitialDate = useCallback(() => {
    if (consultationSelectedDate) {
      const dateObj = dayjs(consultationSelectedDate);
      if (dateObj.isValid()) {
        const today = dayjs().startOf('day');
        return dateObj.isBefore(today) ? dateObj.add(7, 'day') : dateObj;
      }
    }
    if (currentConsultationDate) {
      return dayjs(currentConsultationDate);
    }
    return null;
  }, [consultationSelectedDate, currentConsultationDate]);

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [time, setTime] = useState(null);

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const getVetConsultationListRef = useRef(getVetConsultationList);

  // ─── Effects (after all state declarations) ──────────────────────────────
  
  useEffect(() => {
    getVetConsultationListRef.current = getVetConsultationList;
  }, [getVetConsultationList]);

  useEffect(() => {
    localTimeslotRef.current = localTimeslot;
  }, [localTimeslot]);

  // ─── Load consultation rules on mount ────────────────────────────────────
  useEffect(() => {
    const loadRules = async () => {
      await fetchAllTypes();
    };
    loadRules();
  }, [fetchAllTypes]);

  // Fetch user profile only once when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (profileFetchedRef.current || !profileId || !profileTypeId) {
        return;
      }
      
      try {
        const profile = await profileGet(profileId, profileTypeId);
        setUserProfile(profile);
        profileFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [profileId, profileTypeId, profileGet]);

  // Fetch vet timeslot and absences when a vet is selected
  useEffect(() => {
    const fetchVetSchedule = async () => {
      const vetId = consultationSelectedVet?.id;
      
      if (!vetId) {
        setVetAbsences([]);
        setLoadingVetData(false);
        setLocalTimeslot(null);
        return;
      }

      if (vetDataFetchedRef.current === vetId) {
        return;
      }
      // Claim this vetId immediately (before awaiting anything). Without this,
      // any re-render that happens while the request is still in flight
      // (e.g. triggered by an unrelated socket.io/context update) sees the
      // ref not-yet-updated and fires an extra duplicate fetch for the same
      // vet - this is what was causing the burst of repeated requests.
      vetDataFetchedRef.current = vetId;

      setLoadingVetData(true);
      try {
        const timeslot = await getTimeslot(vetId);
        
        if (timeslot) {
          const timeslotValues = Object.values(timeslot || {});
          setLocalTimeslot(timeslotValues);
          setConsultationTimeslot(timeslotValues);
        }

        const absences = await getAbsences(vetId);
        setVetAbsences(absences || []);
      } catch (error) {
        console.error('❌ Error loading vet schedule:', error);
        setVetAbsences([]);
        // Allow retry on the next render since this attempt failed
        vetDataFetchedRef.current = null;
      } finally {
        setLoadingVetData(false);
      }
    };

    fetchVetSchedule();
  }, [consultationSelectedVet, getTimeslot, getAbsences, setConsultationTimeslot]);

  // Fetch accepted consultations for the selected vet
  useEffect(() => {
    const vetId = consultationSelectedVet?.id || 
                  consultationSelectedVet?.profileVetoId || 
                  consultationSelectedVet?.profileVeto?.id ||
                  consultationSelectedVet?.vetId;

    if (!vetId) {
      setVetConsultations([]);
      setSlotAvailable(true);
      vetConsultationsFetchedRef.current = null;
      return;
    }

    if (vetConsultationsFetchedRef.current === vetId) {
      return;
    }
    // Claim this vetId immediately, before awaiting - see the matching
    // comment in the vet-schedule effect above for why this matters.
    vetConsultationsFetchedRef.current = vetId;

    const fetchConsultations = async () => {
      setSlotChecking(true);
      try {
        const data = await getVetConsultationListRef.current(vetId);
        const accepted = data?.consultations?.filter(
          c => c.consultationStatus?.id === 2
        ) || [];
        setVetConsultations(accepted);
      } catch (error) {
        console.error('Error fetching vet consultations:', error);
        setVetConsultations([]);
        // Allow retry on the next render since this attempt failed
        vetConsultationsFetchedRef.current = null;
      } finally {
        setSlotChecking(false);
      }
    };

    fetchConsultations();
  }, [consultationSelectedVet]);

  // Fetch fresh vet capabilities (atHome / videoAllowed) for the selected vet.
  // consultationSelectedVet is frequently just a snapshot captured at
  // selection time (search results, the public profile page, a previous
  // session, etc.) - if the vet changes their own settings afterwards, that
  // snapshot goes stale. This always re-checks the current truth from
  // profileVeto/show so consultation-type filtering reflects what the vet
  // actually offers right now, not what they offered when this page loaded.
  useEffect(() => {
    const vetId = consultationSelectedVet?.id ||
                  consultationSelectedVet?.profileVetoId ||
                  consultationSelectedVet?.profileVeto?.id ||
                  consultationSelectedVet?.vetId;

    if (!vetId) {
      setVetCapabilities(null);
      vetCapabilitiesFetchedRef.current = null;
      return;
    }

    if (vetCapabilitiesFetchedRef.current === vetId) {
      return;
    }
    // Claim this vetId immediately, before awaiting - see the matching
    // comment in the vet-schedule effect above for why this matters.
    vetCapabilitiesFetchedRef.current = vetId;

    const fetchVetCapabilities = async () => {
      try {
        // profileTypeId !== 1 routes profileGet to the profileVeto/show
        // endpoint (see SiteContext.profileGet); 2 is used elsewhere in
        // this codebase to mean "vet".
        const freshProfile = await profileGet(vetId, 2);
        // Derive practiceMode from vetoMode (new API field) with atHome fallback
        // so the type-filtering logic always has a clean 3-way mode value.
        const vetoModeName = freshProfile?.vetoMode?.name ?? null;
        const practiceMode = vetoModeName
          ?? ( freshProfile?.atHome === true  ? 'home'
             : freshProfile?.atHome === false ? 'clinic'
             : null );
        setVetCapabilities({
          practiceMode,
          vetoMode: freshProfile?.vetoMode ?? null,
          atHome: freshProfile?.atHome,        // kept for any legacy callers
          videoAllowed: freshProfile?.videoAllowed,
        });
      } catch (error) {
        console.error('Error fetching fresh vet capabilities:', error);
        setVetCapabilities(null);
        // Allow retry on the next render since this attempt failed
        vetCapabilitiesFetchedRef.current = null;
      }
    };

    fetchVetCapabilities();
  }, [consultationSelectedVet, profileGet]);

  // Watch for consultationSelectedDate changes
  useEffect(() => {
    if (!consultationSelectedDate) return;
    const dateObj = dayjs(consultationSelectedDate);
    if (!dateObj.isValid()) return;

    const today = dayjs().startOf('day');
    if (dateObj.isBefore(today)) {
      const newDate = dateObj.add(7, 'day');
      setSelectedDate(newDate);
      setConsultationSelectedDate(newDate.format('YYYY-MM-DD'));
    } else {
      setSelectedDate(dateObj);
    }
  }, [consultationSelectedDate, setConsultationSelectedDate]);

  // ─── Validate Min Booking Lead Time ──────────────────────────────────────
  const validateMinBookingLeadTime = useCallback((date, timeValue) => {
    if (!date || !timeValue) {
      setLeadTimeValidation({
        isValid: false,
        message: null,
        type: null,
        availableTypes: [],
        unavailableTypes: [],
        earliestTime: null,
      });
      return;
    }

    // Check if rules are loaded
    if (rulesLoading || !allTypes || allTypes.length === 0) {
      setLeadTimeValidation({
        isValid: false,
        message: getAContent('cmp_vetonest.com_LoadingRules_Txt') || 'Loading consultation rules...',
        type: 'info',
        availableTypes: [],
        unavailableTypes: [],
        earliestTime: null,
      });
      return;
    }

    // ─── Get vet's available consultation types ──────────────────────────────
    let availableTypesForVet = [];
    const notOfferedTypes = [];
    
    if (consultationSelectedVet) {
      // Vet is selected - filter based on what they offer
      // NOTE: consultationSelectedVet can arrive either as the flat profileVeto
      // object, or as a wrapper with the real data nested under `.profileVeto`
      // (same as getVetDisplayName / getVetCity / getVetTimezone below), so we
      // normalize it the same way here before reading atHome / videoAllowed.
      const vet = consultationSelectedVet;
      const profileVeto = vet.profileVeto || vet;

      // Prefer the freshly-fetched capabilities (see the vetCapabilities effect
      // above) over whatever is baked into consultationSelectedVet - the latter
      // can be a stale snapshot taken at selection time and won't reflect
      // changes the vet has made to their own settings since then.
      const rawVetoModeName = vetCapabilities?.vetoMode?.name
        ?? profileVeto.vetoMode?.name
        ?? vet.vetoMode?.name
        ?? null;
      const practiceMode = vetCapabilities?.practiceMode
        ?? rawVetoModeName
        ?? ( (vetCapabilities?.atHome ?? profileVeto.atHome ?? vet.atHome) === true  ? 'home'
           : (vetCapabilities?.atHome ?? profileVeto.atHome ?? vet.atHome) === false ? 'clinic'
           : null );
      const videoAllowed = vetCapabilities?.videoAllowed ?? profileVeto.videoAllowed ?? vet.videoAllowed;

      allTypes.forEach((type, index) => {
        // Home consultation: only for home-visiting vets
        if (type.type === 'home') {
          if (practiceMode !== 'home') return;
        }

        // Video is a platform pillar - always shown in the info section.
        // When the vet doesn't offer it we tag it 'notOffered' so the unified
        // list renders an explicit row instead of silently omitting it.
        if (type.type === 'video') {
          if (videoAllowed !== true && videoAllowed !== '1' && videoAllowed !== 1) {
            notOfferedTypes.push({ type: type.type, displayName: type.display_name, status: 'notOffered', order: index });
            return;
          }
        }

        // Clinic consultation: only for clinic-based vets (not home, not online)
        if (type.type === 'clinic') {
          if (practiceMode !== 'clinic') return;
        }

        availableTypesForVet.push(type);
      });
    } else {
      // No vet selected - use all types (default behavior)
      availableTypesForVet = allTypes;
    }

    // ─── If vet has no available consultation types ──────────────────────────
    if (availableTypesForVet.length === 0) {
      setLeadTimeValidation({
        isValid: false,
        message: getAContent('cmp_vetonest.com_NoTypesAvailableForVet_Message') || 
          'This veterinarian does not offer any consultation types at this time.',
        type: 'error',
        availableTypes: [],
        unavailableTypes: notOfferedTypes,
        earliestTime: null,
      });
      return;
    }

    const selectedDateTime = new Date(date.format('YYYY-MM-DD') + 'T' + timeValue.format('HH:mm'));
    const now = new Date();
    const hoursUntilConsultation = (selectedDateTime - now) / (1000 * 60 * 60);

    // Check each consultation type that the vet offers
    const availableTypes = [];
    const unavailableTypes = [];

    availableTypesForVet.forEach((type, index) => {
      const rulesForType = getCurrentRules(type.type);
      if (!rulesForType) return;

      const minLeadTime = rulesForType.min_booking_lead_time_hours || 
                          rulesForType.effective_min_booking_lead_time || 
                          24;

      const formattedLeadTime = formatLeadTime ? formatLeadTime(minLeadTime) : `${minLeadTime}h`;

      if (hoursUntilConsultation >= minLeadTime) {
        availableTypes.push({
          type: type.type,
          displayName: type.display_name,
          minLeadTime: minLeadTime,
          formattedLeadTime: formattedLeadTime,
          status: 'available',
          order: index,
        });
      } else {
        unavailableTypes.push({
          type: type.type,
          displayName: type.display_name,
          minLeadTime: minLeadTime,
          formattedLeadTime: formattedLeadTime,
          hoursUntil: hoursUntilConsultation,
          hoursNeeded: Math.round(minLeadTime - hoursUntilConsultation),
          availableFrom: new Date(now.getTime() + minLeadTime * 60 * 60 * 1000),
          status: 'unavailable',
          order: index,
        });
      }
    });

    if (availableTypes.length === 0) {
      // No consultation types available at this time yet. We still compute a
      // global earliestTime as a fallback for any older UI relying on it, but
      // the per-type `availableFrom` timestamps set above are what the
      // unified type list actually renders.
      let smallestLeadTime = Infinity;
      availableTypesForVet.forEach((type) => {
        const rulesForType = getCurrentRules(type.type);
        if (!rulesForType) return;
        const minLeadTime = rulesForType.min_booking_lead_time_hours || 
                            rulesForType.effective_min_booking_lead_time || 
                            24;
        if (minLeadTime < smallestLeadTime) {
          smallestLeadTime = minLeadTime;
        }
      });

      const earliest = new Date(now.getTime() + (smallestLeadTime || 24) * 60 * 60 * 1000);

      setLeadTimeValidation({
        isValid: false,
        message: null,
        type: 'warning',
        availableTypes: [],
        unavailableTypes: [...unavailableTypes, ...notOfferedTypes],
        earliestTime: earliest,
      });
    } else {
      // Some (or all) consultation types are available - the unified type
      // list in the JSX renders this directly, so no summary prose needed.
      setLeadTimeValidation({
        isValid: true,
        message: null,
        type: 'success',
        availableTypes: availableTypes,
        unavailableTypes: [...unavailableTypes, ...notOfferedTypes],
        earliestTime: null,
      });
    }
  }, [allTypes, getCurrentRules, rulesLoading, formatLeadTime, getAContent, consultationSelectedVet, vetCapabilities]);

  // ─── Validate when date or time changes ──────────────────────────────────
  useEffect(() => {
    if (selectedDate && time) {
      validateMinBookingLeadTime(selectedDate, time);
    } else {
      setLeadTimeValidation({
        isValid: false,
        message: null,
        type: null,
        availableTypes: [],
        unavailableTypes: [],
        earliestTime: null,
      });
    }
  }, [selectedDate, time, validateMinBookingLeadTime]);

  // Check if a vet has been selected
  const hasVetSelected = useMemo(() => {
    if (!consultationSelectedVet) return false;
    const vetId = consultationSelectedVet.id || 
                  consultationSelectedVet.profileVetoId || 
                  consultationSelectedVet.profileVeto?.id ||
                  consultationSelectedVet.vetId;
    return vetId !== undefined && vetId !== null;
  }, [consultationSelectedVet]);

  // Get vet display name
  const getVetDisplayName = useCallback(() => {
    if (!consultationSelectedVet) return null;
    const vet = consultationSelectedVet;
    const profileVeto = vet.profileVeto || vet;
    const title = profileVeto.vetTitle?.code || vet.vetTitle?.code || '';
    const firstName = profileVeto.prenom || vet.prenom || '';
    const lastName = profileVeto.nom || vet.nom || '';
    
    // Format: "Dr Kolm Kim" or "Kolm Kim" if no title
    if (title && (firstName || lastName)) {
      return `${title} ${firstName} ${lastName}`.trim();
    }
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    if (lastName) {
      return lastName;
    }
    return null;
  }, [consultationSelectedVet]);

  // Get vet city from selected vet
  const getVetCity = useCallback(() => {
    if (!consultationSelectedVet) return null;
    const vet = consultationSelectedVet;
    const profileVeto = vet.profileVeto || vet;
    
    const city = profileVeto.locationCity || 
                 vet.locationCity || 
                 profileVeto.city ||
                 vet.city ||
                 profileVeto.location?.city ||
                 vet.location?.city ||
                 profileVeto.allLocations?.[0]?.city ||
                 vet.allLocations?.[0]?.city;
    
    if (city) return city;
    
    const country = profileVeto.locationCountry || 
                    vet.locationCountry || 
                    profileVeto.country ||
                    vet.country ||
                    profileVeto.allLocations?.[0]?.country ||
                    vet.allLocations?.[0]?.country;
    
    if (country) return country;
    return null;
  }, [consultationSelectedVet]);

  // Get vet photo
  const getVetPhoto = useCallback(() => {
    if (!consultationSelectedVet) return null;
    const vet = consultationSelectedVet;
    const profileVeto = vet.profileVeto || vet;
    const picture = profileVeto.picture || vet.picture;
    if (picture) {
      return base_url + 'uploads/files/profile/' + picture;
    }
    return null;
  }, [consultationSelectedVet, base_url]);

  // Get vet ID for profile link
  const getVetId = useCallback(() => {
    if (!consultationSelectedVet) return null;
    return consultationSelectedVet.id || 
           consultationSelectedVet.profileVetoId || 
           consultationSelectedVet.profileVeto?.id ||
           consultationSelectedVet.vetId;
  }, [consultationSelectedVet]);

  const vetDisplayName = useMemo(() => getVetDisplayName(), [getVetDisplayName]);
  const vetCity = useMemo(() => getVetCity(), [getVetCity]);
  const vetPhoto = useMemo(() => getVetPhoto(), [getVetPhoto]);
  const vetId = useMemo(() => getVetId(), [getVetId]);

  // Handle vet name click - navigate to vet profile
  const handleVetNameClick = useCallback(() => {
    if (vetId) {
      navigate(`/vet-profile?vetId=${vetId}`);
    }
  }, [vetId, navigate]);

  // Get the timezone from the selected vet
  const getVetTimezone = useCallback(() => {
    if (!hasVetSelected) return null;
    const vet = consultationSelectedVet;
    const timezone = vet.timezone || 
                      vet.profileVeto?.timezone ||
                      vet.vetTimezone ||
                      null;
    if (timezone) return timezone;
    return 'Europe/Paris';
  }, [consultationSelectedVet, hasVetSelected]);

  // Get user's timezone from backend profile with proper fallback
  const getUserTimezone = useCallback(() => {
    if (userProfile?.timezone) {
      return userProfile.timezone;
    }
    if (user?.profileUser?.timezone) {
      return user.profileUser.timezone;
    }
    if (userProfile?.country) {
      const countryTimezoneMap = {
        'France': 'Europe/Paris',
        'United Kingdom': 'Europe/London',
        'UK': 'Europe/London',
        'USA': 'America/New_York',
        'United States': 'America/New_York',
        'Germany': 'Europe/Berlin',
        'Spain': 'Europe/Madrid',
        'Italy': 'Europe/Rome',
        'Portugal': 'Europe/Lisbon',
        'Netherlands': 'Europe/Amsterdam',
        'Belgium': 'Europe/Brussels',
        'Switzerland': 'Europe/Zurich',
        'Canada': 'America/Toronto',
        'Australia': 'Australia/Sydney',
      };
      return countryTimezoneMap[userProfile.country] || 'Europe/Paris';
    }
    return 'Europe/Paris';
  }, [userProfile, user]);

  const vetTimezone = useMemo(() => getVetTimezone(), [getVetTimezone]);
  const userTimezone = useMemo(() => getUserTimezone(), [getUserTimezone]);
  
  const vetTimezoneDisplay = useMemo(() => {
    if (!vetTimezone) return null;
    return vetTimezone;
  }, [vetTimezone]);

  const userTimezoneDisplay = useMemo(() => {
    return userTimezone || 'Europe/Paris';
  }, [userTimezone]);

  // Check if user is in same timezone as vet
  const isSameTimezone = useMemo(() => {
    if (!vetTimezone || !userTimezone) return false;
    return userTimezone === vetTimezone;
  }, [userTimezone, vetTimezone]);

  // Function to convert user's selected time to vet's time
  const convertUserTimeToVetTime = useCallback((dateStr, timeStr) => {
    if (!dateStr || !timeStr || !vetTimezone || !userTimezone) return null;
    try {
      const dateTimeStr = `${dateStr} ${timeStr}`;
      const userDateTime = dayjs.tz(dateTimeStr, userTimezone);
      return userDateTime.tz(vetTimezone);
    } catch (error) {
      console.error('Error converting time to vet timezone:', error);
      return null;
    }
  }, [vetTimezone, userTimezone]);

  // Validate slot against existing consultations
  useEffect(() => {
    if (!selectedDate || !time || vetConsultations.length === 0) {
      setSlotAvailable(true);
      return;
    }

    const dateStr = selectedDate.format('YYYY-MM-DD');
    const timeStr = time.format('HH:mm');
    const vetDateTime = convertUserTimeToVetTime(dateStr, timeStr);
    if (!vetDateTime) {
      setSlotAvailable(true);
      return;
    }

    const vetLocalStr = vetDateTime.format('YYYY-MM-DD HH:mm');
    const conflict = vetConsultations.some(c => c.startingDatetime === vetLocalStr);
    setSlotAvailable(!conflict);
  }, [selectedDate, time, vetConsultations, convertUserTimeToVetTime]);

  // Memoize steps
// Memoize steps
const STEPS = useMemo(() => [
  { 
    id: 1, 
    label: getAContent('cmp_vetonest.com_Pet_Label'), 
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 640 640" 
        style={{ width: "28px", height: "28px", fill: "#1677ff" }}
      >
        <path d="M96 160C149 160 192 203 192 256L192 341.8C221.7 297.1 269.8 265.6 325.4 257.8C351 317.8 410.6 359.9 480 359.9C490.9 359.9 501.6 358.8 512 356.8L512 544C512 561.7 497.7 576 480 576C462.3 576 448 561.7 448 544L448 403.2L312 512L368 512C385.7 512 400 526.3 400 544C400 561.7 385.7 576 368 576L224 576C171 576 128 533 128 480L128 256C128 239.4 115.4 225.8 99.3 224.2L92.7 223.9C76.6 222.2 64 208.6 64 192C64 174.3 78.3 160 96 160zM565.8 67.2C576.2 58.5 592 65.9 592 79.5L592 192C592 253.9 541.9 304 480 304C418.1 304 368 253.9 368 192L368 79.5C368 65.9 383.8 58.5 394.2 67.2L448 112L512 112L565.8 67.2zM432 172C421 172 412 181 412 192C412 203 421 212 432 212C443 212 452 203 452 192C452 181 443 172 432 172zM528 172C517 172 508 181 508 192C508 203 517 212 528 212C539 212 548 203 548 192C548 181 539 172 528 172z"/>
      </svg>
    )
  },
  { 
    id: 2, 
    label: getAContent('cmp_vetonest.com_Date_Label'), 
    icon: "📅" 
  },
  { 
    id: 3, 
    label: getAContent('cmp_vetonest.com_Symptoms_Label'), 
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 640 640" 
        style={{ width: "28px", height: "28px", fill: "#1677ff" }}
      >
        <path d="M192 576L512 576C529.7 576 544 561.7 544 544C544 526.3 529.7 512 512 512L512 445.3C530.6 438.7 544 420.9 544 400L544 112C544 85.5 522.5 64 496 64L192 64C139 64 96 107 96 160L96 480C96 533 139 576 192 576zM160 480C160 462.3 174.3 448 192 448L448 448L448 512L192 512C174.3 512 160 497.7 160 480zM288 184C288 175.2 295.2 168 304 168L336 168C344.8 168 352 175.2 352 184L352 224L392 224C400.8 224 408 231.2 408 240L408 272C408 280.8 400.8 288 392 288L352 288L352 328C352 336.8 344.8 344 336 344L304 344C295.2 344 288 336.8 288 328L288 288L248 288C239.2 288 232 280.8 232 272L232 240C232 231.2 239.2 224 248 224L288 224L288 184z"/>
      </svg>
    )
  },
  { 
    id: 4, 
    label: getAContent('cmp_vetonest.com_Booking_Label'), 
    icon: "✅" 
  },
], [getAContent]);

  // Locale helpers
  const getAntdLocale = useCallback(() => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];
    const map = {
      it: locale_it,
      fr: locale_fr,
      es: locale_es,
      de: locale_de,
      et: locale_et,
      ee: locale_et,
    };
    return map[lang] || locale_en;
  }, [siteLocale]);

  const getDateFormat = useCallback(() => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];
    if (['it', 'fr', 'es', 'de', 'et', 'ee'].includes(lang)) {
      return 'DD/MM/YYYY';
    }
    if (siteLocale?.toUpperCase() === 'EN-GB') {
      return 'DD/MM/YYYY';
    }
    return 'MM/DD/YYYY';
  }, [siteLocale]);

  // ─── Get localized date format for DatePicker ────────────────────────────
  const getLocalizedDateFormat = useCallback(() => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];
    switch (lang) {
      case 'fr':
      case 'fr-FR':
        return 'DD/MM/YYYY';
      case 'et':
      case 'ee':
        return 'DD.MM.YYYY';
      case 'de':
        return 'DD.MM.YYYY';
      case 'it':
        return 'DD/MM/YYYY';
      case 'es':
        return 'DD/MM/YYYY';
      case 'en':
      default:
        return 'MM/DD/YYYY';
    }
  }, [siteLocale]);

  // ─── Get localized date display ───────────────────────────────────────────
  const formatLocalizedDate = useCallback((date) => {
    if (!date) return '';
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];
    
    const localeMap = {
      'fr': 'fr',
      'et': 'et',
      'ee': 'et',
      'de': 'de',
      'it': 'it',
      'es': 'es',
      'en': 'en',
    };
    
    const locale = localeMap[lang] || 'en';
    return date.locale(locale).format('dddd D MMMM YYYY');
  }, [siteLocale]);

  // ─── Get localized time display ───────────────────────────────────────────
  const formatLocalizedTime = useCallback((timeValue) => {
    if (!timeValue) return '';
    return timeValue.format('HH:mm');
  }, []);

  // Set dayjs locale
  useEffect(() => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];
    
    if (['it', 'fr', 'es', 'de', 'et'].includes(lang)) {
      dayjs.locale(lang);
    } else if (siteLocale?.toUpperCase() === 'EN-GB') {
      dayjs.locale('en-gb');
    } else if (lang === 'ee') {
      dayjs.locale('et');
    } else {
      dayjs.locale('en');
    }
  }, [siteLocale]);

  // ── Get vet's opening time converted to user's timezone ──────────────────
  const getVetOpeningTimeForDay = useCallback((date) => {
    const timeslot = localTimeslotRef.current || currentConsultationTimeslot;
    if (!timeslot || !timeslot.length || !date || !vetTimezone || !userTimezone) return null;
    
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const dateInVetTz = dayjs.tz(dateStr, vetTimezone);
      const vetDay = dateInVetTz.day();
      
      const slotIdx = vetDay;
      const slot = timeslot[slotIdx];
      
      if (!slot?.opened || !slot.startTime?.date) return null;
      
      const startTimeStr = slot.startTime.date;
      const timeMatch = startTimeStr.match(/(\d{2}):(\d{2})/);
      if (!timeMatch) return null;
      
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      
      const vetDateTimeStr = `${dateStr} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const vetDateTime = dayjs.tz(vetDateTimeStr, vetTimezone);
      const userDateTime = vetDateTime.tz(userTimezone);
      
      return userDateTime;
    } catch (error) {
      console.error('Error getting vet opening time:', error);
      return null;
    }
  }, [localTimeslotRef, currentConsultationTimeslot, vetTimezone, userTimezone]);

  // ── Get time constraints (converted to user's timezone) ──────────────────
  const getTimeConstraints = useCallback(() => {
    const timeslot = localTimeslotRef.current || currentConsultationTimeslot;
    if (!timeslot || !timeslot.length || !selectedDate || !vetTimezone || !userTimezone) return {};
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const dateInVetTz = dayjs.tz(dateStr, vetTimezone);
      const vetDay = dateInVetTz.day();
      
      const slotIdx = vetDay;
      const slot = timeslot[slotIdx];
      
      if (!slot?.opened || !slot.startTime?.date || !slot.endTime?.date) return {};

      const parseHM = (dateStr) => {
        const [h, m] = dateStr.split(' ')[1].split(':').map(Number);
        return { h, m };
      };

      const vetStart = parseHM(slot.startTime.date);
      const vetEnd = parseHM(slot.endTime.date);
      
      const startDateTimeStr = `${dateStr} ${String(vetStart.h).padStart(2, '0')}:${String(vetStart.m).padStart(2, '0')}`;
      const endDateTimeStr = `${dateStr} ${String(vetEnd.h).padStart(2, '0')}:${String(vetEnd.m).padStart(2, '0')}`;
      
      const userStart = dayjs.tz(startDateTimeStr, vetTimezone).tz(userTimezone);
      const userEnd = dayjs.tz(endDateTimeStr, vetTimezone).tz(userTimezone);
      
      if (!userStart.isValid() || !userEnd.isValid()) return {};

      const startTotalMin = userStart.hour() * 60 + userStart.minute();
      const endTotalMin = userEnd.hour() * 60 + userEnd.minute();
      const wraps = endTotalMin <= startTotalMin;

      return {
        start: { h: userStart.hour(), m: userStart.minute() },
        end: { h: userEnd.hour(), m: userEnd.minute() },
        wraps,
      };
    } catch (error) {
      console.error('Error calculating time constraints:', error);
      return {};
    }
  }, [localTimeslotRef, currentConsultationTimeslot, selectedDate, vetTimezone, userTimezone]);

  const timeConstraints = getTimeConstraints();

  // ── Disabled dates function ──────────────────────────────────────────────
  const disabledDate = useCallback((current) => {
    if (!current) return false;
    
    if (current < dayjs().startOf('day')) {
      return true;
    }
    
    if (!hasVetSelected) {
      return false;
    }

    const timeslot = localTimeslotRef.current || currentConsultationTimeslot;
    
    if (!timeslot || timeslot.length === 0) {
      return false;
    }
    
    const dateStr = current.format('YYYY-MM-DD');
    const dateInVetTz = dayjs.tz(dateStr, vetTimezone);
    const vetDay = dateInVetTz.day();
    
    const slotIdx = vetDay;
    const slot = timeslot[slotIdx];
    
    if (!slot) {
      return true;
    }
    
    if (!slot.opened) {
      return true;
    }
    
    if (vetAbsences && vetAbsences.length > 0) {
      const dateStr = current.format('YYYY-MM-DD');
      const isAbsent = vetAbsences.some(absence => {
        if (!absence.closedDate?.date) return false;
        const absenceDate = dayjs(absence.closedDate.date).format('YYYY-MM-DD');
        return absenceDate === dateStr;
      });
      if (isAbsent) {
        return true;
      }
    }
    
    return false;
  }, [hasVetSelected, localTimeslotRef, currentConsultationTimeslot, vetAbsences, vetTimezone]);

  // ── Update time when date changes ──────────────────────────────────────────
  useEffect(() => {
    if (selectedDate && hasVetSelected) {
      const openingTime = getVetOpeningTimeForDay(selectedDate);
      if (openingTime) {
        setTime(openingTime);
      }
    } else if (!selectedDate) {
      setTime(null);
    }
  }, [selectedDate, hasVetSelected, getVetOpeningTimeForDay, localTimeslot]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const goToStep = useCallback((n) => {
    setStep(n);
    if (n > maxReached) setMaxReached(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [maxReached]);

  const handleStepClick = useCallback((n) => {
    if (n <= maxReached) goToStep(n);
  }, [maxReached, goToStep]);

  const handlePetSelection = useCallback((pet) => {
    setSelectedPet(pet);
    setCurrentConsultationPet(pet);
  }, [setCurrentConsultationPet]);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    setCurrentConsultationDate(date ? date.format("YYYY-MM-DD") : null);
    if (consultationSelectedDate) {
      setConsultationSelectedDate(null);
    }
    if (!date) {
      setTime(null);
    }
  }, [setCurrentConsultationDate, consultationSelectedDate, setConsultationSelectedDate]);

  const handleTimeChange = useCallback((t) => setTime(t || null), []);

  // ─── Check if Next button should be disabled ─────────────────────────────
  const isNextDisabled = useMemo(() => {
    if (!selectedPet) return true;
    if (!selectedDate) return true;
    if (!time) return true;
    if (slotChecking) return true;
    if (!slotAvailable) return true;
    if (rulesLoading) return true;
    if (allTypes.length === 0) return true;
    if (!leadTimeValidation.isValid) return true;
    return false;
  }, [selectedPet, selectedDate, time, slotChecking, slotAvailable, rulesLoading, allTypes, leadTimeValidation]);

  const handleNextStep = useCallback(() => {
    if (step === 1 && selectedPet) goToStep(2);
    if (step === 2 && selectedPet && selectedDate && time && slotAvailable && leadTimeValidation.isValid) {
      goToStep(3);
    }
  }, [step, selectedPet, selectedDate, time, slotAvailable, leadTimeValidation, goToStep]);

  const handleGoToBooking = useCallback((aiData) => {
    if (aiData) setSymptomData(aiData);
    goToStep(4);
  }, [goToStep]);

  const handleClearVet = useCallback(() => {
    setConsultationSelectedVet(null);
    setCurrentConsultationDate(null);
    setConsultationTimeslot(null);
    setCurrentConsultationPet(null);
    setSelectedDate(null);
    setTime(null);
    setVetAbsences([]);
    setLocalTimeslot(null);
    localTimeslotRef.current = null;
    vetDataFetchedRef.current = null;
    setVetConsultations([]);
    setSlotAvailable(true);
    setSlotChecking(false);
  }, [setConsultationSelectedVet, setCurrentConsultationDate, setConsultationTimeslot, setCurrentConsultationPet]);

  // Memoize antd locale and date format
  const antdLocale = useMemo(() => getAntdLocale(), [getAntdLocale]);
  const dateFormat = useMemo(() => getDateFormat(), [getDateFormat]);

  // Memoize disabledTime
  const disabledTime = useMemo(() => {
    if (timeConstraints.start) {
      return () => ({
        disabledHours: () => {
          const hours = [];
          for (let h = 0; h < 24; h++) {
            if (timeConstraints.wraps) {
              if (h > timeConstraints.end.h && h < timeConstraints.start.h) hours.push(h);
            } else {
              if (h < timeConstraints.start.h || h > timeConstraints.end.h) hours.push(h);
            }
          }
          return hours;
        },
        disabledMinutes: (h) => {
          const mins = [];
          if (h === timeConstraints.start.h) {
            for (let m = 0; m < timeConstraints.start.m; m++) mins.push(m);
          }
          if (h === timeConstraints.end.h) {
            for (let m = timeConstraints.end.m; m < 60; m++) mins.push(m);
          }
          return mins;
        },
      });
    }
    return undefined;
  }, [timeConstraints]);

  const memoizedAnimals = useMemo(() => animals, [animals]);

  // Vet time display (for reference)
  const vetTimeDisplay = useMemo(() => {
    if (!selectedDate || !time || !hasVetSelected) return null;
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const timeStr = time.format('HH:mm');
    const vetTime = convertUserTimeToVetTime(dateStr, timeStr);
    if (!vetTime) return null;
    
    return {
      date: vetTime.format('dddd D MMMM YYYY'),
      time: vetTime.format('HH:mm'),
      display: vetTime.format('dddd D MMMM YYYY [at] HH:mm'),
    };
  }, [selectedDate, time, convertUserTimeToVetTime, hasVetSelected]);

  const isTimePickerDisabled = false;

  // ─── Get alert type for lead time validation ─────────────────────────────
  const getLeadTimeAlertType = useCallback((type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  }, []);

  // ─── Get alert icon for lead time validation ─────────────────────────────
  const getLeadTimeAlertIcon = useCallback((type) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'error': return <WarningOutlined />;
      case 'info': return <InfoCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  }, []);

  // ─── Friendly "available from" timestamp for the consultation-type list ──
  // Renders as "today at 3:45 PM" / "tomorrow at 10:14 AM" / "Jul 6 at 10:14 AM"
  // instead of a raw Date.toLocaleString() (which included seconds and read
  // like a debug log rather than something meant for a pet owner).
  const formatAvailableFrom = useCallback((date) => {
    if (!date) return '';
    const d = dayjs(date);
    const todayStart = dayjs().startOf('day');
    const timePart = d.format('h:mm A');
    if (d.isSame(todayStart, 'day')) return `today at ${timePart}`;
    if (d.isSame(todayStart.add(1, 'day'), 'day')) return `tomorrow at ${timePart}`;
    return d.format('MMM D [at] h:mm A');
  }, []);

  // Render loading/error states
  if (petsLoading) {
    return (
      <ConfigProvider locale={antdLocale}>
        <div className="justify-content-center align-items-center" style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px', color: '#888' }}>
            {getAContent('cmp_vetonest.com_loading_pets')}
          </p>
        </div>
      </ConfigProvider>
    );
  }

  if (petsError) {
    return (
      <ConfigProvider locale={antdLocale}>
        <div className="justify-content-center align-items-center" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#ff4d4f' }}>
            {getAContent('cmp_vetonest.com_Error_Loading_Pets')}
          </p>
          <Button onClick={() => window.location.reload()}>
            {getAContent('cmp_vetonest.com_Refresh_Btn')}
          </Button>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={antdLocale}>
      <div className="justify-content-center align-items-center">
        <StepNav 
          step={step} 
          maxReached={maxReached} 
          onStepClick={handleStepClick} 
          steps={STEPS}
          getAContent={getAContent}
        />

        {step === 1 && (
          <>
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 1 / 4 — {getAContent('cmp_vetonest.com_Pet_Step_Title')}
            </h2>
            <ConsultationPetSelection
              animals={memoizedAnimals}
              selectedPet={selectedPet}
              setAnimal={handlePetSelection}
            />
            <div className="next-button-container">
              <Button
                onClick={handleNextStep}
                disabled={!selectedPet}
                className="consultation-next-button"
                type="primary"
              >
                {getAContent('cmp_vetonest.com_Next_Btn')}
              </Button>
            </div>
          </>
        )}

        {step === 2 && selectedPet && (
          <div className="consultation-step-container">
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 2 / 4 — {getAContent('cmp_vetonest.com_DateTime_Step_Title')}
            </h2>

            <div style={{
              width: "100%",
              background: "#f9f9f9",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              padding: "24px",
              boxSizing: "border-box",
            }}>
              {/* Vet Info Banner - Only show if a vet is selected */}
              {hasVetSelected && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  position: "relative",
                }}>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleClearVet}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      color: "#999",
                      fontSize: "12px",
                      padding: "2px 6px",
                      height: "auto",
                      minHeight: "auto",
                    }}
                    title={getAContent('cmp_vetonest.com_RemoveVet_Tooltip') || 'Remove selected veterinarian'}
                  />
                  
                  {/* Photo */}
                  <Avatar 
                    src={vetPhoto || photoAnimalDefaultSrc} 
                    size={48}
                    icon={<UserOutlined />}
                    style={{ flexShrink: 0 }}
                  />
                  
                  {/* Name and Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Doctor Name - smaller font */}
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: "14px",
                      cursor: vetId ? "pointer" : "default",
                      color: vetId ? "#1677ff" : "#333",
                    }}
                    onClick={handleVetNameClick}
                    onMouseEnter={(e) => {
                      if (vetId) {
                        e.currentTarget.style.textDecoration = "underline";
                        e.currentTarget.style.color = "#0958d9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (vetId) {
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.color = "#1677ff";
                      }
                    }}>
                      {vetDisplayName || getAContent('cmp_vetonest.com_Veterinarian_Label') || 'Veterinarian'}
                    </div>
                    
                    {/* Veto Mode / Practice Type - using tagRef for translation */}
                    {(() => {
                      // Get practice mode from multiple sources with priority
                      let mode = null;
                      let tagRef = null;
                      const vet = consultationSelectedVet;
                      const profileVeto = vet?.profileVeto || vet;
                      
                      // 1. First try from vetCapabilities (freshly fetched)
                      if (vetCapabilities?.vetoMode) {
                        mode = vetCapabilities.vetoMode.name;
                        tagRef = vetCapabilities.vetoMode.tagRef;
                      }
                      // 2. Then try from consultationSelectedVet.vetoMode
                      else if (profileVeto?.vetoMode) {
                        mode = profileVeto.vetoMode.name;
                        tagRef = profileVeto.vetoMode.tagRef;
                      }
                      // 3. Then try from vet.vetoMode
                      else if (vet?.vetoMode) {
                        mode = vet.vetoMode.name;
                        tagRef = vet.vetoMode.tagRef;
                      }
                      // 4. Fallback to legacy atHome field with default tagRefs
                      else if (profileVeto?.atHome !== undefined) {
                        mode = profileVeto.atHome ? 'home' : 'clinic';
                        tagRef = profileVeto.atHome 
                          ? 'cmp_vetonest.com_Home_Mode' 
                          : 'cmp_vetonest.com_Clinic_Mode';
                      }
                      else if (vet?.atHome !== undefined) {
                        mode = vet.atHome ? 'home' : 'clinic';
                        tagRef = vet.atHome 
                          ? 'cmp_vetonest.com_Home_Mode' 
                          : 'cmp_vetonest.com_Clinic_Mode';
                      }
                      
                      // If no mode found, don't render
                      if (!mode) return null;
                      
                      // Fallback display text if tagRef translation fails
                      const fallbackText = mode === 'home' ? 'At home' : 
                                          mode === 'clinic' ? 'At clinic' : 
                                          mode === 'online' ? 'Online' : 'Unknown';
                      
                      // Use getAContent with tagRef for translation
                      const displayText = tagRef ? getAContent(tagRef) : fallbackText;
                      
                      return (
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "4px",
                          fontSize: "12px", 
                          color: "#555",
                          marginTop: "2px"
                        }}>
                          <EnvironmentOutlined style={{ fontSize: "12px", color: "#888" }} />
                          <span>{displayText || fallbackText}</span>
                        </div>
                      );
                    })()}
                    
                    {/* Timezone - City removed */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "2px",
                      flexWrap: "wrap",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ClockCircleOutlined style={{ fontSize: "12px", color: "#888" }} />
                        {vetTimezoneDisplay || getAContent('cmp_vetonest.com_Loading_Status') || 'Loading...'}
                      </span>
                      
                      {isSameTimezone && (
                        <>
                          <span style={{ color: "#ccc" }}>|</span>
                          <Tag color="green" style={{ fontSize: "10px", padding: "0 8px", margin: 0, lineHeight: "20px" }}>
                            {getAContent('cmp_vetonest.com_SameTimezone_Tag') || 'Same as your timezone'}
                          </Tag>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time Pickers Row */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label className="consultation-label" style={{ fontSize: "13px", fontWeight: "normal", color: "#555" }}>
                    📅 {getAContent('cmp_vetonest.com_SelectDate_Label')}
                  </label>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format={getLocalizedDateFormat()}
                    className="consultation-form-control"
                    placeholder={getAContent('cmp_vetonest.com_ClickSelectDate_Txt')}
                    disabledDate={disabledDate}
                    minDate={dayjs().startOf('day')}
                    style={{ width: "100%" }}
                    loading={loadingVetData}
                  />
                  {loadingVetData && (
                    <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                      {getAContent('cmp_vetonest.com_LoadingSchedule_Txt') || 'Loading vet schedule...'}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label className="consultation-label" style={{ fontSize: "13px", fontWeight: "normal", color: "#555" }}>
                    🕐 {getAContent('cmp_vetonest.com_SelectTime_Label')}
                    <span style={{ fontSize: "11px", color: "#888", marginLeft: "4px" }}>
                      ({userTimezoneDisplay || 'Europe/Paris'})
                    </span>
                  </label>
                  <TimePicker
                    value={time}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    className="consultation-form-control"
                    placeholder={getAContent('cmp_vetonest.com_ClickSelectTime_Txt') || 'Click to select a time'}
                    style={{ width: "100%" }}
                    disabledTime={disabledTime}
                    disabled={isTimePickerDisabled}
                    allowClear={true}
                  />
                </div>
              </div>

              {/* Selected Date/Time Summary with Consultation Type Status */}
              {selectedDate && time && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "#fff",
                  border: hasVetSelected ? (slotAvailable ? "1px solid #52c41a" : "1px solid #ff4d4f") : "1px solid #d9d9d9",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#333",
                }}>
				{/* Date & Time Display - Updated with SVG calendar-check */}
				<div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px", marginBottom: "8px" }}>
				  {hasVetSelected ? (
					slotChecking ? (
					  <Spin size="small" style={{ marginRight: 4 }} />
					) : slotAvailable ? (
					  <svg 
						xmlns="http://www.w3.org/2000/svg" 
						viewBox="0 0 448 512" 
						style={{ 
						  width: "18px", 
						  height: "18px", 
						  fill: "#52c41a",
						  flexShrink: 0
						}}
					  >
						<path d="M436 160H12c-6.627 0-12-5.373-12-12v-36c0-26.51 21.49-48 48-48h48V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h128V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h48c26.51 0 48 21.49 48 48v36c0 6.627-5.373 12-12 12zM12 192h424c6.627 0 12 5.373 12 12v260c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V204c0-6.627 5.373-12 12-12zm333.296 95.947l-28.169-28.398c-4.667-4.705-12.265-4.736-16.97-.068L194.12 364.665l-45.98-46.352c-4.667-4.705-12.266-4.736-16.971-.068l-28.397 28.17c-4.705 4.667-4.736 12.265-.068 16.97l82.601 83.269c4.667 4.705 12.265 4.736 16.97.068l142.953-141.805c4.705-4.667 4.736-12.265.068-16.97z"/>
					  </svg>
					) : (
					  <svg 
						xmlns="http://www.w3.org/2000/svg" 
						viewBox="0 0 448 512" 
						style={{ 
						  width: "18px", 
						  height: "18px", 
						  fill: "#ff4d4f",
						  flexShrink: 0
						}}
					  >
						<path d="M436 160H12c-6.627 0-12-5.373-12-12v-36c0-26.51 21.49-48 48-48h48V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h128V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h48c26.51 0 48 21.49 48 48v36c0 6.627-5.373 12-12 12zM12 192h424c6.627 0 12 5.373 12 12v260c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V204c0-6.627 5.373-12 12-12z"/>
						<line x1="12" y1="192" x2="436" y2="192" stroke="#ff4d4f" strokeWidth="24"/>
					  </svg>
					)
				  ) : (
					<svg 
					  xmlns="http://www.w3.org/2000/svg" 
					  viewBox="0 0 448 512" 
					  style={{ 
						width: "18px", 
						height: "18px", 
						fill: "#52c41a",
						flexShrink: 0
					  }}
					>
					  <path d="M436 160H12c-6.627 0-12-5.373-12-12v-36c0-26.51 21.49-48 48-48h48V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h128V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h48c26.51 0 48 21.49 48 48v36c0 6.627-5.373 12-12 12zM12 192h424c6.627 0 12 5.373 12 12v260c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V204c0-6.627 5.373-12 12-12zm333.296 95.947l-28.169-28.398c-4.667-4.705-12.265-4.736-16.97-.068L194.12 364.665l-45.98-46.352c-4.667-4.705-12.266-4.736-16.971-.068l-28.397 28.17c-4.705 4.667-4.736 12.265-.068 16.97l82.601 83.269c4.667 4.705 12.265 4.736 16.97.068l142.953-141.805c4.705-4.667 4.736-12.265.068-16.97z"/>
					</svg>
				  )}
				  <span style={{ fontWeight: "500" }}>
					{formatLocalizedDate(selectedDate)} {getAContent('cmp_vetonest.com_At_Prefix') || 'at'} {formatLocalizedTime(time)}
				  </span>
				  {hasVetSelected && !isSameTimezone && vetTimeDisplay && (
					<span style={{ color: "#888", fontSize: "11px" }}>
					  ({getAContent('cmp_vetonest.com_VetTime_Label') || "Vet's time"}: {vetTimeDisplay.time} {vetTimezoneDisplay})
					</span>
				  )}
				</div>
                  
                  {/* Slot availability message */}
                  {hasVetSelected && !slotAvailable && !slotChecking && (
                    <div style={{ color: "#ff4d4f", fontSize: "12px", marginBottom: "4px" }}>
                      {getAContent('cmp_vetonest.com_SlotUnavailable_Error') || 
                        'This time slot is already booked. Please select another time.'}
                    </div>
                  )}

                  {/* ─── Unified consultation type availability list ─────────── */}
                  {(leadTimeValidation.availableTypes.length > 0 ||
                    leadTimeValidation.unavailableTypes.length > 0) && (
                    <div style={{ marginTop: "4px" }}>
                      {[...leadTimeValidation.availableTypes, ...leadTimeValidation.unavailableTypes]
                        .sort((a, b) => a.order - b.order)
                        .map((type) => {
                          const isAvailable = type.status === 'available';
                          const isNotOffered = type.status === 'notOffered';
                          const color = isAvailable ? "#52c41a" : isNotOffered ? "#ff4d4f" : "#faad14";
                          const icon = isAvailable ? "✅" : isNotOffered ? "❌" : "⚠️";
                          
                          return (
                            <div
                              key={type.type}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                padding: "2px 0",
                              }}
                            >
                              <span style={{ fontSize: "14px", lineHeight: 1 }}>{icon}</span>
                              <span style={{ color: "#333" }}>{type.displayName}</span>
                              <span style={{ color: color }}>
                                {type.status === 'available' &&
                                  (getAContent('cmp_vetonest.com_TypeAvailable_Label') || 'available')}
                                {type.status === 'unavailable' &&
                                  (getAContent('cmp_vetonest.com_TypeUnavailable_Message') || 'select a time after {time}')
                                    .replace(/\{time\}/g, formatAvailableFrom(type.availableFrom))}
                                {type.status === 'notOffered' &&
                                  (getAContent('cmp_vetonest.com_TypeNotOffered_Message') || "not available for this vet")}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Fallback message when no type breakdown available */}
                  {leadTimeValidation.message &&
                    leadTimeValidation.availableTypes.length === 0 &&
                    leadTimeValidation.unavailableTypes.length === 0 && (
                    <Alert
                      message={leadTimeValidation.message}
                      type={getLeadTimeAlertType(leadTimeValidation.type)}
                      icon={getLeadTimeAlertIcon(leadTimeValidation.type)}
                      showIcon
                      style={{ marginTop: "4px", fontSize: "12px" }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="next-button-container">
              <Button
                onClick={handleNextStep}
                disabled={isNextDisabled}
                className="consultation-next-button"
                type="primary"
              >
                {getAContent('cmp_vetonest.com_Next_Btn')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Symptoms */}
        {step === 3 && selectedPet && (
          <div className="consultation-step-container">
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 3 / 4 — {getAContent('cmp_vetonest.com_Symptoms_Step_Title')}
            </h2>
            <ConsultationSymptoms
              params={{ selectedPet, animals: memoizedAnimals }}
              onNext={handleGoToBooking}
              persistedComplaint={symptomComplaint}
              persistedAiSymptoms={symptomAiSymptoms}
              persistedAiUrgency={symptomAiUrgency}
              persistedFollowUpQs={symptomFollowUpQs}
              persistedAnswers={symptomAnswers}
              persistedAiData={symptomAiData}
              onPersistComplaint={setSymptomComplaint}
              onPersistAiResult={(data) => {
                setSymptomAiSymptoms(data.symptoms);
                setSymptomAiUrgency(data.urgency);
                setSymptomFollowUpQs(data.followUpQuestions);
                setSymptomAiData(data);
              }}
              onPersistAnswers={setSymptomAnswers}
            />
          </div>
        )}

        {/* Step 4: Booking */}
        {step === 4 && selectedPet && (
          <div className="consultation-step-container consultation-step-container--wide">
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 4 / 4 — {getAContent('cmp_vetonest.com_Booking_Step_Title')}
            </h2>
            <ConsultationBooking
              params={{
                selectedPet,
                selectedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
                selectedTime: time ? time.format("HH:mm") : null,
                animals: memoizedAnimals,
                symptomData,
                preselectedVet: consultationSelectedVet || null,
                recommendedSpecialityId,
                recommendedClinicTypeId,
                vetTimezone: vetTimezone,
                userTimezone: userTimezone,
                vetTimezoneDisplay: vetTimezoneDisplay,
                userTimezoneDisplay: userTimezoneDisplay,
                vetTimeDisplay: vetTimeDisplay,
                isSameTimezone: isSameTimezone,
                hasVetSelected: hasVetSelected,
                vetDisplayName: vetDisplayName,
                vetCity: vetCity,
                vetPhoto: vetPhoto,
                vetId: vetId,
              }}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default React.memo(ConsultationProcess);