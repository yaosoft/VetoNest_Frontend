import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Country, State, City }  from 'country-state-city';
import { 
    ExclamationCircleOutlined,
    DeleteOutlined, 
    LockOutlined, 
    UnlockOutlined, 
    UserOutlined, 
    CalendarOutlined, 
    ManOutlined, 
    WomanOutlined, 
    GlobalOutlined, 
    EnvironmentOutlined, 
    HomeOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    EditOutlined, 
    InfoCircleOutlined, 
    LinkOutlined,
    EuroCircleOutlined,
    SafetyOutlined,
    MedicineBoxOutlined,
    CarOutlined,
    CompassOutlined,
} from '@ant-design/icons';

import { ConfigProvider, Form, Input, Select, Divider, Radio, Checkbox } from 'antd';

import { Space,  DatePicker, Modal, Spin, Button, notification, message, Popconfirm, Upload, TimePicker } from 'antd';
import dayjs from 'dayjs';


import locale_fr from 'antd/locale/fr_FR';
import locale_en from 'antd/locale/en_US';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_it from 'antd/locale/it_IT';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/it';
import VetName from './VetName';

import InputCode from "./InputCode";

const ModalProfile = ( params ) => {
	const { 
		getUser,
		setUser,
		profileTypeId,
		profileId,
		userId,
		user,
		isValidPassword,
		logIn
	} = useContext( AuthContext );

	const {
		base_url,
		siteName,
		siteEmail,
		siteUrl,
		siteDomain,
		siteDomainName,
		signUp_popConfirmPetDescription,
		signUp_codeTitle,
		signUp_popConfirmVetDescriptionn,
		signUp_codeIntro,
		signUp_codeLabel,
		signUp_codeCorrect,
		signUp_codeIncorrect,
		signUp_codeResend,
		checkEmail, 
		sendEmail,
		insertSpaceAtPosition,
		modalProfileIdentityOpen,
		setModalProfileIdentityOpen,
		signUp_firstNameErrorText,
		signUp_nameErrorText,
		signUp_correctErrors,
		profileUpdate,
		signUp_nameEmpty,
		profileIdentity_firstNameEmpty,
		profileIdentity_sexeEmpty,
		userProfile,
		visibleModalName,
		setVisibleModalName,
		visibleModalTitle,
		setVisibleModalTitle,
		signUp_firstNamePlaceholder,
		signUp_namePlaceholder,
		signUp_verifyEmailSubjet,
		signUp_popConfirmPetTitle,
		profileIdentity_sexeErrorText,
		setProfileFormUpdated,
		profileFormUpdated,
		generateRandomDigits,
		siteLanguage,
		dateFormater,
		siteLocale,
		language_french,
		language_english,
		language_spanish,
		language_german,
		language_italian,
		language_estonian,
		country_france,
		country_italy,
		country_suiss,
		country_belgium,
		country_spain,
		country_germain,
		country_estonia,  // add this
		country_usa,      // add this
		country_uk,       // add this
		country_canada,   // add this	
		country_australia,		
		profileIdentity_addressPlaceholder,
		profileIdentity_addressErrorText,
		profileIdentity_codePostalErrorText,
		profileIdentity_codePostalPlaceholder,
		profileIdentity_villePlaceholder,
		profileIdentity_villeErrorText,
		profileIdentity_countryDefault,
		profileIdentity_stateDefault,
		profileIdentity_updateEmailError,
		profileIdentity_updateEmailSuccess,
		profileIdentity_cityDefault,
		signUp_emailErrorText,
		signUp_emailPlaceholder,
		signUp_popConfirmVetTitle,
		signUp_popConfirmYes,
		signUp_popConfirmDeleteBtn,
		signUp_popConfirmVetDescription,
		updateEmail,
		signUp_accountCreationFails,
		signUp_accountCreationSuccess,
		verificationCode,
		verificationUserId,
		setVerificationCode,
		setVerificationUserId,
		updatePassword,
		signUp_passwordErrorText,
		signUp_passwordRepeatErrorText,
		passwordForgot_updateSuccess,
		signUp_passwordPlaceholder,
		signUp_passwordRepeatPlaceholder,
		signUpPasswordRepeat,
		signUp_termsUsage,
		passwordForgotReset_title,
		profileAnimal_animalNameErrorText,
		profileAnimal_animalNamePlaceHolder,
		profileAnimal_animalEspeceErrorText,
		profileAnimal_animalRaceErrorText,
		speciesList,
		speciesBreedList,
		selectedPetId,
		editUserPets,
		userPets,
		languages,
		countriesAllowed,
		especes,
		getBase64,
		selectedLanguageId,
		updateLanguagePreference,
		setSelectedLanguageId,
		languageSetup,
		profileVeto_nameErrorText,
		allSpecialities,
		allEtablissementTypes,
		// validateRppsNumber,
		// validateSiretNumber,
		phoneNumberErrorText,
		phoneNumberErrorText02,
		absences,
		hollydays,
		timeslot,
		selectedAbsenceId,
		selectedHollydayId,
		timeSlotClosedDateUpdate,
		timeSlotDateUpdate,
		setSelectedAbsenceId,
		timeSlotClosedDateRemove,
		selectedTimeslotOpen,
		timeSlotDayClose,
		etablissementUpdate,
		saveLieu,                    // renamed from etablissementLieuUpdate
		selectedLieuId,
		setSelectedLieuId,
		selectedVetoClinique,
		transports,
		vetoCliniqueInfo,
		lieuTransportUpdate,
		vetos,
		setCliniqueVetos,
		getPaysVilles,
		getAContent,
		getUserPets,
		getVetoCliniqueInfo,
		setVetoCliniqueInfo,
		getALieu,
		lieuDelete,
		getAVetoLieux,
		getUserLieu,                // NEW: to load user's location
		professionalIdList,
		professionalIdByCountry,
		getTranslatedMessage,  // Add this
		professionalIdValidator,
		updateEtablissementPhoto,
		getVetTitles,
		getAVetoProfile,
		listVetoMode,
	} = useContext( SiteContext )
	
	// Dynamic fields error
	const [errors, setErrors] = useState({});
	
	// Clinic photo
	const [etablissementPhoto, setEtablissementPhoto] = useState('');
	const [etablissementPhotoFile, setEtablissementPhotoFile] = useState(null);
	const [etablissementPhotoFileList, setEtablissementPhotoFileList] = useState([]);
	const [etablissementPhotoError, setEtablissementPhotoError] = useState('');
	const [isEtablissementPhotoModalOpen, setIsEtablissementPhotoModalOpen] = useState(false);
	
	const handleEtablissementPhotoChange = (info) => {
		const file = info.file;
		if (file) {
			setEtablissementPhotoFile(file);
			setEtablissementPhotoFileList([file]);
			
			// Preview the image
			const reader = new FileReader();
			reader.onload = (e) => {
				setEtablissementPhoto(e.target.result);
			};
			reader.readAsDataURL(file.originFileObj);
		}
	};

	const etablissementPhotoProps = {
		accept: '.png,.jpg,.jpeg',
		listType: 'picture',
		fileList: etablissementPhotoFileList,
		multiple: false,
		maxCount: 1,
		showUploadList: false,
		className: 'avatar-uploader',
		onChange: handleEtablissementPhotoChange,
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};
	
	// Add these state variables
	const [individualExample, setIndividualExample] = useState('');
	const [businessExample, setBusinessExample] = useState('');
	
	// Dynamic fields onchange
	const handleFieldChange = (field, value) => {
		const { fieldErrorTagRef, fieldName } = field;
		
		if (value.trim() === "") {
			setErrors(prev => ({
			  ...prev,
			  [fieldName]: null
			}));

			form.setFieldValue(fieldName, value);
			form.validateFields();
			return;
		}

		const isValid = addressNameValidator( value )
		setErrors((prev) => ({
			...prev,
			[fieldName]: isValid ? null : getAContent( [fieldErrorTagRef] )
		}));

		// Optional: sync value to AntD form
		form.setFieldValue(fieldName, value);
		form.validateFields();
	};
	
	// Render dynamic form
	const renderField = ( field ) => {
		return(
			<Input
				id={field.nom}
				name={field.nom}
				key={field.id}
				data-custom-id={field.id}
				placeholder={ getAContent( field.fieldPlaceholderTagRef ) } 
				className="backgroundYellow rounded10 width100per100 borderNone height40"
				type="text"
				onChange={(e) => handleFieldChange(field, e.target.value)}
				status={errors[field.fieldName] ? "error" : ""}
			/>
		)
	}
	
	// Animal photo
	const [ animalPhotoDefaultSrc, setAnimalPhotoPhotoDefaultSrc ] = useState( '/img/user/2.jpg' );
	// user photo
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );
	// File upload
	const { Dragger } = Upload;
	const [ uploading, setUploading ] = useState(false);
	const [ animalPhotoError, setAnimalPhotoError ] = useState( '' );
	const [ animalPhoto, setAnimalPhoto ] = useState('');
	const [ fileList, setFileList ] = useState([]);
	const [ showUploadList, setShowUploadList ] = useState( false );
	const handleBeforeUpload = ( file ) => {
        setFileList([...fileList, file]);
        return true;
    };
	const props = {
		accept: '.png,.jpg,.jpeg',
		listType: 'picture',
		fileList: fileList,
		multiple: false,
		maxCount: 1,
		showUploadList: showUploadList,
		className: 'avatar-uploader',
		onChange(info) {
			const a = async() => {
				let newFileList = [...info.fileList];
				setFileList( newFileList );
				setAnimalPhoto( info.file );
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
		if( !animalPhoto.originFileObj )
			return 
		
		const a = async() => {
			const dataUri = await getBase64( animalPhoto.originFileObj );
			const elt = document.getElementById( "animalPhotoId" );
			elt.src = dataUri;
		}
		a();
	}, [fileList]);

	// Add with your other state variables (around line 300-400)
	const [vetTitles, setVetTitles] = useState([]);
	const [selectedVetTitleId, setSelectedVetTitleId] = useState(null);

	// Add handler for title change
	const handleVetTitleChange = (titleId) => {
		setSelectedVetTitleId(titleId);
		form.setFieldsValue({ VetTitleId: titleId });
	};
	
	// Fetch vet titles when component mounts
	useEffect(() => {
		const f = async() => {
			const vetTitle = await getVetTitles( );
// console.log( "vvvvvvvvvvvvv vetTitle", vetTitle );
			setVetTitles(vetTitle);
		}
		f();
	}, []);


	const modalPhotoCancel = () => {
		setIsModalPhotoOpen( false );
	}
	const modalPhotoHandleOkClosed = () => {
		console.log( 'modalPhotoHandleOkClosed' )
	}
	
	// flags
	const [ selectedFlag, setSelectedFlag ] = useState( 'fr' );

	// phone
	const [ selectedCountryCode, setSelectedCountryCode ] = useState( '+33' );
	const [ countryPhoneCode, setCountryPhoneCode ] = useState( '' );

	// title
	const [ title, setTitle ] = useState( '' );

	// description
	const [ description, setDescription ] = useState( '' );

	// name
	const [ name, setName ] = useState( '' );
	const [ nameError, setNameError ] = useState( '' );
	const handleChangeName = ( e ) => {
		const data = e.target.value;
		setName( data );

		var nameErrorText = '';
		const test = nameValidator( data )

		if( data && test === false ){
			nameErrorText = signUp_nameErrorText
		}

		setNameError( nameErrorText );
	}

	// profesional IDs
	const [individualProfessionalId, setIndividualProfessionalId] = useState('');
	const [individualProfessionalIdError, setIndividualProfessionalIdError] = useState('');
	const [businessProfessionalId, setBusinessProfessionalId] = useState('');
	const [businessProfessionalIdError, setBusinessProfessionalIdError] = useState('');
	const [professionalIdMapping, setProfessionalIdMapping] = useState(null);
	const [individualLabel, setIndividualLabel] = useState('RPPS');
	const [businessLabel, setBusinessLabel] = useState('SIRET');
	const [individualRegex, setIndividualRegex] = useState(null);
	const [businessRegex, setBusinessRegex] = useState(null);
	const [verificationUrl, setVerificationUrl] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	// veto to invite
	const [ vetosToInvite, setVetosToInvite ] = useState( [] );

	// veto name
	const [ vetoName, setVetoName ] = useState( '' );
	const [ vetoNameError, setVetoNameError ] = useState( '' );
	const handleChangeVetoName = ( e ) => {
		const data = e.target.value;
		setVetoName( data );
		var vetoNameErrorText = '';
		const test = nameValidator( data )

		if( data && test === false ){
			vetoNameErrorText = signUp_nameErrorText;
		}
		setVetoNameError( vetoNameErrorText );
	}

	// Veto first name
	const [ vetoFirstName, setVetoFirstName ] = useState( '' );
	const [ vetoFirstNameError, setVetoFirstNameError ] = useState( '' );
	const handleChangeVetoFirstName = ( e ) => {
		const data = e.target.value;
		setVetoFirstName( data );
		
		var vetoFirstNameErrorText = '';
		const test = firstNameValidator( data )
		if( data && test === false )
			vetoFirstNameErrorText = signUp_firstNameErrorText

		setVetoFirstNameError( vetoFirstNameErrorText );
	}
	
	// animal name
	const [ animalName, setAnimalName ] = useState( '' );
	const [ animalNameError, setAnimalNameError ] = useState( '' );
	const handleChangeAnimalName = ( e ) => {
		const data = e.target.value;
		setAnimalName( data );

		var animalNameErrorText = '';
		const test = nameValidator( data )

		if( data && test === false ){
			animalNameErrorText = getAContent('cmp_vetonest.com_c9QpA2mLfs');
		}
		setAnimalNameError( animalNameErrorText );
	}

	// Veto etablissement name
	const [ etablissementName, setEtablissementName ] = useState( '' );
	const [ etablissementNameError, setEtablissementNameError ] = useState( '' );
	const handleChangeEtablissementName = ( e ) => {
		const data = e.target.value;
		setEtablissementName( data );

		var etablissementNameErrorText = '';
		const test = absenceNameValidator( data )

		if( data && test === false ){
			etablissementNameErrorText = getAContent('cmp_vetonest.com_Bv7kHp29zX');
		}
		setEtablissementNameError( etablissementNameErrorText );
	}

	// etablissement parking
	const [ etablissementParking, setEtablissementParking ] = useState( '' );
	const [ etablissementParkingError, setEtablissementParkingError ] = useState( '' );
	const handleChangeEtablissementParking = ( e ) => {
		const data = e.target.value;
		setEtablissementParking( data );

		var etablissementParkingErrorText = '';
		const test = addressNameValidator( data )

		if( data && test === false ){
			etablissementParkingErrorText = getAContent('cmp_vetonest.com_Qm3tLf89Ra');
		}
		setEtablissementParkingError( etablissementParkingErrorText );
	}

	// etablissement info
	const [ etablissementInfo, setEtablissementInfo ] = useState( '' );
	const [ etablissementInfoError, setEtablissementInfoError ] = useState( '' );
	const handleChangeEtablissementInfo = ( e ) => {
		const data = e.target.value;
		setEtablissementInfo( data );

		var etablissementInfoErrorText = '';
		const test = addressNameValidator( data )

		if( data && test === false ){
			etablissementInfoErrorText = getAContent('cmp_vetonest.com_Rp8cKw41Nd');
		}
		setEtablissementInfoError( etablissementInfoErrorText );
	}

	// etablissement address
	const [ etablissementAddress, setEtablissementAddress ] = useState( '' );
	const [ etablissementAddressError, setEtablissementAddressError ] = useState( '' );
	const handleChangeEtablissementAddress = ( e ) => {
		const data = e.target.value;
		setEtablissementAddress( data );

		var etablissementAddressErrorText = '';
		const test = addressNameValidator( data )

		if( data && test === false ){
			etablissementAddressErrorText = getAContent('cmp_vetonest.com_Mk5rUz72Pw');
		}
		setEtablissementAddressError( etablissementAddressErrorText );
	}

	// Veto etablissement presentation
	const [ etablissementPresentation, setEtablissementPresentation ] = useState( '' );
	const [ etablissementPresentationError, setEtablissementPresentationError ] = useState( '' );
	const handleChangeEtablissementPresentation = ( e ) => {
		const data = e.target.value;
		setEtablissementPresentation( data );

		var etablissementPresentationErrorText = '';
		const test = absenceNameValidator( data )

		if( data && test === false ){
			etablissementPresentationErrorText = getAContent('cmp_vetonest.com_Js2eDc09Vb');
		}

		setEtablissementPresentationError( etablissementPresentationErrorText );
		form.validateFields();
	}

	// Veto absence name
	const [ absenceName, setAbsenceName ] = useState( '' );
	const [ absenceNameError, setAbsenceNameError ] = useState( '' );
	const handleChangeAbsenceName = ( e ) => {
		const data = e.target.value;
		setAbsenceName( data );

		var absenceNameErrorText = '';
		const test = absenceNameValidator( data )

		if( data && test === false ){
			absenceNameErrorText = getAContent('cmp_vetonest.com_Zx4pGt11Sy');
		}
		setAbsenceNameError( absenceNameErrorText );
	}

	// absence name and others names validator
	const absenceNameValidator = (name) => {
		const rep = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s&'\-]+$/.test(name);
		return rep;
	}
	
	// parking name validator
	const addressNameValidator = (name) => {
		// Added ':' to both character classes and '\s*$' at the end to handle trailing tabs/spaces safely
		const rep = /^[\p{L}0-9\s&'\-’,.:](?:[\p{L}0-9\s&'\-’,.€$()\/\\]*[\p{L}0-9\s&'\-’,.):])?\s*$/u.test(name);
		return rep;
	}
	
	// Veto absence description
	const [ absenceDescription, setAbsenceDescription ] = useState( '' );
	const [ absenceDescriptionError, setAbsenceDescriptionError ] = useState( '' );
	const handleChangeAbsenceDescription = ( e ) => {
		const data = e.target.value;
		setAbsenceDescription( data );

		var absenceDescriptionErrorText = '';
		const test = absenceNameValidator( data )

		if( data && test === false ){
			absenceDescriptionErrorText = getAContent('cmp_vetonest.com_Dw9aQf63Mu');
		}
		setAbsenceDescriptionError( absenceDescriptionErrorText );
	}

	// Absence remove action
	const [isAbsencePopconfirmOpen, setIsAbsencePopconfirmOpen] = useState(false);
	const handleAbsenceRemove = async () => {
		const timeSlotData = { timeSlotClosedDateId: selectedAbsenceId  };
		const rep = await timeSlotClosedDateRemove( timeSlotData );
			
		if( rep === false ){
			message.error( getAContent('cmp_vetonest.com_Hr1mPx54Tb') );
			return;
		}
		else{
			setSelectedAbsenceId('');
			setAbsence('');
			const random = generateRandomDigits(3);
			setProfileFormUpdated( random );
			message.success( getAContent('cmp_vetonest.com_Fg6kVs22Qe') );
			setModalProfileIdentityOpen( false );
		}

		message.success( getAContent('cmp_vetonest.com_Lb4kZw98Ds') );
		setIsModalOpen(false);
	}

	// Timeslot opened
	const [ startTime, setStartTime ] 		= useState( null );
	const [ endTime, setEndTime ] 			= useState( null );
	const [ day, setDay ] 					= useState( '' );
	const [ dayId, setDayId ] 				= useState( '' );
	const [ opened, setOpened ] 			= useState( '' );
	const [ closeThisDay, setCloseThisDay ] = useState( false );
	const [ timeSlotId, setTimeSlotId ] 	= useState( '' );
	const [ openedError, setOpenedError ] 	= useState( '' );
	const handleStartTimeChange = (time) => {
		setStartTime(time);
		var openedErrorText = '';
		if( timeValidator( time, endTime ) === false ){
			openedErrorText = getAContent('cmp_vetonest.com_Yq2nFt77Wc');
		}
		setOpenedError( openedErrorText );
		form.validateFields();
	}
	const handleEndTimeChange = (time) => {
		setEndTime(time);
		var openedErrorText = '';
		if( timeValidator( startTime, time ) === false ){
			openedErrorText = getAContent('cmp_vetonest.com_Yq2nFt77Wc');
		}
		setOpenedError( openedErrorText );
		form.validateFields();
	}

	const timeValidator = ( startTime, endTime ) => {
		if( dayjs( startTime ).isAfter( dayjs( endTime ) ) )
			return false
		else
			return true
	}

	// animal espece
	const [ animalEspeceError, setAnimalEspeceError ] = useState( '' );
	const [ breedSpinner, setBreedSpinner ] = useState( false );
	const handleChangeAnimalEspece = async ( specieId ) => {
		setBreedSpinner(true);  
		const breeds = await speciesBreedList( specieId );
		setRaces( breeds );
		setShowBreeds( '' );	
		setEspeceSelectedId( specieId );
		setBreedSpinner( false );
		setAnimalEspeceError( '' );
		form.validateFields();
	}

	// animal race
	const [ animalRaceError, setAnimalRaceError ] = useState( '' );
	const handleChangeAnimalRace = ( raceId ) => {
		setRaceSelectedId( raceId );
		setAnimalRaceError( '' );
		form.validateFields();
	}

	// name validator
	const nameValidator = ( name ) => {
		const rep = /^[A-Za-z0-9éàèêêâäë]+([-' ]?[A-Za-z0-9éàèêêâäë]+)*$/.test( name );
		return rep
	}

	// signUp email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;
		return true;
	}
	const [ signUpEmail, setSignUpEmail ] = useState( user ? user.email : '' );
	const [ signUpEmailDefault, setEmailDefault ] = useState( getAContent('cmp_vetonest.com_Po5mAz66Kj') );
	const [ signUpEmailError, setSignUpEmailError ] = useState( '' );
	const handleChangeEmail = ( e ) => {
		const data = e.target.value;
		setSignUpEmail( data );

		var signUpEmailErrorText = '';
		if( data && !isValidEmail( data ) )
			signUpEmailErrorText = signUp_emailErrorText

		setSignUpEmailError ( signUpEmailErrorText );
	}
	// verification code modal
	const [ code, setCode ] = useState( '' );
	const [ formError01, setFormError01 ] = useState( 'none' );
	const [ formError02, setFormError02 ] = useState( 'none' );
	const [ formError03, setFormError03 ] = useState( 'none' );
	const [ formError04, setFormError04 ] = useState( 'none' );
	const [ formError05, setFormError05 ] = useState( 'none' );
	const [ formError06, setFormError06 ] = useState( 'none' );
	const [ formError07, setFormError07 ] = useState( 'none' );
	const [ formError08, setFormError08 ] = useState( 'none' );
	const [ formError09, setFormError09 ] = useState( 'none' );
	const [ formError10, setFormError10 ] = useState( 'none' );
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ isModalOptionTypeOpen, setIsModalOptionTypeOpen ] = useState(false);
	const [ emailVerificationResult, setEmailVerificationResult ] = useState( false );
	const [ displayCodeCorrect, setDisplayCodeCorrect ] = useState( 'none' );
	const [ displayCodeIncorrect, setDisplayCodeIncorrect ] = useState( 'none' );
	const [ maxCodeLength, setMaxCodeLength ] = useState( 6 );
	const handleChangeCode = ( e ) => {
		const typedCode 	= e.target.value;
		const countLetters 	= typedCode.length
		if( countLetters > maxCodeLength )
			return

		setVerificationCode( typedCode );
		if( countLetters == maxCodeLength ){
			if( code != typedCode ){
				message.error( getAContent('cmp_vetonest.com_Xc8rBn55Je') );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
			}
			else{
				message.success( getAContent('cmp_vetonest.com_Jd9hPw10Rt')  );
				setEmailVerificationResult( true );
				setDisplayCodeCorrect( 'block' );
				setTimeout( setIsModalOpen, 2000, false );
			}
		}
		else {
			setDisplayCodeIncorrect( 'none' );
		}
	}
	
	const handleCompletedCode = ( typedCode ) => {
		if( code != typedCode ){
			setDisplayCodeIncorrect( 'block' );
			setEmailVerificationResult( false );
		}
		else{
			message.success( signUp_codeCorrect );
			setDisplayCodeIncorrect( 'none' );
			setEmailVerificationResult( true );
			setDisplayCodeCorrect( 'block' );
			setTimeout( setIsModalOpen, 2000, false );
		}
	}
	const [ loading, setLoading] = useState(false);
	const [ signUpSpin, setSignUpSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	const showModalOptionType = () => {
		setIsModalOptionTypeOpen(true);
	};
	const modalOptionTypeHandleOk = () => {
		setIsModalOptionTypeOpen(false);
	};
	const modalOptionTypeHandleCancel = () => {
		document.getElementById( 'signUpType1' ).checked = false;
		document.getElementById( 'signUpType2' ).checked = false;
		setIsModalOptionTypeOpen(false);
	}
	const modalOptionTypeClosed = () => {
		console.log( 'modalClosed' );
	}
	const modalClosed = async () => {
		if( emailVerificationResult === false ){
			setSendingDisabled( false );
			return
		}
		const emailData = {
			email: signUpEmail,
			userId: user.userId
		}
		const rep = await updateEmail( emailData );
		setSignUpSpin( 'none' );
		setSendingDisabled( false );
		if( rep === false ){
			message.error( profileIdentity_updateEmailError )
		}
		else{
			user['email'] = signUpEmail;
			await logIn( user );
			const random = generateRandomDigits(3);
			setProfileFormUpdated( random );
			message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
			setModalProfileIdentityOpen( false );
		}
	} 

	// first name
	const [ firstName, setFirstName ] = useState( '' );
	const [ firstNameError, setFirstNameError ] = useState( '' );
	const handleChangeFirstName = ( e ) => {
		const data = e.target.value;
		setFirstName( data );
		
		var firstNameErrorText = '';
		const test = firstNameValidator( data )
		if( data && test === false )
			firstNameErrorText = signUp_firstNameErrorText
		
		setFirstNameError( firstNameErrorText );
	}

	const firstNameValidator = ( firstName ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( firstName );
		return rep
	}

	// sexe
	const [ sexes, setSexes ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ sexe, setSexe ] = useState( '' );
	const [ sexeError, setSexeError ] 	= useState( '' );
	
	const handleChangeProfileSex = (e) => {
		const sexId = e.target.value;
		setSexe( sexId );
		setSexeError( '' );
	}

	// animal sexe
	const [ animalSexes, setAnimalSexes ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalSexe, setAnimalSexe ] = useState( userProfile.userAnimalSexeId );
	const [ animalSexeError, setAnimalSexeError ] 	= useState( '' );
	
	const handleChangeAnimalSex = (e) => {
		const sexId = e.target.value;
		setAnimalSexe( sexId );
		setAnimalSexeError( '' );
		form.validateFields();
	}

	// animalInsurance
	const [ animalInsurances, setAnimalInsurances ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalInsurance, setAnimalInsurance ] = useState( userProfile.userAnimalInsuranceId );
	const [ animalInsuranceError, setAnimalInsuranceError ] 	= useState( '' );
	
	const handleChangeAnimalInsurance = (e) => {
		const insurance = e.target.value;
		setAnimalInsurance( insurance ); 
		setAnimalInsuranceError( '' );
		form.validateFields();
	}


	// Birth date
	const [ dateDeNaissance, setDateDeNaissance ] 		= useState( '' );
	const [ dateDeNaissanceRaw, setDateDeNaissanceRaw ] = useState( '' );
	const [ dateDeNaissanceError, setDateDeNaissanceError ] = useState( '' );
	const handleBirthDateChange = async ( date, dateString ) => {
		if( !date ){
			setDateDeNaissance( null );
			setDateDeNaissanceRaw( null );
			setDateDeNaissanceError( '' );
			form.validateFields();
			return
		}
		const dateStr = date.format('YYYY-MM-DD');
		if( fieldName == 'Profile' ){
			const minBirthDate = dayjs().subtract( 10, 'year' );
			if( dayjs( dateStr ).isAfter( minBirthDate ) ){
				message.error( getAContent('cmp_vetonest.com_Ru6sKa87Xp') );
				return;
			}
		}
		const dateNaissance = dayjs( dateStr );
		setDateDeNaissance( dateNaissance );
		setDateDeNaissanceRaw( dateStr );
		setDateDeNaissanceError( '' );
		form.validateFields();
	}

	// Animal Birth date
	const [ animalBirthDatePickerValue, setAnimalBirthDatePickerValue ] = useState(null);
	const [ animalDateNaissance, setAnimalDateNaissance ] = useState( '' );
	const [ animalDateNaissanceRaw, setAnimalDateNaissanceRaw ] = useState( '' );
	const [ animalDateNaissanceError, setAnimalDateNaissanceError ] = useState( '' );
	const handleAnimalBirthDateChange = async ( date, dateString ) => {
		const dateStr = date.format('YYYY-MM-DD');
		const formatedDate = await dateFormater( dateStr );
		setAnimalDateNaissance( formatedDate );
		setAnimalDateNaissanceRaw( dateStr );
		setAnimalBirthDatePickerValue( null );
		setAnimalDateNaissanceError( '' );
		form.validateFields();
	}

	// Absence
	const [ dateAbsence, setDateAbsence ] = useState( '' );
	const handleDateAbsenceChange = ( date ) => {
		setDateAbsence( date )
	}
	const disabledPastDates = (current) => {
		return current && current.isBefore(dayjs().startOf('day'));
	};

	// Biography
	const [ biographyError, setBiographyError]  = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const handleChangeBiography = ( e ) => {
		const data = e.target.value;
		form.setFieldsValue({ Biography: data });
		setBiography( data );
		var biographyErrorText = '';
		if( !isValidBiography( data ) )
			biographyErrorText = getAContent('cmp_vetonest.com_Vm3fHt24Ls');
		setBiographyError( biographyErrorText );
		form.validateFields(['Biography']).catch(() => {});
	}
	// Biography validation
	const { TextArea } = Input;
	const isValidBiography = ( biography ) => {
		if( 
			biography.length &&
			( biography.length <= 20 ||
			biography.split( ' ' ).length < 3 )
		)
			return false
		else
			return true
	}

	// ========== VET LOCATION (Lieu) STATE & HANDLERS ==========
	const [vetLieuId, setVetLieuId] = useState(null);
	const [vetAddress, setVetAddress] = useState('');
	const [vetCountryId, setVetCountryId] = useState(null);
	const [vetCityId, setVetCityId] = useState(null);
	const [vetCityOptions, setVetCityOptions] = useState([]);
	const [vetCountryError, setVetCountryError] = useState('');
	const [vetCityError, setVetCityError] = useState('');
	const [vetAddressError, setVetAddressError] = useState('');
	const [displayVetCity, setDisplayVetCity] = useState('none');

	const handleVetCountryChange = async (countryId) => {
		setVetCountryId(countryId);
		setVetCityId(null);
		setVetCityOptions([]);
		setDisplayVetCity('none');
		setVetCountryError('');
		setVetCityError('');
		form.setFieldsValue({ VetCity: null });
		form.resetFields(['VetCity']);
		if (countryId) {
			const cities = await getPaysVilles(countryId);
			if (cities && cities.length) {
				const localizedCities = await getLocalizedCities( cities );
				setVetCityOptions(localizedCities);
				setDisplayVetCity('block');
			} else {
				setDisplayVetCity('none');
			}
		}
		form.validateFields(['VetCountry']);
	};

	const handleVetCityChange = (cityId) => {
		setVetCityId(cityId);
		setVetCityError('');
		form.validateFields(['VetCity']);
	};

	const handleVetAddressChange = (e) => {
		const value = e.target.value;
		setVetAddress(value);
		setVetAddressError('');
		form.validateFields(['VetAddress']);
	};

	const getLocalizedCities = async( cities ) => {
		for ( const city of cities ){
			const localCity = await getAContent( city.tagRef )
			city.nom = localCity;
		}
		return cities;
	}

	// ========== USER LOCATION (Lieu) STATE & HANDLERS ==========
	const [userLieuId, setUserLieuId] = useState(null);
	const [userAddress, setUserAddress] = useState('');
	const [userCountryId, setUserCountryId] = useState(null);
	const [userCityId, setUserCityId] = useState(null);
	const [userCityOptions, setUserCityOptions] = useState([]);
	const [userCountryError, setUserCountryError] = useState('');
	const [userCityError, setUserCityError] = useState('');
	const [userAddressError, setUserAddressError] = useState('');
	const [displayUserCity, setDisplayUserCity] = useState('none');

	const handleUserCountryChange = async (countryId) => {
		setUserCountryId(countryId);
		setUserCityId(null);
		setUserCityOptions([]);
		setDisplayUserCity('none');
		setUserCountryError('');
		if (countryId) {
			const cities = await getPaysVilles(countryId);
			if (cities && cities.length) {
				const localizedCities = await getLocalizedCities( cities );
				setUserCityOptions(localizedCities);
				setDisplayUserCity('block');
			} else {
				setDisplayUserCity('none');
			}
		}
		form.validateFields(['UserCountry']);
	};

	const handleUserCityChange = (cityId) => {
		setUserCityId(cityId);
		setUserCityError('');
		form.validateFields(['UserCity']);
	};

	const handleUserAddressChange = (e) => {
		const value = e.target.value;
		setUserAddress(value);
		setUserAddressError('');
		form.validateFields(['UserAddress']);
	};

	// get datePicker local
	const getDatePickerlocale = () =>{
		if( siteLanguage =='fr' )
			return locale_fr
		if( siteLanguage =='de' )
			return locale_de
		if( siteLanguage =='es' )
			return locale_es
		if( siteLanguage =='it' )
			return locale_it
		return locale_en
	}
	// get date format local
	const getDateFormatLocale = () =>{
		if( siteLanguage =='fr' )
			return 'DD MMM YYYY'
		if( siteLanguage =='de' )
			return 'YYYY-MM-DD'
		if( siteLanguage =='es' )
			return 'YYYY-MM-DD'
		if( siteLanguage =='it' )
			return 'YYYY-MM-DD'
		return 'YYYY-MM-DD'
	}


	// Build countries options
	const BuildCountriesOptions = () => {
		return(
			countries.map( ( country, index ) => 
				({
					value: country.isoCode,
					label: country.name,
				})
			)
		)
	}

	// Build lieu countries options
	const BuildLieuCountriesOptions = () => {
		return(
			countriesAllowed.map( ( country, index ) => 
				({
					value: country.id,
					label: getAContent( country.tagRef ),
				})
			)
		)
	}

	// Build lieu countries options
	const BuildLieuCitiesOptions = () => {
		return(
			lieuCities.map( ( country, index ) => 
				({
					value: country.id,
					label: country.nom,
				})
			)
		)
	}

	// Delete lieux
	const [isLieuPopconfirmOpen, setIsLieuPopconfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const handleLieuRemove = async () => {
	  setIsDeleting(true);
	  const rep = await lieuDelete({ lieuId: selectedLieuId });
	  if (!rep) {
		message.error(getAContent('cmp_vetonest.com_lMQqX2bptt'));
		setIsDeleting(false);
		return;
	  }
	  message.success(getAContent('cmp_vetonest.com_TrN9a8bKzV'));
	  setIsLieuPopconfirmOpen(false);
	  modalProfileIdentityCancel(false);
	  setProfileFormUpdated(generateRandomDigits(3));
	  setIsDeleting(false);
	};

	// Build states options
	const BuildStatesOptions = () => {
		return(
			states.map( ( state, index ) => 
				({
					value: state.isoCode,
					label: state.name,
				})
			)
		)
	}

	// Build cities options
	const BuildCitiesOptions = () => {
		return(
			cities.map( ( city, index ) => 
				({
					value: city.name,
					label: city.name,
				})
			)
		)
	}

	// Build races
	const BuildRacesOptions = async () => {
		return(
			await races.map( ( race, index ) => 
				({
					value: race.id,
					label: race.nom,
				})
			)
		)
	}
	
	// clear form error
	const clearFormErrors = () => {
		setFormError01( 'none' );
		setFormError02( 'none' );
		setFormError03( 'none' );
		setFormError04( 'none' );
		setFormError05( 'none' );
		setFormError06( 'none' );
		setFormError07( 'none' );
		setFormError08( 'none' );
		setFormError09( 'none' );
		setFormError10( 'none' );
	}

	// email code check modal
	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	}

	// password reset
	const [ pwResetSpin, setPwResetSpin ] = useState( 'none' );
	const [ pwResetPassword, setPwResetPassword ] = useState( '' );
	const [ pwResetPasswordError, setPwResetPasswordError ] = useState( '' );
	const handleChangePwResetPassword = ( e ) => {
		const data = e.target.value;
		setPwResetPassword( data );
		var pwResetPasswordErrorText = '';
		if( data && isValidPassword( data ) !== true )
			pwResetPasswordErrorText = signUp_passwordErrorText
		setPwResetPasswordError( pwResetPasswordErrorText );
	}

	// password repeat
	const [ pwResetPasswordRepeat, setPwResetPasswordRepeat ] = useState( '' );
	const [ pwResetPasswordRepeatError, setPwResetPasswordRepeatError ] = useState( '' );
	const handleChangePwResetPasswordRepeat = ( e ) => {
		const data = e.target.value;
		setPwResetPasswordRepeat( data );
		var pwResetPasswordRepeatErrorText = '';
		if( data && isValidPasswordRepeat( data ) === false )
			pwResetPasswordRepeatErrorText = signUp_passwordRepeatErrorText;
			setPwResetPasswordRepeatError( pwResetPasswordRepeatErrorText );
	}
	const isValidPasswordRepeat = ( pwResetPasswordRepeat ) => {
		if( pwResetPassword == pwResetPasswordRepeat )
			return true
		else
			return false
	}

	// display a form error
	const showAFormError = ( className ) => {
		const errorTxt = document.getElementsByClassName( className )[0].innerText;
		return errorTxt;
	}

	// save
	const handleClickSave = async ( e ) => {
		if (isSaving) return;
		setIsSaving(true);
		try {
		return await _handleClickSaveInner(e);
		} finally {
			setIsSaving(false);
		}
	}

	const _handleClickSaveInner = async ( e ) => {
		// Etablissement_veto
	if( fieldName == 'Etablissement_veto' ){

		// Resolve the clinic ID — try both common shapes of the object
		const etablissementIdValue = vetoCliniqueInfo.etablissementId || vetoCliniqueInfo.id;
		if( !etablissementIdValue ){
			console.error( '❌ Cannot send invitations: vetoCliniqueInfo has no id', vetoCliniqueInfo );
			message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
			return;
		}

		const rep = await setCliniqueVetos({
			vetoEtablissementStatusId: '',
			etablissementId: etablissementIdValue,
			profileVetoIdStr: checkedVetoList.join( '*' ),
			status: 1,
			enabled: 1,
		});

		if( rep === false ){
			message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
			return;
		}

		const random = await generateRandomDigits( 3 );

		// ── Shared clinic data (computed once) ──────────────────────────────
		const clinicName    = vetoCliniqueInfo.name || vetoCliniqueInfo.nom || '';
		const clinicPageUrl = `${window.location.origin}/etablissement?etablissementId=${etablissementIdValue}`;

		let clinicTypeName = '';
		if( vetoCliniqueInfo.type ){
			clinicTypeName = typeof vetoCliniqueInfo.type === 'object'
				? ( vetoCliniqueInfo.type.nom || '' )
				: vetoCliniqueInfo.type;
		}

		const firstLocation = vetoCliniqueInfo.lieux?.length > 0
			? vetoCliniqueInfo.lieux[0]
			: null;

		// ── Localized subject (driven by siteLocale) ─────────────────────────
		const langKey = ( siteLocale || 'en' ).split( '-' )[0].toLowerCase();
		const subjectMap = {
			fr: `Invitation à rejoindre ${clinicName} sur ${siteName}`,
			es: `Invitación para unirse a ${clinicName} en ${siteName}`,
			de: `Einladung, ${clinicName} auf ${siteName} beizutreten`,
			it: `Invito a unirsi a ${clinicName} su ${siteName}`,
			en: `Invitation to join ${clinicName} on ${siteName}`,
		};
		const emailSubject = subjectMap[ langKey ] || subjectMap.en;

		// ── Loop through invited vets ────────────────────────────────────────
		const invitedVets = vetosToInvite.filter( v => checkedVetoList.includes( v.id ) );

		for( const vet of invitedVets ){

			// Resolve email — three fallback strategies
			let vetEmail =
				vet.email ||
				vet.user?.email ||
				null;

			if( !vetEmail ){
				try{
					const vetProfile = await getAVetoProfile( vet.id );
					vetEmail = vetProfile?.user?.email || null;
				} catch( profileError ){
					console.error( 'Error fetching vet profile:', profileError );
				}
			}

			if( !vetEmail ){
				console.warn( `⚠️ No email for vet ${vet.id} — ${vet.prenom} ${vet.nom}` );
				message.warning( `Adresse email non trouvée pour ${vet.prenom} ${vet.nom}` );
				continue;
			}

			const vetName    = `${vet.prenom || ''} ${vet.nom || ''}`.trim();
			const domainName = vetEmail.split( '@' )[1];

			const sendEmailData = {
				// ── Transport ────────────────────────────────────────────────
				to_email:      vetEmail,
				to_domain:     domainName,
				subject:       emailSubject,
				emailTemplate: 'vet_invitation',
				// ── Site (match PHP $request->getPayload()->get('...') keys) ─
				siteLocale:    siteLocale,
				userName:      vetName || 'Cher collègue',
				siteName:      siteName,
				siteDomain:    siteDomain,
				siteEmail:     siteEmail,
				siteURL:       window.location.origin,
				// ── Clinic invitation (new fields added to PHP controller) ────
				clinicName:    clinicName,
				clinicType:    clinicTypeName,
				clinicAddress: firstLocation?.adresse || '',
				clinicCity:    firstLocation?.ville   || '',
				invitationUrl: clinicPageUrl,
			};

			try{
				const emailResult = await sendEmail( sendEmailData );
				if( emailResult?.success === true ){
					message.success( getAContent( 'cmp_vetonest.com_Js81Qm49Tf' ) + ' ' + vetName );
				} else {
					console.error( `❌ Email failed for ${vetName}:`, emailResult );
					message.warning( `Email non envoyé à ${vetName}` );
				}
			} catch( emailError ){
				console.error( 'Exception while sending email:', emailError );
				message.error( `Erreur lors de l'envoi de l'email à ${vetName}` );
			}
		}

		setProfileFormUpdated( random );
		message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' ) );
		setModalProfileIdentityOpen( false );
	}
		

		// Etablissement_lieu
		// Etablissement_lieu
		if( fieldName == 'Etablissement_lieu' ){
			
			// Let Ant Design handle validation — shows inline errors under each field
			let allValues;
			try {
				allValues = await form.validateFields();
			} catch( validationError ) {
				// form.validateFields() rejects and shows inline errors automatically
				return;
			}
			
			// Get form values
			const etablissementLieuData = {
				...( selectedLieuId && { lieuId: selectedLieuId } ),
				adresse: form.getFieldValue('LieuAddress'),
				info: form.getFieldValue('Info'),
				parking: form.getFieldValue('Parking'),
				paysId: form.getFieldValue('LieuCountry'),
				villeId: form.getFieldValue('LieuCity'),
				...( userProfile.atHome && { profileVetoId: userProfile.id } ),
				...( !userProfile.atHome && { etablissementId: vetoCliniqueInfo.etablissementId } ),
				enabled: true,
			}
			
			// Get dynamic transport values
			const dynamicFieldNames = transports.map( field => field.fieldName );
			const dynamicValues = Object.fromEntries(
				Object.entries(allValues).filter(([key]) =>
					dynamicFieldNames.includes(key)
				)
			);
			
			// Save the lieu
			const lieuId = await saveLieu( etablissementLieuData );
			if( lieuId === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ep4wZq81Fs' ) );
				return;
			}
			else{
				// Save transports
				const etsTransport = transports.map( ( v, k ) => { 
					const description = dynamicValues[ v.fieldName ];
					const transportId = v.id;
					const data = {
						'lieuId': lieuId,
						'transportId': transportId,
						'description': description,
						'profileVetoId': profileId,
					}
					return data;
				})
				for ( const transport of etsTransport ){
					const rep = await lieuTransportUpdate( transport );
					if (!rep) {
						console.warn('Failed to save transport:', transport);
					}
				}
			}
			message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' ) );
			setModalProfileIdentityOpen( false );
			const random = generateRandomDigits(3);
			setProfileFormUpdated( random );
			setSelectedLieuId( null );
			return;
		}

		// Etablissement
		if( fieldName == 'Etablissement' ){
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( etablissementNameError != '' ){
					errorsExist = true
				}
				else if( etablissementPresentationError != '' ){
					errorsExist = true
				}
				form.validateFields();
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !etablissementName ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Wd52Kp87Qr' );
					await setEtablissementNameError( errorMessage );
					formHasEmpty = true
				}
				if( !etablissementPresentation ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Lk83Wt59Pq' );
					await setEtablissementPresentationError( errorMessage );
					formHasEmpty = true
				}
				if( selectedEtablissementTypes.length == 0 ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Uy67Hd91Ts' );
					await setEtablissementTypeError( errorMessage );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const etablissementData = {
				...(vetoCliniqueInfo && { etablissementId: vetoCliniqueInfo.etablissementId }),
                nom: etablissementName,
                presentation: etablissementPresentation,
				etablissementTypeId: selectedEtablissementTypes[0],
				creatorProfileId: profileId,
                enabled: true,
			}
			// Use updateEtablissementPhoto with photo file
			const resp = await updateEtablissementPhoto(etablissementData, etablissementPhotoFile?.originFileObj);
			
			if (resp === false) {
				message.error(getAContent('cmp_vetonest.com_Ep4wZq81Fs'));
				return;
			} else {
				message.success(getAContent('cmp_vetonest.com_Fg6kVs22Qe'));
				setModalProfileIdentityOpen(false);
				const random = generateRandomDigits(3);
				setProfileFormUpdated(random);
				return;
			}
		}
		
		// Opened
		if( fieldName == 'Opened' || fieldName == 'Closed' ){
			if( closeThisDay ){
				const sendData = {
					dayNumber:		dayId,
					profileVetoId:	profileId,
					enabled: 		true,
				}
				const rep = await timeSlotDayClose( sendData );
				if( rep === false ){
					message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
				}
				else{
					const random = await generateRandomDigits(3);
					setProfileFormUpdated( random );
					message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
					setModalProfileIdentityOpen( false );
				}
				return;
			}
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( openedError != '' ){
					errorsExist = true
				}
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			var formHasEmpty = '';
			const checkFormEmpty = () => {
				if( !startTime ){
					formHasEmpty = 'profileOpen_emptyOpenTime';
					setOpenedError( formHasEmpty );
				}
				if( !endTime ){
					formHasEmpty = 'profileOpen_emptyOpenTime';
					setOpenedError( formHasEmpty );
				}
				form.validateFields();
			}
			await checkFormEmpty();
			if( formHasEmpty ){
				message.error( formHasEmpty );
				return
			}
			const sendData = {
				timeSlotId: 	timeSlotId,
				dayNumber:		dayId,
				startTime: 		startTime.format('HH:mm'),
				endTime:		endTime.format('HH:mm'),
				profileVetoId:	profileId,
				enabled: 		true,
			}
			const rep = await timeSlotDateUpdate( sendData );
			if( rep === false ){
				message.error( 'Veto profile cannot be updated' );
			}
			else{
				const random = await generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}			
		}
			
		// Absence
		if( fieldName == 'Absence' ){
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( absenceNameError != '' ){
					errorsExist = true
				}
				else if( absenceDescriptionError != '' ){
					errorsExist = true
				}
				form.validateFields();
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !dateDeNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Tn64Fb20Ks' );
					setDateDeNaissanceError( error );
					formHasEmpty = true
				}
				if( !absenceName ){
					const error = getAContent( 'cmp_vetonest.com_Zq59Ud47Lm' );
					setAbsenceNameError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				timeSlotClosedDateId:	absence ? absence.id : '',
				closedDate: 			dateDeNaissanceRaw,
				profileVetoId:			profileId,
				nom:					absenceName,
				description:			absenceDescription,
				enabled: 				true,
			}
			const rep = await timeSlotClosedDateUpdate( sendData );
			if( rep === false ){
				message.error( 'Veto profile cannot be updated' );
				return;
			}
			else{
				setSelectedAbsenceId('');
				setAbsence('');
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}

		// Profile veto
		if( fieldName == 'ProfileVeto' ){ 
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( phoneNumberError != '' ) errorsExist = true
				else if( vetoNameError != '' ) errorsExist = true
				else if( vetoFirstNameError != '' ) errorsExist = true
				else if( tarifMinError != '' ) errorsExist = true
				else if( tarifMaxError != '' ) errorsExist = true
				else if( tarifVideoMinError != '' ) errorsExist = true
				else if( tarifVideoMaxError != '' ) errorsExist = true
				else if( videoAllowedError != '' ) errorsExist = true
				try {
					await form.validateFields();
				} catch( validationError ) {
					// Catches field-rule failures (empty/invalid INAMI, BCE, city, country…)
					errorsExist = true;
				}
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			var formHasEmpty = false;
			const isOnlineMode = allVetoModes.find( m => m.id === vetoModeId )?.name === 'online';
			const effectiveVideoAllowed = isOnlineMode ? 1 : videoAllowed;
			const checkFormEmpty = () => {
				if( !phoneNumber ){
					const error = getAContent( 'cmp_vetonest.com_Fa92Ld10Xp' );
					setPhoneNumberError( error );
					formHasEmpty = true
				}
				if( !vetoName ){
					const error = getAContent( 'cmp_vetonest.com_Wp17Qk83Mz' );
					setVetoNameError( error );
					formHasEmpty = true
				}
				if( !vetoFirstName ){
					const error = getAContent( 'cmp_vetonest.com_Bt63Xa1Npe' );
					setVetoFirstNameError( error );
					formHasEmpty = true
				}
				if( vetoSelectedSpecialities.length == 0 ){
					const error = getAContent( 'cmp_vetonest.com_Mv72Qd98Pl' ); 
					setVetoSpecialiteError( error );
					formHasEmpty = true;
				}  
				if( vetoModeId == null ){ 
					const error = getAContent( 'cmp_vetonest.com_Kp48Qs91Lm' );
					setVetoTypeError( error );
					formHasEmpty = true
				}
				// Online-only vets: videoAllowed is forced = 1, so skip its
				// null-check (it can't be null in that mode).
				const isOnlineMode = allVetoModes.find( m => m.id === vetoModeId )?.name === 'online';
				if( !isOnlineMode && videoAllowed == null ){
					const error = getAContent( 'cmp_vetonest.com_video_allowed_required' ) || 'Please indicate if video consultation is allowed';
					setVideoAllowedError( error );
					formHasEmpty = true
				}
				const isInvalidTarif = ( v ) => !v || Number( v ) <= 0;
				if( isInvalidTarif( tarifMin ) || isInvalidTarif( tarifMax ) ){
					const error = getAContent( 'cmp_vetonest.com_tarif_required' ) || 'Consultation price is required and must be greater than 0';
					setTarifMinError( error );
					setTarifMaxError( error );
					formHasEmpty = true
				}
				if( (effectiveVideoAllowed === 1) && ( isInvalidTarif( tarifVideoMin ) || isInvalidTarif( tarifVideoMax ) ) ){
					const error = getAContent( 'cmp_vetonest.com_tarif_video_required' ) || 'Video consultation price is required and must be greater than 0';
					setTarifVideoMinError( error );
					setTarifVideoMaxError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields().catch(() => {}); // visual errors only; blocking done above
				return formHasEmpty;
			}
			await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				userId: userId,
				nom: vetoName,
				prenom: vetoFirstName,
				phone: selectedCountryCode + ' ' + phoneNumber.replaceAll(" ", ""),
				vetTitleId: selectedVetTitleId || null, 
				individualProfessionalId: individualProfessionalId,
				businessProfessionalId: businessProfessionalId,
				professionalIdMappingId: professionalIdMapping?.id || null,
				specialiteId: vetoSelectedSpecialities[0],
				vetoModeId: vetoModeId,                  // canonical — new field
				atHome: vetoType,                        // backward-compat legacy bool
				profileId: profileId,
				tarifConsultation: tarifMin && tarifMax ? tarifMin + '-' + tarifMax : '',
				videoAllowed: effectiveVideoAllowed,
				tarifConsultationVideo: effectiveVideoAllowed === 1 && tarifVideoMin && tarifVideoMax ? tarifVideoMin + '-' + tarifVideoMax : '',
				biography: biography,
			};
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
				return;
			}
			else{
				// Save location (Lieu) for the vet
				if (vetCountryId && vetCityId) {
					const lieuData = {
						lieuId: vetLieuId || null,
						adresse: vetAddress || null,
						paysId: vetCountryId,
						villeId: vetCityId,
						profileVetoId: profileId,
						enabled: true,
					};
					const lieuResp = await saveLieu(lieuData);
					if (!lieuResp) {
						message.warning(getAContent('cmp_vetonest.com_location_save_warning') || 'Location could not be saved.');
					}
				}
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}
		
		// Country & languages
		if( fieldName == 'Country' ){
			const sendData = {
				consultationCountryId: 	lastSelectedCountry,
				profileId: 				profileId,
			}
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  ); 
				setModalProfileIdentityOpen( false );
				return;
			}
		}

		// Language
		if( fieldName == 'Language' ){
			const languagePreferenceData = {
				userId:     userId,
				languageId: lastSelectedLanguage
			}
			const rep = await updateLanguagePreference( languagePreferenceData )
			if( rep !== false ){
				await setSelectedLanguageId( lastSelectedLanguage );
				await languageSetup( lastSelectedLanguage );
				user.languageId = lastSelectedLanguage;
				setUser( user );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Qb7tHr52Nv' ) );
				// Add these lines to close the modal
				setModalProfileIdentityOpen( false );
				setHasModalBeenShown( false );
				form.resetFields();
				return; // Add return to stop execution
			}
			else{
				message.error( getAContent( 'cmp_vetonest.com_Wk1cPv64Ts' ) );
				return;
			}
		}
		
		if( fieldName == 'Animaux'){
			const checkFormErrors = async( ) => {
				var errorsExist = false;
				if( animalNameError != '' )
					errorsExist = true
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				setPwResetSpin( 'none' );
				setSendingDisabled( false );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !animalName ){
					const error = getAContent( 'cmp_vetonest.com_Na82Lm51Qw' );
					setAnimalNameError( error );
					formHasEmpty = true
				}
				if( !animalSexe ){
					const error = getAContent( 'cmp_vetonest.com_Rp84Bt62Mn' );
					setAnimalSexeError( error );
					formHasEmpty = true
				}
				if( !animalDateNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Zu38Qp10Fx' );
					setAnimalDateNaissanceError( error );
					formHasEmpty = true
				}
				if( !especeSelectedId ){
					const error = getAContent( 'cmp_vetonest.com_Wv62Ak55Lo' );
					setAnimalEspeceError( error );
					formHasEmpty = true
				}
				if( !raceSelectedId ){
					const error = getAContent( 'cmp_vetonest.com_Mf29Dz83Qr' );
					setAnimalRaceError( error );
					formHasEmpty = true
				}	
				if( animalInsurance == null ){
					const error = getAContent( 'cmp_vetonest.com_Ba82Hr60Qn' );
					setAnimalInsuranceError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const animalData = {
                nomAnimal: animalName,
                sexeId: animalSexe,
                dateDeNaissance:  dayjs( animalDateNaissanceRaw ).format("YYYY-MM-DD"),
                especeId: especeSelectedId,
				raceId: raceSelectedId,
                profileUserId: profileId,
                assurance: animalInsurance, 
                active: 1,
				...( selectedPetId && { carnetAnimalId: selectedPetId, } )
			}
			const originFileObj = animalPhoto ? animalPhoto.originFileObj : null;
			const resp = await editUserPets( animalData, originFileObj );
			if( resp === false ){
				message.error( getAContent( 'cmp_vetonest.com_Jm3eXy90Pa' ) );
				return;
			}
			else{
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				return;
			}
		}

		if( fieldName == 'PasswordReset' ){
			const checkFormErrors = async( ) => {
				var errorsExist = false;
				if( pwResetPasswordError != '' )
					errorsExist = true
				else if( pwResetPasswordRepeatError != '' )
					errorsExist = true
				return errorsExist
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = '';
				if( pwResetPassword == '' ){
					setFormError01( 'block'  );
					const error = showAFormError( 'formError01' );
					formHasEmpty = error
				}
				else if( pwResetPasswordRepeat == '' ){
					setFormError02( 'block'  );
					const error = showAFormError( 'formError02' );
					formHasEmpty = error
				}
				return formHasEmpty
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				setPwResetSpin( 'none' );
				setSendingDisabled( false );
				return
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( formHasEmpty );
				setPwResetSpin( 'none' );
				setSendingDisabled( false );
				return
			}
			// No userId: the server changes the signed-in user's own password and
			// ignores any account id a caller supplies.
			const pwResetData = {
				password: 		pwResetPassword,
			}
			const resp = await updatePassword( pwResetData );
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			if( !resp ){
				setFormError05( 'block' );
				message.error( showAFormError( formError05 ) )
			}
			else{
				message.success( passwordForgot_updateSuccess );
				setVerificationCode( '' );
				setVerificationUserId( '' );
			}
		}
		
		// Email
		if( fieldName == 'Email' ){
			clearFormErrors()
			const checkEmailData = {
				email: signUpEmail
			}
			const checkFormErrors = async( ) => {
				if( signUpEmailError != '' )
					return true
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return
			}
			const checkEmailExist = await checkEmail( checkEmailData );
			if(checkEmailExist){
				setFormError02( 'block' );
				message.error( showAFormError( 'formError02' ) );
				setSendingDisabled( false );
				setSignUpEmail( '' );
				setSignUpSpin( 'none' );
				return
			}
			const code = await generateRandomDigits( maxCodeLength );
			setCode( code );
			const domainName 	= signUpEmail.split( '@' )[1];
			const subject 		= signUp_verifyEmailSubjet + siteName;
			const userName 		= user.nom;
			const sendEmailData = {
				to_email 		: signUpEmail,
				to_domain		: domainName,
				subject			: subject,
				userName    	: userName,
				siteName    	: siteName,
				siteDomain  	: siteDomain,
				siteEmail		: siteEmail,
				siteUrl     	: siteUrl,
				code  			: insertSpaceAtPosition ( code, 3 ),
				emailTemplate	: 'email_verification'
			}
			const rep = await sendEmail( sendEmailData );
			if( rep === false ){
				setFormError01( 'block' );
				message.error( showAFormError( 'formError01' ) );
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return;
			}
			setIsModalOpen(true);
			return
		}

		// Profile (User)
		if( fieldName == 'Profile' ){
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( nameError != '' ){
					errorsExist = true
					await setNameError( nameError );
					form.validateFields()
				}
				else if( firstNameError != '' ){
					errorsExist = true
					await setFirstNameError( firstNameError );
					form.validateFields()
				}
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !name ){
					const errorMessage = signUp_nameEmpty;
					await setNameError( errorMessage );
					formHasEmpty = true
				}
				if( !firstName ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Kt73Nd1Wqp' );
					await setFirstNameError( errorMessage );
					formHasEmpty = true
				}
				if( !dateDeNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Bt82Lm50Hv' );
					setDateDeNaissanceError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				nom:                name,
				prenom:             firstName,
				sexeId:             sexe ? sexe : userProfile.sexeId,
				profileId:          profileId,
				userId:             userId,
				dateDeNaissance:    dayjs( dateDeNaissanceRaw ).format("YYYY-MM-DD"),
				langues:            selectedLanguages.join( ',' ),
				// Location fields
				lieuId:             userLieuId || null,
				lieuAddress:        userAddress || '',
				lieuCountryId:      userCountryId || null,
				lieuCityId:         userCityId || null,
				country:            userCountryId ? countriesAllowed.find(c => c.id === userCountryId)?.nom : '',
				city:               userCityId ? userCityOptions.find(c => c.id === userCityId)?.nom : '',
				adresse:            userAddress || '',
			};
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else {
				// Update user object with new values
				const updatedUser = { ...user };
				updatedUser.userPrenom = firstName;
				updatedUser.userNom = name;
				await logIn(updatedUser);
				
				// Force a refresh of the parent profile data
				const random = generateRandomDigits(3);
				setProfileFormUpdated(random);
				
				message.success(getAContent('cmp_vetonest.com_Fg6kVs22Qe'));
				setModalProfileIdentityOpen(false);
				
				// Manually update local state to avoid delay
				setName(name);
				setFirstName(firstName);
				setSexe(sexe ? sexe : userProfile.sexeId);
			}
		}
		
		// FirstName
		if( fieldName == 'FirstName' ){
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( firstNameError != '' ){
					errorsExist = true
					await setNameError( nameError );
					form.validateFields()
				}
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !firstName ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Kt73Nd1Wqp' );
					await setFirstNameError( errorMessage );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				prenom:	firstName,
				profileId: profileId,
				userId: userId
			}
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				user[ 'userPrenom' ] = firstName;
				logIn( user );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}

		// Name
		if( fieldName == 'Name' ){
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( nameError != '' ){
					errorsExist = true
					await setNameError( nameError );
					form.validateFields()
				}
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !name ){
					const errorMessage = signUp_nameEmpty;
					await setNameError( errorMessage );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				nom:		name,
				profileId: profileId,
				userId: userId
			}
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				user[ 'userNom' ] = name;
				logIn( user );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}
		
		// Sexes
		if( fieldName == 'Sexes' ){
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !sexe ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Mn2Xk8bPrV' );
					await setSexeError( errorMessage );
					formHasEmpty = true
				}
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				sexeId:	sexe ? sexe : userProfile.sexeId,
				profileId: profileId,
				userId: userId
			}
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}
		
		// birth date Shortcut
		if( fieldName == 'BirthDate' ){
			const checkFormEmpty = async() => {
				var formHasEmpty = false;
				if( !dateDeNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Bt82Lm50Hv' );
					setDateDeNaissanceError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				return formHasEmpty;
			}
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );
				return
			}
			const sendData = {
				dateDeNaissance: 	dateDeNaissanceRaw,
				profileId: profileId,
				userId: userId
			}
			const rep = await profileUpdate( sendData, null, profileTypeId );
			if( rep === false ){
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}
		}
	}


	// Modal
	const modalProfileIdentityOk = async( ) => {
		const rep = await handleClickSave();
		if( rep !== false ){
			modalProfileIdentityClosed();
			setHasModalBeenShown( false );
		}
	}
	
	const modalProfileIdentityCancel = async( ) => {
		setModalProfileIdentityOpen( false );
		setHasModalBeenShown( false );
	}
	
	const modalProfileIdentityClosed = async( ) => {
		setVisibleModalName( '' );
		setModalProfileIdentityOpen( false );
		setHasModalBeenShown( false );
		form.resetFields();
	}

	// birth date
	const [ datePickerDefaultValue, setDatePickerDefaultValue ] = useState( '' ); 
	const [ fieldName, setFieldName ] = useState( '' );
	
	// user language selector
	const { Option } = Select;
	const [ selectedLanguages, setSelectedLanguages ] = useState([]);

	const [ languageError, setLanguageError ] = useState( '' );
	const MAX_LANGUAGES = 3;
	const handleChangeLanguage = (value) => {
		if ( value.length > MAX_LANGUAGES ) {
			setSelectedLanguages( value.slice(0, MAX_LANGUAGES) );
			message.info( getAContent( 'cmp_vetonest.com_Wn84Bx2Kqt' ) );
		} 
		else {
			setSelectedLanguages(value);
		}
		setLanguageError('');
		form.validateFields()
	}

	// countries
	const [ countryError, setCountryError ] = useState( '' );
	const [ countryDefault, setCountryDefault ] = useState( getAContent(  'cmp_vetonest.com_k3a92hFsP1'  )  );
	const [ countrySelected, setCountrySelected ] = useState( '' );
	const [ countries, setCountries ]  = useState( [] ); 
	const [ countryCode, setCountryCode ] = useState( '' );	
	const [ flagCode, setFlagCode ] = useState( '' );

	const [ lieuCountryError, setLieuCountryError ] = useState( '' );
	const [ lieuCountryDefault, setLieuCountryDefault ] = useState( getAContent(  'cmp_vetonest.com_k3a92hFsP1'  ) );
	const [ lieuCountrySelected, setLieuCountrySelected ] = useState( '' );
	const [ lieuCountries, setLieuCountries ]  = useState( [] ); 	
	
	const [ lieuCityError, setLieuCityError ] = useState( '' );
	const [ lieuCityDefault, setLieuCityDefault ] = useState( getAContent(  'cmp_vetonest.com_Pq8x2VmAz9'  ) );
	const [ lieuCitySelected, setLieuCitySelected ] = useState( '' );
	const [ lieuCities, setLieuCities ]  = useState( [] ); 

	const handleChangeFlag = ( countryIso ) => {
		const country = countriesAllowed.filter( e => e.iso == countryIso )[0];
		setSelectedFlag( country.iso );
		setSelectedCountryCode( country.countryCode );
	}

	const handleChangeCountrySelected = ( countryCode ) => {
		setCountrySelected( countryCode );
		const countryStates = State.getStatesOfCountry( countryCode );
		setCountryCode( countryCode );
		setFlagCode( flagCode );
		setStates( countryStates );			
		setCountryError( '' );
		setShowStatesCities( '' );
		setStateSelected( '' );
		setCitySelected( '' );
	}

	const [ displayLieuCity, setDisplayLieuCity ] = useState( 'none' );
	const handleChangeLieuCountrySelected = async (countryId) => {
		setLieuCountrySelected(countryId);
		setLieuCountryError(''); // Clear error when user selects
		setLieuCitySelected('');
		setLieuCityError('');
		form.setFieldsValue({ LieuCity: undefined });
		
		if (countryId) {
			const lieuVilles = await getPaysVilles(countryId);
			if (lieuVilles && lieuVilles.length) {
				const localizedCities = await getLocalizedCities(lieuVilles);
				setLieuCities(localizedCities);
				setDisplayLieuCity('block');
			} else {
				setLieuCities([]);
				setDisplayLieuCity('none');
			}
		} else {
			setLieuCities([]);
			setDisplayLieuCity('none');
		}
		
		form.validateFields(['LieuCountry']);
	};

	const handleChangeLieuCitySelected = (cityId) => {
		setLieuCitySelected(cityId);
		setLieuCityError(''); // Clear error when user selects
		form.setFieldsValue({ LieuCity: cityId });
		form.validateFields(['LieuCity']);
	};

	// states
	const [ stateError, setStateError ] = useState( '' );
	const [ stateDefault, setStateDefault ] = useState( getAContent(  'cmp_vetonest.com_Rn3t7KcUy4'  )  );
	const [ stateNotFound, setStateNotFound ] = useState( getAContent(  'cmp_vetonest.com_Hb2e8NvTs8'  )  );
	const [ stateSelected, setStateSelected ] = useState( '' );
	const [ states, setStates ]  = useState( [] );
	const handleChangeStateSelected = ( stateCode ) => {
		setStateSelected( stateCode );
		const stateCities = City.getCitiesOfState( countryCode, stateCode );
		setStateError( '' );
		setCities( stateCities );
		setCitySelected( '' );
	}

	// cities
	const [ cityError, setCityError ] = useState( '' );
	const [ cityDefault, setCityDefault ] = useState( getAContent(  'cmp_vetonest.com_Pq8x2VmAz9'  ) );
	const [ cityNotFound, setCityNotFound ] = useState( getAContent(  'cmp_vetonest.com_Rn3t7KcUy4'  ) );
	const [ citySelected, setCitySelected ] = useState( '' );
	const [ cities, setCities ]  = useState( [] ); 
	const handleChangeCitySelected = ( value ) => {
		setCitySelected( value );
		setCityError();
	}
	const [ showStatesCities, setShowStatesCities ]  = useState( 'none' );

	// Phone number veto
	const [ phoneNumber, setPhoneNumber ] = useState( '' );
	const [phoneNumberError, setPhoneNumberError]  = useState( '' );
	const handleChangePhoneNumber = ( e ) => {
		const data = e.target.value;
		setPhoneNumber( data );
		var phoneErrorText = '';
		if( data.length == 0 )
			phoneErrorText = '';
		else if( data.length > 0 && data.length < 7 )
			phoneErrorText = getAContent( 'cmp_vetonest.com_Ee4b7YsRf1' );
		else if( !isValidPhoneNumber( selectedCountryCode + data ) )
			phoneErrorText = getAContent( 'cmp_vetonest.com_Uu5r3JdWg6' );
		setPhoneNumberError( phoneErrorText );
	}
	const isValidPhoneNumber = (value) => {
		return (/^\+(?:[ 0-9] ?){6,14}[0-9]$/).test(value);
	}

	// Espece
	const [ especeSelectedId, setEspeceSelectedId ] = useState( '' );

	// Race
	const [ races, setRaces ] = useState( [] ); 
	const [ raceSelectedId, setRaceSelectedId ] = useState( '' );

	// Animal
	const [ animal, setAnimal ] = useState( '' );
	const [ showBreeds, setShowBreeds ]  = useState( 'none' );

	// Account language options
	const [ languageOptions, setLanguageOptions ] =  useState( [] );
	const [ languageDefault, setLanguageDefault ] = useState( [] );
	const [ languageSelected, setLanguageSelected ] = useState( [] );

	const [ lastSelectedLanguage, setLastSelectedLanguage ] = useState( selectedLanguageId );
	const onLanguageOptionChange = async ( checkedValues ) => {
		const valuesNew = checkedValues.filter((v) => v !== lastSelectedLanguage);
		const value = valuesNew.length ? valuesNew[0] : '';
		setLastSelectedLanguage(value);
		setLanguageSelected([value]);
	}

	// Account country options
	const [ countriesOptions, setCountriesOptions ] =  useState( [] );
	const [ countriesDefault, setCountriesDefault ] = useState( [] );
	const [ countriesSelected, setCountriesSelected ] = useState( [] );

	const [ lastSelectedCountry, setLastSelectedCountry ] = useState( userProfile.paysDeLaConsultation ? userProfile.paysDeLaConsultation.id : 1 );
	const onCountryOptionChange = async ( checkedValues ) => {
		const valuesNew = checkedValues.filter((v) => v !== lastSelectedCountry);
		const value = valuesNew.length ? valuesNew[0] : '';
		setLastSelectedCountry(value);
		setCountriesSelected([value]);
	}

	// userSpecialities
	const [ vetoSelectedSpecialities, setVetoSelectedSpecialities ] =  useState( [] );
	const [ vetoSpecialiteError, setVetoSpecialiteError  ] =  useState( '' )
	const MAX_SPECIALITIES = 1;
	const handleChangeVetoSpecialities = (value) => {
		if ( value.length > 0 ) {
			setVetoSpecialiteError('');
			form.validateFields()
		}
		if (value.length > MAX_SPECIALITIES) {
		  setVetoSelectedSpecialities( value.slice(0, MAX_SPECIALITIES) );
		} 
		else {
		  setVetoSelectedSpecialities(value);
		}
	}
	
	// all etablissement types
	const [ selectedEtablissementTypes, setSelectedEtablissementTypes ] =  useState( [] );
	const [ etablissementTypeError, setEtablissementTypeError  ] =  useState( '' )
	const MAX_ETSTYPES = 1;
	const handleChangeEtablissementType = (value) => {
		if ( value.length > 0 ) {
			setEtablissementTypeError('');
			form.validateFields()
		}
		if (value.length > MAX_ETSTYPES) {
		  setSelectedEtablissementTypes( value.slice(0, MAX_ETSTYPES) );
		} 
		else {
		  setSelectedEtablissementTypes(value);
		}
	}
	
	// veto RPPS
	// const [ vetoRpps, setVetoRpps ] =  useState( '' );
	// const [ vetoRppsError, setVetoRppsError ] =  useState( '' );
	// const handleChangeVetoRpps = async ( e ) => {
		// const data = e.target.value;
		// setVetoRpps( data );
		// var vetoRppsErrorText = '';
		// const test = await validateRppsNumber( data );
		// if( data != '' && test === false ){
			// vetoRppsErrorText = getAContent(  'cmp_vetonest.com_Di6c1XpMf4'  ) ;
		// }
		// setVetoRppsError( vetoRppsErrorText );
		// form.validateFields();
	// }

	// veto SIRET 
	// const [ vetoSiret, setVetoSiret ] =  useState( '' );
	// const [ vetoSiretError, setVetoSiretError ] =  useState( '' );
	// const handleChangeVetoSiret = ( e ) => {
		// const data = e.target.value;
		// setVetoSiret( data );
		// var vetoSiretErrorText = '';
		// const test = validateSiretNumber( data )
		// if( data != '' && test === false ){
			// vetoSiretErrorText = getAContent( 'cmp_vetonest.com_Zz1k5BrTn8' );
			// setVetoSiretError( vetoSiretErrorText )
		// }
		// setVetoSiretError( vetoSiretErrorText );
		// form.validateFields();
	// }

	// Handler for individual professional ID (RPPS, NPI, GMC, etc.)
	const handleChangeIndividualProfessionalId = async (e) => {
		const data = e.target.value;
		setIndividualProfessionalId(data);
		form.setFieldsValue({ IndividualProfessionalId: data });
		let errorText = '';
		let isValidFormat = true;
		
		// Quick regex check for format
		if (data && individualRegex) {
			const regex = new RegExp(individualRegex);
			isValidFormat = regex.test(data);
			if (!isValidFormat) {
				errorText = getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: individualLabel });
			}
		}
		
		// If format passes and we have a country ID, do full validation via backend
		if (isValidFormat && data && data.length > 0 && vetCountryId) {
			try {
				const response = await fetch('/api/validate/professionalId', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						value: data,
						type: 'individual',
						countryId: vetCountryId
					})
				});
				const result = await response.json();
				if (!result.valid) {
					errorText = getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: individualLabel });
				}
			} catch (err) {
				console.error('Validation error:', err);
			}
		}
		
		setIndividualProfessionalIdError(errorText);
		form.validateFields();
	};

	// Handler for business professional ID (SIRET, EIN, CRN, etc.)
	const handleChangeBusinessProfessionalId = (e) => {
		const data = e.target.value;
		setBusinessProfessionalId(data);
		form.setFieldsValue({ BusinessProfessionalId: data });
		let errorText = '';
		let isValidFormat = true;
		
		// Quick regex check for format
		if (data && businessRegex) {
			const regex = new RegExp(businessRegex);
			isValidFormat = regex.test(data);
			if (!isValidFormat) {
				errorText = getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: businessLabel });
			}
		}
		
		// If format passes and we have a country ID, do full validation via backend
		if (isValidFormat && data && data.length > 0 && vetCountryId) {
			// You can add async validation here if needed
			// For now, just use regex validation
			if (!isValidFormat) {
				errorText = getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: businessLabel });
			}
		}
		
		setBusinessProfessionalIdError(errorText);
		form.validateFields();
	};

	// Helper to open verification URL
	const openVerificationUrl = () => {
		if (verificationUrl) {
			window.open(verificationUrl, '_blank');
		}
	};




	const [ tarif, setTarif ] =  useState( '' );
	const [ tarifVideo, setTarifVideo ] =  useState( '' );
	// Tarif Min
	const [ tarifMin, setTarifMin ] =  useState( 0 );
	const [ tarifMinError, setTarifMinError ] =  useState( '' );
	const handleChangeTarifMin = ( e ) => {
		const data = e.target.value;
		setTarifMin( data );
		setTarifMinError( '' );
		setTarifMaxError( '' );
		if( data && parseInt( data ) <= 0 ){
			const tarifZeroErrorText = getAContent( 'cmp_vetonest.com_tarif_zero_not_allowed' ) || 'Price must be greater than 0';
			setTarifMinError( tarifZeroErrorText );
		}
		else if( parseInt( data ) > parseInt( tarifMax )  ){
			const tarifMinErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifMinError( tarifMinErrorText );
		}
		else if( !tarifMax ){
			const tarifMinErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' );
			setTarifMaxError( tarifMinErrorText );
		}
		else if( !data && !tarifMin ){
			setTarifMinError( '' );
			setTarifMinError( '' );
		}
		form.validateFields();
	}

	// Tarif Max
	const [ tarifMax, setTarifMax ] =  useState( 0 );
	const [ tarifMaxError, setTarifMaxError ] =  useState( '' );
	const handleChangeTarifMax = ( e ) => {
		const data = e.target.value;
		setTarifMax( data );
		setTarifMinError( '' );
		setTarifMaxError( '' );
		if( data && parseInt( data ) <= 0 ){
			const tarifZeroErrorText = getAContent( 'cmp_vetonest.com_tarif_zero_not_allowed' ) || 'Price must be greater than 0';
			setTarifMaxError( tarifZeroErrorText );
		}
		else if( parseInt( data ) < parseInt( tarifMin )  ){
			const tarifMaxErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifMaxError( tarifMaxErrorText );
		}
		else if( !tarifMin ){
			const tarifMaxErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' );
			setTarifMinError( tarifMaxErrorText );
		}
		else if( !tarifMin && !data ){
			setTarifMinError( '' );
			setTarifMinError( '' );
		}
		form.validateFields();
	}

	// TarifVideo video min
	const [ tarifVideoMin, setTarifVideoMin ] =  useState( 0 );
	const [ tarifVideoMinError, setTarifVideoMinError ] =  useState( '' );
	const handleChangeTarifVideoMin = ( e ) => {
		const data = e.target.value;
		setTarifVideoMin( data );
		setTarifVideoMinError( '' );
		setTarifVideoMaxError( '' );
		if( data && parseInt( data ) <= 0 ){
			const tarifZeroErrorText = getAContent( 'cmp_vetonest.com_tarif_zero_not_allowed' ) || 'Price must be greater than 0';
			setTarifVideoMinError( tarifZeroErrorText );
		}
		else if( parseInt( data ) > parseInt( tarifVideoMax )  ){
			const tarifVideoMinErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifVideoMinError( tarifVideoMinErrorText );
		}
		else if( !tarifVideoMax ){
			const tarifVideoMinErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' );
			setTarifVideoMaxError( tarifVideoMinErrorText );
		}
		else if( !data && !tarifVideoMin ){
			setTarifVideoMinError( '' );
			setTarifVideoMinError( '' );
		}
		form.validateFields();
	}

	// TarifVideo video max
	const [ tarifVideoMax, setTarifVideoMax ] =  useState( 0 );
	const [ tarifVideoMaxError, setTarifVideoMaxError ] =  useState( '' );
	const handleChangeTarifVideoMax = ( e ) => {
		const data = e.target.value;
		setTarifVideoMax( data );
		setTarifVideoMinError( '' );
		setTarifVideoMaxError( '' );
		if( data && parseInt( data ) <= 0 ){
			const tarifZeroErrorText = getAContent( 'cmp_vetonest.com_tarif_zero_not_allowed' ) || 'Price must be greater than 0';
			setTarifVideoMaxError( tarifZeroErrorText );
		}
		else if( parseInt( data ) < parseInt( tarifVideoMin )  ){
			const tarifVideoMaxErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifVideoMaxError( tarifVideoMaxErrorText );
		}
		else if( !tarifVideoMin ){
			const tarifVideoMaxErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' );
			setTarifVideoMinError( tarifVideoMaxErrorText );
		}
		else if( !tarifVideoMin && !data ){
			setTarifVideoMinError( '' );
			setTarifVideoMinError( '' );
		}
		form.validateFields();
	}

	// Video consultation allowed (1 = allowed, 0 = not allowed, null = not specified yet)
	const [ videoAllowed, setVideoAllowed ] = useState( null );
	const [ videoAllowedError, setVideoAllowedError ] = useState( '' );
	const handleChangeVideoAllowed = ( e ) => {
		const value = e.target.value;
		setVideoAllowed( value );
		setVideoAllowedError( '' );
		if( value === 0 ){
			// Video consultation disallowed: clear the video price range, it's no longer relevant
			setTarifVideoMin( '' );
			setTarifVideoMax( '' );
			setTarifVideoMinError( '' );
			setTarifVideoMaxError( '' );
			form.setFieldsValue( { TarifVideoMin: '', TarifVideoMax: '' } );
		}
		form.validateFields();
	}

	// Veto Type
	// Veto modes (home / clinic / online) loaded from the API
	const [ allVetoModes, setAllVetoModes ] = useState( [] );
	// The selected VetoMode id (matches veto_mode.id: 1=home, 2=clinic, 3=online)
	const [ vetoModeId, setVetoModeId ] = useState( null );
	const [ vetoTypeError, setVetoTypeError ] = useState( '' );

	// Kept as a derived convenience so legacy code that reads vetoType still
	// compiles.  1 = home, 0 = clinic/online (mirrors old atHome bool).
	const vetoType = vetoModeId !== null
		? (allVetoModes.find(m => m.id === vetoModeId)?.name === 'home' ? 1 : 0)
		: null;

	const handleChangeVetoType = ( e ) => {
		const selectedId = e.target.value; // veto_mode.id
		setVetoModeId( selectedId );
		setVetoTypeError( '' );
		// Online-only vets must always have video enabled — force it and lock it
		const selectedMode = allVetoModes.find( m => m.id === selectedId );
		if ( selectedMode?.name === 'online' ) {
			setVideoAllowed( 1 );
			setVideoAllowedError( '' );
			form.setFieldsValue( { VideoAllowed: 1 } );
		}
	};

	const [ checkboxesAtHomeNoneSelectedDisplay, setCheckboxesAtHomeNoneSelectedDisplay ] = useState( 'none' );
	
	// veto absence
	const [ absence, setAbsence ]= useState( '' );

	// veto List
	const [checkedVetoList, setCheckedVetoList] = useState([]);
	const onVetoListChange = (list) => {
		setCheckedVetoList(list);
	};

	// veto hollyday
	const [ hollyday, setHollyday ]= useState( '' );
	
	// Modal
	const [ openModal, setOpenModal ] = useState( false );
	const [ hasModalBeenShown, setHasModalBeenShown ] = useState( false );

	// form
	const [form] = Form.useForm();

	// When Effect 2 loads the profile it sets vetCountryId, which triggers the
	// vetCountryId watcher. That watcher would normally reset the professional ID
	// fields. To prevent this, Effect 2 stores the saved IDs here first; the
	// watcher reads and clears them so it can restore instead of reset.
	const pendingProfessionalIds = React.useRef(null);

	// Effect 0: load veto modes once on mount — these are static reference data
	// (home / clinic / online) that don't change per session, so we only fetch
	// once and cache in state.
	useEffect( () => {
		const fetchModes = async () => {
			const modes = await listVetoMode();
			if ( modes && modes.length ) {
				setAllVetoModes( modes );
			}
		};
		fetchModes();
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Effect 1: control modal open/close only — isolated so data-loading state
	// changes don't retrigger the guard and immediately close the modal.
	useEffect(() => {
		const fieldName = params.params.fieldName;
		setFieldName( fieldName );
		const shouldOpen = ( fieldName === visibleModalName ) && modalProfileIdentityOpen;
		if ( shouldOpen ) {
			setOpenModal( true );
			setHasModalBeenShown( true );
		} else {
			setOpenModal( false );
			setHasModalBeenShown( false );
		}
	}, [ modalProfileIdentityOpen, visibleModalName, params.params ]);

	// Effect 2: load form data whenever the modal becomes open
	useEffect(() => {
		if ( !openModal ) return;

		const vetosToInvite = vetos.filter( e => e.id != profileId );
		setVetosToInvite( vetosToInvite );
		form.resetFields();
		clearFormErrors();
		setTitle( visibleModalTitle );
		const fieldName = params.params.fieldName;

		const allCountries = Country.getAllCountries();
		var countries = Array();
		for( const country of allCountries ){ 
			country.id = country.isoCode;
			countries.push( country );
		}
		setCountries( countries );
		const countriesOptions = countriesAllowed.map( ( v, k ) => ( { value: v.id, label: eval( v.tagClass ) } ) );
// console.log( '>>>>>>>>>>>>>> cccccccccc countriesOptions', countriesOptions );

		setCountriesOptions( countriesOptions  );
		const countryDefault = [ userProfile.paysDeLaConsultation ? userProfile.paysDeLaConsultation.id : 1 ];
		setCountriesSelected( countryDefault );
		const languageOptions = languages.map( ( v, k ) => ( { value: v.id, label: eval( v.tagClass ) } ) );
		setLanguageOptions( languageOptions  );
		const languageDefault = [ selectedLanguageId ];
		setLanguageSelected( languageDefault );
		setAnimalName( null );
		setAnimalDateNaissance( null );
		setAnimalSexes( null );
		setShowBreeds( 'none' )
		setEspeceSelectedId( null );
		setRaceSelectedId( null );
		setAnimalPhoto( '' )
		setAnimalInsurance( null );
		const a = async () => {
			// Etablissement
			const vetoCliniqueInfo = await getVetoCliniqueInfo(profileId);
			if (fieldName == "Etablissement") {
				if (vetoCliniqueInfo.etablissementId) {
// console.log( 'vvvvvvvvvvvvvvvvvvvvvvvvv vetoCliniqueInfo', vetoCliniqueInfo );
					setEtablissementName(vetoCliniqueInfo.name);
					setEtablissementPresentation(vetoCliniqueInfo.presentation);

					// etablissementType may be null if the clinic has no type set yet
					const etablissementTypeId = vetoCliniqueInfo.type?.id ?? null;
					setSelectedEtablissementTypes(etablissementTypeId ? [etablissementTypeId] : []);

					// Load existing photo
					if (vetoCliniqueInfo.picture) {
						setEtablissementPhoto(base_url + 'uploads/files/etablissement/' + vetoCliniqueInfo.picture);
					}

					form.setFieldsValue({
						EtablissementName: vetoCliniqueInfo.name,
						EtablissementPresentation: vetoCliniqueInfo.presentation,
						EtablissementType: etablissementTypeId ? [etablissementTypeId] : [],
						EtablissementPhoto: vetoCliniqueInfo.picture ?? null,
					});
					setVetoCliniqueInfo(vetoCliniqueInfo);
				}
			}
			// User profile
			if( fieldName == "Profile" ){
// console.log( '------ uuuuuuuuuuserProfile', userProfile );
				const name = userProfile.nom;
				setName( name );
				form.setFieldsValue( {Name: name} );
				const firstName = userProfile.prenom;
				setFirstName( firstName );
				form.setFieldsValue( {FirstName: firstName} );
				const birthDate = userProfile.birthDateFormated ? userProfile.birthDateFormated : null;
				const dateNaissance = birthDate ? await dayjs( birthDate ) : '';
				setDateDeNaissance( dateNaissance );
				setDateDeNaissanceRaw( birthDate )
				const userLanguages = userProfile.langue ? userProfile.langue : [];
				if( Array.isArray( userLanguages ) ){
					const userLanguagesId = userLanguages.map( ( v, k ) => v.id );
					setSelectedLanguages( userLanguagesId )
				}
				const sex = userProfile.sexeId;
				form.setFieldsValue( { Sexe: sex ? sex : '' } );
				setSexe( sex ? sex : '' );
				
				// Load user's location from Lieu
				if (profileTypeId == 1 && profileId) {
					const userLieu = await getUserLieu(profileId);
					if (userLieu) {
						setUserLieuId(userLieu.id);
						setUserAddress(userLieu.adresse || '');
						setUserCountryId(userLieu.pays?.id || null);
						setUserCityId(userLieu.ville?.id || null);
						if (userLieu.pays?.id) {
							const cities = await getPaysVilles(userLieu.pays.id);
							if (cities.length) {
								const localizedCities = await getLocalizedCities( cities );
								setUserCityOptions(localizedCities);
								setDisplayUserCity('block');
							}
						}
						form.setFieldsValue({
							UserAddress: userLieu.adresse || '',
							UserCountry: userLieu.pays?.id || null,
							UserCity: userLieu.ville?.id || null,
						});
					}
				}
			}
			// Profile veto
			if( profileTypeId == 2 && userProfile.id ){
				setVetoName( userProfile.nom );
				form.setFieldsValue( { VetoName: userProfile.nom } );
				setVetoFirstName( userProfile.prenom );
				form.setFieldsValue( { VetoFirstName: userProfile.prenom } );
				const countryCode = userProfile.phone ? userProfile.phone.split( ' ' )[0] : '+33'
				const phone = userProfile.phone ? userProfile.phone.split( ' ' )[1] : ''
				const country = countriesAllowed.filter( e => e.countryCode == countryCode )[0];
				const countryIso = country ? country.iso : 'fr';
				setSelectedCountryCode( countryCode );
				setSelectedFlag( countryIso );
				setPhoneNumber( phone );
				form.setFieldsValue( { PhoneNumber: phone } );
				// setVetoSiret( userProfile.siret );
				// form.setFieldsValue( { VetoSiret: userProfile.siret } );
				// setVetoRpps( !userProfile.rpps );
				// form.setFieldsValue( { VetoRpps: userProfile.rpps } );
				const specialiteId = userProfile.vetoSpecialite?.id ? Number(userProfile.vetoSpecialite.id) : null;
				const specialiteIds = specialiteId ? [ specialiteId ] : [];
				setVetoSelectedSpecialities( specialiteIds );
				form.setFieldsValue( { VetoSpecialite: specialiteIds } );

				// Load veto mode: prefer the vetoMode object from the API (new path),
				// fall back to deriving from the legacy atHome bool for un-migrated rows.
				let resolvedVetoModeId = null;
				if ( userProfile.vetoMode?.id ) {
					resolvedVetoModeId = userProfile.vetoMode.id;
				} else if ( userProfile.atHome != null ) {
					// Legacy fallback: find the matching mode by name from allVetoModes
					// (which may not be loaded yet on first render - that's fine, the
					// Effect 0 will populate it and re-renders will not re-run this).
					const modeName = userProfile.atHome == true ? 'home' : 'clinic';
					const fallbackMode = allVetoModes.find( m => m.name === modeName );
					resolvedVetoModeId = fallbackMode?.id ?? null;
				}
				setVetoModeId( resolvedVetoModeId );
				form.setFieldsValue( { VetoType: resolvedVetoModeId } );
				// vet title ex.: Dr, ...
				if (userProfile.vetTitle && userProfile.vetTitle.id) {
					setSelectedVetTitleId(userProfile.vetTitle.id);
					form.setFieldsValue({ VetTitleId: userProfile.vetTitle.id });
				}
				if( userProfile.tarifConsultation ){
					const tarifMin = userProfile.tarifConsultation.split( '-' )[0];
					const tarifMax = userProfile.tarifConsultation.split( '-' )[1];
					setTarifMin( tarifMin );
					setTarifMax( tarifMax );
					form.setFieldsValue( { TarifMin: tarifMin } );
					form.setFieldsValue( { TarifMax: tarifMax } );
				}
				const videoAllowedValue = userProfile.videoAllowed != null ? ( userProfile.videoAllowed == true ? 1 : 0 ) : null;
				setVideoAllowed( videoAllowedValue );
				form.setFieldsValue( { VideoAllowed: videoAllowedValue } );
				if( userProfile.tarifConsultationVideo ){
					const tarifVideoMin = userProfile.tarifConsultationVideo.split( '-' )[0];
					const tarifVideoMax = userProfile.tarifConsultationVideo.split( '-' )[1];
					setTarifVideoMin( tarifVideoMin );
					setTarifVideoMax( tarifVideoMax );
					form.setFieldsValue( { TarifVideoMin: tarifVideoMin } );
					form.setFieldsValue( { TarifVideoMax: tarifVideoMax } );
				}
				// Load existing vet location (Lieu)
				if (profileId) {
					const lieux = await getAVetoLieux({ profileVetoId: profileId });
					if (lieux && lieux.length) {
						const firstLieu = lieux[0];
						setVetLieuId(firstLieu.id);
						setVetAddress(firstLieu.adresse || '');
						setVetCityId(firstLieu.ville?.id || null);
						if (firstLieu.pays?.id) {
							const cities = await getPaysVilles( firstLieu.pays.id );
							if (cities && cities.length) {
								const localizedCities = await getLocalizedCities( cities );
								setVetCityOptions(localizedCities);
								setDisplayVetCity('block');
							}
						}
						form.setFieldsValue({
							VetAddress: firstLieu.adresse || '',
							VetCountry: firstLieu.pays?.id || null,
							VetCity: firstLieu.ville?.id || null,
						});
						// Store the saved professional IDs in the ref BEFORE calling
						// setVetCountryId. The vetCountryId watcher will fire after
						// this state update and will restore them instead of clearing.
						pendingProfessionalIds.current = {
							individualProfessionalId: userProfile.individualProfessionalId || '',
							businessProfessionalId:   userProfile.businessProfessionalId   || '',
							professionalIdMapping:    userProfile.professionalIdMapping     || null,
						};
						setVetCountryId(firstLieu.pays?.id || null);
					}
				}
				// Biography
				if (userProfile.biography) {
					setBiography(userProfile.biography);
					form.setFieldsValue({ Biography: userProfile.biography });
				}
			}
			// veto absence
			if( fieldName == 'Absence' && selectedAbsenceId ){
				const absence = absences.filter( e => e.id == selectedAbsenceId )[0];
				setAbsence( absence );
				setTitle( getAContent( 'cmp_vetonest.com_Tt9f2BmLo7' ) );
				const closeDate = absence.closedDate ? dayjs( absence.closedDate.date ) : '';
				setDateDeNaissance( closeDate );
				const nomAbsence = absence.nom ? absence.nom : '';
				setAbsenceName( nomAbsence );
				const descriptionAbsence = absence.description ? absence.description : '';
				setAbsenceDescription( descriptionAbsence );
				form.setFieldsValue( { AbsenceName: nomAbsence, AbsenceDescription: descriptionAbsence } );
			}
			else if( fieldName == 'Absence' && ! selectedAbsenceId ){
				setTitle( getAContent( 'cmp_vetonest.com_Oo3j6FwQy9' ) ); 
				form.setFieldsValue( { AbsenceName: '', AbsenceDescription: '' } );
			}
			// veto timeSlot
			if( fieldName == "Opened" || fieldName == "Closed" ){
				if( fieldName == "Opened" ){
					const startTime 	= selectedTimeslotOpen.startTime;
					const endTime 		= selectedTimeslotOpen.endTime;

					// startTime/endTime are raw, timezone-less strings like
					// "2026-06-26 14:00:00.000000" - the HH:mm digits ARE the
					// vet's literal local wall-clock hour (see TimeSlotController::edit(),
					// which never associates a timezone with these values at all).
					//
					// dayjs(startTime) here would parse this as the browser's
					// *ambient system timezone* (no utc/timezone plugin is loaded
					// in this file, so it falls back to native Date parsing rules),
					// silently corrupting the prefilled time whenever the person
					// editing isn't on a machine set to the vet's own timezone.
					// Extract the digits directly and build a wall-clock value
					// instead, so this can't drift based on where it's viewed from.
					const toWallClockTime = ( raw ) => {
						if( !raw ) return null;
						const match = String( raw ).match( /(\d{2}):(\d{2})/ );
						if( !match ) return null;
						return dayjs().hour( parseInt( match[1], 10 ) ).minute( parseInt( match[2], 10 ) ).second( 0 ).millisecond( 0 );
					};

					setStartTime( toWallClockTime( startTime ) );
					setEndTime( toWallClockTime( endTime ) );
				}
				const day 			= selectedTimeslotOpen.day;
				const dayId			= selectedTimeslotOpen.dayId;
				const opened		= selectedTimeslotOpen.opened;
				const timeSlotId	= selectedTimeslotOpen.timeSlotId;
				setDay( day );
				setDayId( dayId );
				setOpened( opened );
				setTimeSlotId( timeSlotId );
				setTitle( getAContent( 'cmp_vetonest.com_Jj8n4HdCp6' )  ); 
			}
			// Etablissement_lieu
			if( fieldName == "Etablissement_lieu" ){
				if( selectedLieuId ){
					const lieu = await getALieu( selectedLieuId );
					form.setFieldsValue( { LieuAddress: lieu.adresse } );
					setEtablissementAddress( lieu.adresse );
					form.setFieldsValue( { Parking: lieu.parking } );
					for ( const transport of lieu.transports ){
						const id = transport.transportId;
						const fieldName = transports.filter( e => e.id == id )[0].fieldName;
						const value = transport.description;
						form.setFieldsValue( { [fieldName] : value } );
					}
					form.setFieldsValue( { Info: lieu.info } );
					if( lieu.pays ){
						const countryId = lieu.pays.id;
						var cityId = '';
						if( lieu.ville )
							cityId = lieu.ville.id;
						setLieuCountrySelected(countryId);
						if( cityId ) setLieuCitySelected(cityId);
						form.setFieldsValue( { LieuCountry: countryId } );
						const lieuVilles = await getPaysVilles( countryId ); 
						if( lieuVilles.length ){
							const localizedCities = await getLocalizedCities( lieuVilles );
							setLieuCities( localizedCities );
							setDisplayLieuCity( 'block' );
							form.setFieldsValue( { LieuCity: cityId } );
						}
						else{
							setDisplayLieuCity( 'none' )
						}
					}
				}
			}
			// Email
			if( fieldName == "Email" ){
				form.setFieldsValue({ Email: user.email });
			}
			// Firstname shortcut
			if( fieldName == "FirstName" ){
				form.setFieldsValue( {FirstNameShortcut: userProfile.prenom} );
			}
			// Name shortcut
			if( fieldName == "Name" ){
				form.setFieldsValue( {NameShortcut: userProfile.nom} );
			}
			// Sex shortcut
			if( fieldName == "Sexes" ){
				const sex = userProfile.sexeId;
				form.setFieldsValue( { SexShortcut: sex ? sex : '' } ); 
				setSexe( sex ? sex : '' );
			}
			// Birth shortcut
			if( fieldName == "BirthShortcut" ){
				const birthDate = userProfile.birthDateFormated ? userProfile.birthDateFormated : null;
				const dateNaissance = birthDate ? await dayjs( birthDate ) : '';
				setDateDeNaissance( dateNaissance );
				setDateDeNaissanceRaw( birthDate )
				form.setFieldsValue( { BirthShortcut: dateNaissance } );
			}
		}
		a()
	}, [ openModal, userProfile, selectedTimeslotOpen, vetos, form ]) 

	// Add this useEffect where you have your other effects
	useEffect(() => {
		const fetchProfessionalIdMapping = async () => {
			// Check whether Effect 2 pre-loaded saved IDs for us to restore.
			// Consume the ref immediately so subsequent user-driven country
			// changes go through the normal reset path.
			const pending = pendingProfessionalIds.current;
			pendingProfessionalIds.current = null;

			if (!vetCountryId) {
				setProfessionalIdMapping(null);
				setIndividualLabel('RPPS');
				setBusinessLabel('SIRET');
				setIndividualRegex(null);
				setBusinessRegex(null);
				setIndividualExample('');
				setBusinessExample('');
				setVerificationUrl(null);
				if (!pending) {
					setIndividualProfessionalId('');
					setBusinessProfessionalId('');
					form.setFieldsValue({ IndividualProfessionalId: '', BusinessProfessionalId: '' });
					form.resetFields(['IndividualProfessionalId', 'BusinessProfessionalId']);
				}
				return;
			}
			
			try {
				const data = await professionalIdByCountry(vetCountryId);
				
				if (data && data.id) {
					setProfessionalIdMapping(data);
					setIndividualLabel(data.individualLabel || 'Professional ID');
					setIndividualRegex(data.individualRegex);
					setIndividualExample(data.individualExample || '');
					setBusinessLabel(data.businessLabel || 'Business ID');
					setBusinessRegex(data.businessRegex);
					setBusinessExample(data.businessExample || '');
					setVerificationUrl(data.verificationUrl);
				} else {
					setProfessionalIdMapping(null);
					setIndividualLabel('Professional ID');
					setBusinessLabel('Business ID');
					setIndividualRegex(null);
					setBusinessRegex(null);
					setIndividualExample('');
					setBusinessExample('');
					setVerificationUrl(null);
				}

				if (pending) {
					// Restore the saved professional IDs that Effect 2 stashed for us.
					const indId  = pending.individualProfessionalId;
					const busId  = pending.businessProfessionalId;
					const mapping = pending.professionalIdMapping;
					setIndividualProfessionalId(indId);
					setBusinessProfessionalId(busId);
					form.setFieldsValue({ IndividualProfessionalId: indId, BusinessProfessionalId: busId });
					if (mapping) {
						setProfessionalIdMapping(mapping);
						setIndividualLabel(mapping.individualLabel || 'Professional ID');
						setBusinessLabel(mapping.businessLabel || 'Business ID');
						setIndividualRegex(mapping.individualRegex);
						setBusinessRegex(mapping.businessRegex);
						setVerificationUrl(mapping.verificationUrl);
					}
				} else {
					// User changed country manually — clear the fields.
					setIndividualProfessionalId('');
					setBusinessProfessionalId('');
					form.setFieldsValue({ IndividualProfessionalId: '', BusinessProfessionalId: '' });
					form.resetFields(['IndividualProfessionalId', 'BusinessProfessionalId']);
				}
			} catch (error) {
				console.error('Error fetching professional ID mapping:', error);
			}
		};
		
		fetchProfessionalIdMapping();
	}, [vetCountryId]);

	// Build especes
	const BuildEspecesOptions = async () => {
		return(
			especes.map( ( espece, index ) => 
				({
					value: espece.id,
					label: espece.nom,
				})
			)
		)
	}

	// handle Close A Day
	const handleCloseADay = () => {
		setOpened( false );
		setCloseThisDay( true );
	}

	// handle Open A Day
	const handleOpenADay = () => {
		setOpened( true );
		setCloseThisDay( false );
	}

	const dynamicStyle = fieldName == "Etablissement_veto" ? { body: { overflowY: 'auto', overflowX: 'hidden', maxHeight: '350px' }} : '';

	return (
		 <> 
			<Modal
				title={<p style={{ textAlign: 'center' }}>{title}</p>}
				closable={{ 'aria-label': 'Custom Close Button' }}
				open={openModal}
				onOk={modalProfileIdentityOk}
				onCancel={() => modalProfileIdentityCancel(false)}
				afterClose={modalProfileIdentityClosed}
				maskClosable={false}
				forceRender={true}
				footer={
					<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						{ selectedLieuId && (
							<Popconfirm
							  open={isLieuPopconfirmOpen}
							  onOpenChange={setIsLieuPopconfirmOpen}
							  getPopupContainer={(triggerNode) => triggerNode.parentElement}
							  title={getAContent('cmp_vetonest.com_kFunk0HFRg')}
							  description={getAContent('cmp_vetonest.com_Rc90Bn37Ts')}
							  onConfirm={handleLieuRemove}
							  onCancel={() => setIsLieuPopconfirmOpen(false)}
							  okText={getAContent('cmp_vetonest.com_P91ms6QaTf')}
							  cancelText={getAContent('cmp_vetonest.com_Wq71bn20Dx')}
							  okButtonProps={{ danger: true, loading: isDeleting }}
							>
							  <Button
								className="btnModalProfileIdentity"
								type="primary"
								danger
								icon={<DeleteOutlined />}
								onClick={() => setIsLieuPopconfirmOpen(true)}
							  >
								{getAContent('cmp_vetonest.com_f92LmQw81P')}
							  </Button>
							</Popconfirm>
						)}
						{selectedAbsenceId && (
							<Popconfirm
								open={isAbsencePopconfirmOpen}
								key="popconfirm"
								title={getAContent('cmp_vetonest.com_T81kP0sQw9')}
								description={getAContent('cmp_vetonest.com_b03Xna81Qs')}
								onConfirm={handleAbsenceRemove}
								okText={getAContent('cmp_vetonest.com_P91ms6QaTf')}
								cancelText={getAContent('cmp_vetonest.com_Wq71bn20Dx')}
								okButtonProps={{ danger: true, loading: 'isDeleting' }}
							>
								<Button
									key="delete"
									className="btnModalProfileIdentity"
									type="primary"
									danger
									icon={<DeleteOutlined />}
								>
									{getAContent('cmp_vetonest.com_f92LmQw81P')}
								</Button>
							</Popconfirm>
						)}
						<Button
							key="submit"
							type="success"
							onClick={handleClickSave}
							className="btnModalProfileIdentity"
							loading={isSaving}
							disabled={isSaving}
						>
							{getAContent('cmp_vetonest.com_Zx71Pa91Qm')}
						</Button>
					</div>
				}
				okText={getAContent('cmp_vetonest.com_Ms51qAa28Y')}
				cancelText={getAContent('cmp_vetonest.com_Jd02LmP91w')}
				styles={dynamicStyle}
			>
				<Form 
					className=""
					form = {form}
					layout="vertical"
					autoComplete="off"
				>
					{ fieldName == "Etablissement_veto" &&
				
						<Checkbox.Group onChange={onVetoListChange} value={checkedVetoList}>
							<Space direction="vertical">
								<div className="d-flex flex-wrap justify-content-center vetos" >
									{
										vetosToInvite.map((v, k) =>
											<div className="card mb-3 mx-2 backgroundYellow listVetoLine" key={'a' + k}>
												<div className="row g-0" key={'a' + k}>
													<div className="align-items-center justify-content-center" key={'3' + k}>
														<img
															src={v.picture ? base_url + 'uploads/files/profile/' + v.picture : photoDefaultSrc}
															className="listVetoImg"
															alt={getAContent('cmp_vetonest.com_Fm92Ax04Lt')}
															key={'2' + k}
														/>
													</div>
													<div className="col-md-8" key={'b' + k}>
														<div className="card-body" key={'74' + k}>
															<h5 className="card-title" key={'r4' + k}>
																<VetName 
																	vet={v}
																	showTitle={true}
																	format="full"
																	//linkToProfile={true}
																	// withTooltip={true}
																/>
															</h5>
															<p className="card-text" key={'c' + k}>
																{v.vetoSpecialiteTab.nom ? v.vetoSpecialiteTab.nom : getAContent('cmp_vetonest.com_Ga83Kd92Lm')}
															</p>
															<p className="card-text" key={'d' + k}>
																<small className="text-muted" key={'e9' + k}>
																	<EnvironmentOutlined style={{ marginRight: 4, fontSize: '12px' }} />
																	{v.villes && v.villes.length > 0 
																		? v.villes[0]  // Show only the first city
																		: getAContent('cmp_vetonest.com_location_not_available') || 'Location not specified'}
																	{v.paysDeLaConsultation && `, ${v.paysDeLaConsultation.nom}`}
																</small>
															</p>
															<p style={{ textAlign: 'center' }} key={'e' + k}>
																<Checkbox value={v.id} style={{ outline: 'none' }} key={'j8' + k} />
															</p>
														</div>
													</div>
												</div>
											</div>
										)
									}
								</div>
							</Space>
						</Checkbox.Group>

					}
					{ fieldName == "Etablissement_lieu" &&
					<>
						<div className="profilIdentityField">
							{/* Honeypot inputs — prevents browser autofill on real fields */}
							<input type="text" name="fakeusernameremembered" style={{ display: 'none' }} autoComplete="username" readOnly />
							<input type="text" name="fakeaddress" style={{ display: 'none' }} autoComplete="street-address" readOnly />
							
							{/* Address Field */}
							<Form.Item
								label={<span><HomeOutlined style={{ marginRight: 6, color: '#888' }} />{ getAContent( 'cmp_vetonest.com_Z19vb62Qpa' ) }</span>}
								name="LieuAddress"
								rules={[
									{
										required: true,
										message: etablissementAddressError || getAContent('cmp_vetonest.com_address_required') || 'Address is required',
									}
								]}
							>
								<Input
									name="AddressInput"
									autoComplete="new-password"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={getAContent('cmp_vetonest.com_Kp81Lt93Ws')}
									type="text"
									value={etablissementAddress}
									onChange={(e) => handleChangeEtablissementAddress(e)}
								/>
							</Form.Item>
							
							{/* Parking Field */}
							<Form.Item 
								name="Parking" 
								label={<span><CarOutlined style={{ marginRight: 6, color: '#888' }} />{ getAContent( 'cmp_vetonest.com_Qs51Mb03Ye' ) }</span>}
							>
								<Input
									name="parkingInput"
									autoComplete="new-password"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={getAContent('cmp_vetonest.com_Rf20Kc94Ux')}
									type="text"
									value={etablissementParking}
									onChange={(e) => handleChangeEtablissementParking(e)}
								/>
							</Form.Item>
							
							{/* Transport Fields */}
							{transports.map((field) => (
								<Form.Item
									key={field.id}
									name={field.fieldName}
									label={<span><CompassOutlined style={{ marginRight: 6, color: '#888' }} />{ getAContent( field.fieldLabelTagRef ) }</span>}
									validateStatus={errors[field.fieldName] ? "error" : ""}
									help={errors[field.fieldName] || ""}
								>
									{renderField(field)}
								</Form.Item>
							))}
							
							{/* Info Field */}
							<Form.Item
								name="Info"
								label={<span><InfoCircleOutlined style={{ marginRight: 6, color: '#888' }} />{ getAContent( 'cmp_vetonest.com_Mu63Bd27Nc' ) }</span>}
							>
								<TextArea
									rows={3}
									name="infoInput"
									autoComplete="new-password"
									className="backgroundYellow rounded10 width100per100 borderNone"
									placeholder={ getAContent('cmp_vetonest.com_Pa37Lv82Hk') }
									type="text"
									value={etablissementInfo}
									onChange={(e) => handleChangeEtablissementInfo(e)}
								/>
							</Form.Item>
							
							{/* Country and City Row - FIXED */}
							<div className="row">
								<div className="col-sm-12 col-md-6">
									<Form.Item
										name="LieuCountry"
										label={getAContent('cmp_vetonest.com_n17Fd02Cka')}
										rules={[{
											required: true,
											message: getAContent('cmp_vetonest.com_select_country_error') || 'Veuillez sélectionner un pays',
										}]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											style={{ width: '100%' }}
											placeholder={getAContent('cmp_vetonest.com_k3a92hFsP1') || 'Select a country'}
											value={lieuCountrySelected || undefined}
											onChange={(countryId) => {
												setLieuCountrySelected(countryId);
												setLieuCitySelected('');
												setLieuCityError('');
												setLieuCountryError('');
												form.setFieldsValue({ LieuCountry: countryId, LieuCity: undefined });
												handleChangeLieuCountrySelected(countryId);
											}}
											showSearch
											optionFilterProp="label"
											filterSort={(a, b) =>
												(a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
											}
											options={BuildLieuCountriesOptions()}
											notFoundContent={lieuCountryDefault}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
								<div className="col-sm-12 col-md-6">
									<Form.Item
										name="LieuCity"
										label={getAContent('cmp_vetonest.com_L20sx18Qmv')}
										rules={[{
											required: true,
											message: getAContent('cmp_vetonest.com_select_city_error') || 'Veuillez sélectionner une ville',
										}]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											style={{ width: '100%', display: displayLieuCity }}
											placeholder={getAContent('cmp_vetonest.com_Pq8x2VmAz9') || 'Select a city'}
											value={lieuCitySelected || undefined}
											onChange={(cityId) => {
												setLieuCitySelected(cityId);
												setLieuCityError('');
												form.setFieldsValue({ LieuCity: cityId });
												handleChangeLieuCitySelected(cityId);
											}}
											showSearch
											optionFilterProp="label"
											filterSort={(a, b) =>
												(a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
											}
											options={lieuCities.map(city => ({ value: city.id, label: city.nom }))}
											notFoundContent={lieuCities.length === 0 
												? (getAContent('cmp_vetonest.com_select_country_first') || 'Please select a country first')
												: (getAContent('cmp_vetonest.com_no_cities_available') || 'No cities available')}
											disabled={!lieuCountrySelected}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
							</div>
						</div>
					</>
				}
					{ fieldName == "Etablissement" &&
						<>
							<div className="profilIdentityField">
								<Form.Item
									name="EtablissementName"
									label={ getAContent( 'cmp_vetonest.com_Pk38Vs90Lm' ) }
									rules={[
										{
											message: etablissementNameError,
											validator: (value) => {
												if (etablissementNameError) return Promise.reject(etablissementNameError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="etablissementNameInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={ getAContent( 'cmp_vetonest.com_Qs71Na43Hp' ) }
										type="text"
										value={etablissementName}
										onChange={(e) => handleChangeEtablissementName(e)}
									/>
								</Form.Item>
								<Form.Item
									name="EtablissementPresentation"
									label={ getAContent( 'cmp_vetonest.com_Te94Bm20Cx' ) }
									rules={[
										{
											message: etablissementPresentationError,
											validator: (value) => {
												if (etablissementPresentationError) return Promise.reject(etablissementPresentationError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="etablissementPresentationInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Jr60Qm28Vf')}
										value={etablissementPresentation}
										onChange={(e) => handleChangeEtablissementPresentation(e)}
									/>
								</Form.Item>
								<Form.Item
									name="EtablissementType"
									label={ getAContent( 'cmp_vetonest.com_Az14Gr72Mn' ) }
									rules={[
										{
											message: etablissementTypeError,
											validator: (value) => {
												if (etablissementTypeError) return Promise.reject(etablissementTypeError);
												return Promise.resolve();
											}
										}
									]}
								> 
									<ConfigProvider>
										<Select
											mode="multiple"
											placeholder={getAContent('cmp_vetonest.com_Mv72Qd98Pl')}
											variant="borderless"
											className="customAntselect custom-select-rounded backgroundYellow height40 birthdateField borderNone"
											value={selectedEtablissementTypes}
											onChange={(e) => handleChangeEtablissementType(e)}
											style={{ width: '100%', marginTop: '1%', }}
											suffixIcon={null}
										>
											{allEtablissementTypes.map((v, k) => (
												<Option key={v.id} value={v.id}>
													<Checkbox checked={selectedEtablissementTypes.includes(v.id)}>
														{v.nom}
													</Checkbox>
												</Option>
											))}
										</Select>
									</ConfigProvider>
								</Form.Item>
								{/* Add Photo Upload Field */}
								<Form.Item
									name="EtablissementPhoto"
									label={ getAContent('cmp_vetonest.com_clinic_photo') || 'Photo de la clinique' }
									rules={[{
										message: etablissementPhotoError,
										validator: (value) => {
											if (etablissementPhotoError) return Promise.reject(etablissementPhotoError);
											return Promise.resolve();
										}
									}]}
								>
									<div>
										<div className="row marginTop10px">
											&nbsp;&nbsp;
											<Dragger {...etablissementPhotoProps}>
												<i className="fa fa-camera" aria-hidden="true"></i> 
												{getAContent('cmp_vetonest.com_upload_clinic_photo') || 'Cliquez ou glissez une photo de votre clinique'}
											</Dragger>
										</div>
										{etablissementPhoto && (
											<div className="align-items-center marginTop10px">
												<img 
													id="etablissementPhotoId"
													className="marginTop10px profilePhotoContainer"
													src={etablissementPhoto}
													style={{ width: '95%' }}
													alt="Clinic preview"
												/>
											</div>
										)}
									</div>
								</Form.Item>
							</div>
						</>
					}
					{ (fieldName == "Opened" || fieldName == "Closed") &&
						<>
							<div className="row justify-content-center">
								<i className="fa fa-calendar"></i>&nbsp;
								{day} : {opened ? getAContent('cmp_vetonest.com_Zf10Kr82Pq') : getAContent('cmp_vetonest.com_Js19Ve63Hu')}
							</div>
							<p>&nbsp;</p>
							
							{/* Timezone Display */}
							<div className="row justify-content-center" style={{ marginBottom: '12px' }}>
								<span style={{ 
									fontSize: '13px', 
									color: '#666',
									background: '#f5f5f5',
									padding: '4px 12px',
									borderRadius: '16px',
									display: 'inline-flex',
									alignItems: 'center',
									gap: '6px'
								}}>
									<GlobalOutlined style={{ fontSize: '14px', color: '#FFDE59' }} />
									{getAContent('cmp_vetonest.com_timezone_label') || 'Timezone'}: 
									<strong>{userProfile?.timezone || 'Europe/Paris'}</strong>
								</span>
							</div>
							
							{opened &&
								<div className="row">
									<div className="col-6">
										<Form.Item
											name="OpenedTime"
											rules={[
												{
													message: openedError,
													validator: (value) => {
														if (openedError) return Promise.reject(openedError);
														return Promise.resolve();
													}
												}
											]}
											initialValue={startTime}
										>
											<TimePicker
												value={startTime}
												onChange={handleStartTimeChange}
												placeholder={getAContent('cmp_vetonest.com_Mq09Br27Xy')}
												format="HH:mm"
												className="backgroundYellow rounded10 width100per100 borderNone height40"
											/>
										</Form.Item>
									</div>
									<div className="col-6">
										<TimePicker
											value={endTime}
											onChange={handleEndTimeChange}
											placeholder={getAContent('cmp_vetonest.com_Ha73Ct81Zv')}
											format="HH:mm"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
										/>
									</div>
								</div>
							}
							
							{/* Info text about timezone */}
							{opened && (
								<div className="row justify-content-center" style={{ marginTop: '8px' }}>
									<small style={{ color: '#999', fontSize: '11px' }}>
										<GlobalOutlined style={{ marginRight: '4px', fontSize: '11px' }} />
										{getAContent('cmp_vetonest.com_timezone_info') || 'Times are displayed in the veterinarian\'s timezone'} 
										(<strong>{userProfile?.timezone || 'Europe/Paris'}</strong>)
									</small>
								</div>
							)}
							
							<div className="row justify-content-center marginTop10px">
								{opened ?
									<Popconfirm
										key="popconfirm01"
										title={getAContent('cmp_vetonest.com_Nx55Qa02Df')}
										description={getAContent('cmp_vetonest.com_Vb71Uc92Ht')}
										onConfirm={handleCloseADay}
										okText={getAContent('cmp_vetonest.com_P91ms6QaTf')}
										cancelText={getAContent('cmp_vetonest.com_Wq71bn20Dx')}
										okButtonProps={{ danger: true }}
									>
										<a key="delete01">
											<LockOutlined />&nbsp;
											<span>{getAContent('cmp_vetonest.com_Lo28Gs10Rw')}</span>
										</a>
									</Popconfirm>
								:
									<Popconfirm
										key="popconfirm02"
										title={getAContent('cmp_vetonest.com_Bv61Rx34Qp')}
										description={getAContent('cmp_vetonest.com_Ta77Fq90Wm')}
										onConfirm={handleOpenADay}
										okText={getAContent('cmp_vetonest.com_P91ms6QaTf')}
										cancelText={getAContent('cmp_vetonest.com_Wq71bn20Dx')}
										okButtonProps={{ success: true }}
									>
										<a key="delete02">
											<UnlockOutlined />&nbsp;
											<span>{getAContent('cmp_vetonest.com_Sp56Jd44Um')}</span>
										</a>
									</Popconfirm>
								}
							</div>
						</>
					}
					{ fieldName == "Absence" &&
						<>
							<div>	
								<Form.Item 
									name="BirthdateUser"
									label={getAContent('cmp_vetonest.com_Mr52Qd84Zn')}
									rules={[{
										required: true,
										message: dateDeNaissanceError,
										validator: (value) => {
											if (dateDeNaissanceError) return Promise.reject(dateDeNaissanceError);
											return Promise.resolve();
										}
									}]}
								>
									<ConfigProvider locale={getDatePickerlocale()}>
										<DatePicker
											onChange={handleBirthDateChange}
											className="backgroundYellow birthdateField width100per100 height40"
											format={getDateFormatLocale()}
											value={dateDeNaissance}
										/>
									</ConfigProvider>
								</Form.Item>
							</div>
							<div className="profilIdentityField">
								<Form.Item
									label={getAContent('cmp_vetonest.com_Pa83Lk19Qs')}
									name="AbsenceName"
									rules={[
										{
											required: true,
											message: absenceNameError,
											validator: (value) => {
												if (absenceNameError) return Promise.reject(absenceNameError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="absenceNameInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={ getAContent( 'cmp_vetonest.com_Fq72Lm90Sd' ) }
										type="text"
										value={absenceName}
										onChange={(e) => handleChangeAbsenceName(e)}
									/>
								</Form.Item>
							</div>
							<div>
								<Form.Item
									label={getAContent('cmp_vetonest.com_Vb71Kx33Hp')}
									name="AbsenceDescription"
									rules={[
										{
											message: absenceDescriptionError,
											validator: (value) => {
												if (absenceDescriptionError) return Promise.reject(absenceDescriptionError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="absenceDescriptionInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Ew62Jk55Ns')}
										type="text"
										value={absenceDescription}
										onChange={(e) => handleChangeAbsenceDescription(e)}
									/>
								</Form.Item>
							</div>
						</>
					}
					{ fieldName == "Country" &&
						<>
							<p>&nbsp;</p>
							<div className="checkbox-grid">
								<Checkbox.Group
									options={countriesOptions}
									value={countriesSelected}
									onChange={onCountryOptionChange}
								/>
							</div>
							<p>&nbsp;</p>
						</>
					}
					{fieldName === "Language" && (
						<>
							<p>&nbsp;</p>
							<div className="checkbox-grid">
								<Checkbox.Group
									options={languageOptions}
									value={languageSelected}
									onChange={onLanguageOptionChange}
								/>
							</div>
							<p>&nbsp;</p>
						</>
					)}
					{ fieldName === "Profile" && (
						<div className="container">
							<div className="row">
								<div className="col-6">
									<Form.Item
										label={signUp_namePlaceholder}
										name="Name"
										required={true}
										rules={[
											{
												message: nameError,
												validator: (value) => {
													if (nameError) return Promise.reject(nameError);
													return Promise.resolve();
												},
											},
										]}
									>
										<Input
											name="nameInput"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent( 'cmp_vetonest.com_Rf29Lm8Qcs' )}
											prefix={<UserOutlined style={{ color: '#888' }} />}
											type="text"
											value={name}
											onChange={(e) => handleChangeName(e)}
										/>
									</Form.Item>
								</div>
								<div className="col-6">
									<Form.Item
										label={signUp_firstNamePlaceholder}
										name="FirstName"
										required={true}
										rules={[
											{
												message: firstNameError,
												validator: (value) => {
													if (firstNameError) return Promise.reject(firstNameError);
													return Promise.resolve();
												},
											},
										]}
										initialValue={firstName}
									>
										<Input
											name="firstNameInput"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent( 'cmp_vetonest.com_Kt73Nd1Wqp' )}
											prefix={<UserOutlined style={{ color: '#888' }} />}
											type="text"
											value={firstName}
											onChange={(e) => handleChangeFirstName(e)}
										/>
									</Form.Item>
								</div>
							</div>
							<Form.Item
								label={getAContent('cmp_vetonest.com_ZEuz13yjyi')}
								name="Sexe"
								rules={[
									{
										message: sexeError,
										validator: (value) => {
											if (sexeError) return Promise.reject(sexeError);
											return Promise.resolve();
										},
									},
								]}
							>
								<Radio.Group
									style={{ width: "100%" }}
									onChange={(e) => handleChangeProfileSex(e)}
								>
									<div className="row">
										<div
											className="backgroundYellow rounded10 height40"
											style={{ marginLeft: "3%", width: "44%", paddingTop: "2%", paddingLeft: "4%" }}
										>
											<Radio value={1} className="checkbox-like-radio">
												<ManOutlined style={{ marginRight: 6, color: '#1677ff' }} />{getAContent('cmp_vetonest.com_A91fd73KsP')}
											</Radio>
										</div>
										<div
											className="backgroundYellow rounded10 height40"
											style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
										>
											<Radio value={2} className="checkbox-like-radio">
												<WomanOutlined style={{ marginRight: 6, color: '#eb2f96' }} />{getAContent('cmp_vetonest.com_w31LdP9aQs')}
											</Radio>
										</div>
									</div>
								</Radio.Group>
							</Form.Item>
							<div>
								<Form.Item 
									name="BirthdateUser"
									label={<span><CalendarOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_f82Ns91Qaz')}</span>}
									rules={[{
										message: dateDeNaissanceError,
										validator: (value) => {
											if (dateDeNaissanceError) return Promise.reject(dateDeNaissanceError);
											return Promise.resolve();
										}
									}]}
								>
									<ConfigProvider locale={getDatePickerlocale()}>
										<DatePicker
											onChange={handleBirthDateChange}
											className="backgroundYellow birthdateField width100per100 height40"
											format={getDateFormatLocale()}
											value={dateDeNaissance}
											disabledDate={(current) => current && current.isAfter( dayjs().subtract(10, 'year') )}
											maxDate={dayjs().subtract(10, 'year')}
										/>
									</ConfigProvider>
								</Form.Item>
							</div>
							<div style={{ display: 'none' }}>
								<Form.Item
									label={getAContent('cmp_vetonest.com_Pq71Lm92Xe')}
									name="Languages"
									rules={[{
										message: languageError,
										validator: (value) => {
											if (languageError) return Promise.reject(languageError);
											return Promise.resolve();
										}
									}]}
								>
									<ConfigProvider theme={{ token: { colorPrimary: "#000", border: "none" } }}>
										<Select
											mode="multiple"
											placeholder={getAContent('cmp_vetonest.com_D82ka01LsM')}
											variant="borderless"
											className="customAntselect height40 width100per100 selectLanguage rounded10"
											value={selectedLanguages}
											onChange={handleChangeLanguage}
											style={{ width: "100%" }}
											suffixIcon={null}
										>
											{languages.map((v) => (
												<Option key={v.id} value={v.id}>
													<Checkbox checked={selectedLanguages.includes(v.id)}>
														{eval(v.tagClass)}
													</Checkbox>
												</Option>
											))}
										</Select>
									</ConfigProvider>
								</Form.Item>
							</div>
							{/* ===== LOCATION SECTION ===== */}
							<div className="row" style={{ marginTop: '20px' }}>
								<div className="col-12">
									<label className="ant-form-item-label">
										<EnvironmentOutlined style={{ marginRight: 6, color: '#888' }} />
										{getAContent('cmp_vetonest.com_consultation_location') || 'Lieu de consultation'}
									</label>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<Form.Item
										name="UserCountry"
										label={<span><GlobalOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_n17Fd02Cka') || 'Pays'}</span>}
										rules={[
											{
												required: true,
												message: getAContent('cmp_vetonest.com_select_country_error') || 'Please select a country',
											}
										]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											placeholder="Sélectionner un pays"
											value={userCountryId}
											onChange={handleUserCountryChange}
											showSearch
											optionFilterProp="label"
											options={BuildLieuCountriesOptions()}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
								<div className="col-12 col-md-6">
									<Form.Item 
										name="UserCity"
										label={<span><EnvironmentOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_L20sx18Qmv') || 'Ville'}</span>}
										rules={[{
											required: true,
											message: getAContent('cmp_vetonest.com_select_city_error') || 'Please select a city',
										}]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											placeholder="Sélectionner une ville"
											value={userCityId}
											onChange={handleUserCityChange}
											showSearch
											optionFilterProp="label"
											options={userCityOptions.map(city => ({ value: city.id, label: city.nom }))}
											notFoundContent="Aucune ville disponible"
											style={{ display: displayUserCity }}
											disabled={!userCountryId}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<Form.Item
										name="UserAddress"
										label={<span><HomeOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_Z19vb62Qpa') || 'Adresse'}</span>}
										rules={[{ message: userAddressError }]}
									>
										<Input
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent('cmp_vetonest.com_address_placeholder') || 'Rue, bâtiment, etc.'}
											// REMOVED: prefix={<HomeOutlined style={{ color: '#888' }} />}
											value={userAddress}
											onChange={handleUserAddressChange}
											autoComplete="off"
										/>
									</Form.Item>
								</div>
							</div>
							{/* ===== END OF LOCATION SECTION ===== */}
						</div>
					)}
					{ fieldName == "ProfileVeto" &&
					<div className="container">
						
						{/* ==================== SECTION 1: CONTACT INFORMATION ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<PhoneOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_contact_information') || 'Coordonnées'}
								</h3>
							</div>
							
							{/* Phone Number */}
							<Form.Item
								label={getAContent('cmp_vetonest.com_Zp83Na41Lt')}
								className="phoneFormItem"
								name="PhoneNumber"
								style={{ marginBottom: '16px' }}
								rules={[
									{
										required: true, 
										message: phoneNumberError,
										validator: (value) => {
											if (phoneNumberError) return Promise.reject(phoneNumberError);
											return Promise.resolve();
										}
									}
								]}
								initialValue={phoneNumber}
							>
								<div className="phoneRow">
									<Select
										variant="borderless"
										className="phoneFlagSelect"
										value={selectedFlag}
										onChange={handleChangeFlag}
										getPopupContainer={(n) => n.parentElement}
									>
										{countriesAllowed.map((v) => (
											<Option key={v.iso} value={v.iso}>
												<img src={`/img/flags/${v.iso}.svg`} className="phoneFlagImg" />
											</Option>
										))}
									</Select>
									<div className="phoneCode">{selectedCountryCode}</div>
									<Input
										type="text"
										className="phoneInput backgroundYellow rounded10 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Qp91Ts3Fka')}
										value={phoneNumber}
										onChange={handleChangePhoneNumber}
									/>
								</div>
							</Form.Item>
						</div>

						{/* Separator */}
						<Divider style={{ margin: '20px 0' }} />

						{/* ==================== SECTION 2: IDENTITY & PROFESSIONAL TITLE ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<UserOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_identity_title') || 'Identité et titre professionnel'}
								</h3>
							</div>

							{/* Name and First Name - Two columns */}
							<div className="row gy-2">
								<div className="col-6">
									<Form.Item
										label={signUp_namePlaceholder}
										name="VetoName"
										rules={[
											{
												required: true,
												message: vetoNameError,
												validator: (value) => {
													if (vetoNameError) return Promise.reject(vetoNameError);
													return Promise.resolve();
												}
											}
										]}
										initialValue={name}
									>
										<Input
											name="vetoNameInput"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent('cmp_vetonest.com_Lk58Pw7Qms')}
											type="text"
											value={vetoName}
											onChange={(e) => handleChangeVetoName(e)}
										/>
									</Form.Item>
								</div>
								<div className="col-6">
									<Form.Item
										label={signUp_firstNamePlaceholder}
										name="VetoFirstName"
										rules={[
											{
												required: true,
												message: vetoFirstNameError,
												validator: (value) => {
													if (vetoFirstNameError) return Promise.reject(vetoFirstNameError);
													return Promise.resolve();
												}
											}
										]}
										initialValue={firstName}
									>
										<Input
											name="vetoFirstNameInput"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent('cmp_vetonest.com_Bt63Xa1Npe')}
											type="text"
											value={vetoFirstName}
											onChange={(e) => handleChangeVetoFirstName(e)}
										/>
									</Form.Item>
								</div>
							</div>

							{/* Vet Title */}
							<Form.Item
								label={getAContent('cmp_vetonest.com_professional_title') || 'Titre professionnel'}
								name="VetTitleId"
								style={{ marginBottom: 16 }}
							>
								<Select
									variant="borderless"
									className="backgroundYellow rounded10 height40 width100per100 borderNone"
									placeholder={getAContent('cmp_vetonest.com_select_title') || 'Sélectionnez votre titre professionnel'}
									allowClear
									value={selectedVetTitleId}
									onChange={handleVetTitleChange}
									showSearch
									optionFilterProp="children"
									filterOption={(input, option) =>
										(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
									}
									dropdownStyle={{ maxHeight: 300 }}
								>
									{vetTitles.map((title) => {
										const translatedCode = getAContent(title.tagRefCode) || title.code;
										const translatedLabel = getAContent(title.tagRefLabel) || '';
										const translatedDescription = title.tagRefDescription 
											? getAContent(title.tagRefDescription) 
											: '';
										
										let optionLabel = `${translatedCode} - ${translatedLabel}`;
										
										return (
											<Option 
												key={title.id} 
												value={title.id}
												label={optionLabel}
											>
												<div style={{ lineHeight: '1.4', padding: '4px 0' }}>
													<strong>{translatedCode}</strong> - {translatedLabel}
													{translatedDescription && (
														<div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
															{translatedDescription}
														</div>
													)}
												</div>
											</Option>
										);
									})}
								</Select>
							</Form.Item>
						</div>

						{/* Separator */}
						<Divider style={{ margin: '20px 0' }} />

						{/* ==================== SECTION 3: SPECIALITY & PRACTICE TYPE ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<MedicineBoxOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_professional_info') || 'Informations professionnelles'}
								</h3>
							</div>

							{/* Speciality */}
							<Form.Item
								label={getAContent('cmp_vetonest.com_Sp44Ma27Kw')}
								name="VetoSpecialite"
								rules={[
									{
										required: true,
										message: vetoSpecialiteError,
										validator: () => {
											if (vetoSpecialiteError) return Promise.reject(vetoSpecialiteError);
											return Promise.resolve();
										}
									}
								]}
								className="specialityFormItem"
							>
								<div className="specialityRow">
									<Select
										mode="multiple"
										placeholder={getAContent('cmp_vetonest.com_Mv72Qd98Pl')}
										variant="borderless"
										className=""
										value={vetoSelectedSpecialities}
										onChange={(e) => handleChangeVetoSpecialities(e)}
										style={{ width: '100%' }}
										suffixIcon={null}
									>
										{allSpecialities.map((v, k) => (
											<Option key={v.id} value={Number(v.id)}>
												<Checkbox checked={vetoSelectedSpecialities.includes(Number(v.id))}>
													{v.name}
												</Checkbox>
											</Option>
										))}
									</Select>
								</div>
							</Form.Item>

							{/* Practice Type (Home / Clinic / Online only) */}
							<Form.Item
								label={getAContent('cmp_vetonest.com_Hr74Xk63Be')}
								name="VetoType"
								rules={[
									{
										required: true,
										message: vetoTypeError,
										validator: () => {
											if (vetoTypeError) return Promise.reject(vetoTypeError);
											return Promise.resolve();
										},
									},
								]}
							>
								<Radio.Group
									style={{ width: "100%" }}
									value={vetoModeId}
									onChange={(e) => handleChangeVetoType(e)}
								>
									<div className="vetoTypeRow">
										{allVetoModes.map( mode => (
											<div className="vetoTypeOption" key={mode.id}>
												<Radio value={mode.id} className="checkbox-like-radio">
													{getAContent(mode.tagRef) || mode.name}
												</Radio>
											</div>
										))}
									</div>
								</Radio.Group>
							</Form.Item>

							{/* Video consultation allowed / disallowed
							    Hidden for online-only vets: video is mandatory so there's
							    nothing to choose — we show a locked notice instead. */}
							{allVetoModes.find( m => m.id === vetoModeId )?.name === 'online' ? (
								<Form.Item
									label={getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Consultation vidéo'}
								>
									<div style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										padding: '8px 12px',
										background: '#f6ffed',
										border: '1px solid #b7eb8f',
										borderRadius: '8px',
										fontSize: '13px',
										color: '#389e0d',
									}}>
										<span>✅</span>
										<span>
											{getAContent('cmp_vetonest.com_VideoRequiredForOnline_Label') || 'Video consultation is required for online-only vets'}
										</span>
									</div>
								</Form.Item>
							) : (
								<Form.Item
									label={getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Consultation vidéo'}
									name="VideoAllowed"
									value={videoAllowed}
									rules={[
										{
											required: true,
											message: videoAllowedError,
											validator: (value) => {
												if (videoAllowedError) return Promise.reject(videoAllowedError);
												return Promise.resolve();
											},
										},
									]}
								>
									<Radio.Group
										style={{ width: "100%" }}
										onChange={(e) => handleChangeVideoAllowed(e)}
									>
										<div className="vetoTypeRow">
											<div className="vetoTypeOption">
												<Radio value={1} className="checkbox-like-radio">
													{getAContent('cmp_vetonest.com_video_allowed_yes') || 'Autorisée'}
												</Radio>
											</div>
											<div className="vetoTypeOption">
												<Radio value={0} className="checkbox-like-radio">
													{getAContent('cmp_vetonest.com_video_allowed_no') || 'Non autorisée'}
												</Radio>
											</div>
										</div>
									</Radio.Group>
								</Form.Item>
							)}
						</div>

						{/* Separator */}
						<Divider style={{ margin: '20px 0' }} />

						{/* ==================== SECTION 4: CONSULTATION FEES ==================== */}
						{allVetoModes.find(m => m.id === vetoModeId)?.name !== 'online' && (
							<>
								<div className="form-section">
									<div className="section-title" style={{ 
										marginBottom: '16px', 
										paddingBottom: '8px', 
										borderBottom: '2px solid #FFDE59',
										display: 'flex',
										alignItems: 'center',
										gap: '8px'
									}}>
										<EuroCircleOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
										<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
											{getAContent('cmp_vetonest.com_consultation_fees') || 'Tarifs des consultations'}
										</h3>
									</div>

									<div className="row" style={{ height: '84px' }}>
										<div className="col-6">
											<Form.Item label={getAContent('cmp_vetonest.com_Qr84Lm20Ps')}>
												<Space.Compact style={{ display: 'flex', alignItems: 'center' }}>
													<Form.Item
														name="TarifMin"
														noStyle
														rules={[
															{
																message: tarifMinError,
																validator: () => {
																	if (tarifMinError) return Promise.reject(tarifMinError);
																	return Promise.resolve();
																}
															}
														]}
													>
														<Input
															type="number"
															min={1}
															placeholder={getAContent('cmp_vetonest.com_Mn82Qa17Xf')}
															className="backgroundYellow height40 borderNone rounded10"
															onChange={handleChangeTarifMin}
														/>
													</Form.Item>
													<span style={{ margin: '0 6px', color: '#666', fontWeight: 500, userSelect: 'none', lineHeight: '40px' }}>–</span>
													<Form.Item
														name="TarifMax"
														noStyle
														dependencies={['TarifMin']}
														rules={[
															{
																message: tarifMaxError,
																validator: () => {
																	if (tarifMaxError) return Promise.reject(tarifMaxError);
																	return Promise.resolve();
																}
															}
														]}
													>
														<Input
															type="number"
															min={1}
															placeholder={getAContent('cmp_vetonest.com_Mx39Lp84Rt')}
															className="backgroundYellow height40 borderNone rounded10"
															onChange={handleChangeTarifMax}
														/>
													</Form.Item>
													<div style={{ height: '40px', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>€</div>
												</Space.Compact>
											</Form.Item>
										</div>
										{/* Video consultation fee - only shown if video is allowed and not online-only */}
										{videoAllowed === 1 && allVetoModes.find(m => m.id === vetoModeId)?.name !== 'online' && (
											<div className="col-6">
												<Form.Item label={getAContent('cmp_vetonest.com_Mn92Ks41Wa')} className="tarifFormItem">
													<Space.Compact style={{ display: 'flex', alignItems: 'center' }}>
														<Form.Item
															name="TarifVideoMin"
															noStyle
															rules={[
																{
																	message: tarifVideoMinError,
																	validator: () => {
																		if (tarifVideoMinError) return Promise.reject(tarifVideoMinError);
																		return Promise.resolve();
																	}
																}
															]}
														>
															<Input
																type="number"
																min={1}
																placeholder={getAContent('cmp_vetonest.com_Mn82Qa17Xf')}
																className="backgroundYellow height40 borderNone rounded10"
																onChange={handleChangeTarifVideoMin}
															/>
														</Form.Item>
														<span style={{ margin: '0 6px', color: '#666', fontWeight: 500, userSelect: 'none', lineHeight: '40px' }}>–</span>
														<Form.Item
															name="TarifVideoMax"
															noStyle
															dependencies={['TarifVideoMin']}
															rules={[
																{
																	message: tarifVideoMaxError,
																	validator: () => {
																		if (tarifVideoMaxError) return Promise.reject(tarifVideoMaxError);
																		return Promise.resolve();
																	}
																}
															]}
														>
															<Input
																type="number"
																min={1}
																placeholder={getAContent('cmp_vetonest.com_Mx39Lp84Rt')}
																className="backgroundYellow height40 borderNone rounded10"
																onChange={handleChangeTarifVideoMax}
															/>
														</Form.Item>
														<div style={{ height: '40px', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>€</div>
													</Space.Compact>
												</Form.Item>
											</div>
										)}
									</div>
								</div>

							</>
						)}


						{/* ==================== SECTION 5: PRACTICE LOCATION ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<EnvironmentOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_practice_location') || 'Lieu d\'exercice'}
								</h3>
							</div>

							<div className="row">
								<div className="col-12 col-md-6">
									<Form.Item
										name="VetCountry"
										label={<span><GlobalOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_n17Fd02Cka') || 'Pays'}</span>}
										rules={[
											{
												required: true,
												message: getAContent('cmp_vetonest.com_select_country_error') || 'Please select a country',
											}
										]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											placeholder="Sélectionner un pays"
											value={vetCountryId}
											onChange={handleVetCountryChange}
											showSearch
											optionFilterProp="label"
											options={BuildLieuCountriesOptions()}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
								<div className="col-12 col-md-6">
									<Form.Item
										name="VetCity"
										label={<span><EnvironmentOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_L20sx18Qmv') || 'Ville'}</span>}
										rules={[{
											required: true,
											message: getAContent('cmp_vetonest.com_select_city_error') || 'Please select a city',
										}]}
									>
										<Select
											variant="borderless"
											className="custom-select-rounded backgroundYellow height40 borderNone"
											placeholder="Sélectionner une ville"
											value={vetCityId}
											onChange={handleVetCityChange}
											showSearch
											optionFilterProp="label"
											options={vetCityOptions.map(city => ({ value: city.id, label: city.nom }))}
											notFoundContent="Aucune ville disponible"
											style={{ display: displayVetCity }}
											disabled={!vetCountryId}
											autoComplete="new-password"
										/>
									</Form.Item>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<Form.Item
										name="VetAddress"
										label={<span><HomeOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_Z19vb62Qpa') || 'Adresse'}</span>}
										rules={[{ message: vetAddressError }]}
									>
										<Input
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent('cmp_vetonest.com_address_placeholder') || 'Rue, bâtiment, etc.'}
											value={vetAddress}
											onChange={handleVetAddressChange}
											autoComplete="off"
										/>
									</Form.Item>
								</div>
							</div>
						</div>

						{/* Separator */}
						<Divider style={{ margin: '20px 0' }} />

						{/* ==================== SECTION 6: PROFESSIONAL IDENTIFICATION ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<SafetyOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_professional_identification') || 'Identification professionnelle'}
								</h3>
							</div>

							{/* Professional IDs - Two fields on the same row */}
							<div className="row">
								<div className="col-12 col-md-6">
									<Form.Item
										label={individualLabel}
										name="IndividualProfessionalId"
										rules={[
											{
												required: false,
												validator: async (_, value) => {
													if (value && individualRegex) {
														const regex = new RegExp(individualRegex);
														if (!regex.test(value)) {
															return Promise.reject(
																getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: individualLabel })
															);
														}
													}
													return Promise.resolve();
												}
											}
										]}
									>
										<div>
											<Input
												placeholder={getTranslatedMessage('cmp_vetonest.com_enter_professional_id', { label: individualLabel })}
												className="backgroundYellow rounded10 height40 width100per100 borderNone"
												value={individualProfessionalId}
												onChange={handleChangeIndividualProfessionalId}
											/>
											{individualExample && (
												<div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
													{getTranslatedMessage('cmp_vetonest.com_example') || 'Exemple'}: {individualExample}
												</div>
											)}
										</div>
									</Form.Item>
								</div>
								<div className="col-12 col-md-6">
									<Form.Item
										label={businessLabel}
										name="BusinessProfessionalId"
										rules={[
											{
												required: false,
												validator: async (_, value) => {
													if (value && businessRegex) {
														const regex = new RegExp(businessRegex);
														if (!regex.test(value)) {
															return Promise.reject(
																getTranslatedMessage('cmp_vetonest.com_professional_id_invalid_format', { label: businessLabel })
															);
														}
													}
													return Promise.resolve();
												}
											}
										]}
									>
										<div>
											<Input
												placeholder={getTranslatedMessage('cmp_vetonest.com_enter_professional_id', { label: businessLabel })}
												className="backgroundYellow rounded10 height40 width100per100 borderNone"
												value={businessProfessionalId}
												onChange={handleChangeBusinessProfessionalId}
											/>
											{businessExample && (
												<div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
													{getTranslatedMessage('cmp_vetonest.com_example') || 'Exemple'}: {businessExample}
												</div>
											)}
										</div>
									</Form.Item>
								</div>
							</div>
						</div>

						{/* Separator */}
						<Divider style={{ margin: '20px 0' }} />

						{/* ==================== SECTION 7: BIOGRAPHY ==================== */}
						<div className="form-section">
							<div className="section-title" style={{ 
								marginBottom: '16px', 
								paddingBottom: '8px', 
								borderBottom: '2px solid #FFDE59',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}>
								<EditOutlined style={{ color: '#6B8E23', fontSize: '18px' }} />
								<h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
									{getAContent('cmp_vetonest.com_Mn2Vr7sLpQ') || 'Biographie'}
								</h3>
							</div>

							<Form.Item
								name="Biography"
								rules={[
									{
										message: biographyError,
										validator: (_, value) => {
											if (biographyError) return Promise.reject(biographyError);
											return Promise.resolve();
										}
									}
								]}
								validateTrigger="onChange"
							>
								<TextArea
									rows={4}
									name="biographyInput"
									className="backgroundYellow rounded10 width100per100 borderNone"
									placeholder={getAContent('cmp_vetonest.com_biography_placeholder_hint') || 'Décrivez votre parcours, vos spécialités, votre approche...'}
									value={biography}
									onChange={(e) => handleChangeBiography(e)}
									style={{ resize: 'vertical' }}
								/>
							</Form.Item>
						</div>

					</div>
					}
					{
						fieldName == "Animaux" &&
						<>
							<Form.Item
								label={getAContent('cmp_vetonest.com_Na82Lm51Qw')} 
								name="AnimalName"
								rules={[{
									message: animalNameError,
									validator: (value) => {
										if (animalNameError) return Promise.reject(animalNameError);
										return Promise.resolve();
									}
								}]}
								initialValue={animalName}
							>
								<Input
									autoComplete="new-password"
									name="field_animal_123"
									className="row backgroundYellow rounded10 height40 width100per100 birthdateField borderNone"
									placeholder={getAContent('cmp_vetonest.com_Rx47Pe92Ts')}
									type="text"
									value={animalName}
									onChange={(e) => handleChangeAnimalName(e)}
								/>
							</Form.Item>
							<div className="">
								<Form.Item
									label={getAContent('cmp_vetonest.com_Rp84Bt62Mn')}
									name="AnimalSex"
									value={animalSexe}
									rules={[
										{
											message: animalSexeError,
											validator: (value) => {
												if (animalSexeError) return Promise.reject(animalSexeError);
												return Promise.resolve();
											},
										},
									]}
								>
									<Radio.Group
										style={{ width: "100%" }}
										onChange={(e) => handleChangeAnimalSex(e)}
									>
										<div className="row">
											<div
												className="backgroundYellow rounded10 height40"
												style={{ marginLeft: "3%", width: "44%", paddingTop: "2%", paddingLeft: "4%" }}
											>
												<Radio value={1} className="checkbox-like-radio">
													{getAContent('cmp_vetonest.com_Ml72Ks84Np')}
												</Radio>
											</div>
											<div
												className="backgroundYellow rounded10 height40"
												style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
											>
												<Radio value={2} className="checkbox-like-radio">
													{getAContent('cmp_vetonest.com_Fm59Qa21Rt')}
												</Radio>
											</div>
										</div>
									</Radio.Group>
								</Form.Item>
							</div>
							<Form.Item
								name="AnimalBirthdate"
								label={getAContent('cmp_vetonest.com_Kd41Ws97Pl')}
								rules={[{
									message: animalDateNaissanceError,
									validator: (value) => {
										if (animalDateNaissanceError) return Promise.reject(animalDateNaissanceError);
										return Promise.resolve();
									}
								}]}
							>
								<div className="row backgroundYellow rounded10 height40 width100per100 birthdateField dateSelector">
									<div className="col-6 justify-content-end dateField">
										<ConfigProvider
											locale={getDatePickerlocale()}
											theme={{ token: { colorPrimary: '#FFDE59', border: 'none' } }}
										>
											<DatePicker
												value={animalBirthDatePickerValue}
												onChange={(e) => handleAnimalBirthDateChange(e)}
											/>
										</ConfigProvider>
									</div>
									<div className="col-6">
										<span>{animalDateNaissance}</span>
									</div>
								</div>
							</Form.Item>
							<Form.Item
								label = {getAContent('cmp_vetonest.com_Sp94Te63Kz')}
								name="Espece"
								rules={[{
									message: animalEspeceError,
									validator: () => {
										if (animalEspeceError) return Promise.reject(animalEspeceError);
										return Promise.resolve();
									}
								}]}
							>
								<Select
									variant="borderless"
									className="customAntselect custom-select-rounded backgroundYellow height40 birthdateField borderNone"
									bordered={false}
									value={especeSelectedId}
									onChange={(e) => handleChangeAnimalEspece(e)}
									showSearch
									optionFilterProp="label"
									filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
									placeholder= {getAContent('cmp_vetonest.com_Xp47Na93Qs')}
								>
									{especes.map((v) => (
										<Option key={v.id} value={v.id}>
											{v.nom}
										</Option>
									))}
								</Select>
							</Form.Item>
							{breedSpinner && (
								<div className="row justify-content-center" style={{ marginBottom: 10 }}>
									<Spin size="small" />
								</div>
							)}
							<div style={{ display: showBreeds }} >	
								<label>{getAContent('cmp_vetonest.com_Br61Mx80Qp')}</label>
								<Form.Item
									name="Race"
									rules={[{
										message: animalRaceError,
										validator: () => {
											if (animalRaceError) return Promise.reject(animalRaceError);
											return Promise.resolve();
										}
									}]}
								>
									<Select
										variant="borderless"
										className="customAntselect custom-select-rounded backgroundYellow height40 birthdateField borderNone"
										bordered={false}
										value={raceSelectedId}
										onChange={(e) => handleChangeAnimalRace(e)}
										showSearch
										optionFilterProp="label"
										filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
										placeholder= {getAContent('cmp_vetonest.com_Sl9bX2qZm')}
									>
										{races.map((v) => (
											<Option key={v.id} value={v.id}>
												{v.nom}
											</Option>
										))}
									</Select>
								</Form.Item>
							</div>
							<Form.Item
								label={getAContent('cmp_vetonest.com_In73Dz45Hw')}
								name="HaveInsurance"
								rules={[
									{
										message: animalInsuranceError,
										validator: (value) => {
											if (animalInsuranceError) return Promise.reject(animalInsuranceError);
											return Promise.resolve();
										},
									},
								]}
							>
								<Radio.Group
									style={{ width: "100%" }}
									onChange={(e) => handleChangeAnimalInsurance(e)}
								>
									<div className="row">
										<div
											className="backgroundYellow rounded10 height40"
											style={{ marginLeft: "3%", width: "44%", paddingTop: "2%", paddingLeft: "4%" }}
										>
											<Radio value={true} className="checkbox-like-radio">
												{getAContent('cmp_vetonest.com_Hi20Qw67Ps')}
											</Radio>
										</div>
										<div
											className="backgroundYellow rounded10 height40"
											style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
										>
											<Radio value={false} className="checkbox-like-radio">
												{getAContent('cmp_vetonest.com_Tc91Vm47Bs')}
											</Radio>
										</div>
									</div>
								</Radio.Group>
							</Form.Item>
							<Form.Item
								name="AnimalPhoto"
								label={ getAContent('cmp_vetonest.com_An87Lp40Zc') }
								rules={[{
									message: animalPhotoError,
									validator: (value) => {
										if (animalPhotoError) return Promise.reject(animalPhotoError);
										return Promise.resolve();
									}
								}]}
							>
								<div>
									<div className="row marginTop10px">
										&nbsp;&nbsp;<Dragger {...props}>
											<i className="fa fa-camera" aria-hidden="true"></i> {getAContent('cmp_vetonest.com_Lp71Sf94Uw')}
										</Dragger>
									</div>
									{ animalPhoto &&
									<div className="align-items-center">
										<img 
											id="animalPhotoId"
											className="marginTop10px profilePhotoContainer"
											src={ base_url + 'uploads/files/pets/' + animalPhoto } 
											style={{ width: '95%' }} 
										/>
									</div>
									}
								</div>
							</Form.Item>
						</>
					}
					{
						fieldName == "Email" &&
						<Form.Item
							name="Email"
							rules={[
								{
									message: signUpEmailError,
									validator: (value) => {
										if (signUpEmailError) return Promise.reject(signUpEmailError);
										return Promise.resolve();
									}
								}
							]}
						>
							<Input
								name="emailInput"
								className="backgroundYellow rounded10 width100per100 borderNone height40"
								placeholder={signUp_emailPlaceholder}
								type="text"
								value={signUpEmail}
								onChange={(e) => handleChangeEmail(e)}
							/>
						</Form.Item>
					}
					{
						fieldName == "PasswordReset" &&
						<>
							<Form.Item
								name="password"
								rules={[
									{
										message: pwResetPasswordError,
										validator: (value) => {
											if (pwResetPasswordError) return Promise.reject(pwResetPasswordError);
											return Promise.resolve();
										}
									}
								]}
							>
								<Input
									id="pwResetPasswordInput"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={signUp_passwordPlaceholder}
									type="password"
									name="password"
									value={pwResetPassword}
									onChange={(e) => handleChangePwResetPassword(e)}
								/>
							</Form.Item>
							<Form.Item
								name="passwordRepeat"
								rules={[
									{
										message: pwResetPasswordRepeatError,
										validator: (value) => {
											if (pwResetPasswordRepeatError) return Promise.reject(pwResetPasswordRepeatError);
											return Promise.resolve();
										}
									}
								]}
								initialValue=''
							>
								<Input
									id="pwResetPasswordRepeatInput"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={signUp_passwordRepeatPlaceholder}
									type="password"
									name={signUpPasswordRepeat}
									value={pwResetPasswordRepeat}
									onChange={(e) => handleChangePwResetPasswordRepeat(e)}
								/>
							</Form.Item>
							<div style={{ display: formError01 }} className="row formError formError02">
								<span id="cmp_vetonest.com_4LbLKwutmz">
									{getAContent('cmp_vetonest.com_Fr28Ks90Lp')}
								</span>
							</div>
							<div style={{ display: formError02 }} className="row formError formError04">
								<span id="cmp_vetonest.com_4LbLKwutmz">
									{getAContent('cmp_vetonest.com_Zx71Nb44Qe')}
								</span>
							</div>
							<div style={{ display: formError03 }} className="row formError formError05">
								<span id="cmp_vetonest.com_4LbLKwutmz">
									{getAContent('cmp_vetonest.com_Md52Qr88Vp')}
								</span>
							</div>
						</>
					}
					{ 
						fieldName == "FirstName" &&
						<>
							<Form.Item
								name="FirstNameShortcut"
								rules={[
									{
										message: firstNameError,
										validator: (value) => {
											if (firstNameError) return Promise.reject(firstNameError);
											return Promise.resolve();
										}
									}
								]}
							>
								<Input
									name="firstNameInput"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={signUp_firstNamePlaceholder}
									type="text"
									value={firstName}
									onChange={(e) => handleChangeFirstName(e)}
								/>
							</Form.Item>
						</>
					}
					{ 
						fieldName == "Name" &&
						<>
							<Form.Item
								name="NameShortcut"
								rules={[
									{
										message: nameError,
										validator: (value) => {
											if (nameError) return Promise.reject(nameError);
											return Promise.resolve();
										}
									}
								]}
							>
								<Input
									name="nameInput"
									className="backgroundYellow rounded10 width100per100 borderNone height40"
									placeholder={signUp_namePlaceholder}
									type="text"
									value={name}
									onChange={(e) => handleChangeName(e)}
								/>
							</Form.Item>
						</>
					}
					{ fieldName == "Sexes" &&
						<div className="">
							<Form.Item
								label={getAContent('cmp_vetonest.com_ZEuz13yjyi')}
								name="SexShortcut"
								rules={[
									{
										message: sexeError,
										validator: (value) => {
											if (sexeError) return Promise.reject(sexeError);
											return Promise.resolve();
										},
									},
								]}
							>
								<Radio.Group
									style={{ width: "100%" }}
									onChange={(e) => handleChangeProfileSex(e)}
								>
									<div className="row">
										<div
											className="backgroundYellow rounded10 height40"
											style={{ marginLeft: "3%", width: "44%", paddingTop: "2%", paddingLeft: "4%" }}
										>
											<Radio value={1} className="checkbox-like-radio">
												<ManOutlined style={{ marginRight: 6, color: '#1677ff' }} />{getAContent('cmp_vetonest.com_A91fd73KsP')}
											</Radio>
										</div>
										<div
											className="backgroundYellow rounded10 height40"
											style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
										>
											<Radio value={2} className="checkbox-like-radio">
												<WomanOutlined style={{ marginRight: 6, color: '#eb2f96' }} />{getAContent('cmp_vetonest.com_w31LdP9aQs')}
											</Radio>
										</div>
									</div>
								</Radio.Group>
							</Form.Item>
						</div>
					}
					{ fieldName == "BirthDate" &&
						<div>
							<Form.Item 
								rules={[{
									message: dateDeNaissanceError,
									validator: (value) => {
										if (dateDeNaissanceError) return Promise.reject(dateDeNaissanceError);
										return Promise.resolve();
									}
								}]}
								name = "BirthShortcut"
								label={<span><CalendarOutlined style={{ marginRight: 6, color: '#888' }} />{getAContent('cmp_vetonest.com_f82Ns91Qaz')}</span>}
							>
								<ConfigProvider locale={getDatePickerlocale()}>
									<DatePicker 
										onChange={handleBirthDateChange}
										className="backgroundYellow width100per100 height40"
										format={getDateFormatLocale()}
										value={dateDeNaissance}
									/>
								</ConfigProvider>
							</Form.Item>
						</div>
					}
					
				</Form>
				<div style={{ display: formError01 }} className="row formError formError01">
					<span id="cmp_vetonest.com_4LbLKwutmz">
						Email address
					</span> 
					&nbsp;{ signUpEmail }&nbsp;
					<span id="cmp_vetonest.com_WbKGYyavtn">
						not found or already exist.
					</span>&nbsp;
					<span id="cmp_vetonest.com_0lM8zJBsDN">
						Please try another one.
					</span>
				</div>				
				<div style= {{ display: formError02 }}  className="row formError formError02">
					<span className="cmp_vetonest.com_4LbLKwutmz">
						Email address
					</span> 
					<span id="cmp_vetonest.com_071mCRIC59">
						&nbsp;already exist.
					</span>&nbsp;
					<span className="cmp_vetonest.com_0lM8zJBsDN">
						Please try another one.
					</span>
				</div>
			</Modal>

			<Modal
				title={
				  <p>
					<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} /> 
					<span>{ profileTypeId == 1 ? signUp_popConfirmPetTitle : signUp_popConfirmVetTitle }</span> 
				  </p>
				}
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { isModalOptionTypeOpen }
				onOk		= { modalOptionTypeHandleOk }
				onCancel	= { () => modalOptionTypeHandleCancel( false ) }
				afterClose	= { modalOptionTypeClosed }
				okText		= { signUp_popConfirmYes }
				cancelText	= { signUp_popConfirmDeleteBtn }
			>
				<>
					{ user && user.profileTypeId == 1 ? signUp_popConfirmPetDescription : signUp_popConfirmVetDescription }
				</>
			</Modal>
			
			<Modal
				title			= { <p>{signUp_codeTitle}</p> }
				closable		= {{ 'aria-label': 'Custom Close Button' }}
				open			= { isModalOpen }
				onCancel		= { handleCancel }
				afterClose		= { modalClosed }
				footer			= { null }
				maskClosable	= { false }
			>
				<ExclamationCircleOutlined />
				<div className="App">
					<span>{ signUp_codeIntro } </span>&nbsp;
					<span>{ signUpEmail }</span>
					<InputCode
						length={6}
						label={ signUp_codeLabel }
						loading={loading}
						onComplete={code => {
						  setLoading(true);
						  setTimeout(() => setLoading(false), 10000);
						  handleCompletedCode( code )
						}}
					/>
					<div className = "row" >
						<span className='text text-success' style={{display: displayCodeCorrect }} >{ signUp_codeCorrect }</span>&nbsp;
						<span className='text text-danger' style={{display: displayCodeIncorrect }} >{ signUp_codeIncorrect }</span>&nbsp;
						<span className='text text-info' >{ signUp_codeResend }</span>
					</div>
				</div>		
				<br/><br/>
			</Modal>

			<div className="displayNone" >
				<span id = "cmp_vetonest.com_03jgEtJiVa" className ="signUp_firstNamePlaceholder">First name</span>
				<span className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder">Email</span>
				<span id = "cmp_vetonest.com_2Mtv5nj9JA" className ="signUp_nameErrorText">Your name seems incorect</span>
				<span id = "cmp_vetonest.com_P5crAMBBiW" className ="signUp_firstNameErrorText">Your first name seems incorect</span>
				<span className ="cmp_vetonest.com_GomedYOvSx displayNone contactEmailError signUp_emailErrorText">Your email is not correct</span>
				<span id = "cmp_vetonest.com_UcvWQuFUwO" className ="signUp_passwordErrorText">Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.</span>
				<span id = "cmp_vetonest.com_BmYPSRuRRY" className ="signUp_passwordRepeatErrorText">Password are different.</span>
				<span id = "cmp_vetonest.com_rkqxGE9X35" className ="signUp_nameEmpty">Name is empty.</span>
				<span id = "cmp_vetonest.com_7cAD5u6fyj" className ="signUp_passwordEmpty">Password is empty.</span>
				<span id = "cmp_vetonest.com_kc3hRmQL1X" className ="signUp_passwordRepeatEmpty">Password repeat is empty.</span>
				<span className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors">Please correct the errors before continuing.</span>
				<span className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder">Email</span>
				<span id = "cmp_vetonest.com_LXBYsFPl1b" className ="signUp_passwordPlaceholder">Password</span>
				<span id = "cmp_vetonest.com_c6WAL3fo3k" className ="signUp_passwordRepeatPlaceholder">Password repeat</span>
				<span id = "cmp_vetonest.com_wc4hVvXB3N" className ="signUp_namePlaceholder">Name</span>
				<span id = "cmp_vetonest.com_EjMb0Ci9C6" className ="signUp_emailEmpty">L'email est vide.</span>
				<span id = "cmp_vetonest.com_WCfOc17hne" className ="signUp_codeTitle">Email verification</span>
				<span id = "cmp_vetonest.com_MnveaCfq6X" className ="signUp_codeCorrect">Your code is correct.</span>
				<span id = "cmp_vetonest.com_2NbkrLN1Nt" className ="signUp_codeIncorrect">Your code is not correct. Try again.</span>
				<span id = "cmp_vetonest.com_Xzm3u4t1uE" className ="signUp_codeIntro">We sent a verification code to</span>
				<span id = "cmp_vetonest.com_PlOAvkzjQx" className ="signUp_codeResend">Resend the code</span>
				<span id = "cmp_vetonest.com_UcvWQuFUwO" className ="signUp_passwordErrorText">Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.</span>
				<span id = "cmp_vetonest.com_BmYPSRuRRY" className ="signUp_passwordRepeatErrorText">Password are different.</span>
				<span className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors">Please correct the errors before continuing.</span>
				<span id = "cmp_vetonest.com_cFjGEBvej6" className ="passwordForgot_updateSuccess">Votre mot de passe a été mis a jour.</span>
				<span id = "cmp_vetonest.com_LXBYsFPl1b" className ="signUp_passwordPlaceholder">Password</span>
				<span id = "cmp_vetonest.com_c6WAL3fo3k" className ="signUp_passwordRepeatPlaceholder">Password repeat</span>
				<span id = "cmp_vetonest.com_JwgqTDF9g7" className ="passwordForgotReset_title">Reset your password</span>
				<span id = "cmp_vetonest" className ="profileAnimal_animalNamePlaceHolder">Nom de l'animal</span>
				profileAnimal_animalNamePlaceHolder
			</div>
		</>
	);
};

export default ModalProfile;