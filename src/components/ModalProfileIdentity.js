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


const ModalProfileIdentity = ( params ) => {
	
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
	} = useContext( AuthContext );

	const { 
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
		profileIdentity_sexeErrorText,
		setProfileFormUpdated,
		generateRandomDigits,
		siteLanguage,
		dateFormater,
		siteLocale,
		languageList,
		language_french,
		language_english,
		language_spanish,
		language_german,
		language_italian,
		language_estonian,
		profileIdentity_addressPlaceholder,
		profileIdentity_addressErrorText,
		profileIdentity_codePostalErrorText,
		profileIdentity_codePostalPlaceholder,
		profileIdentity_villePlaceholder,
		profileIdentity_villeErrorText,
		profileIdentity_countryDefault,
		profileIdentity_stateDefault,
		profileIdentity_cityDefault,
	} = useContext( SiteContext );

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
	const nameValidator = ( name ) => {
		const rep = /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?(\s)?)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test( name );
		return rep
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

	// Birth date
	const [ dateDeNaissance, setDateDeNaissance ] = useState( '' );
	const handleBirthDateChange = ( date, dateString ) => {
		console.log( 'date', date.format('YYYY-MM-DD') );
		// const day 	= dateString.$D;
		// const month = dateString.$M;
		// const year 	= dateString.$y;
		const dateStr = date.format('YYYY-MM-DD');
		if( dateStr < "2020-01-01" )						// todo: dynamic
			setDateDeNaissance( dateStr )
		else
			message.error( 'Age limit of 10 is not reached' )	// todo
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
		
			codePostalErrorText = 'foo'; // profileIdentity_codePostalErrorText;
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

	// save
	const handleClickSave = async () => {

		// setSignUpSpin( 'block' );

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
			profileUserId: 		profileId,
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
	const [ languageOptions, setLanguageOptions ] = useState([]);
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
	useEffect(() => {

		// reset the form
		form.resetFields();
		
		// set the countries
		const allCountries = Country.getAllCountries();
		var countries = Array();
		// Add an id property to the countries array for and Select to work
		for( const country of allCountries ){ 
			country.id = country.isoCode;
			countries.push( country );
		}
		setCountries( countries );
		
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
			// site languages
			const siteLanguages = await languageList();
			const languages 	= await siteLanguages.map( ( v, k ) => ( { label: eval( v.tagClass ), value: v.id } ) );
			setLanguageOptions( languages );
			// user language
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
		}
		a()

	}, [ visibleModalName, userProfile ]); // Dependency array ensures effect runs when isModalOpen changes

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
				// footer={[
				  // <Button key="submit" type="primary" onClick={ handleClickSave }>
					// Submit
				  // </Button>,
				// ]}
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
						<div className="row backgroundYellow borderRadius18 height40 width100per100 birthdateField">
							<div className="col-6">
								<span>Birth date &nbsp; { dateNaissance }</span>
							</div>
							<div className="col-6 justify-content-end dateField">
								<ConfigProvider locale={ getDatePickerlocale() }>
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
								<Select
									mode="multiple"
									style={{ width: '100%' }}
									placeholder="Select languages"
									value={selectedLanguages}
									onChange={handleChangeLanguage}
								>
									{ languageOptions.map((option) => (
										<Option key={option.value} value={option.value}>
										  <Checkbox checked={selectedLanguages.includes(option.value)}>
											{option.label}
										  </Checkbox>
										</Option>
									 ))}
								</Select>
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
							<div className="col-6 backgroundYellow borderRadius18 height40 width100per100 birthdateField">
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
								<div className="col-6 backgroundYellow borderRadius18 height40 width100per100 birthdateField">
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
												bordered={false}
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
								<div className="col-6 backgroundYellow borderRadius18 height40 width100per100 birthdateField">
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
												bordered={false}
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
					
					
					{ fieldName == "Name" &&
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
							initialValue  = { userProfile.nom }
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
			
			</Modal>
			<div className="displayNone" >
					<span 
						className ="cmp_vetonest.com_Af92YTwI3c signUp_correctErrors" 
					>
						Please correct the errors before continuing.
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
						id = "cmp_vetonest.com_rkqxGE9X35"
						className ="signUp_nameEmpty" 
					>
						Name is empty.
					</span>
					<span 
						id = "cmp_vetonest.com_03jgEtJiVa"
						className ="signUp_firstNamePlaceholder" 
					>
						First name
					</span>
					<span 
						id = "cmp_vetonest.com_wc4hVvXB3N"
						className ="signUp_namePlaceholder" 
					>
						Name
					</span>
			</div>
		</>
	);
};

export default ModalProfileIdentity;
