import React, { useState, useEffect, useContext } from "react";
// import { Modal } from 'react-responsive-modal';

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
import ModalRemovePaymentMethod from '../ModalRemovePaymentMethod';
import ModalRemoveAnimal from '../ModalRemoveAnimal';
import SingleFieldManager from '../SingleFieldManager';
// import ModalEmailValidate from '../ModalEmailValidate';

import LanguageSelector from '../LanguageSelector.js';
import CurrencySelector from '../CurrencySelector.js';
import Title from '../Title';



const Profile = ( params ) => {
	// context
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
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
	} = useContext( SiteContext );

	const [ profile, setProfile ] = useState( '' );
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );
	
	// const [ formUpdated, setFormUpdated ] = useState( '' );
	// const [ paymentMethods, setPaymentMethods ] = useState( [] );
	const [ userTotalAnimal, setUserTotalAnimal ] = useState( 0 );
	
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


	// date formater
	// const [ siteLocale, setSiteLocale ] = useState( 'en-EN' );
	
	const [ name, setName ] 			= useState( '' );
	const [ firstName, setFirstName ] 	= useState( '' );
	const [ dateNaissance, setDateNaissance ] = useState( '' );
	const [ biography, setBiography ] = useState( '' );
	const [ profileNom, setProfileNom ] = useState( '' );
	useEffect(() => {
		// get user profile info
		const a = async () => {
console.log( '>>> user', user );
console.log( 'profileId: ' + profileId + 'profileTypeId: ' + profileTypeId );
			const profile = await profileGet( profileId, profileTypeId );
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
// console.log( 'userProfile', userProfile );
			const profileNom = userProfile.nom && truncateString( userProfile.nom, 12 );
			setProfileNom( profileNom )
		}
		a();
	}, [ visibleModalName, profileFormUpdated ] ); // Dependency array ensures effect runs when changes

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
	}, [profileFormUpdated] );

	// build pets list
	const BuildUserPetsList = () =>{
		if( !userPets.length ) 
			return
		
		return(
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
		)
	}

	// form
	const [form] = Form.useForm();

	return (
		<>
			<Header />
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
			<ModalRemovePaymentMethod />
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
