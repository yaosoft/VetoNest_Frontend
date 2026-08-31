import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Radio, Alert  } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	ExclamationCircleOutlined,
	MailOutlined,
	ArrowLeftOutlined
} from '@ant-design/icons';

import ReCAPTCHA from "react-google-recaptcha";

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
		signUp, 
		checkEmail, 
		requestEmailVerification,
		confirmEmailVerification,
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
		getAContent,
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

	const [ready, setReady] = useState(false);

	// reCAPTCHA. Without a site key the widget is not rendered and the server
	// (which is the side that actually decides) logs that checks are disabled.
	const recaptchaRef = React.useRef(null);
	const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';
	const [recaptchaToken, setRecaptchaToken] = useState('');

	// Returned by the server once the mailed code has been confirmed; user/create
	// refuses to create the account without it.
	const [verificationToken, setVerificationToken] = useState('');
	const [codeChecking, setCodeChecking] = useState(false);

// Rate limiting state for resend code
const [resendCount, setResendCount] = useState(0);
const [resendCooldown, setResendCooldown] = useState(0);
const MAX_RESEND_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 60;

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

	const handleChangeSignUpType = ( e ) => {
		setSignUpType( e.target.value );
		showModalOptionType();
		
		setTypeError('');
		form.validateFields();
	}

	useEffect(() => {
		form.validateFields();
		
		// for the autofill issue
		const id = setTimeout(() => setReady(true), 50);
		return () => clearTimeout(id);
		
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
	
	// Ask the server for a verification code. The code is generated and stored
	// server-side and only ever reaches the user's mailbox, so nothing here knows
	// what it is. Returns true when the mail was accepted.
	const sendVerificationCode = async () => {
		const rep = await requestEmailVerification({
			email: signUpEmail,
			userName: signUpName,
			subject: signUp_verifyEmailSubjet + siteName,
			siteName: siteName,
			siteDomain: siteDomain,
			siteEmail: siteEmail,
			siteUrl: siteUrl,
			siteLocale: siteLanguage,
			recaptchaToken: recaptchaToken,
		});

		// A used token cannot be replayed, so clear the widget either way.
		recaptchaRef.current?.reset();
		setRecaptchaToken('');

		if (rep && rep.success)
			return true;

		if (rep && rep.status === 429)
			message.error("Too many code requests. Please try again later.");
		else if (rep && rep.status === 403)
			message.error("Captcha verification failed. Please try again.");
		else
			message.error(signUp_accountCreationFails);

		return false;
	}

	// Resend verification code with rate limiting
	const handleResendCode = async () => {
		if (!signUpEmail) return;

		// Check if user has exceeded max resend attempts
		if (resendCount >= MAX_RESEND_ATTEMPTS) {
			message.error("You have reached the maximum number of code requests. Please try again later.");
			return;
		}

		// Check cooldown
		if (resendCooldown > 0) {
			message.error(`Please wait ${resendCooldown} seconds before requesting another code.`);
			return;
		}

		setDisplayCodeIncorrect('none');
		setDisplayCodeCorrect('none');
		
		// Increment resend count
		setResendCount(prev => prev + 1);
		
		// Start cooldown
		setResendCooldown(COOLDOWN_SECONDS);
		const interval = setInterval(() => {
			setResendCooldown(prev => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		
		if (await sendVerificationCode())
			message.success("Verification code resent!");
	};
	
	// sign up
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
			setTypeError( getAContent( 'cmp_vetonest.com_Qm84Lp72Xs' ) );
			form.validateFields();
			
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
		// Check the actual response structure
		if (check && check.available === true) {
			// This means email is available - NO ERROR
			console.log('Email is available');
		} else if (check && check.exists === true) {
			// This means email exists - SHOW ERROR
			setFormError02('block');
			message.error(showAFormError('formError02'));
			document.getElementById('signUpEmailInput').focus();
			setSignUpSpin('none');
			setSendingDisabled(false);
			return;
		} else if (check === true) {
			// Old logic - email exists
			setFormError02('block');
			message.error(showAFormError('formError02'));
			document.getElementById('signUpEmailInput').focus();
			setSignUpSpin('none');
			setSendingDisabled(false);
			return;
		}

		// email verification
		// setOpenModalEmailValidate( true );

		if( recaptchaSiteKey && !recaptchaToken ){
			message.error( "Please complete the captcha before continuing." );
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return;
		}

		const codeSent = await sendVerificationCode();

		if( !codeSent ){
			setSignUpSpin( 'none' );
			setSendingDisabled( false );
			return;
		}

		setSignUpSpin( 'none' );
		setIsModalOpen( true );	// ask for the code that was just mailed
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

		const rep = await signUp( { ...signUpData, verificationToken } );

		setSignUpSpin( 'none' );
		setSendingDisabled( false );
		
		if( !rep ){
			message.error( signUp_accountCreationFails );
		}
		else{
			message.success( signUp_accountCreationSuccess );
			
			// Redirect to login page after successful account creation
			navigate( '/connexion' );
		}
	}

	// verification code modal
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

		// Only the server knows the code, so a full-length entry is handed to
		// handleCompletedCode to be checked there.
		if( countLetters == maxCodeLength )
			handleCompletedCode( typedCode );
		else
			setDisplayCodeIncorrect( 'none' );
	}

	const handleCompletedCode = async ( typedCode ) => {
		if( codeChecking )
			return;

		setCodeChecking( true );

		// The server holds the code; this is the only place it is checked.
		const check = await confirmEmailVerification( {
			email: signUpEmail,
			code: typedCode,
		} );

		if( !check || !check.success ){
			setCodeChecking( false );
			setDisplayCodeCorrect( 'none' );
			setDisplayCodeIncorrect( 'block' );
			setEmailVerificationResult( false );

			if( check && check.status === 429 )
				message.error( "Too many attempts. Please request a new code." );
			else
				message.error( signUp_codeIncorrect );

			return;
		}

		message.success( signUp_codeCorrect );
		setDisplayCodeIncorrect( 'none' );
		setEmailVerificationResult( true );
		setDisplayCodeCorrect( 'block' );
		setVerificationToken( check.verificationToken );

		// Create the account. The token is passed straight from the response
		// because the state set just above is not visible in this closure yet.
		setSignUpSpin( 'block' );
		const rep = await signUp( { ...signUpData, verificationToken: check.verificationToken } );
		setSignUpSpin( 'none' );
		setCodeChecking( false );

		if( !rep ){
			message.error( signUp_accountCreationFails );
			return;
		}

		message.success( signUp_accountCreationSuccess );

		// Close modal and redirect to login page
		setTimeout( () => {
			setIsModalOpen( false );
			navigate( '/connexion' );
		}, 1500 );
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
		setSignUpType( '' );
		form.setFieldsValue({ AccountType: null });
		setIsModalOptionTypeOpen(false); // close modal 
	}
	const modalOptionTypeClosed = () => {
		console.log( 'modalClosed' );
	}

	// typee
	const [ type, setType ] = useState( '' ); // 1 for male, 2 for female
	const [ typeError, setTypeError ] 	= useState( '' );
	
	const handleChangeType = (e) => {
		const typeId = e.target.value;
		setType( typeId );
		setTypeError( '' );
	}

	 // form
	 const [form] = Form.useForm();
	 const location = useLocation();
	 
	 return (
		<>
			{ /* Modal account type confirmatonion */ }
			<Modal
				title={
					<p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
						<span
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 22,
								height: 22,
								borderRadius: '50%',
								backgroundColor: '#FFDE59',
								marginRight: 8,
							}}
						>
						{signUpType == 1
						? <i
								className="fa fa-paw"
								style={{
									fontSize: 14,
									color: '#000',
								}}
							/>
						:
						<i
								className="fa fa-user-md"
								style={{
									fontSize: 14,
									color: '#000',
								}}
							/>
						}
						</span>
						<span>
							{signUpType == 1
								? signUp_popConfirmPetTitle
								: signUp_popConfirmVetTitle}
						</span>
					</p>
				}
				closable={{ 'aria-label': 'Custom Close Button' }}
				open={isModalOptionTypeOpen}
				onOk={modalOptionTypeHandleOk}
				onCancel={() => modalOptionTypeHandleCancel(false)}
				afterClose={modalOptionTypeClosed}
				okText={signUp_popConfirmYes}
				cancelText={signUp_popConfirmDeleteBtn}
			>
				{signUpType == 1
					? signUp_popConfirmPetDescription
					: signUp_popConfirmVetDescription}
			</Modal>
			
			{ /* Modal signup code verification */ }
			{/* Modal signup code verification - UPDATED STYLE */}
			<Modal
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				width={450}
				maskClosable={false}
				closable={true}
				centered
				styles={{
					body: {
						padding: '24px',
						background: 'transparent'
					},
					content: {
						background: '#fff',
						borderRadius: '16px',
						boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
					}
				}}
			>
				<div style={{ textAlign: 'center' }}>
					<div style={{
						width: 56,
						height: 56,
						borderRadius: '50%',
						backgroundColor: '#FFDE59',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 16
					}}>
						<MailOutlined style={{ fontSize: 28, color: '#000' }} />
					</div>
					
					<h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 600 }}>
						{signUp_codeTitle || "Email Verification"}
					</h3>
					
					<p style={{ margin: '0 0 24px 0', color: '#666', fontSize: 14 }}>
						{signUp_codeIntro || "We've sent a verification code to"}
						<br />
						<strong style={{ color: '#000', fontSize: 15 }}>{signUpEmail}</strong>
					</p>

					<InputCode
						length={6}
						label={signUp_codeLabel || "Enter verification code"}
						loading={loading}
						onComplete={handleCompletedCode}
						autoFocus
					/>

					{displayCodeCorrect === 'block' && (
						<Alert
							message={signUp_codeCorrect || "Code verified successfully!"}
							type="success"
							showIcon
							style={{ marginTop: 16, textAlign: 'left' }}
						/>
					)}
					
					{displayCodeIncorrect === 'block' && (
						<Alert
							message={signUp_codeIncorrect || "Invalid verification code"}
							type="error"
							showIcon
							style={{ marginTop: 16, textAlign: 'left' }}
						/>
					)}
					
					<div style={{ marginTop: 24 }}>
						<span style={{ color: '#666', marginRight: 8 }}>
							{getAContent( 'cmp_vetonest.com_bDwPuqPxdf' ) || signUp_codeResend}
						</span>
						 <Button
							type="default"
							htmlType="submit"
							block
							className="login-form__btn rounded10"
							onClick={handleClickRegistration}
							disabled={sendingDisabled}
							style={{
								height: '45px',
								backgroundColor: '#000000',
								borderColor: '#000000',
								color: '#ffffff'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = '#333333';
								e.currentTarget.style.borderColor = '#333333';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = '#000000';
								e.currentTarget.style.borderColor = '#000000';
							}}
						>
							<Space>
								{signUpSpin === 'block' && (
									<Spin
										indicator={
											<LoadingOutlined
												style={{
													fontSize: 20,
													color: '#ffffff',
												}}
												spin
											/>
										}
									/>
								)}
								{signUp_btnSubmit}
							</Space>
						</Button>
					</div>
				</div>
			</Modal>
		
		  <div className="sticky-stack">
			<Header />
			<Title title={getAContent( 'cmp_vetonest.com_bL1MO9LnVv' )} />
		  </div>
           
			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">
								<Form
									form={form}
									key={location.pathname}
									layout="vertical"
								>
										<div className="">
												<Form.Item
													label={getAContent('cmp_vetonest.com_Ra83Km91Qw')}
													name="AccountType"
													rules={[
														{
															message: typeError,
															validator: (value) => {
																if (typeError) return Promise.reject(typeError);
																return Promise.resolve();
															},
														},
													]}
												>
													<Radio.Group
														className="w-100"
													>
														<div className="row g-2">
															<div className="col-6">
																<div className="radio-tile backgroundYellow rounded10 height40 alignheckbox01 ">
																	<Radio 
																		name="animal"
																		value={1} 
																		className="checkbox-like-radio"
																		onChange={ (e) => handleChangeSignUpType( e ) }
																	>
																		<i className="fa fa-paw"></i>&nbsp;
																		{getAContent('cmp_vetonest.com_6avWG2reFU')}
																	</Radio>
																</div>
															</div>

															<div className="col-6">
																<div className="radio-tile backgroundYellow rounded10 height40 alignheckbox01 ">
																	<Radio 
																		name="veterinaire"
																		value={2} 
																		className="checkbox-like-radio"
																		onChange={ (e) => handleChangeSignUpType( e ) }
																	>
																		<i className="fa fa-user-md"></i>&nbsp;
																		{getAContent('cmp_vetonest.com_KqP3TSXZo3')}
																	</Radio>
																</div>
															</div>
														</div>
													</Radio.Group>

												</Form.Item>
										</div>
										<div className="row">
											<div className="col-6">
												<Form.Item
													label= { getAContent( 'cmp_vetonest.com_wc4hVvXB3N' ) }
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
														className="backgroundYellow  rounded10 width100per100 borderNone height45" 
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
													label = { getAContent( 'cmp_vetonest.com_03jgEtJiVa' ) }
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
														className="backgroundYellow  rounded10 width100per100 borderNone height45" 
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
												label={getAContent('cmp_vetonest.com_Er51Nm92Qa')}
												name="signInEmail"
												rules={[
													{
														message: signUpEmailError,
														validator: (value) => {
															if (signUpEmailError) return Promise.reject(signUpEmailError);
															return Promise.resolve();
														},
													},
												]}
											>
												<Input
													id="signUpEmailInput"
													readOnly={!ready}
													name="login_email_fake"
													autoComplete="username"
													className="backgroundYellow rounded10 width100per100 borderNone height45"
													placeholder= { getAContent ( 'cmp_vetonest.com_Xq92La74Pm' ) } 
													onChange = { e => handleChangeSignUpEmail( e ) }
												/> 
											</Form.Item>
											</div>
											<div className="row">
												<div className="col-6">
													<Form.Item
														label={getAContent('cmp_vetonest.com_LXBYsFPl1b')}
														name="password"
														rules={[
															{
																message: signUpPasswordError,
																validator: () => {
																	if (signUpPasswordError) {
																		return Promise.reject(signUpPasswordError);
																	}
																	return Promise.resolve();
																},
															},
														]}
													>
														<Input.Password
															id="signUpPasswordInput"
															readOnly={!ready}
															name="login_password_fake"
															autoComplete="new-password"
															className="backgroundYellow rounded10 width100per100 borderNone height45"
															placeholder={getAContent('cmp_vetonest.com_Kp83Wd61Lt')}
															onChange={(e) => handleChangeSignUpPassword(e)}
														/>
													</Form.Item>
												</div>

												<div className="col-6">
													<Form.Item
														name="passwordRepeat"
														label={getAContent('cmp_vetonest.com_Tp72Lm84Qs')}
														rules={[
															{
																message: signUpPasswordRepeatError,
																validator: () => {
																	if (signUpPasswordRepeatError) {
																		return Promise.reject(signUpPasswordRepeatError);
																	}
																	return Promise.resolve();
																},
															},
														]}
													>
														<Input.Password
															id="signUpPasswordRepeatInput"
															className="backgroundYellow rounded10 width100per100 borderNone height45"
															placeholder={getAContent('cmp_vetonest.com_Bm91Qx63Kr')}
															name="passwordRepeat"
															value={signUpPasswordRepeat}
															onChange={(e) => handleChangeSignUpPasswordRepeat(e)}
														/>
													</Form.Item>
												</div>
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
											{ recaptchaSiteKey && (
												<Form.Item style={{ marginTop: 24 }}>
													<ReCAPTCHA
														ref={ recaptchaRef }
														sitekey={ recaptchaSiteKey }
														hl={ siteLanguage }
														onChange={ ( token ) => setRecaptchaToken( token || '' ) }
														onExpired={ () => setRecaptchaToken( '' ) }
													/>
												</Form.Item>
											) }

											<Form.Item style={{ marginTop: 24 }}>
												<Button
													type="primary"
													htmlType="submit"
													block
													size="large"
													className="login-form__btn rounded10"
													onClick={handleClickRegistration}
													disabled={sendingDisabled}
													style={{
														height: '45px',
														backgroundColor: '#000000',
														borderColor: '#000000',
														color: '#ffffff'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = '#333333';
														e.currentTarget.style.borderColor = '#333333';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = '#000000';
														e.currentTarget.style.borderColor = '#000000';
													}}
												>
													<Space>
														{signUpSpin === 'block' && (
															<Spin
																indicator={
																	<LoadingOutlined
																		style={{
																			fontSize: 20,
																			color: '#ffffff',
																		}}
																		spin
																	/>
																}
															/>
														)}
														{signUp_btnSubmit}
													</Space>
												</Button>
											</Form.Item>
											<div className='row'>
												<div className='col-md-6 '>
													<Link to='/vet-usage' className="text-primary">{ signUp_termsUsage }</Link>
												</div>
												<div className='col-md-6 textAlignRight'>
													<span id="cmp_vetonest.com_5aIWA6DiGq">Already have an account?</span>&nbsp;<Link to='/connexion' className="cmp_vetonest.com_adWeBARABI text-primary">connexion</Link>
												</div>
											</div>
									
								</Form>
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
											>
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