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
import InputCode from "../InputCode";

const PasswordForgot = ( params ) => {

	const { isValidPassword }	= useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		generateRandomDigits,
		sendEmail,
		checkEmail,
	}	= useContext( SiteContext );

	const [ loading, setLoading] = useState(false);

	const [ emailVerificationResult, setEmailVerificationResult ] = useState( false );

	const [ pwForgotSpin, setPwForgotSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	const { isAuthenticated, getUser }	= useContext( AuthContext );

	// pwForgot email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}
	const [ pwForgotEmail, setPwForgotEmail ] = useState( '' );
	const [ pwForgotEmailError, setPwForgotEmailError ] = useState( '' );
	const handleChangePwForgotEmail = ( e ) => {
		const data = e.target.value;
		setPwForgotEmail( data );

		var pwForgotEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			pwForgotEmailErrorText = 'Your email is not correct'
		
		setPwForgotEmailError ( pwForgotEmailErrorText );
	}

	// check the form errors
	const checkFormErrors = async( ) => {
		var errorsExist = false;
		if( pwForgotEmailError != '' )
			errorsExist = true

		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';

		if( pwForgotEmail == '' ){
			const errorMessage = 'Email is empty';
			document.getElementById( 'pwForgotEmailInput' ).focus();
			// await setSignInEmailError( errorMessage );
			formHasEmpty = errorMessage
		}

		return formHasEmpty
	}
	
	// sign up
	const [ code, setCode ] = useState( '' );
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const handleClickEmailValidation = async ( event ) => {

		event.preventDefault();
		setPwForgotSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( 'Please correct the errors before continuing.' );
			setPwForgotSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		// check form empty fields
		const formHasEmpty = await checkFormEmpty();
	
		if( formHasEmpty ){
			message.error( formHasEmpty );
			setPwForgotSpin( 'none' );
			setSendingDisabled( false );
			return
		}

		// check if email already exists
		const checkEmailData = {
			email: pwForgotEmail
		}

		const userId = await checkEmail( checkEmailData );
		if( !userId ){

			setFormError01( 'block' );	// display form error
			message.error( showAFormError( 'formError01' ) );	// display ant error
			document.getElementById( 'pwForgotEmailInput' ).focus();
			setPwForgotSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		
		// setOpenModalEmailValidate( true );
		const genCode = await generateRandomDigits( maxCodeLength );
		setCode( genCode );
// console.log( 'genCode: ' + genCode );
		const domainName 	= pwForgotEmail.split( '@' )[1];
		const subject 		= 'Reset Your Password for ' + siteName;
		const code 			= genCode;
		
		const sendEmailData = {
			to_email 		: pwForgotEmail,
			to_domain		: domainName,
			subject			: subject,
			userName    	: '',
			siteName    	: siteName,
			siteDomain  	: siteDomain,
			siteEmail		: siteEmail,
			siteUrl     	: siteUrl,
			code  			: genCode,
			emailTemplate	: 'password_forgot'
		}
// console.log( 'sendEmailData', sendEmailData );

		const rep = await sendEmail( sendEmailData );	// send the code by email
		
		if( rep === false ){ // email address not found
			setFormError02( 'block' );	// display form error
			message.error( showAFormError( 'formError02' ) );	// display ant error
			setPwForgotSpin( 'none' );
			window.document.getElementById( 'pwForgotEmailInput' ).focus();
			setSendingDisabled( false );
			return;
		}
// console.log( 'Check email', rep );
		setPwForgotSpin( 'none' );
		
		showModal()

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


	const navigate = useNavigate();
	const modalClosed = async () => {
		if( emailVerificationResult === false ){
			setSendingDisabled( false );
			return
		}

		navigate( '/mot-de-passe-oublie/reset' );
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
				setDisplayCodeInorrect( 'none' );
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
		<span>We sent a verification code to { pwForgotEmail }.</span>
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
								
										<h3 className="text-center marginTop25px" >Mot de passe oublié</h3>
										 <Form 
											className=""
											form = {form}
										 >
										
										
										<div className="form-group">
											<Form.Item
												name  = "pwForgotEmail"
												rules = {[
													{
														message: pwForgotEmailError,
														validator: ( value ) => {
															if ( pwForgotEmailError ) {
																return Promise.reject( pwForgotEmailError );
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
													id="pwForgotEmailInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your email" 
													type="text" 
													name="pwForgotmail"
													value={ pwForgotEmail }
													onChange = { e => handleChangePwForgotEmail(e)}
													
												/>
											</Form.Item>
											</div>
											
									<>
										
										<div style={{ display: formError01 }} className="row formError formError01">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ pwForgotEmail }&nbsp;
											<span id="cmp_vetonest.com_WbKGYyavtn">
												not found.
											</span> Please try another one.
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError02">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Email address
											</span> 
												&nbsp;{ pwForgotEmail }&nbsp;
											<span id="cmp_vetonest.com_071mCRIC59">
												already exist.
											</span> Please try another one.
										</div>
									</>
											<button 
												className	= "btn login-form__btn submit w-100 borderRadius18 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
												onClick	= {handleClickEmailValidation}
												disabled = { sendingDisabled }
											>
											
											<Space>
												<Spin
													indicator={
														<LoadingOutlined
															style={{
																fontSize: 		20,
																marginRight: 	'10px',
																display:		pwForgotSpin,
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
													Have account? <Link to='/connexion' className="text-primary">Envoyer</Link>
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

export default PasswordForgot;
