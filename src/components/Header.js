import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import SearchBox from './SearchBox';

import SecuredPagesAuth from "./SecuredPagesAuth";
import { AuthContext } from "../context/AuthProvider";

// import { LanguagesContext } from "../../context/languages";

const Header = () => {


	// const { isAuthenticated, logOut, getUser, setUser } = useContext( AuthContext );
	const navigate = useNavigate();

	// const checkAuth = async () => {
		// if( !isAuthenticated() ){
			// navigate( '/login' );
			// return false
		// }
	// }
	// checkAuth();

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
			path: 'expertise',
 			actif: '',  
		},
		{
			path: 'contact',
 			actif: '' 
		},
	]

	const [ languages, setLanguages ]  = useState( '' );

	const [ active, setActive ] = useState( array );
	
	const handleClickGoto = ( goTo ) => {
		const path = '/' + goTo;
		navigate( path );
	}

	// get the profile data
	useEffect( () => {

		const path = window.location.pathname.replace( '/', '' );
		const newActiveArr = active.map( e =>  e.path != path ? ({ path : e.path, actif : '' }) : ({ path : e.path, actif : 'active' } ) ); // 
		setActive( newActiveArr );	

		// get project data
		// var languages = '';
		// const getLanguages = async () => {
			// languages = await getLanguages( );
			// setLanguages ( languages );
// console.log( 'languages', languages );
		// }
		// getLanguages();

	}, [] );
	
	return (
		<>
			<header className="stick" style={{marginTop:0}}>
				<div className="header">
					<div className="container">
					<div className="row">
						<div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col logo_section">
							<div className="full">
								<div className="center-desk">
									<div className="logo">
										<Link to="/accueil">
											<img 
												id='img_'
												src='./img/logo.png' style={{height:'100px'}} alt="#" />
										</Link>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-9 col-lg-9 col-md-9 col-sm-9">
							<nav className="navigation navbar navbar-expand-md navbar-dark ">
								<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
								<span className="navbar-toggler-icon"></span>
								</button>
								<div className="collapse navbar-collapse" id="navbarsExample04">
									<ul className="navbar-nav mr-auto">
									  <li className={ "nav-item " + active[3].actif }>
										 <a style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickGoto( 'expertise' ) }>	blog
										 </a>
									  </li>
									  <li className={ "nav-item " + active[4].actif }>
										 <a style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickGoto( 'contact' ) }>
											Se connecter
										 </a>
									  </li>
									 <li className={ "nav-item " + active[1].actif }>
										<a style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickGoto( 'inscription' ) }>
											S'inscrire
										</a>
									  </li>
									  <li className={ "nav-item " + active[1].actif }>
										<a style={{ cursor: 'pointer' }} className="nav-link" onClick={ e => handleClickGoto( 'inscription' ) }>
											S'inscrire
										</a>
									  </li>
									</ul>
								</div>
							</nav>
						</div>
					</div>
					<div>
					<SearchBox/>
					</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default Header;
