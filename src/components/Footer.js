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
		setSignUp_nameErrorText,
		setSignUp_firstNameErrorText,
		setSignUp_emailErrorText,
		setSignUp_passwordErrorText,
		setSignUp_passwordRepeatErrorText,
		setSignUp_type1,
		setSignUp_type2,
		setSignUp_nameEmpty,
		setSignUp_emailEmpty,
		setSignUp_passwordEmpty,
		setSignup_correctErrors,
		setSignup_selectTypeError,
		setSignUp_verifyEmailSubjet,
		setSignup_firstNamePlaceholder,
		setSignup_emailPlaceholder,
		setSignup_passwordPlaceholder,
		setSignup_passwordRepeatPlaceholder,
		setSignup_namePlaceholder

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

// console.log( '>> siteContent', siteContent );

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

				const signUp_nameErrorTextElt  = document.getElementsByClassName( "signUp_nameErrorText" )[0];
				if( signUp_nameErrorTextElt ){
					const signUp_nameErrorText = signUp_nameErrorTextElt.innerHTML;
					setSignUp_nameErrorText( signUp_nameErrorText );
				}

				const signUp_firstNameErrorTextElt  = document.getElementsByClassName( "signUp_firstNameErrorText" )[0];
				if( signUp_firstNameErrorTextElt ){
					const signUp_firstNameErrorText = signUp_firstNameErrorTextElt.innerHTML;
					setSignUp_firstNameErrorText( signUp_firstNameErrorText );
				}

				const signUp_emailErrorTextElt  = document.getElementsByClassName( "signUp_emailErrorText" )[0];
				if( signUp_emailErrorTextElt ){
					const signUp_emailErrorText = signUp_emailErrorTextElt.innerHTML;
					setSignUp_emailErrorText( signUp_emailErrorText );
				}

				const signUp_passwordErrorTextElt  = document.getElementsByClassName( "signUp_passwordErrorText" )[0];
				if( signUp_passwordErrorTextElt ){
					const signUp_passwordErrorText = signUp_passwordErrorTextElt.innerHTML;
					setSignUp_passwordErrorText( signUp_passwordErrorText );
				}

				const signUp_passwordRepeatErrorTextElt  = document.getElementsByClassName( "signUp_passwordRepeatErrorText" )[0];
				if( signUp_passwordRepeatErrorTextElt ){
					const signUp_passwordRepeatErrorText = signUp_passwordRepeatErrorTextElt.innerHTML;
					setSignUp_passwordRepeatErrorText( signUp_passwordRepeatErrorText );
				} 

				const signUp_type1Elt  = document.getElementsByClassName( "signUp_type1" )[0];
				if( signUp_type1Elt ){
					const signUp_type1 = signUp_type1Elt.innerHTML;
					setSignUp_type1( signUp_type1 );
				} 

				const signUp_type2Elt  = document.getElementsByClassName( "signUp_type2" )[0];
				if( signUp_type2Elt ){
					const signUp_type2 = signUp_type2Elt.innerHTML;
					setSignUp_type2( signUp_type2 );
				} 

				const signUp_nameEmptyElt  = document.getElementsByClassName( "signUp_nameEmpty" )[0];
				if( signUp_nameEmptyElt ){
					const signUp_nameEmpty = signUp_nameEmptyElt.innerHTML;
					setSignUp_type1( signUp_nameEmpty );
				} 
				
				const signUp_emailEmptyElt  = document.getElementsByClassName( "signUp_emailEmpty" )[0];
				if( signUp_emailEmptyElt ){
					const signUp_emailEmpty = signUp_emailEmptyElt.innerHTML;
					setSignUp_emailEmpty( signUp_emailEmpty );
				} 

				const signUp_passwordEmptyElt  = document.getElementsByClassName( "signUp_passwordEmpty" )[0];
				if( signUp_passwordEmptyElt ){
					const signUp_passwordEmpty = signUp_passwordEmptyElt.innerHTML;
					setSignUp_passwordEmpty( signUp_passwordEmpty );
				} 

				const signup_correctErrorsElt  = document.getElementsByClassName( "signup_correctErrors" )[0];
				if( signup_correctErrorsElt ){
					const signup_correctErrors = signup_correctErrorsElt.innerHTML;
					setSignup_correctErrors( signup_correctErrors );
				} 

				const signup_selectTypeErrorElt  = document.getElementsByClassName( "signup_selectTypeError" )[0];
				if( signup_selectTypeErrorElt ){
					const signup_selectTypeError = signup_selectTypeErrorElt.innerHTML;
					setSignup_selectTypeError( signup_selectTypeError );
				} 
				
				const signUp_verifyEmailSubjetElt  = document.getElementsByClassName( "signUp_verifyEmailSubjet" )[0];
				if( signUp_verifyEmailSubjetElt ){
					const signUp_verifyEmailSubjet = signUp_verifyEmailSubjetElt.innerHTML;
					setSignUp_verifyEmailSubjet( signUp_verifyEmailSubjet );
				} 
				
				const signup_firstNamePlaceholderElt  = document.getElementsByClassName( "signup_firstNamePlaceholder" )[0];
				if( signup_firstNamePlaceholderElt ){
					const signup_firstNamePlaceholder = signup_firstNamePlaceholderElt.innerHTML;
					setSignup_firstNamePlaceholder( signup_firstNamePlaceholder );
				} 
				
				const signup_emailPlaceholderElt  = document.getElementsByClassName( "signup_emailPlaceholder" )[0];
				if( signup_emailPlaceholderElt ){
					const signup_emailPlaceholder = signup_emailPlaceholderElt.innerHTML;
					setSignup_emailPlaceholder( signup_emailPlaceholder );
				}
				
				const signup_passwordPlaceholderElt  = document.getElementsByClassName( "signup_passwordPlaceholder" )[0];
				if( signup_passwordPlaceholderElt ){
					const signup_passwordPlaceholder = signup_passwordPlaceholderElt.innerHTML;
					setSignup_passwordPlaceholder( signup_passwordPlaceholder );
				} 
		
				const signup_passwordRepeatPlaceholderElt  = document.getElementsByClassName( "signup_passwordRepeatPlaceholder" )[0];
				if( signup_passwordRepeatPlaceholderElt ){
					const signup_passwordRepeatPlaceholder = signup_passwordRepeatPlaceholderElt.innerHTML;
					setSignup_passwordRepeatPlaceholder( signup_passwordRepeatPlaceholder );
				} 
				
				const signup_namePlaceholderElt  = document.getElementsByClassName( "signup_namePlaceholder" )[0];
				if( signup_namePlaceholderElt ){
					const signup_namePlaceholder = signup_namePlaceholderElt.innerHTML;
					setSignup_namePlaceholder( signup_namePlaceholder );
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
                  <div className="col-md-4">
                     <h3 id="cmp_vetonest.com_jkquJ9NP2S">Réseaux</h3>
					 
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
                        <p > © 2025 <span id="cmp_vetonest.com_hMmiaD2Hx6">All Rights Reserved.</span> </p>
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
