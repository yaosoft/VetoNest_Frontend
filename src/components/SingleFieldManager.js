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
		setSelectedLieuId,
		selectedTimeslotOpen,
		setSelectedTimeslotOpen,
		setSelectedVetoClinique,
		getAContent
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
	
	// allow modal
	const [ modalAllowed, setModalAllowed ] = useState( true );
	const [ maxAnimals, setMaxAnimals ] = useState( 0 );
	const [ title, setTitle ] 	= useState( '' );
	const [ value, setValue ] 	= useState( '' );
	const [ type, setType ] 	= useState( '' );
	// const [ style, setStyle ] 	= useState( '' );
	const [ backgroundColor, setBackgroundColor ] 	= useState( '' );
	const [ placeholder, setPlaceholder ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	const [ fieldName, setFieldName ] = useState( '' );
	const [ goToLink, setGoToLink ] = useState( '' );
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

		// go to Link
		const goToLink = params.params.goToLink && params.params.goToLink;
		setGoToLink( goToLink );
// console.log( 'fffffffffffffff', fieldName );
		// style
		if( fieldName == 'Opened' )
			setBackgroundColor( 'backgroundOlive' )
		else if( fieldName == 'Closed' )
			setBackgroundColor( 'backgroundInactive01' )
		else if( fieldName == 'Absence' )
			setBackgroundColor( 'backgroundInactive02' )
		else if( fieldName == 'Hollydays' )
			setBackgroundColor( 'backgroundInactive03' )
		else if ( fieldName.startsWith('Etablissement') )
			setBackgroundColor( 'backgroundAddAnimaux01' )
		else if( fieldName == 'Animaux' && type == 1 )
			setBackgroundColor( 'backgroundAddAnimaux01' )
		else setBackgroundColor( 'backgroundOlive' )
		
		
		// Animals
		if( fieldName == "Animaux" && type == 1 ){
			setMaxAnimals( params.params.maxAnimals ); // max number of animals
			const totalAnimals = params.params.totalAnimals; // total user"s animals
			const allowed = totalAnimals < maxAnimals ? true : false;
			setModalAllowed( allowed )
		}
		


	}, [title, params.params] );


	const handleClickField = ( fieldName ) => {
		if( type == '' )
			return
		if( !modalAllowed ){
			message.info( getAContent( 'cmp_vetonest.com_Qp72Lm9Afx' ) + '(' +  maxAnimals + ')' );
			return;
		}
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

			// Lieu transport
			if( fieldName == "Etablissement_lieu" && params.params.lieuId ){
				const lieuId = params.params.lieuId;
				setSelectedLieuId( lieuId );
			}
			else{
				setSelectedLieuId( null );
			}

			setModalProfileIdentityOpen( true );
			setVisibleModalName( fieldName );
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
	
	
	const BuildArrowContent = ( type ) => { 
		if( type == 1 )		// add
			return(
				<span>
					{ getAContent( 'cmp_vetonest.com_Ak72Lm9QxP' ) }
				</span>
			)
		else if( type == 2 ) // edit
			return(
				<span>
					{ getAContent( 'cmp_vetonest.com_Su6Qp0zVtY' ) }
				</span>
			)
		else if( type == 3 ) // visit
			return(
				<span>
					<a
						href= { goToLink }
					>
						{ getAContent( 'cmp_vetonest.com_Tb91Qw4NcR' ) }
					</a>
				</span>
			)
	}
	
	return (
	<>
		{
			user &&
			<>
				<div key={'timeslot_' + title} className="row singleFieldManager height40">
					<div className={ 'dataDiv textAlignLeft ' + backgroundColor }>
						<span>
							{ value ? value : placeholder }
							&nbsp;
							{ description && BuildTooltip(description) }
						</span>
					</div> 
					<div
						className={`buttonDiv borderRadius18 singleFieldManagerArrow ${!type ? backgroundColor : 'backgroundYellow'}`}
						role="button"
						tabIndex={0}
						onClick={() => handleClickField(fieldName)}
					>
						<span>{ BuildArrowContent(type) }</span>
					</div>
				</div>

			</>
		}
	</>
	);
};

export default SingleFieldManager;
