import { useContext, useEffect, useState, useRef } from 'react';
import { SiteContext } from '../context/site';
import { AuthContext } from '../context/AuthProvider';

// Global cache for pet lists
const petListCache = new Map();
const pendingRequests = new Map();

export const usePetList = () => {
  const { profileId, profileTypeId } = useContext(AuthContext);
  const { getPetOwnerConsultationList } = useContext(SiteContext);
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!profileId || profileTypeId !== 1) {
      setPets([]);
      setLoading(false);
      return;
    }

    const cacheKey = `pets_${profileId}`;
    
    const fetchPets = async () => {
      // Check cache first
      if (petListCache.has(cacheKey)) {
        const cached = petListCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) { // 30 seconds cache
          setPets(cached.data);
          setLoading(false);
          return;
        }
      }

      // Check for pending request
      if (pendingRequests.has(cacheKey)) {
        const data = await pendingRequests.get(cacheKey);
        if (isMounted.current) {
          setPets(data);
          setLoading(false);
        }
        return;
      }

      // Make the request
      const promise = (async () => {
        try {
          const response = await getPetOwnerConsultationList(profileId);
          const petList = response?.consultations?.map(c => c.carnetAnimal) || [];
          // Deduplicate pets by ID
          const uniquePets = Array.from(new Map(petList.map(pet => [pet.id, pet])).values());
          return uniquePets;
        } catch (err) {
          console.error('Error fetching pets:', err);
          throw err;
        }
      })();

      pendingRequests.set(cacheKey, promise);
      
      try {
        const data = await promise;
        petListCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        if (isMounted.current) {
          setPets(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message);
        }
      } finally {
        pendingRequests.delete(cacheKey);
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchPets();
  }, [profileId, profileTypeId, getPetOwnerConsultationList]);

  return { pets, loading, error };
};