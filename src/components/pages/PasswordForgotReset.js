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

import InputCode from "../InputCode";

import  "./inputCode.css";

import Header from '../Header';
import Footer from '../Footer';
// import ModalEmailValidate from '../ModalEmailValidate';

import { Form, Input, Select } from 'antd';


const PasswordForgotReset = ( params ) => {

	const { isValidPassword }	= useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		generateRandomDigits,
		pwReset, 
		checkEmail, 
		sendEmail,
	}	= useContext( SiteContext );

	const [ loading, setLoading] = useState(false);

	const [ pwResetSpin, setPwResetSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	
	const [ emailVerificationResult, setEmailVerificationResult ] = useState( false );
	
	// password
	const [ pwResetPassword, setPwResetPassword ] = useState( '' );
	const [ pwResetPasswordError, setPwResetPasswordError ] = useState( '' );
	const handleChangePwResetPassword = ( e ) => {
		const data = e.target.value;
		setPwResetPassword( data );
		
		var pwResetPasswordErrorText = '';
		if( data && isValidPassword( data ) !== true )
			pwResetPasswordErrorText = 'Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.'

		setPwResetPasswordError( pwResetPasswordErrorText );
	}

	// password repeat
	const [ pwResetPasswordRepeat, setPwResetPasswordRepeat ] = useState( '' );
	const [ pwResetPasswordRepeatError, setPwResetPasswordRepeatError ] = useState( '' );
	const handleChangePwResetPasswordRepeat = ( e ) => {
		const data = e.target.value;
		setPwResetPasswordRepeat( data );
		
		var pwResetPasswordRepeatErrorText = '';
		if( data && isValidPasswordRepeat( data ) === false )
			pwResetPasswordRepeatErrorText = 'Password are different'
			setPwResetPasswordRepeatError( pwResetPasswordRepeatErrorText );
	}
	const isValidPasswordRepeat = ( pwResetPasswordRepeat ) => {
		if( pwResetPassword == pwResetPasswordRepeat )
			return true
		else
			return false
	}


	// check the form errors
	const checkFormErrors = async( ) => {
		else if( pwResetPasswordError != '' )
			errorsExist = true
		else if( pwResetPasswordRepeatError != '' )
			errorsExist = true

		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';

		if( pwResetPassword == '' ){
			const errorMessage = 'Password is empty';
			document.getElementById( 'pwResetPasswordInput' ).focus();
			// await setPwResetPasswordError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( pwResetPasswordRepeat == '' ){
			const errorMessage = 'Password repeat is empty';
			document.getElementById( 'pwResetPasswordRepeatInput' ).focus();
			// await setPwResetPasswordRepeatError( errorMessage );
			formHasEmpty = errorMessage
		}

		return formHasEmpty
	}
	
	// sign up
	const [ code, setCode ] = useState( '' );
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const handleClickRegistration = async ( event ) => {

		event.preventDefault();
		setPwResetSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( 'Please correct the errors before continuing.' );
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			return
		}
console.log( 'pwResetType: ' + pwResetType );
		// check if a pwReset type is selected
		if( !pwResetType ){
			message.error( 'Are you a pet\'s owner or a veto? Please select.' );
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			return	
		}
		
		// check form empty fields
		const formHasEmpty = await checkFormEmpty();
	
		if( formHasEmpty ){
			message.error( formHasEmpty );
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		// check if email already exists
		const checkEmailData = {
			email: pwResetEmail
		}

		const check = await checkEmail( checkEmailData );
		if( check ){
			
			setFormError02( 'block' );	// display form error
			message.error( showAFormError( 'formError02' ) );	// display ant error
			document.getElementById( 'pwResetEmailInput' ).focus();
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			return
		}

		// email verification
		// setOpenModalEmailValidate( true );
		const genCode = await generateRandomDigits( maxCodeLength );
		setCode( genCode );
// console.log( 'genCode: ' + genCode );
		const domainName 	= pwResetEmail.split( '@' )[1];
		const subject 		= 'Verify your email address for ' + siteName;
		const UserName 		= pwResetName;
		const code 			= genCode;
		
		const sendEmailData = {
			to_email 		: pwResetEmail,
			to_domain		: domainName,
			subject			: subject,
			userName    	: pwResetName,
			siteName    	: siteName,
			siteDomain  	: siteDomain,
			siteEmail		: siteEmail,
			siteUrl     	: siteUrl,
			code  			: genCode,
			emailTemplate	: 'email_verification'
		}
// console.log( 'sendEmailData', sendEmailData );

		const rep = await sendEmail( sendEmailData );	// send the code by email
		
		if( rep === false ){ // email address not found
			setFormError01( 'block' );	// display form error
			message.error( showAFormError( 'formError01' ) );	// display ant error
			setPwResetSpin( 'none' );
			document.getElementById( 'pwResetEmailInput' ).focus();
			setSendingDisabled( false );
			return;
		}
// console.log( 'Check email', rep );
		setPwResetSpin( 'none' );
		if( emailVerificationResult === true ) // email account already checked
			await pwReset( pwResetData )
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
	const pwResetData = {
		nom: 			pwResetName.trim(),
		prenom: 		pwResetFirstName.trim(),
		email: 			pwResetEmail,
		password: 		pwResetPassword,
		enabled:		1,
		profileTypeId:	pwResetType,
	}


	const navigate = useNavigate();
	const modalClosed = async () => {
		if( emailVerificationResult === false ){
			setSendingDisabled( false );
			return
		}
//setPwResetFirstNameError( "pwResetFirstNameErrorText" );

		
		const rep = await pwReset( pwResetData );

// console.log( 'pwReset rep: ' + rep );
		setPwResetSpin( 'none' );
		setSendingDisabled( false );
		if( rep === false ){
			message.error( 'Unable to create your account. Please retry later' )
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
    <div className="App">
		<span>We sent a verification code to { pwResetEmail }.</span>
      <InputCode
        length={6}
        label="Type your code"
        loading={loading}
        onComplete={code => {
          setLoading(true);
          setTimeout(() => setLoading(false), 10000);
		  handleCompletedCode( code )
        }}
      />
	<div className = "row" >
		<span className='text text-success' style={{display: displayCodeCorrect }} >Code correct!&nbsp;</span>
		<span className='text text-danger' style={{display: displayCodeIncorrect }} >Code incorrect!&nbsp;</span>
		<span className='text text-info' >Resend the code</span>
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
								
										<h3 className="text-center marginTop25px" >Inscription</h3>
										 <Form 
											className=""
											form = {form}
										 >
										<div className="row">
											<div className="col-6">
												<Form.Item
													name  = "pwResetTypeUser"
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
																name="pwResetTypeUser"
																id="pwResetType1"
																value={ 1 }
																onChange = { e => handleChangePwResetType(1) }
																style={{ outline: 'none' }}
															 />
														</div>
													</div>
												</Form.Item>
											</div>
											<div className="col-6">
												<Form.Item
													name  = "pwResetTypeVeto"
													className = "backgroundYellow borderRadius18 height40"
												>
													<div className='row'>
														<div className='col-4'>
															<Input
																className='width15 height15 marginTop10'
																type="checkbox" 
																name="pwResetTypeVeto"
																id="pwResetType2"
																value={ 2 }
																onChange = { e => handleChangePwResetType(2) }
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
													name  = "pwResetName"
													rules = {[
														{
															message: pwResetNameError,
															validator: ( value ) => {
																if ( pwResetNameError ) {
																	return Promise.reject( pwResetNameError );
																} 
																else {
																	return Promise.resolve();
																}
															}
														}
													]}
													initialValue  = { pwResetName }
												>
													<Input
														id="pwResetNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder="Name" 
														type="text" 
														name="pwResetName"
														value={ pwResetName }
														onChange = { e => handleChangePwResetName(e)}
													/>

												</Form.Item>
											</div>
											<div className="col-6">
												<Form.Item
													name  = "pwResetFirstName"
													rules = {[
														{
															message: pwResetFirstNameError,
															validator: ( value ) => {
																if ( pwResetFirstNameError ) {
																	return Promise.reject( pwResetFirstNameError );
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
														id="pwResetFirstNameInput"
														className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
														placeholder="First name" 
														type="text" 
														name="pwResetFirstName"
														value={ pwResetFirstName }
														onChange = { e => handleChangePwResetFirstName(e) }
													/>
												</Form.Item>
											</div>
										</div>
										<div className="form-group">
											<Form.Item
												name  = "pwResetEmail"
												rules = {[
													{
														message: pwResetEmailError,
														validator: ( value ) => {
															if ( pwResetEmailError ) {
																return Promise.reject( pwResetEmailError );
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
													id="pwResetEmailInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your email" 
													type="text" 
													name="pwResetmail"
													value={ pwResetEmail }
													onChange = { e => handleChangePwResetEmail(e)}
													
												/>
											</Form.Item>
											</div>
											<div className="form-group">
											<Form.Item
												name  = "password"
												rules = {[
													{
														message: pwResetPasswordError,
														validator: ( value ) => {
															if ( pwResetPasswordError ) {
																return Promise.reject( pwResetPasswordError );
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
													id="pwResetPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your password" 
													type="password" 
													name="password"
													value={ pwResetPassword }
													onChange = { e => handleChangePwResetPassword(e)}
													
												/>
											</Form.Item>
											</div>
											<div className="form-group">
											<Form.Item
												name  = "passwordRepeat"
												rules = {[
													{
														message: pwResetPasswordRepeatError,
														validator: ( value ) => {
															if ( pwResetPasswordRepeatError ) {
																return Promise.reject( pwResetPasswordRepeatError );
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
													id="pwResetPasswordRepeatInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Repeat your password" 
													type="password" 
													name="passwordRepeat"
													value={ pwResetPasswordRepeat }
													onChange = { e => handleChangePwResetPasswordRepeat(e)}
												/>
												
											</Form.Item>
											</div>
									<>
										
										<div style={{ display: formError01 }} className="row formError formError01">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ pwResetEmail }&nbsp;
											<span id="cmp_vetonest.com_WbKGYyavtn">
												not found.
											</span> Please try another one.
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError02">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ pwResetEmail }&nbsp;
											<span id="cmp_vetonest.com_071mCRIC59">
												already exist.
											</span> Please try another one.
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
																display:		pwResetSpin,
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
													<Link to='/connexion' className="text-primary">Terms and usage</Link>
												</div>
												<div className='col-6 textAlignRight'>
													Have account? <Link to='/connexion' className="text-primary">connexion</Link>
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

export default PasswordForgotReset;
