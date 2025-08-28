import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Input, Select } from 'antd';
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

const ModalRemovePaymentMethod = ( params ) => {
	
	const { 
		userId,
	} = useContext( AuthContext );

	const { 
		modalRemovePaymentMethodOpen,
		setModalRemovePaymentMethodOpen,
		userPaymentMethodRemove,
		selectedPaymentMethod,
		userPaymentMethods,
	} = useContext( SiteContext );

	// title
	const [ title, setTitle ] = useState( '' );

	// modal
	const[ openModal, setOpenModal ] = useState( false )
	
	const modalRemoveMethodHandleOk = async() => {
		// 
		const rep = userPaymentMethods.filter( 
			e => e.paymentMethodId == selectedPaymentMethod.id 
		);

		const userPaymentMethodId = rep[0].id;

		const data = { userPaymentMethodId : userPaymentMethodId }
		const res = await userPaymentMethodRemove( data );
		if( !res )
			message.error( 'Cannot deleted' )
		else
			message.success( 'Paimeny mrthode deleted' )
		setModalRemovePaymentMethodOpen( false );
	}
	
	const modalRemoveMethodCancel = () => {
		setModalRemovePaymentMethodOpen( false );
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

	const handleClickRemove = () => {
		
	}

	useEffect(() => {
		// reset the form
		form.resetFields()
		// get user's PayPal data
		const a = async() => {

			// Title
			const titleText = 'Remove your ' + ( selectedPaymentMethod.name == 'PayPal' ? 'PayPal' : 'Bank' ) + ' payment method';
			// alert( selectedPaymentMethod.name );
			const atitle = () => {
				return <><img style={{ marginLeft: '10px', height: '25px', width: '25px' }} src={ '/img/paymentMethod/' + selectedPaymentMethod.image } />&nbsp; { titleText } </>
			}
			setTitle( atitle );

		}
		a();
	}, [ userPaymentMethods, modalRemovePaymentMethodOpen, selectedPaymentMethod ]); 




	// form
	 const [form] = Form.useForm();

	 return (
		 <>
			<Modal
				title		= { title }
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { modalRemovePaymentMethodOpen }
				onOk		= { modalRemoveMethodHandleOk }
				onCancel	= { () => modalRemoveMethodCancel( false ) }
				afterClose	= { modalRemoveMethodHandleOkClosed }
				// zIndex={1005} // Custom z-index
				
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
					Attention
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

export default ModalRemovePaymentMethod;
