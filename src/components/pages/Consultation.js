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
  const { getUserPets, getAContent } = useContext(SiteContext);

  const [isCreation, setIsCreation] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  const location = useLocation();

  // Memoize the pathname check
  const checkIsCreation = useCallback(() => {
    return location.pathname.includes('/consultation/creation');
  }, [location.pathname]);

  useEffect(() => {
    setIsCreation(checkIsCreation());
  }, [checkIsCreation]);

  // Optimized fetchPets with caching
  useEffect(() => {
    // Only fetch if we're on the creation page and haven't fetched yet
    if (!isCreation) return;
    if (!profileId) return;
    if (hasFetchedRef.current && animals.length > 0) return;

    const fetchPets = async () => {
      const cacheKey = `pets_${profileId}`;
      
      // Check cache first
      if (petsCache.has(cacheKey)) {
        const cached = petsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) { // 30 seconds cache
          setAnimals(cached.data);
          return;
        }
      }

      // Check if there's already a pending request
      if (pendingRequest) {
        const data = await pendingRequest;
        setAnimals(data || []);
        return;
      }

      setIsLoading(true);
      
      // Create the promise
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
        // Cache the result
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
            isLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <Spin size="large" />
                <p style={{ marginTop: "20px", color: "#888" }}>Loading your pets...</p>
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