import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Select } from 'antd';
import { message } from 'antd';
import ModalProfileIdentity from './ModalProfileIdentity';

const SingleFieldManager = ( params ) => {
	// context
	const { 
		modalProfileIdentityOpen,
		setModalProfileIdentityOpen,
		userProfile,
		setVisibleModalName,
		visibleModalName,
		setSelectedPetId,
	} = useContext( SiteContext );

	
	const [ fieldName, setFieldName ] = useState( '' );
	const [ title, setTitle ] = useState( '' );
	const [ value, setValue ] = useState( '' );
	
	const [ placeholder, setPlaceholder ] = useState( '' );
	useEffect( () => {

		// placeholder
		const placeholder = params.params.placeholder;
		setPlaceholder( placeholder );

		// field name
		const fieldName = params.params.fieldName;
		setFieldName( fieldName );
		setValue( params.params.value );
		
		
		
	}, [userProfile] );


	const handleClickField = () => {
		// selected pet's book ID
		const selectedPetId = params.params.selectedPetId && params.params.selectedPetId;
		setSelectedPetId( selectedPetId );
		
		// title
		const title = params.params.title;
		setTitle( title );
		setModalProfileIdentityOpen( true );
		
		setVisibleModalName( params.params.fieldName );
		
	}
	
	 return (
	 <>
		<ModalProfileIdentity params={{
			fieldName: fieldName,
			title: title,
		}}
		/>
		<div className='row singleFieldManager'>
			<div className='dataDiv backgroundOlive' style={{ textAlign: 'left' }} >
				<span>{ value ? value : placeholder }</span>
			</div> 
			<div 
				className='buttonDiv borderRightRadius25'
				role={'button'}
				tabIndex={0}
				onClick={ (e) => handleClickField() }
			>
				<span>{ userProfile.nom ? 'update' : 'add' } ></span>
			</div>
		</div>
	</>
	);
};

export default SingleFieldManager;
