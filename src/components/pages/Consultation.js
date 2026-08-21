import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';
import ConsultationSidebar from '../ConsultationSidebar';
import ConsultationProcess from "../ConsultationProcess";
import { Spin } from "antd";

// Cache for pets data
const petsCache = new Map();
let pendingRequest = null;

const Consultation = () => {
  const { profileId } = useContext(AuthContext);
  const { getUserPets, getAContent, siteContent } = useContext(SiteContext); // ← add siteContent

  const [isCreation, setIsCreation] = useState(false);
  const [animals, setAnimals] = useState([]);

  const [isLoading, setIsLoading] = useState(() => {
    const isCreationPath = window.location.pathname.includes('/consultation/creation');
    const cacheKey = `pets_${profileId}`;
    return isCreationPath && !petsCache.has(cacheKey);
  });

  const hasFetchedRef = useRef(false);
  const location = useLocation();

  const checkIsCreation = useCallback(() => {
    return location.pathname.includes('/consultation/creation');
  }, [location.pathname]);

  useEffect(() => {
    setIsCreation(checkIsCreation());
  }, [checkIsCreation]);

  useEffect(() => {
    if (!isCreation || !profileId) {
      setIsLoading(false);
      return;
    }

    if (hasFetchedRef.current && animals.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchPets = async () => {
      const cacheKey = `pets_${profileId}`;
      
      if (petsCache.has(cacheKey)) {
        const cached = petsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) {
          setAnimals(cached.data);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);

      if (pendingRequest) {
        try {
          const data = await pendingRequest;
          setAnimals(data || []);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      pendingRequest = (async () => {
        try {
          const userPets = await getUserPets(profileId);
          return userPets || [];
        } catch (error) {
          console.error("Error fetching pets:", error);
          return [];
        }
      })();

      try {
        const data = await pendingRequest;
        petsCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        setAnimals(data);
        hasFetchedRef.current = true;
      } catch (error) {
        console.error("Error in fetch:", error);
        setAnimals([]);
      } finally {
        setIsLoading(false);
        pendingRequest = null;
      }
    };

    fetchPets();
  }, [isCreation, profileId, getUserPets, animals.length]);

  // ↓ True loading = pets are loading OR siteContent isn't ready yet
  const showSpinner = isCreation && (isLoading || !siteContent.length);

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title 
          title={
            isCreation 
              ? getAContent('cmp_vetonest.com_RequestConsultation_Btn') 
              : getAContent('cmp_vetonest.com_YourConsultations_Txt')
          } 
        />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", minHeight: "calc(100vh - 120px)" }}>
        <ConsultationSidebar />

        <main style={{ flex: 1, padding: "24px 32px", minWidth: 0, boxSizing: "border-box" }}>
          {isCreation ? (
            showSpinner ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
                {/* Only render the text once siteContent is ready, avoiding the '...' fallback */}
                {siteContent.length > 0 && (
                  <p style={{ marginTop: "20px", color: "#888" }}>
                    {getAContent('cmp_vetonest.com_loading_pets')}
                  </p>
                )}
              </div>
            ) : (
              <ConsultationProcess animals={animals} />
            )
          ) : (
            <div>{getAContent('cmp_vetonest.com_MyConsultations_Alt_Txt')}</div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default React.memo(Consultation);