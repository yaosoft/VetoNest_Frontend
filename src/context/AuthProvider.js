import PropTypes from 'prop-types'
import { createContext, useState, useEffect } from 'react'
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Image, Upload } from 'antd';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	
	// spiner
	const [ spiner, setSpiner ] = useState( 'none' );
	
	// helper: Fetch data definition
	async function fetchData( url, data, method ) {
		// if( !isOnline ){
// message.error( 'No network!' );
		//	return false;
		// }

		const response = await fetch( url, {
			method: method, // *GET, POST, PUT, DELETE, etc.
			// mode: "no-cors", // no-cors, *cors, same-origin
			headers: {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			...( method == 'POST' && { body: JSON.stringify( data ), } )
		});
// console.log( '+++++++++++++++++ response', response );
		// setTimeout( setSpiner, 2000, 'none' );
		if( response.status != 200 ){
			return false;
		}
		
		if( response.status == 200 ){
			return response.json(); // parses JSON response into native JavaScript objects
		}

	}

	// Backend url 
	const base_api_url		= 'http://localhost/VetoNest/public/index.php/api/'; // dev
	// const base_api_url	= 'https://backend.vetonest.com/api/' // prod 

	// user
	const [ user, setUser ] = useState( JSON.parse( localStorage.getItem( 'user' ) ) );

	// login
	const logIn = ( user ) => {
		// set user
		setUser( user );
		// profile type ID
		setProfileTypeId( user.profileTypeId );
		// profile  ID
		setProfileId( user.profileId );
		// get user  ID
		setUserId( user.userId );
		// set user in localStorage
		localStorage.setItem( 'user', JSON.stringify( user ) );
	}

	// logOut
	const logOut = async ( user ) => {
		// set user
		setUser( null );
		// profile type ID
		setProfileTypeId( null );
		// profile  ID
		setProfileId( null );
		// get user  ID
		setUserId( null );
		// remove user in localStorage
		localStorage.removeItem( 'user' );
		
		return true;
		
	}


	// get the user
	const getUser = () => {
		// if( user == null )
		//  	window.document.location.replace( '/connexion' );
		// else
		return user
	}
	
	
	// is authentificated
	const isAuthenticated = () => {
		
		// const rep = getUser() != null && getUser().userId != null ? true : false
		const data = localStorage.getItem( 'user' );
		if (data)
			return true
		else
			return false
		
	}
	
	// check password validation
	const isValidPassword = ( password ) => {
		const rg01 = /\d+/;
		const rg02 = /[a-z]+/;
		const rg03 = /[A-Z]+/;
		
		if( !rg01.test( password ) )
			return 1
		if( !rg02.test( password ) )
			return 2	
		if( !rg03.test( password ) )
			return 3
		if( password.length < 7 || password.length > 100 )
			return 4
		
		return true;
	}

	// password replace
	const passwordReplace = async ( pwReplaceData ) => {
		const url		= base_api_url + 'user/login';
		const data 		= pwReplaceData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// profile type ID
	const [ profileTypeId, setProfileTypeId ] = useState( user ? user.profileTypeId : '' );
	
	// profile  ID
	const [ profileId, setProfileId ] = useState( user ? user.profileId : '' );

	// get user  ID
	const [ userId, setUserId ] = useState( user ? user.userId : '' );

	
	return (
		<AuthContext.Provider 
			value={{ 
				logIn,
				logOut,
				getUser,
				user,
				setUser,
				isAuthenticated,
				isValidPassword,
				passwordReplace,
				profileTypeId,
				profileId,
				userId
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};