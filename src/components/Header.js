import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import SearchBox from './SearchBox';

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
		getSiteContent,
		setSiteContent,
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
		getVetoInvitationNotification,
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

	// var user = getUser();

	const [ languages, setLanguages ]  = useState( '' );

	const [ active, setActive ] = useState( array );
	
	const handleClickGoto = ( goTo ) => {
		const path = '/' + goTo;
		navigate( path );
	}

	// Login / logout
	const handleClickLogInOut = async( event ) => {
		event.preventDefault();		
		if( isAuthenticated() ){
			const resp = await logOut();
			if( resp === true )
				await navigate( '/connexion' )
			else
				message.error( 'Error' )
		}
	}

	// get the profile data
	useEffect( () => {

		// Get user preference
		const a = async () => {
			// default site language
			var languageId = defaultLanguageId;
			
			// user is not loged in
			if( user === null ){
				if( selectedLanguageId == defaultLanguageId )
					languageId = defaultLanguageId
				else
					languageId = selectedLanguageId

				setSelectedLanguageId( languageId );			// update languagelist boxes
				await languageSetup( languageId ); 
			}
			else{
				// user's favourite language
				const data = {
					userId: user.userId,
				}	
				const resp = await getLanguagePreference ( data );
				if( resp !== null )
					await languageSetup( resp.id ) 
				else
					await languageSetup( selectedLanguageId ) 
				
			}			
		}	
		a()

	}, [] ); // [user, userProfile, siteLanguage]
	
	return (
		<>
		<SecuredPagesAuth />
			<header className="stick" style={{marginTop:0}}>
				<div className="header">
					<div className="container">
					<div className="row">
						<div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col logo_section">
							<div className="full">
								<div className="center-desk"
									style ={{
										paddingLeft: '5%',
									}}
								>
									<div className="row">
										<div className="logo col-md-2">
											<Link to="/accueil">
												<img 
													src="/img/logo01.png"
													style={{height:'75px, width:94px'}} 
													alt="#"
												/>
											</Link>
										</div>
										<div className="logo col-md-10" style={{paddingTop: '10px'}}>
											<Link to="/accueil">
												<img 
													src="/img/logo02.png"
													style={{height:'35px'}} 
													alt="#"
												/>
											</Link>
											<br/>
											<span className='headerSlogan' id="cmp_vetonest.com_zDVB9q7a2d">Consultation Vétérinaire </span>&nbsp;
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-6 col-lg-6 col-md-6 col-sm-6">
							<nav 
								style={{ marginRight: '10px' }}
								className="navigation navbar navbar-expand-md navbar-dark ">
								<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
								<span className="navbar-toggler-icon"></span>
								</button>
								<div className="collapse navbar-collapse" id="navbarsExample04">
									<ul className="navbar-nav mr-auto">
									 <li style={{marginTop: '10px', width: '50px'}}>
										<Notifications />
									 </li>
									 <li className={ "nav-item " + active[4].actif }>
										<Link style={{ cursor: 'pointer' }} className="nav-link" onClick= { e => handleClickGoto( 'blog' )} >
											Blog
										</Link>
									</li>
									 <li className={ "nav-item " + active[2].actif }>
											<ul>{ isAuthenticated() ? 
												<>	
													<Link style={{ cursor: 'pointer' }} className="nav-link" onClick= { e => handleClickGoto( 'profile' ) }>
														<li>{ user && truncateString( user.userNom, 10 ) }</li>
													</Link>
												</>
												: 
													<Link style={{ cursor: 'pointer' }} className="nav-link" onClick= { e => handleClickGoto( 'connexion' ) }> 
														<li id="cmp_vetonest.com_adWeBARABI">Connexion</li>
													</Link>
											}
											</ul>
									  </li>
									 <li className={ "nav-item " + active[2].actif }>
										<ul>
											{ isAuthenticated() ? 
												<Link style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickLogInOut( e ) }>
													<li id="cmp_vetonest.com_mzCrCgj9rj">Déconnexion</li>
												</Link>
											:
												<Link style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickGoto( 'inscription' ) }>
													<li id="cmp_vetonest.com_MsXXu6zXy2">Inscription</li>
												</Link>
											}
											</ul>
									  </li>
									<li className={ "nav-item " + active[4].actif } className="paddingTop4px"  >
										<span className="colorBlack" id="cmp_vetonest.com_QrnuvOuzwI">Choix de la langue</span><br/>
										<LanguageSelector 
											toPersist 	= { false } 
											flag 		= { true }
											context		= { true }
										/>
									</li>
								</ul>
								</div>
							</nav>
						</div>
					</div>
					<div className= "marginTop10">
					<SearchBox/>
					</div>
					</div>
				</div>
			</header>
			<div className="displayNone" >
				/* LANGUAGES TAG */
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
