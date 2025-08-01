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
		setBlogTitle,
		setPlaceholderFullname,
		setPlaceholderEmail,
		setPlaceholderPhone,
		setPlaceholderMessage,
		setContactCorrectError,
		setContactErrorsExistText,
		setContactErrorOccured,		
		setContactThankYou,			
		setContactEmailError,
		setContactFullnameErrorText,			
		setContactPhoneNumberErrorText,
		setContactFormMessageErrorText,
		setContactFullnameErrorEmptyText,
		setContactEmailEmptyError,
		setContactErrorPhonenumberEmpty,
		setContactEmptyMessageError,

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

		const rep = await sendMessage( data );
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
				
				// insert content
				const tagContent = contentTypeId == 1 ? currentLanguageTagContent[0].textContent : 
				currentLanguageTagContent[0].mediaContent;
				element.innerHTML = tagContent;
				// insert in duplication of the tag. They have a classname named the ragRef as .
				const elementDuplicates = document.getElementsByClassName( tagRef );
				for ( const element of elementDuplicates ) {
					element.innerHTML = tagContent;
				}
				

				// indirect translations
				const searchInputVetoElt  = document.getElementsByClassName( "searchInputVeto" )[0];
				if( searchInputVetoElt ){
					const searchInputVeto = searchInputVetoElt.innerHTML;
					setSearchInputVeto( searchInputVeto  );
				}
				
				const searchInputVetoTypeElt  = document.getElementsByClassName( "searchInputVetoType" )[0];
				if( searchInputVetoTypeElt ){
					const searchInputVetoType = searchInputVetoTypeElt.innerHTML;
					setSearchInputVetoType( searchInputVetoType  );	
				}
				
				const locationElt  = document.getElementsByClassName( "searchInputLocation" )[0];
				if( locationElt ){
					const location = locationElt.innerHTML;
					setSearchInputLocation( location );
				}
				
				const homeTitleElt  = document.getElementsByClassName( "homeTitle" )[0];
				if( homeTitleElt ){
					const homeTitle = homeTitleElt.innerHTML;
					setHomeTitle( homeTitle );
				}
				
				const contactTitleElt  = document.getElementsByClassName( "contactTitle" )[0];
				if( contactTitleElt ){
					const contactTitle = contactTitleElt.innerHTML;
					setContactTitle( contactTitle );
				}
				
				const blogTitleElt  = document.getElementsByClassName( "blogTitle" )[0];
				if( blogTitleElt ){
					const blogTitle = blogTitleElt.innerHTML;
					setBlogTitle( blogTitle );
				}

				const placeholderFullnameElt  = document.getElementsByClassName( "placeholderFullname" )[0];
				if( placeholderFullnameElt ){
					const placeholderFullname = placeholderFullnameElt.innerHTML;
					setPlaceholderFullname( placeholderFullname );
				}

				const placeholderEmailElt  = document.getElementsByClassName( "placeholderEmail" )[0];
				if( placeholderEmailElt ){
					const placeholderEmail = placeholderEmailElt.innerHTML;
					setPlaceholderEmail( placeholderEmail );
				}
				
				const placeholderPhoneElt  = document.getElementsByClassName( "placeholderPhone" )[0];
				if( placeholderPhoneElt ){
					const placeholderPhone = placeholderPhoneElt.innerHTML;
					setPlaceholderPhone( placeholderPhone );
				}
				
				const placeholderMessageElt  = document.getElementsByClassName( "placeholderMessage" )[0];
				if( placeholderMessageElt ){
					const placeholderMessage = placeholderMessageElt.innerHTML;
					setPlaceholderMessage( placeholderMessage );
				}
				
				const contactCorrectErrorElt  = document.getElementsByClassName( "contactCorrectError" )[0];
				if( contactCorrectErrorElt ){
					const contactCorrectError = contactCorrectErrorElt.innerHTML;
					setContactCorrectError( contactCorrectError );
				}

				const contactErrorsExistTextElt  = document.getElementsByClassName( "contactErrorsExistText" )[0];
				if( contactErrorsExistTextElt ){
					const contactErrorsExistText = contactErrorsExistTextElt.innerHTML;
// alert( contactErrorsExistText );
					setContactErrorsExistText( contactErrorsExistText );
				}

				const contactErrorOccuredElt  = document.getElementsByClassName( "contactErrorOccured" )[0];
				if( contactErrorOccuredElt ){
					const contactErrorOccured = contactErrorOccuredElt.innerHTML;
					setContactErrorOccured( contactErrorOccured );
				}

				const contactThankYouElt  = document.getElementsByClassName( "contactThankYou" )[0];
				if( contactThankYouElt ){
					const contactThankYou = contactThankYouElt.innerHTML;
					setContactThankYou( contactThankYou );
				}
				
				const contactEmailErrorElt  = document.getElementsByClassName( "contactEmailError" )[0];
				if( contactEmailErrorElt ){
					const contactEmailError = contactEmailErrorElt.innerHTML;
					setContactEmailError( contactEmailError );
				}
				
				const contactFullnameErrorTextElt  = document.getElementsByClassName( "contactFullnameErrorText" )[0];
				if( contactFullnameErrorTextElt ){
					const contactFullnameErrorText = contactFullnameErrorTextElt.innerHTML;
					setContactFullnameErrorText( contactFullnameErrorText );
				}		
		
				const contactPhoneNumberErrorTextElt  = document.getElementsByClassName( "contactPhoneNumberErrorText" )[0];
				if( contactPhoneNumberErrorTextElt ){
					const contactPhoneNumberErrorText = contactPhoneNumberErrorTextElt.innerHTML;
					setContactPhoneNumberErrorText( contactPhoneNumberErrorText );
				}

				const contactFormMessageErrorTextElt  = document.getElementsByClassName( "contactFormMessageErrorText" )[0];
				if( contactFormMessageErrorTextElt ){
					const contactFormMessageErrorText = contactFormMessageErrorTextElt.innerHTML;
					setContactFormMessageErrorText( contactFormMessageErrorText );
				}	

				const contactFullnameErrorEmptyTextElt  = document.getElementsByClassName( "contactFullnameErrorEmptyText" )[0];
				if( contactFullnameErrorEmptyTextElt ){
					const contactFullnameErrorEmptyText = contactFullnameErrorEmptyTextElt.innerHTML;
					setContactFullnameErrorEmptyText( contactFullnameErrorEmptyText );
				}

				const contactEmailEmptyErrorElt  = document.getElementsByClassName( "contactEmailEmptyError" )[0];
				if( contactEmailEmptyErrorElt ){
					const contactEmailEmptyError = contactEmailEmptyErrorElt.innerHTML;
					setContactEmailEmptyError( contactEmailEmptyError );
				}

				const contactErrorPhonenumberEmptyElt  = document.getElementsByClassName( "contactErrorPhonenumberEmpty" )[0];
				if( contactErrorPhonenumberEmptyElt ){
					const contactErrorPhonenumberEmpty = contactErrorPhonenumberEmptyElt.innerHTML;
					setContactErrorPhonenumberEmpty( contactErrorPhonenumberEmpty );
				}

				const contactEmptyMessageErrorElt  = document.getElementsByClassName( "contactEmptyMessageError" )[0];
				if( contactEmptyMessageErrorElt ){
					const contactEmptyMessageError = contactEmptyMessageErrorElt.innerHTML;
					setContactEmptyMessageError( contactEmptyMessageError );
				}

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
                     <h3 className="cmp_vetonest.com_SOJVt74LSV">Contact us</h3>
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
							<a  onClick={ e => handleClickGoto( 'accueil' ) }>
								Home
							</a>
						</li>
                        <li className={active[1].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'inscription' ) }>
								Créer un compte
							</a>
						</li>
						<li className={active[2].actif} >
							<a style={{ cursor: 'pointer' }} onClick={ e => handleClickGoto( 'blog' ) }>
								blog
							</a>
						</li>
                     </ul>
                  </div>
                  <div className="col-md-4">
                     <h3>Réseaux</h3>
					 
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
