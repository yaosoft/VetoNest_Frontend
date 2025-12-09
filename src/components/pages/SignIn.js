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
		getLanguagePreference
	}	= useContext( SiteContext );


	const [ loading, setLoading] = useState(false);

	const [ signInSpin, setSignInSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );

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
	const handleChangeSignInEmail = ( e ) => {
		const data = e.target.value;
		setSignInEmail( data );

		var signInEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			signInEmailErrorText = signUp_emailErrorText
		
		setSignInEmailError ( signInEmailErrorText );
	}
	
	// password
	const [ signInPassword, setSignInPassword ] = useState( '' );
	const [ signInPasswordError, setSignInPasswordError ] = useState( '' );
	const handleChangeSignInPassword = ( e ) => {
		const data = e.target.value;
		setSignInPassword( data );
		
		var signInPasswordErrorText = '';
		if( data && isValidPassword( data ) !== true )
			signInPasswordErrorText = signUp_passwordErrorText;

		setSignInPasswordError( signInPasswordErrorText );
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
	const checkFormEmpty = ( ) => {
		var formHasEmpty = '';

		if( signInEmail == '' ){
			const errorMessage = signUp_emailEmpty;
			document.getElementById( 'signInEmailInput' ).focus();
			setSignInEmailError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signInPassword == '' ){
			const errorMessage =  signUp_passwordEmpty;
			document.getElementById( 'signInPasswordInput' ).focus();
			setSignInPasswordError( errorMessage );
			formHasEmpty = errorMessage
		}

		return formHasEmpty
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
		const formHasEmpty = await checkFormEmpty();
	
		if( formHasEmpty ){
			message.error( formHasEmpty );
			setSignInSpin( 'none' );
			setSendingDisabled( false );
			return
		}
		
		// login
		const signInData = {
			password: 	signInPassword,
			email: 		signInEmail
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
console.log( '<<<<<<<<<<<<<<<<<<<<<<<<<<<< resp', resp );
		await logIn( resp );	

		// Set language and content
		if( resp.languageId )
			await languageSetup( resp.languageId );
		
//const data = {
//	userId: user.userId,
//}	
//const resp = await getLanguagePreference ( data );
		
//if( resp !== null )
				//	languageId = resp.id;	 

	//console.log( 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh favourite language id', resp  );
	//console.log( 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh languageId', languageId  );
	//console.log( 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh selectedLanguageId', selectedLanguageId  );

				// set user language
				//if( selectedLanguageId == languageId ){ // Selected language id == user's favourite language id
					// setSelectedLanguageId( languageId );			// update languagelist boxes
				//	await languageSetup( languageId ); 					// Update language flag
				//}
				//else{
				//	setSelectedLanguageId( selectedLanguageId );	// update languagelist boxes
				//	await languageSetup( selectedLanguageId ); 			// Update language flag
				//}


		// languageSetup( resp.languageId ? resp.languageId : defaultLanguageId ); 
		//setSelectedLanguageId( selectedLanguageId );
		
		// goto validation
		const path	= getReferrer() ? getReferrer() : '/profile';

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
	return (
		<>

		<Header />

            <Title title = { signIn_title } />
			<p>&nbsp;</p>
			<p>&nbsp;</p>
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
												name  = "signInEmail"
												rules = {[
													{
														message: signInEmailError,
														validator: ( value ) => {
															if ( signInEmailError ) {
																return Promise.reject( signInEmailError );
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
													id="signInEmailInput"
													className="backgroundYellow  rounded10 width100per100 borderNone height45" 
													placeholder={ signUp_emailPlaceholder }
													type="text" 
													name="signInmail"
													value={ signInEmail }
													onChange = { e => handleChangeSignInEmail(e)}
													
												/>
											</Form.Item>
											</div>
											<div className="form-group">
											<Form.Item
												name  = "password"
												rules = {[
													{
														message: signInPasswordError,
														validator: ( value ) => {
															if ( signInPasswordError ) {
																return Promise.reject( signInPasswordError );
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
													id="signInPasswordInput"
													className="backgroundYellow  rounded10 width100per100 borderNone height45" 
													placeholder={ signUp_passwordPlaceholder } 
													type="password" 
													name="password"
													value={ signInPassword }
													onChange = { e => handleChangeSignInPassword(e)}
													
												/>
											</Form.Item>
											</div>
											
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
											<button 
												className	= "btn login-form__btn submit w-100 rounded10 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
												onClick	= {handleClickInscription}
												disabled = { sendingDisabled }
												style={{ height: '45px' }}
											>
											
											<Space>
												<Spin
													indicator={
														<LoadingOutlined
															style={{
																fontSize: 		20,
																marginRight: 	'10px',
																display:		signInSpin,
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
