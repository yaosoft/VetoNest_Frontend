import React, { useState, useMemo, useContext, useEffect, useRef } from "react";
import { AutoComplete, Spin, Divider, Tag, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";
import VetName from "./VetName";

const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export default function ResponsiveSearch() {
  const { 
    getAContent,
    getVetAutocomplete,
    getTypeSpecialityAutocomplete,
    getPlaceAutocomplete,
    getPopularCities,
    getAVetoProfile,
    countriesAllowed,
  } = useContext(SiteContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [veto, setVeto] = useState(""); 
  const [locationInput, setLocation] = useState("");
  const [vetoType, setVetoType] = useState("");

  const [vetoOptions, setVetoOptions] = useState([]);
  const [vetoTypeOptions, setVetoTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [vetoLoading, setVetoLoading] = useState(false);
  const [vetoTypeLoading, setVetoTypeLoading] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  
  const [vetDetailsCache, setVetDetailsCache] = useState({});

  // Load popular cities on mount
  useEffect(() => {
    const loadData = async () => {
// console.log( '>>>>>>>> foooooo', 'foooooo' );
        const cities = await getPopularCities();
// console.log( '>>>>>>>> cities', cities );
        setPopularCities(cities || []);
    };
    loadData();
  }, []);

  // Fetch vet details to get title information
  const fetchVetDetails = async (vetId) => {
    if (vetDetailsCache[vetId]) return vetDetailsCache[vetId];
    
    try {
      const vetData = await getAVetoProfile(vetId);
      if (vetData && !vetData.error) {
        setVetDetailsCache(prev => ({ ...prev, [vetId]: vetData }));
        return vetData;
      }
    } catch (error) {
      console.error("Error fetching vet details:", error);
    }
    return null;
  };

  // Load Vet / Clinic options
  const loadVeto = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        if (q.length < 2 && q.length > 0) {
          setVetoOptions([]);
          return;
        }
        
        setVetoLoading(true);
        try {
          const limit = 8;
          const data = await getVetAutocomplete(q, limit);
          
          const processedOptions = await Promise.all(
            data.map(async (x) => {
              const isVet = x.type === 'vet';
              const iconClass = isVet ? 'fa fa-user-md' : 'fa fa-hospital-o';
              const translatedType = isVet 
                ? getAContent('cmp_vetonest.com_Q6FO7QyF7m') || 'Vétérinaire'
                : getAContent('cmp_vetonest.com_Au27Wd56Cq') || 'Clinique';
              
              let vetData = null;
              
              if (isVet) {
                vetData = await fetchVetDetails(x.id);
              }
              
              return {
                value: `${x.type}-${x.id}`,
                label: isVet && vetData ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <i className={iconClass} style={{ marginRight: 10, color: '#000000' }}></i>
                      <VetName 
                        vet={vetData}
                        showTitle={true}
                        format="full"
                        withTooltip={true}
                      />
                    </div>
                    <Tag size="small" style={{ fontSize: '10px' }}>{translatedType}</Tag>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <i className={iconClass} style={{ marginRight: 10, color: '#000000' }}></i>
                      <span>{x.value}</span>
                    </div>
                    <Tag size="small" style={{ fontSize: '10px' }}>{translatedType}</Tag>
                  </div>
                ),
                realId: x.id,
                type: x.type,
                rawName: x.value,
                vetData: vetData
              };
            })
          );
          
          setVetoOptions(processedOptions);
        } catch (error) {
          console.error("Error fetching autocomplete data:", error);
          setVetoOptions([]);
        } finally {
          setVetoLoading(false);
        }
      }, 300),
    [getVetAutocomplete, getAVetoProfile, getAContent]
  );

  // Select handler for Vet / Clinic
  const onSelectVeto = (value, option) => {
    setVeto(option.rawName);
    setTimeout(() => {
      if (option.type === 'vet') {
        navigate(`/vet-profile?vetId=${option.realId}`);
      } else if (option.type === 'clinic') {
        navigate(`/etablissement?etablissementId=${option.realId}`);
      }
    }, 100);
  };

  // Load Vet Specialty / Clinic Type options
  const loadVetoType = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        if (q.length < 2 && q.length > 0) {
          setVetoTypeOptions([]);
          return;
        }
        
        setVetoTypeLoading(true);
        try {
          const limit = 8;
          const data = await getTypeSpecialityAutocomplete(q, limit);
          setVetoTypeOptions(
            data.map((x) => ({
              value: `${x.type}-${x.id}`,
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className="fa fa-tag" style={{ marginRight: 10, color: '#000000' }}></i>
                  {getAContent(x.value)}
                </div>
              ),
              realId: x.id,
              type: x.type,
              rawName: x.value
            }))
          );
        } catch (error) {
          setVetoTypeOptions([]);
        } finally {
          setVetoTypeLoading(false);
        }
      }, 300),
    [getAContent, getTypeSpecialityAutocomplete]
  );

  // Select handler for Vet Specialty / Clinic Type
  const onSelectVetoType = (value, option) => {
    setVetoType(getAContent(option.rawName));
    setTimeout(() => {
      if (option.type === 'vet') {
        navigate(`/vet-listing?searchName=vetoSpecialityId&searchValue=${option.realId}`);
      } else if (option.type === 'type') {
        navigate(`/vet-listing?searchName=etablissementTypeId&searchValue=${option.realId}`);
      }
    }, 100);
  };

  // Handle city click - search by city name
  const handleCityClick = (cityName) => {
    setLocation(cityName);
    setLocationDropdownOpen(false);
    setTimeout(() => {
      navigate(`/vet-listing?searchName=location&searchValue=${encodeURIComponent(cityName)}`);
    }, 100);
  };

  // Render flag component
  const renderFlag = (isoCode) => {
    if (!isoCode) return null;
    return (
      <div style={{ 
        width: '16px', 
        height: '12px', 
        display: 'inline-flex',
        marginLeft: '8px',
        verticalAlign: 'middle',
        backgroundImage: `url(/img/flags/${isoCode.toLowerCase()}.svg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '2px',
        border: '1px solid #e0e0e0'
      }} />
    );
  };

  // Get country ISO from country name
  const getCountryIso = (countryName) => {
    if (!countryName || !countriesAllowed) return null;
    const country = countriesAllowed.find(c => 
      c.nom?.toLowerCase() === countryName.toLowerCase()
    );
    return country?.iso;
  };

  // Get localized country name
  const getLocalizedCountry = (countryName) => {
    if (!countryName || !countriesAllowed) return countryName;
    const country = countriesAllowed.find(c => 
      c.nom?.toLowerCase() === countryName.toLowerCase()
    );
    if (country && country.tagRef) {
      const translated = getAContent(country.tagRef);
      if (translated && translated !== country.tagRef) {
        return translated;
      }
    }
    return countryName;
  };

  // Load location options - ALWAYS show cities with flags and country
  const loadLocation = useMemo(
    () =>
      debounce(async (text) => {
        const q = text?.trim() || '';
        
        setLocationLoading(true);
        try {
          let cities = [];
          
          // If input is empty, use popular cities
          if (q.length === 0) {
            cities = popularCities.slice(0, 10);
          } 
          // If user typed something, search for cities
          else if (q.length >= 2) {
            const data = await getPlaceAutocomplete(q, 15);
            cities = data || [];
          } else {
            // Less than 2 chars and not empty - don't show results yet
            setLocationOptions([]);
            setLocationDropdownOpen(false);
            setLocationLoading(false);
            return;
          }
          
          if (!cities || cities.length === 0) {
            setLocationOptions([]);
            setLocationDropdownOpen(false);
            return;
          }
console.log( '>>>>>>>>>>>>>>>>>>>>>> popularCities', popularCities );
          // Format options: City + Flag + Country
          const options = cities.map((city) => {
            const cityName = city.city || city.value || city.display;
            const countryName = city.country || city.pays;
            const countryIso = city.countryIso || getCountryIso(countryName);
            const localizedCountry = getLocalizedCountry(countryName);
            
            return {
              value: cityName,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>
                    <i className="fa fa-map-marker" style={{ marginRight: 10, color: '#000000' }} />
                    {cityName}
                    {renderFlag(countryIso)}
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                      {localizedCountry || countryName}
                    </span>
                  </span>
                  <Tag size="small" style={{ fontSize: '10px', backgroundColor: '#f0f0f0' }}>
                    {getAContent('cmp_vetonest.com_City_Label') || 'Ville'}
                  </Tag>
                </div>
              ),
              rawValue: cityName,
            };
          });
          
          setLocationOptions(options);
          setLocationDropdownOpen(options.length > 0);
        } catch (error) {
          console.error("Error fetching location data:", error);
          setLocationOptions([]);
          setLocationDropdownOpen(false);
        } finally {
          setLocationLoading(false);
        }
      }, 300),
    [getPlaceAutocomplete, getAContent, popularCities, countriesAllowed]
  );

  // Handle location input change
  const handleLocationChange = (value) => {
    setLocation(value);
    loadLocation(value);
  };

  // Handle location focus - opens dropdown with popular cities
  const handleLocationFocus = () => {
    setLocationDropdownOpen(true);
    // If input is empty, load popular cities
    if (!locationInput || locationInput.length === 0) {
      loadLocation('');
    } else if (locationInput.length >= 2) {
      loadLocation(locationInput);
    } else {
      // For 1 character, don't load anything but keep dropdown open?
      setLocationOptions([]);
    }
  };

  // Handle location selection
  const onSelectLocation = (value, option) => {
    const cityName = option?.rawValue || value;
    handleCityClick(cityName);
  };

  // Submit search
  const onSubmit = () => navigate('/vet-listing');

  return (
    <div className="search-wrapper">
      <div className="responsive-search">
        <button className="search-toggle" onClick={() => setOpen((v) => !v)} type="button">
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">
            {getAContent("cmp_vetonest.com_Fv29Qp84Lm")}
          </span>
        </button>

        <div className={`search-panel ${open ? "open" : ""}`}>
          
          {/* 1. Vet / Clinic */}
          <div className="search-field backgroundYellow">
            <i className="fa fa-search search_icon" style={{ fontSize: "1.8em", color: "#000000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={veto}
              options={vetoOptions}
              onSearch={(t) => { setVeto(t); loadVeto(t); }}
              onSelect={onSelectVeto}
              onFocus={() => loadVeto(veto)}
              notFoundContent={vetoLoading ? <Spin size="small" /> : (veto.length >= 2 ? getAContent("cmp_vetonest.com_no_results") || "Aucun résultat" : null)}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_6MUu5pTZNM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* 2. Vet Specialty / Clinic Type */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-signs" style={{ fontSize: "1.8em", color: "#000000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={vetoType}
              options={vetoTypeOptions}
              onSearch={(t) => { setVetoType(t); loadVetoType(t); }}
              onSelect={onSelectVetoType}
              onFocus={() => loadVetoType(vetoType)}
              notFoundContent={vetoTypeLoading ? <Spin size="small" /> : (vetoType.length >= 2 ? getAContent("cmp_vetonest.com_no_results") || "Aucun résultat" : null)}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_8MTgkmDbBM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* 3. Location - Always shows City + Flag + Country */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-marker" style={{ fontSize: "1.8em", color: "#000000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={locationInput}
              options={locationOptions}
              onSearch={handleLocationChange}
              onSelect={onSelectLocation}
              onFocus={handleLocationFocus}
              onBlur={() => {
                setTimeout(() => setLocationDropdownOpen(false), 200);
              }}
              open={locationDropdownOpen}
              dropdownStyle={{ minWidth: 300, maxHeight: 400 }}
              notFoundContent={locationLoading ? <Spin size="small" /> : 
                (locationInput && locationInput.length >= 2 ? getAContent("cmp_vetonest.com_no_cities_found") || "Aucune ville trouvée" : null)}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_L20sx18Qmv")}
                className="backgroundYellow borderNone width100per100"
                onClick={() => {
                  setLocationDropdownOpen(true);
                  if (!locationInput || locationInput.length === 0) {
                    loadLocation('');
                  }
                }}
              />
            </AutoComplete>
          </div>

          <button className="search-submit" type="button" onClick={onSubmit}>
            {getAContent("cmp_vetonest.com_Sr82Lm49Qx")} →
          </button>
        </div>
      </div>
    </div>
  );
}