import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import locale_fr from 'antd/locale/fr_FR';
import locale_en from 'antd/locale/en_US';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_it from 'antd/locale/it_IT';
import { Country, State, City }  from 'country-state-city';
import { Form, Input, Select, Checkbox, List } from 'antd';
import { Space,  DatePicker, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';
import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import InputCode from "./InputCode";
const ModalProfileIdentity = ( params ) => {
	
	const { 
		getUser,
		setUser,
		profileTypeId,
		profileId,
		userId,
		user,
		isValidPassword
	} = useContext( AuthContext );

	const { 
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
		userProfile,
		visibleModalName,
		setVisibleModalName,
		signUp_firstNamePlaceholder,
		signUp_namePlaceholder,
		signUp_verifyEmailSubjet,
		signUp_popConfirmPetTitle,
		profileIdentity_sexeErrorText,
		setProfileFormUpdated,
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
		
	} = useContext( SiteContext )

	// Animal photo
	const [ animalPhotoDefaultSrc, setAnimalPhotoPhotoDefaultSrc ] = useState( '/img/user/2.jpg' );
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


	// const modalPhotoHandleOk = async() => {
		// const profileIdType = profileTypeId == 1 ? 'profileUserId' : 'profileVetoId';
		// var data = {};
		// data[ profileIdType ] = profileId;
		// const rep = await profileUpdate ( data, profilePhoto, profileTypeId );
		
		// if( rep ){
			// message.success( 'Updated!' );
			// const random = generateRandomDigits(3);
			// setFormUpdated( random );
		// }
		// else{
			// message.error( 'not Updated!' )
		// }
		// setIsModalPhotoOpen( false );
	// }
	
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
		// signUpNameErrorText = 'Your name seems incorect'
		setNameError( nameErrorText );
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
		
			animalNameErrorText = profileAnimal_animalNameErrorText
		}
		// signUpAnimalNameErrorText = 'Your animalName seems incorect'
		setAnimalNameError( animalNameErrorText );
	}

	// animal espece
	const [ animalEspece, setAnimalEspece ] = useState( '' );
	const [ animalEspeceError, setAnimalEspeceError ] = useState( '' );
	const handleChangeAnimalEspece = async ( specieId ) => {
		// set selcted specie
		setAnimalEspece( specieId );
		// get specie's breeds		
		const breeds = await speciesBreedList( specieId );
		setRaces( breeds );
		// display breed Select
		setShowBreeds( '' )
	}

	// animal race
	const [ animalRace, setAnimalRace ] = useState( '' );
	const [ animalRaceError, setAnimalRaceError ] = useState( '' );
	const handleChangeAnimalRace = ( raceId ) => {
		setAnimalRace( raceId );
	}

	// name validator
	const nameValidator = ( name ) => {
		const rep = /^(([A-Za-zéàèêêâäë]+[\-\']?)*([A-Za-zéàèêêâäë]+)?(\s)?)+([A-Za-zéàèêêâäë]+[\-\']?)*([A-Za-zéàèêêâäë]+)?$/.test( name );
		return rep
	}

	// signUp email
	const regexEmailValidation = /^[a-zA-Z0-9. _-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,4}$/; 
	const isValidEmail = ( email ) => {
		if( !regexEmailValidation.test( email ) )
			return false;

		return true;
	}
	const [ signUpEmail, setSignUpEmail ] = useState();
	const [ signUpEmailDefault, setEmailDefault ] = useState( 'Email' );
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
				message.error( 'Your code is not correct. Try again.' );
				setDisplayCodeIncorrect( 'block' );
				setEmailVerificationResult( false );
			}
			else{
				message.success( 'Your code is correct' );
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
			userId: userId
		}
		const rep = await updateEmail( emailData );

// console.log( 'signUp rep: ' + rep );
		setSignUpSpin( 'none' );
		setSendingDisabled( false );
		if( rep === false ){
			message.error( profileIdentity_updateEmailError )
		}
		else{
			message.success( profileIdentity_updateEmailSuccess );
			
			const random = generateRandomDigits(3);
			setProfileFormUpdated( random );
			message.success( 'Profile updated' );
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

// signUpFirstNameErrorText = 'Your firstname seems incorect'
		setFirstNameError( firstNameErrorText );
	}

	const firstNameValidator = ( firstName ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( firstName );
		return rep
	}

	// sexe
	const [ sexes, setSexes ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ sexe, setSexe ] = useState( userProfile.userSexeId );// 1 for male, 2 for female
	const [ sexeError, setSexeError ] 	= useState( '' );
	const handleChangeSexes = async ( sexeType ) => {
		const elt01 = document.getElementById( 'sexeType' + sexeType ); // current elt
		const elt02 = sexeType == 1 ? document.getElementById( 'sexeType' + 2) :   document.getElementById( 'sexeType' + 1 );

		//setSexe_formOption1Error( '' );
		//setSexe_formOption2Error( '' );
	
		if( elt01.checked ){ // chackboxes inverser
			elt02.checked = false;
		}
		
		if( elt01.checked == true && sexeType == 1 ){
			// message.info( sexe_type1 );
			setSexe( 1 );
			// showModalOptionType();
		}
		else if( elt01.checked == true && sexeType == 2 ){
			// message.info( sexe_type2 );
			setSexe( 2 );
			// showModalOptionType();
		}
		else if( elt01.checked == false && elt02.checked == false ){
			setSexe( '' );
			//setSexe_formOption1Error( sexe_formOption1ErrorText );
			//setSexe_formOption2Error( sexe_formOption2ErrorText );
		}
	}

	// animal sexe
	const [ animalSexes, setAnimalSexes ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalSexe, setAnimalSexe ] = useState( userProfile.userAnimalSexeId );// 1 for male, 2 for female
	const [ animalSexeError, setAnimalSexeError ] 	= useState( '' );
	const handleChangeAnimalSexes = async ( animalSexeType ) => {
		const elt01 = document.getElementById( 'animalSexeType' + animalSexeType ); // current elt
		const elt02 = animalSexeType == 1 ? document.getElementById( 'animalSexeType' + 2) :   document.getElementById( 'animalSexeType' + 1 );

		//setAnimalSexe_formOption1Error( '' );
		//setAnimalSexe_formOption2Error( '' );
	
		if( elt01.checked ){ // chackboxes inverser
			elt02.checked = false;
		}
		
		if( elt01.checked == true && animalSexeType == 1 ){
			// message.info( animalSexe_type1 );
			setAnimalSexe( 1 );
			// showModalOptionType();
		}
		else if( elt01.checked == true && animalSexeType == 2 ){
			// message.info( animalSexe_type2 );
			setAnimalSexe( 2 );
			// showModalOptionType();
		}
		else if( elt01.checked == false && elt02.checked == false ){
			setAnimalSexe( '' );
			//setAnimalSexe_formOption1Error( animalSexe_formOption1ErrorText );
			//setAnimalSexe_formOption2Error( animalSexe_formOption2ErrorText );
		}
	}

	// animalInsurance
	const [ animalInsurances, setAnimalInsurances ] = useState( [ { label: 'Male', value: '1' }, { label: 'female', value: '2' }, ] );
	const [ animalInsurance, setAnimalInsurance ] = useState( userProfile.userAnimalInsuranceId );// 1 for male, 2 for female
	const [ animalInsuranceError, setAnimalInsuranceError ] 	= useState( '' );
	const handleChangeAnimalInsurances = async ( animalInsuranceType ) => {
		const elt01 = document.getElementById( 'animalInsuranceType' + animalInsuranceType ); // current elt
		const elt02 = animalInsuranceType == 1 ? document.getElementById( 'animalInsuranceType' + 2) :   document.getElementById( 'animalInsuranceType' + 1 );

		//setAnimalInsurance_formOption1Error( '' );
		//setAnimalInsurance_formOption2Error( '' );
	
		if( elt01.checked ){ // chackboxes inverser
			elt02.checked = false;
		}
		
		if( elt01.checked == true && animalInsuranceType == 1 ){
			// message.info( animalInsurance_type1 );
			setAnimalInsurance( 1 );
			// showModalOptionType();
		}
		else if( elt01.checked == true && animalInsuranceType == 2 ){
			// message.info( animalInsurance_type2 );
			setAnimalInsurance( 2 );
			// showModalOptionType();
		}
		else if( elt01.checked == false && elt02.checked == false ){
			setAnimalInsurance( '' );
			//setAnimalInsurance_formOption1Error( animalInsurance_formOption1ErrorText );
			//setAnimalInsurance_formOption2Error( animalInsurance_formOption2ErrorText );
		}
	}

	// Birth date
	const [ dateDeNaissance, setDateDeNaissance ] = useState( '' );
	const handleBirthDateChange = ( date, dateString ) => {
// console.log( 'date', date.format('YYYY-MM-DD') );
		// const day 	= dateString.$D;
		// const month = dateString.$M;
		// const year 	= dateString.$y;
		const dateStr = date.format('YYYY-MM-DD');
		if( dateStr < "2020-01-01" )						// todo: dynamic
			setDateDeNaissance( dateStr )
		else
			message.error( 'Age limit of 10 is not reached' )	// todo
	}

	// Animal Birth date
	const [ animalDateNaissance, setAnimalDateNaissance ] = useState( '' );
	const handleAnimalBirthDateChange = ( date, dateString ) => {
// console.log( 'date', date.format('YYYY-MM-DD') );
		// const day 	= dateString.$D;
		// const month = dateString.$M;
		// const year 	= dateString.$y;
		const dateStr = date.format('YYYY-MM-DD');
		setAnimalDateNaissance( dateStr )
	}

	// Biography
	const [ biographyError, setBiographyError]  = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const handleChangeBiography = ( e ) => {
		const data = e.target.value;
		setBiography( data );

		var biographyErrorText = '';
		if( !isValidBiography( data ) )
			biographyErrorText = 'Please add a few words to your biography';

		setBiographyError( biographyErrorText );
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
		
			addressErrorText = profileIdentity_addressErrorText
		}
		// signUpAddressErrorText = 'Your address seems incorect'
		setAddressError( addressErrorText );
	}
	const addressValidator = ( address ) => {
		const rep = /^[a-zA-Z0-9,.'-]*$/.test( address );
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
		
			codePostalErrorText = 'Code postal Error'; // profileIdentity_codePostalErrorText;
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
			villeErrorText = profileIdentity_villeErrorText
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
// password
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
	const handleClickSave = async () => {
		
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
				message.success( 'Default language updated' );
				return
			}
			else{
				message.error( 'Default language not updated' );
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
			var formHasEmpty = '';
			const checkFormEmpty = async( ) => {
				

				if( ! animalSexe ){
					setFormError06( 'block'  );
					const error = showAFormError( 'formError06' ); // return error's tag inner text
					formHasEmpty = error
				}
				if( !animalDateNaissance ){
					setFormError07( 'block'  );
					const error = showAFormError( 'formError07' ); // return error's tag inner text
					formHasEmpty = error
				}
				if( !animalEspece ){
					setFormError08( 'block'  );
					const error = showAFormError( 'formError08' ); // return error's tag inner text
					formHasEmpty = error
				}
				if( !animalRace ){
					setFormError09( 'block'  );
					const error = showAFormError( 'formError09' ); // return error's tag inner text
					formHasEmpty = error
				}	
				if( !animalInsurance ){
					setFormError10( 'block'  );
					const error = showAFormError( 'formError10' ); // return error's tag inner text
					formHasEmpty = error
				}
			}
			
			await checkFormEmpty();
			// check form empty fields
			if( formHasEmpty ){
				message.error( formHasEmpty );
				// setPwResetSpin( 'none' );
				// setSendingDisabled( false );
				return
			}
			const date = dayjs(); // Creates a Day.js object for the current date and time

			const animalData = {
                nomAnimal: animalName,
                sexeId: animalSexe,
                dateDeNaissance: dayjs( animalDateNaissance, "YYYY-MM-DD+h:mm").format('YYYY-MM-DD') ,
                especeId: animalEspece,
				raceId: animalRace,
                profileUserId: profileId,
                assurance: animalInsurance, 
                active: 1,
				...( selectedPetId && { carnetAnimalId: selectedPetId, } )
			}
			
			const resp = await editUserPets( animalData, animalPhoto.originFileObj );
			if( resp === false ){ //
				message.error( 'Pet book cannot be updated' );
				return;
			}
			else{
				//const random = generateRandomDigits(3);
				//setProfileFormUpdated( random );
				message.success( 'Profile updated' );
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
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return
			}

			// email verification
			// setOpenModalEmailValidate( true );

			const code = await generateRandomDigits( maxCodeLength );
			setCode( code );
	// console.log( 'genCode: ' + genCode );
			const domainName 	= signUpEmail.split( '@' )[1];
			const subject 		= signUp_verifyEmailSubjet + siteName;
	// const subject 		= 'Verify your email address for ' + siteName;
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
	// console.log( 'sendEmailData', sendEmailData );

			const rep = await sendEmail( sendEmailData );	// send the code by email
			
			if( rep === false ){ // email address not found
				setFormError01( 'block' );	// display form error
				message.error( showAFormError( 'formError01' ) );	// display ant error
				setSignUpSpin( 'none' );
				setSendingDisabled( false );
				return;
			}
	// console.log( 'Check email', rep );
			setSignUpSpin( 'none' );
			setIsModalOpen(true);
			
			return
		}

		// Email
		if( fieldName == 'Profile' ){	
			// check form erors
			const formHasErrors = await checkFormErrors();

			if( formHasErrors ){
				message.error( signUp_correctErrors );
	// message.error( 'Please correct the errors before continuing.' );
				// setSignUpSpin( 'none' );
				// setSendingDisabled( false );
				return
			}

			// check form empty fields
			const formHasEmpty = await checkFormEmpty();

			if( formHasEmpty ){
				message.error( formHasEmpty );
				// setSignUpSpin( 'none' );
				// setSendingDisabled( false );
				return
			}
			
			const sendData = {
				nom: 				name,
				prenom:				firstName,
				sexeId:				sexe ? sexe : userProfile.userSexeId,
				profileId: 			profileId,
				dateDeNaissance: 	dateDeNaissance,
				langues: 			selectedLanguages.join( ',' ),
				adresse:			address,
				codePostal:			codePostal,
				country:	countrySelected,
				state:		stateSelected,
				city:		citySelected,
			}

			const rep = await profileUpdate( sendData, null, profileTypeId );	// save
			
			if( rep === false ){ //
				message.error( 'Profile cannot be updated' );
				return;
			}
			else{
				const random = generateRandomDigits(3);
				setProfileFormUpdated( random );
				message.success( 'Profile updated' );
				setModalProfileIdentityOpen( false );
			}
		}
	}

	// check the form errors
	const checkFormErrors = async( ) => { 
		var errorsExist = false;
		if( nameError != '' ){
			errorsExist = true
			await setNameError( nameError );
			form.validateFields()
		}
		return errorsExist
	}

	// check the form empty fields
	const checkFormEmpty = async( ) => {
		var formHasEmpty = '';
		if( name == '' ){
			const errorMessage = signUp_nameEmpty;
			await setNameError( errorMessage );
			formHasEmpty = errorMessage
		}
		if( firstName == '' ){
			const errorMessage = profileIdentity_firstNameEmpty;
			await setNameError( errorMessage );
			formHasEmpty = errorMessage
		}
		
		form.validateFields()
		return formHasEmpty
	}

	// Modal
	const modalProfileIdentityOk = async( ) => {
		const rep = await handleClickSave();
		if( rep !== false )
			modalProfileIdentityClosed()
	}
	
	const modalProfileIdentityCancel = async( ) => {
		setModalProfileIdentityOpen( false )
	}
	
	const modalProfileIdentityClosed = async( ) => {
		setVisibleModalName( '' );
		setModalProfileIdentityOpen( false );
		form.resetFields();
	}

	// birth date
	const [ datePickerDefaultValue, setDatePickerDefaultValue ] = useState( '' ); 
	const [ fieldName, setFieldName ] = useState( '' );
	const [ dateNaissance, setDateNaissance ] = useState( '' );
	
	// user language selector
	const { Option } = Select;
	const [ selectedLanguages, setSelectedLanguages ] = useState([]);

	const MAX_LANGUAGES = 2; // Define your maximum limit
	const handleChangeLanguage = (value) => {
		if (value.length > MAX_LANGUAGES) {
		  // If the new selection exceeds the limit, take only the allowed number
		  setSelectedLanguages( value.slice(0, MAX_LANGUAGES) );
		} 
		else {
		  setSelectedLanguages(value);
		}
	}

	// countries
	// const [ countryError, setCountryError ] = useState( '' );
	// const [ countryDefault, setCountryDefault ] = useState( 'Select a country' );
	// const [ countrySelected, setCountrySelected ] = useState( '' );
	// const [ allCountries, setAllCountries ]  = useState( [] ); 
	// const [ siteCountries, setSiteCountries ]  = useState( [] ); 
	// const [ countryCode, setCountryCode ] = useState( '' );	
	// const [ flagCode, setFlagCode ] = useState( '' );
	// const [ countryPhoneCode, setCountryPhoneCode ] = useState( '' );

	const [ countryError, setCountryError ] = useState( '' );
	const [ countryDefault, setCountryDefault ] = useState( 'Select a country' );
	const [ countrySelected, setCountrySelected ] = useState( '' );
	const [ countries, setCountries ]  = useState( [] ); 
	const [ countryCode, setCountryCode ] = useState( '' );	
	const [ flagCode, setFlagCode ] = useState( '' );
	const [ countryPhoneCode, setCountryPhoneCode ] = useState( '' );

	const handleChangeCountrySelected = ( countryCode ) => {
		setCountrySelected( countryCode );
		const countryStates = State.getStatesOfCountry( countryCode );
		setCountryCode( countryCode );
		// const flagCode = countryPhoneCode.toLowerCase();
		setFlagCode( flagCode );
		setStates( countryStates );			
		const country = countries.filter( country => country.isoCode == countryCode );
		// const countryPhoneCode = country[0].phonecode;
	
		setCountryError( '' );

		// setCountryPhoneCode( countryPhoneCode );
		setShowStatesCities( '' );
		setStateSelected( '' );
		setCitySelected( '' );
	}
	
	// states
	const [ stateError, setStateError ] = useState( '' );
	const [ stateDefault, setStateDefault ] = useState( 'Select a state' );
	const [ stateNotFound, setStateNotFound ] = useState( 'Select a country first' );
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
	const [ cityDefault, setCityDefault ] = useState( 'Select a city' );
	const [ cityNotFound, setCityNotFound ] = useState( 'Select a state first' );
	const [ citySelected, setCitySelected ] = useState( '' );
	const [ cities, setCities ]  = useState( [] ); 
	const handleChangeCitySelected = ( value ) => {
		setCitySelected( value );
		setCityError();
	}
	const [ showStatesCities, setShowStatesCities ]  = useState( 'none' );

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

	const [ lastSelectedCountry, setLastSelectedCountry ] = useState( 1 );  // initial
	const onCountryOptionChange = async ( checkedValues ) => {
		// setCountrySelected(checkedValues);
		
		const valuesNew = checkedValues.filter((v) => v !== lastSelectedCountry);
		const value = valuesNew.length ? valuesNew[0] : '';
		setLastSelectedCountry(value);
		setCountriesSelected([value]);
	}

	useEffect(() => {

		// reset the form
		form.resetFields();
		clearFormErrors();

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
		const countryDefault = [ 1 ]; // default
		setCountriesSelected( countryDefault );

		// Site languages 
		const languageOptions = languages.map( ( v, k ) => ( { value: v.id, label: eval( v.tagClass ) } ) );
		setLanguageOptions( languageOptions  );  // options
		const languageDefault = [ selectedLanguageId ]; // default
		setLanguageSelected( languageDefault );

		const a = async () => {
			const fieldName = await params.params.fieldName;
			setFieldName( fieldName );
			const title = await params.params.title;
			setTitle( title );
			
			// default name
			const name = userProfile.nom;
			setName( name );
			// default first name
			const firstName = userProfile.prenom;
			setFirstName( firstName );
			// setDescription( 'Update ' + fieldName )
			// birth date
			const birthDate = userProfile.dateNaissance ? userProfile.dateNaissance.date : '';
			const dateNaissance = birthDate ? await dateFormater( birthDate ) : '';
			setDateNaissance( dateNaissance );
			setDatePickerDefaultValue( birthDate ? dayjs( birthDate ) : dayjs()  );
			
			const userLanguages = userProfile.langue ? userProfile.langue : [];
			const userLanguagesId = userLanguages.map( ( v, k ) => v.id );
			setSelectedLanguages( userLanguagesId );
			// address
			const address = userProfile.adresse ? userProfile.adresse : '';
			setAddress( address );
			// code postalCode
			const codePostal = userProfile.codePostal ? userProfile.codePostal : '';
			setCodePostal( codePostal );
			// Country
			if( userProfile.country ){
				const countryObj = await countries.filter( country => 
					country.id == userProfile.country
				)[0];
				setCountrySelected( userProfile.country );
				// setCountryDefault( userProfile.country );
				const countryStates = await State.getStatesOfCountry( countryObj.isoCode )
				setStates( countryStates );
				// Country States
				if( countryObj ){ 
					setShowStatesCities( '' );
					setStateSelected( userProfile.state );
					// setStateDefault( userProfile.state );
					const stateCities = City.getCitiesOfState( countryObj.isoCode, userProfile.state );
					// console.log( 'stateCities', stateCities );
					setCities( stateCities );
				}
				// State cities
				if( countryObj ){ 
					setCitySelected( userProfile.city )
					// setCityDefault( userProfile.city );
				}
			}
			if( !countrySelected )
				setCountryDefault( profileIdentity_countryDefault )
			if( !stateSelected )
				setStateDefault( profileIdentity_stateDefault )
			if( !citySelected )
				setCityDefault( profileIdentity_cityDefault )
			// email
			// if( signUpEmail == '' )
			//	setSignUpEmail( user.email )
			

			
			// animal edit ( carnets animal )

			if( selectedPetId ){
				const pets = userPets;
// console.log( 'pets', pets );
				const pet = pets.filter( e => e.id == selectedPetId )[0];
				setAnimalName( pet.nom );
				setEspeceSelectedId( pet.especeId );
				setRaceSelectedId( pet.especeId );
				const dateStr = pet.dateNaissance.date;
				setAnimalDateNaissance( dateStr )
				if( pet.assurance )
					setAnimalInsurance(1)
				else
					setAnimalInsurance(2)
				
				if( pet.sexe == 1 )
					setAnimalSexe(1)
				else
					setAnimalSexe(2)
			}
		}
		a()

	}, [ visibleModalName, userProfile ]) 



	// Build especes
	const BuildEspecesOptions = async () => {

		if( especes.length ){
			return(
				([])
			)
		}
		return(
			especes.map( ( espece, index ) => 
				({
					value: espece.id,
					label: espece.nom,
				})
			)
		)
	}


	
	// form
	 const [form] = Form.useForm();

	 return (
		 <> 
			<Modal
				visible		= { fieldName === visibleModalName ? true : false }
				title		= { <p style={{ textAlign: 'center' }}>{title}</p> }
				closable	= {{ 'aria-label': 'Custom Close Button' }}
				open		= { fieldName == visibleModalName ? 
								modalProfileIdentityOpen :
								false
							}
				onOk		= { modalProfileIdentityOk }
				onCancel	= { () => modalProfileIdentityCancel( false ) }
				afterClose	= { modalProfileIdentityClosed }
				// zIndex={1005} // Custom z-index
				
				footer={
				  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
					
					<Button key="submit" type="success" onClick={handleClickSave} className="btnModalProfileIdentity">
					  Confirmer
					</Button>
				  </div>
				}
				okText		= { 'Ok' }
				cancelText	= { 'Cancel' }
				styles 		= {{
					body: {
						
					},
				}}
			>
				
				<Form 
					className=""
					form = {form}
					/* initialValues={{ PaypalEmail: 'john.doe@example.com' }} */
				>
					{ fieldName == "Country" &&
						<>
							<div className="row">
								<Checkbox.Group 
									options={countriesOptions} 
									// defaultValue={languageDefault} 
									value={countriesSelected}
									onChange={ onCountryOptionChange }
								/>
							</div>
							<p className="row">&nbsp;
							</p>
						</>
					}
					{ fieldName == "Language" &&
						<>
						
							<div className="row">
								<Checkbox.Group 
									options={languageOptions} 
									// defaultValue={languageDefault} 
									value={languageSelected}
									onChange={ onLanguageOptionChange }
								/>
							</div>
							<p className="row">&nbsp;
							</p>
						</>
					}
					{ fieldName == "Profile" &&
					<>	
						<div className="row">
							<div className="col-6">
								<Form.Item
									name  = "Name"
									rules = {[
										{
											message: nameError,
											validator: ( value ) => {
												if ( nameError ) {
													return Promise.reject( nameError );
												} 
												else {
													return Promise.resolve();
												}
											}
										}
									]}
									initialValue  = { name }
								>
									<Input 
										name  = "nameInput"
										className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
										placeholder={ signUp_namePlaceholder }
										type="text" 
										value={ name }
										onChange = { e => handleChangeName(e) }
									/>
								</Form.Item>
							</div>
							<div className="col-6">
								<Form.Item
									name  = "firstName"
									
									rules = {[
										{
											message: firstNameError,
											validator: ( value ) => {
												if ( firstNameError ) {
													return Promise.reject( firstNameError );
												} 
												else {
													return Promise.resolve();
												}
											}
										}
									]}
									initialValue  = { firstName }
								>
									<Input 
										name  = "firstNameInput"
										className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
										placeholder={ signUp_firstNamePlaceholder }
										type="text" 
										value={ firstName }
										onChange = { e => handleChangeFirstName(e) }
									/>
								</Form.Item>
							</div>
						</div>
						<div className="row">
							<div className="col-6">
								<Form.Item
									className = "backgroundYellow borderRadius18 height40"
									name  = "male"
								>
									<div className='row' >
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											Male
										</div>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											<Input
												className=''
												type="checkbox" 
												name="signUpTypeUser"
												id="sexeType1"
												value={ 1 }
												defaultChecked= { userProfile.userSexeId == 1 ? true : false }
												onChange = { e => handleChangeSexes(1) }
												style={{ outline: 'none' }}
											 />
										</div>
									</div>
								</Form.Item>
							</div>
							<div className="col-6">
								<Form.Item
									className = "backgroundYellow borderRadius18 height40"
									name  = "female"
								>
									<div className='row'>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											Female
										</div>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											<Input
												type="checkbox" 
												name="signUpTypeUser"
												id="sexeType2"
												value={ 2 }
												defaultChecked= { userProfile.userSexeId == 2 ? true : false }
												onChange = { e => handleChangeSexes(2) }
												style={{ outline: 'none' }}
											 />
										</div>
									</div>
								</Form.Item>
							</div>
						</div>
						<div className="row backgroundYellow borderRadius18 height40 width100per100 birthdateField dateSelector">
							<div className="col-6">
								<span>Birth date &nbsp; { dateNaissance }</span>
							</div>
							<div className="col-6 justify-content-end dateField">
								<ConfigProvider 
									locale={ getDatePickerlocale() }
									theme={{ token: { colorPrimary: '#FFDE59', border: 'none' } }} 
								>
									<DatePicker 
										defaultValue={ datePickerDefaultValue }
										onChange={ (e) => handleBirthDateChange(e) }
									/>
								</ConfigProvider>
							</div>
						</div>
						<div className="row height40 width100per100 selectLanguage">
							<div className="col-3">
								Language
							</div>
							<div className="col-9">
								
								<ConfigProvider 
									locale={ getDatePickerlocale() }
									theme={{ token: { colorPrimary: '#FFDE59' } }} 
								>
								
									<Select 
										mode="multiple"
										placeholder="Select languages"
										variant="borderless"
										className="custom-select"
										value={selectedLanguages}
										onChange={handleChangeLanguage}
										style={{ width: '100%' }}
										suffixIcon={null} // This hides the arrow
									>
										{ 
											languages.map(( v, k ) => (
												<Option key={v.id} value={v.id}>
												  <Checkbox checked={selectedLanguages.includes(v.id)}>
													{eval( v.tagClass )}
												  </Checkbox>
												</Option>
											))
										}
									</Select>
									</ConfigProvider>
								 
							</div>
						</div>
						<div className="row backgroundYellow borderRadius18 height40 width100per100 profilIdentityField">
							<Form.Item
								name  = "address"
								rules = {[
									{
										message: addressError,
										validator: ( value ) => {
											if ( addressError ) {
												return Promise.reject( addressError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								initialValue  = { address }
							>
								<Input 
									name= "addressInput"
									className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
									placeholder={ profileIdentity_addressPlaceholder }
									type="text" 
									value={ address }
									onChange = { e => handleChangeAddress(e) }
								/>
							</Form.Item>
						</div>
						<div className="row marginTop2percent">
							<div className="col-6">
								<Form.Item
									name  = "CodePostal"
									rules = {[
										{
											message: codePostalError,
											validator: ( value ) => {
												if ( codePostalError ) {
													return Promise.reject( codePostalError );
												} 
												else {
													return Promise.resolve();
												}
											}
										}
									]}
									initialValue  = { codePostal }
								>
									<Input 
										name  = "codePostalInput"
										className="backgroundYellow  borderRadius18 width100per100 borderNone height40"  
										placeholder={ profileIdentity_codePostalPlaceholder }
										type="text" 
										value={ codePostal }
										onChange = { e => handleChangeCodePostal(e) }
									/>
								</Form.Item>
							</div>
							<div className="col-6">
								<Form.Item
											
											name  = "country"
											rules = {[
												{
													message: countryError,
													validator: ( value ) => {
														if ( countryError ) {
															return Promise.reject( countryError );
														} 
														else {
															return Promise.resolve();
														}
													}
												}
											]}
											initialValue  = { countrySelected ? countrySelected : countryDefault }
										>
											<Select
												variant="borderless"
												className="custom-select-rounded"
												style={{ width: '100%' }}
												bordered={false}
												value			= { countrySelected }
												onChange		= { e => handleChangeCountrySelected( e ) }
												showSearch
												optionFilterProp="label"
												filterSort={(optionA, optionB) =>
												  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
												}
												options = { BuildCountriesOptions() }
												notFoundContent = { countryDefault }
											/>
										</Form.Item>
							</div>
						</div>
						<div style={{ display: showStatesCities }} className="row marginTop2percent">
								<div className="col-6">
									<Form.Item
											name  = "state"
											rules = {[
												{
													message: stateError,
													validator: ( value ) => {
														if ( stateError ) {
															return Promise.reject( stateError );
														} 
														else {
															return Promise.resolve();
														}
													}
												}
											]}
											initialValue  = { stateSelected ? stateSelected : stateDefault }
										>
											<Select
												variant="borderless"
												className="custom-select-rounded"
												style={{ width: '100%' }}
												value			= { stateSelected }
												onChange		= { e => handleChangeStateSelected( e ) }
												showSearch
												optionFilterProp="label"
												filterSort={(optionA, optionB) =>
												  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
												}
												options = { BuildStatesOptions() }
												notFoundContent = { stateNotFound }
											/>
										</Form.Item>
								</div>
								<div className="col-6">
									<Form.Item
											name  = "city"
											rules = {[
												{
													message: cityError,
													validator: ( value ) => {
														if ( cityError ) {
															return Promise.reject( cityError );
														} 
														else {
															return Promise.resolve();
														}
													}
												}
											]}
											initialValue  = { citySelected ? citySelected : cityDefault }
										>
											<Select
												variant="borderless"
												className="custom-select-rounded"
												size 		 	= 'middle'
												value			= { citySelected }
												onChange		= { e => handleChangeCitySelected( e ) }
												showSearch
												optionFilterProp="label"
												filterSort={(optionA, optionB) =>
												  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
												}
												options = { BuildCitiesOptions() }
												notFoundContent = { cityNotFound }
											/>
										</Form.Item>
								</div>
						</div>
					</>
					
					}

					{ 
						fieldName == "Animaux" &&
						<>	
							
							<Form.Item
								
										name  = "AnimalName"
										rules = {[
											{
												message: animalNameError,
												validator: ( value ) => {
													if ( animalNameError ) {
														return Promise.reject( animalNameError );
													} 
													else {
														return Promise.resolve();
													}
												}
											}
										]}
										initialValue  = { animalName }
									>
										<Input 
											name  = "animalNameInput"
											className="row backgroundYellow borderRadius18 height40 width100per100 birthdateField borderNone" 
											placeholder={ profileAnimal_animalNamePlaceHolder }
											type="text" 
											value={ animalName }
											onChange = { e => handleChangeAnimalName(e) }
										/>
							</Form.Item>
							
							<div className="row marginTop5px">
								<div className="col-6">
									<Form.Item
										className = "backgroundYellow borderRadius18 height40"
										name  = "animalMale"
									>
										<div className='row'>
											<div className='col-1' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
													<label className='custom-checkbox-container'>
													<Input
														className='custom-checkbox'
														type="checkbox" 
														name="animalSexeType02"
														id="animalSexeType1"
														value={ 1 }
														defaultChecked= { animal.sexeId == 1 ? true : false }
														onChange = { e => handleChangeAnimalSexes(1) }
													 />
													 </label> 
											</div>
											<div className='col-9' width100per100 style={{lineHeight: '1.0', paddingTop: '4%'}}>
													Male
											</div>
										
										</div>
									</Form.Item>
								</div>
								<div className="col-6">
									<Form.Item
										className = "backgroundYellow borderRadius18 height40"
										name  = "animalFemale"
									>
										<div className='row'>
											<div className='col-2' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
													<label className='custom-checkbox-container'>
													<Input
														className='custom-checkbox'
														type="checkbox" 
														name="animalSexeType02"
														id="animalSexeType2"
														value={ 2 }
														defaultChecked= { animal.sexeId == 2 ? true : false }
														onChange = { e => handleChangeAnimalSexes(2) }
													 />
													 </label> 
											</div>
											<div className='col-9' width100per100 style={{lineHeight: '1.0', paddingTop: '5%'}}>
													Female
											</div>
										
										</div>
									</Form.Item>
								</div>
								<div style={{ display: formError06 }} className="row formError formError06">
										<span id="cmp_vetonest">
											Choose a sex for your animal
										</span> 
								</div>
							</div>
							<div className="row backgroundYellow borderRadius18 height40 width100per100 birthdateField dateSelector">
								<div className="col-6">
									<span id="cmp_vetonest.com_Eou9HL3uHS">Animal Birth date &nbsp; { animalDateNaissance }</span>
								</div>
								<div className="col-6 justify-content-end dateField">
									<ConfigProvider 
										locale={ getDatePickerlocale() }
										theme={{ token: { colorPrimary: '#FFDE59', border: 'none' } }} 
									>
										<DatePicker 
											defaultValue={ datePickerDefaultValue }
											onChange={ (e) => handleAnimalBirthDateChange(e) }
										/>
									</ConfigProvider>
								</div>
								<div style={{ display: formError07 }} className="row formError formError07">
										<span id="cmp_vetonest">
											Choose a birth date for your animal
										</span> 
								</div>
							</div>
							<div className="marginTop2percent birthdateField">
								<Form.Item
												name  = "Espece"
												rules = {[
													{
														message: animalEspeceError,
														validator: ( value ) => {
															if ( animalEspeceError ) {
																return Promise.reject( animalEspeceError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												/* initialValue  = { especeSelectedId ? especeSelectedId : especeDefault } */
											>
												<Select
													variant="borderless"
													className="custom-select-rounded backgroundYellow height40 birthdateField borderNone" 
													bordered={false}
													value			= { especeSelectedId }
													onChange		= { e => handleChangeAnimalEspece( e ) }
													showSearch
													optionFilterProp="label"
													filterSort={(optionA, optionB) =>
													  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
													}
												>
													{
														especes.map(( v, k ) => (
															<Option key={v.id} value={v.id}>
																{v.nom}
															</Option>
														))
													}
												</Select>
											</Form.Item>
							</div>
							<div style={{ display: formError08 }} className="row formError formError08">
										<span id="cmp_vetonest">
											Select your animal specie
										</span> 
							</div>
							
							<div style={{ display: showBreeds }} className="marginTop2percent">
									<Form.Item
												name  = "Race"
												rules = {[
													{
														message: animalRaceError,
														validator: ( value ) => {
															if ( animalRaceError ) {
																return Promise.reject( animalRaceError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												/* initialValue  = { raceSelectedId ? raceSelectedId : raceDefault } */
											>
												<Select
													variant="borderless"
													className="custom-select-rounded backgroundYellow height40 birthdateField borderNone" 
													bordered={false}
													value			= { raceSelectedId }
													onChange		= { e => handleChangeAnimalRace( e ) }
													showSearch
													optionFilterProp="label"
													filterSort={(optionA, optionB) =>
													  (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
													}
												>
													{
														races.map(( v, k ) => (
															<Option key={v.id} value={v.id}>
																{v.nom}
															</Option>
														))
													}
													
												</Select>
											</Form.Item>
								
								</div>
							
								<div style={{ display: formError09 }} className="row formError formError09">
										<span id="cmp_vetonest">
											Select your animal breed
										</span> 
								</div>
								<div className="row marginTop2percent">
								<div className="col-6">
									<Form.Item
										className = "backgroundYellow borderRadius18 height40"
										name  = "haveNoInsurance"
									>
										<div className='row' >
											<div className='col-2' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
												<label className='custom-checkbox-container'>
												<Input
													className='custom-checkbox'
													type="checkbox" 
													name="animalInsuranceType01"
													id="animalInsuranceType1"
													value={ 1 }
													defaultChecked= { animal.insuranceId == 1 ? true : false }
													onChange = { e => handleChangeAnimalInsurances(1) }
													style={{ outline: 'none' }}
												 />
												 </label> 
											</div>
											<div className='col-9' width100per100 style={{lineHeight: '1.0', paddingTop: '2%'}}>			
												Mon animal ne possede pas une assurance
											</div>
										</div>
									</Form.Item>
								</div>
								
								<div className="col-6">
									<Form.Item
										className = "backgroundYellow borderRadius18 height40"
										name  = "haveInsurance"
									>
										<div className='row' >
											<div className='col-2' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
												<label className='custom-checkbox-container'>
												<Input
													className='custom-checkbox'
													type="checkbox" 
													name="animalInsuranceType02"
													id="animalInsuranceType2"
													value={ 2 }
													defaultChecked= { animal.insuranceId == 1 ? true : false }
													onChange = { e => handleChangeAnimalInsurances(2) }
													style={{ outline: 'none' }}
												 />
												 </label> 
											</div>
											<div className='col-9' width100per100 style={{lineHeight: '1.0', paddingTop: '2%'}}>
												Mon animal possede une assurance
											</div>
										</div>
									</Form.Item>
									<div style={{ display: formError10 }} className="row formError formError10">
										<span id="cmp_vetonest">
											Your animal insurance
										</span> 
									</div>
								</div>
							</div>
							<Form.Item
								
										name  = "AnimalPhoto"
										rules = {[
											{
												message: animalPhotoError,
												validator: ( value ) => {
													if ( animalPhotoError ) {
														return Promise.reject( animalPhotoError );
													} 
													else {
														return Promise.resolve();
													}
												}
											}
										]}
										initialValue  = { animalPhoto }
									>
									<div className="row justify-content-center marginTop10px">
										<Dragger {...props} > 
											<i class="fa fa-camera" aria-hidden="true"></i> Modifier
										</Dragger> 
									</div>
									<div className="align-items-center">
										<img 
											id="animalPhotoId" 
											src={ animalPhoto } 
										/>
									</div>
							</Form.Item>
						</>
					
					}

					{ 
						fieldName == "Email" &&
							<Form.Item
								name  = "email"
								rules = {[
									{
										message: signUpEmailError,
										validator: ( value ) => {
											if ( signUpEmailError ) {
												return Promise.reject( signUpEmailError );
											} 
											else {
												return Promise.resolve();
											}
										}
									}
								]}
								initialValue  = { '' }
							>
								<Input 
									name  = "emailInput"
									className="backgroundYellow borderRadius18 width100per100 borderNone height40" 
									placeholder={ signUp_emailPlaceholder }
									type="text" 
									value={ signUpEmail }
									onChange = { e => handleChangeEmail(e) }
								/>
							
							</Form.Item>
						
					}
					
					{
						fieldName == "PasswordReset" &&
						<>
							
								<Form.Item
												name  = "password"
												rules = {[
													{
														message: pwResetPasswordError,
														validator: ( value ) => {
															if ( pwResetPasswordError ) {
																return Promise.reject( pwResetPasswordError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												/* initialValue  = '' */
								>
												<Input 
													id="pwResetPasswordInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_passwordPlaceholder }
													type="password" 
													name="password"
													value={ pwResetPassword }
													onChange = { e => handleChangePwResetPassword(e)}
												/>
								</Form.Item>

								<Form.Item
												name  = "passwordRepeat"
												rules = {[
													{
														message: pwResetPasswordRepeatError,
														validator: ( value ) => {
															if ( pwResetPasswordRepeatError ) {
																return Promise.reject( pwResetPasswordRepeatError );
															} 
															else {
																return Promise.resolve();
															}
														}
													}
												]}
												initialValue  = ''
								>
									<Input 
													id="pwResetPasswordRepeatInput"
													className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
													placeholder={ signUp_passwordRepeatPlaceholder 
													} 
													type="password" 
													name={ signUpPasswordRepeat }
													value={ pwResetPasswordRepeat }
													onChange = { e => handleChangePwResetPasswordRepeat(e)}
									/>
												
								</Form.Item>
								
								<div style={{ display: formError01 }} className="row formError formError02">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Password is empty
											</span> 
										</div>
										<div style= {{ display: formError02 }}  className="row formError formError04">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Password repeat is empty
											</span> 
										</div>
										<div style= {{ display: formError03 }}  className="row formError formError05">
											<span id="cmp_vetonest.com_4LbLKwutmz">
												Please check your network
											</span> 
							</div>
						
							</>
						
						
						
					}
					
					{ fieldName == "FirstName" &&
						<Form.Item
							name  = "firstName"
							
							rules = {[
								{
									message: firstNameError,
									validator: ( value ) => {
										if ( firstNameError ) {
											return Promise.reject( firstNameError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
							initialValue  = { userProfile.prenom }
						>
							<Input 
								name  = "firstNameInput"
								className="backgroundYellow  borderRadius18 width100per100 borderNone height40" 
								placeholder={ signUp_firstNamePlaceholder }
								type="text" 
								value={ firstName }
								onChange = { e => handleChangeFirstName(e) }
							/>
						</Form.Item>
					}
					{ fieldName == "Sexes" &&
						<div className="row" style={{width: '103%'}}>
							<div className="col-6">
								<Form.Item
									className = "backgroundYellow borderRadius18 height40"
									name  = "male"
								>
									<div className='row' >
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											Male
										</div>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											<Input
												className=''
												type="checkbox" 
												name="signUpTypeUser"
												id="sexeType1"
												value={ 1 }
												defaultChecked= { userProfile.userSexeId == 1 ? true : false }
												onChange = { e => handleChangeSexes(1) }
												style={{ outline: 'none' }}
											 />
										</div>
									</div>
								</Form.Item>
							</div>
							<div className="col-6">
								<Form.Item
									className = "backgroundYellow borderRadius18 height40"
									name  = "female"
								>
									<div className='row'>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											Female
										</div>
										<div className='col-6' style={{paddingTop: '4%',  paddingLeft: '14%'}}>
											<Input
												type="checkbox" 
												name="signUpTypeUser"
												id="sexeType2"
												value={ 2 }
												defaultChecked= { userProfile.userSexeId == 2 ? true : false }
												onChange = { e => handleChangeSexes(2) }
												style={{ outline: 'none' }}
											 />
										</div>
									</div>
								</Form.Item>
							</div>
						</div>
					}
					{ fieldName == "BirthDate" &&
						<DatePicker 
							onChange={ (e) => handleBirthDateChange(e) } 
						/>
					}
					{ fieldName == "Biography" &&
						<Form.Item
							name  = "biography"
							style = {{ marginBottom: '0px' }}
							rules = {[
								{
									message: biographyError,
									validator: ( value ) => {
										if ( biographyError ) {
											return Promise.reject( biographyError );
										} 
										else {
											return Promise.resolve();
										}
									}
								}
							]}
						>
							<TextArea 
								type		= "text" 
								className	= "" 
								placeholder	= "About you"
								value		= { biography }
								onChange	= { e => handleChangeBiography( e ) }
								style		= {{
												width: '100%', 
												height: '90px'
								}}
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
							{ user.profileTypeId == 1 ? signUp_popConfirmPetDescription : signUp_popConfirmVetDescription
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

export default ModalProfileIdentity;
