import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Input, Select } from 'antd';
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

const PaymentMethodPaypal = ( params ) => {
	
	const { 
		userId,
	} = useContext( AuthContext );

	const { 
		siteEmail,
		checkEmail,
		signUp_emailErrorText,
		signUp_emailEmpty,
		signUp_emailPlaceholder,
		signUp_correctErrors,
		userPaymentMethods,
		userPaymentMethodEdit,
		isNew, 
		modalPaymentMethodPaypalOpen,
		setModalPaymentMethodPaypalOpen,
		selectedPaymentMethod,
	} = useContext( SiteContext );

	// email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}
	const [ paypalEmail, setPaypalEmail ] = useState( '' );
	const [ signUpEmailDefault, setEmailDefault ] = useState( 'Email' );
	const [ paypalEmailError, setPaypalEmailError ] = useState( '' );
	const handleChangePaypalEmail = ( e ) => {

		const data = e.target.value;
		setPaypalEmail( data );
console.log( data );
		var signUpEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			signUpEmailErrorText = signUp_emailErrorText

// signUpEmailErrorText = 'Your email is not correct'

		setPaypalEmailError ( signUpEmailErrorText );
	}
	const [ emailVerificationResult, setEmailVerificationResult ] = useState( false );

	// modal
	const[ openModal, setOpenModal ] = useState( false )
	
	const modalRemoveMethodHandleOk = async() => {
		setModalPaymentMethodPaypalOpen( false );
	}
	
	const modalRemoveMethodCancel = () => {
		setModalPaymentMethodPaypalOpen( false );
	}
	const modalRemoveMethodHandleOkClosed = () => {
		console.log( 'modalRemoveMethodHandleOkClosed' )
	}
	const modalRemoveMethodConfirmText = () => {

		return "D'accord"
	}
	const modalRemoveMethodCancelText = () => {
		return "Annuler"
	}

	// sign up
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const handleClickSave = async () => {

		// setSignUpSpin( 'block' );
		
		// check form erors
		const formHasErrors = await checkFormErrors();

		if( formHasErrors ){
			message.error( signUp_correctErrors );
// message.error( 'Please correct the errors before continuing.' );
			// setSignUpSpin( 'none' );
			// setSendingDisabled( false );
			return
		}	
		
		// check form empty fields
		const formHasEmpty = await checkFormEmpty();
	
		if( formHasEmpty ){
			message.error( formHasEmpty );
			// setSignUpSpin( 'none' );
			// setSendingDisabled( false );
			return
		}

		// get user payment method id
		var userPaymentMethodId = '';
		if( !isNew ){
			const rep = userPaymentMethods.filter( 
				e => e.paymentMethodId == selectedPaymentMethod.id 
			);
			userPaymentMethodId = rep[0].id;

		}

// console.log( 'isNew', isNew );
		const sendPaypallData = {
			paymentMethodId: 		selectedPaymentMethod.id,
			email: 					paypalEmail,
			userId:					userId, 	// new or edit
			enabled:				true,
			...( userPaymentMethodId && { userPaymentMethodId: userPaymentMethodId, } )
			
		}

		const rep = await userPaymentMethodEdit( sendPaypallData );	// save
		
		if( rep === false ){ //
			message.error( 'Paiement method canot be updated' );
			return;
		}
		else{
			message.success( 'Paiement method updated' );
			setModalPaymentMethodPaypalOpen( false );
		}

	}

	const [ modalRemoveMethodSetting, setmodalRemoveMethodSetting ] = useState( false );

	// check the form errors
	const checkFormErrors = async( ) => { 
		var errorsExist = false;
		if( paypalEmailError != '' ){
			errorsExist = true
			await setPaypalEmailError( paypalEmailError );
			form.validateFields()
		}
		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';
// alert( paypalEmail );
		if( paypalEmail == '' ){
			const errorMessage = signUp_emailEmpty;
			// document.getElementById( 'signUpEmailInput' ).focus();
			await setPaypalEmailError( errorMessage );
			formHasEmpty = errorMessage
			form.validateFields()
		}

		return formHasEmpty
	}

	// Payment method
	const [ paymentMethodlEmail, setPaymentMethodlEmail ] 	= useState( '' );
	const [ paymentMethod, setPaymentMethod ] 				= useState( '' );
	useEffect(() => {
		// reset the form
		form.resetFields()
		// get user's PayPal data
		const a = async() => {

			const userPaymentMethod = await userPaymentMethods.filter( e => e.paymentMethodName == "PayPal" );
			if( userPaymentMethod.length ){
				const email = userPaymentMethod[0].email;
				setPaymentMethodlEmail( email );

				setPaypalEmail( email );
			}
			
		}
		a();
	}, [ userPaymentMethods, modalPaymentMethodPaypalOpen ]); // Dependency array ensures effect runs when isModalOpen changes



	// form
	 const [form] = Form.useForm();

	 return (
		 <>
			<Modal
				title		= "Set Paypal"
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { modalPaymentMethodPaypalOpen }
				onOk		= { modalRemoveMethodHandleOk }
				onCancel	= { () => modalRemoveMethodCancel( false ) }
				afterClose	= { modalRemoveMethodHandleOkClosed }
				// zIndex={1005} // Custom z-index
				footer={[
				  <Button key="submit" type="primary" onClick={ handleClickSave }>
					Submit
				  </Button>,
				]}
				okText		= { modalRemoveMethodConfirmText() }
				cancelText	= { modalRemoveMethodCancelText() }
				styles 		= {{
					body: {
						maxHeight: '400px', // Set your desired max-height here
						overflowY: 'auto', // Add scrollbar if content exceeds max-height
					},
				}}
			>
				<div className="Set Paypal">
					<Form 
						className=""
						form = {form}
						/* initialValues={{ PaypalEmail: 'john.doe@example.com' }} */
					>
						<Form.Item
							name  = "paypalEmailForm"
							
							rules = {[
								{
									message: paypalEmailError,
									validator: ( value ) => {
										if ( paypalEmailError ) {
											return Promise.reject( paypalEmailError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { paymentMethodlEmail }
						>
							<Input 
								name  = "paypalEmailInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ signUp_emailPlaceholder }
								type="text" 
								value={ paypalEmail }
								onChange = { e => handleChangePaypalEmail(e) }
							/>
						</Form.Item>
					</Form>
				</div>
			</Modal>
			<div className="displayNone">
				<span 
					className ="cmp_vetonest.com_GomedYOvSx displayNone contactEmailError signUp_emailErrorText" 
				>
					Your email is not correct
				</span>			
				<span 
					className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
				>
					Email
				</span>
				<span 
					className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
				>
					Please correct the errors before continuing.
				</span>
				<span 
					id = "cmp_vetonest.com_EjMb0Ci9C6"
					className ="signUp_emailEmpty" 
				>
					L'email est vide.
				</span>
			</div>
		</>
	);
};

export default PaymentMethodPaypal;
