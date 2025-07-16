import PropTypes from 'prop-types'
import { createContext, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation  } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	
	// REST helper
	async function postData( url, data, method ) {
		const response = await fetch( url, {
			method: method, // *GET, POST, PUT, DELETE, etc.
			// mode: "no-cors", // no-cors, *cors, same-origin
			headers: {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify( data ), // body data type must match "Content-Type" header
		});
		// if( response.status !== 200 ){
			// return false;
		// }
		// else{
			// return response.json(); // parses JSON response into native JavaScript objects
		// }
		return response;
	}
	
	
	// user
	const [ user, setUser ] = useState( localStorage.getItem( 'user' ) ? JSON.parse( localStorage.getItem( 'user' ) ) : {} );
	
	// login
	const logIn = ( user ) => {

		setUser( user )
	}

	// get the user
	// const navigate = useNavigate();
	const getUser = () => {
		if( user == null )
			window.document.location.replace( '/login' );
		else
			return user
	}
	
	// delete the user
	const logOut = async() => {
		// logout on the backend
		// const logoutApiURL 	= 'http://localhost/diamta/projects/public/index.php/api/user/logout';
		// const method = 'POST';
		// const userId = getUser().id
		// const logoutData = {
			// userId: userId
		// };

		// const respJson = await postData( logoutApiURL, logoutData, method );

		// if( respJson.status !== 200 ){
			// alert( respJson.statusText );
			// // message.error( respJson.statusText );
			// return false;
		// }
		
		// logout on the frontend

		return true;
	}
	
	// is authentificated
	const isAuthenticated = () => {
		return getUser() != null && getUser().userId != null ? true : false
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
	
	useEffect (() => {
		setUser( null );
		const data = localStorage.getItem( 'user' );
		if (data) {
			setUser( JSON.parse(data) );
		}
	}, []); // 

	useEffect (() => {	
		localStorage.setItem( 'user', JSON.stringify( user ) );
	}, [user]); // 
	
	return (
		<AuthContext.Provider 
			value={{ 
				logIn, 
				getUser,
				setUser,
				logOut,
				isAuthenticated,
				isValidPassword
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};