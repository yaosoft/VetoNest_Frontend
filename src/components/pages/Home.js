import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

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

const Home = () => {
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
	async function handleClicSend (){		
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
			html: 		html,
			subject: 	'New message on cecilia-group.com',
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
	  <div  className="our_room">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="">
                     <h2>Des prises de rendez-vous en ligne rapide avec des vétérinaires de confiance</h2>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room1.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Cardiology equipment</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room2.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3>Dialysis chair</h3>
                     </div>
                  </div>
               </div>
               <div className="col-md-4 col-sm-6">
                  <div id="serv_hover"  className="room">
                     <div className="room_img">
                        <figure><img src="./img/room3.jpg" alt="#"/></figure>
                     </div>
                     <div className="bed_room">
                        <h3> AED defibrillator</h3>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
	  
	  <div  className="blog">
         <div className="container">
            <div className="row">
               <div className="col-md-12">
                  <div className="titlepage">
                     <h2>Import - Export</h2>
                     <p>How can we help you </p>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog1.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Import-export outsourcing</h3>
                        <p style={{ textAlign: "justify" }}>Sourcing products from around the world through our extensive network of manufacturers is our mission. We connect manufacturers with businesses that sell products to consumers. </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" href="#" to="/import-export"> Read More</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog2.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Supply Chain Logistics</h3>
                        <p style={{ textAlign: "justify" }}>We plan, implement and control the transportation and storage of your products. We manage the entire supply chain, from origin to consumption, based on your needs. </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" href="#" to="/import-export"> Read More</Link></p>
                     </div>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="blog_box">
                     <div className="blog_img">
                        <figure><img src="./img/blog3.jpg" alt="#"/></figure>
                     </div>
                     <div className="blog_room">
                        <h3>Consulting</h3>
                        <p style={{ textAlign: "justify" }}>We help companies navigate the complexities of international trade by providing assistance in areas such as compliance, logistics, and market research.  </p>
						<p>&nbsp;</p>
						<p><Link className="read_more" href="#" to="/import-export"> Read More</Link></p>
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

export default Home;
