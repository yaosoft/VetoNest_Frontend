import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";

import { Country, State, City }  from 'country-state-city';
import { Form, Input, Select, Checkbox, List, TimePicker, Radio  } from 'antd';

import { Space,  DatePicker, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';
import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';

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

import { ExclamationCircleOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
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
		validateRppsNumber,
		validateSiretNumber,
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
		etablissementLieuUpdate,
		selectedLieuId,
		setSelectedLieuId,
		selectedVetoClinique,
		transports,
		vetoCliniqueInfo,
		lieuTransportUpdate,
		vetos,
		setCliniqueVetos,
		countryList,
		getPaysVilles,
		getAContent,
		getUserPets,
		getVetoCliniqueInfo,
		setVetoCliniqueInfo,
		getALieu,
		lieuDelete
	} = useContext( SiteContext )
	
	// Dynamic fields error
	const [errors, setErrors] = useState({});
	
	// Dynamic fields onchannge
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
				setAnimalPhoto( info.file );

// console.log( 'info.file', info.file );

				// open the modal
				// await setIsModalPhotoOpen(true);
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
	}, [fileList]); // Dependency array ensures effect runs when isModalOpen changes

	
	const modalPhotoCancel = () => {
		setIsModalPhotoOpen( false );
	}
	const modalPhotoHandleOkClosed = () => {
		console.log( 'modalPhotoHandleOkClosed' )
	}
	// const modalPhotoConfirmText = () => {
		// return "D'accord"
	// }
	// const modalPhotoCancelText = () => {
		// return "Annuler"
	// }
	
	// flags
	const [ selectedFlag, setSelectedFlag ] = useState( 'fr' ); // ToDo create default country in site context

	// phone
	const [ selectedCountryCode, setSelectedCountryCode ] = useState( '+33' ); // ToDO
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

	// veto to invite ( all veto minus current veto )
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
		// signUpVetoNameErrorText = 'Your vetoName seems incorect'
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

