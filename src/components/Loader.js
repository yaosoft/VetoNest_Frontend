import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';


const Loader = ( params ) => {
// console.log( params );
	return (
		<>
						<div id="preloader">
					<div className="loader">
						<svg className="circular" viewBox="25 25 50 50">
							<circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="3" strokeMiterlimit="10" />
						</svg>
					</div>
				</div>
		</>
	);
};

export default Loader;
