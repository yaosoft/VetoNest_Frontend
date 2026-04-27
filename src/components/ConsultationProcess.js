import React, { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { SiteContext } from "../context/site";
import { DatePicker, TimePicker, Button, ConfigProvider, Spin } from "antd";
import ConsultationPetSelection from "./ConsultationPetSelection";
import ConsultationSymptoms from "./ConsultationSymptoms";
import ConsultationBooking from "./ConsultationBooking";
import { usePetList } from "../hooks/usePetList";
import dayjs from "dayjs";

// Import dayjs locales
import 'dayjs/locale/it';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/et';

// Ant Design locale objects
import locale_it from 'antd/locale/it_IT';
import locale_fr from 'antd/locale/fr_FR';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_en from 'antd/locale/en_US';
import locale_et from 'antd/locale/et_EE';

// Memoized StepNav component to prevent re-renders
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
    recommendedSpecialityId,
    recommendedClinicTypeId,
    siteLocale,
	vetos
  } = useContext(SiteContext);

  // Use the cached pet list hook
  const { pets: cachedPets, loading: petsLoading, error: petsError } = usePetList();
  
  // Use propAnimals if provided (for backward compatibility), otherwise use cached pets
  const animals = propAnimals && propAnimals.length > 0 ? propAnimals : cachedPets;

  // Memoize steps to prevent recreation
  const STEPS = useMemo(() => [
    { id: 1, label: getAContent('cmp_vetonest.com_Pet_Label'), icon: "🐾" },
    { id: 2, label: getAContent('cmp_vetonest.com_Date_Label'), icon: "📅" },
    { id: 3, label: getAContent('cmp_vetonest.com_Symptoms_Label'), icon: "🩺" },
    { id: 4, label: getAContent('cmp_vetonest.com_Booking_Label'), icon: "✅" },
  ], [getAContent]);

  // ── Locale helpers ──────────────────────────────────────────────────────────
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

  // ── State & logic ────────────────────────────────────────────────────────────
  const [selectedPet, setSelectedPet] = useState(() => currentConsultationPet);
  const [selectedDate, setSelectedDate] = useState(
    currentConsultationDate ? dayjs(currentConsultationDate) : null
  );
  const [time, setTime] = useState(dayjs("08:00", "HH:mm"));

  const initialStep = useMemo(() => (currentConsultationPet ? 2 : 1), [currentConsultationPet]);
  const [step, setStep] = useState(initialStep);
  const [maxReached, setMaxReached] = useState(1);
  const [symptomData, setSymptomData] = useState(null);

  const getTimeConstraints = useCallback(() => {
    if (!currentConsultationTimeslot || !selectedDate) return {};
    try {
      const jsDay = selectedDate.day();
      const slotIdx = jsDay === 0 ? 6 : jsDay - 1;
      const slot = currentConsultationTimeslot[slotIdx];
      if (!slot?.opened || !slot.startTime?.date || !slot.endTime?.date) return {};

      const parseHM = (dateStr) => {
        const [h, m] = dateStr.split(' ')[1].split(':').map(Number);
        return { h, m };
      };

      return {
        start: parseHM(slot.startTime.date),
        end: parseHM(slot.endTime.date),
      };
    } catch {
      return {};
    }
  }, [currentConsultationTimeslot, selectedDate]);

  const timeConstraints = getTimeConstraints();

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
  }, [setCurrentConsultationDate]);

  const handleTimeChange = useCallback((t) => setTime(t || null), []);

  const disabledDate = useCallback((current) => current && current < dayjs().startOf('day'), []);

  const handleNextStep = useCallback(() => {
    if (step === 1 && selectedPet) goToStep(2);
    if (step === 2 && selectedPet && selectedDate && time) goToStep(3);
  }, [step, selectedPet, selectedDate, time, goToStep]);

  const handleGoToBooking = useCallback((aiData) => {
    if (aiData) setSymptomData(aiData);
    goToStep(4);
  }, [goToStep]);

  // Memoize the antd locale to prevent recreation
  const antdLocale = useMemo(() => getAntdLocale(), [getAntdLocale]);
  const dateFormat = useMemo(() => getDateFormat(), [getDateFormat]);

  // Memoize the time picker disabledTime function
  const disabledTime = useMemo(() => {
    if (timeConstraints.start) {
      return () => ({
        disabledHours: () => {
          const hours = [];
          for (let h = 0; h < 24; h++) {
            if (h < timeConstraints.start.h || h > timeConstraints.end.h) hours.push(h);
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

  // Memoize animals to prevent unnecessary re-renders of child components
  const memoizedAnimals = useMemo(() => animals, [animals]);

  // Show loading state while fetching pets
  if (petsLoading) {
    return (
      <ConfigProvider locale={antdLocale}>
        <div className="justify-content-center align-items-center" style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px', color: '#888' }}>Loading your pets...</p>
        </div>
      </ConfigProvider>
    );
  }

  // Show error state
  if (petsError) {
    return (
      <ConfigProvider locale={antdLocale}>
        <div className="justify-content-center align-items-center" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#ff4d4f' }}>Error loading your pets. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </ConfigProvider>
    );
  }

// Add at the top of ConsultationProcess component
console.log('ConsultationProcess rendered', { 
  step, 
  selectedPet: selectedPet?.id,
  hasVetos: !!vetos?.length 
});

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
              {getAContent('cmp_vetonest.com_Step_Label')} 1 / 4 — {getAContent('cmp_vetonest.com_SelectPet_Step')}
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
              {getAContent('cmp_vetonest.com_Step_Label')} 2 / 4 — {getAContent('cmp_vetonest.com_ChooseDateTime_Step')}
            </h2>

            <div style={{
              width: "100%",
              background: "#f9f9f9",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              padding: "24px",
              boxSizing: "border-box",
            }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label className="consultation-label">📅 {getAContent('cmp_vetonest.com_SelectDate_Label')}</label>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format={dateFormat}
                    className="consultation-form-control"
                    placeholder={getAContent('cmp_vetonest.com_ClickSelectDate_Txt')}
                    disabledDate={disabledDate}
                    minDate={dayjs().startOf('day')}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label className="consultation-label">🕐 {getAContent('cmp_vetonest.com_SelectTime_Label')}</label>
                  <TimePicker
                    value={time}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    className="consultation-form-control"
                    placeholder={getAContent('cmp_vetonest.com_ClickSelectTime_Txt')}
                    style={{ width: "100%" }}
                    disabledTime={disabledTime}
                  />
                </div>
              </div>

              {selectedDate && time && (
                <div style={{
                  marginTop: "20px",
                  padding: "12px 16px",
                  background: "#fff",
                  border: "1px solid #FFDE59",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#333",
                }}>
                  ✅ <strong>{selectedDate.format("dddd D MMMM YYYY")}</strong>{' '}
                  {getAContent('cmp_vetonest.com_At_Prefix')}{' '}
                  <strong>{time.format("HH:mm")}</strong>
                </div>
              )}
            </div>

            <div className="next-button-container">
              <Button
                onClick={handleNextStep}
                disabled={!selectedDate || !time}
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
              {getAContent('cmp_vetonest.com_Step_Label')} 3 / 4 — {getAContent('cmp_vetonest.com_DescribeSymptoms_Step')}
            </h2>
            <ConsultationSymptoms
              params={{ selectedPet, animals: memoizedAnimals }}
              onNext={handleGoToBooking}
            />
          </div>
        )}

        {/* Step 4: Booking */}
        {step === 4 && selectedPet && (
          <div className="consultation-step-container">
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 4 / 4 — {getAContent('cmp_vetonest.com_ChooseVetBook_Step')}
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
              }}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default React.memo(ConsultationProcess);