import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';

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

import Content from './Content.js';
import CookieConsent from './CookieConsent';  // Import the existing CookieConsent component

const Footer = () => {
	
	const { 
		siteDomainName,
		siteContent,
		siteLanguage,
		setSiteContent,
		getSiteContent,
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
	
	// Message
	const [ email, setMessage ] = useState( '' );
	const [ emailDefault, setMessageDefault ] = useState( 'Message' );
	const [ emailError, setMessageError ] = useState( '' );
	const handleChangeMessage = ( e ) => {
		const data = e.target.value;
		setMessage( data );

		var emailErrorText = '';
		if( data && !isValidMessage( data ) )
			emailErrorText = 'Your email is not correct'
		
		setMessageError( emailErrorText );
	}

	// Message validation
	const regexMessageValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidMessage = ( email ) => {
		if( !regexMessageValidation.test( email ) )
			return false;

		return true;
	}

// check if there are form errors
	const checkTheForm = async( ) => {

		var errorsExist = false;

		// email
		if( !email ){
			const emailErrorText = 'The email field is empty';
			setMessageError( emailErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		
		return errorsExist
	}
	
	const { sendMessage }	= useContext( SiteContext );

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

		// send data
		setLoginSpin( 'block' ); // spin
		const html = 'Hello, <br><br>You have received a newsletter subscription request on cecilia-group.com,<br><br> Sender email: '  + email + '<br/><br/><br/><br/>Regards';
		const data = {
			html: 		html,
			subject: 	'New message on cecilia-group.com',
		}

		const rep = await sendMessage( data );
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
		const newActiveArr = active.map( e =>  e.path != path ? ({ path : e.path, actif : '' }) : ({ path : e.path, actif : 'active' } ) ); // 
		setActive( newActiveArr );	
		
	}, [] );
	
	const [form] = Form.useForm();
	
	return (
		<>
		<footer>
         <div className="footer">
            <div className="container">
               <div className="row">
                  {/* Column 1: Contact us */}
                  <div className="col-md-3">
                     <h3 className="cmp_vetonest.com_SOJVt74LSV">Contact us</h3>
                     <ul className="conta">
                        <li><i className="fa fa-map-marker" aria-hidden="true"></i> 229 Rue Saint-Honore,<br/>75001 Paris<br/>France</li>
                        <li><i className="fa fa-mobile" aria-hidden="true"></i> +33 602 455 0680</li>
                        <li> <i className="fa fa-envelope" aria-hidden="true"></i><a href="#"> info@vetonest.com</a></li>
                     </ul>
                  </div>
                  
                  {/* Column 2: Menu Link */}
                  <div className="col-md-3">
                     <h3 id="cmp_vetonest.com_iXxQuX5SHG">Menu Link</h3>
                     <ul className="link_menu">
                        <li className={active[0].actif} >
							<a id="cmp_vetonest.com_TR3jIz4ldy" onClick={ e => handleClickGoto( 'accueil' ) }>
								Home
							</a>
						</li>
                        <li className={active[1].actif} >
							<a 
								style={{ cursor: 'pointer' }} 
								onClick={ e => handleClickGoto( 'connexion' ) }
								className="cmp_vetonest.com_adWeBARABI"
							
							>
								Connexion
							</a>
						</li>
                        <li className={active[1].actif} >
							<a 
								style={{ cursor: 'pointer' }} 
								onClick={ e => handleClickGoto( 'inscription' ) }
								className="cmp_vetonest.com_bL1MO9LnVv"
							>
								Créer un compte
							</a>
						</li>
						<li className={active[2].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'blog' ) }>
								Blog
							</a>
						</li>
                     </ul>
                  </div>
                  
                  {/* Column 3: Réseaux */}
                  <div className="col-md-3">
                     <h3 id="cmp_vetonest.com_jkquJ9NP2S">Réseaux</h3>
                     <ul className="social_icon">
                        <li><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
                        <li><a href="#"><i className="fa fa-youtube-play" aria-hidden="true"></i></a></li>
                     </ul>
                  </div>
                  
                  {/* NEW Column 4: Legal */}
                  <div className="col-md-3">
                     <h3>Légal</h3>
                     <ul className="link_menu" style={{ listStyle: "none", paddingLeft: 0 }}>
                        <li>
                           <a style={{ cursor: 'pointer' }} onClick={() => handleClickGoto('mentions-legales')}>
                              Mentions légales
                           </a>
                        </li>
                        <li>
                           <a style={{ cursor: 'pointer' }} onClick={() => handleClickGoto('disclaimer')}>
                              Disclaimer médical
                           </a>
                        </li>
                        <li>
                           <a style={{ cursor: 'pointer' }} onClick={() => handleClickGoto('conditions-utilisation')}>
                              Conditions générales d'utilisation
                           </a>
                        </li>
                        <li>
                           <a style={{ cursor: 'pointer' }} onClick={() => handleClickGoto('cookies')}>
                              Politique des cookies
                           </a>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="copyright">
               <div className="container">
                  <div className="row">
                     <div className="col-md-10 offset-md-1">
                        <p > © 2026 <span id="cmp_vetonest.com_hMmiaD2Hx6">All Rights Reserved.</span> </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
		 <Content />
      </footer>
      {/* Cookie Consent Banner */}
      <CookieConsent />
		</>
	);
};

export default Footer;