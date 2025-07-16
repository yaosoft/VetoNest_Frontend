import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';


import Header from '../Header';
import Footer from '../Footer';
// import ModalEmailValidate from '../ModalEmailValidate';

import { Form, Input, Select } from 'antd';


const SignUp = ( params ) => {

	const { isValidPassword }	= useContext( AuthContext );
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
	}	= useContext( SiteContext );


	const [ signUpSpin, setSignUpSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	
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
			signUpNameErrorText = 'Your name seems incorect'

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
			signUpFirstNameErrorText = 'Your firstname seems incorect'

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
			signUpEmailErrorText = 'Your email is not correct'
		
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
			signUpPasswordErrorText = 'Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.'

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
			signUpPasswordRepeatErrorText = 'Password are different'
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

	const handleChangeSignUpType = ( signUpType ) => {
// alert( signUpType );
		const elt01 = document.getElementById( 'signUpType' + signUpType ); // current elt
		const elt02 = signUpType == 1 ? document.getElementById( 'signUpType' + 2) :   document.getElementById( 'signUpType' + 1 );

		if( elt01.checked ){ // chackboxes inverser
			elt02.checked = false;
		}
		
		if( elt01.checked == true && signUpType == 1 ){
			message.info( 'Welcome pet\'s owner!' );
			setSignUpType( 1 );
		}
		else if( elt01.checked == true && signUpType == 2 ){
			message.info( 'Welcome veto!' )
			setSignUpType( 2 );
		}
		else if( elt01.checked == false && elt01.checked == false ){
			setSignUpType( '' );
		}
	}

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
			const errorMessage = 'Name is empty';
			document.getElementById( 'signUpNameInput' ).focus();
			// await setSignUpNameError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpEmail == '' ){
			const errorMessage = 'Email is empty';
			document.getElementById( 'signUpEmailInput' ).focus();
			// await setSignUpEmailError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpPassword == '' ){
			const errorMessage = 'Password is empty';
			document.getElementById( 'signUpPasswordInput' ).focus();
			// await setSignUpPasswordError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signUpPasswordRepeat == '' ){
			const errorMessage = 'Password repeat is empty';
			document.getElementById( 'signUpPasswordRepeatInput' ).focus();
			// await setSignUpPasswordRepeatError( errorMessage );
			formHasEmpty = errorMessage
		}

		return formHasEmpty
	}
	
	// sign up
	const [ code, setCode ] = useState( '' );
	const handleClickRegistration = async ( event ) => {
		
		event.preventDefault();
		setSignUpSpin( 'block' );

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( 'Please correct the errors before continuing.' );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return
		}
console.log( 'signUpType: ' + signUpType );
		// check if a signUp type is selected
		if( !signUpType ){
			message.error( 'Are you a pet\'s owner or a veto? Please select.' );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return	
		}
		
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
			message.error( 'Email already exist. Chose another one please.' );
			document.getElementById( 'signUpEmailInput' ).focus();
			setSendingDisabled( false );
			return
		}

		// email verification
		// setOpenModalEmailValidate( true );
		const genCode = await generateRandomDigits( maxCodeLength );
		setCode( genCode );
// console.log( 'genCode: ' + genCode );
		const domainName 	= signUpEmail.split( '@' )[1];
		const subject 		= 'Verify your email address for VetoNest';
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
			code  			: genCode,
			emailTemplate	: 'email_verification'
		}
// console.log( 'sendEmailData', sendEmailData );

		const rep = await sendEmail( sendEmailData );	// send the code by email
		
		if( rep === false ){
			message.error( 'Email address not found. Please try another one.' );
			setSignUpSpin( 'none' );
			document.getElementById( 'signUpEmailInput' ).focus();
			setSendingDisabled( true );
			return;
		}
