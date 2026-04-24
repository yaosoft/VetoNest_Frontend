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

const SignIn = ( params ) => {
	// context
	const { getReferrer }		= useContext( SiteContext );
	const { logIn, setUser, isValidPassword }	= useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		signIn,
		defaultLanguageId,
		siteLanguage,
		languageSetup,
		signIn_title,
		signUp_passwordErrorText,
		signUp_emailErrorText,
		signUp_emailEmpty,
		signUp_correctErrors,
		signUp_passwordEmpty,
		signUp_emailPlaceholder,
		signUp_passwordPlaceholder,
		signUp_btnSubmit,
		signIn_passwordForgot,
		getLanguagePreference,
		getAContent,
	}	= useContext( SiteContext );


	const [ loading, setLoading] = useState(false);

	const [ signInSpin, setSignInSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );

	// Autofill email
	const [ready, setReady] = useState(false);
	useEffect(() => {
		// for the autofill issue
		const id = setTimeout(() => setReady(true), 50);
		return () => clearTimeout(id);
	}, []);


	// signIn email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}
	const [ signInEmail, setSignInEmail ] = useState( '' );
	const [ signInEmailDefault, setEmailDefault ] = useState( 'Email' );
	const [ signInEmailError, setSignInEmailError ] = useState( '' );
	const handleChangeSignInEmail = async ( e ) => {
		clearFormErrors();
		setSignInEmailError ( '' );
		await form.validateFields(); 
		
		const data = e.target.value;
		setSignInEmail( data );
		var signInEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			signInEmailErrorText = getAContent( 'cmp_vetonest.com_Fm39Kd84Rw' )

		setSignInEmailError ( signInEmailErrorText );
		await form.validateFields(); 
	}
	
	// password
	const [ signInPassword, setSignInPassword ] = useState( '' );
	const [ signInPasswordError, setSignInPasswordError ] = useState( '' );
	const handleChangeSignInPassword = async ( e ) => {
		clearFormErrors();
		setSignInPasswordError ( '' );
		await form.validateFields(); 

		const data = e.target.value;
		setSignInPassword( data );
		
		var signInPasswordErrorText = '';
		if( data && isValidPassword( data ) !== true )
			signInPasswordErrorText = signUp_passwordErrorText;

		setSignInPasswordError( signInPasswordErrorText );
		await form.validateFields(); 
	}

	// check the form errors
	const checkFormErrors = async( ) => {
		var errorsExist = false;
		if( signInEmailError != '' )
			errorsExist = true
		else if( signInPasswordError != '' )
			errorsExist = true
		return errorsExist
	}

	// check the form empty fields	
	const checkFormEmpty = async( ) => {
		var formHasEmpty = false;
		const values = form.getFieldsValue();		
		if( !values.signInEmail ){
			const error = getAContent( 'cmp_vetonest.com_Em72Qa91Lp' );
			setSignInEmailError( error );
				formHasEmpty = true
		}
		if( !values.password ){
			const error = getAContent( 'cmp_vetonest.com_Kp83Wd61Lt' );
			setSignInPasswordError( error );
				formHasEmpty = true
		}
		if( formHasEmpty )
			form.validateFields(); 
				
		return formHasEmpty;
	}

	const navigate = useNavigate();

	// sign in
	const [ code, setCode ] = useState( '' );
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const handleClickInscription = async ( event ) => {

		// event.preventDefault();
		setSignInSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( signUp_correctErrors );
			setSignInSpin( 'none' );
			setSendingDisabled( false );
			return
		}

		// check form empty fields
