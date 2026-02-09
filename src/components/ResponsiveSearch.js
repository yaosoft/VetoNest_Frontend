import React, { useState, useMemo, useContext } from "react";
import { AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import { SiteContext } from "../context/site";

const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

const MIN_CHARS = 2;

export default function ResponsiveSearch() {
  const { 
    getAContent,
    getVetAutocomplete,
    getTypeSpecialityAutocomplete,
    getPlaceAutocomplete,
  } = useContext(SiteContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [veto, setVeto] = useState(""); 
  const [locationInput, setLocation] = useState("");
  const [vetoType, setVetoType] = useState("");

  const [vetoOptions, setVetoOptions] = useState([]);
  const [vetoTypeOptions, setVetoTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // Load Vet / Clinic options
  const loadVeto = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        // If you want it to show NOTHING when empty, keep this. 
        // If you want it to show default list, remove the length check.
        // if (q.length < MIN_CHARS) return setVetoOptions([]);
        try {
          const limit = 8;
          const data = await getVetAutocomplete(q, limit);

          setVetoOptions(
            data.map((x) => {
              const isVet = x.type === 'vet';
              const iconClass = isVet ? 'fa fa-user-md' : 'fa fa-hospital-o';
              return {
                value: `${x.type}-${x.id}`,
                label: (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <i className={iconClass} style={{ marginRight: 10 }}></i>
                    {`${x.value} (${x.type})`}
                  </div>
                ),
                realId: x.id,
                type: x.type,
                rawName: x.value
              };
            })
          );
        } catch (error) {
          console.error("Error fetching autocomplete data:", error);
          setVetoOptions([]);
        }
      }, 300),
    [getVetAutocomplete]
  );

	// Updated Select handler for Vet / Clinic
    const onSelectVeto = (value, option) => {
		setVeto(option.rawName);

		// Delay navigation slightly to allow state to settle
		setTimeout(() => {
		  if (option.type === 'vet') {
			navigate(`/vet-profile?vetId=${option.realId}`);
		  } else if (option.type === 'clinic') {
			navigate(`/etablissement?etablissementId=${option.realId}`);
		  }
		}, 100);
    };

  const loadVetoType = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        // if (q.length < MIN_CHARS) return setVetoTypeOptions([]);
        try {
          const limit = 8;
          const data = await getTypeSpecialityAutocomplete(q, limit);
          setVetoTypeOptions(
            data.map((x) => ({
              value: `${x.type}-${x.id}`,
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className="fa fa-home" style={{ marginRight: 10 }}></i>
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
        }
      }, 300),
    [getAContent, getTypeSpecialityAutocomplete]
  );

  // Updated Select handler for Vet Specialty / Clinic Type
  const onSelectVetoType = (value, option) => {
    setVetoType( getAContent( option.rawName ) );
    setTimeout(() => {
      if (option.type === 'vet') {
        navigate(`/vet-listing?searchName=vetoSpecialityId&searchValue=${option.realId}`);
      } else if (option.type === 'type') {
        navigate(`/vet-listing?searchName=etablissementTypeId&searchValue=${option.realId}`);
      }
    }, 100);
  };

  const loadLocation = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        // if (q.length < MIN_CHARS) return setLocationOptions([]);
        try {
          const dataMix = await getPlaceAutocomplete(q, 8);
          const uniqueMap = new Map(dataMix.map(item => [item.value, item]));
          const data = Array.from(uniqueMap.values());
   
          setLocationOptions(
            data.map((x) => ({
              value: x.value,
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className="fa fa-map-marker" style={{ marginRight: 10 }}></i>
                  {x.value}
                </div>
              ),
            }))
          );
        } catch (error) {
          setLocationOptions([]);
        }
      }, 300),
    [getPlaceAutocomplete]
  );

  // Updated Select handler for Location
  const onSelectLocation = (value, option) => {
    setLocation(option.value);

    setTimeout(() => {
      navigate(`/vet-listing?searchName=location&searchValue=${option.value}`);
    }, 100);
  };

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
            <i className="fa fa-search search_icon" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={veto}
              options={vetoOptions}
              onSearch={(t) => { setVeto(t); loadVeto(t); }}
              onSelect={onSelectVeto}
              /* TRIGGERS DROPDOWN ON CLICK */
              onFocus={() => loadVeto(veto)} 
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_6MUu5pTZNM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* 2. Vet Specialty / Clinic Type */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-signs" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={vetoType}
              options={vetoTypeOptions}
              onSearch={(t) => { setVetoType(t); loadVetoType(t); }}
              onSelect={onSelectVetoType}
              /* TRIGGERS DROPDOWN ON CLICK */
              onFocus={() => loadVetoType(vetoType)}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_8MTgkmDbBM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* 3. Location */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-marker" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={locationInput}
              options={locationOptions}
              onSearch={(t) => { setLocation(t); loadLocation(t); }}
              onSelect={onSelectLocation}
              /* TRIGGERS DROPDOWN ON CLICK */
              onFocus={() => loadLocation(locationInput)}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_a5m4GtOdzA")}
                className="backgroundYellow borderNone width100per100"
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