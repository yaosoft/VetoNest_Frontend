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
			signInEmailErrorText = 'Your email is not correct'
		
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
			signInPasswordErrorText = 'Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.'

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
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';

		if( signInEmail == '' ){
			const errorMessage = 'Email is empty';
			document.getElementById( 'signInEmailInput' ).focus();
			// await setSignInEmailError( errorMessage );
			formHasEmpty = errorMessage
		}
		else if( signInPassword == '' ){
			const errorMessage = 'Password is empty';
			document.getElementById( 'signInPasswordInput' ).focus();
			// await setSignInPasswordError( errorMessage );
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

		event.preventDefault();
		setSignInSpin( 'block' );

		clearFormErrors(); // clear form error

		setSendingDisabled( true );

		// check form erors
		const formHasErrors = await checkFormErrors();
		if( formHasErrors ){
			message.error( 'Please correct the errors before continuing.' );
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
		
		// const logInData = {
			// password: 	signInPassword,
			// email: 		signInEmail,
			// userId: 	resp.userId
		// };

		// stop login button's spin
		setSignInSpin( 'none' );

		// Frontend login
// console.log( 'logInData', logInData );
		await logIn( resp );	
		
		languageSetup( resp.languageId ? resp.languageId : defaultLanguageId ); 
		
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
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>

            <Title title = { 'Connexion' } />

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
												initialValue  = ''
											>

												<Input 
													id="signInEmailInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your email" 
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
											>
												<Input 
													id="signInPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder="Enter your password" 
													type="password" 
													name="password"
													value={ signInPassword }
													onChange = { e => handleChangeSignInPassword(e)}
													
												/>
											</Form.Item>
											</div>
											
									<>

										<div style= {{ display: formError01 }}  className="row formError formError01">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Bad user name or password.
											</span> Please try another one.
										</div>
									</>
											<button 
												className	= "btn login-form__btn submit w-100 borderRadius18 backgroundGreen colorBlack sendBtn sendBtnHoverBlack"
												onClick	= {handleClickInscription}
												disabled = { sendingDisabled }
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
												Submit
											</button> 
											<div className='row'>
												<div className='col-6'>
													<Link to='/mot-de-passe-oublie' className="text-primary">Mot de passe oublié</Link>
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

export default SignIn;
