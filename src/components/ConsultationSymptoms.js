import React, { useState, useContext, useEffect } from "react";
import { SiteContext } from "../context/site";
import moment from "moment";

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

  const [breedNames, setBreedNames]               					= useState([]);
  const [primaryComplaint, setPrimaryComplaint]   					= useState("");
  const [aiSymptoms, setAiSymptoms]               					= useState([]);
  const [aiUrgency, setAiUrgency]                 					= useState("");
  
  const [loading, setLoading]                     					= useState(false);
  const [responseMessage, setResponseMessage]     					= useState("");
  const [followUpQuestions, setFollowUpQuestions] 					= useState([]);
  const [answers, setAnswers]                     					= useState({});
  const [userPets, setUserPets]                   					= useState([]);
  const [animal, setAnimal]                       					= useState({});

  // ── Collapsible complaint section ───────────────────────────────────────
  const [complaintOpen, setComplaintOpen] = useState(true);
  const [aiData, setAiData]               = useState(null);

  const calculateAge = (birthdate) => moment().diff(moment(birthdate), 'years');

  const getEspeceName = (especeId) => {
    if (!especes.length) return '.';
    const found = especes.find((j) => j.id == especeId);
    return found ? getAContent(found.tagRef) : '—';
  };

  const goToBooking = () => {
    if (params.onNext) params.onNext({
      ...aiData,
      complaint:       primaryComplaint,  // local state — the user's typed complaint
      followUpAnswers: answers,            // local state — the user's follow-up answers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
	const symptomData = {
	  complaint: primaryComplaint,
	  animalId:  animal.id,
	  specie:    animal.espece ? getEspeceName(animal.espece.id) : 'Unknown',
	  breed:     animal.race   ? breedNames[animal.race.id]      : 'Unknown',
      siteLocale:	 siteLocale.split( '-' )[0],	// fr, en, ...
	  // Format: "ID--Name*ID--Name"
	  vetSpecialities: allSpecialities
		.map(s => `${s.id}--${s.name}`)
		.join('*'),

	  // Format: "ID--Name*ID--Name"
	  clinicTypes: allEtablissementTypes
		.map(c => `${c.id}--${c.name}`)
		.join('*'),
	};

    try {
      const data = await consultationPrimaryComplaint(symptomData);
console.log( '>>>>>>>>>>>> ddddddddd data', data );
      if (data.success) {
        setAiSymptoms(data.symptoms);
        setAiUrgency(data.urgency);
		setRecommendedSpecialityId(data.recommendedSpecialityId);
		setRecommendedClinicTypeId(data.recommendedClinicTypeId);
        setFollowUpQuestions(data.followUpQuestions);
        setAnswers({});
        setAiData(data);
        setResponseMessage("");
        setComplaintOpen(false); // ← auto-collapse when AI responds
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
    setAnswers((prev) => ({ ...prev, [questionText]: value }));
  };

  const handleCheckboxChange = (questionText, option, checked) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionText]) ? prev[questionText] : [];
      return {
        ...prev,
        [questionText]: checked
          ? [...current, option]
          : current.filter((v) => v !== option),
      };
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
      <div key={index} className="followup-question">
        <label className="followup-label"><strong>{index + 1}. {question}</strong></label>

        {inputType === "radio" && (
          <div className="followup-options">
            {options.map((opt) => (
              <label key={opt} className="followup-option-label">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={opt}
                  checked={answers[question] === opt}
                  onChange={() => handleSingleChange(question, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        {inputType === "checkbox" && (
          <div className="followup-options">
            {options.map((opt) => (
              <label key={opt} className="followup-option-label">
                <input
                  type="checkbox"
                  value={opt}
                  checked={Array.isArray(answers[question]) && answers[question].includes(opt)}
                  onChange={(e) => handleCheckboxChange(question, opt, e.target.checked)}
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
          map[pet.race.id] = breed ? breed.nom : '—';
        }
      }
      setBreedNames(map);
    };

    if (up.length) loadBreeds();
  }, [params]);

  const aiResultReady      = aiSymptoms.length > 0 || aiUrgency;
  const showGetAppointment = aiResultReady && followUpQuestions.length === 0;
  const showFollowUp       = followUpQuestions.length > 0;

  // Guard: don't render until animal is populated
  if (!animal || !animal.id) return null;

  return (
    <div style={{ width: "100%" }}>

      {/* ── Gray card ── */}
      <div className="consultation-symptoms-container">

        {/* Pet summary */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #eee",
        }}>
          <img
            src={animal.picture ? `${base_url}uploads/files/pets/${animal.picture}` : photoAnimalDefaultSrc}
            alt="Pet"
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div>
			  <h4 style={{ margin: "0 0 2px 0" }}>{animal.nom}</h4>
			  <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
				{animal.espece ? getEspeceName(animal.espece.id) : 'Unknown'}
				{animal.race ? ` · ${breedNames[animal.race.id] || ''}` : ''}
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
            padding: "6px 0",
          }}
        >
          <label className="consultation-label" style={{ cursor: "pointer", margin: 0 }}>
            {complaintOpen
              ? getAContent('cmp_vetonest.com_ContactReason_Question')
              : primaryComplaint
                ? `"${primaryComplaint.slice(0, 60)}${primaryComplaint.length > 60 ? "…" : ""}"`
                : getAContent('cmp_vetonest.com_ContactReason_Question')}
          </label>
          {/* Caret icon */}
          <span style={{
            fontSize: "18px",
            color: "#aaa",
            transform: complaintOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            marginLeft: "8px",
          }}>
            ▼
          </span>
        </div>

        {/* Collapsible body */}
        <div style={{
          overflow: "hidden",
          maxHeight: complaintOpen ? "400px" : "0px",
          opacity: complaintOpen ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.2s ease",
        }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}
            onClick={(e) => e.stopPropagation()} // prevent row click from toggling collapse
          >
            <textarea
              value={primaryComplaint}
              onChange={(e) => setPrimaryComplaint(e.target.value)}
              placeholder={getAContent('cmp_vetonest.com_PetHealthDescription_Placeholder')}
              required
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <button type="submit" disabled={loading} className="consultation-next-button-complaint" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                    flexShrink: 0,
                  }} />
                  {getAContent('cmp_vetonest.com_CheckingSymptoms_Txt')}
                </>
              ) : getAContent('cmp_vetonest.com_CheckPetSymptoms_Btn')}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          {/* Error message */}
          {responseMessage && (
            <p style={{ color: "red", fontSize: "13px", margin: "6px 0 2px 0" }}>
              {getAContent('cmp_vetonest.com_ServerError_Txt')}
            </p>
          )}

        </div>

        {/* ── AI results ── */}
        {aiResultReady && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            {aiSymptoms.length > 0 && (
              <>
                <p style={{ margin: "0 0 4px 0" }}><strong>{getAContent('cmp_vetonest.com_DetectedSymptoms_Title')}:</strong></p>
                <ul style={{ marginTop: 0 }}>
                  {aiSymptoms.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            )}
            {aiUrgency && (
              <p style={{ margin: "4px 0 0" }}><strong>{getAContent('cmp_vetonest.com_Urgency_Label')}:</strong> { getAContent( aiUrgency ) }</p>
            )}
          </div>
        )}

        {/* ── Follow-up questions ── */}
        {showFollowUp && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <p style={{ margin: "0 0 12px 0" }}><strong>{getAContent('cmp_vetonest.com_ChooseAppropriateAnswer_Txt')}:</strong></p>
            <form id="followup-form" onSubmit={handleFollowUpSubmit}>
              {followUpQuestions.map((q, i) => renderQuestion(q, i))}
            </form>
          </div>
        )}

      </div>
      {/* ── End gray card ── */}

      {/* ── Skip — outside the card, disappears when AI responds ── */}
      {!aiResultReady && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <span
            onClick={goToBooking}
            style={{ fontSize: "13px", color: "#888", cursor: "pointer", textDecoration: "underline" }}
          >
            {getAContent('cmp_vetonest.com_Skip_Btn')} →
          </span>
        </div>
      )}

      {/* ── "Get an appointment" — outside the card ── */}
      {(showGetAppointment || showFollowUp) && (
        <div className="next-button-container">
          <button
            type="button"
            onClick={showFollowUp ? handleFollowUpSubmit : goToBooking}
            className="consultation-next-button"
          >
            {getAContent('cmp_vetonest.com_GetAppointment_Btn')} →
          </button>
        </div>
      )}

    </div>
  );
};

export default ConsultationSymptoms;