// console.log( 'Check email', rep );
		setSignUpSpin( 'none' );
		setIsModalOpen(true);
	}

	// signup
	const navigate = useNavigate();
	const modalClosed = async () => {
		
		if( !emailVerificationResult )
			return
//setSignUpFirstNameError( "signUpFirstNameErrorText" );
		const signUpData = {
			nom: 		signUpName.trim(),
			prenom: 	signUpFirstName.trim(),
			email: 		signUpEmail,
			password: 	signUpPassword
		}
		
		const rep = await signUp( signUpData );

console.log( 'signUp rep: ' + rep );
		setSignUpSpin( 'none' );
		setSendingDisabled( false );
		if( rep === false ){
			message.error( 'Unable to vreate your account. Please retry later' )
		}
		else{
			message.success( 'Your account is created!' );
			navigate( '/connexion' )
		}
	}

	// modal
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ verificationCode, setVerificationCode ]  = useState( '' );
	const [ displayCodeCorrect, setDisplayCodeCorrect ] = useState( 'none' );
	const [ displayCodeIncorrect, setDisplayCodeIncorrect ] = useState( 'none' );
	const [ maxCodeLength, setMaxCodeLength ] = useState( 5 );
	const handleChangeCode = ( e ) => {
		const typedCode 			= e.target.value;
		const countLetters 	= typedCode.length
		if( countLetters > maxCodeLength )
			return

		setVerificationCode( typedCode );
console.log( 'verificationCode - typedCode: ' + verificationCode + ' = ' + typedCode );
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
				setIsModalOpen(false);
			}
		}
		else {
			setDisplayCodeIncorrect( 'none' );
		}
		
	}
	
	const showModal = () => {
		setIsModalOpen(true);
	};
	  
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	}
	 
	 // form
	 const [form] = Form.useForm();
	 return (
		<>
			<Modal
				title		= "Email verification"
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { isModalOpen }
				onOk		= { handleOk }
				onCancel	= { handleCancel }
				afterClose	= { modalClosed }
				footer		= {null}
			>
					<p>We sent a verification code to { signUpEmail }. <br/>Please type it here.</p>
					<input 
						value 		= { verificationCode }
						onChange 	= { e => handleChangeCode( e ) }
						type 		= "text" 
						className	= "backgroundYellow  borderRadius18 width100per100 borderNone height40 textAlignCenter"
						id			= "code"
						style		= {{ width: '96%' }}
					/>
					<div className = "row" >
						<div className = "col-6" >
					<span className='text text-success' style={{display: displayCodeCorrect }} >Code correct!</span>
					<span className='text text-danger' style={{display: displayCodeIncorrect }} >Code incorrect!</span>
						</div>
						<div className = "col-6" >
					<span className='text text-info' style={{ float:'right', marginRight: '15%' }}>Resend the code</span>
						</div>
					</div>
					<br/><br/>
			</Modal>
		
		<Header />
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>

			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">
								
										<h3 className="text-center">Sign up</h3><br/>
										 <Form 
											className=""
											form = {form}
										 >
										<div className="row">
											<div className="col-6">
												<Form.Item
													name  = "signUpTypeUser"
													className = "backgroundYellow borderRadius18 height40"
												>
													<div className='row'>
														<div className='col-8 marginLeft20'>
															<i className='fa fa-paw marginTop10'></i> I have a pet
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
													name  = "signUpTypeVeto"
													className = "backgroundYellow borderRadius18 height40"
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
															<i className='fa fa-user-md'></i> I'm a veto
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
													initialValue  = { signUpName }
												>
													<Input
														id="signUpNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder="Name" 
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
													initialValue  = ''
												>
													<Input 
														id="signUpFirstNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder="First name" 
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
													placeholder="Enter your email" 
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
												initialValue  = ''
											>
												<Input 
													id="signUpPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your password" 
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
													placeholder="Repeat your password" 
													type="password" 
													name="passwordRepeat"
													value={ signUpPasswordRepeat }
													onChange = { e => handleChangeSignUpPasswordRepeat(e)}
												/>
												
											</Form.Item>
											</div>
											<button 
												className	= "btn login-form__btn submit w-100 borderRadius18 backgroundBlack colorWhite sendBtn sendBtnHoverGreen"
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
												Submit
											</button> 
											<div className='row'>
												<div className='col-6'>
													<Link to='/Login' className="text-primary">Terms and usage</Link>
												</div>
												<div className='col-6 textAlignRight'>
													Have account? <Link to='/Login' className="text-primary">Login</Link>
												</div>
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
