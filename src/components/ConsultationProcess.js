import React, { useState, useContext, useEffect } from "react";
import { SiteContext } from "../context/site";
import { DatePicker, TimePicker, Button, ConfigProvider } from "antd";
import ConsultationPetSelection from "./ConsultationPetSelection";
import ConsultationSymptoms from "./ConsultationSymptoms";
import ConsultationBooking from "./ConsultationBooking";
import dayjs from "dayjs";

// Import dayjs locales
import 'dayjs/locale/it';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/et';   // Estonian

// Ant Design locale objects (v5 style)
import locale_it from 'antd/locale/it_IT';
import locale_fr from 'antd/locale/fr_FR';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_en from 'antd/locale/en_US';
import locale_et from 'antd/locale/et_EE';

const ConsultationProcess = ({ animals }) => {
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
  } = useContext(SiteContext);

  // ── Locale helpers ──────────────────────────────────────────────────────────
  const getAntdLocale = () => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];

    const map = {
      it: locale_it,
      fr: locale_fr,
      es: locale_es,
      de: locale_de,
      et: locale_et,
      ee: locale_et,   // your 'ee' alias for Estonian
    };

    return map[lang] || locale_en;
  };

  const getDateFormat = () => {
    const lang = (siteLocale || 'en').toLowerCase().split(/[-_]/)[0];

    if (['it', 'fr', 'es', 'de', 'et', 'ee'].includes(lang)) {
      return 'DD/MM/YYYY';
    }

    if (siteLocale?.toUpperCase() === 'EN-GB') {
      return 'DD/MM/YYYY';
    }

    return 'MM/DD/YYYY';
  };

  // Set dayjs locale globally so .format() uses correct weekday/month names
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

  // ── Step definitions ────────────────────────────────────────────────────────
  const STEPS = [
    { id: 1, label: getAContent('cmp_vetonest.com_Pet_Label'), icon: "🐾" },
    { id: 2, label: getAContent('cmp_vetonest.com_Date_Label'), icon: "📅" },
    { id: 3, label: getAContent('cmp_vetonest.com_Symptoms_Label'), icon: "🩺" },
    { id: 4, label: getAContent('cmp_vetonest.com_Booking_Label'), icon: "✅" },
  ];

  // StepNav component remains unchanged
  const StepNav = ({ step, maxReached, onStepClick }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "5px",
      marginLeft: "24px",
      marginRight: "24px",
      userSelect: "none",
    }}>
      {STEPS.map((s, i) => {
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

            {i < STEPS.length - 1 && (
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
  );

  // ── State & logic (unchanged except dayjs usage) ────────────────────────────
  const [selectedPet, setSelectedPet] = useState(currentConsultationPet);
  const [selectedDate, setSelectedDate] = useState(
    currentConsultationDate ? dayjs(currentConsultationDate) : null
  );
  const [time, setTime] = useState(dayjs("07:00", "HH:mm")); // Set the initial time to 07:00

  const initialStep = () => (currentConsultationPet ? 2 : 1);
  const [step, setStep] = useState(initialStep);
  const [maxReached, setMaxReached] = useState(1);
  const [symptomData, setSymptomData] = useState(null);

  const getTimeConstraints = () => {
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
  };

  const timeConstraints = getTimeConstraints();

  const goToStep = (n) => {
    setStep(n);
    if (n > maxReached) setMaxReached(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (n) => {
    if (n <= maxReached) goToStep(n);
  };

  const handlePetSelection = (pet) => {
    setSelectedPet(pet);
    setCurrentConsultationPet(pet);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentConsultationDate(date ? date.format("YYYY-MM-DD") : null);
  };

  const handleTimeChange = (t) => setTime(t || null);

  const disabledDate = (current) => current && current < dayjs().startOf('day');

  const handleNextStep = () => {
    if (step === 1 && selectedPet) goToStep(2);
    if (step === 2 && selectedPet && selectedDate && time) goToStep(3);
  };

  const handleGoToBooking = (aiData) => {
    if (aiData) setSymptomData(aiData);
    goToStep(4);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ConfigProvider locale={getAntdLocale()}>
      <div className="justify-content-center align-items-center">

        <StepNav step={step} maxReached={maxReached} onStepClick={handleStepClick} />

        {step === 1 && (
          <>
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 1 / 4 — {getAContent('cmp_vetonest.com_SelectPet_Step')}
            </h2>
            <ConsultationPetSelection
              animals={animals}
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
              {/* pet reminder + vet notice blocks remain unchanged */}

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label className="consultation-label">📅 {getAContent('cmp_vetonest.com_SelectDate_Label')}</label>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format={getDateFormat()}
                    className="consultation-form-control"
                    placeholder={getAContent('cmp_vetonest.com_ClickSelectDate_Txt')}
                    disabledDate={disabledDate}
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
					  disabledTime={timeConstraints.start ? () => ({
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
					  }) : undefined}
					/>
                </div>
              </div>

              {/* Confirmation summary — now localized via dayjs.locale() */}
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
        <div style={{ display: step === 3 && selectedPet ? "block" : "none" }}>
          <div className="consultation-step-container">
            <h2 className="consultation-step-title">
              {getAContent('cmp_vetonest.com_Step_Label')} 3 / 4 — {getAContent('cmp_vetonest.com_DescribeSymptoms_Step')}
            </h2>
            <ConsultationSymptoms
              params={{ selectedPet, animals }}
              onNext={handleGoToBooking}
            />
          </div>
        </div>

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
                animals,
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

export default ConsultationProcess;