import React, { useState, useContext, useEffect } from "react";
import { SiteContext } from "../context/site";
import moment from "moment";
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
const ConsultationSymptoms = (params) => {
  const {
    base_url,
    photoAnimalDefaultSrc,
    especes,
    getAContent,
    speciesBreedList,
    allSpecialities,
    allEtablissementTypes,
    consultationPrimaryComplaint,
    setRecommendedSpecialityId,
    setRecommendedClinicTypeId,
    siteLocale,
  } = useContext(SiteContext);

  // Persisted-state props (lifted into ConsultationProcess so they survive step changes)
  const {
    persistedComplaint   = "",
    persistedAiSymptoms  = [],
    persistedAiUrgency   = "",
    persistedFollowUpQs  = [],
    persistedAnswers     = {},
    persistedAiData      = null,
    onPersistComplaint,
    onPersistAiResult,
    onPersistAnswers,
  } = params;

  const [breedNames, setBreedNames]                                   = useState([]);
  const [primaryComplaint, setPrimaryComplaint]                       = useState(persistedComplaint);
  const [aiSymptoms, setAiSymptoms]                                   = useState(persistedAiSymptoms);
  const [aiUrgency, setAiUrgency]                                     = useState(persistedAiUrgency);
  
  const [loading, setLoading]                                         = useState(false);
  const [responseMessage, setResponseMessage]                         = useState("");
  const [followUpQuestions, setFollowUpQuestions]                     = useState(persistedFollowUpQs);
  const [answers, setAnswers]                                         = useState(persistedAnswers);
  const [userPets, setUserPets]                                       = useState([]);
  const [animal, setAnimal]                                           = useState({});

  const [complaintOpen, setComplaintOpen] = useState(false);
  const [aiData, setAiData]               = useState(persistedAiData);

  const calculateAge = (birthdate) => moment().diff(moment(birthdate), 'years');

  const FALLBACK_ESPECE_IDS = [998, 999];
  const FALLBACK_RACE_IDS   = [9998, 9999];

  const getEspeceName = (especeId) => {
    if (!especes.length) return '.';
    if (FALLBACK_ESPECE_IDS.includes(Number(especeId))) return '';
    const found = especes.find((j) => j.id == especeId);
    return found ? getAContent(found.tagRef) : '—';
  };

  const goToBooking = () => {
    if (params.onNext) params.onNext({
      ...aiData,
      complaint:       primaryComplaint,
      followUpAnswers: answers,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const symptomData = {
      complaint: primaryComplaint,
      animalId:  animal.id,
      specie:    animal.espece && !FALLBACK_ESPECE_IDS.includes(Number(animal.espece.id)) ? getEspeceName(animal.espece.id) : 'Unknown',
      breed:     animal.race   && !FALLBACK_RACE_IDS.includes(Number(animal.race.id))   ? (breedNames[animal.race.id]?.nom || 'Unknown') : 'Unknown',
      siteLocale: siteLocale.split('-')[0],
      vetSpecialities: allSpecialities
        .map(s => `${s.id}--${s.name}`)
        .join('*'),
      clinicTypes: allEtablissementTypes
        .map(c => `${c.id}--${c.name}`)
        .join('*'),
    };

    try {
      const data = await consultationPrimaryComplaint(symptomData);
      if (data.success) {
        setAiSymptoms(data.symptoms);
        setAiUrgency(data.urgency);
        setRecommendedSpecialityId(data.recommendedSpecialityId);
        setRecommendedClinicTypeId(data.recommendedClinicTypeId);
        setFollowUpQuestions(data.followUpQuestions);
        setAnswers({});
        setAiData(data);
        setResponseMessage("");
        setComplaintOpen(false);
        if (onPersistAiResult) onPersistAiResult(data);
        if (onPersistAnswers)  onPersistAnswers({});
      } else {
        setResponseMessage(getAContent('cmp_vetonest.com_NoSymptom_Found_Txt'));
      }
    } catch {
      setResponseMessage(getAContent('cmp_vetonest.com_NoSymptom_Found_Txt'));
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChange = (questionText, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionText]: value };
      if (onPersistAnswers) onPersistAnswers(next);
      return next;
    });
  };

  const handleCheckboxChange = (questionText, option, checked) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionText]) ? prev[questionText] : [];
      const next = {
        ...prev,
        [questionText]: checked
          ? [...current, option]
          : current.filter((v) => v !== option),
      };
      if (onPersistAnswers) onPersistAnswers(next);
      return next;
    });
  };

  const handleFollowUpSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("Follow-up answers:", answers);
    goToBooking();
  };

  const renderQuestion = (q, index) => {
    const { question, inputType, options = [] } = q;
    return (
      <div key={index} className="followup-question" style={{ marginBottom: "16px" }}>
        <label className="followup-label" style={{ 
          display: "block", 
          marginBottom: "6px", 
          fontSize: "14px",
          fontWeight: "500",
          color: "#333"
        }}>
          <strong>{index + 1}. {question}</strong>
        </label>

        {inputType === "radio" && (
          <div className="followup-options" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {options.map((opt) => (
              <label key={opt} className="followup-option-label" style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={opt}
                  checked={answers[question] === opt}
                  onChange={() => handleSingleChange(question, opt)}
                  style={{ accentColor: "#ffb800", cursor: "pointer" }}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {inputType === "checkbox" && (
          <div className="followup-options" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {options.map((opt) => (
              <label key={opt} className="followup-option-label" style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}>
                <input
                  type="checkbox"
                  value={opt}
                  checked={Array.isArray(answers[question]) && answers[question].includes(opt)}
                  onChange={(e) => handleCheckboxChange(question, opt, e.target.checked)}
                  style={{ accentColor: "#ffb800", cursor: "pointer" }}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {inputType === "select" && (
          <select
            value={answers[question] || ""}
            onChange={(e) => handleSingleChange(question, e.target.value)}
            className="followup-select"
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#ffb800";
              e.target.style.boxShadow = "0 0 0 3px rgba(255,184,0,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ddd";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">— {getAContent('cmp_vetonest.com_SelectAnswer_Txt')} —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {inputType === "text" && (
          <input
            type="text"
            value={answers[question] || ""}
            onChange={(e) => handleSingleChange(question, e.target.value)}
            placeholder={getAContent('cmp_vetonest.com_YourAnswer_Placeholder')}
            className="followup-input"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#ffb800";
              e.target.style.boxShadow = "0 0 0 3px rgba(255,184,0,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ddd";
              e.target.style.boxShadow = "none";
            }}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const a  = params.params.selectedPet;
    const up = params.params.animals;
    setAnimal(a);
    setUserPets(up);

    const loadBreeds = async () => {
      const map = {};
      for (const pet of up) {
        if (pet?.espece?.id && pet?.race?.id) {
          const breeds = await speciesBreedList(pet.espece.id);
          const breed  = breeds.find((b) => b.id === pet.race.id);
          map[pet.race.id] = breed
            ? { nom: breed.nom, tagRef: breed.tagRef }
            : { nom: '—', tagRef: null };
        }
      }
      setBreedNames(map);
    };

    if (up.length) loadBreeds();
  }, [params]);

  const aiResultReady      = aiSymptoms.length > 0 || aiUrgency;
  const showGetAppointment = aiResultReady && followUpQuestions.length === 0;
  const showFollowUp       = followUpQuestions.length > 0;

  if (!animal || !animal.id) return null;

  return (
    <div style={{ width: "100%" }}>
      {/* ── White card ── */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f0f0f0",
      }}>
        {/* Pet summary - same style as Step 2 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "10px",
          border: "1px solid #f0f0f0",
        }}>
          <img
            src={animal.picture ? `${base_url}uploads/files/pets/${animal.picture}` : photoAnimalDefaultSrc}
            alt="Pet"
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: "50%", 
              objectFit: "cover", 
              flexShrink: 0,
              border: "2px solid #fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          />
          <div>
            <h4 style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#1a1a2e" }}>{animal.nom}</h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
              {animal.espece && !FALLBACK_ESPECE_IDS.includes(Number(animal.espece.id)) ? getEspeceName(animal.espece.id) : ''}
              {animal.race && !FALLBACK_RACE_IDS.includes(Number(animal.race.id))
                ? ` · ${breedNames[animal.race.id]?.tagRef ? getAContent(breedNames[animal.race.id].tagRef) : (breedNames[animal.race.id]?.nom || '')}`
                : ''}
              {` · ${calculateAge(animal.dateNaissance?.date ?? '')} ${getAContent('cmp_vetonest.com_Years_Abbreviation')}`}
              {animal.sexe ? ` · ${animal.sexe.id ? getAContent('cmp_vetonest.com_Male_Gender') : getAContent('cmp_vetonest.com_w31LdP9aQs')}` : ''}
            </p>
          </div>
        </div>

        {/* ── Collapsible complaint section ── */}
        <div
		  onClick={() => setComplaintOpen((o) => !o)}
		  style={{
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			cursor: "pointer",
			userSelect: "none",
			padding: "12px 16px",
			backgroundColor: complaintOpen ? "#e6f4ff" : "#fafafa",
			borderRadius: "10px",
			border: `1px solid ${complaintOpen ? "#1677ff" : "#e8e8e8"}`,
			transition: "background-color 0.3s, border-color 0.3s",
			marginBottom: complaintOpen ? "16px" : "0",
		  }}
		>
		  {/* Left side: label + info icon */}
		  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
			<label
			  className="consultation-label"
			  style={{
				cursor: "pointer",
				margin: 0,
				fontSize: "15px",
				fontWeight: "500",
				color: "#1a1a2e",
			  }}
			>
			  {complaintOpen
				? getAContent('cmp_vetonest.com_ContactReason_Question') || "What made you contact a veterinarian today?"
				: primaryComplaint
				  ? `"${primaryComplaint.slice(0, 60)}${primaryComplaint.length > 60 ? "…" : ""}"`
				  : getAContent('cmp_vetonest.com_ContactReason_Question') || "What made you contact a veterinarian today?"}
			</label>

			{/* Tooltip icon – only visible when the section is closed, but you can show it always */}
			<Tooltip
			  title={getAContent('cmp_vetonest.com_AI_Tooltip_Text')}
			  placement="top"
			  overlayStyle={{ maxWidth: 280 }}
			>
			  <InfoCircleOutlined
				style={{
				  color: '#1677ff',
				  fontSize: '16px',
				  cursor: 'help',
				  flexShrink: 0,
				}}
				onClick={(e) => e.stopPropagation()} // prevents toggling when clicking the icon
			  />
			</Tooltip>
		  </div>

		  {/* Arrow (unchanged) */}
		  <span
			style={{
			  fontSize: "18px",
			  color: "#aaa",
			  transform: complaintOpen ? "rotate(180deg)" : "rotate(0deg)",
			  transition: "transform 0.3s ease",
			  flexShrink: 0,
			  marginLeft: "8px",
			}}
		  >
			▼
		  </span>
		</div>

        {/* Collapsible body */}
        <div style={{
          overflow: "hidden",
          maxHeight: complaintOpen ? "500px" : "0px",
          opacity: complaintOpen ? 1 : 0,
          transition: "max-height 0.4s ease, opacity 0.3s ease",
        }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 0 8px 0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "relative" }}>

              <textarea
				  value={primaryComplaint}
				  onChange={(e) => {
					setPrimaryComplaint(e.target.value);
					if (onPersistComplaint) onPersistComplaint(e.target.value);
				  }}
				  placeholder={getAContent('cmp_vetonest.com_PetHealthDescription_Placeholder') || "Describe your pet's symptoms, behavior changes, or any health concerns..."}
				  required
				  rows="4"
				  style={{
					width: "100%",
					boxSizing: "border-box",
					padding: "14px 16px",
					border: "1px solid #ddd",
					borderRadius: "10px",
					fontSize: "15px",
					fontFamily: "inherit",
					backgroundColor: "#fafafa",
					transition: "border-color 0.3s, box-shadow 0.3s",
					outline: "none",
					resize: "vertical",
					minHeight: "100px",
				  }}
				  onFocus={(e) => {
					e.target.style.borderColor = "#1677ff";
					e.target.style.boxShadow = "0 0 0 3px rgba(22,119,255,0.15)";
					e.target.style.backgroundColor = "#fff";
				  }}
				  onBlur={(e) => {
					e.target.style.borderColor = "#ddd";
					e.target.style.boxShadow = "none";
					e.target.style.backgroundColor = "#fafafa";
				  }}
				/>
              {/* Character counter */}
              <span style={{
                position: "absolute",
                bottom: "10px",
                right: "14px",
                fontSize: "12px",
                color: "#bbb",
                pointerEvents: "none",
              }}>
                {primaryComplaint.length}/500
              </span>
            </div>

            <button 
			  type="submit" 
			  disabled={loading} 
			  style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "8px",
				padding: "10px 24px",
				backgroundColor: "#FFDE59",
				color: "#333",
				border: "none",
				borderRadius: "6px",
				fontSize: "14px",
				fontWeight: "500",
				cursor: "pointer",
				transition: "all 0.3s ease",
				width: "auto",
				minWidth: "200px",
				height: "40px",
				margin: "0 auto",
				boxShadow: "0 2px 4px rgba(255,222,89,0.3)",
				whiteSpace: "nowrap",
			  }}
			  onMouseEnter={(e) => {
				e.target.style.backgroundColor = "#1677ff";
				e.target.style.color = "#fff";
				e.target.style.transform = "translateY(-1px)";
				e.target.style.boxShadow = "0 4px 8px rgba(22,119,255,0.3)";
			  }}
			  onMouseLeave={(e) => {
				e.target.style.backgroundColor = "#FFDE59";
				e.target.style.color = "#333";
				e.target.style.transform = "translateY(0)";
				e.target.style.boxShadow = "0 2px 4px rgba(255,222,89,0.3)";
			  }}
			>
			  {loading ? (
				<>
				  <span style={{
					width: 16,
					height: 16,
					border: "2px solid rgba(0,0,0,0.15)",
					borderTopColor: "#333",
					borderRadius: "50%",
					display: "inline-block",
					animation: "spin 0.7s linear infinite",
					flexShrink: 0,
				  }} />
				  {getAContent('cmp_vetonest.com_CheckingSymptoms_Txt') || "Checking symptoms..."}
				</>
			  ) : getAContent('cmp_vetonest.com_CheckPetSymptoms_Btn') || "Check my pet's symptoms"}
			</button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          {/* Error message */}
          {responseMessage && (
            <p style={{ 
              color: "#e74c3c", 
              fontSize: "14px", 
              margin: "8px 0 2px 0",
              padding: "10px 14px",
              backgroundColor: "#fef0ef",
              borderRadius: "8px",
              border: "1px solid #fce4e3"
            }}>
              {responseMessage}
            </p>
          )}
        </div>

        {/* ── AI results ── */}
        {aiResultReady && (
          <div style={{ 
            marginTop: "20px", 
            padding: "16px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e8edf2"
          }}>
            {aiSymptoms.length > 0 && (
              <>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                  {getAContent('cmp_vetonest.com_DetectedSymptoms_Title') || "Detected symptoms:"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {aiSymptoms.map((s, i) => (
                    <span key={i} style={{
                      padding: "4px 14px",
                      backgroundColor: "#fff",
                      borderRadius: "20px",
                      border: "1px solid #e0e7ef",
                      fontSize: "13px",
                      color: "#1a1a2e"
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
            {aiUrgency && (
              <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
                <strong style={{ color: "#1a1a2e" }}>
                  {getAContent('cmp_vetonest.com_Urgency_Label') || "Urgency:"}
                </strong> 
                <span style={{ 
                  marginLeft: "6px",
                  padding: "2px 12px",
                  borderRadius: "12px",
                  backgroundColor: aiUrgency.includes("urgent") ? "#fee8e8" : "#e8f5e9",
                  color: aiUrgency.includes("urgent") ? "#c0392b" : "#2e7d32",
                  fontSize: "13px",
                  fontWeight: "500"
                }}>
                  {getAContent(aiUrgency)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Follow-up questions ── */}
        {showFollowUp && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
            <p style={{ 
              margin: "0 0 16px 0", 
              fontSize: "15px",
              fontWeight: "500",
              color: "#1a1a2e"
            }}>
              {getAContent('cmp_vetonest.com_ChooseAppropriateAnswer_Txt') || "Please answer the following questions:"}
            </p>
            <form id="followup-form" onSubmit={handleFollowUpSubmit}>
              {followUpQuestions.map((q, i) => renderQuestion(q, i))}
            </form>
          </div>
        )}
      </div>

      {/* ── Skip button ── */}
	  {!aiResultReady && (
		  <div style={{ textAlign: "center", marginTop: "16px" }}>
			<span
			  onClick={goToBooking}
			  style={{
				fontSize: "14px",
				color: "#999",
				cursor: "pointer",
				padding: "6px 16px",
				borderRadius: "4px",
				transition: "color 0.2s, background-color 0.2s",
				display: "inline-block",
				height: "40px",
				lineHeight: "40px",
			  }}
			  onMouseEnter={(e) => {
				e.target.style.color = "#666";
				e.target.style.backgroundColor = "#f5f5f5";
			  }}
			  onMouseLeave={(e) => {
				e.target.style.color = "#999";
				e.target.style.backgroundColor = "transparent";
			  }}
			>
			  {getAContent('cmp_vetonest.com_Skip_Btn') || "Skip"} →
			</span>
		  </div>
		)}

      {/* ── "Get an appointment" button ── */}
      {(showGetAppointment || showFollowUp) && (
        <div style={{ 
          marginTop: "24px",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <button
			  type="button"
			  onClick={showFollowUp ? handleFollowUpSubmit : goToBooking}
			  style={{
				padding: "10px 32px",
				backgroundColor: "#FFDE59",
				color: "#333",
				border: "none",
				borderRadius: "6px",
				fontSize: "14px",
				fontWeight: "500",
				cursor: "pointer",
				transition: "all 0.3s ease",
				boxShadow: "0 2px 4px rgba(255,222,89,0.3)",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				height: "40px",
				whiteSpace: "nowrap",
			  }}
			  onMouseEnter={(e) => {
				e.target.style.backgroundColor = "#1677ff";
				e.target.style.color = "#fff";
				e.target.style.transform = "translateY(-1px)";
				e.target.style.boxShadow = "0 4px 8px rgba(22,119,255,0.3)";
			  }}
			  onMouseLeave={(e) => {
				e.target.style.backgroundColor = "#FFDE59";
				e.target.style.color = "#333";
				e.target.style.transform = "translateY(0)";
				e.target.style.boxShadow = "0 2px 4px rgba(255,222,89,0.3)";
			  }}
			>
			  {getAContent('cmp_vetonest.com_GetAppointment_Btn') || "Get an appointment"} →
			</button>
        </div>
      )}
    </div>
  );
};

export default ConsultationSymptoms;