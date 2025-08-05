import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';



const Sidebar = ( params ) => {
// console.log( params );
	return (
		<>
		<div className="nav-header" style={{ backgroundColor: '#4d7cff', height: '100%' }} >
					<div className="brand-logo">
						<Link to="/home">
							<b className="logo-abbr"><img src="./img/logo.png" alt="" /> </b>
							<span className="logo-compact"><img src="./img/logo10.png" alt="" /></span>
							<span className="brand-title">
								<img src="./img/logo10.png" alt="" />
							</span>
						</Link>
					</div>
				</div>
				<div className="nk-sidebar">           
					<div className="nk-nav-scroll">
						<ul className="metismenu" id="menu">
							<li>
								<ul aria-expanded="false">
									<li>&nbsp;</li>
								</ul>
							</li>
							
							<li>
								<a className="has-arrow" aria-expanded="false">
									<i className="fa fa-question-circle"></i><span className="nav-text">Ask for help</span>
								</a>
								<ul aria-expanded="false">
									<li><Link >FAQ</Link></li>
									<li><Link >Add a domain name</Link></li>
									<li><Link >Contact-us</Link></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
		</>
	);
};

export default Sidebar;
