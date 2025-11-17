import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Form, Select } from 'antd';
import { message } from 'antd';
import { Tooltip, Button } from 'antd';

import ModalProfile from './ModalProfile.js';

import Header from './Header';

const SingleFieldManager = ( params ) => {
	// context
	const { 
		setModalProfileIdentityOpen,
		modalProfileIdentityOpen,
		userProfile,
		setVisibleModalName,
		visibleModalName,
		visibleModalTitle,
		setVisibleModalTitle,
		setSelectedPetId, 
		setSelectedAbsenceId,
		setSelectedHollydayId,
		setSelectedTimeslotId,
		selectedTimeslotOpen,
		setSelectedTimeslotOpen,
		setSelectedVetoClinique 
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
	

	const [ title, setTitle ] 	= useState( '' );
	const [ value, setValue ] 	= useState( '' );
	const [ type, setType ] 	= useState( '' );
	// const [ style, setStyle ] 	= useState( '' );
	const [ backgroundColor, setBackgroundColor ] 	= useState( '' );
	const [ placeholder, setPlaceholder ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	const [ fieldName, setFieldName ] = useState( '' );
	useEffect( () => {
		// title
		const title = params.params.title;
		setTitle(title);

		// type
		const type = params.params.type;
		setType(type);

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
		if( fieldName == 'Opened' )
			setBackgroundColor( 'backgroundOlive' )
		else if( fieldName == 'Closed' )
			setBackgroundColor( 'backgroundInactive01' )
		else if( fieldName == 'Absence' )
			setBackgroundColor( 'backgroundInactive02' )
		else if( fieldName == 'Hollydays' )
			setBackgroundColor( 'backgroundInactive03' )
		else setBackgroundColor( 'backgroundOlive' )

	}, [title, params.params] );


	const handleClickField = ( fieldName ) => {
		
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
			if( fieldName == 'Opened' || fieldName == 'Closed' ){
				const startTime 	= params.params.startTime;
				const endTime 		= params.params.endTime;
				const day 			= params.params.day;
				const dayId			= params.params.dayId
				const opened		= params.params.opened;
				const timeSlotId	= params.params.timeSlotId;

				selectedTimeslotOpen.startTime 		= startTime;
				selectedTimeslotOpen.endTime 		= endTime;
				selectedTimeslotOpen.day 			= day;
				selectedTimeslotOpen.dayId 			= dayId;
				selectedTimeslotOpen.opened 		= opened;
				selectedTimeslotOpen.timeSlotId 	= timeSlotId

				setSelectedTimeslotOpen( selectedTimeslotOpen );
			}

			// title
			const title = await params.params.title;
			setVisibleModalTitle( title );

			setModalProfileIdentityOpen( true );
			setVisibleModalName( params.params.fieldName );
		}
		a()
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
				<div key={'timeslot_' + title} className='row singleFieldManager height40'>
					<div className={ 'dataDiv textAlignLeft ' + backgroundColor } >
						<span>{ value ? value : placeholder } &nbsp; { description && BuildTooltip(description) }</span>
					</div> 
					<div 
						className='buttonDiv borderRadius18'
						role={'button'}
						tabIndex={0}
						onClick={ (e) => handleClickField( fieldName ) }
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
