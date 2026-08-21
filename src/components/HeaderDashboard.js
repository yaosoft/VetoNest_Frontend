import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from 'react-router-dom';

import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { message } from 'antd';

import LanguageSelector from './LanguageSelector';
import Notifications from "./Notifications.js";

const HeaderDashboard = () => {

	const {
		profileTypeId,
		isAuthenticated, 
		logOut, 
		user, 
	} = useContext( AuthContext );

	const { 
		getUser,
		truncateString
	} = useContext( SiteContext );
	
	const navigate = useNavigate();

	const [menuOpen, setMenuOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState(user);
	
	const handleClickGoto = (goTo) => {
		setMenuOpen(false);
		const path = '/' + goTo;
		navigate(path);
	}

	// Login / logout - Admin version
	const handleClickLogInOut = async(event) => {
		event.preventDefault();		
		if(isAuthenticated()){
			// Clear admin session from localStorage
			localStorage.removeItem('admin_logged_in');
			localStorage.removeItem('admin_data');
			localStorage.removeItem('admin_remember');
			localStorage.removeItem('admin_username');
			
			const resp = await logOut();
			if(resp === true)
				await navigate('/admin/login')
			else
				message.error('Erreur lors de la déconnexion')
		} else {
			await navigate('/admin/login')
		}
	}

	return (
		<header className="stick">
			<div className="headerDashboard">
				<div className="container">
					<div className="header-row">
						{/* Logo Section */}
						<div className="header-left logo_section">
							<div className="full">
								<div className="center-desk">
									<div className="logo-slogan">
										<Link to="/admin/dashboard" className="logo-wrap">
											<img src="/img/logo01.png" alt="Logo" />
										</Link>
										<div className="slogan-wrap slogan">
											<Link to="/admin/dashboard">
												<img src="/img/logo02.png" alt="VetoNest" />
											</Link>
											<span className="headerSlogan">
												Consultation vétérinaire
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Section */}
						<div className="header-right">
							<nav className="navbar navbar-expand-lg navbar-dark navigation">
								{/* Collapsible Menu */}
								<div className={`navbar-collapse ${menuOpen ? "open" : ""}`}>
									<ul className="navbar-nav">
										{/* Dashboard Link */}
										<li className="nav-item">
											<Link 
												className="nav-link" 
												onClick={() => handleClickGoto("admin/dashboard")}
												to="/admin/dashboard"
											>
												Dashboard
											</Link>
										</li>

										{/* Veterinarians Management Link */}
										<li className="nav-item">
											<Link 
												className="nav-link" 
												onClick={() => handleClickGoto("admin/vets")}
												to="/admin/vets"
											>
												Vétérinaires
											</Link>
										</li>

										{/* Logout Link */}
										<li className="nav-item">
											<Link 
												className="nav-link" 
												onClick={handleClickLogInOut}
												to="#"
											>
												Déconnexion
											</Link>
										</li>
									</ul>
								</div>
							</nav>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default HeaderDashboard;