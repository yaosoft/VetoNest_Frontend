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

import Title from '../Title';
const PasswordForgotReset = ( params ) => {


	const { isValidPassword }	= useContext( AuthContext );
	const { 
		verificationCode,
		verificationUserId,
		setVerificationCode,
		setVerificationUserId,
		updatePassword,
		signUp_passwordErrorText,
		signUp_passwordRepeatErrorText,
		signUp_correctErrors,
		passwordForgot_updateSuccess,
		signUp_passwordPlaceholder,
		signUp_passwordRepeatPlaceholder,
		signUpPasswordRepeat,
		signUp_termsUsage,
		passwordForgotReset_title
		
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
			pwResetPasswordErrorText = signUp_passwordErrorText

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
			pwResetPasswordRepeatErrorText = signUp_passwordRepeatErrorText;
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
		var errorsExist = false;
		if( pwResetPasswordError != '' )
			errorsExist = true
		else if( pwResetPasswordRepeatError != '' )
			errorsExist = true

		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';

		if( pwResetPassword == '' ){
			document.getElementById( 'pwResetPasswordInput' ).focus();
			setFormError01( 'block'  );
			const error = showAFormError( 'formError01' ); // return error's tag inner text
			formHasEmpty = error
		}
		else if( pwResetPasswordRepeat == '' ){
			setFormError02( 'block'  );
			const error = showAFormError( 'formError02' ); // return error's tag inner text
			formHasEmpty = error
		}

		return formHasEmpty
	}
	
	// sign up
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const [ formError03, setFormError03 ] = useState( 'none' );
	const handleClickReset = async ( event ) => {

		event.preventDefault();
		setPwResetSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( signUp_correctErrors );
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

		// reset password
		const pwResetData = {
			userId: 	    verificationUserId,
			password: 		pwResetPassword,
		}
		const resp = await updatePassword( pwResetData );
		setPwResetSpin( 'none' );
		setSendingDisabled( false );
		
		if( !resp ){
			setFormError03( 'block' );
			message.error( showAFormError( formError03 ) )
		}
		else{									// check email account
			message.success( passwordForgot_updateSuccess );
// message.success( 'Votre mot de passe a été mis a jour.' );
			setVerificationCode( '' );
			setVerificationUserId( '' );
			navigate( '/connexion' )
		}
	}

	// display a form's error
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
	
	const [ urlCodeCheck, setUrlCodeCheck ] = useState( true );
	const [ userId, setUserId ] = useState( '' );
	useEffect( () => {
		// url code verification
		const currentLink = window.location.href;
		const urlParts = currentLink.split( '/' );
		const urlUserId = urlParts[ urlParts.length - 1 ];
		const urlCode = urlParts[ urlParts.length - 2 ];
// console.log( verificationCode + ' ' + urlCode + ' ' + verificationUserId + ' ' + urlUserId );
		const isOk =  ( verificationCode == urlCode.trim() ) && ( verificationUserId == urlUserId.trim() ) ? true : false;
		setUrlCodeCheck( isOk );

		if( !isOk ){
			// message.error( "Validation code not found" );
// console.log( 'Validation code not found' );
			navigate( '/mot-de-passe-oublie' )
			return;
		}

	}, [] );

	

	 
	 // form
	 const [form] = Form.useForm();
	 
	 return (
		<>
			
		
		<Header />
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<Title title = { passwordForgotReset_title } />
			<div className="login-form-bg h-100">
				<div className="container h-100">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="form-input-content">
										 <Form 
											className=""
											form = {form}
										 >

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
												/* initialValue  = '' */
											>
												<Input 
													id="pwResetPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_passwordPlaceholder }
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
													placeholder={ signUp_passwordRepeatPlaceholder 
													} 
													type="password" 
													name={ signUpPasswordRepeat }
													value={ pwResetPasswordRepeat }
													onChange = { e => handleChangePwResetPasswordRepeat(e)}
												/>
												
											</Form.Item>
											</div>
									<>
										<div style={{ display: formError01 }} className="row formError formError01">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Password is empty
											</span> 
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError02">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Password repeat is empty
											</span> 
										</div>
										<div style= {{ display: formError03 }}  className="row formError formError03">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Please check your network
											</span> 
										</div>
									</>
											<button 
												className	= "btn login-form__btn submit w-100 borderRadius18 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
												onClick	= {handleClickReset}
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
												<span
													id = "cmp_vetonest.com_f8Pqk3fJ2H"
													className ="signUp_btnSubmit" 
												>
													Submit
												</span>
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
							</div>
						</div>	
					</div>
				<div className="displayNone">	
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
								className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors"
							>
								Please correct the errors before continuing.
							</span>
							<span 
								id = "cmp_vetonest.com_cFjGEBvej6"
								className ="passwordForgot_updateSuccess"
							>
								Votre mot de passe a été mis a jour.
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
								id = "cmp_vetonest.com_JwgqTDF9g7"
								className ="passwordForgotReset_title" 
							>
								Reset your password
							</span>
							<span
								id = "cmp_vetonest.com_OFArwroEkk"
								className ="signUp_termsUsage" 
							>
								Terms and usage
							</span>
				</div>
				<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default PasswordForgotReset;
