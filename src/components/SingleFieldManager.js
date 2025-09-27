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
		setSelectedAbsenceId,
		setSelectedHollydayId,
		setSelectedTimeslotId,
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


	const handleClickField = ( e ) => {
		const a = async() => {
			// selected pet's book ID
			const selectedPetId = await params.params.selectedPetId ? params.params.selectedPetId : '';
			setSelectedPetId( selectedPetId );

			// timeslot selected absence
			const selectedAbsenceId = await params.params.selectedAbsenceId ? params.params.selectedAbsenceId : '';
			setSelectedAbsenceId( selectedAbsenceId );
			
			// timeslot selected hollyday
			const selectedHollydayId = await params.params.selectedHollydayId ? params.params.selectedHollydayId : '';
			setSelectedHollydayId( selectedHollydayId );		
			
			// timeslot selected timeslot
			const selectedTimeslotId = await params.params.selectedTimeslotId ? params.params.selectedTimeslotId : '';
			setSelectedTimeslotId( selectedTimeslotId );

			// title
			const title = await params.params.title;
console.log( "dddddddddd params.params", params.params );
console.log( "++++++++++ params.params.title", params.params.title );
			setTitle( title );

			setModalProfileIdentityOpen( true );
			setVisibleModalName( params.params.fieldName );
		}
		a();

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
						onClick={ (e) => handleClickField( e ) }
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
