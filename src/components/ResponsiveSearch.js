import React, { useState, useMemo, useContext } from "react";
import { AutoComplete, message } from "antd";
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

  // values
  const [veto, setVeto] = useState("");
  const [vetoType, setVetoType] = useState("");
  const [location, setLocation] = useState("");

  // options for autocomplete
  const [vetoOptions, setVetoOptions] = useState([]);
  const [vetoTypeOptions, setVetoTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const loadVeto = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        if (q.length < MIN_CHARS) return setVetoOptions([]);
        try {
          const limit = 8;
          const data = await getVetAutocomplete(q, limit);
          setVetoOptions(
            data.map((x) => ({
              value: x.value,
              label: x.type ? `${x.value} (${x.type})` : x.value,
              icon: "fa fa-user-md", // Doctor icon for vets
            }))
          );
        } catch {
          setVetoOptions([]);
        }
      }, 300),
    []
  );

  const loadVetoType = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        const limit = 8;
        if (q.length < MIN_CHARS) return setVetoTypeOptions([]);

        try {
          const data = await getTypeSpecialityAutocomplete(q, limit);
          const result = await Promise.all(
            data.map(async (x) => ({
              value: x.value,
              label: await getAContent(x.value), // Await getAContent if it's async
              icon: "fa fa-home", // House icon for establishments
            }))
          );

          setVetoTypeOptions(result);
        } catch {
          setVetoTypeOptions([]);
        }
      }, 300),
    [getAContent]
  );

  const loadLocation = useMemo(
    () =>
      debounce(async (text) => {
        const q = text.trim();
        if (q.length < MIN_CHARS) return setLocationOptions([]);

        try {
          const data = await getPlaceAutocomplete(q, 8); // Assuming this returns the places data
          setLocationOptions(data.map((x) => ({
            value: x.value,
            label: x.value,
            icon: "fa fa-map-marker", // Marker icon for location
          })));
        } catch (error) {
          setLocationOptions([]);
        }
      }, 300),
    [getPlaceAutocomplete]
  );

  const onSubmit = () => {
    if (!veto && !vetoType && !location) {
      message.warning(getAContent("cmp_vetonest.com_Fv29Qp84Lm") || "Veuillez saisir un critère.");
      return;
    }

    const params = new URLSearchParams();
    if (veto) params.set("q", veto);
    if (vetoType) params.set("specialty", vetoType);
    if (location) params.set("place", location);

    setOpen(false);
    navigate(`/veterinaires?${params.toString()}`);
  };

  return (
    <div className="search-wrapper">
      <div className="responsive-search">
        {/* Mobile trigger */}
        <button
          className="search-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open search"
          type="button"
        >
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">
            {getAContent("cmp_vetonest.com_Fv29Qp84Lm")}
          </span>
        </button>

        {/* Search panel */}
        <div className={`search-panel ${open ? "open" : ""}`}>
          {/* Vet / établissement */}
          <div className="search-field backgroundYellow">
            <i className="fa fa-search search_icon" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>

            <AutoComplete
              className="width100per100"
              value={veto}
              options={vetoOptions}
              onSearch={(t) => {
                setVeto(t);
                loadVeto(t);
              }}
              onSelect={(v) => setVeto(v)}
              renderOption={(item) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className={item.icon} style={{ marginRight: 10 }}></i>
                  {item.label}
                </div>
              )}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_6MUu5pTZNM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* Spécialité / Type */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-signs" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>

            <AutoComplete
              className="width100per100"
              value={vetoType}
              options={vetoTypeOptions}
              onSearch={(t) => {
                setVetoType(t);
                loadVetoType(t);
              }}
              onSelect={(v) => setVetoType(v)}
              renderOption={(item) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className={item.icon} style={{ marginRight: 10 }}></i>
                  {item.label}
                </div>
              )}
            >
              <input
                placeholder={getAContent("cmp_vetonest.com_8MTgkmDbBM")}
                className="backgroundYellow borderNone width100per100"
              />
            </AutoComplete>
          </div>

          {/* Location (with backend data) */}
          <div className="search-field backgroundYellow with-separator">
            <i className="fa fa-map-marker" style={{ fontSize: "1.8em", color: "#000" }} />
            <div className="spaceBeforeIcon"></div>
            <AutoComplete
              className="width100per100"
              value={location}
              options={locationOptions}
              onSearch={(t) => {
                setLocation(t);
                loadLocation(t);
              }}
              onSelect={(v) => setLocation(v)}
              renderOption={(item) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i className={item.icon} style={{ marginRight: 10 }}></i>
                  {item.label}
                </div>
              )}
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
