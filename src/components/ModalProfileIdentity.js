import React, { useState, useEffect, useContext } from "react";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { SiteContext } from "../context/site";
import locale_fr from 'antd/locale/fr_FR';
import locale_en from 'antd/locale/en_US';
import locale_es from 'antd/locale/es_ES';
import locale_de from 'antd/locale/de_DE';
import locale_it from 'antd/locale/it_IT';
import { Form, Input, Select, Checkbox, List } from 'antd';
import { Space,  DatePicker, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';

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
		siteLocale
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

	// user language
	const data = [
		{
			title: "Ant Design Title 1"
		},
		{
			title: "Ant Design Title 2"
		},
		{
			title: "Ant Design Title 3"
		},
		{
			title: "Ant Design Title 4"
		}
	];

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

		// an update
		// if( !isNew ){
			
		// }
// {"id":9,"langue":[],"nom":null,"prenom":null,"sexe":null,"phone":null,"picture":"68a8d36cc7728.jpg","biography":null,"codePostal":null,"adresse":null,"dateNaissance":null,"dateCreated":{"date":"2025-08-04 02:23:42.000000","timezone_type":3,"timezone":"UTC"}}
		
		const sendData = {
			nom: 				name,
			prenom:				firstName,
			sexeId:				sexe ? sexe : userProfile.userSexeId,
			profileUserId: 		profileId,
			dateDeNaissance: 	dateDeNaissance,
			biographie: 		biography
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

	const [ fieldName, setFieldName ] = useState( '' );
	const [ dateNaissance, setDateNaissance ] = useState( '' );
	
	// user language selector
	const [checked, setChecked] = useState([]);
	const [indeterminate, setIndeterminate] = useState(false);
	const [checkAll, setCheckAll] = useState(false);
	const onCheckAllChange = (e) => {
		setChecked(e.target.checked ? data.map((item) => item.title) : []);
		setCheckAll(e.target.checked);
	};
	useEffect(() => {

		// reset the form
		form.resetFields();
		// user language selection
		setIndeterminate(checked.length && checked.length !== data.length);
		setCheckAll(checked.length === data.length);

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
			// const sexe = userProfile.sexe;
			// const elt = await window.document.getElementById( 'sexeType' + sexe );
			// if( elt )
				// elt.click()

		}
		a()

	}, [ visibleModalName, userProfile, checked ]); // Dependency array ensures effect runs when isModalOpen changes

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
						/* maxHeight: '400px', */
						/* overflowY: 'auto', */
						width: '98%',
						paddingLeft: '5%',
						paddingRight: '5%',
					},
				}}
			>
				
				<Form 
					className=""
					form = {form}
					/* initialValues={{ PaypalEmail: 'john.doe@example.com' }} */
				>
					<div className="row">
					{ fieldName == "Profile" &&
					<div className="row">	
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
							</div>
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
								<span>Birth date: &nbsp; { dateNaissance }</span>
							</div>
							<div className="col-6 justify-content-end dateField">
								<ConfigProvider locale={ getDatePickerlocale() }>
									<DatePicker 
										onChange={ (e) => handleBirthDateChange(e) }
									/>
								</ConfigProvider>
							</div>
						</div>
						<div className="row">
							  <Checkbox
								indeterminate={indeterminate}
								onChange={onCheckAllChange}
								checked={checkAll}
							  >
								Check all
							  </Checkbox>
							  <Checkbox.Group
								style={{ width: "100%" }}
								value={checked}
								onChange={(checkedValues) => {
								  setChecked(checkedValues);
								}}
							  >
								<List
								  itemLayout="horizontal"
								  dataSource={data}
								  renderItem={(item) => (
									<List.Item>
									  <List.Item.Meta
										avatar={<Checkbox value={item.title} />}
										title={<a href="https://ant.design">{item.title}</a>}
										description="Ant Design, a design language for background applications, is refined by Ant UED Team"
									  />
									</List.Item>
								  )}
								/>
							  </Checkbox.Group>
							  <div style={{ marginTop: 20 }}>
								<b>Selecting:</b> {checked.join(", ")}
							  </div>

						</div>
					</div>
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
					</div>
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
