import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Input, Select } from 'antd';
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

const PaymentMethod = ( params ) => {
	
	const { 
		userId,
	} = useContext( AuthContext );

	const { 
		siteEmail,
		checkEmail,
		currency,
		signUp_emailErrorText,
		signUp_emailEmpty,
		signUp_emailPlaceholder,
		signUp_correctErrors,
		userPaymentMethods,
		userPaymentMethodEdit,
		isNew, 
		modalPaymentMethodOpen,
		setModalPaymentMethodOpen,
		selectedPaymentMethod,
		signUp_nameEmpty,
		signUp_nameErrorText,
		signUp_namePlaceholder,
		paymentMethod_bankNamePlaceholder,
		paymentMethod_bankAddressPlaceholder,
		paymentMethod_ibanPlaceholder,
		paymentMethod_fullNamePlaceholder,
		paymentMethod_bankNameErrorText,
		paymentMethod_paypalEmail,
		paymentMethod_bankAddressErrorText,
		paymentMethod_ibanErrorText,
		paymentMethod_fullNameEmpty,
		paymentMethod_bankNameEmpty,
		paymentMethod_bankAddressEmpty,
		paymentMethod_ibanEmpty,
		paymentMethod_descriptionPaypal,
		paymentMethod_descriptionBank,
		
	} = useContext( SiteContext );
// console.log( 'selectedPaymentMethod', selectedPaymentMethod );

	// title
	const [ title, setTitle ] = useState( '' );

	// description
	const [ description, setDescription ] = useState( '' );

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

	// name
	const [ name, setName ] = useState( '' );
	const [ nameError, setNameError ] = useState( '' );
	const handleChangeName = ( e ) => {
		const data = e.target.value;
		setName( data );

		var nameErrorText = '';
		const test = nameValidator( data )

		if( data && test === false ){
		
			nameErrorText = signUp_nameErrorText
		}
		// signUpNameErrorText = 'Your name seems incorect'
		setNameError( nameErrorText );
	}
	const nameValidator = ( name ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( name );
		return rep
	}

	// bank name
	const [ bankName, setBankName ] = useState( '' );
	const [ bankNameError, setBankNameError ] = useState( '' );
	const handleChangeBankName = ( e ) => {
		const data = e.target.value;
		setBankName( data );
		
		var bankNameErrorText = '';
		const test = bankNameValidator( data )

		if( data && test === false )
			bankNameErrorText = paymentMethod_bankNameErrorText

		// signUpBankNameErrorText = 'Your bankName seems incorect'
		setBankNameError( bankNameErrorText );
	}
	const bankNameValidator = ( bankName ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( bankName );
		return rep
	}

	// bank address
	const [ bankAddress, setBankAddress ] = useState( '' );
	const [ bankAddressError, setBankAddressError ] = useState( '' );
	const handleChangeBankAddress = ( e ) => {
		const data = e.target.value;
		setBankAddress( data );
		
		var bankAddressErrorText = '';
		const test = bankAddressValidator( data )

		if( data && test === false )
			bankAddressErrorText = paymentMethod_bankAddressErrorText

		// signUpBankAddressErrorText = 'Your bankAddress seems incorect'
		setBankAddressError( bankAddressErrorText );
	}
	const bankAddressValidator = ( bankAddress ) => {
		const rep = /^[a-zA-Z0-9\s,'-]*$/.test( bankAddress );
		return rep
	}

	// bank IBAN
	const [ iban, setIban ] = useState( '' );
	const [ ibanError, setIbanError ] = useState( '' );
	const handleChangeIban = ( e ) => {
		const data = e.target.value;
		setIban( data );
		
		var ibanErrorText = '';
		const test = ibanValidator( data )

		if( data && test === false )
			ibanErrorText = paymentMethod_ibanErrorText

		// signUpIbanErrorText = 'Your iban seems incorect'
		setIbanError( ibanErrorText );
	}
	
	const ibanValidator = (value) => {
		let rearrange =
			value.substring(4, value.length)
			+ value.substring(0, 4);
		let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
		let alphaMap = {};
		let number = [];

		alphabet.forEach((value, index) => {
			alphaMap[value] = index + 10;
		});

		rearrange.split('').forEach((value, index) => {
			number[index] = alphaMap[value] || value;
		});

		return modulo(number.join('').toString(), 97) === 1;
	}
	const modulo = (aNumStr, aDiv) => {
		var tmp = "";
		var i, r;
		for (i = 0; i < aNumStr.length; i++) {
			tmp += aNumStr.charAt(i);
			r = tmp % aDiv;
			tmp = r.toString();
		}
		return tmp / 1;
	}

	// modal
	const[ openModal, setOpenModal ] = useState( false )
	
	const modalRemoveMethodHandleOk = async() => {
		setModalPaymentMethodOpen( false );
	}
	
	const modalRemoveMethodCancel = () => {
		setModalPaymentMethodOpen( false );
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
		const sendPaypalData = {
			paymentMethodId: 		selectedPaymentMethod.id,
			email: 					paypalEmail,
			userId:					userId, 	// new or edit
			enabled:				true,
			fullName: 				name,
			currency: 				currency,
			address: 				bankAddress,
			bankName: 				bankName,
			iban: 					iban,
			...( userPaymentMethodId && { 
			userPaymentMethodId: 	userPaymentMethodId,
			})
		}

		const rep = await userPaymentMethodEdit( sendPaypalData );	// save
		
		if( rep === false ){ //
			message.error( 'Paiement method canot be updated' );
			return;
		}
		else{
			message.success( 'Paiement method updated' );
			setModalPaymentMethodOpen( false );
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
		if( selectedPaymentMethod.name == 'PayPal' ){
			if( paypalEmail == '' ){
				const errorMessage = signUp_emailEmpty;
				// document.getElementById( 'signUpEmailInput' ).focus();
				await setPaypalEmailError( errorMessage );
				formHasEmpty = errorMessage
				
			}
		}
		if( selectedPaymentMethod.name == 'Bank' ){

			if( name == '' ){
				const errorMessage = paymentMethod_fullNameEmpty;
				await setNameError( errorMessage );
				formHasEmpty = errorMessage
			}
			if( bankName == '' ){
				const errorMessage = paymentMethod_bankNameEmpty;
				await setBankNameError( errorMessage );
				formHasEmpty = errorMessage
			}
			if( bankAddress == '' ){
				const errorMessage = paymentMethod_bankAddressEmpty;
				await setBankAddressError( errorMessage );
				formHasEmpty = errorMessage
			}
			if( iban == '' ){
				const errorMessage = paymentMethod_ibanEmpty;
				await setIbanError( errorMessage );
				formHasEmpty = errorMessage
			}
		}
		form.validateFields()
		return formHasEmpty
	}

	// Payment method
	const [ paymentMethodEmail, setPaymentMethodEmail ] 				= useState( '' );
	const [ paymentMethodFullname, setPaymentMethodFullname ] 		= useState( '' );
	const [ paymentMethodBankName, setPaymentMethodBankName ] 		= useState( '' );
	const [ paymentMethodBankAddress, setPaymentMethodBankAddress ] 	= useState( '' );
	const [ paymentMethodIban, setPaymentMethodIban ] 				= useState( '' );
	
	const [ paymentMethod, setPaymentMethod ] 	= useState( '' );
	
	
	useEffect(() => {
		// reset the form
		form.resetFields()
		// get user's PayPal data
		const a = async() => {

			// const userPaymentMethod = await userPaymentMethods.filter( e => e.paymentMethodName == "PayPal" );
						// Title
			const titleText = selectedPaymentMethod.name == 'PayPal' ? 'PayPal' : 'Bank';
			// alert( selectedPaymentMethod.name );
			const atitle = () => {
				return <><img style={{ marginLeft: '10px', height: '25px', width: '25px' }} src={ '/img/paymentMethod/' + selectedPaymentMethod.image } />&nbsp; { titleText } </>
			}
			setTitle( atitle );
	
			// description
			const adescription = selectedPaymentMethod.name == 'PayPal' ? paymentMethod_descriptionPaypal : paymentMethod_descriptionBank;
			setDescription( adescription );
			
			// const paymentMethod = await userPaymentMethods.filter( e => e.paymentMethodName == selectedPaymentMethod.paymentMethodName );

			const rep = userPaymentMethods.filter( 
						e => e.paymentMethodId == selectedPaymentMethod.id 
			);
console.log(userPaymentMethods);
console.log(selectedPaymentMethod);

			if( !isNew ){
				if( selectedPaymentMethod.name == "PayPal" ){	// todo: get name dynamically
					
					
					const email = rep[0].email;
					setPaymentMethodEmail( email );
				}

				if( selectedPaymentMethod.name == "Bank" ){	// todo: get name dynamically

					const fullname 		= rep[0].fullName;
					const bankName 		= rep[0].bankName;
					const bankAddress 	= rep[0].bankAddress;
					const iban 			= rep[0].iban;	
					
					setPaymentMethodFullname( fullname );
					setPaymentMethodBankName( bankName );
					setPaymentMethodBankAddress( bankAddress );
					setPaymentMethodIban( iban );

				}
			}
		}
		
		a();
	}, [ userPaymentMethods, modalPaymentMethodOpen, selectedPaymentMethod ]); // Dependency array ensures effect runs when isModalOpen changes



	// form
	 const [form] = Form.useForm();

	 return (
		 <> 
			<Modal
				title		= { title }
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { modalPaymentMethodOpen }
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
				<div >
					<span >{ description }</span>
					<p></p>
					<Form 
						className=""
						form = {form}
						/* initialValues={{ PaypalEmail: 'john.doe@example.com' }} */
					>
					{  selectedPaymentMethod.name == "PayPal" ?
						<>
						<Form.Item
							name  = "EmailForm"
							
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
							initialValue  = { paymentMethodEmail }
						>
							<Input 
								name  = "emailInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ paymentMethod_paypalEmail }
								type="text" 
								value={ paypalEmail }
								onChange = { e => handleChangePaypalEmail(e) }
							/>
						</Form.Item>
						</>
					 :
						<>
						<Form.Item
							name  = "FullnameInput"
							
							rules = {[
								{
									message: nameError,
									validator: ( value ) => {
										if ( nameError ) {
											return Promise.reject( nameError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { paymentMethodFullname }
						>
							<Input 
								name  = "fullnameInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ paymentMethod_fullNamePlaceholder }
								type="text" 
								value={ name }
								onChange = { e => handleChangeName(e) }
							/>
						</Form.Item>
						<Form.Item
							name  = "BankNameInput"
							
							rules = {[
								{
									message: bankNameError,
									validator: ( value ) => {
										if ( bankNameError ) {
											return Promise.reject( bankNameError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { paymentMethodBankName }
						>
							<Input 
								name  = "bankNameInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ paymentMethod_bankNamePlaceholder }
								type="text" 
								value={ bankName }
								onChange = { e => handleChangeBankName(e) }
							/>
						</Form.Item>
						
						<Form.Item
							name  = "BankAdressInput"
							
							rules = {[
								{
									message: bankAddressError,
									validator: ( value ) => {
										if ( bankAddressError ) {
											return Promise.reject( bankAddressError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { paymentMethodBankAddress }
						>
							<Input 
								name  = "bankAddressInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ paymentMethod_bankAddressPlaceholder }
								type="text" 
								value={ bankAddress }
								onChange = { e => handleChangeBankAddress(e) }
							/>
						</Form.Item>
						
						<Form.Item
							name  = "IbanForm"
							
							rules = {[
								{
									message: ibanError,
									validator: ( value ) => {
										if ( ibanError ) {
											return Promise.reject( ibanError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { paymentMethodIban }
						>
							<Input 
								name  = "ibanInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ paymentMethod_ibanPlaceholder }
								type="text" 
								value={ iban }
								onChange = { e => handleChangeIban(e) }
							/>
						</Form.Item>
						</>
					}
					</Form>
				</div>
			</Modal>
			<div className="displayNone">
				<span 
					className ="cmp_vetonest.com_GomedYOvSx" 
				>
					Your email is not correct
				</span>			
				<span 
					className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
				>
					Please correct the errors before continuing.
				</span>
				<span 
					id = "cmp_vetonest.com_9zYTReMaR3"
					className ="paymentMethod_bankNamePlaceholder" 
				>
					Nom de votre votre banque.
				</span>
				
				<span 
					id = "cmp_vetonest.com_D0gTdPl2ZC"
					className ="paymentMethod_bankNameErrorText" 
				>
					Le nom de votre banque semble incorrect.
				</span>
				<span 
					id = "cmp_vetonest.com_Po5e7gWNXf"
					className ="paymentMethod_bankAddressPlaceholder" 
				>
					Adresse de votre banque.
				</span>
				<span 
					id = "cmp_vetonest.com_uMPeRVQGte"
					className ="paymentMethod_ibanPlaceholder" 
				>
					Numéro IBAN de votre compte.
				</span>
				<span 
					id = "cmp_vetonest.com_UcAx2AqF4U"
					className ="paymentMethod_fullNamePlaceholder" 
				>
					Votre nom complet.
				</span>
				<span 
					id = "cmp_vetonest.com_SYR1BJVYR3"
					className ="paymentMethod_paypalEmail" 
				>
					Email de votre compte PayPal.
				</span>
				<span 
					id = "cmp_vetonest.com_3PtJiFYzUQ"
					className ="paymentMethod_bankAddressErrorText" 
				>
					L'adresse de votre banque est incorrect.
				</span>
				<span 
					id = "cmp_vetonest.com_0EBbdyMnKR"
					className ="paymentMethod_ibanErrorText" 
				>
					Le numéro IBAN de votre compte est incorrect.
				</span>
				<span 
					id = "cmp_vetonest.com_gkRhek3lcW"
					className ="paymentMethod_fullNameEmpty" 
				>
					Tapez votre nom complet svp.
				</span>
				<span 
					id = "cmp_vetonest.com_P9vaik9zdr"
					className ="paymentMethod_bankNameEmpty" 
				>
					Le nom de votre banque est vide.
				</span>
				<span 
					id = "cmp_vetonest.com_HI3IrfOkvT"
					className ="paymentMethod_bankAddressEmpty" 
				>
					Votre adresse bancaire est vide.
				</span>
				<span 
					id = "cmp_vetonest.com_jAYeCe5CR6"
					className ="paymentMethod_ibanEmpty" 
				>
					Le numéro IBAN est vide.
				</span>
				<span 
					id = "cmp_vetonest.com_g8TrhOAK2L"
					className ="paymentMethod_descriptionPaypal" 
				>
					Recevez vos paiement sur votre compte PayPal
				</span>
				<span 
					id = "cmp_vetonest.com_2RlBd9zqLl"
					className ="paymentMethod_descriptionBank" 
				>
					Recevez vos paiement sur votre compte bancaire
				</span>
				<span id = "cmp_vetonest.com_2Mtv5nj9JA"
					className ="signUp_nameErrorText" 
				>
					Your name seems incorect
				</span>
			</div>
		</>
	);
};

export default PaymentMethod;
