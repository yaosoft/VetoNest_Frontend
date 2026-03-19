import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";

const ConsultationPetSelection = ({ animals, setAnimal, selectedPet }) => {
  const navigate = useNavigate();
  const { 
    base_url,
    photoAnimalDefaultSrc,
    especes,
    getAContent,
    speciesBreedList
  } = useContext(SiteContext);
  
  const [breedNames, setBreedNames] = useState([]); 

  const getEspeceName = (especeId) => {
    if (!especes.length) return '.';
    const especeName = especes.filter(j => j.id === especeId)[0] ? 
      getAContent(especes.filter(j => j.id === especeId)[0].tagRef) : '—';
    return especeName;
  };

  useEffect(() => {
    const loadBreeds = async () => {
      const map = {};
      for (const pet of animals) {
        if (pet?.espece?.id && pet?.race?.id) {
          const breeds = await speciesBreedList(pet.espece.id);		
          const breed = breeds.find(b => b.id === pet.race.id);
          map[pet.race.id] = breed ? breed.nom : '—';
        }
      }

      setBreedNames(map);
    };

    if (animals?.length) {
      loadBreeds();
    }
  }, [animals]);

  const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');

  return (
    <div>
      {/* Only display cards during step 1 */}
      {animals.length ? (
        <div className="consultation-pet-cards-container"> 
          {animals.map((pet) => (
            <div
              key={pet.id}
              className={`consultation-pet-card ${selectedPet === pet ? 'selected' : ''}`} // Highlight selected pet
              onClick={() => setAnimal(pet)} // Set the clicked pet as selected
            >
              <img
                src={pet.picture ? base_url + 'uploads/files/pets/' + pet.picture : photoDefaultSrc}
                alt={pet.nom}
              />
              <div className="consultation-pet-details">
                <h4 className="consultation-pet-name">{pet.nom}</h4>
                <p className="consultation-pet-info">
				{getAContent( 'cmp_vetonest.com_Sp94Te63Kz' )} : {pet.espece ? getEspeceName(pet.espece.id) : "Unknoawn"} <br />
					{ getAContent( 'cmp_vetonest.com_Br61Mx80Qp' )} : {pet.race ? breedNames[pet.race.id] : "Unknown"} <br />a
						{getAContent( 'cmp_vetonest.com_f82Ns91Qaz' )} : {new Date(pet.dateNaissance.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : 
	    <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="consultation-next-button"
            onClick={() => navigate("/profile")}
          >
            { getAContent( 'cmp_vetonest.com_CreateNewPet_Btn' ) }
          </button>
        </div>
	  }
    </div>
  );
};

export default ConsultationPetSelection;