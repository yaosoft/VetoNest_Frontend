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
		getEtablissementVeto,
		especes,
		races,
		speciesBreedList
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
	const MAX_LIEUX = 2; // max number of paces
	
	// animals
	const MAX_ANIMALS = 4; // max number of animals
	const [ breedNames, setBreedNames ] = useState( [] ); 
	
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
	const [ countClinicVets, setCountClinicVets] = useState( 0 );
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
				
				// count veterinaries
				if( vetoCliniqueInfo ) {
					const statusId = 2; // invitation accepted ( clinic member )
					const vetos = await getEtablissementVeto( statusId, vetoCliniqueInfo.id);

					setCountClinicVets(vetos.length);
				}
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
	}, [ modalProfileIdentityOpen, profileFormUpdated, fileList ] ); 

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
				else if ( !userProfile.atHome && vetoCliniqueInfo ){
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
											getDayName( e[0] ) + ' ' + ( e[1].closedDate ?  ' ' + dayjs( e[1].closedDate.date ).format( 'DD' ) + ' ' + getMonthName( dayjs( e[1].closedDate.date ).format( 'MM' ) ) + ': ' + getStatus( e[1].type ) : ': ' + getAContent('cmp_vetonest.com_Nx55Qa02Df') ),
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
		if( !vetoLieux.length )
			return
		
		return(
			vetoLieux.map( ( e, index ) => 
			<>			
				<div className="singleFieldManager">
					<SingleFieldManager 
							key={'lieux_' + index}
							params={{
								fieldName: 		'Etablissement_lieu',
								lieuId: 		e.id,
								title:			truncateString( e.adresse, 40 ),
								// placeholder:	e.adresse,
								value: 			truncateString( e.adresse, 30 ),
								type: 			2, // 2 = update
							}}
					/>
					<p>&nbsp;</p>
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

	// separator
	const SectionSeparator = () => (
	  <div className="row my-4">
		<div className="col-12 col-lg-9 offset-lg-3">
		  <div className="section-separator" />
		</div>
	  </div>
	);

	// get breed Name
	useEffect(() => {
	  const loadBreeds = async () => {
		const map = {};

		for (const pet of userPets) {
		  if (pet?.espece?.id && pet?.race?.id) {
			const breeds = await speciesBreedList(pet.espece.id);
			const breed = breeds.find(b => b.id === pet.race.id);
			map[pet.id] = breed ? breed.nom : '—';
		  }
		}

		setBreedNames(map);
	  };

	  if (userPets?.length) {
		loadBreeds();
	  }
	}, [userPets]);

	// build pets list 
	const BuildUserPetsList = () =>{ 
		if( !userPets.length ) 
			return
		
		return(
		<>
				{
					userPets.map( e => (
						<div className="pet-card" key={e.id}>

						  {/* Name + Edit */}
						  <div className="pet-actions-primary">
							<SingleFieldManager
							  params={{
								fieldName: 'Animaux',
								title: getAContent('cmp_vetonest.com_Lp71Sf94Uw') + ' ' + e.nom,
								placeholder: getAContent('cmp_vetonest.com_Fc6Tz1bVnR'),
								selectedPetId: e.id,
								value: e.nom,
								type: 2,
							  }}
							/>
						  </div>

						  {/* Photo + description */}
						  <div className="pet-photo-row">

							<div className="pet-photo">
							  <div className="animal-photo-wrapper">
								<img
								  src={
									e.picture
									  ? base_url + 'uploads/files/pets/' + e.picture
									  : photoAnimalDefaultSrc
								  }
								  alt={e.nom}
								/>
							  </div>
							</div>

							<div className="pet-meta">
							  <div className="pet-meta-line">
								<strong>{getAContent('cmp_vetonest.com_Sp94Te63Kz')}</strong> : { especes.filter( j => j.id == e.espece.id ) [0] ? 
								getAContent( especes.filter( j => j.id == e.espece.id ) [0].tagRef ) : '—' }
							  </div>
							  <div className="pet-meta-line">
								<strong>{getAContent('cmp_vetonest.com_Br61Mx80Qp')}</strong> : {breedNames[e.id] || '—'}
							  </div>
							  <div className="pet-meta-line">
								<strong>{getAContent('cmp_vetonest.com_ZEuz13yjyi')}</strong> : {e.sexe.id == 1 ? getAContent( 'cmp_vetonest.com_Hs73Lm20Qw' ) : getAContent( 'cmp_vetonest.com_Fm59Qa21Rt' ) }
							  </div>
							</div>

						  </div>

						  {/* Actions */}
						  <div className="pet-actions-secondary">
							<button className="btn-consultation">Consultation</button>
							<button className="btn-delete">Supprimer</button>
						  </div>

						</div>

					))

				}	
		</>
		)
	}


	// form
	const [form] = Form.useForm();

	return (
		<>

		  <div className="sticky-stack">
			<Header />
			<Title title={getAContent( 'cmp_vetonest.com_9tk5GcZYkq' )} />
		  </div>
			
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

			<div className="profile-page">
					<Form form={form}>
  <div className="container-fluid profile-page">

    {/* ================= DESKTOP GRID ================= */}
    <div className="row gx-4">

      {/* ========== LEFT COLUMN : PHOTO ========== */}
      <div className="col-12 col-lg-3">
        <div className="profile-photo-block text-center">

          <b>{getAContent('cmp_vetonest.com_t1gCGfRTd4')}</b>
			
          <img
            className="profilePhotoContainer mt-3"
            src={
              userProfile.picture
                ? base_url + 'uploads/files/profile/' + userProfile.picture
                : photoDefaultSrc
            }
            style={{ width: '100%' }}
          />
			<div className="gray">
			{ getAContent( 'cmp_vetonest.com_Ph44Pr11Pu' ) }
			</div>
          <div className="mt-3">
            <Dragger {...props}>
              <i className="fa fa-camera" />{' '}
              {getAContent('cmp_vetonest.com_Su6Qp0zVtY')}
            </Dragger>
          </div>
			
        </div>
		<p>&nbsp;</p>
      </div>

      {/* ========== RIGHT COLUMN : CONTENT ========== */}
      <div className="col-12 col-lg-9">

        {/* ================= MY ACCOUNT ================= */}
        <div className="row align-items-start mb-5">

          {/* Label */}
          <div className="col-12 col-lg-3">
            <strong>{getAContent('cmp_vetonest.com_Ra1Kp8mYvZ')}</strong>
			<p className="columnLabelText gray">{ getAContent( 'cmp_vetonest.com_Pr55St88Mg' ) }</p>
			<p>&nbsp;</p>
          </div>

          {/* Content */}
          <div className="col-12 col-lg-9">
		  {/* Email */}
										<div className="mb-4">
										  {getAContent('cmp_vetonest.com_Id99En44Ti')}
										</div>
										<div className="marginTop10"></div>
										  <SingleFieldManager
											params={{
											  fieldName: 'Email',
											  title: getAContent('cmp_vetonest.com_Er7Hk3sBnQ'),
											  placeholder: getAContent('cmp_vetonest.com_Um6Jp2vKdL'),
											  value: getAContent('cmp_vetonest.com_Zq1Nc8rMbX'),
											  type: 2,
											}}
										  />
										<div className="marginTop10"></div>
										{/* Password */}
										  <SingleFieldManager
											params={{
											  fieldName: 'PasswordReset',
											  title: getAContent('cmp_vetonest.com_Pa5Ls9nQvW'),
											  placeholder: getAContent('cmp_vetonest.com_Ct3Xy6mKrV'),
											  value: getAContent('cmp_vetonest.com_Sn0Bd4pYtJ'),
											  type: 2,
											}}
										  />
										<div className="marginTop10"></div>
			{/* Profile type */}
										<div className="mb-2">
										  {profileTypeId == 1
											? getAContent('cmp_vetonest.com_hJ9Wv2qXsL')
											: getAContent('cmp_vetonest.com_Tk6Nm4bPrF')}
										</div>
										<div className="marginTop10"></div>
										  <SingleFieldManager
											params={{
											  fieldName: profileTypeId == 1 ? 'Profile' : 'ProfileVeto',
											  title: getAContent('cmp_vetonest.com_Yp3Qm9rKsD'),
											  placeholder:
												profileTypeId == 1
												  ? getAContent('cmp_vetonest.com_Gt4Vz6nLjH')
												  : getAContent('cmp_vetonest.com_Nr84Qs29Lp'),
											  value: '',
											  type: 2,
											}}
										  />
										<div className="marginTop10"></div>
										{/* Preferences */}
										<div className="mb-2">
										  {getAContent('cmp_vetonest.com_Lk8Vm1pYsQ')}
										</div>
										  <div className="marginTop10"></div>
										  <SingleFieldManager
											params={{
											  fieldName: 'Language',
											  title: getAContent('cmp_vetonest.com_Mr6Qh2vLpS'),
											  placeholder: getAContent('cmp_vetonest.com_Ty9Nc3wKbD'),
											  value: getAContent('cmp_vetonest.com_Jv4Pm7sQxF'),
											  type: 1,
											}}
										  />
											<div className="marginTop10"></div>
										  <SingleFieldManager
											params={{
											  fieldName: 'Country',
											  title: getAContent('cmp_vetonest.com_Gq5Vc1nLsZ'),
											  placeholder: getAContent('cmp_vetonest.com_Rm2Xk8pJdH'),
											  value: getAContent('cmp_vetonest.com_Bt7Nq4vPfY'),
											  type: 1,
											}}
										  />

          </div>
        </div>

        <SectionSeparator />

        {/* ================= MY ANIMALS ================= */}
        {profileTypeId === 1 && (
          <div className="row align-items-start mt-5">

            {/* Label */}
            <div className="col-12 col-lg-3">
              <strong>{getAContent('cmp_vetonest.com_Zr3Hq6mLpT')}</strong>
			  <p className="columnLabelText gray">{ getAContent( 'cmp_vetonest.com_An88Mt11Vr' ) }</p>
			  <p>&nbsp;</p>
            </div>

            {/* Content */}
            <div className="col-12 col-lg-9">

              <p className="mb-3">
                {getAContent('cmp_vetonest.com_Dp8Kx1vQmS')}
              </p>

              <SingleFieldManager
                params={{
                  fieldName: 'Animaux',
                  title: getAContent('cmp_vetonest.com_Bx9Lm3pQsW'),
                  placeholder: getAContent('cmp_vetonest.com_An77Rg33Pt'),
                  value: '',
                  type: 1,
                  maxAnimals: MAX_ANIMALS,
                  totalAnimals: userTotalAnimal,
                }}
              />

              <div className="mt-3">
                {getAContent('cmp_vetonest.com_Aq5Fm2vNsR')}{' '}
                {userTotalAnimal}{' '}
                {getAContent('cmp_vetonest.com_Nz7Xk4pTbL')}
              </div>

              <div className="mt-3">
                <BuildUserPetsList />
              </div>

            </div>
          </div>
        )}
	{/* ================= Activity area ================= */}
    { profileTypeId == 2 && (
	
      <div className="row section-row activity-area-section">
        <div className="col-12 col-lg-3 section-label">
          <b>{getAContent('cmp_vetonest.com_nDHuiDhEz3')}</b>
		  <p className="columnLabelText gray">{ getAContent( 'cmp_vetonest.com_Cl11Mg99Zon' ) } </p>
		  <p>&nbsp;</p>
        </div>

        <div className="col-12 col-lg-9 section-content">
			{ /**  Activity area - Title  **/ }
           <p className="mb-3"> 
            {userProfile.atHome
              ? getAContent('cmp_vetonest.com_Oc4Kx2mLpS')
              : getAContent('cmp_vetonest.com_5c0GBBGNHC')}
          </p>

          {/*  Activity area - Clinic management for bot a Home vet */}
          { /**  Activity area - doctor at home  **/ }
											{ userProfile.atHome &&
												
													<>
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
													</>
												
											}

          {/* CLINIC */}
          { /** activity area - doctor at Clinic **/ }
											{ !userProfile.atHome &&
											<div className="col-md-9"> 
													<div className="marginTop10">
													{/** Activity area - doctor at Clinic - clinic creator **/}
													{ !vetoCliniqueInfo  ? // clinic creator or doctor
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
													{ /** Activity area - doctor at Clinic **/ }
															
															<div className='width100per100 marginTop10px'>
																<SingleFieldManager params={{
																		fieldName: 	'Etablissement',
																		title:	getAContent('cmp_vetonest.com_Su6Qp0zVtY') + ' ' + vetoCliniqueInfo.nom,
																		placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																		value: vetoCliniqueInfo.nom,
																		type: 2, // 3 = link
																		goToLink: getCLinicLink (aGuest.id )
																	}}
																/>
															</div>
															<div className='marginTop2'>	
																<a
																	href={ getCLinicLink( vetoCliniqueInfo.id ) }
																	className='text-info'
																>
																	{ getAContent( 'cmp_vetonest.com_Tb91Qw4NcR' ) } >
																</a>
															</div>
														</>
													}
													</div>
													{ /** Activity area - localization **/ }
													{
														vetoCliniqueInfo &&
														<>
															<div className="marginTop10px">
																{ 
																	getAContent('cmp_vetonest.com_Q6FO7QyF7m') + ' (' +
																	countClinicVets + ')' }
															</div>
															<div className="singleFieldManager">
																
																	<SingleFieldManager params={{
																		fieldName: 		'Etablissement_veto',
																		title:			getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		placeholder: 	getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		value: 			getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		cliniqueId: 	vetoCliniqueInfo.id,
																		type: 1, // 1 = create
																		}}
																	/>
															</div>
																<div className="marginTop25px">
																	{ getAContent('cmp_vetonest.com_kFunk0HFRg') } {
																		/* Emplacement*/}
																</div>	
															<div className="singleFieldManager">
																<SingleFieldManager 
																	params={{
																		fieldName: 		'Etablissement_lieu',
																		title:			getAContent('cmp_vetonest.com_Pj6Rm2vSnQ'),
																		placeholder: 	getAContent('cmp_vetonest.com_Lc9Xk1bMvT'),
																		value: 			vetoCliniqueInfo.name,
																		//cliniqueId: 	vetoCliniqueInfo.cliniqueId,
																		type: 1, // 1 = create
																	}}
																/>
																	
															</div>
															<BuildVetoLieux/>
														</>
													}
													
												</div>
											}

          
        </div>
      </div>
    )}
	<SectionSeparator />
	{/* ================= Doctor timeslot ================= */}
	{profileTypeId === 2 && (
  <>

    <div className="row align-items-start mt-5">

      {/* Label */}
      <div className="col-12 col-lg-3">
        <strong>{getAContent('cmp_vetonest.com_Kp72Rm84Qs')}</strong>
		<p className="columnLabelText gray">{ getAContent( 'cmp_vetonest.com_Sk22Op88Ab' ) } </p>
		<p>&nbsp;</p>
      </div>

      {/* Content */}
      <div className="col-12 col-lg-9">

        {/* Description */}
        <div className="mb-3">
          {getAContent('cmp_vetonest.com_Ox5Qm1vLpT')}
        </div>

        {/* Timeslot builder */}
        <BuildTimeslot />

        <div className="mb-3">
          {getAContent('cmp_vetonest.com_Bn6Lp3vQrS')}
        </div>

        {/* Absence manager */}
        <div className="row singleFieldManager">
          <SingleFieldManager
            params={{
              fieldName: 'Absence',
              title: getAContent('cmp_vetonest.com_Nx55Qa02Df'),
              placeholder: getAContent('cmp_vetonest.com_Nx55Qa02Df'),
              value: getAContent('cmp_vetonest.com_Ar5Ft9mQsL'),
              type: 1,
            }}
          />
        </div>

        <div className="mb-3">
          {getAContent('cmp_vetonest.com_Cq1Vm8nLsP')}{' '}
          {countAbsence}{' '}
          {getAContent('cmp_vetonest.com_Zr4Kp6mQtW')}
        </div>

        <div className="mt-3">
          <BuildAbsence />
        </div>

      </div>
    </div>
	<SectionSeparator />
	{/* ================= Consultations ================= */}
	<div className="row align-items-start mt-5">

      {/* Label */} 
      <div className="col-12 col-lg-3">
        <strong>{ getAContent('cmp_vetonest.com_Xp6Qv2mLsR') }</strong>
	<p className="columnLabelText gray">{ getAContent( 'cmp_vetonest.com_Cn33Lt11Hs' ) }</p>
		<p>&nbsp;</p>
      </div>

      {/* Content */}
      <div className="col-12 col-lg-9">
			<div className="row marginLeft20 marginLeftRight2percent">
				{ getAContent('cmp_vetonest.com_FLBx5ixGp5') }
			</div>
			<div className="row">
				<div className="col-md-9 marginLeftRight2percent">
					{ getAContent('cmp_vetonest.com_wI6NjnXH8S') }
				</div>
			</div>
	  </div>
	
	</div>
	
  </>
)}

	
      </div>
    </div>
  </div>
</Form>

				</div>
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default Profile;
