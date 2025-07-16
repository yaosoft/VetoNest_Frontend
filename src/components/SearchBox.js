import React, { useState, useEffect, useContext } from "react";

const handleChangeSearch = ( e ) => {
	const data = e.target.value;
	console.log( data )
}

const SearchBox = () => {
	return (
		<>
			<div className="search_box" >
			   <div className="search" style={{ backgroundColor: '#FFDE59' }}>
				 <div className= "select_area" style={{ width:"26%" }}>
				   <i className="fa fa-map-marker-alt map_icon"></i>
				   <i className="fa fa-search search_icon" style={{ fontSize: '2em', color: '#000' }}></i>
				   <div className="text">Nom, établissement</div>
				 </div>
				 <div className="line"></div>
				 <div className= "select_area" style={{ width:"26%" }}>
				   <i className="fa fa-map-marker-alt map_icon"></i>
				   &nbsp;&nbsp;<i className="fa fa-book" style={{ fontSize: '2em', color: '#000' }}></i>
				   <div className="text">Spécialité, Type d'établissement</div>
				 </div>
				 <div className="line"></div>
				 <div className= "select_area" style={{ width:"26%" }}>
				   <i className="fa fa-map-marker-alt map_icon"></i>
				   &nbsp;&nbsp;<i className="fa fa-map search_icon" style={{ fontSize: '2em', color: '#000' }}></i>
				   <div className="text">Lieu</div>
				 </div>
				 <div className="line"></div>
				 <div className = "text_and-icon" style={{ width:"8%" }}>
					&nbsp;&nbsp;
				   <button
						style={{
							width:"60px", backgroundColor: '#FFDE59'
						}}
				   >
						&nbsp;&nbsp;Recherche
				   </button>
				 </div>
				</div> 
			</div> 
		</>
	);
};
export default SearchBox;