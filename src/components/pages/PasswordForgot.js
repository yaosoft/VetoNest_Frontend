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

import Title from '../Title';
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
		setVerificationCode,
		setVerificationUserId,
		insertSpaceAtPosition,
		signUp_passwordErrorText,
		signUp_correctErrors,
		signUp_passwordEmpty,
		signUp_emailErrorText,
		signUp_emailEmpty,
		signUp_emailPlaceholder,
		signUp_passwordPlaceholder,
		signUp_btnSubmit,
		signIn_passwordForgot,
		signUp_codeIncorrect,
		signUp_codeCorrect,
		signUp_codeTitle,
		signUp_codeIntro,
		signUp_codeLabel,
		signUp_codeResend,
		signUp_termsUsage,
		getAContent,

	}	= useContext( SiteContext );

	// Autofill email
	const [ready, setReady] = useState(false);
	useEffect(() => {
		// for the autofill issue
		const id = setTimeout(() => setReady(true), 50);
		return () => clearTimeout(id);
	}, []);
	
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
	const handleChangePwForgotEmail = async ( e ) => {

		clearFormErrors();
		setPwForgotEmailError ( '' );
		await form.validateFields(); 
		
		const data = e.target.value;
		setPwForgotEmail( data );
		var pwForgotEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			pwForgotEmailErrorText = signUp_emailErrorText;

		setPwForgotEmailError ( pwForgotEmailErrorText );
		await form.validateFields(); 
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
			const errorMessage = signUp_emailEmpty;
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
	const [ userId, setUserId ] = useState( 'none' );
	const handleClickEmailValidation = async ( event ) => {

		// event.preventDefault();
		setPwForgotSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( signUp_correctErrors );
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

		const id = await checkEmail( checkEmailData );

		if( !id ){

			setFormError01( 'block' );	// display form error
			message.error( showAFormError( 'formError01' ) );	// display ant error
			document.getElementById( 'pwForgotEmailInput' ).focus();
			setPwForgotSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		setUserId( id );
		
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
			code  			: insertSpaceAtPosition ( genCode, 3 ),
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

		setVerificationCode( code );
		setVerificationUserId( userId );
		navigate( '/mot-de-passe-oublie/reset/' + code + '/' + userId );
	}

	// modal
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ displayCodeCorrect, setDisplayCodeCorrect ] = useState( 'none' );
	const [ displayCodeIncorrect, setDisplayCodeIncorrect ] = useState( 'none' );
	const [ displayCodeResend, setDisplayCodeResend ] = useState( 'block' );
	
	const [ maxCodeLength, setMaxCodeLength ] = useState( 6 );
	
	const handleCompletedCode = ( typedCode ) => {
// console.log( code + " --- " + typedCode );
		if( code != typedCode ){
				message.error( signUp_codeIncorrect );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
		}
		else{
			message.success( signUp_codeCorrect );
			setEmailVerificationResult( true );
			setDisplayCodeCorrect( 'block' );
			setDisplayCodeIncorrect( 'none' );
			setDisplayCodeResend( 'none' );
			// setTimeout( setIsModalOpen, 2000, false );
			setIsModalOpen(false);
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
				title			= { <p style={{ textAlign: 'center' }}>{signUp_codeTitle}</p> }
				closable		= {{ 'aria-label': 'Custom Close Button' }}
				open			= { isModalOpen }
				onOk			= { handleOk }
				onCancel		= { handleCancel }
				afterClose		= { modalClosed }
				footer			= {null}
				maskClosable	= {false} // This prevents closing on mask click
			>
    <div className="App">
		<span>{ signUp_codeIntro } { pwForgotEmail }.</span>
      <InputCode
        length={6}
        label={ signUp_codeLabel }
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
		<Title title = { signIn_passwordForgot } />
		<div className="afterSticky row">&nbsp;</div>
		<div className="login-form-bg h-100">
			
			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">

										<Form 
											form = {form}
											layout="vertical"
										>
										
										
										<div className="form-group">
										
											<Form.Item
												label={getAContent('cmp_vetonest.com_Er51Nm92Qa')}
												name="pwForgotEmail"
												rules={[
													{
														message: pwForgotEmailError,
														validator: (value) => {
															if (pwForgotEmailError) return Promise.reject(pwForgotEmailError);
															return Promise.resolve();
														},
													},
												]}
											>
												<Input
													id="pwForgotEmailInput"
													readOnly={!ready}
													name="login_email_fake"
													autoComplete="username"
													className="backgroundYellow rounded10 width100per100 borderNone height45"
													placeholder= { getAContent ( 'cmp_vetonest.com_Xq92La74Pm' ) } 
													onChange = { e => handleChangePwForgotEmail( e ) }
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
											</span>
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError02">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Please check your network and email address.
											</span>
										</div>
									</>
											<button 
												className	= "btn login-form__btn submit w-100 rounded10 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
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
											{ signUp_btnSubmit }
											</button> 
											<div className='row'>
												<div className='col-6'>
													<Link to='/connexion' className="text-primary">{ signUp_termsUsage }</Link>
												</div>
												<div className='col-md-6 textAlignRight'>
													<span id="cmp_vetonest.com_5aIWA6DiGq">Already have an account?</span>&nbsp;<Link to='/connexion' className="cmp_vetonest.com_adWeBARABI text-primary">connexion</Link>
												</div>
											</div>
										</Form>
									</div>
								</div>
						<div className ="displayNone" >
						<span 
								id = "cmp_vetonest.com_2NbkrLN1Nt"
								className ="signUp_codeIncorrect" 
							>
								Your code is not correct. Try again.
							</span>
							<span 
								id = "cmp_vetonest.com_MnveaCfq6X"
								className ="signUp_codeCorrect" 
							>
								Your code is correct.
							</span>
							<span 
								id = "cmp_vetonest.com_WCfOc17hne"
								className ="signUp_codeTitle" 
							>
								Email verification
							</span>
							<span
								id = "cmp_vetonest.com_Xzm3u4t1uE"
								className ="signUp_codeIntro" 
							>
							</span>
							<span
								id = "cmp_vetonest.com_Xzm3u4t1uE"
								className ="signUp_codeIntro" 
							>
							</span>
							<span
								id = "cmp_vetonest.com_Y9LbvGXMq2"
								className ="signIn_passwordForgot" 
							>
								Mot de passe oublié
							</span>
							<span 
								id = "cmp_vetonest.com_LXBYsFPl1b"
								className ="signUp_passwordPlaceholder" 
							>
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
								Term and usage
							</span>
								
							<span 
								className ="cmp_vetonest.com_GomedYOvSx signUp_emailErrorText" 
							>
								Your email is not correct
							</span>
							<span 
								className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
							>
								Email
							</span>
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
