import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { message } from 'antd';

const SecuredPagesAuth = () => {
	const navigate 				= useNavigate();
	const { isAuthenticated, getUser }	= useContext( AuthContext );
	const { setReferrer } 		= useContext( SiteContext );
	
	// Admin's user list
	const adminList = [ 
		'jane@diamta.com',
		'info@237usa.com'
	];
	
	// secured pages list
	const securedPagesPath 	= [
		
	]
	
	// pages to not referrer
	const notToReferPages = [
		'/registration',
		'/login',
	]
	
	// register current page
	const location 		= useLocation();
	const currentPage 	= location.pathname;
	if( !notToReferPages.includes( currentPage ) )
		setReferrer( currentPage );
	
	// authentication
	const [authenticate, setAuthenticate ] = useState( isAuthenticated() );
// console.log( getUser() );
	useEffect(() => {

		const security = async () => {
			if( securedPagesPath.includes( currentPage ) && !authenticate ){
				if( currentPage != '/login'  )
					await navigate( '/login' )
			}
			else if( currentPage.includes( 'dashboard/' ) && !adminList.includes( getUser().email ) ) {

				message.error( 'Espace reservé aux Admin.' );
				// await navigate( '/login' );
			}
		}

		security();
	
	}, [authenticate]);
	
	return (
		<></>
	);
};

export default SecuredPagesAuth;
