import React, { useState, useEffect, useContext } from "react";
import { SearchOutlined, EnvironmentOutlined, FilterOutlined } from "@ant-design/icons";

import { SiteContext } from '../context/site';

export default function ResponsiveSearch() {
	
	const { 
		getAContent
	} = useContext( SiteContext );
	
  const [open, setOpen] = useState(false);

return (
  <div className="search-wrapper">
    <div className="responsive-search">
      {/* Mobile trigger */}
		<button
		  className="search-toggle"
		  onClick={() => setOpen(v => !v)}
		  aria-label="Open search"
		>
		  <span className="search-icon">🔍</span>
<span className="search-placeholder">{ getAContent( 'cmp_vetonest.com_Fv29Qp84Lm' ) }</span>
		</button>

      {/* Search panel (single instance) */}
      <div className={`search-panel ${open ? "open" : ""}`}>
        <div className="search-field backgroundYellow" >
			<i className="fa fa-search search_icon" style={{ fontSize: '1.8em', color: '#000' }}></i>
			<div className="spaceBeforeIcon"></div><input placeholder={ getAContent( 'cmp_vetonest.com_6MUu5pTZNM' ) } />
		  </div>
		  <div className="search-field backgroundYellow with-separator">
			<i className="fa fa-map-signs" style={{ fontSize: '1.8em', color: '#000' }}></i>
			<div className="spaceBeforeIcon"></div><input placeholder={ getAContent( 'cmp_vetonest.com_8MTgkmDbBM' ) } />
		  </div>

		  <div className="search-field backgroundYellow with-separator">
			<i className="fa fa-map-marker" style={{ fontSize: '1.8em', color: '#000' }}></i>
			<div className="spaceBeforeIcon"></div><input placeholder={ getAContent( 'cmp_vetonest.com_a5m4GtOdzA' ) } />
		</div>
          <button className="search-submit">
		  { getAContent( 'cmp_vetonest.com_Sr82Lm49Qx' ) } →
		  </button>
      </div>
    </div>
  </div>
);
}