// signUpVetoFirstNameErrorText = 'Your firstname seems incorect'
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
		// Allowed: letters (with accents), numbers, spaces, '-', ''', '&'
		const rep = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s&'\-]+$/.test(name);
		return rep;
	}
	
	// parking name validator
	const addressNameValidator = (name) => {
		const rep = /^[\p{L}0-9\s&'\-’,.](?:[\p{L}0-9\s&'\-’,.€$()\/\\]*[\p{L}0-9\s&'\-’,.)])?$/u
.test(name);
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

console.log('Item removed!');
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
console.log( openedError );
		}
		setOpenedError( openedErrorText );
		form.validateFields();
	}
	const handleEndTimeChange = (time) => {
		setEndTime(time);
		var openedErrorText = '';
		if( timeValidator( startTime, time ) === false ){
			openedErrorText = getAContent('cmp_vetonest.com_Yq2nFt77Wc');
console.log( openedError );
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
	// const [ animalEspece, setAnimalEspece ] = useState( '' );
	const [ animalEspeceError, setAnimalEspeceError ] = useState( '' );
	const [ breedSpinner, setBreedSpinner ] = useState( false );
	const handleChangeAnimalEspece = async ( specieId ) => {
		// show spinner
		setBreedSpinner(true);  
		// get specie's breeds		
		const breeds = await speciesBreedList( specieId );
		setRaces( breeds );
		// display breed Select
		setShowBreeds( '' );	
		// set selcted specie
		setEspeceSelectedId( specieId );
		// hide breed spiner
		setBreedSpinner( false );
		
		setAnimalEspeceError( '' );
		form.validateFields();
	}

	// animal race
	// const [ animalRace, setAnimalRace ] = useState( '' );
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

// signUpEmailErrorText = 'Your email is not correct'

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
// console.log( 'verificationCode - typedCode: ' + verificationCode + ' = ' + typedCode );
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
				// message.error( { signUp_codeIncorrect } );
// message.error( 'Your code is not correct. Try again.' );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
		}
		else{
			message.success( signUp_codeCorrect );
// message.success( 'Your code is correct' );
			setDisplayCodeIncorrect( 'none' );
			setEmailVerificationResult( true );
			setDisplayCodeCorrect( 'block' );
			setTimeout( setIsModalOpen, 2000, false );
		}
	}
	const [ loading, setLoading] = useState(false);
	const [ signUpSpin, setSignUpSpin ] = useState( 'none' );
	const [ sendingDisabled, setSendingDisabled ] = useState( false );
	// type checkbox Modal
	const showModalOptionType = () => {
		setIsModalOptionTypeOpen(true);
	};
	const modalOptionTypeHandleOk = () => {
		setIsModalOptionTypeOpen(false);
	};
	const modalOptionTypeHandleCancel = () => {
		document.getElementById( 'signUpType1' ).checked = false;
		document.getElementById( 'signUpType2' ).checked = false;
		setIsModalOptionTypeOpen(false); // close modal 
	}
	const modalOptionTypeClosed = () => {
		console.log( 'modalClosed' );
	}
	const modalClosed = async () => {
		if( emailVerificationResult === false ){
			setSendingDisabled( false );
			return
		}
//setSignUpFirstNameError( "signUpFirstNameErrorText" );

		const emailData = {
			email: signUpEmail,
			userId: user.userId
		}
		const rep = await updateEmail( emailData );

// console.log( 'signUp rep: ' + rep );
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
	const [ sexe, setSexe ] = useState( '' ); // 1 for male, 2 for female
	const [ sexeError, setSexeError ] 	= useState( '' );
	
	const handleChangeProfileSex = (e) => {
		const sexId = e.target.value;
		setSexe( sexId );
		setSexeError( '' );
	}

	// animal sexe
	const [ animalSexes, setAnimalSexes ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalSexe, setAnimalSexe ] = useState( userProfile.userAnimalSexeId );// 1 for male, 2 for female
	const [ animalSexeError, setAnimalSexeError ] 	= useState( '' );
	
	const handleChangeAnimalSex = (e) => {
		const sexId = e.target.value;
// alert(sexId);
		setAnimalSexe( sexId );
		
		setAnimalSexeError( '' );
		form.validateFields();
	}

	// animalInsurance
	const [ animalInsurances, setAnimalInsurances ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalInsurance, setAnimalInsurance ] = useState( userProfile.userAnimalInsuranceId );// 1 for male, 2 for female
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
			return
		}
		const dateStr = date.format('YYYY-MM-DD');
		if( fieldName == 'Profile'  && dateStr < "2020-01-01" ){						// todo: dynamic
			message.error( getAContent('cmp_vetonest.com_Ru6sKa87Xp') )	// todo
		}
		else{
			const dateNaissance = dayjs( dateStr );
			setDateDeNaissance( dateNaissance );
			setDateDeNaissanceRaw( dateStr );
		}
		
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
		// const dateStr = date.format('YYYY-MM-DD');
		setDateAbsence( date )
	}
	const disabledPastDates = (current) => {
		// Disable dates before today
		return current && current.isBefore(dayjs().startOf('day'));
	};

	// Biography
	const [ biographyError, setBiographyError]  = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const handleChangeBiography = ( e ) => {
		const data = e.target.value;
		

		// sync to Form so its rules/validation see the new value
		form.setFieldsValue({ Biography: data });
		
		//
		setBiography( data );

		var biographyErrorText = '';
		if( !isValidBiography( data ) )
			biographyErrorText = getAContent('cmp_vetonest.com_Vm3fHt24Ls');

		setBiographyError( biographyErrorText );

		// optional: validate field immediately
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

	// address
	const [ address, setAddress ] = useState( '' );
	const [ addressError, setAddressError ] = useState( '' );
	const handleChangeAddress = ( e ) => {
		const data = e.target.value;
		setAddress( data );

		var addressErrorText = '';
		const test = addressValidator( data )

		if( data && test === false ){
		
			addressErrorText = profileIdentity_addressErrorText // cmp_vetonest.com_Wq7eNk90Bs
		}
		// signUpAddressErrorText = 'Your address seems incorect'
		setAddressError( addressErrorText );
	}
	const addressValidator = ( address ) => {
		const rep = /^[A-Za-z0-9À-ÿ\s,'\.\-]+$/.test( address );

		return rep
	}

	// codePostal
	const [ codePostal, setCodePostal ] = useState( '' );
	const [ codePostalError, setCodePostalError ] = useState( '' );
	const handleChangeCodePostal = ( e ) => {
		const data = e.target.value;
		setCodePostal( data );

		var codePostalErrorText = '';
		const test = codePostalValidator( data )

		if( data && test === false ){
		
			codePostalErrorText = getAContent('cmp_vetonest.com_Kt8vGd33Qw'); // profileIdentity_codePostalErrorText;
		}
		// signUpCodePostalErrorText = 'Your codePostal seems incorect'
		setCodePostalError( codePostalErrorText );
	}
	const codePostalValidator = ( codePostal ) => {
		const rep = /^[a-zA-Z0-9\.\s,.'-:]*$/.test( codePostal );
		return rep
	}

	// ville
	const [ ville, setVille ] = useState( '' );
	const [ villeError, setVilleError ] = useState( '' );
	const handleChangeVille = ( e ) => {
		const data = e.target.value;
		setVille( data );

		var villeErrorText = '';
		const test = villeValidator( data )

		if( data && test === false ){
			villeErrorText = profileIdentity_villeErrorText // getAContent('cmp_vetonest.com_Sp1cMe44Uv');
		}
		// signUpVilleErrorText = 'Your ville seems incorect'
		setVilleError( villeErrorText );
	}
	const villeValidator = ( ville ) => {
		const rep = /^[a-zA-Z0-9\s,.'-]*$/.test( ville );
		return rep
	}

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
		
		return locale_en // falback
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
		
		return 'YYYY-MM-DD' // falback
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
					label: country.nom,
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

	  setIsLieuPopconfirmOpen(false);      // close Popconfirm
	  modalProfileIdentityCancel(false);   // ✅ close Modal (CORRECT)
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
		// Etablissement_veto
		if( fieldName == 'Etablissement_veto' ){
			const data = {
				vetoEtablissementStatusId: '',
				etablissementId: vetoCliniqueInfo.id,
				profileVetoIdStr: checkedVetoList.join( '*' ),
				status: 1,	// 1 - pending, 2 - active.
				enabled: 1,
			}

			const rep = await setCliniqueVetos( data );	// save
			if( rep === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
			}
			else{
				const random = await generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Js81Qm49Tf' )  ); // invitations sent
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
			}			
		}
		// Etablissement_lieu
		if( fieldName == 'Etablissement_lieu' ){
			
			// check the form errors
			// const checkFormErrors = async() => { 
				// var errorsExist = false;
				// if( etablissementAddressError != '' ){
					// errorsExist = true
				// }
				// else if( etablissementParkingError != '' ){
					// errorsExist = true
				// }
				// else if( etablissementInfoError != '' ){
					// errorsExist = true
				// }
				// form.validateFields();
				// return errorsExist
			// }
			// check errors in dynamic fields
			const formHasErrors = form.getFieldsError().some(f => f.errors.length > 0);
				
			// const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}
			// check empty fields
			var formHasEmpty = '';
			const checkFormEmpty = async( ) => {
				if( !etablissementAddress ){
					formHasEmpty = getAContent( 'cmp_vetonest.com_Lz52Qm14Br' );
					setEtablissementAddressError( formHasEmpty );
				}
				// if( !etablissementParking ){
				//	formHasEmpty = 'profileEtablissement_parkingEmpty';
				//	setEtablissementParkingError( formHasEmpty );
				// }
				// if( !etablissementInfo ){
				//	formHasEmpty = 'profileEtablissement_infoEmpty';
				//	setEtablissementInfoError( formHasEmpty );
				// }
				
	
				if( !form.getFieldValue('LieuCountry') ){
					formHasEmpty = getAContent( 'cmp_vetonest.com_SelectCountry_Txt' );
					setLieuCountryError( formHasEmpty );
				}
				if( !form.getFieldValue('LieuCity') ){
					formHasEmpty = getAContent( 'cmp_vetonest.com_SelectCity_Txt' );
					setLieuCityError( formHasEmpty );
				}
				form.validateFields();
			}
			await checkFormEmpty();
			// check form empty fields
			if( formHasEmpty ){
				message.error( formHasEmpty );
				// setPwResetSpin( 'none' );
				// setSendingDisabled( false );
				return
			}

			const etablissementLieuData = { // Lieux
				...( selectedLieuId  && { lieuId: selectedLieuId } ),
                adresse: form.getFieldValue('LieuAddress'),
                info: form.getFieldValue('Info'),
				parking: form.getFieldValue('Parking'),
				paysId: form.getFieldValue('LieuCountry'),
				villeId: form.getFieldValue('LieuCity'),
				...( userProfile.atHome  && { vetoAtHome: userProfile.id } ),
				...( !userProfile.atHome  && { etablissementId: vetoCliniqueInfo.id } ),
                enabled: true,
			}

			// dynamic fields data
			const dynamicFieldNames = transports.map( field => field.fieldName );
			const allValues = await form.validateFields();
			// Extract only dynamic fields
			const dynamicValues = Object.fromEntries(
				Object.entries(allValues).filter(([key]) =>
					dynamicFieldNames.includes(key)
				)

			);
// console.log( "transports:", transports);
// console.log( "Dynamic fields names:", dynamicFieldNames);
// console.log( "allValues:", allValues);
// console.log( "dynamicValues:", dynamicValues);
			
			const lieuId = await etablissementLieuUpdate( etablissementLieuData );
			if( lieuId === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Ep4wZq81Fs' ) );
				return;
			}
			else{	// Lieux transport 
				const etsTransport = transports.map( ( v, k ) => { 
					// const elt = document.getElementsByName( v.nom )[0];
					// const elt = dynamicValues.filter( ( key, val ) => key == v.nom ) );
					const description = dynamicValues[ v.fieldName ];
					const transportId = v.id;
					const data = {
						'lieuId': lieuId,
						'transportId': transportId,
						'description': description,
						'profileVetoId': profileId,
					}
console.log( 'etsTransport_data', data )
					return data;
				})

				for ( const transport of etsTransport ){
					const rep = await lieuTransportUpdate( transport );
				}
			}
			
			
			message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
			setModalProfileIdentityOpen( false );
			const random = generateRandomDigits(3);
			// setFormUpdated( random );
			setProfileFormUpdated( random );
			setSelectedLieuId( null ); // reset the update mode
			return;
		}

		// Etablissement
		if( fieldName == 'Etablissement' ){
			// check the form errors
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( etablissementNameError != '' ){
					errorsExist = true
					//setPhoneNumberError( 'phoneNumberErrorText' );
				}
				else if( etablissementPresentationError != '' ){
					errorsExist = true
					//setVetoNameError( signUp_nameErrorText );
				}
				form.validateFields();
				return errorsExist
			}
			
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}


			// check empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				// name
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
			
			// check if form has empty fields
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

				return
			}
			await checkFormEmpty();
			// check form empty fields
			if( formHasEmpty ){
				message.error( formHasEmpty );
				// setPwResetSpin( 'none' );
				// setSendingDisabled( false );
				return
			}

			const etablissementData = {
				...(vetoCliniqueInfo && { etablissementId: vetoCliniqueInfo.id }),
                nom: etablissementName,
                presentation: etablissementPresentation,
				etablissementTypeId: selectedEtablissementTypes[0],
				creatorProfileId: profileId,
                enabled: true,
			}

			const resp = await etablissementUpdate( etablissementData );
			if( resp === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Ep4wZq81Fs' ) );
				return;
			}
			else{
				//const random = generateRandomDigits(3);
				//setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
				const random = generateRandomDigits(3);

				setProfileFormUpdated( random );
				return;
			}
		}
		
		// Opened
		if( fieldName == 'Opened' || fieldName == 'Closed' ){
			// close selected day
// alert( closeThisDay );
			if( closeThisDay ){
				const sendData = {
					dayNumber:		dayId,
					profileVetoId:	profileId,
					enabled: 		true,
				}
				const rep = await timeSlotDayClose( sendData );	// save

				if( rep === false ){ //
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
			
			// check the form errors
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
			
			// check form empty fields
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
				// setSignUpSpin( 'none' );
				// setSendingDisabled( false );
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

			const rep = await timeSlotDateUpdate( sendData );	// save

			if( rep === false ){ //
				message.error( 'Veto profile cannot be updated' );
				// return;
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
// check the form errors
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( absenceNameError != '' ){
					errorsExist = true
					//setPhoneNumberError( 'phoneNumberErrorText' );
				}
				else if( absenceDescriptionError != '' ){
					errorsExist = true
					//setVetoNameError( signUp_nameErrorText );
				}
				form.validateFields();
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}

			// check the form empty fields
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
			
			// check if form has empty fields
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
			
			const rep = await timeSlotClosedDateUpdate( sendData );	// save
			
			if( rep === false ){ //
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
			// check the form errors
			const checkFormErrors = async( ) => { 
				var errorsExist = false;
				if( phoneNumberError != '' ){
					errorsExist = true
					//setPhoneNumberError( 'phoneNumberErrorText' );
				}
				else if( vetoNameError != '' ){
					errorsExist = true
					//setVetoNameError( signUp_nameErrorText );
				}
				else if( vetoFirstNameError != '' ){
					errorsExist = true
					//setVetoFirstNameError( signUp_firstNameErrorText );
				}
				else if( vetoRppsError != '' ){
					errorsExist = true;
					//setVetoRppsError( 'profileVeto_rppsError' )
				}
				else if( vetoSiretError != '' ){
					errorsExist = true;
					//setVetoSiretError( 'profileVeto_siretError' )
				}
				else if( tarifMinError != '' ){
					errorsExist = true;
					//setVetoSiretError( 'profileVeto_siretError' )
				}
				else if( tarifMaxError != '' ){
					errorsExist = true;
					//setVetoSiretError( 'profileVeto_siretError' )
				}
				else if( tarifVideoMinError != '' ){
					errorsExist = true;
					//setVetoSiretError( 'profileVeto_siretError' )
				}
				else if( tarifVideoMaxError != '' ){
					errorsExist = true;
					//setVetoSiretError( 'profileVeto_siretError' )
				}
				form.validateFields();
				return errorsExist
			}
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
				return
			}

			// check form empty fields
			var formHasEmpty = false;
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
				// if( !vetoRpps ){
					// const error = getAContent( 'cmp_vetonest.com_Ds85Mv9Rlt' ); 
					// setVetoRppsError( error ); 
					// formHasEmpty = true;
				// }
				// if( !vetoSiret ){
					// const error = getAContent( 'cmp_vetonest.com_Fr20Bh6Wqp' ); 
					// setVetoSiretError( error ); 
					// formHasEmpty = true;
				// }
				if( vetoSelectedSpecialities.length == 0 ){
					const error = getAContent( 'cmp_vetonest.com_Mv72Qd98Pl' ); 
					setVetoSpecialiteError( error );
					formHasEmpty = true;
				}  
				
				if( vetoType == null ){ 
					const error = getAContent( 'cmp_vetonest.com_Kp48Qs91Lm' );
					setVetoTypeError( error );
					formHasEmpty = true
				}
				
				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			await checkFormEmpty();
			
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

				return
			}

			const sendData = {
				userId:				userId,
				nom: 				vetoName,
				prenom:				vetoFirstName,
				phone:				selectedCountryCode + ' ' + phoneNumber.replaceAll( "", "" ),
				siret:				vetoSiret,
				rpps: 				vetoRpps,
				specialiteId: 		vetoSelectedSpecialities[0],
				atHome: 			vetoType,
				profileId:			profileId,
				tarifConsultation: tarifMin & tarifMax && tarifMin + '-' + tarifMax,
				tarifConsultationVideo:  tarifVideoMin & tarifVideoMax && tarifVideoMin + '-' + tarifVideoMax,
			}
			
			const rep = await profileUpdate( sendData, null, profileTypeId );	// save
			
			if( rep === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Hr1mPx54Tb' ) );
				return;
			}
			else{
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

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save
			
			if( rep === false ){ //
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
				userId: 	userId,
				languageId: lastSelectedLanguage
			}
			
			const rep = await updateLanguagePreference( languagePreferenceData )
			if( rep !== false ){
				await setSelectedLanguageId( lastSelectedLanguage ); // update the listbox via context
				await languageSetup( lastSelectedLanguage ); // Update flag and user locale
				user.languageId = lastSelectedLanguage; // update user
				setUser( user );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Qb7tHr52Nv' ) );
				return
			}
			else{
				message.error( getAContent( 'cmp_vetonest.com_Wk1cPv64Ts' ) );
				return
			}
		}
		
		if( fieldName == 'Animaux'){
			// check the form errors
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

			// check empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				if( !animalName ){
					// setFormError06( 'block' );
					// const error = showAFormError( 'formError06' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Na82Lm51Qw' );
					setAnimalNameError( error );
					formHasEmpty = true
				}
				if( !animalSexe ){
					// setFormError06( 'block' );
					// const error = showAFormError( 'formError06' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Rp84Bt62Mn' );
					setAnimalSexeError( error );
					formHasEmpty = true
				}

				if( !animalDateNaissance ){
					// setFormError07( 'block' );
					// const error = showAFormError( 'formError07' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Zu38Qp10Fx' );
					setAnimalDateNaissanceError( error );
					formHasEmpty = true
				}
				if( !especeSelectedId ){
					// setFormError08( 'block' );
					// const error = showAFormError( 'formError08' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Wv62Ak55Lo' );
					setAnimalEspeceError( error );
					formHasEmpty = true
				}
				if( !raceSelectedId ){
					// setFormError09( 'block' );
					// const error = showAFormError( 'formError09' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Mf29Dz83Qr' );
					setAnimalRaceError( error );
					formHasEmpty = true
				}	
				if( animalInsurance == null ){
					// setFormError10( 'block' );
					// const error = showAFormError( 'formError10' ); // return error's tag inner text
					const error = getAContent( 'cmp_vetonest.com_Ba82Hr60Qn' );
					setAnimalInsuranceError( error );
					formHasEmpty = true
				}
				
				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

				return
			}
			
			// send data
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
			if( resp === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Jm3eXy90Pa' ) );
				return;
			}
			else{
				//const random = generateRandomDigits(3);
				//setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
				const random = generateRandomDigits(3);
				// setFormUpdated( random );
				setProfileFormUpdated( random );
				return;
			}
		}

		if( fieldName == 'PasswordReset' ){

			// Password reset
			// check the form errors
			const checkFormErrors = async( ) => {
				var errorsExist = false;
				if( pwResetPasswordError != '' )
					errorsExist = true
				else if( pwResetPasswordRepeatError != '' )
					errorsExist = true

				return errorsExist
			}

			// check the form empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = '';

				if( pwResetPassword == '' ){
					setFormError01( 'block'  );
					const error = showAFormError( 'formError01' ); // return error's tag inner text
					formHasEmpty = error
				}
				else if( pwResetPasswordRepeat == '' ){
					setFormError02( 'block'  );
					const error = showAFormError( 'formError02' ); // return error's tag inner text
					formHasEmpty = error
				}

				return formHasEmpty
			}
			
			// check form erors
			const formHasErrors = await checkFormErrors();
			if( formHasErrors ){
				message.error( signUp_correctErrors );
				setPwResetSpin( 'none' );
				setSendingDisabled( false );
				return
			}

			// check form empty fields
			const formHasEmpty = await checkFormEmpty();
		
			if( formHasEmpty ){
				message.error( formHasEmpty );
				setPwResetSpin( 'none' );
				setSendingDisabled( false );
				return
			}

			const pwResetData = {
				userId: 	    userId,
				password: 		pwResetPassword,
			}
			const resp = await updatePassword( pwResetData );
			setPwResetSpin( 'none' );
			setSendingDisabled( false );
			
			if( !resp ){
				setFormError05( 'block' );
				message.error( showAFormError( formError05 ) )
			}
			else{									// check email account
				message.success( passwordForgot_updateSuccess );
	// message.success( 'Votre mot de passe a été mis a jour.' );
				setVerificationCode( '' );
				setVerificationUserId( '' );
			}
		}
		
		// Email
		if( fieldName == 'Email' ){

			clearFormErrors()
			// check if email already exists
			const checkEmailData = {
				email: signUpEmail
			}
			// check the form errors
			const checkFormErrors = async( ) => {
				if( signUpEmailError != '' )
					return true
			}
			// check form erors
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
				// message.error( 'Please correct the errors before continuing.' );
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return
			}
			
			const checkEmailExist = await checkEmail( checkEmailData );
			if(checkEmailExist){
				setFormError02( 'block' );	// display form error
				message.error( showAFormError( 'formError02' ) );	// display ant error
				setSendingDisabled( false );
				setSignUpEmail( '' );	// reset
				setSignUpSpin( 'none' );
				
				return
			}

			// email verification
			// setOpenModalEmailValidate( true );

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

			const rep = await sendEmail( sendEmailData );	// send the code by email
			
			if( rep === false ){ // email address not found
				setFormError01( 'block' );	// display form error
				message.error( showAFormError( 'formError01' ) );	// display ant error
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return;
			}

			setIsModalOpen(true);
			
			return
		}
	
		// Biography
		if( fieldName == 'Biography' ){

			// check the form errors
			const checkFormErrors = async( ) => {
				var errorsExist = false;
				if( biographyError != '' )
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

			// check the form empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				
				if( !formHasEmpty ){
					const error = getAContent( 'cmp_vetonest.com_Vm3fHt24Ls' );
					setBiographyError( error );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

				return
			}

			const profileData = {
				userId: 	userId,
				profileId: 	profileId,
				biography: biography
			}
			
			const rep = await profileUpdate( profileData )
			if( rep !== false ){

				const random = generateRandomDigits(3);
				message.success( getAContent( 'cmp_vetonest.com_Va8rTk27Qf' ) );
				return
			}
			else{
				message.error( getAContent( 'cmp_vetonest.com_Wk1cPv64Ts' ) ); 
				return
			}
		}

		// Profile
		if( fieldName == 'Profile' ){

			// check the form errors
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
				else if( addressError != '' ){
					errorsExist = true
					await setAddressError( addressError );
					form.validateFields()
				}
				else if( codePostalError != '' ){
					errorsExist = true
					await setCodePostalError( codePostalError );
					form.validateFields()
				}

				return errorsExist
			}

			// check the form empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				// name
				if( !name ){
					const errorMessage = signUp_nameEmpty;
					await setNameError( errorMessage );
					formHasEmpty = true
				}
				// first name
				if( !firstName ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Kt73Nd1Wqp' );
					await setFirstNameError( errorMessage );
					formHasEmpty = true
				}
				// sexe
				if( !sexe ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Mn2Xk8bPrV' );
					await setSexeError( errorMessage );
					formHasEmpty = true
				}
				// birthdate
				if( !dateDeNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Bt82Lm50Hv' );
					setDateDeNaissanceError( error );
					formHasEmpty = true
				}
				// languages
				if( !selectedLanguages.length ){
					const error = getAContent( 'cmp_vetonest.com_D82ka01LsM' );
					setLanguageError( error );
					formHasEmpty = true
				} 
				// address
				if( !address ){
					const error = getAContent( 'cmp_vetonest.com_Mv84Px6Zrt' );
					setAddressError( error );
					formHasEmpty = true
				} 
				// code postal
				if( !codePostal ){
					const error = getAContent( 'cmp_vetonest.com_Jk51Pv7Mra' );
					setCodePostalError( error );
					formHasEmpty = true
				}
				// country
				if( !countrySelected ){
					const error = getAContent( 'cmp_vetonest.com_Td93Qa1Zpl' );
					setCountryError( error );
					formHasEmpty = true
				} 
				// state
				if( !stateSelected ){
					const error = getAContent( 'cmp_vetonest.com_Ms28Ht4Cvo' );
					setStateError( error );
					formHasEmpty = true
				} 
				// city
				if( !citySelected ){
					const error = getAContent( 'cmp_vetonest.com_Bq67Rn3Wks' );
					setCityError( error );
					formHasEmpty = true
				} 

				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
			const formHasEmpty = await checkFormEmpty();
			if( formHasEmpty ){
				message.error( getAContent( 'cmp_vetonest.com_Af92YTwI3c' ) );

				return
			}

			// send data
			const sendData = {
				nom: 				name,
				prenom:				firstName,
				sexeId:				sexe ? sexe : userProfile.sexeId,
				profileId: 			profileId,
				dateDeNaissance: 	dayjs( dateDeNaissanceRaw ).format("YYYY-MM-DD"),
				langues: 			selectedLanguages.join( ',' ),
				adresse:			address,
				codePostal:			codePostal,
				country:	countrySelected,
				state:		stateSelected,
				city:		citySelected,
			}

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save
			
			if( rep === false ){ //
				message.error( getAContent( 'cmp_vetonest.com_Ls9uDe03Km' ) );
				return;
			}
			else{
				user['userPrenom'] = firstName;
				user['userNom'] = name;
				logIn( user );
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( getAContent( 'cmp_vetonest.com_Fg6kVs22Qe' )  );
				setModalProfileIdentityOpen( false );
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

			// check form erors
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
				// setSignUpSpin( 'none' );
				// setSendingDisabled( false );
				return
			}

			
			// check the form empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				// first name
				if( !firstName ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Kt73Nd1Wqp' );
					await setFirstNameError( errorMessage );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
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

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save

			if( rep === false ){ //
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

			// check form erors
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
	// message.error( 'Please correct the errors before continuing.' );
				// setSignUpSpin( 'none' );
				// setSendingDisabled( false );
				return
			}

			// check the form empty fields
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
				// name
				if( !name ){
					const errorMessage = signUp_nameEmpty;
					await setNameError( errorMessage );
					formHasEmpty = true
				}
				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
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

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save

			if( rep === false ){ //
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
			// check if empty field
			const checkFormEmpty = async( ) => {
				var formHasEmpty = false;
			
				if( !sexe ){
					const errorMessage = getAContent( 'cmp_vetonest.com_Mn2Xk8bPrV' );
					await setSexeError( errorMessage );
					formHasEmpty = true
				}
			}
			
			// check if form has empty fields
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

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save

			if( rep === false ){ //
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
			
			// check the form empty fields
			const checkFormEmpty = async() => {
				var formHasEmpty = false;
				// birthdate
				if( !dateDeNaissance ){
					const error = getAContent( 'cmp_vetonest.com_Bt82Lm50Hv' );
					setDateDeNaissanceError( error );
					formHasEmpty = true
				}

				if( formHasEmpty )
					form.validateFields(); 
				
				return formHasEmpty;
			}
			
			// check if form has empty fields
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

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save

			if( rep === false ){ //
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
	// const  modalActiveFieldName = params.params.fieldName;
	const [ fieldName, setFieldName ] = useState( '' );
	// const [ dateNaissance, setDateNaissance ] = useState( '' );
	
	// user language selector
	const { Option } = Select;
	const [ selectedLanguages, setSelectedLanguages ] = useState([]);

	const [ languageError, setLanguageError ] = useState( '' );
	const MAX_LANGUAGES = 3; // Define your maximum limit
	const handleChangeLanguage = (value) => {
		if ( value.length > MAX_LANGUAGES ) {
			// If the new selection exceeds the limit, take only the allowed number
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
	// const [ countryError, setCountryError ] = useState( '' );
	// const [ countryDefault, setCountryDefault ] = useState( 'getAContent(  'cmp_vetonest.com_k3a92hFsP1'  ) ' );
	// const [ countrySelected, setCountrySelected ] = useState( '' );
	// const [ allCountries, setAllCountries ]  = useState( [] ); 
	// const [ siteCountries, setSiteCountries ]  = useState( [] ); 
	// const [ countryCode, setCountryCode ] = useState( '' );	
	// const [ flagCode, setFlagCode ] = useState( '' );
	// const [ countryPhoneCode, setCountryPhoneCode ] = useState( '' );

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

	// const [ countryPhoneCode, setCountryPhoneCode ] = useState( '' );
	const handleChangeFlag = ( countryIso ) => {
// console.log( '>>>>>>>> countryIso', countryIso );
		const country = countriesAllowed.filter( e => e.iso == countryIso )[0];
		setSelectedFlag( country.iso );
		setSelectedCountryCode( country.countryCodc );
	}

	const handleChangeCountrySelected = ( countryCode ) => {

		setCountrySelected( countryCode );
		const countryStates = State.getStatesOfCountry( countryCode );
		setCountryCode( countryCode );
		// const flagCode = countryPhoneCode.toLowerCase();
		setFlagCode( flagCode );
		setStates( countryStates );			
		// const country = countries.filter( country => country.isoCode == countryCode );
		// const countryPhoneCode = country[0].phonecode;
	
		setCountryError( '' );

		// setCountryPhoneCode( countryPhoneCode );
		setShowStatesCities( '' );
		setStateSelected( '' );
		setCitySelected( '' );
	}

	const [ displayLieuCity, setDisplayLieuCity ] = useState( 'none' );
	const handleChangeLieuCountrySelected = async ( countryId ) => {

		setLieuCountrySelected( countryId );
		// const countryStates = State.getStatesOfCountry( countryCode );
		// setCountryCode( countryCode );
		const lieuVilles = await getPaysVilles( countryId ); 
		
		if( lieuVilles.length ){
			setDisplayLieuCity( 'block' );
			setLieuCities( lieuVilles );
		}
		else{
			setDisplayLieuCity( 'none' )
		}
	}

	const handleChangeLieuCitySelected = ( cityId ) => {

		setLieuCitySelected( cityId );

	}

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
// console.log( 'selectedCountryCode + data', selectedCountryCode + ' ' + data );
		var phoneErrorText = '';
		if( data.length == 0 )
			phoneErrorText = '';
		else if( data.length > 0 && data.length < 7 )
			phoneErrorText = getAContent( 'cmp_vetonest.com_Ee4b7YsRf1' ); 	//'Your phone number seems incomplete';
		else if( !isValidPhoneNumber( selectedCountryCode + data ) )
			phoneErrorText = getAContent( 'cmp_vetonest.com_Uu5r3JdWg6' );  // 'Your phone number seems incorrect'
			
		setPhoneNumberError( phoneErrorText );
	}
	const isValidPhoneNumber = (value) => {	// Phone validation
		// return (/^\d{7,}$/).test(value.replace(/[\s()+\-\.]|ext/gi, ''));
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

	const [ lastSelectedLanguage, setLastSelectedLanguage ] = useState( selectedLanguageId ); // initial
	const onLanguageOptionChange = async ( checkedValues ) => {
		// setLanguageSelected(checkedValues);
		
		const valuesNew = checkedValues.filter((v) => v !== lastSelectedLanguage);
		const value = valuesNew.length ? valuesNew[0] : '';
		setLastSelectedLanguage(value);
		setLanguageSelected([value]);
	}

	// Account country options
	const [ countriesOptions, setCountriesOptions ] =  useState( [] );
	const [ countriesDefault, setCountriesDefault ] = useState( [] );
	const [ countriesSelected, setCountriesSelected ] = useState( [] );

	const [ lastSelectedCountry, setLastSelectedCountry ] = useState( userProfile.paysDeLaConsultation ? userProfile.paysDeLaConsultation.id : 1 );  // initial
	const onCountryOptionChange = async ( checkedValues ) => {
		// setCountrySelected(checkedValues);
		
		const valuesNew = checkedValues.filter((v) => v !== lastSelectedCountry);
		const value = valuesNew.length ? valuesNew[0] : '';
		setLastSelectedCountry(value);
		setCountriesSelected([value]);
	}

	// userSpecialities
	const [ vetoSelectedSpecialities, setVetoSelectedSpecialities ] =  useState( [] );
	const [ vetoSpecialiteError, setVetoSpecialiteError  ] =  useState( '' )
	const MAX_SPECIALITIES = 1; // Define your maximum limit
	const handleChangeVetoSpecialities = (value) => {
// console.log( 'handleChangeVetoSpecialities', value );
		if ( value.length > 0 ) {
			setVetoSpecialiteError('');
			form.validateFields()
		}
		if (value.length > MAX_SPECIALITIES) {
		  // If the new selection exceeds the limit, take only the allowed number
		  // setVetoSelectedSpecialities( value.slice(0, MAX_SPECIALITIES) );
		  setVetoSelectedSpecialities( value.slice(0, MAX_SPECIALITIES) );
		} 
		else {
		  setVetoSelectedSpecialities(value);
		}
	}
	
	// all etablissement types
	const [ selectedEtablissementTypes, setSelectedEtablissementTypes ] =  useState( [] );
	const [ etablissementTypeError, setEtablissementTypeError  ] =  useState( '' )
	const MAX_ETSTYPES = 1; // Define your maximum limit
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
	
	// veto RPPS handleChangeVetoRpps
	const [ vetoRpps, setVetoRpps ] =  useState( '' );
	const [ vetoRppsError, setVetoRppsError ] =  useState( '' );
	const [ rppsEmptyTextDisplay, setRppsEmptyTextDisplay ] =  useState( 'none' );
	const [ rppsErrorTextDisplay, setRppsErrorTextDisplay ] =  useState( 'none' );
	const handleChangeVetoRpps = async ( e ) => {
		const data = e.target.value;

// console.log( '>>>> data', data.length );

		// if( data.length > 11 )
		// 	return

		setVetoRpps( data );

// console.log( '>>>> vetoRpps', vetoRpps );
		
		var vetoRppsErrorText = '';
		const test = await validateRppsNumber( data );
// console.log( '>>>> test', test );
		if( data != '' && test === false ){
			vetoRppsErrorText = getAContent(  'cmp_vetonest.com_Di6c1XpMf4'  ) ; // profileAnimal_vetoRppsErrorText
			// vetoRppsErrorText = 'block'
		}
		setVetoRppsError( vetoRppsErrorText );
		form.validateFields();
	}

	// veto SIRET 
	const [ vetoSiret, setVetoSiret ] =  useState( '' );
	const [ vetoSiretError, setVetoSiretError ] =  useState( '' );
	const [ siretEmptyTextDisplay, setSiretEmptyTextDisplay ] =  useState( 'none' );
	const [ siretErrorTextDisplay, setSiretErrorTextDisplay ] =  useState( 'none' );
	const handleChangeVetoSiret = ( e ) => {
		const data = e.target.value;

		setVetoSiret( data );
		var vetoSiretErrorText = '';
		const test = validateSiretNumber( data )
 
		if( data != '' && test === false ){
			vetoSiretErrorText = getAContent( 'cmp_vetonest.com_Zz1k5BrTn8' ); // profileAnimal_vetoSiretErrorText
			setVetoSiretError( vetoSiretErrorText )
			//vetoSiretErrorText = 'block'
		}
		setVetoSiretError( vetoSiretErrorText );
		form.validateFields();
	}

	//
	const [ tarif, setTarif ] =  useState( '' );
	const [ tarifVideo, setTarifVideo ] =  useState( '' );
	// Tarif Min
	const [ tarifMin, setTarifMin ] =  useState( 0 );
	const [ tarifMinError, setTarifMinError ] =  useState( '' );
	const [ tarifMinEmptyTextDisplay, setTarifMinEmptyTextDisplay ] =  useState( 'none' );
	const [ tarifMinErrorTextDisplay, setTarifMinErrorTextDisplay ] =  useState( 'none' );
	const handleChangeTarifMin = ( e ) => {
		const data = e.target.value;
		setTarifMin( data );
console.log( tarifMin + ' llllllll ' + data );
		
		setTarifMinError( '' );
		setTarifMaxError( '' );
		
		if( parseInt( data ) > parseInt( tarifMax )  ){
			const tarifMinErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifMinError( tarifMinErrorText );
		}
		else if( !tarifMax ){
			const tarifMinErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' ); // Enter your minimum price
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
	const [ tarifMaxEmptyTextDisplay, setTarifMaxEmptyTextDisplay ] =  useState( 'none' );
	const [ tarifMaxErrorTextDisplay, setTarifMaxErrorTextDisplay ] =  useState( 'none' );
	const handleChangeTarifMax = ( e ) => {
		const data = e.target.value;
		setTarifMax( data );
		
		setTarifMinError( '' );
		setTarifMaxError( '' );
		
		if( parseInt( data ) < parseInt( tarifMin )  ){
			const tarifMaxErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifMaxError( tarifMaxErrorText );
		}
		else if( !tarifMin ){
			const tarifMaxErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' ); // Enter your minimum price
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
	const [ tarifVideoMinEmptyTextDisplay, setTarifVideoMinEmptyTextDisplay ] =  useState( 'none' );
	const [ tarifVideoMinErrorTextDisplay, setTarifVideoMinErrorTextDisplay ] =  useState( 'none' );
	const handleChangeTarifVideoMin = ( e ) => {
		const data = e.target.value;
		setTarifVideoMin( data );
		
		setTarifVideoMinError( '' );
		setTarifVideoMaxError( '' );
		
		if( parseInt( data ) > parseInt( tarifVideoMax )  ){
			const tarifVideoMinErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifVideoMinError( tarifVideoMinErrorText );
		}
		else if( !tarifVideoMax ){
			const tarifVideoMinErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' ); // Enter your minimum price
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
	const [ tarifVideoMaxEmptyTextDisplay, setTarifVideoMaxEmptyTextDisplay ] =  useState( 'none' );
	const [ tarifVideoMaxErrorTextDisplay, setTarifVideoMaxErrorTextDisplay ] =  useState( 'none' );
	const handleChangeTarifVideoMax = ( e ) => {
		const data = e.target.value;
		setTarifVideoMax( data );
		
		setTarifVideoMinError( '' );
		setTarifVideoMaxError( '' );
		
		if( parseInt( data ) < parseInt( tarifVideoMin )  ){
			const tarifVideoMaxErrorText = getAContent( 'cmp_vetonest.com_Ra73Qm81Lp' );
			setTarifVideoMaxError( tarifVideoMaxErrorText );
		}
		else if( !tarifVideoMin ){
			const tarifVideoMaxErrorText = getAContent( 'cmp_vetonest.com_Kp72Lm84Qs' ); // Enter your minimum price
			setTarifVideoMinError( tarifVideoMaxErrorText );
		}
		else if( !tarifVideoMin && !data ){
			setTarifVideoMinError( '' );
			setTarifVideoMinError( '' );
		}
		form.validateFields();
	}

	// Veto Type
	const [ vetoType, setVetoType ] = useState( userProfile.atHome );
	const [ vetoTypeError, setVetoTypeError ] = useState( userProfile.atHome );
	const handleChangeVetoType =  ( e ) => { 
		const vetoTypeId = e.target.value;
		setVetoType( vetoTypeId );
		setVetoTypeError( '' );
	}

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
	useEffect(() => {
		// if (!isOpen) return; // do nothing when closed
		const vetosToInvite = vetos.filter( e => e.id != profileId ); // move out the current veto
		setVetosToInvite( vetosToInvite );

		// reset the form
		form.resetFields();
		clearFormErrors();
		// title
		setTitle( visibleModalTitle );
		const fieldName = params.params.fieldName;
		setFieldName( fieldName );
		const openModal = ( fieldName === visibleModalName ) && modalProfileIdentityOpen;
		// display of the modal
		if( hasModalBeenShown === false ){
			if( openModal === true ){
				setOpenModal( true );
				setHasModalBeenShown( true );
			}
			if( openModal === false ){
				setOpenModal( false );
				setHasModalBeenShown( false );
				return
			}
		}
		else if( hasModalBeenShown === true ){
			setOpenModal( false );
			return
			// setHasModalBeenShown( false );
		}
// console.log( 'fieldName', fieldName );
// console.log( 'visibleModalName', visibleModalName );
// console.log( 'fieldName === visibleModalName', ( fieldName === visibleModalName ) && modalProfileIdentityOpen );
// console.log( 'hasModalBeenShown', hasModalBeenShown );
// console.log( 'openModal', openModal );

		// all countries
		const allCountries = Country.getAllCountries();
		var countries = Array();
		// Add an id property to the countries array for and Select to work
		for( const country of allCountries ){ 
			country.id = country.isoCode;
			countries.push( country );
		}
		setCountries( countries );

		// Site country 
		const countriesOptions = countriesAllowed.map( ( v, k ) => ( { value: v.id, label: eval( v.tagClass ) } ) );
		setCountriesOptions( countriesOptions  );  // options
		const countryDefault = [ userProfile.paysDeLaConsultation ? userProfile.paysDeLaConsultation.id : 1 ]; // default
		setCountriesSelected( countryDefault );

		// Site languages 
		const languageOptions = languages.map( ( v, k ) => ( { value: v.id, label: eval( v.tagClass ) } ) );
		setLanguageOptions( languageOptions  );  // options
		const languageDefault = [ selectedLanguageId ]; // default
		setLanguageSelected( languageDefault );

		// Reset Animals data
		setAnimalName( null );
		setAnimalDateNaissance( null );	// Placeholder
		setAnimalSexes( null );
		setShowBreeds( 'none' )
		setEspeceSelectedId( null );
		setRaceSelectedId( null );
		setAnimalPhoto( '' )
		setAnimalInsurance( null );
		// get form data
		const a = async () => {
			// Etablissement
			if( fieldName == "Etablissement" ){
				// const vetoCliniqueInfo = await getVetoCliniqueInfo( profileId );
				if( vetoCliniqueInfo ){
					setEtablissementName( vetoCliniqueInfo.nom );
					setEtablissementPresentation( vetoCliniqueInfo.presentation );
					setSelectedEtablissementTypes( [ vetoCliniqueInfo.etablissementType.id ] );
					
					form.setFieldsValue( { EtablissementName: vetoCliniqueInfo.nom } );
					form.setFieldsValue( { EtablissementPresentation: vetoCliniqueInfo.presentation } );
					form.setFieldsValue( { EtablissementType: [ vetoCliniqueInfo.etablissementType.id ] } );
					
					setVetoCliniqueInfo( vetoCliniqueInfo );
				}
				
			}
			// Animals
			if( fieldName == "Animaux" && selectedPetId ){

				// get user's animals
				// const userPets = await getUserPets( profileId );

				const pets = userPets;
				const pet = pets.filter( e => e.id == selectedPetId )[0];
			
				// animal name
				const animalName = pet.nom;
				setAnimalName( animalName );
				form.setFieldsValue( {AnimalName: animalName} );
				// animal specie
				const especeId = pet.espece.id;
				form.setFieldsValue( { Espece: especeId } );
				setEspeceSelectedId( especeId );
				// animal race
				if( especeId ){
					const breeds = await speciesBreedList( especeId );
					setRaces( breeds );
					const raceId = pet.race.id;
					form.setFieldsValue( { Race: raceId } );		
					setRaceSelectedId( raceId );
					setShowBreeds( '' )
				}
				// animal birthDate
				const dateStr = pet.dateNaissance.date;
				setAnimalDateNaissanceRaw( dateStr );
				setAnimalDateNaissance( await dateFormater( dateStr ) );
				// animal have Insurance
				const haveInsurance = pet.assurance;
				form.setFieldsValue( { HaveInsurance: haveInsurance } );
				setAnimalInsurance( haveInsurance ); 
				// animal sex
				const sexId = pet.sexe.id;
				form.setFieldsValue( { AnimalSex: sexId } );
				setAnimalSexe( sexId );				
				// animal photo
				const picture = pet.picture;
				// form.setFieldsValue( { AnimalSex: sexId } );
				setAnimalPhoto( picture );
			}
			// User profile
			if( fieldName == "Profile" ){

				// default name
				const name = userProfile.nom;
				setName( name );
				form.setFieldsValue( {Name: name} );
				// default first name
				const firstName = userProfile.prenom;
				setFirstName( firstName );
				form.setFieldsValue( {FirstName: firstName} );
				// birth date
				const birthDate = userProfile.birthDateFormated ? userProfile.birthDateFormated : null;
				// form.setFieldsValue({
					// BirthdateUser: birthDate ? dayjs(birthDate) : null
				// });
				const dateNaissance = birthDate ? await dayjs( birthDate ) : '';
				setDateDeNaissance( dateNaissance );
				setDateDeNaissanceRaw( birthDate )
				// languages 
				const userLanguages = userProfile.langue ? userProfile.langue : [];
				if( Array.isArray( userLanguages ) ){
					const userLanguagesId = userLanguages.map( ( v, k ) => v.id );
					setSelectedLanguages( userLanguagesId )
				}
				// address
				const address = userProfile.adresse ? userProfile.adresse : '';
				setAddress( address );
				form.setFieldsValue( {Address: address} );
				// code postalCode
				const codePostal = userProfile.codePostal ? userProfile.codePostal : '';
				setCodePostal( codePostal );
				form.setFieldsValue( {CodePostal: codePostal} );
				// Country
				if( userProfile.country ){
					const countryObj = await countries.filter( country => 
						country.id == userProfile.country
					)[0];
					setCountrySelected( userProfile.country );
					form.setFieldsValue( { Country: userProfile.country } );
					// setCountryDefault( userProfile.country );
					const countryStates = await State.getStatesOfCountry( countryObj.isoCode )
					setStates( countryStates );
					// Country States
					if( countryObj ){ 
						setShowStatesCities( '' );
						setStateSelected( userProfile.state );
						form.setFieldsValue( { State: userProfile.state } );
						// setStateDefault( userProfile.state );
						const stateCities = City.getCitiesOfState( countryObj.isoCode, userProfile.state );
						// console.log( 'stateCities', stateCities );
						setCities( stateCities );
						
					}
					// State cities
					if( countryObj ){ 
						setCitySelected( userProfile.city );
						form.setFieldsValue( { City: userProfile.city } );
						// setCityDefault( userProfile.city );
					}
				}

				// sex
				const sex = userProfile.sexeId;
				form.setFieldsValue( { Sexe: sex ? sex : '' } );
				setSexe( sex ? sex : '' );
			}
			
			//  Profile veto
			if( profileTypeId == 2 && userProfile.id ){
				setVetoName( userProfile.nom );
				form.setFieldsValue( { VetoName: userProfile.nom } );
				setVetoFirstName( userProfile.prenom );
				form.setFieldsValue( { VetoFirstName: userProfile.prenom } );
				const countryCode = userProfile.phone ? userProfile.phone.split( ' ' )[0] : '+33' // toDo
				const phone = userProfile.phone ? userProfile.phone.split( ' ' )[1] : '' // toDo
				
				const country = countriesAllowed.filter( e => e.countryCodc == countryCode )[0];
				const countryIso = country ? country.iso : 'fr';
				setSelectedCountryCode( countryCode ); // Todo
				setSelectedFlag( countryIso );
				setPhoneNumber( phone );
				form.setFieldsValue( { PhoneNumber: phone } );
				setVetoSiret( userProfile.siret );
				form.setFieldsValue( { VetoSiret: userProfile.siret } );
				setVetoRpps( !userProfile.rpps );
				form.setFieldsValue( { VetoRpps: userProfile.rpps } );
				setVetoSelectedSpecialities( userProfile.specialites ? [ userProfile.specialites.id ] : [] );
				const vetoType = userProfile.atHome != null ? ( userProfile.atHome == true ? 1 : 0 ) : null;
				setVetoType( vetoType );
				form.setFieldsValue( { VetoType: vetoType } );
				if( userProfile.tarifConsultation ){
					const tarifMin = userProfile.tarifConsultation.split( '-' )[0];
					const tarifMax = userProfile.tarifConsultation.split( '-' )[1];
					setTarifMin( tarifMin );
					setTarifMax( tarifMax );
					form.setFieldsValue( { TarifMin: tarifMin } );
					form.setFieldsValue( { TarifMax: tarifMax } );
				}
				if( userProfile.tarifConsultationVideo ){
					const tarifVideoMin = userProfile.tarifConsultationVideo.split( '-' )[0];
					const tarifVideoMax = userProfile.tarifConsultationVideo.split( '-' )[1];
					setTarifVideoMin( tarifVideoMin );
					setTarifVideoMax( tarifVideoMax );
					form.setFieldsValue( { TarifVideoMin: tarifVideoMin } );
					form.setFieldsValue( { TarifVideoMax: tarifVideoMax } );
				}
			}
			
			// veto absence
			if( fieldName == 'Absence' && selectedAbsenceId ){		// Edit an absence
				const absence = absences.filter( e => e.id == selectedAbsenceId )[0];
				setAbsence( absence );
				setTitle( getAContent( 'cmp_vetonest.com_Tt9f2BmLo7' ) );
				const closeDate = absence.closedDate ? dayjs( absence.closedDate.date ) : '';
				// setDateAbsence( closeDate );
				setDateDeNaissance( closeDate );  //reusing DateDeNaissanc date picker
				const nomAbsence = absence.nom ? absence.nom : '';
				setAbsenceName( nomAbsence );
				const descriptionAbsence = absence.description ? absence.description : '';
				setAbsenceDescription( descriptionAbsence );
				form.setFieldsValue( { AbsenceName: nomAbsence, AbsenceDescription: descriptionAbsence } );
			}
			else if( fieldName == 'Absence' && ! selectedAbsenceId ){ // Add an absence
				setTitle( getAContent( 'cmp_vetonest.com_Oo3j6FwQy9' ) ); 
				form.setFieldsValue( { AbsenceName: '', AbsenceDescription: '' } );
			}

			// veto timeSlot
			if( fieldName == "Opened" || fieldName == "Closed" ){
				if( fieldName == "Opened" ){
					const startTime 	= selectedTimeslotOpen.startTime;
					const endTime 		= selectedTimeslotOpen.endTime;
					setStartTime( dayjs( startTime ) );
					setEndTime( dayjs( endTime ) );
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
console.log( '>>>>>>>>>> selectedLieuId', selectedLieuId );
				if( selectedLieuId ){
					// get data
					const lieu = await getALieu( selectedLieuId );
					// set address
					form.setFieldsValue( { LieuAddress: lieu.adresse } );
					setEtablissementAddress( lieu.adresse ); // Todo: remove React setters, use only ant form setters
					// set parking
					form.setFieldsValue( { Parking: lieu.parking } );
					// set transports ( dynamic fields )
					for ( const transport of lieu.transports ){	// dynamic fields ( transport )
						const id = transport.transportId;
						const fieldName = transports.filter( e => e.id == id )[0].fieldName;
						const value = transport.description;
						form.setFieldsValue( { [fieldName] : value } );
					}
					// set description ( info )
					form.setFieldsValue( { Info: lieu.info } );
					// pays, ville
					if( lieu.pays ){
console.log( '>>>>>>>>>>> lieu', lieu  );
						const countryId = lieu.pays.id;
						var cityId = '';
						if( lieu.ville )
							cityId = lieu.ville.id;

						form.setFieldsValue( { LieuCountry: countryId } );
						const lieuVilles = await getPaysVilles( countryId ); 
						if( lieuVilles.length ){
							setDisplayLieuCity( 'block' );
							setLieuCities( lieuVilles );
							form.setFieldsValue( { LieuCity: cityId } );
						}
						else{
							setDisplayLieuCity( 'none' )
						}
					}
				}
			}
			
			// Biography
			// Biography
			if( fieldName == "Biography" ){
				form.setFieldsValue({ Biography: userProfile.biography });
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
				// sex
				const sex = userProfile.sexeId;
				form.setFieldsValue( { SexShortcut: sex ? sex : '' } ); 
				setSexe( sex ? sex : '' );
			}
			
			// Birth shortcut
			if( fieldName == "BirthShortcut" ){
				// birth date
				const birthDate = userProfile.birthDateFormated ? userProfile.birthDateFormated : null;
				const dateNaissance = birthDate ? await dayjs( birthDate ) : '';
				setDateDeNaissance( dateNaissance );
				setDateDeNaissanceRaw( birthDate )
				form.setFieldsValue( { BirthShortcut: dateNaissance } );
				// const birthDate = userProfile.dateNaissance ? userProfile.dateNaissance.date : '';
				// const dateNaissance = birthDate ? await dateFormater( birthDate ) : '';
				// setDateNaissance( dateNaissance );
			}
		}
		a()

	}, [ userProfile, params.params, selectedTimeslotOpen, vetos, form ]) 

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
						{ /* delete a lieu */ }
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
						{ /* delete an abscence */ }
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
																{v.nom} {v.prenom}
															</h5>

															<p className="card-text" key={'c' + k}>
																{v.vetoSpecialiteTab.nom ? v.vetoSpecialiteTab.nom : getAContent('cmp_vetonest.com_Ga83Kd92Lm')}
															</p>

															<p className="card-text" key={'d' + k}>
																<small className="text-muted" key={'e9' + k}>
																	{getAContent('cmp_vetonest.com_Qp17za92Bw') + dayjs(v.dateCreated.date).format(getDateFormatLocale())}
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

								<Form.Item
									label={ getAContent( 'cmp_vetonest.com_Z19vb62Qpa' ) }
									name="LieuAddress"
									
									rules={[
										{
											required:true,
											message: etablissementAddressError,
											validator: (value) => {
												if (etablissementAddressError) return Promise.reject(etablissementAddressError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="AddressInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Kp81Lt93Ws')}
										type="text"
										value={etablissementAddress}
										onChange={(e) => handleChangeEtablissementAddress(e)}
									/>
								</Form.Item>
								
								<Form.Item 
									name="Parking" 
									label= { getAContent( 'cmp_vetonest.com_Qs51Mb03Ye' ) }
									rules={[
										{
											message: etablissementParkingError,
											validator: (value) => {
												if (etablissementParkingError) 
													return Promise.reject(etablissementParkingError);
												return Promise.resolve();
											}
										}
									]}
								>
									<Input
										name="parkingInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Rf20Kc94Ux')}
										type="text"
										value={etablissementParking}
										onChange={(e) => handleChangeEtablissementParking(e)}
									/>
								</Form.Item>
								{/* Transport inputs redered dynamicaly */}
								{transports.map((field) => (
									<Form.Item
										key={field.id}
										name={field.fieldName}
										label={ getAContent( field.fieldLabelTagRef ) }
										validateStatus={errors[field.fieldName] ? "error" : ""}
										help={errors[field.fieldName] || ""}
									>
										{renderField(field)}
									</Form.Item>
								))}

								<Form.Item
									name="Info"
									label= { getAContent( 'cmp_vetonest.com_Mu63Bd27Nc' ) }
									rules={[
										{
											message: etablissementInfoError,
											validator: (value) => {
												if (etablissementInfoError) return Promise.reject(etablissementInfoError);
												return Promise.resolve();
											}
										}
									]}
								>
									<TextArea
										rows={3}
										name="infoInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={ getAContent('cmp_vetonest.com_Pa37Lv82Hk') }
										type="text"
										value={etablissementInfo}
										onChange={(e) => handleChangeEtablissementInfo(e)}
									/>
								</Form.Item>

								<div className="row">
									<div className="col-sm-12 col-md-6">
										<Form.Item
											name="LieuCountry"
											label={getAContent('cmp_vetonest.com_n17Fd02Cka')}
											rules={[
												{
													required: true, // This ensures the field is mandatory
													message: lieuCountryError,
													validator: (rule, value) => {
														if (lieuCountryError) return Promise.reject(lieuCountryError);
														return Promise.resolve();
													}
												}
											]}
											/* initialValue={lieuCountrySelected ? lieuCountrySelected : getAContent( 'cmp_vetonest.com_k3a92hFsP1' )} */
										>
											<Select
												variant="borderless"
												className="custom-select-rounded"
												style={{ width: '100%' }}
												bordered={false}
												value={countrySelected}
												onChange={(e) => handleChangeLieuCountrySelected(e)}
												showSearch
												optionFilterProp="label"
												filterSort={(a, b) =>
													(a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
												}
												options={BuildLieuCountriesOptions()}
												notFoundContent={lieuCountryDefault}
												placeholder={getAContent('cmp_vetonest.com_k3a92hFsP1')}
											/>
										</Form.Item>
									</div>


									<div className="col-sm-12 col-md-6">
										<Form.Item
											name="LieuCity"
											label={ getAContent( 'cmp_vetonest.com_L20sx18Qmv' ) }
											rules={[
												{
													required: true, // This ensures the field is mandatory
													message: lieuCityError,
													validator: (value) => {
														if (lieuCityError) return Promise.reject(lieuCityError);
														return Promise.resolve();
													}
												}
											]}
											/*  initialValue={lieuCitySelected ? lieuCitySelected :  getAContent( 'cmp_vetonest.com_Pq8x2VmAz9' ) } */
										>
											<Select
												variant="borderless"
												className="custom-select-rounded"
												style={{ width: '100%', /* display: displayLieuCity */ }}
												bordered={false}
												value={citySelected}
												onChange={(e) => handleChangeLieuCitySelected(e)}
												showSearch
												optionFilterProp="label"
												filterSort={(a, b) =>
													(a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
												}
												options={BuildLieuCitiesOptions()}
												notFoundContent={lieuCityDefault}
												placeholder= { getAContent( 'cmp_vetonest.com_Pq8x2VmAz9' ) }
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
									label= { getAContent( 'cmp_vetonest.com_Pk38Vs90Lm' ) }
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
									label= { getAContent( 'cmp_vetonest.com_Te94Bm20Cx' ) }
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
									label= { getAContent( 'cmp_vetonest.com_Az14Gr72Mn' ) }
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
												{getAContent('cmp_vetonest.com_A91fd73KsP')}
											</Radio>
										</div>

										<div
											className="backgroundYellow rounded10 height40"
											style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
										>
											<Radio value={2} className="checkbox-like-radio">
												{getAContent('cmp_vetonest.com_w31LdP9aQs')}
											</Radio>
										</div>
									</div>
								</Radio.Group>
							</Form.Item>

							<div>
								<Form.Item 
									name="BirthdateUser"
									label={getAContent('cmp_vetonest.com_f82Ns91Qaz')}
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
										/>
									</ConfigProvider>
								</Form.Item>
							</div>

							<div>
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

							<div>
								<Form.Item
									label={getAContent('cmp_vetonest.com_Z19vb62Qpa')}
									name="Address"
									className="width100per100"
									rules={[
										{
											message: addressError,
											validator: (value) => {
												if (addressError) return Promise.reject(addressError);
												return Promise.resolve();
											},
										},
									]}
									initialValue={address}
								>
									<Input
										name="addressInput"
										className="backgroundYellow rounded10 width100per100 borderNone height40"
										placeholder={ getAContent( 'cmp_vetonest.com_Mv84Px6Zrt' ) }
										type="text"
										value={address}
										onChange={(e) => handleChangeAddress(e)}
									/>
								</Form.Item>
							</div>

							<div className="row marginTop2percent">
								<div className="col-6">
									<Form.Item
										label={getAContent('cmp_vetonest.com_Qp51Zv83Wc')}
										name="CodePostal"
										rules={[
											{
												message: codePostalError,
												validator: (value) => {
													if (codePostalError) return Promise.reject(codePostalError);
													return Promise.resolve();
												},
											},
										]}
									>
										<Input
											name="codePostalInput"
											className="backgroundYellow rounded10 width100per100 borderNone height40"
											placeholder={getAContent( 'cmp_vetonest.com_Jk51Pv7Mra' )}
											type="text"
											value={codePostal}
											onChange={(e) => handleChangeCodePostal(e)}
										/>
									</Form.Item>
								</div>

								<div className="col-6">
									<Form.Item
										label={getAContent('cmp_vetonest.com_n17Fd02Cka')}
										name="Country"
										rules={[
											{
												message: countryError,
												validator: (value) => {
													if (countryError) return Promise.reject(countryError);
													return Promise.resolve();
												},
											},
										]}
									>
										<Select 
											variant="borderless"
											className="customAntselect custom-select-rounded"
											style={{ width: "100%" }}
											bordered={false}
											value={countrySelected}
											onChange={handleChangeCountrySelected}
											showSearch
											optionFilterProp="label"
											filterSort={(a, b) =>
												(a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())
											}
											options={BuildCountriesOptions()}
											notFoundContent={countryDefault}
											placeholder = { getAContent( 'cmp_vetonest.com_Td93Qa1Zpl' ) }
										/>
									</Form.Item>
								</div>
							</div>

							<div style={{ display: showStatesCities }} className="row marginTop2percent">
								<div className="col-6">
									<Form.Item
										label={getAContent('cmp_vetonest.com_Fm41Za90Pr')}
										name="State"
										rules={[
											{
												message: stateError,
												validator: (value) => {
													if (stateError) return Promise.reject(stateError);
													return Promise.resolve();
												},
											},
										]}
									>
										<Select
											variant="borderless"
											className="customAntselect custom-select-rounded"
											style={{ width: "100%" }}
											value={stateSelected}
											onChange={handleChangeStateSelected}
											showSearch
											optionFilterProp="label"
											filterSort={(a, b) =>
												(a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())
											}
											options={BuildStatesOptions()}
											notFoundContent={stateNotFound}
											placeholder = { getAContent( 'cmp_vetonest.com_Ms28Ht4Cvo' ) }
										/>
									</Form.Item>
								</div>

								<div className="col-6">
									<Form.Item
										label={getAContent('cmp_vetonest.com_L20sx18Qmv')}
										name="City"
										rules={[
											{
												message: cityError,
												validator: (value) => {
													if (cityError) return Promise.reject(cityError);
													return Promise.resolve();
												},
											},
										]}
									>
										<Select
											variant="borderless"
											className="customAntselect custom-select-rounded"
											size="middle"
											value={citySelected}
											onChange={handleChangeCitySelected}
											showSearch
											optionFilterProp="label"
											filterSort={(a, b) =>
												(a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())
											}
											options={BuildCitiesOptions()}
											notFoundContent={cityNotFound}
											placeholder = { getAContent( 'cmp_vetonest.com_Bq67Rn3Wks' ) }
										/>
									</Form.Item>
								</div>
							</div>
						</div>
					)}

					{
						fieldName == "ProfileVeto" &&
						<div className="container">
							{/* Phone number */}
							<Form.Item
								label= { getAContent('cmp_vetonest.com_Zp83Na41Lt') }
								className="phoneFormItem"
								name="PhoneNumber"
								style={{ marginBottom: '0px', float: 'rigth' }}
								rules={[
									{
										required:true, 
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
											<img
											  src={`/img/flags/${v.iso}.svg`}
											  className="phoneFlagImg"
											/>
										  </Option>
										))}
									  </Select>

									  <div className="phoneCode">
										{selectedCountryCode}
									  </div>

									  <Input
										type="text"
										className="phoneInput backgroundYellow rounded10 borderNone height40"
										placeholder={getAContent('cmp_vetonest.com_Qp91Ts3Fka')}
										value={phoneNumber}
										onChange={handleChangePhoneNumber}
									  />

									</div>

							</Form.Item>
							{/* Veto name */}
							<div className="row gy-2" >
								<div className="col-6">
									<Form.Item
										label= {signUp_namePlaceholder}
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
											placeholder={ getAContent( 'cmp_vetonest.com_Lk58Pw7Qms' )}
											type="text"
											value={vetoName}
											onChange={(e) => handleChangeVetoName(e)}
										/>
									</Form.Item>
								</div>
								{/* Veto firstname */}
								<div className="col-6">
									<Form.Item
										label= { signUp_firstNamePlaceholder }
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
											placeholder={ getAContent( 'cmp_vetonest.com_Bt63Xa1Npe' )}
											type="text"
											value={vetoFirstName}
											onChange={(e) => handleChangeVetoFirstName(e)}
										/>
									</Form.Item>
								</div>
							</div>
							{/* Veto name */}
							<div className="row gy-2 displayNone" >
								<div className="col-6">
									<Form.Item
										label= {signUp_namePlaceholder}
										name="VetoName"
										rules={[
											{
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
											placeholder={ getAContent( 'cmp_vetonest.com_Lk58Pw7Qms' )}
											type="text"
											value={vetoName}
											onChange={(e) => handleChangeVetoName(e)}
										/>
									</Form.Item>
								</div>
							</div>	
							{/* Veto specialite */}
							<div>
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
														<Option key={v.id} value={v.id}>
															<Checkbox checked={vetoSelectedSpecialities.includes(v.id)}>
																{v.name}
															</Checkbox>
														</Option>
													))}
									</Select>
								  </div>
								</Form.Item>

							</div>

							{/* Veto Rpps & SIRET*/}
							<div className="row gy-2">
								{/* Veto Rpps */}
								<div className="col-6">
									<Form.Item
										label= {getAContent('cmp_vetonest.com_Dc44Xw21Om')}
										name="VetoRpps"
										rules={[
											{
												message: vetoRppsError,
												validator: (value) => {
													if (vetoRppsError) return Promise.reject(vetoRppsError);
													return Promise.resolve();
												}
											}
										]}
									>
										<Input
											placeholder={getAContent('cmp_vetonest.com_Xp62Qa81Mv')}
											className="backgroundYellow rounded10 height40 width100per100 birthdateField borderNone"
											value={vetoRpps}
											onChange={(e) => handleChangeVetoRpps(e)}
										/>
									</Form.Item>
								</div>
								{/* Veto Siret */}
								<div className="col-6">
									<Form.Item
										label= {getAContent('cmp_vetonest.com_Jf39Lp77Qs')}
										name="VetoSiret"
										rules={[
											{
												message: vetoSiretError,
												validator: (value) => {
													if (vetoSiretError) return Promise.reject(vetoSiretError);
													return Promise.resolve();
												}
											}
										]}
										initialValue={vetoSiret}
									>
										<Input
											placeholder={getAContent('cmp_vetonest.com_La82Qm57Xp')}
											className="backgroundYellow rounded10 height40 width100per100 birthdateField borderNone"
											value={vetoSiret}
											onChange={(e) => handleChangeVetoSiret(e)}
										/>
									</Form.Item>
								</div>
							</div>
							{/* Veto type */}
							<div className="">
								<Form.Item
									
									label={getAContent('cmp_vetonest.com_Hr74Xk63Be')}
									name="VetoType"
									value={vetoType}
									rules={[
										{
											required:true,
											message: vetoTypeError,
											validator: (value) => {
												if (vetoTypeError) return Promise.reject(vetoTypeError);
												return Promise.resolve();
											},
										},
									]}
								>
									<Radio.Group
										style={{ width: "100%" }}
										onChange={(e) => handleChangeVetoType(e)}
									>
										<div className="vetoTypeRow">
										  <div className="vetoTypeOption">
											<Radio value={1} className="checkbox-like-radio">
											  {getAContent('cmp_vetonest.com_Hy63Rk84Vm')}
											</Radio>
										  </div>

										  <div className="vetoTypeOption">
											<Radio value={0} className="checkbox-like-radio">
											  {getAContent('cmp_vetonest.com_Au27Wd56Cq')}
											</Radio>
										  </div>
										</div>

									</Radio.Group>
								</Form.Item>
							</div>
							<div className="row" style={{ height: '84px' }}>
							{/* Tarif consultation (min / max) */}
							<div className="col-6">
								<Form.Item label={getAContent('cmp_vetonest.com_Qr84Lm20Ps')}>
									<Space.Compact
										style={{
											display: 'flex',
											alignItems: 'center'
										}}
									>
										{/* Min tarif */}
										<Form.Item
											name="TarifMin"
											noStyle
											rules={[
												{
													message: tarifMinError,
													validator: () => {
														if (tarifMinError) {
															return Promise.reject(tarifMinError);
														}
														return Promise.resolve();
													}
												}
											]}
										>
											<Input
												type="number"
												min={0}
												placeholder={getAContent('cmp_vetonest.com_Mn82Qa17Xf')}
												className="backgroundYellow height40 borderNone rounded10"
												onChange={handleChangeTarifMin}
											/>
										</Form.Item>

										{/* Dash separator */}
										<span
											style={{
												margin: '0 6px',
												color: '#666',
												fontWeight: 500,
												userSelect: 'none',
												lineHeight: '40px'
											}}
										>
											–
										</span>

										{/* Max tarif */}
										<Form.Item
											name="TarifMax"
											noStyle
											dependencies={['TarifMin']}
											rules={[
												{
													message: tarifMaxError,
													validator: () => {
														if (tarifMaxError) {
															return Promise.reject(tarifMaxError);
														}
														return Promise.resolve();
													}
												}
											]}
										>
											<Input
												type="number"
												min={0}
												placeholder={getAContent('cmp_vetonest.com_Mx39Lp84Rt')}
												className="backgroundYellow height40 borderNone rounded10"
												onChange={handleChangeTarifMax}
											/>
										</Form.Item>

										{/* Currency */}
										<div
											style={{
												height: '40px',
												display: 'flex',
												alignItems: 'center',
												marginLeft: '6px'
											}}
										>
											€
										</div>
									</Space.Compact>
								</Form.Item>
							</div>

							{/* Tarif consultation vidéo (min / max) */}
							<div className="col-6">
								<Form.Item 
									label={getAContent('cmp_vetonest.com_Mn92Ks41Wa')}
									className="tarifFormItem"
								>
									<Space.Compact
										style={{
											display: 'flex',
											alignItems: 'center'
										}}
									>
										{/* Min price */}
										<Form.Item
											name="TarifVideoMin"
											noStyle
											rules={[
												{
													message: tarifVideoMinError,
													validator: () => {
														if (tarifVideoMinError) {
															return Promise.reject(tarifVideoMinError);
														}
														return Promise.resolve();
													}
												}
											]}
										>
											<Input
												type="number"
												min={0}
												placeholder={getAContent('cmp_vetonest.com_Mn82Qa17Xf')}
												className="backgroundYellow height40 borderNone rounded10"
												onChange={handleChangeTarifVideoMin}
											/>
										</Form.Item>

										{/* Dash separator */}
										<span
											style={{
												margin: '0 6px',
												color: '#666',
												fontWeight: 500,
												userSelect: 'none',
												lineHeight: '40px'
											}}
										>
											–
										</span>

										{/* Max price */}
										<Form.Item
											name="TarifVideoMax"
											noStyle
											dependencies={['TarifVideoMin']}
											rules={[
												{
													message: tarifVideoMaxError,
													validator: () => {
														if (tarifVideoMaxError) {
															return Promise.reject(tarifVideoMaxError);
														}
														return Promise.resolve();
													}
												}
											]}
										>
											<Input
												type="number"
												min={0}
												placeholder={getAContent('cmp_vetonest.com_Mx39Lp84Rt')}
												className="backgroundYellow height40 borderNone rounded10"
												onChange={handleChangeTarifVideoMax}
											/>
										</Form.Item>

										{/* Currency */}
										<div
											style={{
												height: '40px',
												display: 'flex',
												alignItems: 'center',
												marginLeft: '6px'
											}}
										>
											€
										</div>
									</Space.Compact>
								</Form.Item>
							</div>
						</div>

						</div>
					}

					{
						fieldName == "Animaux" &&
						<>
							{/* Animal Name */}
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

							{/* Sexe */}
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

							{/* Birthdate */}
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

									{/* Left: DatePicker */}
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
									{/* Right: current birthdate value */}
									<div className="col-6">
										<span>{animalDateNaissance}</span>
									</div>
									
								</div>
							</Form.Item>

							{/* Espece */}

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


							{/* Race */}
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

							{/* Insurance */}
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
								label= { getAContent('cmp_vetonest.com_An87Lp40Zc') }
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
							// initialValue={''}
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
								/* initialValue={userProfile.prenom} */
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
								/* initialValue={userProfile.nom} */
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
													{getAContent('cmp_vetonest.com_A91fd73KsP')}
												</Radio>
											</div>

											<div
												className="backgroundYellow rounded10 height40"
												style={{ width: "44%", paddingTop: "2%", paddingLeft: "5%", marginLeft: "6%" }}
											>
												<Radio value={2} className="checkbox-like-radio">
													{getAContent('cmp_vetonest.com_w31LdP9aQs')}
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
								label={getAContent('cmp_vetonest.com_f82Ns91Qaz')}
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

					{ fieldName == "Biography" &&
						<Form.Item
							name="Biography"
							style={{ marginBottom: '0px' }}
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
								rows={3}
								name="biographyInput"
								className="backgroundYellow rounded10 width100per100 borderNone height40 marginTop10"
								placeholder={getAContent('cmp_vetonest.com_Tp63Ye21Ks')}
								value={biography}
								onChange={(e) => handleChangeBiography(e)}
							/>
						</Form.Item>
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
							{ user && user.profileTypeId == 1 ? signUp_popConfirmPetDescription : signUp_popConfirmVetDescription
							}
							</>
						</Modal>
						
						<Modal
							title			= { <p>{signUp_codeTitle}</p> }
							closable		= {{ 'aria-label': 'Custom Close Button' }}
							open			= { isModalOpen }
							onCancel		= { handleCancel }
							afterClose		= { modalClosed }
							footer			= { null }
							maskClosable	= { false } // This prevents closing on mask click
						>
							<ExclamationCircleOutlined />
							<div className="App">
								<span>{ signUp_codeIntro } </span>&nbsp;
								<span>{ signUpEmail }</span>
							  <InputCode
								length={6}
								label={ signUp_codeLabel }
								// label="Type your code"
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

					<span 
						id = "cmp_vetonest.com_03jgEtJiVa"
						className ="signUp_firstNamePlaceholder" 
					>
						First name
					</span>
					
					<span 
						className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
					>
						Email
					</span>
			
											<span 
												id = "cmp_vetonest.com_2Mtv5nj9JA"
												className ="signUp_nameErrorText" 
											>
												Your name seems incorect
											</span>
											<span 
												id = "cmp_vetonest.com_P5crAMBBiW"
												className ="signUp_firstNameErrorText" 
											>
												Your first name seems incorect
											</span>
											<span 
												className ="cmp_vetonest.com_GomedYOvSx displayNone contactEmailError signUp_emailErrorText" 
											>
												Your email is not correct
											</span>
											<span 
												id = "cmp_vetonest.com_UcvWQuFUwO"
												className ="signUp_passwordErrorText" 
											>
												Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.
											</span>
											<span 
												id = "cmp_vetonest.com_BmYPSRuRRY"
												className ="signUp_passwordRepeatErrorText" 
											>
												Password are different.
											</span>
											
											<span 
												id = "cmp_vetonest.com_rkqxGE9X35"
												className ="signUp_nameEmpty" 
											>
												Name is empty.
											</span>
											<span 
												id = "cmp_vetonest.com_7cAD5u6fyj"
												className ="signUp_passwordEmpty" 
											>
												Password is empty.
											</span>
											<span 
												id = "cmp_vetonest.com_kc3hRmQL1X"
												className ="signUp_passwordRepeatEmpty" 
											>
												Password repeat is empty.
											</span>
											<span 
												className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
											>
												Please correct the errors before continuing.
											</span>
											<span 
												className ="cmp_vetonest.com_Xep3PSNstf signUp_emailPlaceholder" 
											>
												Email
											</span>
											<span 
												id = "cmp_vetonest.com_LXBYsFPl1b"
												className ="signUp_passwordPlaceholder" 
											>
												Password
											</span>
											<span 
												id = "cmp_vetonest.com_c6WAL3fo3k"
												className ="signUp_passwordRepeatPlaceholder" 
											>
												Password repeat
											</span>
											<span 
												id = "cmp_vetonest.com_wc4hVvXB3N"
												className ="signUp_namePlaceholder" 
											>
												Name
											</span>
											<span 
												id = "cmp_vetonest.com_EjMb0Ci9C6"
												className ="signUp_emailEmpty" 
											>
												L'email est vide.
											</span>
											<span 
												id = "cmp_vetonest.com_WCfOc17hne"
												className ="signUp_codeTitle" 
											>
												Email verification
											</span>
											<span 
												id = "cmp_vetonest.com_MnveaCfq6X"
												className ="signUp_codeCorrect" 
											>
												Your code is correct.
											</span>
											<span 
												id = "cmp_vetonest.com_2NbkrLN1Nt"
												className ="signUp_codeIncorrect" 
											>
												Your code is not correct. Try again.
											</span>
											<span
												id = "cmp_vetonest.com_Xzm3u4t1uE"
												className ="signUp_codeIntro" 
											>
												We sent a verification code to
											</span>
											<span
												id = "cmp_vetonest.com_PlOAvkzjQx"
												className ="signUp_codeResend" 
											>
												Resend the code
											</span>

											
											
											<span 
								id = "cmp_vetonest.com_UcvWQuFUwO"
								className ="signUp_passwordErrorText" 
							>
								Password must be 6 to 100 characters long, uppercase and lowercase letters, and at least one number.
							</span>
							<span 
								id = "cmp_vetonest.com_BmYPSRuRRY"
								className ="signUp_passwordRepeatErrorText" 
							>
								Password are different.
							</span>
							<span 
								className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors"
							>
								Please correct the errors before continuing.
							</span>
							<span 
								id = "cmp_vetonest.com_cFjGEBvej6"
								className ="passwordForgot_updateSuccess"
							>
								Votre mot de passe a été mis a jour.
							</span>
							<span 
								id = "cmp_vetonest.com_LXBYsFPl1b"
								className ="signUp_passwordPlaceholder" 
							>
								Password
							</span>
							<span 
								id = "cmp_vetonest.com_c6WAL3fo3k"
								className ="signUp_passwordRepeatPlaceholder" 
							>
								Password repeat
							</span>
							<span 
								id = "cmp_vetonest.com_JwgqTDF9g7"
								className ="passwordForgotReset_title" 
							>
								Reset your password
							</span>
							<span
								id = "cmp_vetonest"
								className ="profileAnimal_animalNamePlaceHolder" 
							>
								Nom de l'animal
							</span>
							profileAnimal_animalNamePlaceHolder
					</div>
					
		</>
	);
};

export default ModalProfile;
