import PropTypes from 'prop-types'
import { createContext, useState, useEffect, useContext } from 'react'
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Image, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';



export const SiteContext = createContext();
export const SiteProvider = ({ children }) => {

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
	const base_api_url		= 'http://localhost/vetonest_backend/public/index.php/api/'; // dev
	// const base_api_url	= 'https://backend.vetonest.com/api/'// prod 

	const [ siteDomainName, setSiteDomainName ] = useState( 'vetonest.com' );
	const [ siteName, setSiteName ] = useState( 'VetoNest' );
	const [ siteUrl, setSiteUrl ] 	= useState( 'http://vetonrst.com' );
	const [ siteEmail, setEmail ] 	= useState( 'info@vetonest.com' );

	// check if email is not already registered
	const checkEmail = async ( email ) => {
		const url	= base_api_url + 'user/email/check';
		
		const data 		= email;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep	 	= await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// send an email 
	const sendEmail = async ( sendEmailData ) => {
		const url	= base_api_url + 'user/send';

		const data 		= sendEmailData;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		
		return rep;
	}

	// signup
	const signUp = async ( signupData ) => {
		const url	= base_api_url + 'user/create';

		const data 		= signupData;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Generate random digits
	const generateRandomDigits = (n) => {
		// const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const characters = '123456789';
		let result = '';
		for (let i = 0; i < n; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters.charAt(randomIndex);
		}
		return result;
	}

	return (	
	
		<SiteContext.Provider 
			value={{
				siteName,
				siteEmail,
				siteDomainName,
				signUp,
				checkEmail,
				sendEmail,
				generateRandomDigits
			}}
		>
		
			<Space
				style={{ display: spiner }}
			>
				<Spin
					indicator={
						<LoadingOutlined
							style={{
									display:		spiner,
									fontSize: 		30,
									color: 			'#fcb800'
								}}
							spin
						/>
					}
					fullscreen
					tip		= "working ..." 
					size	= "large"
				/>
			
			</Space>

		{children}

		</SiteContext.Provider>

	);
	
	
	
};

SiteProvider.propTypes = {
	children: PropTypes.node.isRequired,
};