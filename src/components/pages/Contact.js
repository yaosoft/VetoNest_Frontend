import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined
} from '@ant-design/icons';
import { Form, Input, Select } from 'antd';

import Header from '../Header';
import Footer from '../Footer';

import { SiteContext } from '../../context/site';

const Contact = () => {
	const navigate = useNavigate();

	// Spiner
	const [ loginSpin, setLoginSpin ] = useState( 'none' );
	
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);

	// Email
	const [ email, setEmail ] = useState( '' );
	const [ emailDefault, setEmailDefault ] = useState( 'Email' );
	const [ emailError, setEmailError ] = useState( '' );
	const handleChangeEmail = ( e ) => {
		const data = e.target.value;
		setEmail( data );

		var emailErrorText = '';
		if( data && !isValidEmail( data ) )
			emailErrorText = 'Your email is not correct'
		
		setEmailError( emailErrorText );
	}
	
	// Full name
	const [fullname, setFullname] = useState( '' );
	const [ fullnameDefault, setFullnameDefault ] = useState( 'Full name' );
	const [ fullNameError, setFullNameError ] = useState( '' );
	const handleChangeFullname = ( e ) => {
		const data = e.target.value;
		setFullname( data );
		
		var fullNameErrorText = '';
		if( data.length && data.length < 4 )
			fullNameErrorText = 'Your name seems incomplete'

		setFullNameError( fullNameErrorText );
	}
	
	// Phone number
	const [ phoneNumber, setPhoneNumber ] = useState( '' );
	const handleChangePhoneNumber = ( e ) => {
		const data = e.target.value;
		setPhoneNumber( data );

		var phoneNumberErrorText = '';
		if( data.length < 7 )
			phoneNumberErrorText = 'Your phone number seems incomplete';
		else if( !isValidPhoneNumber( data ) )
			phoneNumberErrorText = 'Your phone number seems incorrect';
			
		setPhoneNumberError( phoneNumberErrorText );
	}

	
	// Site message
	const [ siteMessageError, setSiteMessageError]  = useState( '' );
	const [ siteMessage, setSiteMessage ] = useState( '' );
	const handleChangeSiteMessage = ( e ) => {
		const data = e.target.value;
		setSiteMessage( data );

		var siteMessageErrorText = '';
		if( !isValidSiteMessage( data ) )
			siteMessageErrorText = 'Please add a few words to your message';

		setSiteMessageError( siteMessageErrorText );
	}

	// Email validation
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}

	// Name validation
	const isValidFullName = ( fullname ) => {
		if( fullname.length && fullname.length < 5 ){
			return false;
		}
		return true;
	}
	
	// Phone validation
	const [phoneNumberError, setPhoneNumberError]  = useState( '' );
	const isValidPhoneNumber = (value) => {
		return (/^\d{7,}$/).test(value.replace(/[\s()+\-\.]|ext/gi, ''));
	}

	// Site message validation
	const isValidSiteMessage = ( siteMessage ) => {
		if( 
			siteMessage.length &&
			( siteMessage.length <= 15 ||
			siteMessage.split( ' ' ).length < 4 )
		)
			return false
		else
			return true
	}
	
	// check if there are form errors
	const checkTheForm = async( ) => {

		var errorsExist = false;

		// full name
		if( !fullname ){
			const nameErrorText = 'Your full name field is empty';
			setFullNameError( nameErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		// email
		if( !email ){
			const emailErrorText = 'The email field is empty';
			setEmailError( emailErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		// phone
		if( !phoneNumber ){
			const phoneNumberErrorText = 'Your phone number is empty.';
			setPhoneNumberError( phoneNumberErrorText );
			// errorsExist = true
			errorsExist = true
		}
		// site message
		if( !siteMessage ){
			const siteMessageErrorText = 'Please add a few words to your message.';
			setSiteMessageError( siteMessageErrorText );
			// setErrorsExist( true )
			errorsExist = true
		}
		
		return errorsExist
	}
	
	const { sendEmail }	= useContext( SiteContext );
	
	// Send contact form
	async function handleClicSend ( iWantAProfilePicture = 1 ){		
		// check the form
		const formError = await checkTheForm();	

		// if errors exist in the form
		if( formError === true ){
			const errorsExistText = 'Please correct the errors and try again.';
			message.error( errorsExistText );
			setLoginSpin( 'none' );
			return;
		}

		// check the recaptcha 
		// if( !recaptchaValue ){ // recaptcha
			// message.error( 'Please check the recaptcha verification' )
			// return;
		// }

		// send data
		setLoginSpin( 'block' ); // spin
		const html = 'Hello, <br><br>You have received a new message on your website cecilia-group.com,<br><br> Sender name: ' + fullname + '<br/><br>Sender email: ' + email + '<br/><br>Phone numbr: ' + phoneNumber + '<br/><br>Message: ' + siteMessage + '<br/><br/><br/><br/>Regards';
		const data = {
			subject: 	'New message on cecilia-group.com',
			html: 		html,
		}
// console.log( data )

		const rep = await sendEmail( data );
// console.log( rep );
		if( !rep ){
			message.error( 'An error occured' )
		}
		else{
			message.success( 'Thank you. We will contact you soon.' )
			setFullname( '' );
			setPhoneNumber( '' );
			setEmail( '' );
			setSiteMessage( '' );
			
			setIsButtonDisabled( true )
		}
		setLoginSpin( 'none' );
		
	}
	
	
	const [form] = Form.useForm();

	return (
		<>
			<Header />
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<div className="back_re">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="title">
                      <h2>Contact Us</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="contact">
         <div className="container">
            <div className="row">
               <div className="col-md-6">
					<Form 
						className="main_form"
						form = {form}
					>
                     <div className="row">
                        <div className="col-md-12 ">
							<Form.Item
								name  = "fullName"
								style = {{ marginBottom: '0px' }}
								rules = {[
									{
										message: fullNameError,
										validator: ( value ) => {
											if ( fullNameError ) {
												return Promise.reject( fullNameError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								/* initialValue  = { fullname ? fullname : fullnameDefault } */
							>
							   <input 
									className="contactus" 
									placeholder="Full name" 
									type="type" 
									name="Fullname" 
									value={ fullname }
									onChange = {  e => handleChangeFullname(e) }
							   /> 
							</Form.Item>
                        </div>
                        <div className="col-md-12">
							<Form.Item
								name  = "email"
								style = {{ marginBottom: '0px' }}
								rules = {[
									{
										message: emailError,
										validator: ( value ) => {
											if ( emailError ) {
												return Promise.reject( emailError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								/* initialValue  = { fullname ? fullname : fullnameDefault } */
							>
							   <input 
									className="contactus" 
									placeholder="Email" 
									type="type" 
									name="Email"
									value={ email }
									onChange = { e => handleChangeEmail(e)}
								/>
							</Form.Item>
                        </div>
                        <div className="col-md-12">
                            <Form.Item
								name  = "phoneNumber"
								style = {{ marginBottom: '0px', float: 'left' }}
								rules = {[
									{
										message: phoneNumberError,
										validator: ( value ) => {
											if ( phoneNumberError ) {
												return Promise.reject( phoneNumberError );
															
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
							>
								<input 
									className="contactus" 
									placeholder="Phone Number" 
									type="type" 
									name="Phone Number" 
									value={ phoneNumber }
									onChange = { e => handleChangePhoneNumber(e)}
								/>
							</Form.Item>							
                        </div>
                        <div className="col-md-12">
							<Form.Item
								name  = "siteMessage"
								style = {{ marginBottom: '0px' }}
								rules = {[
									{
										message: siteMessageError,
										validator: ( value ) => {
											if ( siteMessageError ) {
												return Promise.reject( siteMessageError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
							>
							   <textarea 
									className="textarea" 
									placeholder="Message" 
									type="type" 
									value={ siteMessage }
									onChange = { e => handleChangeSiteMessage(e) }
								/>
							</Form.Item>	
                        </div>
                        <div className="col-md-12">
							<Space>
								<Spin
									indicator={
										<LoadingOutlined
											style={{
												fontSize: 		20,
												marginRight: 	'10px',
												display:		loginSpin,
												color: 			'wheat',
											}}
											spin
										/>
									}
								/>
							</Space>
                           <button 
								className="send_btn"
								onClick={ e => handleClicSend() }
								disabled={isButtonDisabled}
							>
								Send
							</button>
                        </div>
					
                  </div>
                  </Form>
               </div>
               <div className="col-md-6">
                  <div className="map_main">
                     <div className="map-responsive">
						<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&amp;q=13371 400 Galloway St NE #537n+Washington+MD 20874+DC 20011+USA" width="600" height="400" frameborder="0" style={{ border:0, width: '100%;'}}  allowfullscreen=""></iframe>
						
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
			<Footer />
		</>
	);
};

export default Contact;