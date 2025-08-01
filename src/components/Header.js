import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import SearchBox from './SearchBox';

import SecuredPagesAuth from "./SecuredPagesAuth";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import LanguageSelector from './LanguageSelector';
const Header = () => {

	const { 
		isAuthenticated, 
		logOut, 
		getUser, 
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

	var user = getUser();

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
			// const resp = await logOut();
			// if( resp !== true  ){
				// message.error( resp );
				// return;
			// }
			setUser( null );
			
		}

		navigate( '/connexion' )
	}

	// get the profile data
	useEffect( () => {
// const test = document.getElementById( 'cmp_vetonest.com_bL1MO9LnVv' ).innerText;
// alert( test );
		if( user === null )
			return

		const path = window.location.pathname.replace( '/', '' );
		const newActiveArr = active.map( e =>  e.path != path ? ({ path : e.path, actif : '' }) : ({ path : e.path, actif : 'active' } ) ); // 
		setActive( newActiveArr );	
		
		// Get user preference
		const a = async () => {
			const data = {
				userId: user.userId,
			}
			const resp = await getLanguagePreference ( data );
			if( resp === null )
				return

			setSelectedLanguageId( resp.id );	// update languagelist boxes
			languageSetup( resp.id ); 			// Update language flag
			user.languageId = resp.id; 			// update user
			setUser( user );
		}		
		a()

	}, [] );
	
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
													style={{height:'80px'}} 
													alt="#"
												/>
											</Link>
										</div>
										<div className="logo col-md-10" style={{paddingTop: '10px'}}>
											<img 
													src="/img/logo02.png"
													style={{height:'43px'}} 
													alt="#"
											/>
											<br/>
											<span className='headerSlogan' id="cmp_vetonest.com_zDVB9q7a2d">Consultation Vétérinaire </span>&nbsp;
											<span className='headerSlogan' id="cmp_vetonest.com_hRtNBb3lSe">en Ligne et à Domicile</span>
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
									 <li className={ "nav-item " + active[4].actif }>
										<Link style={{ cursor: 'pointer' }} className="nav-link" onClick= { e => handleClickGoto( 'blog' )} >
											Blog
										</Link>
									</li>
									 <li className={ "nav-item " + active[2].actif }>
										<Link style={{ cursor: 'pointer' }} className="nav-link" onClick= { e => handleClickGoto( 'profile' ) }>
											<ul>{ isAuthenticated() ? 
													<li>Profile de { truncateString( user.userNom, 10 ) }</li>
												: 
													<li id="cmp_vetonest.com_bL1MO9LnVv">S'inscrire</li>
											}</ul>
										</Link>
									  </li>
									 <li className={ "nav-item " + active[2].actif }>
										<Link style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickLogInOut( e ) }>
											<ul>{ isAuthenticated() ? 
													<li id="cmp_vetonest.com_mzCrCgj9rj">Déconnexion</li>
												: 
													<li id="cmp_vetonest.com_adWeBARABI">Connexion</li>
											}</ul>
										</Link>
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
		</>
	);
};

export default Header;
