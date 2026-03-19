import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';
import ConsultationSidebar from '../ConsultationSidebar';
import ConsultationProcess from "../ConsultationProcess";

const Consultation = () => {
  const { profileId } = useContext(AuthContext);
  const { getUserPets, getAContent } = useContext(SiteContext);

  const [isCreation, setIsCreation] = useState(false);
  const [animals, setAnimals] = useState([]);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/consultation/creation')) {
      setIsCreation(true);
    } else {
      setIsCreation(false);
    }

    const fetchPets = async () => {
      try {
        const userPets = await getUserPets(profileId);
        setAnimals(userPets || []);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setAnimals([]);
        // Optionally, display a message or error state
      }
    };

    fetchPets();
  }, [location.pathname, profileId, getUserPets]);

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={isCreation ? getAContent('cmp_vetonest.com_RequestConsultation_Btn') : getAContent('cmp_vetonest.com_YourConsultations_Txt')} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", minHeight: "calc(100vh - 120px)" }}>

        {/* Left sidebar */}
        <ConsultationSidebar />

        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 32px", minWidth: 0, boxSizing: "border-box" }}>
          {isCreation ? (
            <ConsultationProcess animals={animals} />
          ) : (
            <div>{ getAContent('cmp_vetonest.com_MyConsultations_Alt_Txt') }</div>
          )}
        </main>

      </div>

      <Footer />
    </>
  );
};

export default Consultation;