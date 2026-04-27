import React, { useState, useContext, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";
import { useCachedData } from "../hooks/useCachedData";

const ConsultationPetSelection = React.memo(({ animals, setAnimal, selectedPet }) => {
  const navigate = useNavigate();
  const { 
    base_url,
    especes,
    getAContent,
    speciesBreedList,
    photoAnimalDefaultSrc,
  } = useContext(SiteContext);
  
  const { fetchWithCache } = useCachedData();
  const [imageErrors, setImageErrors] = useState({});
  const [breedNames, setBreedNames] = useState({});
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
  const loadedSpeciesRef = useRef(new Set());
  const photoDefaultSrc = photoAnimalDefaultSrc;

  // Memoize the species name mapping
  const getEspeceName = useCallback((especeId) => {
    if (!especes?.length) return '—';
    const espece = especes.find(j => j.id === especeId);
    return espece ? getAContent(espece.tagRef) : '—';
  }, [especes, getAContent]);

  const formatShortDate = useCallback((dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const getImageSrc = useCallback((pet) => {
    if (imageErrors[pet.id]) return photoDefaultSrc;
    if (pet.picture) return `${base_url}uploads/files/pets/${pet.picture}`;
    return photoDefaultSrc;
  }, [base_url, imageErrors]);

  const handleImageError = useCallback((petId) => {
    setImageErrors(prev => ({ ...prev, [petId]: true }));
  }, []);

  const handlePetClick = useCallback((pet) => {
    setAnimal(pet);
  }, [setAnimal]);

  // Load breed names efficiently with caching
  useEffect(() => {
    if (!animals?.length) return;

    const loadBreeds = async () => {
      // Collect unique species that need breed loading
      const speciesToLoad = [];
      const breedMap = {};

      for (const pet of animals) {
        const speciesId = pet.espece?.id;
        const breedId = pet.race?.id;
        
        if (speciesId && breedId && !loadedSpeciesRef.current.has(speciesId)) {
          speciesToLoad.push(speciesId);
        }
        
        // If breed name already exists in pet object, use it directly
        if (pet.race?.nom) {
          breedMap[breedId] = { nom: pet.race.nom, tagRef: pet.race.tagRef || null };
        }
      }

      // Fetch if any breed is missing its nom OR its tagRef (needed for localisation)
      const needsFetching = speciesToLoad.length > 0 && 
        animals.some(pet => pet.race?.id && (!pet.race?.nom || !pet.race?.tagRef));
      
      if (!needsFetching && Object.keys(breedMap).length === 0) {
        // No fetching needed
        return;
      }

      setIsLoadingBreeds(true);

      try {
        // Fetch breeds for each unique species (only once per species)
        for (const speciesId of speciesToLoad) {
          if (!loadedSpeciesRef.current.has(speciesId)) {
            try {
              const breeds = await fetchWithCache(
                `breeds_${speciesId}`,
                () => speciesBreedList(speciesId),
                300000 // Cache for 5 minutes
              );
              
              if (breeds && Array.isArray(breeds)) {
                breeds.forEach(breed => {
                  if (breed.id && breed.nom) {
                    breedMap[breed.id] = { nom: breed.nom, tagRef: breed.tagRef || null };
                  }
                });
              }
              loadedSpeciesRef.current.add(speciesId);
            } catch (error) {
              console.error(`Error loading breeds for species ${speciesId}:`, error);
            }
          }
        }
        
        setBreedNames(breedMap);
      } finally {
        setIsLoadingBreeds(false);
      }
    };

    loadBreeds();
  }, [animals, speciesBreedList, fetchWithCache]);

  // Memoize animals list
  const memoizedAnimals = useMemo(() => {
    if (!animals?.length) return [];
    return animals;
  }, [animals]);

  // If no animals, show create button
  if (!memoizedAnimals.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          className="consultation-next-button"
          onClick={() => navigate("/profile")}
        >
          {getAContent('cmp_vetonest.com_CreateNewPet_Btn')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {isLoadingBreeds && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>Loading breeds...</span>
        </div>
      )}
      <div className="consultation-pet-cards-container"> 
        {memoizedAnimals.map((pet) => {
          // Get breed name from pet object or from fetched breeds
          const _breedEntry = pet.race?.id ? breedNames[pet.race.id] : null;
          const breedName = _breedEntry
            ? (_breedEntry.tagRef ? getAContent(_breedEntry.tagRef) : (_breedEntry.nom || '—'))
            : (pet.race?.nom || '—');
          
          return (
            <div
              key={pet.id}
              className={`consultation-pet-card ${selectedPet?.id === pet.id ? 'selected' : ''}`}
              onClick={() => handlePetClick(pet)}
            >
              <div className="consultation-pet-image-container">
                <img
                  src={getImageSrc(pet)}
                  alt={pet.nom}
                  className="consultation-pet-card-img"
                  loading="lazy"
                  onError={() => handleImageError(pet.id)}
                />
              </div>
              <div className="consultation-pet-details">
                <h4 className="consultation-pet-name">{pet.nom}</h4>
                <p className="consultation-pet-info">
                  {getAContent('cmp_vetonest.com_Sp94Te63Kz')} : {pet.espece ? getEspeceName(pet.espece.id) : "Unknown"}
                  <br />
                  {getAContent('cmp_vetonest.com_Br61Mx80Qp')} : {breedName}
                  <br />
                  <span className="date-line">
                    {getAContent('cmp_vetonest.com_f82Ns91Qaz')} : {formatShortDate(pet.dateNaissance?.date || pet.dateNaissance)}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ConsultationPetSelection.displayName = 'ConsultationPetSelection';

export default ConsultationPetSelection;