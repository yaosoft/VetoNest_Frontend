import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Input, Select } from 'antd';
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

const ModalRemoveAnimal = ( params ) => {
	
	const { 
		userId,
	} = useContext( AuthContext );

	const { 
		modalRemoveAnimalOpen,
		setModalRemoveAnimalOpen,
		carnetAnimalRemove,
		selectedAnimal,
		userAnimals,
		photoAnimalDefaultSrc,
		base_url,
		generateRandomDigits,
		setProfileFormUpdated
	} = useContext( SiteContext );

	// title
	const [ title, setTitle ] = useState( '' );

	// modal
	const[ openModal, setOpenModal ] = useState( false )
	
	const modalRemoveAnimalHandleOk = async() => {

		const carnetAnimalId = selectedAnimal.id;

		const data = { carnetAnimalId : carnetAnimalId }
		const res = await carnetAnimalRemove( data );
		if( !res ){
			message.error( 'Cannot delete' )
		}
		else{
			message.success( 'Animal book deleted' )
			const random = generateRandomDigits(3);
			// setFormUpdated( random );
			setProfileFormUpdated( random );
		}
		setModalRemoveAnimalOpen( false );
	}
	
	const modalRemoveAnimalCancel = () => {
		setModalRemoveAnimalOpen( false );
	}
	const modalRemoveAnimalHandleOkClosed = () => {
		console.log( 'modalRemoveAnimalHandleOkClosed' )
	}
	const modalRemoveAnimalConfirmText = () => {

		return "D'accord"
	}
	const modalRemoveAnimalCancelText = () => {
		return "Annuler"
	}

	const handleClickRemove = () => {
		
	}

	useEffect(() => {
		// reset the form
		form.resetFields();
		
		// get user's PayPal data
		const a = async() => {

			// Title
			const titleText = 'Remove your animal ' + selectedAnimal.nom;
			// alert( selectedAnimal.name );
			const titlePicture =  selectedAnimal.picture ? base_url + 'uploads/files/pets/' + selectedAnimal.picture: photoAnimalDefaultSrc ;
			

			const title = 
				<p>
					<img 
						style={{ marginLeft: '10px', height: '25px', width: '25px' }} 
						src={ titlePicture } 
					/>
						&nbsp; { titleText } 
				</p>
			
			setTitle( title );
		}
		if( selectedAnimal )
			a();
	}, [ selectedAnimal ]); 




	// form
	 const [form] = Form.useForm();

	 return (
		 <>
			<Modal
				title		= { title }
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { modalRemoveAnimalOpen }
				onOk		= { modalRemoveAnimalHandleOk }
				onCancel	= { () => modalRemoveAnimalCancel( false ) }
				afterClose	= { modalRemoveAnimalHandleOkClosed }
				// zIndex={1005} // Custom z-index
				
				okText		= { modalRemoveAnimalConfirmText() }
				cancelText	= { modalRemoveAnimalCancelText() }
				styles 		= {{
					body: {
						maxHeight: '400px', // Set your desired max-height here
						overflowY: 'auto', // Add scrollbar if content exceeds max-height
					},
				}}
			>
				<div className="Set Paypal">
					Êtes vous sure de vouloir supprimer cette animal?
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

export default ModalRemoveAnimal;
