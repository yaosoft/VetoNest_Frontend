import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import ResponsiveSearch from './ResponsiveSearch';

import SecuredPagesAuth from "./SecuredPagesAuth";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

import LanguageSelector from './LanguageSelector';

import Notifications from "./Notifications.js";

const Header = () => {

	const {
		getUser,
		profileTypeId,
		profileId,
		isAuthenticated, 
		logOut, 
		user, 
		setUser 
	} = useContext( AuthContext );

	const {
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		getLanguagePreference,
		defaultLanguageId,
		defaultLanguage,
		languageSetup,
		languageFlag,
		setSelectedLanguageId,
		selectedLanguageId,
		truncateString,
		siteLanguage,
		flag,
		userProfile,
		profileFormUpdated,
		getAContent,
		signOut
	} = useContext( SiteContext );

	const navigate = useNavigate();

	const array = [
		{
			path: 'home',
 			actif: '',
		},
		{
			path: 'about',
 			actif: '',
		},
		{
			path: 'import-export',
 			actif: '',
		},
		{
			path: 'blog',
 			actif: '',
		},
		{
			path: 'contact',
 			actif: ''
		},
	]

	const [menuOpen, setMenuOpen] = useState(false);
	const [ languages, setLanguages ]  = useState( '' );
	const [ active, setActive ] = useState( array );
	const [ currentUser, setCurrentUser ] = useState( user );

	// Ref for the menu container
	const menuRef = useRef(null);

	// Click-outside detection
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpen(false);
			}
		};

		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuOpen]);

	const handleClickGoto = ( goTo ) => {
		setMenuOpen(false);
		const path = '/' + goTo;
		navigate( path );
	}

	// logout
	const handleClickLogOut = async( event ) => {
		const resp = await signOut();
		if( resp !== true ){
			console.log( 'Sign out: network error' )
		}
		await logOut( user );
		await navigate( '/connexion' );
	}

	useEffect( () => {
		const a = async () => {
			const user = await getUser();
			setCurrentUser( user );

			var languageId = defaultLanguageId;

			if( user === null ){
				if( selectedLanguageId == defaultLanguageId )
					languageId = defaultLanguageId
				else
					languageId = selectedLanguageId

				setSelectedLanguageId( languageId );
				await languageSetup( languageId );
			}
			else{
				const data = {
					userId: user.userId,
				}
				const resp = await getLanguagePreference ( data );
				if( resp !== null ) {
					setSelectedLanguageId( resp.id );
					await languageSetup( resp.id );
				} else {
					await languageSetup( selectedLanguageId );
				}
			}
		}
		a()
	}, [profileFormUpdated] );

	return (
		<>
		<SecuredPagesAuth />
			<header className="stick">
				<div className="header">
					<div className="container">
					<div className="header-row">
						<div className="header-left logo_section">
							<div className="full">
								<div className="center-desk"
									style ={{
										paddingLeft: '5%',
									}}
								>
									<div className="logo-slogan">
									  <Link to="/accueil" className="logo-wrap">
										<img src="/img/logo01.png" alt="Logo" />
									  </Link>

									  <div className="slogan-wrap slogan">
										<Link to="/accueil">
										  <img src="/img/logo02.png" alt="VetoNest" />
										</Link>
										<span className="headerSlogan">
											{ getAContent( 'cmp_vetonest.com_Xp6Qv2mLsR' ) }
										</span>
									  </div>
									</div>
								</div>
							</div>
						</div>
						<div className="header-right">
							  <nav className="navbar navbar-expand-lg navbar-dark navigation" ref={menuRef}>
								{/* RIGHT ACTIONS (mobile + desktop) */}
								<div className="nav-actions">
								  <Notifications /><div className="spaceAfterNotificationBell"></div>

								  <LanguageSelector
									toPersist={false}
									flag={true}
									context={true}
								  />

								  <button
									className="burger-btn"
									onClick={() => setMenuOpen(v => !v)}
									aria-label="Toggle menu"
								  >
									<span />
									<span />
									<span />
								  </button>
								</div>

								{/* COLLAPSIBLE MENU */}
								<div className={`navbar-collapse ${menuOpen ? "open" : ""}`}>
								  <ul className="navbar-nav">
									<li className="nav-item">
									  <Link className="nav-link" onClick={() => handleClickGoto("my-pets")}>
										  { getAContent( 'cmp_vetonest.com_MyPets_Txt' ) }
									  </Link>
									</li>

									<li className="nav-item">
									  <Link className="nav-link" onClick={() => handleClickGoto(Number(profileTypeId) === 1 ? "consultation/list" : "consultation/vet/list")}>
										  { getAContent( 'cmp_vetonest.com_Consultations_Plural_Txt' ) }
									  </Link>
									</li>

									<li className="nav-item">
									  {isAuthenticated() ? (
										<Link className="nav-link" onClick={() => handleClickGoto("profile")}>
										  {currentUser && truncateString(currentUser.userPrenom, 10)}
										</Link>
									  ) : (
										<Link className="nav-link" onClick={() => handleClickGoto("connexion")}>
										  {getAContent( 'cmp_vetonest.com_OK6429mzTG' )}
										</Link>
									  )}
									</li>

									<li className="nav-item">
									  {isAuthenticated() ? (
										<Link className="nav-link" onClick={handleClickLogOut}>
											{ getAContent( 'cmp_vetonest.com_mzCrCgj9rj' ) }
										</Link>
									  ) : (
										<Link className="nav-link" onClick={() => handleClickGoto("inscription")}>
											{ getAContent( 'cmp_vetonest.com_Registration_Txt' ) }
										</Link>
									  )}
									</li>
								  </ul>
								</div>

							  </nav>
							</div>

						</div>
					<div className= "marginTop10">
					<ResponsiveSearch/>
					</div>
					</div>
				</div>
			</header>
			<div className="displayNone" >
			{/* LANGUAGES TAG */}
				<span
					id="cmp_vetonest.com_JLQuQUHS9n"
					className ="language_french"
				>
					Français
				</span>
				<span
					id="cmp_vetonest.com_wyemTkNBRm"
					className ="language_english"
				>
					Anglais
				</span>
				<span
					id="cmp_vetonest.com_EJtVTUW6Bh"
					className ="language_spanish"
				>
					Espagnol
				</span>
				<span
					id="cmp_vetonest.com_pxa8xJMVaM"
					className ="language_german"
				>
					Allemand
				</span>
				<span
					id="cmp_vetonest.com_9tmtPx9JYg"
					className ="language_italian"
				>
					Italien
				</span>
				<span
					id="cmp_vetonest.com_0pM9CADe5s"
					className ="language_estonian"
				>
					Estonien
				</span>

				/* COUNTRIES TAG */
				<span
					id="cmp_vetonest.com_hKFx1Nxwy1"
					className ="country_france"
				>
					France
				</span>
				<span
					id="cmp_vetonest.com_zaQ8Sa8QFr"
					className ="country_italy"
				>
					Italy
				</span>
				<span
					id="cmp_vetonest.com_bfomRndj4C"
					className ="country_suiss"
				>
					Suisse
				</span>
				<span
					id="cmp_vetonest.com_vhn75Axj1a"
					className ="country_belgium"
				>
					Belgique
				</span>
				<span
					id="cmp_vetonest.com_c3XMo9aZSc"
					className ="country_spain"
				>
					Espagne
				</span>
				<span
					id="cmp_vetonest.com_bkNRecc1Tq"
					className ="country_germain"
				>
					Allemagne
				</span>
			</div>

		</>
	);
};

export default Header;