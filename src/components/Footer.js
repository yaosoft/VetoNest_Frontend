import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';

import { SiteContext } from '../context/site';
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined
} from '@ant-design/icons';
import { Form, Input, Select } from 'antd';


const Footer = () => {
	
	const { 
		siteDomainName,
		siteContent,
		siteLanguage,
		setSiteContent,
		getSiteContent,
		setSearchInputVeto,
		setSearchInputVetoType,
		setSearchInputLocation,
		setHomeTitle,
		setContactTitle,
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


	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	
	const [ loginSpin, setLoginSpin ] = useState( 'none' );
	
	// Email
	const [ email, setEmail ] = useState( '' );
	const [ emailDefault, setEmailDefault ] = useState( 'Email' );
	const [ emailError, setEmailError ] = useState( '' );
	const handleChangeEmail = ( e ) => {
		const data = e.target.value;
		setEmail( data );

		var emailErrorText = '';
		if( data && !isValidEmail( data ) )
			emailErrorText = 'Your email is not correct'
		
		setEmailError( emailErrorText );
	}

	// Email validation
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}

// check if there are form errors
	const checkTheForm = async( ) => {

		var errorsExist = false;

		// email
		if( !email ){
			const emailErrorText = 'The email field is empty';
			setEmailError( emailErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		
		return errorsExist
	}
	
	const { sendEmail }	= useContext( SiteContext );

	// Send contact form
	async function handleClicSend ( ){		
		// check the form
		const formError = await checkTheForm();	

		// if errors exist in the form
		if( formError === true ){
			const errorsExistText = 'Please correct the errors and try again.';
			message.error( errorsExistText );
			setLoginSpin( 'none' );
			return;
		}

		// check the recaptcha 
		// if( !recaptchaValue ){ // recaptcha
			// message.error( 'Please check the recaptcha verification' )
			// return;
		// }

		// send data
		setLoginSpin( 'block' ); // spin
		const html = 'Hello, <br><br>You have received a newsletter subscription request on cecilia-group.com,<br><br> Sender email: '  + email + '<br/><br/><br/><br/>Regards';
		const data = {
			html: 		html,
			subject: 	'New message on cecilia-group.com',
		}
// console.log( data )

		const rep = await sendEmail( data );
// console.log( rep );
		if( !rep ){
			message.error( 'An error occured' )
		}
		else{
			message.success( 'Thank you for subscribing to our newsletter!' )

			setIsButtonDisabled( true )
		}
		setLoginSpin( 'none' );
		
	}


	// Menu - active menu
	const [ active, setActive ] = useState( array );
	
	const handleClickGoto = ( goTo ) => {
		const path = '/' + goTo;
		navigate( path );
	}
	
	// site content & menu active button

	useEffect( () => {
		// menu active button
		const path = window.location.pathname.replace( '/', '' );
// console.log( 'path', path );
// console.log( 'active', active );
		const newActiveArr = active.map( e =>  e.path != path ? ({ path : e.path, actif : '' }) : ({ path : e.path, actif : 'active' } ) ); // 
// console.log( 'newActiveArr', newActiveArr );
		setActive( newActiveArr );	

		// update page tags content
		const updatePageContent = async () => {	// Update page content from the CMP
			// get site content
			const siteContentData = {
				siteLanguage: siteLanguage,
			}
			const siteContent = await getSiteContent( siteContentData );

console.log( '>> siteContent', siteContent );

			// setSiteContent( siteContent );
			for ( const content of siteContent ) {
				const tagRef  		= content.tagRef;
				const contentTypeId = content.contentTypeId;
				const contents 		= content.contents;

				if( !contents.length )
					continue;
				
				const element = document.getElementById( tagRef );
				if( element === null )
					continue  
				
				const currentLanguageTagContent = contents.filter( e => e.languageCode == siteLanguage );
				if( !currentLanguageTagContent.length )
					continue  
				
				const tagContent = contentTypeId == 1 ? currentLanguageTagContent[0].textContent : 
				currentLanguageTagContent[0].mediaContent;
				element.innerHTML = tagContent;

				// indirect translations
				const searchInputVetoElt  = document.getElementsByClassName( "searchInputVeto" )[0];
				const searchInputVeto = searchInputVetoElt.innerHTML;
				setSearchInputVeto( searchInputVeto  );
				
				const searchInputVetoTypeElt  = document.getElementsByClassName( "searchInputVetoType" )[0];
				const searchInputVetoType = searchInputVetoTypeElt.innerHTML;
				setSearchInputVetoType( searchInputVetoType  );	
				
				const locationElt  = document.getElementsByClassName( "searchInputLocation" )[0];
				const location = locationElt.innerHTML;
				setSearchInputLocation( location  );

				const homeTitleElt  = document.getElementsByClassName( "homeTitle" )[0];
				const homeTitle = homeTitleElt.innerHTML;
				setHomeTitle( homeTitle  );

				const contactTitleElt  = document.getElementsByClassName( "contactTitle" )[0];
				const contactTitle = contactTitleElt.innerHTML;
				setContactTitle( contactTitle  );
				
			}
		}
		updatePageContent();


	}, [siteLanguage] );
	
	const [form] = Form.useForm();
	
	return (
		<>
		<footer>
         <div className="footer">
            <div className="container">
               <div className="row">
                  <div className=" col-md-4">
                     <h3>Contact us</h3>
                     <ul className="conta">
                        <li><i className="fa fa-map-marker" aria-hidden="true"></i> 229 Rue Saint-Honore,<br/>75001 Paris<br/>France</li>
                        <li><i className="fa fa-mobile" aria-hidden="true"></i> +33 602 455 0680</li>
                        <li> <i className="fa fa-envelope" aria-hidden="true"></i><a href="#"> info@vetonest.com</a></li>
                     </ul>
					 
                  </div>
                  <div className="col-md-4">
                     <h3>Menu Link</h3>
                     <ul className="link_menu">
                        <li className={active[0].actif} >
							<a  onClick={ e => handleClickGoto( 'home' ) }>
								Home
							</a>
						</li>
                        <li className={active[1].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'about' ) }>
								About
							</a>
						</li>
						<li className={active[2].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'import-export' ) }>
								Import-Export
							</a>
						</li>
						<li className={active[3].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'expertise' ) }>
								Expertise
							</a>
						</li>
						<li className={active[4].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'contact' ) }>
								Contact
							</a>
						</li>
                     </ul>
                  </div>
                  <div className="col-md-4">
                     <h3>News letter</h3>
					 
                     <Form 
						className="bottom_form"
						form = {form}
					 >
						<Form.Item
								name  = "email"
								rules = {[
									{
										message: emailError,
										validator: ( value ) => {
											if ( emailError ) {
												return Promise.reject( emailError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								/* initialValue  = { fullname ? fullname : fullnameDefault } */
							>
						
								<input 
									className="enter" 
									placeholder="Enter your email" 
									type="text" 
									name="Enter your email"
									value={ email }
									onChange = { e => handleChangeEmail(e)}
								/>
							</Form.Item>
                        <button 
							className="sub_btn" 
							disabled={isButtonDisabled}
							onClick={ e => handleClicSend() }
						>
							subscribe
						</button>
                     </Form>
                     <ul className="social_icon">
                        <li><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-youtube-play" aria-hidden="true"></i></a></li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="copyright">
               <div className="container">
                  <div className="row">
                     <div className="col-md-10 offset-md-1">
                        <p> © 2025 All Rights Reserved. </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
		</>
	);
};

export default Footer;