// check if form has empty fields
		const formHasEmpty = await checkFormEmpty();
		if( formHasEmpty ){
			message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

			setSignInSpin( 'none' );
			setSendingDisabled( false );

			return
		}
		
		// login
		const values = form.getFieldsValue();
		const signInData = {
			password: 	values.password,
			email: 		values.signInEmail
		};
		
		const resp = await signIn( signInData );


		// Login error
		if( resp === false ){
			
			setFormError01( 'block' );	// display form error
			message.error( showAFormError( 'formError01' ) );	// display ant error
			document.getElementById( 'signInEmailInput' ).focus();
			setSignInSpin( 'none' );
			setSendingDisabled( false );
			
			return
		}

		// stop login button's spin
		setSignInSpin( 'none' );

		// Frontend login
		await logIn( resp );	

		// Set language and content
		if( resp.languageId )
			await languageSetup( resp.languageId );

		
		/**
		 * Determines the redirection path based on referrer and profile type.
		 * @param {string|null} referrer - The referrer URL
		 * @param {number} profileId - The ID of the profile type
		 * @returns {string} The final redirect path
		 */
		const getConsultationPath = (referrer, profileTypeId ) => {

		  // 1. Priority: If we have a referrer, use it immediately
		  if (referrer) return referrer;

		  // 2. Logic: Fallback to profile-specific paths
		  const paths = {
			1: '/consultation/creation',
			2: '/consultation/vet/list'
		  };

		  // Return the mapped path or a default home/dashboard path if ID is unknown
		  return paths[profileTypeId] || '/';
		};

		// Usage:
		const path = await getConsultationPath(getReferrer(), resp.profileTypeId);
	
		navigate( path );
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
	
	// form
	const [form] = Form.useForm();
	const location = useLocation();

	return (
		<>
		  <div className="sticky-stack">
			<Header />
			<Title title={getAContent( 'cmp_vetonest.com_OK6429mzTG' )} />
		  </div>

			
				<div className="container">
					<div className="row justify-content-center h-100">
						<div className="col-xl-6">
							<div className="">

										<Form
											form={form}
											key={location.pathname}
											layout="vertical"
										>
											<Form.Item
												label={getAContent('cmp_vetonest.com_Er51Nm92Qa')}
												name="signInEmail"
												rules={[
													{
														message: signInEmailError,
														validator: (value) => {
															if (signInEmailError) return Promise.reject(signInEmailError);
															return Promise.resolve();
														},
													},
												]}
											>
												<Input
													id="signInEmailInput"
													readOnly={!ready}
													name="login_email_fake"
													autoComplete="username"
													className="backgroundYellow rounded10 width100per100 borderNone height45"
													placeholder= { getAContent ( 'cmp_vetonest.com_Xq92La74Pm' ) } 
													onChange = { e => handleChangeSignInEmail( e ) }
												/> 
											</Form.Item>

											<Form.Item
												label={getAContent('cmp_vetonest.com_LXBYsFPl1b')}
												name="password"
												rules={[
													{
														message: signInPasswordError,
														validator: (value) => {
															if (signInPasswordError) return Promise.reject(signInPasswordError);
															return Promise.resolve();
														},
													},
												]}
											>
												<Input.Password
													id="signInPasswordInput"
													readOnly={!ready}
													name="login_password_fake"
													autoComplete="new-password"
													className="backgroundYellow rounded10 width100per100 borderNone height45"
													placeholder= { getAContent ( 'cmp_vetonest.com_Kp83Wd61Lt' ) } 
													onChange = { e => handleChangeSignInPassword( e ) }
												/>
											</Form.Item>
											<>
												<div style= {{ display: formError01 }}  className="row formError formError01">
													<span id="cmp_vetonest.com_C73EvuNXZA">
														Bad username or password.
													</span>&nbsp;
													<span id="cmp_vetonest.com_0lM8zJBsDN">
														Please try another one.
													</span>
												</div>
											</>
										
											<Form.Item style={{ marginTop: 24 }}>
												<Button
													type="primary"
													htmlType="submit"
													block
													className="login-form__btn rounded10 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
													onClick={handleClickInscription}
													disabled={sendingDisabled}
													style={{ height: '45px' }}
												>
													<Space>
														{signInSpin === 'block' && (
															<Spin
																indicator={
																	<LoadingOutlined
																		style={{
																			fontSize: 20,
																			color: 'wheat',
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
												<div className='col-6'>
													<Link to='/mot-de-passe-oublie' className="text-primary">{ signIn_passwordForgot }</Link>
												</div>
												<div className='col-6 textAlignRight'>
													<Link 
														to='/inscription' 
														className="text-primary"
														id = "cmp_vetonest.com_J50yit0tKU"
													>
														Create an account
													</Link>
												</div>
											</div>
											
										</Form>
									</div>
								</div>
							
					</div>
				</div>
			
			<div>&nbsp;</div>
			<div className ="displayNone" >
				<span 
					id = "cmp_vetonest.com_UcvWQuFUwO"
						className ="signUp_passwordErrorText" 
					>
						Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.
				</span>
				<span 
					className ="cmp_vetonest.com_GomedYOvSx signUp_emailErrorText" 
				>
					Your email is not correct
				</span>
				<span 
					id = "cmp_vetonest.com_EjMb0Ci9C6"
					className ="signUp_emailEmpty" 
				>
					L'email est vide.
				</span>
				<span 
					id = "cmp_vetonest.com_7cAD5u6fyj"
					className ="signUp_passwordEmpty" 
				>
					Password is empty.
				</span>
				<span 
					className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
				>
					Please correct the errors before continuing.
				</span>
				<span 
					className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
				>
					Email
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
					id = "cmp_vetonest.com_Y9LbvGXMq2"
					className ="signIn_passwordForgot" 
				>
					Mot de passe oublié
				</span>
				<span
					id = "cmp_vetonest.com_OK6429mzTG"
					className ="signIn_title" 
				>
					Connexion
				</span>

			</div>
			<Footer />
		</>
	);
};

export default SignIn;
