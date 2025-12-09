import React, { useState, useEffect, useContext } from "react";
import dayjs from 'dayjs';

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';
import { Form, Input, Select } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import InputCode from "../InputCode";

import Header from '../Header';
import Footer from '../Footer';
import ModalRemoveAnimal from '../ModalRemoveAnimal';
import SingleFieldManager from '../SingleFieldManager';
// import ModalEmailValidate from '../ModalEmailValidate';

import LanguageSelector from '../LanguageSelector.js';
import CurrencySelector from '../CurrencySelector.js';

import Title from '../Title';
import ModalProfile from '../ModalProfile.js';

const Profile = ( params ) => {
	// context
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		setUser,
	} = useContext( AuthContext );
	const { 
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		profileGet,
		updateLanguagePreference,
		defaultLanguageId,
		defaultLanguage,
		languageSetup, 
		profileUpdate,
		base_url,
		generateRandomDigits,
		setIsNew,
		isNew,
		// setSelectedUserPaymentMethodId
		setSelectedPaymentMethod,
		// selectedPaymentMethod,
		setUserProfile,
		userProfile,
		setVisibleModalName,
		visibleModalName,
		visibleModalTitle,
		profile_sexe_male,
		profile_sexe_female,
		profile_title,
		siteLanguage,
		profileFormUpdated,
		setProfileFormUpdated,
		profileIdentityOpen,
		dateFormater,
		getUserPets,
		userPets,
		setUserPets,
		getBase64,
		setSelectedAnimal,
		setModalRemoveAnimalOpen,
		removeAnimalOpen,
		photoAnimalDefaultSrc,
		truncateString,
		siteLocale,
		getTimeslot,
		setTimeslot,
		timeslot,
		getAbsences,
		setAbsences,
		getHollydays,
		setHollydays,
		hollydays,
		absences,
		fieldName,
		modalProfileIdentityOpen,
		getVetoCliniqueInfo,
		setVetoCliniqueInfo,
		vetoCliniqueInfo,
		getAContent,
		getAVetoLieux,
		lieuDelete,
		isAGuest,
	} = useContext( SiteContext );

	const [ profile, setProfile ] = useState( '' );
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );
	// count user's pets
	const [ userTotalAnimal, setUserTotalAnimal ] = useState( 0 );
	// count vet absence
	const [ countAbsence, setCountAbsence ] = useState( 0 ); 
	// count vet absence
	const [ countHollydays, setCountHollydays ] = useState( 0 ); 
	// It's a etablissement's guest ( have accepted an invitation )
	const [ aGuest, setAGuest ] = useState( false ); 

	const [ selectedLanguageId, setSelectedLanguageId ] = useState( user ? user.languageId : defaultLanguageId ); 
	
	const [ spin, setSpin ] = useState( 'none' );
	
	// veto / etablissement lieu
	const [ vetoLieux, setVetoLieux ] = useState( [] ); 
	const MAX_LIEUX = 3; // max number of paces
	
	// animals
	const MAX_ANIMALS = 4; // max number of animals
	
	
	// File upload
	const { Dragger } = Upload;
	const [ uploading, setUploading ] = useState(false);
	const [ photoError, setPhotoError ] = useState( '' );
	const [ profilePhoto, setProfilePhoto ] = useState('');
	const [ fileList, setFileList ] = useState([]);
	const [ showUploadList, setShowUploadList ] = useState( false );
	const handleBeforeUpload = ( file ) => {
        // You can perform validation or other logic here
        // Store the file in state to upload manually later
        setFileList([...fileList, file]);
        return true; // Prevents automatic upload
    };
	const props = {
		accept: '.png,.jpg,.jpeg',
		listType: 'picture',
		fileList: fileList,
		multiple: false,
		maxCount: 1,
		showUploadList: showUploadList,
		className: 'avatar-uploader',
		/* beforeUpload: handleBeforeUpload, */
		onChange(info) {
			const a = async() => {

				let newFileList = [...info.fileList];
				setFileList( newFileList );
				setProfilePhoto( info.file );

				// open the modal
				await setIsModalPhotoOpen(true);
			}
			a()
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};
	
	// modal photo
	const [ isModalPhotoOpen, setIsModalPhotoOpen ] = useState(false);
	useEffect(() => {

		const a = async() => {
			if ( isModalPhotoOpen ) {
				const dataUri = await getBase64( profilePhoto.originFileObj );
				const elt = document.getElementById( "profilePhotoId" );
				elt.src = dataUri;
			}
		}
		a();
	}, [fileList, profileFormUpdated]); // Dependency array ensures effect runs when isModalOpen changes


	const modalPhotoHandleOk = async() => {
		const data = {
			profileId: profileId,
			userId: userId
		};
		// data[ 'profileId' ] = profileId;
		const rep = await profileUpdate ( data, profilePhoto, profileTypeId );
		
		if( rep ){
			message.success( getAContent('cmp_vetonest.com_TrN9a8bKzV') );
			const random = generateRandomDigits(3);
			// setFormUpdated( random );
			setProfileFormUpdated( random );
		}
		else{
			message.error( getAContent('cmp_vetonest.com_Tk5QwY1LhZ') )
		}
		setIsModalPhotoOpen( false );
	}
	
	const modalPhotoCancel = () => {
		setIsModalPhotoOpen( false );
	}
	const modalPhotoHandleOkClosed = () => {
		console.log( 'modalPhotoHandleOkClosed' )
	}
	const modalPhotoConfirmText = () => {
		return getAContent('cmp_vetonest.com_Lf7mU3vRpQ')
	}
	const modalPhotoCancelText = () => {
		return getAContent('cmp_vetonest.com_Pa8Rk2sYnB')
	}

	const handleClickRemoveAnimal = ( animalId )  => {		

		// get user payment method
		const animal = userPets.filter( e => e.id == animalId )[ 0 ];
		setSelectedAnimal( animal );
		setModalRemoveAnimalOpen( true )
		// removeAnimalOpen( userPaymentMethodId )
	}

	const handleClickBooking = ( animalId )  => {		

		// get user payment method
		const animal = userPets.filter( e => e.id == animalId )[ 0 ];
		setSelectedAnimal( animal );
		// Do something
	}


	const handleClickRemoveLieu = (lieuId) => {
		Modal.confirm({
			title: getAContent( 'cmp_vetonest.com_Rc90Bn37Ts' ),
			content: getAContent( 'This action cannot be undone' ),
			okText: getAContent( 'cmp_vetonest.com_Gb51Xa72Mv' ),
			cancelText: getAContent( 'cmp_vetonest.com_Jd02LmP91w' ),
			okType: "danger",
			centered: true,
			onOk: async () => {
				// Your delete logic here
				const data = {
					lieuId: lieuId
				}
				const rep = await lieuDelete(data);
				if( !rep ){
					message.error( getAContent( 'cmp_vetonest.com_lMQqX2bptt' ) )
				}
				else{
					const random = generateRandomDigits(3);
					// setFormUpdated( random );
					setProfileFormUpdated( random );
					message.success( getAContent( 'cmp_vetonest.com_TrN9a8bKzV' ) )
				}
				console.log( rep );
			},
		});
	};

	const navigate = useNavigate();
	const handleClickGoToClinic = ( cliniqueId ) => {
		var url = '';
		!cliniqueId ?
			url = "/etablissement" + `?userId=${userId}&etablissementId=${vetoCliniqueInfo.id}`
		:
			url = "/etablissement" + `?userId=${userId}&etablissementId=${cliniqueId}`
		navigate( url );
	}

	const getCLinicLink = ( cliniqueId ) => {
		var url = '';
		!cliniqueId ?
			url = "/etablissement" + `?userId=${userId}&etablissementId=${vetoCliniqueInfo.id}`
		:
			url = "/etablissement" + `?userId=${userId}&etablissementId=${cliniqueId}`
		return url;
	}

	const [ name, setName ] 			= useState( '' );
	const [ firstName, setFirstName ] 	= useState( '' );
	const [ dateNaissance, setDateNaissance ] = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const [ profileNom, setProfileNom ] = useState( '' );
	const [ sexId, setSexId ] = useState( '' );
	
	useEffect(() => {
		if( modalProfileIdentityOpen === true )
			return
		// get user profile info
		const a = async () => {
			// veto clinic info
			if( profileTypeId == 2 ){
				const vetoCliniqueInfo = await getVetoCliniqueInfo( profileId );
				setVetoCliniqueInfo( vetoCliniqueInfo );
						
				// get clinic's invitations
				const statusId = 2; // invitation accepted ( clinic member )
				const aGuest = await isAGuest( profileId ); // return clinic id of false
				setAGuest( aGuest ); 
			}

			const profile = await profileGet( profileId, profileTypeId );
			setUserProfile( profile );
			const name = profile.nom;
			setName( name );
			const firstName = profile.prenom;
			setFirstName( firstName );
			const sexId = userProfile.userSexeId
			setSexId( sexId );
			const birthDate = profile.dateNaissance ? profile.dateNaissance.date : ''; 
			const dateNaissance = birthDate ? await dateFormater( birthDate ) : '';
			setDateNaissance( dateNaissance );
			const biography = profile.biography
			setBiography( biography );
			const profileNom = profile.nom && truncateString( profile.nom, 12 );
			setProfileNom( profileNom )
			const timeslotObj = await getTimeslot( profile.id );
			const timeslot = await Object.entries( timeslotObj );
			setTimeslot( timeslot );
			const absences = await getAbsences( profile.id );
			setAbsences( absences ); 
			setCountAbsence( absences.length );
			const hollydays = await getHollydays( profile.id );
			setHollydays( hollydays );
			setCountHollydays( hollydays.length );
			
			
		}
		a();
	}, [ modalProfileIdentityOpen, profileFormUpdated ] ); // Dependency array ensures effect runs when changes

	useEffect(() => {
		// get user pet'
		const a = async() => {
			const userPets = await getUserPets( profileId );
			if( userPets.length ){
				setUserPets( userPets );
				const countUserAnimal = userPets.length;
				setUserTotalAnimal( countUserAnimal );
			}
			
			// get a veto / etablissement lieux
			if( profileTypeId == 2 ) {
				var vetoLieux = [];

				if( userProfile.atHome ){
					const data = {
						profileVetoId: userProfile.id,
					}
					vetoLieux = await getAVetoLieux( data );
				}
				else if ( !userProfile.atHome && vetoCliniqueInfo.id ){
					const data = {
						etablissementId:  vetoCliniqueInfo.id,
					}
					vetoLieux = await getAVetoLieux( data );
				}
				setVetoLieux( vetoLieux );
			}		
			
		}
		a()
	}, [ vetoCliniqueInfo, userProfile, profileFormUpdated ] );

	// Build timeslot
	const BuildTimeslot = () => {
		if( !timeslot )
			return

		const getHoraire = ( dateObj01, dateObj02 ) => { return(
			dayjs( dateObj01 ).format( 'HH:ss' ) + ' - ' + 
			dayjs( dateObj02 ).format( 'HH:ss' ) 
		)};
		
		const getFieldName = ( type ) => {
			if( type == 1 )
				return 'Opened'
			if( type == 2 )
				return 'Closed'
			if( type == 3 )
				return 'Absence'
			if( type == 4 )
				return 'Hollydays'
		}
		
		const getStatus = ( type ) => {
			if( type == 1 )
				return 'opened'
			if( type == 2 )
				return 'closed'
			if( type == 3 )
				return 'absent'
			if( type == 4 )
				return 'hollydays'
		}

		return(
			timeslot.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager 
						key={'timeslot_' + index}
						params={{
							fieldName: 		getFieldName( e[1].type ),
							title:			e[1].opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
							nom:			e[1].nom ? e[1].nom : '',
							description:	e[1].description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
							value: 			e[1].opened ? getDayName( e[0] ) + ': ' +   
												getHoraire( e[1].startTime.date, e[1].endTime.date ) :
											getDayName( e[0] ) + ' ' + ( e[1].closedDate ?  ' ' + dayjs( e[1].closedDate.date ).format( 'DD' ) + ' ' + getMonthName( dayjs( e[1].closedDate.date ).format( 'MM' ) ) + ': ' + getStatus( e[1].type ) : ': ' + getAContent('cmp_vetonest.com_qM4sV8kUdE') ),
							style:			e[1].opened ? 'opened' : 'closed',
							selectedAbsenceId:	e[1].type == 3 ? e[1].id : '',
							startTime:		e[1].opened ? e[1].startTime.date : '',
							endTime:		e[1].opened ? e[1].endTime.date : '',
							opened:			e[1].opened ? e[1].opened : '',
							day:			getDayName( e[0] ),
							dayId:			e[0],
							timeSlotId:		e[1].timeSlotId,
							type: 			getFieldName( e[1].type ) == 'Hollydays' ? '' : 2, // 2 = update
						}}
					/>
				</div>
			)
		)
	}
	
	// Build absence
	const BuildAbsence = () => {

		if( !absences )
			return

		return(
			absences.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'absence_' + index}
						params={{
							fieldName: 		'Absence',
							title:			getAContent('cmp_vetonest.com_Bz7Nq4wYpJ'),
							nom:			e.nom,
							selectedAbsenceId:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Wr2Hc9vXsK'),
							value: 			dayjs( e.closedDate.date ).format( 'DD' ) + ' ' + 
							getMonthName( dayjs( e.closedDate.date ).format( 'MM' ) ) + ', ' + truncateString( e.nom, 10 ),
							style:			'closed',
							type: 			2, // 2 = update
						}}
					/>
				</div>
			)
		)
	}

	// Build system's hollydays
	const BuildHollydays = () => {
		if( !hollydays )
			return

		return(
			hollydays.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager 
						key={'hollydays_' + index}
						params={{
							fieldName: 		'Hollydays',
							title:			getAContent('cmp_vetonest.com_Lv5Jm2nRqT'),
							nom:			e.nom,
							selectedHollyday:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Sf8Yc1pWkZ'),
							value: 			truncateString( e.nom, 10 ) + ', ' + dayjs( e.closedDate.date ).format( 'DD' ) + ' ' + 
							getMonthName( dayjs( e.closedDate.date ).format( 'MM' ) ),
							style:			'closed',
							type: 			'', // no click
							
						}}
					/>
				</div>
			)
		)
	}

	// Build veto's Lieux
	const BuildVetoLieux = () => {

		return(
			vetoLieux.map( ( e, index ) => 
			<>			
				
				<SingleFieldManager 
						key={'lieux_' + index}
						params={{
							fieldName: 		'Etablissement_lieu',
							title:			e.adresse,
							// placeholder:	e.adresse,
							value: 			truncateString( e.adresse, 40 ),
							type: 			2, // 2 = update
						}}
				/>
				
				<div className="row">
						<a
							className='animal-remove-icon'
							title={getAContent('cmp_vetonest.com_Sf8Yc1pWkZ')}
							onClick={() => handleClickRemoveLieu(e.id)}
						>
							<i className='fa fa-trash'>&nbsp;remove</i>&nbsp;
						</a>
						
				</div>
			</>
			)
		)
	}

	// Get a day name from day number
	const getDayName = ( dayNumber, locale = siteLocale ) => {
		const date = new Date(2000, 0, 1);
		date.setDate(date.getDate() + dayNumber);
		const dayName = date.toLocaleDateString( locale, { weekday: 'long' } );
		return dayName;
	}

	// get a month name from month number
	const getMonthName = ( monthNumber, locale = siteLocale ) => {
		const date = new Date();
		const monthName = date.toLocaleDateString( locale, { month: 'short' } );
		return monthName;
	}

	// build pets list
	const BuildUserPetsList = () =>{
		if( !userPets.length ) 
			return
		
		return(
		<>

			<p>
				{
					userPets.map( e => 
						<div className='row' key={e.id}>
							<div className='col-md-3 animal-wrapper'>
								<img
									className='photoAnimalThumbnail'
									src={
										e.picture
											? base_url + 'uploads/files/pets/' + e.picture
											: photoAnimalDefaultSrc
									}
									alt="Animal"
									title="Animal"
								/>
							</div>
							<div className='col-md-9'>
								<SingleFieldManager params={{
										fieldName: 	'Animaux',
										title:		getAContent('cmp_vetonest.com_Lp71Sf94Uw') + ' ' + e.nom,
										placeholder: getAContent('cmp_vetonest.com_Fc6Tz1bVnR'),
										selectedPetId: e.id,
										value: e.nom,
										type: 2, // 2 = update
									}}
								/>
								<div>
									<a
										className='animal-remove-icon'
										title={getAContent('cmp_vetonest.com_Sf8Yc1pWkZ')}
										onClick={() => handleClickRemoveAnimal(e.id)}
									>
										<i className='fa fa-trash'></i>
									</a> { getAContent( 'cmp_vetonest.com_Fo3Qm7vLpS' ) } &nbsp;
									<a
										className='animal-remove-icon'
										title={ getAContent( 'cmp_vetonest.com_Ta91Qm72Fs' ) }
										onClick={() => handleClickBooking(e.id)}
									>
										<i className='fa fa-stethoscope'></i>
									</a> { getAContent( 'cmp_vetonest.com_Ta91Qm72Fs' ) } &nbsp;
								</div>
							</div>
						</div>
					)
				}		
			</p>
		</>
		)
	}


	// form
	const [form] = Form.useForm();

	return (
		<>
			<Header />
			<ModalProfile params={{
					fieldName: visibleModalName,
					title: visibleModalTitle,
				}}
			/>
			<Modal
				title={
				  <>
					<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} /> 
					<span>{ getAContent('cmp_vetonest.com_Jk4Sd7nHrV') }</span> 
				  </>
				}
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { isModalPhotoOpen }
				onOk		= { modalPhotoHandleOk }
				onCancel	= { () => modalPhotoCancel( false ) }
				afterClose	= { modalPhotoHandleOkClosed }
				okText		= { modalPhotoConfirmText() }
				cancelText	= { modalPhotoCancelText() }
				styles={{
				  body: {
					maxHeight: '400px', // Set your desired max-height here
					overflowY: 'auto', // Add scrollbar if content exceeds max-height
				  },
				}}
			>
				<div className="profilePhotoContainerModal">
					<img 
						id="profilePhotoId" 
						src={ profilePhoto } 
					/>
				</div>
			</Modal>
			<ModalRemoveAnimal />

			<Title title = { getAContent ( 'cmp_vetonest.com_9tk5GcZYkq' ) } />
					<Form 
						form = {form}
					>
					<div className="row">
						<div className="col-md-3 ">
							<div className="">
								<div className="row justify-content-center">
									<b>{ getAContent( 'cmp_vetonest.com_t1gCGfRTd4' ) }</b><br/>
								</div>
								<div className="row">
										<img 
											className="marginTop10px profilePhotoContainer"
											src={ userProfile.picture ? 
												base_url + 'uploads/files/profile/' + userProfile.picture: 
												photoDefaultSrc 
											} 
											style={{ width: '95%' }} 
										/>
								</div>
								<div className="row justify-content-center marginTop10px">
									<Dragger {...props} > 
										<i className="fa fa-camera" aria-hidden="true"></i> { getAContent('cmp_vetonest.com_Su6Qp0zVtY') }
									</Dragger> 
								</div>
							</div>
							<div className="">
							{ profileTypeId == 2 &&
							<div style={{ marginTop: '20px' }}>
								<div className="row justify-content-center">
									<b>{ getAContent( 'cmp_vetonest.com_Vn5Xk3bHsD' ) }</b>
								</div>
								<div className="row justify-content-center" style={{ paddingLeft: '19%', paddingRight: '10%' }}>
									<p>{ userProfile.biography && truncateString( userProfile.biography, 90 ) }</p>
								</div>
								<div className="row singleFieldManager justify-content-center">
									<SingleFieldManager params={{
										fieldName: 	'Biography',
										title:		getAContent('cmp_vetonest.com_Mn2Vr7sLpQ'),
										placeholder: getAContent('cmp_vetonest.com_Pq8Xk4bHtS'),
										value: 'Biography',
										type: 2, // 2 = update
										}}
									/>
								</div>
							</div>
							}
							</div>
						</div>
						
						<div className="col-md-9">
							
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>{ getAContent('cmp_vetonest.com_Ra1Kp8mYvZ') }</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ profileTypeId == 1 ? getAContent('cmp_vetonest.com_hJ9Wv2qXsL') : getAContent('cmp_vetonest.com_Tk6Nm4bPrF') } 
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	profileTypeId == 1 ? 'Profile' : 'ProfileVeto',
													title:		getAContent('cmp_vetonest.com_Yp3Qm9rKsD'),
													placeholder: getAContent('cmp_vetonest.com_Gt4Vz6nLjH'),
													value: '', // profileNom,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<br/>
										<div className="row">
											{ getAContent('cmp_vetonest.com_Vb2Wm0pHyC') }
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Email',
													title:		getAContent('cmp_vetonest.com_Er7Hk3sBnQ'),
													placeholder: getAContent('cmp_vetonest.com_Um6Jp2vKdL'),
													value: getAContent('cmp_vetonest.com_Zq1Nc8rMbX'),
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'PasswordReset',
													title:		getAContent('cmp_vetonest.com_Pa5Ls9nQvW'),
													placeholder: getAContent('cmp_vetonest.com_Ct3Xy6mKrV'),
													value: getAContent('cmp_vetonest.com_Sn0Bd4pYtJ'),
													type: 2, // 2 = update
												}}
											/>
										</div>
										<br/>
										<div className="row">
											{ getAContent('cmp_vetonest.com_Lk8Vm1pYsQ') }
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Language',
													title:		getAContent('cmp_vetonest.com_Mr6Qh2vLpS'),
													placeholder: getAContent('cmp_vetonest.com_Ty9Nc3wKbD'),
													value: getAContent('cmp_vetonest.com_Jv4Pm7sQxF'),
													type: 1, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Country',
													title:		getAContent('cmp_vetonest.com_Gq5Vc1nLsZ'),
													placeholder: getAContent('cmp_vetonest.com_Rm2Xk8pJdH'),
													value: getAContent('cmp_vetonest.com_Bt7Nq4vPfY'),
													type: 1, // 2 = update
												}}
											/>
										</div>
										<p>&nbsp;</p>
									</div>
								</div>
								<div className="col-md-6 row">
								{ profileTypeId == 1 &&
									<>
										<div className="col-md-3">
											<b>{ getAContent('cmp_vetonest.com_Zr3Hq6mLpT') }</b>
										</div>
										<div className="col-md-9">
											<div className="row">
												{ getAContent('cmp_vetonest.com_Dp8Kx1vQmS') }
											</div>
											<div className="row" style={{marginTop:'10px'}}>
												<SingleFieldManager params={{
														fieldName: 	'Animaux',
														title:		getAContent('cmp_vetonest.com_Bx9Lm3pQsW'),
														placeholder: getAContent('cmp_vetonest.com_Vn2Yq8kHrZ'),
														value: getAContent('cmp_vetonest.com_Hc4Pt7mLsK'),
														type: 1, // 1 = create
														maxAnimals: MAX_ANIMALS, // max number of animals
														totalAnimals: userTotalAnimal, // max number of animals
													}}
												/>
											</div>
											<div className="row">
												<div className="marginTop20 marginBottom10">
													{ getAContent('cmp_vetonest.com_Aq5Fm2vNsR') } { userTotalAnimal } { getAContent('cmp_vetonest.com_Nz7Xk4pTbL') }
												</div>
												<div className="singleFieldManager">
													<BuildUserPetsList />
												</div>
											</div>
										</div>
									</>
								}
								{ profileTypeId == 2 && /** Veto **/
									<>
									<div className="col-md-3">	
										<b>{ getAContent('cmp_vetonest.com_nDHuiDhEz3') }</b>
									</div>
									<div className="col-md-9">
										<div className="row"> 
											{ userProfile.atHome ? getAContent('cmp_vetonest.com_Oc4Kx2mLpS') /** Zone d'activite **/
											: getAContent('cmp_vetonest.com_5c0GBBGNHC') /** Votre clinique **/
											} 
										</div>
										<div className="row">
											{ userProfile.atHome &&
											<div className="col-md-9">
												{
													<>
														<div className='singleFieldManager '>
															<SingleFieldManager 
																params={{
																	fieldName: 		'Etablissement_lieu',
																	title:			getAContent('cmp_vetonest.com_Pj6Rm2vSnQ'),
																	placeholder: 	getAContent('cmp_vetonest.com_Lc9Xk1bMvT'),
																	value: 			vetoCliniqueInfo.name,
																	//cliniqueId: 	vetoCliniqueInfo.cliniqueId,
																	type: 1, // 1 = modify
																}}
															/>
															<BuildVetoLieux/>
														</div>
													</>
												}
											</div>
											}
											{ !userProfile.atHome &&
											<div className="col-md-9">
													<div className="row">
													{ !vetoCliniqueInfo.id  ? // clinic creator or guest
														! aGuest	?
															<SingleFieldManager params={{
																fieldName: 	'Etablissement',
																title:		getAContent('cmp_vetonest.com_Ms8Qp2vLrT'),
																placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																value: getAContent('cmp_vetonest.com_Zp5Ln6mQrS'),
																type: 1, // 1 = create
																}}
															/>
														:
														<div className="rom">
															<div className="">
																<b>{aGuest.nom} </b>
															</div>
															<div className="">
																<a
																	className='clinic-visit'
																	title={getAContent('cmp_vetonest.com_Sf8Yc1pWkZ')}
																	onClick={() => handleClickGoToClinic( aGuest.id )}
																>
																	<i className='fa fa-ambulance'></i>&nbsp;
																	{ getAContent( 'cmp_vetonest.com_LZ4g7ZjhQh' ) }
																</a>
															</div>
														</div>
													:
															<>	
																<SingleFieldManager params={{
																	fieldName: 	'Etablissement',
																	title:		getAContent('cmp_vetonest.com_Ms8Qp2vLrT'),
																	placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																	value: vetoCliniqueInfo.nom,
																	type: 3, // 1 = create
																	goToLink: getCLinicLink (aGuest.id )
																	}}
																/>

															</>
													}
													</div>
														
													{
														vetoCliniqueInfo.id &&
														<>
															<div className="">
																<br/>
																{ getAContent('cmp_vetonest.com_Q6FO7QyF7m') }
															</div>
													
															
															<div className="singleFieldManager">
																
																	<SingleFieldManager params={{
																		fieldName: 		'Etablissement_veto',
																		title:			getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		placeholder: 	getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		value: 			getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		cliniqueId: 	vetoCliniqueInfo.cliniqueId,
																		type: 1, // 1 = create
																		}}
																	/>
																	
																<div className="">
																	<br/>
																	{ getAContent('cmp_vetonest.com_kFunk0HFRg') }
																</div>	
																<SingleFieldManager 
																	params={{
																		fieldName: 		'Etablissement_lieu',
																		title:			getAContent('cmp_vetonest.com_Pj6Rm2vSnQ'),
																		placeholder: 	getAContent('cmp_vetonest.com_Lc9Xk1bMvT'),
																		value: 			vetoCliniqueInfo.name,
																		//cliniqueId: 	vetoCliniqueInfo.cliniqueId,
																		type: 1, // 1 = modify
																	}}
																/>
																<BuildVetoLieux/>
															</div>
														</>
													}
													
												</div>
												}
											</div>
										</div>
									</>
								}
								</div>
							</div>
							{ profileTypeId == 2 &&
							<>
							<div className="row backgroundYellow" style={{height: '0.5px', marginBottom:'10px'}}>&nbsp;
							</div>
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>{ getAContent('cmp_vetonest.com_Uy2Kp6mQrS') }</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ getAContent('cmp_vetonest.com_Ox5Qm1vLpT') }
										</div>
										<BuildTimeslot />
										<p>&nbsp;</p>
									</div>
								</div>
								<div className="col-md-6 row">
								
									<div className="col-md-3">
										<b>{ getAContent('cmp_vetonest.com_Pq9Xk2mLsV') }</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ getAContent('cmp_vetonest.com_Bn6Lp3vQrS') }
										</div>
										<div className="row">
											<div className="col-md-9">
												<div className="row singleFieldManager">
													<SingleFieldManager params={{
															fieldName: 	'Absence',
															title:		getAContent('cmp_vetonest.com_Lm7Qp4vHrT'),
															placeholder: getAContent('cmp_vetonest.com_Gn2Xk8bPsV'),
															value: getAContent('cmp_vetonest.com_Ar5Ft9mQsL'),
															type: 1, // 1 = create
														}}
													/>
												</div>
											</div>
											<div className="col-md-9">
												<br/>
												<div className="row">
													<>{ getAContent('cmp_vetonest.com_Cq1Vm8nLsP') } { countAbsence } { getAContent('cmp_vetonest.com_Zr4Kp6mQtW') }<br/></>
												</div>
													<BuildAbsence />
											</div>
										</div>
									</div>
								</div>
							</div>
							</>
							}
							<div className="row backgroundYellow" style={{height: '0.5px', marginBottom:'10px'}}>&nbsp;
							</div>
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>{ getAContent('cmp_vetonest.com_Hr3Wk6mLpS') }</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ getAContent('cmp_vetonest.com_Jn5Qv2mLpR') }
										</div>										
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'FirstName',
													title:		getAContent('cmp_vetonest.com_Pm6Qv2nLsR'),
													placeholder: getAContent('cmp_vetonest.com_St9Xk1bHvW'),
													value: firstName,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Name',
													title:		getAContent('cmp_vetonest.com_Nq8Lp3vMtS'),
													placeholder: getAContent('cmp_vetonest.com_Rt4Vn1bKsD'),
													value: name,
													type: 2, // 2 = update
												}}
											/>
										</div>

										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Sexes',
													title:		getAContent('cmp_vetonest.com_Yr7Qp1vLsD'),
													placeholder: getAContent('cmp_vetonest.com_Mn2Xk8bPrV'),
													value: userProfile.userSexeId && ( userProfile.userSexeId == 1 ? getAContent('cmp_vetonest.com_A91fd73KsP') : getAContent('cmp_vetonest.com_w31LdP9aQs') ), // userProfile.userSexeId
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'BirthDate',
													title:		getAContent('cmp_vetonest.com_Oq4Vp2mLsR'),
													placeholder: getAContent('cmp_vetonest.com_Ur1Xk6bPsM'),
													value: dateNaissance,
													type: 2, // 2 = update
												}}
											/>
										</div>
										
										{ /**
										<div className="row profileLanguageSelector">
											<LanguageSelector 
												toPersist 	= { true } 
												flag 		= { false }
												context		= { false }
											/>
										</div>
										<p>&nbsp;</p>
										<div className="row">
											{ getAContent('cmp_vetonest.com_Lk8Vm1pYsQ') }
										</div>
										<div className="row profileLanguageSelector">
											<CurrencySelector />
										</div>
										<p>&nbsp;</p> **/
										}
									</div>
								</div>
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>{ getAContent('cmp_vetonest.com_Xp6Qv2mLsR') }</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ getAContent('cmp_vetonest.com_FLBx5ixGp5') }
										</div>
										<div className="row">
											<div className="col-md-9">
												{ getAContent('cmp_vetonest.com_wI6NjnXH8S') }
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Form>
				
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default Profile;
