import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined,
} from '@ant-design/icons';
import { Form, Input, Select, Textarea } from 'antd';


import { SiteContext } from '../context/site';

const Contact = () => {
	const navigate = useNavigate();

	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		generateRandomDigits,
		signUp, 
		checkEmail, 
		sendEmail,
		placeholderFullname,
		placeholderPhone,
		placeholderEmail,
		placeholderMessage,
		contactCorrectError,
		contactErrorsExistText,
		contactErrorOccured,
		contactThankYou,
		contactEmailError,
		contactFullnameErrorText,
		contactPhoneNumberErrorText,
		contactFormMessageErrorText,
		contactFullnameErrorEmptyText,
		contactEmailEmptyError,
		contactErrorPhonenumberEmpty,
		contactEmptyMessageError

	}	= useContext( SiteContext );

	// Spiner
	const [ loginSpin, setLoginSpin ] = useState( 'none' );
	
	const [ isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [ showMessageResult, setShowMessageResult ] = useState( 'none' );

	// Email
	const [ email, setEmail ] = useState( '' );
	const [ emailDefault, setEmailDefault ] = useState( 'Email' );
	const [ emailError, setEmailError ] = useState( '' );
	const handleChangeEmail = ( e ) => {
		const data = e.target.value;
		setEmail( data );

		var emailErrorText = '';
		if( data && !isValidEmail( data ) )
			emailErrorText = contactEmailError
			// emailErrorText = 'Your email is not correct'
		setEmailError( emailErrorText );
	}
	
	// Full name
	const [ fullname, setFullname ] = useState( '' );
	const [ fullnameDefault, setFullnameDefault ] = useState( '' );
	const [ fullNameError, setFullNameError ] = useState( '' );
	const handleChangeFullname = ( e ) => {
		const data = e.target.value;
		setFullname( data );
		
		var fullNameErrorText = '';
		if( data.length && data.length < 4 )
			fullNameErrorText = contactFullnameErrorText
			// fullNameErrorText = 'Your name seems incomplete'

		setFullNameError( fullNameErrorText );
	}
	
	// Phone number
	const [ phoneNumber, setPhoneNumber ] = useState( '' );
	const handleChangePhoneNumber = ( e ) => {
		const data = e.target.value;
		setPhoneNumber( data );

		var phoneNumberErrorText = '';
		if( data.length < 7 )
			phoneNumberErrorText = contactPhoneNumberErrorText;
		else if( !isValidPhoneNumber( data ) )
			phoneNumberErrorText = contactPhoneNumberErrorText;

// phoneNumberErrorText = 'Your phone number seems incomplete';

		setPhoneNumberError( phoneNumberErrorText );
	}

	
	// Site message
	const [ siteMessageError, setSiteMessageError]  = useState( '' );
	const [ siteMessage, setSiteMessage ] = useState( '' );
	const handleChangeSiteMessage = ( e ) => {
		
		clearFormErrors();
		
		const data = e.target.value;
		setSiteMessage( data );

		var siteMessageErrorText = '';
		if( !isValidSiteMessage( data ) )
			siteMessageErrorText = contactFormMessageErrorText;
		else
			siteMessageErrorText = ''
			

// siteMessageErrorText = 'Please add a few words to your message';

		setSiteMessageError( siteMessageErrorText );
	}

	// Email validation
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}

	// Name validation
	const isValidFullName = ( fullname ) => {
		if( fullname.length && fullname.length < 5 ){
			return false;
		}
		return true;
	}
	
	// Phone validation
	const [phoneNumberError, setPhoneNumberError]  = useState( '' );
	const isValidPhoneNumber = (value) => {
		return (/^\d{7,}$/).test(value.replace(/[\s()+\-\.]|ext/gi, ''));
	}

	// Site message validation
	const isValidSiteMessage = ( siteMessage ) => {
		if( 
			siteMessage.length &&
			( siteMessage.length <= 15 ||
			siteMessage.split( ' ' ).length < 4 )
		)
			return false
		else
			return true
	}
	
	// check if there are form errors
	const checkTheForm = async( ) => {

		var errorsExist = false;

		// full name
		if( !fullname ){
			const nameErrorText = contactFullnameErrorEmptyText;
// const nameErrorText = 'Full name field is empty';			
			setFullNameError( nameErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		// email
		if( !email ){
			const emailErrorText = contactEmailEmptyError;
// const emailErrorText = 'The email field is empty';			
			setEmailError( emailErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		// phone
		if( !phoneNumber ){
			const phoneNumberErrorText = contactErrorPhonenumberEmpty;
// const phoneNumberErrorText = 'Your phone number is empty.';			
			setPhoneNumberError( phoneNumberErrorText );
			// errorsExist = true
			errorsExist = true
		}
		// site message
		if( !siteMessage ){
			const siteMessageErrorText = contactEmptyMessageError;
// const siteMessageErrorText = 'Please add a few words to your message.';
			setSiteMessageError( siteMessageErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		
		return errorsExist
	}

	// check the form errors
	const checkFormErrors = async( ) => {
		var errorsExist = false;
		if( fullNameError != '' )    
			errorsExist = true
		if( emailError != '' )
			errorsExist = true
		if( phoneNumberError != '' )
			errorsExist = true
		else if( siteMessageError != '' )
			errorsExist = true
		
		return errorsExist
	}

	// clear all for
	const clearFormErrors = () => {
		setFullNameError( '' );
		setPhoneNumberError( '' );
		setEmailError( '' );
		setSiteMessageError( '' );
	}
	
	// Send contact form
	async function handleClicSend (){		
		
		setIsButtonDisabled( true );
		
		// check form erors
		const formHasErrors = await checkFormErrors();

		if( formHasErrors ){
// alert( contactCorrectError );
			message.error( contactCorrectError );
			setLoginSpin( 'none' );
			setIsButtonDisabled( false );
			return
		}
		
		// check the form
		const formError = await checkTheForm();	

		// if errors exist in the form
		if( formError === true ){
			// const errorsExistText = 'Please correct the errors and try again.';
// alert( contactErrorsExistText );
			const errorsExistText = contactErrorsExistText;
			message.error( errorsExistText );
			setLoginSpin( 'none' );
			setIsButtonDisabled( false );
			return;
		}

		// check the recaptcha 
		// if( !recaptchaValue ){ // recaptcha
			// message.error( 'Please check the recaptcha verification' )
			// return;
		// }

		// send data
		setLoginSpin( 'block' ); // spin

		const subject 		= 'Nouveau message du site Vetonest';
		const to_email 		= 'yaosoft@hotmail.com';
		const domainName 	= to_email.split( '@' )[1];
		const userName		= fullname + ', ' + to_email;
		const sendEmailData = {
			to_email 		: to_email,
			to_domain		: domainName,
			subject			: subject,
			userName    	: userName,
			siteName    	: siteName,
			siteDomain  	: siteDomain,
			siteEmail		: siteEmail,
			siteUrl     	: siteUrl,
			code  			: siteMessage,
			emailTemplate	: 'email_contact'
		}

		const rep = await sendEmail( sendEmailData );
// console.log( rep );
		if( !rep ){
			// message.error( 'An error occured' )
			message.error( contactErrorOccured )
		}
		else{
			// message.success( 'Thank you. We will contact you soon.' )
			message.success( contactThankYou );
			
			// clear form error
			clearFormErrors();
			
			setIsButtonDisabled( true );
			setShowMessageResult( 'block' );
		}
		setLoginSpin( 'none' );
		
	}
	
	
	const [form] = Form.useForm();

	return (
		<>


      <div className="contact">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-md-6">
					<Form 
						className="main_form"
						form = {form}
					>
                     <div className="row">
                        <div className="col-md-12 ">
							<Form.Item
								name  = "fullName"
								style = {{ marginBottom: '0px' }}
								rules = {[
									{
										message: fullNameError,
										validator: ( value ) => {
											if ( fullNameError ) {
												return Promise.reject( fullNameError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								/* initialValue  = { fullname ? fullname : fullnameDefault } */
							>
							   <Input 
									className="contactus" 
									placeholder={ placeholderFullname } 
									type="type" 
									name="Fullname" 
									value={ fullname }
									onChange = { e => handleChangeFullname(e) }
							   /> 
							   <span className="placeholderFullname displayNone" id="cmp_vetonest.com_InGStIvYcM" >Nom complet</span>
							</Form.Item>
                        </div>
                        <div className="col-md-12">
							<Form.Item
								name  = "email"
								style = {{ marginBottom: '0px' }}
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
							   <Input 
									className="contactus" 
									placeholder={ placeholderEmail }
									type="type" 
									name="Email"
									value={ email } 
									onChange = { e => handleChangeEmail(e)}
								/>
								<span className="placeholderEmail displayNone" id="cmp_vetonest.com_Xep3PSNstf" >Email</span>
							</Form.Item>
                        </div>
                        <div className="col-md-12">
                            <Form.Item
								name  = "phoneNumber"
								style = {{ marginBottom: '0px', float: 'left' }}
								rules = {[
									{
										message: phoneNumberError,
										validator: ( value ) => {
											if ( phoneNumberError ) {
												return Promise.reject( phoneNumberError );
															
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
							>
								<Input 
									className="contactus" 
									placeholder={ placeholderPhone }
									type="type" 
									name="Phone Number" 
									value={ phoneNumber }
									onChange = { e => handleChangePhoneNumber(e)}
								/>
								<span className="placeholderPhone displayNone" id="cmp_vetonest.com_EeTPYxP4vF" >Numéro de téléphone</span>
							</Form.Item>							
                        </div>
                        <div className="col-md-12">
							<Form.Item
								name  = "siteMessage"
								style = {{ marginBottom: '0px' }}
								rules = {[
									{
										message: siteMessageError,
										validator: ( value ) => {
											if ( !isValidSiteMessage(siteMessage) ) {
												return Promise.reject( siteMessageError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
							>
							   <Input.TextArea 
									className="textarea" 
									placeholder={ placeholderMessage } 
									type="type" 
									value={ siteMessage }
									onChange = { e => handleChangeSiteMessage(e) }
								/>
								<span className="placeholderMessage displayNone" id="cmp_vetonest.com_t6zZkOnoRQ" >Votre message</span>
							</Form.Item>	
                        </div>
						
                        <div className="col-md-12"
							style={{
								marginTop: '-5%',
							}}
						>
							<span 
								id="cmp_vetonest.com_777tFuJNvs" className="marginLeft20  colorGreen"
								style={{ display: showMessageResult }}
							>Message envoyé!</span>
							<Space>
								<Spin
									indicator={
										<LoadingOutlined
											style={{
												fontSize: 		20,
												marginRight: 	'10px',
												display:		loginSpin,
												color: 			'wheat',
											}}
											spin
										/>
									}
								/>
							</Space>
                           <button 
								className="send_btn"
								onClick={ e => handleClicSend() }
								disabled={isButtonDisabled}
								id="cmp_vetonest.com_OKXh27QMvJ"
							>
								Send
							</button>
                        </div>
                  </div>
                  </Form>
				  
				  
				  <span 
					className="displayNone contactCorrectError"
					id="cmp_vetonest.com_Af92YTwI3c"
				  >
					Please correct the errors before continuing.
				  </span>
				  <span 
					className="displayNone contactErrorsExistText"
					id="cmp_vetonest.com_9Hbdb9SqSl"
				  >
					Please correct the errors and try again.
				  </span>
				  <span 
					className="displayNone contactErrorOccured"
					id="cmp_vetonest.com_lMQqX2bptt"
				  >
					An error occured.
				  </span>
				  <span 
					className="displayNone contactThankYou"
					id="cmp_vetonest.com_VSsCK6o6zI"
				  >
					Thank you. We will contact you soon.
				  </span>
				  <span 
					className="displayNone contactEmailError"
					id="cmp_vetonest.com_GomedYOvSx"
				  >
					Your email is not correct.
				  </span>
				  <span 
					className="displayNone contactFullnameErrorText"
					id="cmp_vetonest.com_Q22eMGX3FE"
				  >
					Your name seems incomplete.
				  </span>
				  <span 
					className="displayNone contactPhoneNumberErrorText"
					id="cmp_vetonest.com_IL7GoLwYHA"
				  >
					Your phone number seems incorect.
				  </span>
				  <span 
					className="displayNone contactFormMessageErrorText"
					id="cmp_vetonest.com_bkUm4O12mL"
				  >
					Please add a few words to your message.
				  </span>
				  <span 
					className="displayNone contactFullnameErrorEmptyText"
					id="cmp_vetonest.com_Wra91PDYGf"
				  >
					Full name field is empty.
				  </span>
				  <span 
					className="displayNone contactEmailEmptyError"
					id="cmp_vetonest.com_xkbeNSuXC9"
				  >
					The email field is empty.
				  </span>
				  <span 
					className="displayNone contactErrorPhonenumberEmpty"
					id="cmp_vetonest.com_E5vIP2zkqU"
				  >
					Your phone number is empty.
				  </span>
				  <span 
					className="displayNone contactEmptyMessageError cmp_vetonest.com_bkUm4O12mL"
				  >
					Please add a few words to your message.
				  </span>

               </div>
               <div className="col-md-6">
                  <div className="map_main">
                     <div className="map-responsive">
						<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&amp;q=13371 229 Rue Saint Honoré+75001+Paris+France" width="100%" height="400" frameborder="0" style={{ border:0, width: '100%;'}}  allowfullscreen=""></iframe>
229 RUE SAINT-HONORE 75001 PARIS
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
		</>
	);
};

export default Contact;