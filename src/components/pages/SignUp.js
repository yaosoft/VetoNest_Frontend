import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm  } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';

import { ExclamationCircleOutlined } from '@ant-design/icons';

import InputCode from "../InputCode";

import  "./inputCode.css";

import Header from '../Header';
import Footer from '../Footer';
// import ModalEmailValidate from '../ModalEmailValidate';

import { Form, Input, Select } from 'antd';

import Title from '../Title';

const SignUp = ( params ) => {

	const { isValidPassword }	= useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		siteLanguage,
		generateRandomDigits,
		insertSpaceAtPosition,
		signUp, 
		checkEmail, 
		sendEmail,
		signUp_nameErrorText,
		signUp_firstNameErrorText,
		signUp_emailErrorText,
		signUp_passwordErrorText,
		signUp_passwordRepeatErrorText,
		signUp_type1,
		signUp_type2,
		signUp_emailEmpty,
		signUp_passwordEmpty,
		signUp_passwordRepeatEmpty,
		signUp_correctErrors,
		signUp_selectTypeError,
		signUp_verifyEmailSubjet,
		signUp_firstNamePlaceholder,
		signUp_emailPlaceholder,
		signUp_passwordPlaceholder,
		signUp_passwordRepeatPlaceholder,
		signUp_namePlaceholder,
		signUp_formOption1ErrorText,
		signUp_formOption2ErrorText,
		signUp_codeTitle,
		signUp_codeCorrect,
		signUp_codeIncorrect,
		signUp_nameEmpty,
		signUp_codeLabel,
		signUp_codeIntro,
		signUp_codeResend,
		signUp_popConfirmVetTitle,
		signUp_popConfirmPetTitle,
		signUp_popConfirmVetDescription,
		signUp_popConfirmPetDescription,
		signUp_popConfirmYes,
		signUp_popConfirmNo,					
		signUp_popConfirmDeleteBtn,
		signUp_accountCreationSuccess,
		signUp_accountCreationFails,		
		signUp_title,			
		signUp_btnSubmit,
		signUp_termsUsage,
	}	= useContext( SiteContext );

	const [ loading, setLoading] = useState(false);

	const [ signUpSpin, setSignUpSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	
	const [ signUp_typeOption, setSignUp_typeOption ] = useState( false );
	
	const [ emailVerificationResult, setEmailVerificationResult ] = useState( false );
	// name
	const [ signUpName, setSignUpName ] = useState( '' );
	const [ signUpNameError, setSignUpNameError ] = useState( '' );
	const handleChangeSignUpName = ( e ) => {
		const data = e.target.value;
		setSignUpName( data );
		
		var signUpNameErrorText = '';
		const test = nameValidator( data )

		if( data && test === false )
			signUpNameErrorText = signUp_nameErrorText

// signUpNameErrorText = 'Your name seems incorect'
		setSignUpNameError( signUpNameErrorText );
	}

	// firstname
	const [ signUpFirstName, setSignUpFirstName ] = useState( '' );
	const [ signUpFirstNameError, setSignUpFirstNameError ] = useState( '' );
	const handleChangeSignUpFirstName = ( e ) => {
		const data = e.target.value;
		setSignUpFirstName( data );
		
		var signUpFirstNameErrorText = '';
		const test = nameValidator( data )
		if( data && test === false )
			signUpFirstNameErrorText = signUp_firstNameErrorText
		
// signUpFirstNameErrorText = 'Your firstname seems incorect'
		setSignUpFirstNameError( signUpFirstNameErrorText );
	}

	const nameValidator = ( name ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( name );
		return rep
	}

	// signUp email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}
	const [ signUpEmail, setSignUpEmail ] = useState( '' );
	const [ signUpEmailDefault, setEmailDefault ] = useState( 'Email' );
	const [ signUpEmailError, setSignUpEmailError ] = useState( '' );
	const handleChangeSignUpEmail = ( e ) => {
		const data = e.target.value;
		setSignUpEmail( data );

		var signUpEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			signUpEmailErrorText = signUp_emailErrorText

// signUpEmailErrorText = 'Your email is not correct'

		setSignUpEmailError ( signUpEmailErrorText );
	}
	
	// password
	const [ signUpPassword, setSignUpPassword ] = useState( '' );
	const [ signUpPasswordError, setSignUpPasswordError ] = useState( '' );
	const handleChangeSignUpPassword = ( e ) => {
		const data = e.target.value;
		setSignUpPassword( data );
		
		var signUpPasswordErrorText = '';
		if( data && isValidPassword( data ) !== true )
			signUpPasswordErrorText = signUp_passwordErrorText;

//signUpPasswordErrorText = 'Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.'

		setSignUpPasswordError( signUpPasswordErrorText );
	}

	// password repeat
	const [ signUpPasswordRepeat, setSignUpPasswordRepeat ] = useState( '' );
	const [ signUpPasswordRepeatError, setSignUpPasswordRepeatError ] = useState( '' );
	const handleChangeSignUpPasswordRepeat = ( e ) => {
		const data = e.target.value;
		setSignUpPasswordRepeat( data );
		
		var signUpPasswordRepeatErrorText = '';
		if( data && isValidPasswordRepeat( data ) === false )
			signUpPasswordRepeatErrorText = signUp_passwordRepeatErrorText;
// signUpPasswordRepeatErrorText = 'Password are different'
			setSignUpPasswordRepeatError( signUpPasswordRepeatErrorText );
	}
	const isValidPasswordRepeat = ( signUpPasswordRepeat ) => {
		if( signUpPassword == signUpPasswordRepeat )
			return true
		else
			return false
	}

	// type
	const [ signUpType, setSignUpType ] =  useState( '' ); // 1 for user, 2 for veto
	const [ signUp_formOption1Error, setSignUp_formOption1Error ] = useState( '' );
	const [ signUp_formOption2Error, setSignUp_formOption2Error ] = useState( '' );
	const confirm = e => {
		console.log(e);
	};
	const cancel = e => {
		console.log(e);
	};

	const handleChangeSignUpType = ( signUpType ) => {

		const elt01 = document.getElementById( 'signUpType' + signUpType ); // current elt
		const elt02 = signUpType == 1 ? document.getElementById( 'signUpType' + 2) :   document.getElementById( 'signUpType' + 1 );

		setSignUp_formOption1Error( '' );
		setSignUp_formOption2Error( '' );
	
		if( elt01.checked ){ // chackboxes inverser
			elt02.checked = false;
		}
		
		if( elt01.checked == true && signUpType == 1 ){
			// message.info( signUp_type1 );
			setSignUpType( 1 );
			showModalOptionType();
		}
		else if( elt01.checked == true && signUpType == 2 ){
			// message.info( signUp_type2 );
			setSignUpType( 2 );
			showModalOptionType();
		}
		else if( elt01.checked == false && elt02.checked == false ){
			setSignUpType( '' );
			setSignUp_formOption1Error( signUp_formOption1ErrorText );
			setSignUp_formOption2Error( signUp_formOption2ErrorText );
		}
	}

	useEffect(() => {
		form.validateFields();
	}, [ signUpType, siteLanguage ]);

	// check the form errors
	const checkFormErrors = async( ) => {
		var errorsExist = false;
		if( signUpNameError != '' )
			errorsExist = true
		if( signUpFirstNameError != '' )
			errorsExist = true
		if( signUpEmailError != '' )
			errorsExist = true
		else if( signUpPasswordError != '' )
			errorsExist = true
		else if( signUpPasswordRepeatError != '' )
			errorsExist = true

		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';

		if( signUpName == '' ){
			const errorMessage = signUp_nameEmpty;
// const errorMessage = 'Name is empty';
			document.getElementById( 'signUpNameInput' ).focus();
			await setSignUpNameError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpEmail == '' ){
			const errorMessage = signUp_emailEmpty;
// const errorMessage = 'Email is empty';
			document.getElementById( 'signUpEmailInput' ).focus();
			await setSignUpEmailError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpPassword == '' ){
			const errorMessage = signUp_passwordEmpty;
// const errorMessage = 'Password is empty';
			document.getElementById( 'signUpPasswordInput' ).focus();
			await setSignUpPasswordError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpPasswordRepeat == '' ){
// alert( signUp_passwordRepeatEmpty );			
			const errorMessage = signUp_passwordRepeatEmpty;
// const errorMessage = 'Password repeat is empty';
			document.getElementById( 'signUpPasswordRepeatInput' ).focus();
			await setSignUpPasswordRepeatError( errorMessage );
			formHasEmpty = errorMessage
		}

		return formHasEmpty
	}
	
	// sign up
	const [ code, setCode ] = useState( '' );
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const handleClickRegistration = async ( event ) => {

		setSignUpSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );
		
		// check if a signUp type is selected

		if( signUpType == '' ){
			setSignUp_formOption1Error( signUp_formOption1ErrorText );
			setSignUp_formOption2Error( signUp_formOption2ErrorText );
			
			message.error( signUp_selectTypeError );
// message.error( 'Are you a pet\'s owner or a veto? Please select.' );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return	
		}
		
		// check form erors
		const formHasErrors = await checkFormErrors();

		if( formHasErrors ){
			message.error( signUp_correctErrors );
// message.error( 'Please correct the errors before continuing.' );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return
		}
console.log( 'signUpType: ' + signUpType );
		
		
		// check form empty fields
		const formHasEmpty = await checkFormEmpty();
	
		if( formHasEmpty ){
			message.error( formHasEmpty );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		// check if email already exists
		const checkEmailData = {
			email: signUpEmail
		}

		const check = await checkEmail( checkEmailData );
		if( check ){
			setFormError02( 'block' );	// display form error
			message.error( showAFormError( 'formError02' ) );	// display ant error
			document.getElementById( 'signUpEmailInput' ).focus();
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return
		}

		// email verification
		// setOpenModalEmailValidate( true );

		const genCode = await generateRandomDigits( maxCodeLength );
		setCode( genCode );
// console.log( 'genCode: ' + genCode );
		const domainName 	= signUpEmail.split( '@' )[1];
		const subject 		= signUp_verifyEmailSubjet + siteName;
// const subject 		= 'Verify your email address for ' + siteName;
		const UserName 		= signUpName;
		const code 			= genCode;
		
		const sendEmailData = {
			to_email 		: signUpEmail,
			to_domain		: domainName,
			subject			: subject,
			userName    	: signUpName,
			siteName    	: siteName,
			siteDomain  	: siteDomain,
			siteEmail		: siteEmail,
			siteUrl     	: siteUrl,
			code  			: insertSpaceAtPosition ( genCode, 3 ),
			emailTemplate	: 'email_verification'
		}
// console.log( 'sendEmailData', sendEmailData );

		const rep = await sendEmail( sendEmailData );	// send the code by email
		
		if( rep === false ){ // email address not found
			setFormError01( 'block' );	// display form error
			message.error( showAFormError( 'formError01' ) );	// display ant error
			setSignUpSpin( 'none' );
			document.getElementById( 'signUpEmailInput' ).focus();
			setSendingDisabled( false );
			return;
		}
// console.log( 'Check email', rep );
		setSignUpSpin( 'none' );
		if( emailVerificationResult === true ) // email account already checked
			await signUp( signUpData )
		else									// check email account
			setIsModalOpen(true);
	}

	// display a form error
	const showAFormError = ( className ) => {
		const errorTxt = document.getElementsByClassName( className )[0].innerText;
		return errorTxt;
	}

	// clear form error
	const clearFormErrors = () => {
		setFormError01( 'none' );
		setFormError02( 'none' );
	}
	
	// signup
	const signUpData = {
		nom: 			signUpName.trim(),
		prenom: 		signUpFirstName.trim(),
		email: 			signUpEmail,
		password: 		signUpPassword,
		deactivated: 	false,
		profileTypeId:	signUpType,
	}


	const navigate = useNavigate();
	const modalClosed = async () => {
		if( emailVerificationResult === false ){
			setSendingDisabled( false );
			return
		}
//setSignUpFirstNameError( "signUpFirstNameErrorText" );

		
		const rep = await signUp( signUpData );

// console.log( 'signUp rep: ' + rep );
		setSignUpSpin( 'none' );
		setSendingDisabled( false );
		if( rep === false ){
			message.error( signUp_accountCreationFails )
		}
		else{
			message.success( signUp_accountCreationSuccess );
			
			navigate( '/connexion' )
		}
	}

	// modal
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ isModalOptionTypeOpen, setIsModalOptionTypeOpen ] = useState(false);
	
	const [ verificationCode, setVerificationCode ]  = useState( '' );
	const [ displayCodeCorrect, setDisplayCodeCorrect ] = useState( 'none' );
	const [ displayCodeIncorrect, setDisplayCodeIncorrect ] = useState( 'none' );
	const [ maxCodeLength, setMaxCodeLength ] = useState( 6 );
	
	const handleChangeCode = ( e ) => {
		const typedCode 	= e.target.value;
		const countLetters 	= typedCode.length
		if( countLetters > maxCodeLength )
			return

	setVerificationCode( typedCode );
// console.log( 'verificationCode - typedCode: ' + verificationCode + ' = ' + typedCode );
		if( countLetters == maxCodeLength ){
			if( code != typedCode ){
				message.error( 'Your code is not correct. Try again.' );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
			}
			else{
				message.success( 'Your code is correct' );
				setEmailVerificationResult( true );
				setDisplayCodeCorrect( 'block' );
				setTimeout( setIsModalOpen, 2000, false );
			}
		}
		else {
			setDisplayCodeIncorrect( 'none' );
		}
		
	}

	const handleCompletedCode = ( typedCode ) => {
		
		if( code != typedCode ){
				// message.error( { signUp_codeIncorrect } );
// message.error( 'Your code is not correct. Try again.' );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
		}
		else{
			message.success( signUp_codeCorrect );
// message.success( 'Your code is correct' );
			setDisplayCodeIncorrect( 'none' );
			setEmailVerificationResult( true );
			setDisplayCodeCorrect( 'block' );
			setTimeout( setIsModalOpen, 2000, false );
		}
	}
	
	// email code check modal
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	}
	
	// type checkbox Modal
	const showModalOptionType = () => {
		setIsModalOptionTypeOpen(true);
	};
	const modalOptionTypeHandleOk = () => {
		setIsModalOptionTypeOpen(false);
	};
	const modalOptionTypeHandleCancel = () => {
		document.getElementById( 'signUpType1' ).checked = false;
		document.getElementById( 'signUpType2' ).checked = false;
		setSignUpType( '' );
		setIsModalOptionTypeOpen(false); // close modal 
	}
	const modalOptionTypeClosed = () => {
		console.log( 'modalClosed' );
	}
	
	 // form
	 const [form] = Form.useForm();
	 
	 return (
		<>

			<Modal
				title={
				  <>
					<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} /> 
					<span>{ signUpType == 1 ? signUp_popConfirmPetTitle : signUp_popConfirmVetTitle }</span> 
				  </>
				}
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { isModalOptionTypeOpen }
				onOk		= { modalOptionTypeHandleOk }
				onCancel	= { () => modalOptionTypeHandleCancel( false ) }
				afterClose	= { modalOptionTypeClosed }
				okText		= { signUp_popConfirmYes }
				cancelText	= { signUp_popConfirmDeleteBtn }
			>
				<>
				{ signUpType == 1 ? signUp_popConfirmPetDescription : signUp_popConfirmVetDescription
				}
				</>
			</Modal>
			
			<Modal
				title			= { signUp_codeTitle }
				closable		= {{ 'aria-label': 'Custom Close Button' }}
				open			= { isModalOpen }
				onOk			= { console.log( 'ok' ) }
				onCancel		= { handleCancel }
				afterClose		= { modalClosed }
				footer			= { null }
				maskClosable	= { false } // This prevents closing on mask click
			>
	<ExclamationCircleOutlined />
    <div className="App">
		<span>{ signUp_codeIntro } </span>&nbsp;
		<span>{ signUpEmail }</span>
      <InputCode
        length={6}
        label={ signUp_codeLabel }
		// label="Type your code"
        loading={loading}
        onComplete={code => {
          setLoading(true);
          setTimeout(() => setLoading(false), 10000);
		  handleCompletedCode( code )
        }}
      />
	<div className = "row" >
		<span className='text text-success' style={{display: displayCodeCorrect }} >{ signUp_codeCorrect }</span>&nbsp;
		<span className='text text-danger' style={{display: displayCodeIncorrect }} >{ signUp_codeIncorrect }</span>&nbsp;
		<span className='text text-info' >{ signUp_codeResend }</span>
	</div>
	</div>		
					<br/><br/>
			</Modal>
		
		<Header />
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
            <Title title = { signUp_title } />
			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">

										 <Form 
											className=""
											form = {form}
										 >
										<div className="row">
											<div className="col-6">
												<Form.Item
													className = "backgroundYellow borderRadius18 height40"
													name  = "SignUpType1"
													rules = {[
														{
															message: signUp_formOption1Error,
															validator: ( value ) => {
																if ( signUpType != 1 || signUpType != 2  ) {
																	return Promise.reject( signUp_formOption1Error );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
												>
													<div className='row'>
														<div className='col-8 marginLeft20'>
															<i className='fa fa-paw marginTop10'></i> <span id = "cmp_vetonest.com_6avWG2reFU"			className ="signUp_formOption1"			>
																I have a pet
															</span>
														</div>
														<div className='col-3'>
															<Input
																className='width15 height15 marginTop10'
																type="checkbox" 
																name="signUpTypeUser"
																id="signUpType1"
																value={ 1 }
																onChange = { e => handleChangeSignUpType(1) }
																style={{ outline: 'none' }}
															 />
														</div>
													</div>
												</Form.Item>
											</div>
											<div className="col-6">
												<Form.Item
													className = "backgroundYellow borderRadius18 height40"
													name  = "SignUpType2"
													rules = {[
														{
															message: signUp_formOption2Error,
															validator: ( value ) => {
																if ( signUpType || 1 && signUpType != 2 ) {
																	return Promise.reject( signUp_formOption2Error );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
												>
													<div className='row'>
														<div className='col-4'>
															<Input
																className='width15 height15 marginTop10'
																type="checkbox" 
																name="signUpTypeVeto"
																id="signUpType2"
																value={ 2 }
																onChange = { e => handleChangeSignUpType(2) }
																style={{ outline: 'none' }}
															 />
														</div>
														<div className='col-8 marginTop10'>
															<i className='fa fa-user-md'></i> <span id = "cmp_vetonest.com_KqP3TSXZo3"			className ="signUp_formOption2"			>
																I'm a vet
															</span>
														</div>
													</div>
												</Form.Item>
											</div>
										</div>
										<div className="row">
											<div className="col-6">
												<Form.Item
													name  = "signUpName"
													rules = {[
														{
															message: signUpNameError,
															validator: ( value ) => {
																if ( signUpNameError ) {
																	return Promise.reject( signUpNameError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
													/* initialValue  = { signUpName } */
												>
													<Input
														id="signUpNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder={ signUp_namePlaceholder }
														type="text" 
														name="signUpName"
														value={ signUpName }
														onChange = { e => handleChangeSignUpName(e)}
													/>

												</Form.Item>
											</div>
											<div className="col-6">
												<Form.Item
													name  = "signUpFirstName"
													rules = {[
														{
															message: signUpFirstNameError,
															validator: ( value ) => {
																if ( signUpFirstNameError ) {
																	return Promise.reject( signUpFirstNameError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
													/* initialValue  = '' */
												>
													<Input 
														id="signUpFirstNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder={ signUp_firstNamePlaceholder }
														type="text" 
														name="signUpFirstName"
														value={ signUpFirstName }
														onChange = { e => handleChangeSignUpFirstName(e) }
													/>
												</Form.Item>
											</div>
										</div>
										<div className="form-group">
											<Form.Item
												name  = "signUpEmail"
												rules = {[
													{
														message: signUpEmailError,
														validator: ( value ) => {
															if ( signUpEmailError ) {
																return Promise.reject( signUpEmailError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												initialValue  = ''
											>

												<Input 
													id="signUpEmailInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_emailPlaceholder }
													type="text" 
													name="signUpmail"
													value={ signUpEmail }
													onChange = { e => handleChangeSignUpEmail(e)}
													
												/>
											</Form.Item>
											</div>
											<div className="form-group">
											<Form.Item
												name  = "password"
												rules = {[
													{
														message: signUpPasswordError,
														validator: ( value ) => {
															if ( signUpPasswordError ) {
																return Promise.reject( signUpPasswordError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												/* initialValue  = '' */
											>
												<Input 
													id="signUpPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_passwordPlaceholder }
													type="password" 
													name="password"
													value={ signUpPassword }
													onChange = { e => handleChangeSignUpPassword(e)}
													
												/>
											</Form.Item>
											</div>
											<div className="form-group">
											<Form.Item
												name  = "passwordRepeat"
												rules = {[
													{
														message: signUpPasswordRepeatError,
														validator: ( value ) => {
															if ( signUpPasswordRepeatError ) {
																return Promise.reject( signUpPasswordRepeatError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												initialValue  = ''
											>
												<Input 
													id="signUpPasswordRepeatInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_passwordRepeatPlaceholder }
													
													type="password" 
													name="passwordRepeat"
													value={ signUpPasswordRepeat }
													onChange = { e => handleChangeSignUpPasswordRepeat(e)}
												/>
												
											</Form.Item>
											</div>
									<>
									
										<div style={{ display: formError01 }} className="row formError formError01">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ signUpEmail }&nbsp;
											<span id="cmp_vetonest.com_WbKGYyavtn">
												not found or already exist.
											</span>&nbsp;
											<span id="cmp_vetonest.com_0lM8zJBsDN">
												Please try another one.
											</span>
											
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError02">
											<span className="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ signUpEmail }&nbsp;
											<span id="cmp_vetonest.com_071mCRIC59">
												already exist.
											</span>&nbsp;
											<span className="cmp_vetonest.com_0lM8zJBsDN">
												Please try another one.
											</span>
										</div>
									</>
											<button 
												className	= "btn login-form__btn submit w-100 borderRadius18 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
												onClick	= {handleClickRegistration}
												disabled = { sendingDisabled }
											>
											
											<Space>
												<Spin
													indicator={
														<LoadingOutlined
															style={{
																fontSize: 		20,
																marginRight: 	'10px',
																display:		signUpSpin,
																color: 			'wheat',
															}}
															spin
														/>
													}
												/>
											</Space>
												{ signUp_btnSubmit }
											</button> 
											<div className='row'>
												<div className='col-md-6 '>
													<Link to='/connexion' className="text-primary">{ signUp_termsUsage }</Link>
												</div>
												<div className='col-md-6 textAlignRight'>
													<span id="cmp_vetonest.com_5aIWA6DiGq">Already have an account?</span>&nbsp;<Link to='/connexion' className="cmp_vetonest.com_adWeBARABI text-primary">connexion</Link>
												</div>
											</div>
									<div className="displayNone">
											<span 
												id = "cmp_vetonest.com_2Mtv5nj9JA"
												className ="signUp_nameErrorText" 
											>
												Your name seems incorect
											</span>
											<span 
												id = "cmp_vetonest.com_P5crAMBBiW"
												className ="signUp_firstNameErrorText" 
											>signUp_firstNameErrorText
												Your first name seems incorect
											</span>
											<span 
												className ="cmp_vetonest.com_GomedYOvSx displayNone contactEmailError signUp_emailErrorText" 
											>
												Your email is not correct
											</span>
											<span 
												id = "cmp_vetonest.com_UcvWQuFUwO"
												className ="signUp_passwordErrorText" 
											>
												Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.
											</span>
											<span 
												id = "cmp_vetonest.com_BmYPSRuRRY"
												className ="signUp_passwordRepeatErrorText" 
											>
												Password are different.
											</span>
											<span 
												id = "cmp_vetonest.com_rvKgJE6SFO"
												className ="signUp_type1" 
											>
												Welcome pet's owner!
											</span>
											<span 
												id = "cmp_vetonest.com_YMSim4wo9H"
												className ="signUp_type2" 
											>
												Welcome veto!.
											</span>
											<span 
												id = "cmp_vetonest.com_rkqxGE9X35"
												className ="signUp_nameEmpty" 
											>
												Name is empty.
											</span>
											<span 
												id = "cmp_vetonest.com_7cAD5u6fyj"
												className ="signUp_passwordEmpty" 
											>
												Password is empty.
											</span>
											<span 
												id = "cmp_vetonest.com_kc3hRmQL1X"
												className ="signUp_passwordRepeatEmpty" 
											>
												Password repeat is empty.
											</span>
											<span 
												className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
											>
												Please correct the errors before continuing.
											</span>
											<span 
												id = "cmp_vetonest.com_D6PwmqV638"
												className ="signUp_selectTypeError" 
											>
												Are you a pet owner or a veto? Please select.
											</span>
											<span 
												className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
											>
												Email
											</span>
											<span 
												id = "cmp_vetonest.com_03jgEtJiVa"
												className ="signUp_firstNamePlaceholder" 
											>
												First name
											</span>
											<span 
												id = "cmp_vetonest.com_LXBYsFPl1b"
												className ="signUp_passwordPlaceholder" 
											>
												Password
											</span>
											<span 
												id = "cmp_vetonest.com_c6WAL3fo3k"
												className ="signUp_passwordRepeatPlaceholder" 
											>
												Password repeat
											</span>
											<span 
												id = "cmp_vetonest.com_wc4hVvXB3N"
												className ="signUp_namePlaceholder" 
											>
												Name
											</span>
											<span 
												id = "cmp_vetonest.com_9MNmuyNpbr"
												className ="signUp_formOption1ErrorText" 
											>
												Avez-vous un animal
											</span>
											<span 
												id = "cmp_vetonest.com_kxjUd4Mw9E"
												className ="signUp_formOption2ErrorText" 
											>
												Etes-vous vétérinaire
											</span>
											<span 
												id = "cmp_vetonest.com_EjMb0Ci9C6"
												className ="signUp_emailEmpty" 
											>
												L'email est vide.
											</span>
											<span 
												id = "cmp_vetonest.com_WCfOc17hne"
												className ="signUp_codeTitle" 
											>
												Email verification
											</span>
											<span 
												id = "cmp_vetonest.com_MnveaCfq6X"
												className ="signUp_codeCorrect" 
											>
												Your code is correct.
											</span>
											<span 
												id = "cmp_vetonest.com_2NbkrLN1Nt"
												className ="signUp_codeIncorrect" 
											>
												Your code is not correct. Try again.
											</span>
											<span
												id = "cmp_vetonest.com_Xzm3u4t1uE"
												className ="signUp_codeIntro" 
											>
												We sent a verification code to
											</span>
											<span
												id = "cmp_vetonest.com_PlOAvkzjQx"
												className ="signUp_codeResend" 
											>
												Resend the code
											</span>

											<span
												id = "cmp_vetonest.com_j8X3FXlK5V"
												className ="signUp_popConfirmVetTitle" 
											>
												Vétérinaire
											</span>
											<span
												id = "cmp_vetonest.com_qWX0vEtWrg"
												className ="signUp_popConfirmPetTitle" 
											>
												Proprietaire d'animaux
											</span>
											<span
												id = "cmp_vetonest.com_x6xvbNSS1j"
												className ="signUp_popConfirmVetDescription"
											>
												Vous créez un compte pour vétérinaires
											</span>	
											<span
												id = "cmp_vetonest.com_bDwPuqPxdf"
												className ="signUp_popConfirmPetDescription"
											>
												Vous créez un compte pour proptiétaire d' animaux
											</span>
											<span
												id = "cmp_vetonest.com_EtCHIic6Lw"
												className ="signUp_popConfirmYes" 
											>
												Yes
											</span>	
											<span
												id = "cmp_vetonest.com_UodRkh07Yn"
												className ="signUp_popConfirmNo" 
											>
												No
											</span>
											<span
												id = "cmp_vetonest.com_lw7g5pYJ4k"
												className ="signUp_popConfirmDeleteBtn" 
											>
												Cancel
											</span>
											<span
												id = "cmp_vetonest.com_SzWtUZzHos"
												className ="signUp_accountCreationSuccess" 
											>
												Votre compte a bien été créé
											</span>
											<span
												id = "cmp_vetonest.com_zj9WTU9X1r"
												className ="signUp_accountCreationFails" 
											>
												Une erreur s'est produite. Veuillez réessayer ultérieurement.
											</span>
											<span
												id = "cmp_vetonest.com_MsXXu6zXy2"
												className ="signUp_title" 
											>
												Inscription
											</span>
											<span
												id = "cmp_vetonest.com_f8Pqk3fJ2H"
												className ="signUp_btnSubmit" 
											>
												Submit
											</span>
											<span
												id = "cmp_vetonest.com_OFArwroEkk"
												className ="signUp_termsUsage" 
											>
												Terms of Use
											</span>
										</div>
								</Form>
							</div>
						</div>							
					</div>
				</div>
			</div>
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default SignUp;
