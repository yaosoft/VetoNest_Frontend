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
		setProfileFormUpdated,
		getAContent
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
			message.error( getAContent( 'cmp_vetonest.com_Nq71Fd83Lp' ) )
		}
		else{
			message.success( getAContent( 'cmp_vetonest.com_Js92Qw54Rn' ) )
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

		return getAContent( 'cmp_vetonest.com_Gb51Xa72Mv' )
	}
	const modalRemoveAnimalCancelText = () => {
		return getAContent( 'cmp_vetonest.com_Jd02LmP91w' )
	}

	const handleClickRemove = () => {
		
	}

	useEffect(() => {
		// reset the form
		form.resetFields();
		
		// get user's PayPal data
		const a = async() => {

			// Title
			const titleText = getAContent( 'cmp_vetonest.com_Za63Ks10Pw' ) + ' ' + selectedAnimal.nom;
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
				
			</Modal>
			
		</>
	);
};

export default ModalRemoveAnimal;