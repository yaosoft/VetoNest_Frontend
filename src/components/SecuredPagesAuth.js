import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { message } from 'antd';

const SecuredPagesAuth = () => {
	const navigate 				= useNavigate();
	const { isAuthenticated, getUser }	= useContext( AuthContext );
	const { setReferrer } = useContext( SiteContext );
	
	// Admin's user list
	const adminList = [ 
		'jane@diamta.com',
	];
	
	// secured pages list
	const securedPagesPath 	= [
		'/profile'
	]
	
	// pages to not referrer
	const notToReferPages = [
		'/inscription',
		'/connexion',
		'/mot-de-passe-oublie',
		'/mot-de-passe-oublie/reset',
	]
	
	// register current page
	const location 		= useLocation();
	const currentPage 	= location.pathname;
	
	const hasNotAllowed = notToReferPages.filter( e => currentPage.includes( e ) )
	if( hasNotAllowed.length == 0 )
		setReferrer( currentPage )
	
	// authentication
	const [authenticate, setAuthenticate ] = useState( isAuthenticated() );

	useEffect(() => {
// console.log( 'isAuthenticated', isAuthenticated() );
			const security = async () => {
				if( securedPagesPath.includes( currentPage ) && isAuthenticated() === false ){
					await navigate( '/connexion' )
				}
				else if( currentPage.includes( 'dashboard/' ) && !adminList.includes( getUser().email ) ) {

					message.error( 'Espace reservé aux Admin.' );
					// await navigate( '/connexion' );
				}
			}
			security();

	}, []);
	
	return (
		<></>
	);
};

export default SecuredPagesAuth;
