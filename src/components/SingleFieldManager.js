import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Select } from 'antd';
import { message } from 'antd';
import { Tooltip, Button } from 'antd';

import ModalProfileIdentity from './ModalProfileIdentity';

import Header from './Header';

const SingleFieldManager = ( params ) => {
	// context
	const { 
		setModalProfileIdentityOpen,
		userProfile,
		setVisibleModalName,
		setSelectedPetId,
	} = useContext( SiteContext );

	// context
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		truncateString,
	} = useContext( AuthContext );
	
	const [ fieldName, setFieldName ] = useState( '' );
	const [ title, setTitle ] 	= useState( '' );
	const [ value, setValue ] 	= useState( '' );
	const [ type, setType ] 	= useState( '' );
	const [ style, setStyle ] 	= useState( '' );
	const [ backgroundColor, setBackgroundColor ] 	= useState( '' );
	const [ placeholder, setPlaceholder ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	useEffect( () => {
		// type
		const type = params.params.type;
		setType(type);

		// style
		const style = params.params.style && params.params.style;
		setStyle(style);

		// placeholder
		const placeholder = params.params.placeholder;
		setPlaceholder( placeholder );

		// field name
		const fieldName = params.params.fieldName;
		setFieldName( fieldName );
		setValue( params.params.value );

		// description
		const description = params.params.description && params.params.description;
		setDescription( description );

		// style
		if( fieldName == 'Open' )
			setBackgroundColor( 'backgroundOlive' )
		else if( fieldName == 'Close' )
			setBackgroundColor( 'backgroundInactive01' )
		else if( fieldName == 'Absence' )
			setBackgroundColor( 'backgroundInactive02' )
		else if( fieldName == 'Hollydays' )
			setBackgroundColor( 'backgroundInactive03' )
		else setBackgroundColor( 'backgroundOlive' )

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
	
	const BuildTooltip = ( text ) => {
		return(
			<Tooltip placement="bottom" title={text}>
				<span>details</span>
			</Tooltip>
		)
	}
	
	return (
	<>
		{
			user &&
			<>
				<ModalProfileIdentity params={{
					fieldName: fieldName,
					title: title,
				}}
				/>
				<div className='row singleFieldManager'>
					<div className={ 'dataDiv textAlignLeft ' + backgroundColor } >
						<span>{ value ? value : placeholder } &nbsp; { description && BuildTooltip(description) }</span>
					</div> 
					<div 
						className='buttonDiv borderRadius18'
						role={'button'}
						tabIndex={0}
						onClick={ (e) => handleClickField() }
					>
						<span>{ type == 1 ? 'add' : 'modify' } ></span>
					</div>
				</div>
			</>
		}
	</>
	);
};

export default SingleFieldManager;
