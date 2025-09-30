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
		modalProfileIdentityOpen
	} = useContext( SiteContext );

	const [ profile, setProfile ] = useState( '' );
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );
	// count user's pets
	const [ userTotalAnimal, setUserTotalAnimal ] = useState( 0 );
	// count vet absence
	const [ countAbsence, setCountAbsence ] = useState( 0 ); 
	// count vet absence
	const [ countHollydays, setCountHollydays ] = useState( 0 ); 

	const [ selectedLanguageId, setSelectedLanguageId ] = useState( user ? user.languageId : defaultLanguageId ); 
	
	const [ spin, setSpin ] = useState( 'none' );

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

// console.log( 'info.file', info.file );

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
	}, [fileList]); // Dependency array ensures effect runs when isModalOpen changes


	const modalPhotoHandleOk = async() => {
		var data = {};
		data[ 'profileId' ] = profileId;
		const rep = await profileUpdate ( data, profilePhoto, profileTypeId );
		
		if( rep ){
			message.success( 'Updated!' );
			const random = generateRandomDigits(3);
			// setFormUpdated( random );
			setProfileFormUpdated( random );
		}
		else{
			message.error( 'not Updated!' )
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
		return "D'accord"
	}
	const modalPhotoCancelText = () => {
		return "Annuler"
	}

	const handleClickRemoveAnimal = ( animalId )  => {		

		// get user payment method
		const animal = userPets.filter( e => e.id == animalId )[ 0 ];
		setSelectedAnimal( animal );
		setModalRemoveAnimalOpen( true )
		// removeAnimalOpen( userPaymentMethodId )
	}


	const [ name, setName ] 			= useState( '' );
	const [ firstName, setFirstName ] 	= useState( '' );
	const [ dateNaissance, setDateNaissance ] = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const [ profileNom, setProfileNom ] = useState( '' );
	useEffect(() => {
		if( modalProfileIdentityOpen === true )
			return
		// get user profile info
		const a = async () => {
// console.log( '>>> user', user );
// console.log( 'profileId: ' + profileId + 'profileTypeId: ' + profileTypeId );
			const profile = await profileGet( profileId, profileTypeId );
// console.log( '>>> profile', profile );
			setUserProfile( profile );
			// setSiteLocale( siteLocale );
			// name
			const name = profile.nom;
			setName( name );
			// first name
			const firstName = profile.prenom;
			setFirstName( firstName );
			// siteLocale
			// const siteLocale = siteLanguage ? siteLanguage + '-' + siteLanguage.toUpperCase() : 'en-EN';
			// birth date
			const birthDate = profile.dateNaissance ? profile.dateNaissance.date : ''; 
			const dateNaissance = birthDate ? await dateFormater( birthDate ) : '';
			setDateNaissance( dateNaissance );
			// biography
			const biography = profile.biography
			setBiography( biography );
			// profile nom texte
			const profileNom = profile.nom && truncateString( profile.nom, 12 );
			setProfileNom( profileNom )
			// veto timeslot
			const timeslotObj = await getTimeslot( profile.id );
			const timeslot = await Object.entries( timeslotObj );
// console.log( '*********** timeslot', timeslot );
			setTimeslot( timeslot );
			// veto absences
			const absences = await getAbsences( profile.id );
// console.log( '*********** absences', absences );
			setAbsences( absences ); 
			setCountAbsence( absences.length );
			// system hollydays
			const hollydays = await getHollydays( profile.id );
// console.log( '*********** hollydays', hollydays );
			setHollydays( hollydays );
			setCountHollydays( hollydays.length );
console.log( '+++++++++++++ ModalProfileIdentityOpen', modalProfileIdentityOpen );
		}
		a();
	}, [ modalProfileIdentityOpen ] ); // Dependency array ensures effect runs when changes

//  [ visibleModalName, profile_sexe_male, profile_sexe_female, siteLanguage, profileFormUpdated ] ); // Dependency array ensures effect runs when changes

	useEffect(() => {
		// get user pet'
		const a = async() => {
			const userPets = await getUserPets( profileId );
// console.log( '>>>>>>>>>> profile', profile );
			if( userPets.length ){
				// profile.userPets = userPets;
				setUserPets( userPets );
				// count user animal
				const countUserAnimal = userPets.length;
				setUserTotalAnimal( countUserAnimal );
			}
		}
		a()
	}, [] );

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
		
// console.log( '---------- timeslot', timeslot )
		return(
			timeslot.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager 
						key={'timeslot_' + index}
						params={{
							fieldName: 		getFieldName( e[1].type ),
							title:			e[1].opened ? 'Opened' : 'Closed',
							nom:			e[1].nom ? e[1].nom : '',
							description:	e[1].description ? e.description : '',
							placeholder:	'Horaire',
							value: 			e[1].opened ? getDayName( e[0] ) + ': ' +   
												getHoraire( e[1].startTime.date, e[1].endTime.date ) :
											getDayName( e[0] ) + ' ' + ( e[1].closedDate ?  ' ' + dayjs( e[1].closedDate.date ).format( 'DD' ) + ' ' + getMonthName( dayjs( e[1].closedDate.date ).format( 'MM' ) ) + ': ' + getStatus( e[1].type ) : ': closed' ),
							style:			e[1].opened ? 'opened' : 'closed',
							startTime:		e[1].opened ? e[1].startTime.date : '',
							endTime:		e[1].opened ? e[1].endTime.date : '',
							opened:			e[1].opened ? e[1].opened : '',
							day:			getDayName( e[0] ),
							type: 			2, // 2 = update
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
							title:			'Modifier une absence',
							nom:			e.nom,
							selectedAbsenceId:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	'Absence',
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
							title:			'Hollydays',
							nom:			e.nom,
							selectedHollyday:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	'Hollydays',
							value: 			truncateString( e.nom, 10 ) + ', ' + dayjs( e.closedDate.date ).format( 'DD' ) + ' ' + 
							getMonthName( dayjs( e.closedDate.date ).format( 'MM' ) ),
							style:			'closed',
							type: 			2, // 2 = update
							
						}}
					/>
				</div>
			)
		)
	}

	// Get a day name from day number
	const getDayName = ( dayNumber, locale = siteLocale ) => {
		// Create a Date object. The specific date doesn't matter as we only need the day of the week.
		// We set it to a Sunday (e.g., January 1, 2000) and then adjust the day.
		const date = new Date(2000, 0, 1); // January 1, 2000 was a Saturday, so we adjust.
		date.setDate(date.getDate() + dayNumber); // Add the dayNumber to get the correct day of the week.
		// Use toLocaleDateString to get the day name in the specified locale.
		// The 'weekday: "long"' option ensures the full name is returned.
		
		const dayName = date.toLocaleDateString( locale, { weekday: 'long' } );

// console.log( `>>>>>> Day number: ${dayNumber} Day name: ${dayName}` );
		
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
						<div className='row' style={{marginBottom:'15px'}}>
							<div className='col-md-3'>
								<img  
									className='photoAnimalThumbnail'
									src = { e.picture ? 
											base_url + 'uploads/files/pets/' + e.picture: 
											photoAnimalDefaultSrc 
									}
								/>
								<a 
									onClick={ ( ev ) => handleClickRemoveAnimal( e.id ) }
								>
									<i className="fa fa-trash text-danger">&nbsp;<span className='text-info'>delete</span></i> 
								</a>
							</div>
							
							<div className='col-md-9'>
								<SingleFieldManager params={{
										fieldName: 	'Animaux',
										title:		'Update ' + e.nom + ' info',
										placeholder: 'Edit pet data',
										selectedPetId: e.id,
										value: e.nom,
										type: 2, // 2 = update
									}}
								/>
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
					title: 'FOo', //title,
				}}
			/>
			<Modal
				title={
				  <>
					<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} /> 
					<span>Modifier votre photo</span> 
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
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			
			<Title title = { profile_title } />
					<Form 
						form = {form}
					>
					<div className="row">
						
						<div className="col-md-3 ">
							<div className="row justify-content-center">
								<b>Photo</b><br/>
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
									<i className="fa fa-camera" aria-hidden="true"></i> Modifier
								</Dragger> 
							</div>
						</div>
						<div className="col-md-9">
							
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Mon compte</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											{ profileTypeId == 1 ? 'Profile' : 'Profile Pro' } 
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	profileTypeId == 1 ? 'Profile' : 'ProfileVeto',
													title:		'Modifier mon profile',
													placeholder: 'Nom, age, address ...',
													value: profileNom,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<br/>
										<div className="row">
											Connexion
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Email',
													title:		'Modifier mon email',
													placeholder: 'Email ...',
													value: 'Modify my email',
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'PasswordReset',
													title:		'Modifier mon mot de passe',
													placeholder: 'Password reset',
													value: 'Modify my password',
													type: 2, // 2 = update
												}}
											/>
										</div>
										<br/>
										<div className="row">
											Langue et pays
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Language',
													title:		'Langue du compte',
													placeholder: 'Langue du compte ...',
													value: 'Langue du compte',
													type: 1, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Country',
													title:		'Pays du compte',
													placeholder: 'Pays du compte',
													value: 'Pays du compte',
													type: 2, // 2 = update
												}}
											/>
										</div>
										<p>&nbsp;</p>
									</div>
								</div>
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Mes animaux</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Carnet de santé
										</div>
										<div className="row">
											<div className="col-md-9">
												<div className="row singleFieldManager">
													<SingleFieldManager params={{
															fieldName: 	'Animaux',
															title:		'Ajouter un animal',
															placeholder: 'Animal ...',
															value: 'Ajouter un animal',
															type: 1, // 1 = create
														}}
													/>
												</div>
											</div>
											<div className="col-md-9">
												<br/>
												<div className="row">
													Vous avez { userTotalAnimal } animaux<br/>
												</div>
												<div className="row singleFieldManager">
													<BuildUserPetsList />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row backgroundYellow" style={{height: '2px', marginBottom:'10px'}}>&nbsp;
							</div>
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Ouverture</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Horaires
										</div>
										<BuildTimeslot />
										<p>&nbsp;</p>
										<div className="row">
											Devise
										</div>
										<div className="row profileLanguageSelector">
											<CurrencySelector />
										</div>
										<p>&nbsp;</p>
									</div>
								</div>
								<div className="col-md-6 row">
								{ profileTypeId == 2 &&
								<>
									<div className="col-md-3">
										<b>Fermetures</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Absence
										</div>
										<div className="row">
											<div className="col-md-9">
												<div className="row singleFieldManager">
													<SingleFieldManager params={{
															fieldName: 	'Absence',
															title:		'Ajouter une absence',
															placeholder: 'Absence',
															value: 'Ajouter une absence',
															type: 1, // 1 = create
														}}
													/>
												</div>
											</div>
											<div className="col-md-9">
												<br/>
												<div className="row">
													Vous avez { countAbsence } absence programmée<br/>
												</div>
													<BuildAbsence />
											</div>
										</div>
									</div>
								</>
								}
								</div>
							</div>
							<div className="row backgroundYellow" style={{height: '2px', marginBottom:'10px'}}>&nbsp;
							</div>
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Identité</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											User identification
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Name',
													title:		'Update user name',
													placeholder: 'No name',
													value: name,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'FirstName',
													title:		'Update user first name',
													placeholder: 'No firstname',
													value: firstName,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Sexes',
													title:		'Your genre',
													placeholder: 'Please Select sexe',
													value: eval(userProfile.userSexeTagClass),
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'BirthDate',
													title:		'Update the date',
													placeholder: 'Your birth date',
													value: dateNaissance,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row singleFieldManager">
											<SingleFieldManager params={{
													fieldName: 	'Biography',
													title:		'Something about you',
													placeholder: 'Biographie',
													value: biography,
													type: 2, // 2 = update
												}}
											/>
										</div>
										<div className="row profileLanguageSelector">
											<LanguageSelector 
												toPersist 	= { true } 
												flag 		= { false }
												context		= { false }
											/>
										</div>
										<p>&nbsp;</p>
										<div className="row">
											Devise
										</div>
										<div className="row profileLanguageSelector">
											<CurrencySelector />
										</div>
										<p>&nbsp;</p>
									</div>
								</div>
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Payment</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Payment Methods
										</div>
										<div className="row">
											<div className="col-md-9">
												Foo
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Form>
				<div className="displayNone">
					<span 
						id = "cmp_vetonest.com_XdIUc8X4MG"
						className ="profile_sexe_male" 
					>
						Homme
					</span>
					<span 
						id = "cmp_vetonest.com_PuaOtP8HrQ"
						className ="profile_sexe_female" 
					>
						Femme
					</span>
					<span 
						id = "cmp_vetonest.com_Cdm1dvyDO1"
						className ="profile_title" 
					>
						Mon profile
					</span>

				</div>							
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default Profile;
