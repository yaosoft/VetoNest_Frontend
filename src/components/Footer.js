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
		setSignUp_correctErrors,
		setSignUp_selectTypeError,
		setSignUp_verifyEmailSubjet,
		setSignUp_firstNamePlaceholder,
		setSignUp_emailPlaceholder,
		setSignUp_passwordPlaceholder,
		setSignUp_passwordRepeatPlaceholder,
		setSignUp_namePlaceholder,
		setSignUp_formOption1ErrorText,
		setSignUp_formOption2ErrorText,
		setSignUp_passwordRepeatEmpty,
		setSignUp_codeCorrect,
		setSignUp_codeTitle,
		setSignUp_codeIncorrect,
		setSignUp_codeIntro,
		setSignUp_codeResend,
		setSignUp_popConfirmVetTitle,
		setSignUp_popConfirmPetTitle,
		setSignUp_popConfirmVetDescription,
		setSignUp_popConfirmPetDescription,
		setSignUp_popConfirmYes,
		setSignUp_popConfirmNo,
		setSignUp_popConfirmDeleteBtn,
		setSignUp_accountCreationSuccess,
		setSignUp_title,
		setSignUp_btnSubmit,
		setSignUp_termsUsage,
		setSignUp_accountCreationFails,
		setSignIn_passwordForgot,
		setSignIn_title,
		setPasswordForgot_updateSuccess,
		setPasswordForgotReset_title, 
		passwordForgotReset_title,
		flag,
		setPaymentMethod_paypalEmail,
		setPaymentMethod_bankAddressErrorText,
		setPaymentMethod_ibanErrorText,
		setPaymentMethod_fullNameEmpty,
		setPaymentMethod_bankNameEmpty,
		setPaymentMethod_bankAddressEmpty,
		setPaymentMethod_ibanEmpty,
		setPaymentMethod_bankNamePlaceholder,
		setPaymentMethod_bankAddressPlaceholder,
		setPaymentMethod_ibanPlaceholder,
		setPaymentMethod_fullNamePlaceholder,
		setPaymentMethod_bankNameErrorText,
		setPaymentMethod_descriptionPaypal,
		setPaymentMethod_descriptionBank,
		setProfile_sexe_male,
		setProfile_sexe_female,
		setLanguage_french,
		setLanguage_english,
		setLanguage_spanish,
		setLanguage_german,
		setLanguage_italian,
		setLanguage_estonian,
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
				const elementDuplicates = document.getElementsByClassName( tagRef );
				if( element === null && elementDuplicates.length == 0 )
					continue 

				const currentLanguageTagContent = contents.filter( e => e.languageCode == siteLanguage );
				if( !currentLanguageTagContent.length )
					continue  

				// insert content
				const tagContent = contentTypeId == 1 ? currentLanguageTagContent[0].textContent : 
				currentLanguageTagContent[0].mediaContent;
				if( element !== null )
					element.innerHTML = tagContent;
				
				// insert in repetition of the tag. They have a classname named the ragRef as .
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
					setSignUp_nameEmpty( signUp_nameEmpty );
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

				const signUp_correctErrorsElt  = document.getElementsByClassName( "signUp_correctErrors" )[0];
				if( signUp_correctErrorsElt ){
					const signUp_correctErrors = signUp_correctErrorsElt.innerHTML;
					setSignUp_correctErrors( signUp_correctErrors );
				} 

				const signUp_selectTypeErrorElt  = document.getElementsByClassName( "signUp_selectTypeError" )[0];
				if( signUp_selectTypeErrorElt ){
					const signUp_selectTypeError = signUp_selectTypeErrorElt.innerHTML;
					setSignUp_selectTypeError( signUp_selectTypeError );
				} 
				
				const signUp_verifyEmailSubjetElt  = document.getElementsByClassName( "signUp_verifyEmailSubjet" )[0];
				if( signUp_verifyEmailSubjetElt ){
					const signUp_verifyEmailSubjet = signUp_verifyEmailSubjetElt.innerHTML;
					setSignUp_verifyEmailSubjet( signUp_verifyEmailSubjet );
				} 
				
				const signUp_firstNamePlaceholderElt  = document.getElementsByClassName( "signUp_firstNamePlaceholder" )[0];
				if( signUp_firstNamePlaceholderElt ){
					const signUp_firstNamePlaceholder = signUp_firstNamePlaceholderElt.innerHTML;
					setSignUp_firstNamePlaceholder( signUp_firstNamePlaceholder );
				} 
				
				const signUp_emailPlaceholderElt  = document.getElementsByClassName( "signUp_emailPlaceholder" )[0];
				if( signUp_emailPlaceholderElt ){
					const signUp_emailPlaceholder = signUp_emailPlaceholderElt.innerHTML;
					setSignUp_emailPlaceholder( signUp_emailPlaceholder );
				}
				
				const signUp_passwordPlaceholderElt  = document.getElementsByClassName( "signUp_passwordPlaceholder" )[0];
				if( signUp_passwordPlaceholderElt ){
					const signUp_passwordPlaceholder = signUp_passwordPlaceholderElt.innerHTML;
					setSignUp_passwordPlaceholder( signUp_passwordPlaceholder );
				} 
		
				const signUp_passwordRepeatPlaceholderElt  = document.getElementsByClassName( "signUp_passwordRepeatPlaceholder" )[0];
				if( signUp_passwordRepeatPlaceholderElt ){
					const signUp_passwordRepeatPlaceholder = signUp_passwordRepeatPlaceholderElt.innerHTML;
					setSignUp_passwordRepeatPlaceholder( signUp_passwordRepeatPlaceholder );
				} 
				
				const signUp_namePlaceholderElt  = document.getElementsByClassName( "signUp_namePlaceholder" )[0];
				if( signUp_namePlaceholderElt ){
					const signUp_namePlaceholder = signUp_namePlaceholderElt.innerHTML;
					setSignUp_namePlaceholder( signUp_namePlaceholder );
				} 

				const signUp_formOption1ErrorTextElt  = document.getElementsByClassName( "signUp_formOption1ErrorText" )[0];
				if( signUp_formOption1ErrorTextElt ){				
					const signUp_formOption1ErrorText = signUp_formOption1ErrorTextElt.innerHTML;
					setSignUp_formOption1ErrorText( signUp_formOption1ErrorText );
				} 

				const signUp_formOption2ErrorTextElt  = document.getElementsByClassName( "signUp_formOption2ErrorText" )[0];
				if( signUp_formOption2ErrorTextElt ){
					const signUp_formOption2ErrorText = signUp_formOption2ErrorTextElt.innerHTML;
					setSignUp_formOption2ErrorText( signUp_formOption2ErrorText );
				} 

				const signUp_passwordRepeatEmptyElt  = document.getElementsByClassName( "signUp_passwordRepeatEmpty" )[0];
				if( signUp_passwordRepeatEmptyElt ){
					const signUp_passwordRepeatEmpty = signUp_passwordRepeatEmptyElt.innerHTML;
					setSignUp_passwordRepeatEmpty( signUp_passwordRepeatEmpty );
				} 

				const signUp_codeCorrectElt  = document.getElementsByClassName( "signUp_codeCorrect" )[0];
				if( signUp_codeCorrectElt ){
					const signUp_codeCorrect = signUp_codeCorrectElt.innerHTML;

					setSignUp_codeCorrect( signUp_codeCorrect );
				}
				
				const signUp_codeTitleElt  = document.getElementsByClassName( "signUp_codeTitle" )[0];
				if( signUp_codeTitleElt ){
					const signUp_codeTitle = signUp_codeTitleElt.innerHTML;				
					setSignUp_codeTitle( signUp_codeTitle );
				} 
				
				const signUp_codeIncorrectElt  = document.getElementsByClassName( "signUp_codeIncorrect" )[0];
				if( signUp_codeIncorrectElt ){
					const signUp_codeIncorrect = signUp_codeIncorrectElt.innerHTML;
					setSignUp_codeIncorrect( signUp_codeIncorrect );
				}

				const signUp_codeIntroElt  = document.getElementsByClassName( "signUp_codeIntro" )[0];
				if( signUp_codeIntroElt ){
					const signUp_codeIntro = signUp_codeIntroElt.innerHTML;
					setSignUp_codeIntro( signUp_codeIntro );
				}
				
				const signUp_codeResendElt  = document.getElementsByClassName( "signUp_codeResend" )[0];
				if( signUp_codeResendElt ){
					const signUp_codeResend = signUp_codeResendElt.innerHTML;
					setSignUp_codeResend( signUp_codeResend );
				}

				const signUp_popConfirmVetTitleElt  = document.getElementsByClassName( "signUp_popConfirmVetTitle" )[0];
				if( signUp_popConfirmVetTitleElt ){
					const signUp_popConfirmVetTitle = signUp_popConfirmVetTitleElt.innerHTML;
					setSignUp_popConfirmVetTitle( signUp_popConfirmVetTitle );
				}
				
				const signUp_popConfirmPetTitleElt  = document.getElementsByClassName( "signUp_popConfirmPetTitle" )[0];
				if( signUp_popConfirmPetTitleElt ){
					const signUp_popConfirmPetTitle = signUp_popConfirmPetTitleElt.innerHTML;
					setSignUp_popConfirmPetTitle( signUp_popConfirmPetTitle );
				}

				const signUp_popConfirmVetDescriptionElt  = document.getElementsByClassName( "signUp_popConfirmVetDescription" )[0];
				if( signUp_popConfirmVetDescriptionElt ){
					const signUp_popConfirmVetDescription = signUp_popConfirmVetDescriptionElt.innerHTML;
					setSignUp_popConfirmVetDescription( signUp_popConfirmVetDescription );
				}

				const signUp_popConfirmPetDescriptionElt  = document.getElementsByClassName( "signUp_popConfirmPetDescription" )[0];
				if( signUp_popConfirmPetDescriptionElt ){
					const signUp_popConfirmPetDescription = signUp_popConfirmPetDescriptionElt.innerHTML;
					setSignUp_popConfirmPetDescription( signUp_popConfirmPetDescription );
				}

				const signUp_popConfirmYesElt  = document.getElementsByClassName( "signUp_popConfirmYes" )[0];
				if( signUp_popConfirmYesElt ){
					const signUp_popConfirmYes = signUp_popConfirmYesElt.innerHTML;
					setSignUp_popConfirmYes( signUp_popConfirmYes );
				}

				const signUp_popConfirmNoElt  = document.getElementsByClassName( "signUp_popConfirmNo" )[0];
				if( signUp_popConfirmNoElt ){
					const signUp_popConfirmNo = signUp_popConfirmNoElt.innerHTML;
					setSignUp_popConfirmNo( signUp_popConfirmNo );
				}
				
				const signUp_popConfirmDeleteBtnElt  = document.getElementsByClassName( "signUp_popConfirmDeleteBtn" )[0];
				if( signUp_popConfirmDeleteBtnElt ){
					const signUp_popConfirmDeleteBtn = signUp_popConfirmDeleteBtnElt.innerHTML;
					setSignUp_popConfirmDeleteBtn( signUp_popConfirmDeleteBtn );
				}
				
				const signUp_accountCreationSuccessElt  = document.getElementsByClassName( "signUp_accountCreationSuccess" )[0];
				if( signUp_accountCreationSuccessElt ){
					const signUp_accountCreationSuccess = signUp_accountCreationSuccessElt.innerHTML;
					setSignUp_accountCreationSuccess( signUp_accountCreationSuccess );
				}
				
				const signUp_titleElt  = document.getElementsByClassName( "signUp_title" )[0];
				if( signUp_titleElt ){
					const signUp_title = signUp_titleElt.innerHTML;
					setSignUp_title( signUp_title );
				}
				
				const signUp_btnSubmitElt  = document.getElementsByClassName( "signUp_btnSubmit" )[0];
				if( signUp_btnSubmitElt ){
					const signUp_btnSubmit = signUp_btnSubmitElt.innerHTML;
					setSignUp_btnSubmit( signUp_btnSubmit );
				}
				
				const signUp_termsUsageElt  = document.getElementsByClassName( "signUp_termsUsage" )[0];
				if( signUp_termsUsageElt ){
					const signUp_termsUsage = signUp_termsUsageElt.innerHTML;
					setSignUp_termsUsage( signUp_termsUsage );
				}
				
				const signUp_accountCreationFailsElt  = document.getElementsByClassName( "signUp_accountCreationFails" )[0];
				if( signUp_accountCreationFailsElt ){
					const signUp_accountCreationFails = signUp_accountCreationFailsElt.innerHTML;
					setSignUp_accountCreationFails( signUp_accountCreationFails );
				}
				
				const signIn_passwordForgotElt  = document.getElementsByClassName( "signIn_passwordForgot" )[0];
				if( signIn_passwordForgotElt ){
					const signIn_passwordForgot = signIn_passwordForgotElt.innerHTML;
					setSignIn_passwordForgot( signIn_passwordForgot );
				}
				
				const signIn_titleElt  = document.getElementsByClassName( "signIn_title" )[0];
				if( signIn_titleElt ){
					const signIn_title = signIn_titleElt.innerHTML;
					setSignIn_title( signIn_title );
				}

				const passwordForgot_updateSuccessElt  = document.getElementsByClassName( "passwordForgot_updateSuccess" )[0];
				if( passwordForgot_updateSuccessElt ){
					const passwordForgot_updateSuccess = passwordForgot_updateSuccessElt.innerHTML;
					setPasswordForgot_updateSuccess( passwordForgot_updateSuccess );
				}
				
				const passwordForgotReset_titleElt  = document.getElementsByClassName( "passwordForgotReset_title" )[0];
				if( passwordForgotReset_titleElt ){
					const passwordForgotReset_title = passwordForgotReset_titleElt.innerHTML;
					setPasswordForgotReset_title( passwordForgotReset_title );
				}
				
				const paymentMethod_paypalEmailElt  = document.getElementsByClassName( "paymentMethod_paypalEmail" )[0];
				if( paymentMethod_paypalEmailElt ){
					const paymentMethod_paypalEmail = paymentMethod_paypalEmailElt.innerHTML;
					setPaymentMethod_paypalEmail( paymentMethod_paypalEmail );
				}
				
				const paymentMethod_bankAddressErrorTextElt  = document.getElementsByClassName( "paymentMethod_bankAddressErrorText" )[0];
				if( paymentMethod_bankAddressErrorTextElt ){
					const paymentMethod_bankAddressErrorText = paymentMethod_bankAddressErrorTextElt.innerHTML;
					setPaymentMethod_bankAddressErrorText( paymentMethod_bankAddressErrorText );
				}
				
				const paymentMethod_ibanErrorTextElt  = document.getElementsByClassName( "paymentMethod_ibanErrorText" )[0];
				if( paymentMethod_ibanErrorTextElt ){
					const paymentMethod_ibanErrorText = paymentMethod_ibanErrorTextElt.innerHTML;
					setPaymentMethod_ibanErrorText( paymentMethod_ibanErrorText );
				}
				
				const paymentMethod_fullNameEmptyElt  = document.getElementsByClassName( "paymentMethod_fullNameEmpty" )[0];
				if( paymentMethod_fullNameEmptyElt ){
					const paymentMethod_fullNameEmpty = paymentMethod_fullNameEmptyElt.innerHTML;
					setPaymentMethod_fullNameEmpty( paymentMethod_fullNameEmpty );
				}

				const paymentMethod_bankNameEmptyElt  = document.getElementsByClassName( "paymentMethod_bankNameEmpty" )[0];
				if( paymentMethod_bankNameEmptyElt ){
					const paymentMethod_bankNameEmpty = paymentMethod_bankNameEmptyElt.innerHTML;
					setPaymentMethod_bankNameEmpty( paymentMethod_bankNameEmpty );
				}

				const paymentMethod_bankAddressEmptyElt  = document.getElementsByClassName( "paymentMethod_bankAddressEmpty" )[0];
				if( paymentMethod_bankAddressEmptyElt ){
					const paymentMethod_bankAddressEmpty = paymentMethod_bankAddressEmptyElt.innerHTML;
					setPaymentMethod_bankAddressEmpty( paymentMethod_bankAddressEmpty );
				}

				const paymentMethod_ibanEmptyElt  = document.getElementsByClassName( "paymentMethod_ibanEmpty" )[0];
				if( paymentMethod_ibanEmptyElt ){
					const paymentMethod_ibanEmpty = paymentMethod_ibanEmptyElt.innerHTML;
					setPaymentMethod_ibanEmpty( paymentMethod_ibanEmpty );
				}

				const paymentMethod_bankNamePlaceholderElt  = document.getElementsByClassName( "paymentMethod_bankNamePlaceholder" )[0];
				if( paymentMethod_bankNamePlaceholderElt ){
					const paymentMethod_bankNamePlaceholder = paymentMethod_bankNamePlaceholderElt.innerHTML;
					setPaymentMethod_bankNamePlaceholder( paymentMethod_bankNamePlaceholder );
				}

				const paymentMethod_bankAddressPlaceholderElt  = document.getElementsByClassName( "paymentMethod_bankAddressPlaceholder" )[0];
				if( paymentMethod_bankAddressPlaceholderElt ){
					const paymentMethod_bankAddressPlaceholder = paymentMethod_bankAddressPlaceholderElt.innerHTML;
					setPaymentMethod_bankAddressPlaceholder( paymentMethod_bankAddressPlaceholder );
				}

				const paymentMethod_ibanPlaceholderElt  = document.getElementsByClassName( "paymentMethod_ibanPlaceholder" )[0];
				if( paymentMethod_ibanPlaceholderElt ){
					const paymentMethod_ibanPlaceholder = paymentMethod_ibanPlaceholderElt.innerHTML;
					setPaymentMethod_ibanPlaceholder( paymentMethod_ibanPlaceholder );
				}
				
				const paymentMethod_fullNamePlaceholderElt  = document.getElementsByClassName( "paymentMethod_fullNamePlaceholder" )[0];
				if( paymentMethod_fullNamePlaceholderElt ){
					const paymentMethod_fullNamePlaceholder = paymentMethod_fullNamePlaceholderElt.innerHTML;
					setPaymentMethod_fullNamePlaceholder( paymentMethod_fullNamePlaceholder );
				}
				
				const paymentMethod_bankNameErrorTextElt  = document.getElementsByClassName( "paymentMethod_bankNameErrorText" )[0];
				if( paymentMethod_bankNameErrorTextElt ){
					const paymentMethod_bankNameErrorText = paymentMethod_bankNameErrorTextElt.innerHTML;
					setPaymentMethod_bankNameErrorText( paymentMethod_bankNameErrorText );
				}

				const paymentMethod_descriptionPaypalElt  = document.getElementsByClassName("paymentMethod_descriptionPaypal")[0];
				if( paymentMethod_descriptionPaypalElt ){
					const paymentMethod_descriptionPaypal = paymentMethod_descriptionPaypalElt.innerHTML;
					setPaymentMethod_descriptionPaypal( paymentMethod_descriptionPaypal );
				}

				const paymentMethod_descriptionBankElt  = document.getElementsByClassName("paymentMethod_descriptionBank")[0];
				if( paymentMethod_descriptionBankElt ){
					const paymentMethod_descriptionBank = paymentMethod_descriptionBankElt.innerHTML;
					setPaymentMethod_descriptionBank( paymentMethod_descriptionBank );
				}

				const profile_sexe_femaleElt  = document.getElementsByClassName("profile_sexe_female")[0];
				if( profile_sexe_femaleElt ){
					const profile_sexe_female = profile_sexe_femaleElt.innerHTML;
					setProfile_sexe_female( profile_sexe_female );
				}

				const profile_sexe_maleElt  = document.getElementsByClassName("profile_sexe_male")[0];
				if( profile_sexe_maleElt ){
					const profile_sexe_male = profile_sexe_maleElt.innerHTML;
					setProfile_sexe_male( profile_sexe_male );
				}
				
				const language_frenchElt  = document.getElementsByClassName("language_french")[0];
				if( language_frenchElt ){
					const language_french = language_frenchElt.innerHTML;
					setLanguage_french( language_french );
				}
				
				const language_englishElt  = document.getElementsByClassName("language_english")[0];
				if( language_englishElt ){
					const language_english = language_englishElt.innerHTML;
					setLanguage_english( language_english );
				}

				const language_spanishElt  = document.getElementsByClassName("language_spanish")[0];
				if( language_spanishElt ){
					const language_spanish = language_spanishElt.innerHTML;
					setLanguage_spanish( language_spanish );
				}
				
				const language_germanElt  = document.getElementsByClassName("language_german")[0];
				if( language_germanElt ){
					const language_german = language_germanElt.innerHTML;
					setLanguage_german( language_german );
				}

				const language_italianElt  = document.getElementsByClassName("language_italian")[0];
				if( language_italianElt ){
					const language_italian = language_italianElt.innerHTML;
					setLanguage_italian( language_italian );
				}
				
				const language_estonianElt  = document.getElementsByClassName("language_estonian")[0];
				if( language_estonianElt ){
					const language_estonian = language_estonianElt.innerHTML;
					setLanguage_estonian( language_estonian );
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
