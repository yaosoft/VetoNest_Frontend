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
import ModalPaymentMethodPaypal from '../ModalPaymentMethodPaypal';
import ModalRemovePaymentMethod from '../ModalRemovePaymentMethod';

// import ModalEmailValidate from '../ModalEmailValidate';

import LanguageSelector from '../LanguageSelector';
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
		paymentMethodList,
		setModalPaymentMethodPaypalOpen,
		modalPaymentMethodPaypalOpen,
		setModalRemovePaymentMethodOpen,
		modalRemovePaymentMethodOpen,
		userPaymentMethodList,
		userPaymentMethodEdit,
		userPaymentMethodRemove,
		userPaymentMethods,
		setUserPaymentMethods,
		setIsNew,
		isNew,
		// setSelectedUserPaymentMethodId
		setSelectedPaymentMethod,
		// selectedPaymentMethod,
	} = useContext( SiteContext );

	const [ profile, setProfile ] = useState( '' );
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );
	const [ formUpdated, setFormUpdated ] = useState( '' );
	const [ paymentMethods, setPaymentMethods ] = useState( [] );
	
	
	const [ selectedLanguageId, setSelectedLanguageId ] = useState( user ? user.languageId : defaultLanguageId ); 
	
	const [ spin, setSpin ] = useState( 'none' );
	
	useEffect( () => {
		// get all paymentMethodList
		const getPaymentMethods = async() => {
			const paymentMethods = await paymentMethodList();
console.log( 'getPaymentMethods', paymentMethods );			
			setPaymentMethods( paymentMethods );
		}
		
		// get user paymentMethod
		const getUserPaymentMethods = async() => {
			const paymentMethods = await userPaymentMethodList( userId );
console.log( 'userPaymentMethodList', paymentMethods );			
			setUserPaymentMethods( paymentMethods );
		}
		getUserPaymentMethods();
		getPaymentMethods();
	 }, [user, modalPaymentMethodPaypalOpen, modalRemovePaymentMethodOpen] );

	// check if user have this payment method. If true, return user paiment method object
	const isUserMethod = ( paymentMethodId ) => {

		const rep = userPaymentMethods.filter( e => e.paymentMethodId == paymentMethodId )

		if( rep.length ){

			return rep[0]
		}
		else{	 	// new

			return false
		}
	}

	// File upload
	const { Dragger } = Upload;
	const [ uploading, setUploading ] = useState(false);
	const [ photoError, setPhotoError ] = useState( '' );
	const [ profilePhoto, setProfilePhoto ] = useState('');
	const [ fileList, setFileList ] = useState([]);
	const [ fileListToPost, setFileListToPost ] = useState( [] );
	const [ showUploadList, setShowUploadList ] = useState( false );
	const [ photoUri, setPhotoUri ] = useState('');
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
		const profileIdType = profileTypeId == 1 ? 'profileUserId' : 'profileVetoId';
		var data = {};
		data[ profileIdType ] = profileId;
		const rep = await profileUpdate ( data, profilePhoto, profileTypeId );
		
		if( rep ){
			message.success( 'Updated!' );
			const random = generateRandomDigits(3);
			setFormUpdated( random );
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
	
	// Build paiement list
	const BuildPaymentList = () => {
		return(
			paymentMethods.map(( paymentMethod, index ) => 
				<div key = { index } className= "row">
					<img 
						src={ '/img/paymentMethod/' + paymentMethod.image } 
						className="profilePaymentMethodIcon"
					/>
					&nbsp;<span>{ paymentMethod.name }</span>&nbsp;
					<span>
						{ isUserMethod( paymentMethod.id ) === false ?
							<a 
								onClick={ ( e ) => handleClickSettingPaymentMethod( paymentMethod, false ) }
							>
								setting
							</a>
							:
							<>
								<a 
									onClick={ ( e ) => handleClickSettingPaymentMethod( paymentMethod, true ) }
								>
									Edit 
								</a>

								<a 
									onClick={ ( e ) => handleClickRemoveUserPaymentMethod( paymentMethod ) }
								>
									&nbsp;remove 
								</a>
							</>
						}
					</span>
				</div>
			)
		)
	}


	// payment method setting button
	const handleClickSettingPaymentMethod = ( paymentMethod, isUserHave )  => { 

		setIsNew( !isUserHave ); // is user have this payment method
		if( paymentMethod.name == "PayPal" ){	// to do:		
			setModalPaymentMethodPaypalOpen( true )
		}
		setModalPaymentMethodPaypalOpen( true );
		setSelectedPaymentMethod( paymentMethod );
	} 


	const handleClickRemoveUserPaymentMethod = ( paymentMethod )  => {
		// get user payment method
		setSelectedPaymentMethod( paymentMethod );
		setModalRemovePaymentMethodOpen( true )
		// removePaymentMethodOpen( userPaymentMethodId )
	}

	useEffect(() => {
		// get user profile info
		const a = async () => {
			const profile = await profileGet( profileId, profileTypeId );
			
			setProfile( profile );
console.log( 'profile', profile );
console.log( 'userId', userId );
		}
		a();
	}, [ formUpdated ] ); // Dependency array ensures effect runs when isModalOpen changes



	function getBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	// form
	const [form] = Form.useForm();
	return (
		<>
			<Modal
				title={
				  <>
					<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} /> 
					<span>Modifier voter photo</span> 
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
			<ModalPaymentMethodPaypal />
			<ModalRemovePaymentMethod />
			<Header />
			
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			
			<Title title = { 'Profile - Travaux en cours' } />
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
										src={ profile.picture ? 
											base_url + 'uploads/files/profile/' + profile.picture: 
											photoDefaultSrc 
										} 
										style={{ width: '95%' }} 
									/>
							</div>
							<div className="row justify-content-center marginTop10px">
								<Dragger {...props} > 
									<i class="fa fa-camera" aria-hidden="true"></i> Modifier
								</Dragger> 
							</div>
						</div>
						<div className="col-md-9">
							
							<div className="row">
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Preference</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Langue
										</div>
										<div className="row profileLanguageSelector">
											<LanguageSelector 
												toPersist 	= { true } 
												flag 		= { false }
												context		= { false }
											/>
										</div>
									</div>
								</div>
								<div className="col-md-6 row">
									<div className="col-md-3">
										<b>Payment</b>
									</div>
									<div className="col-md-9">
										<div className="row">
											Payment Method
										</div>
										<div className="row">
											<div className="col-md-9">
												<BuildPaymentList/>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row backgroundYellow">&nbsp;</div>
								<div className="profilePhotoId">
								<div className="col-md-6 row">
									<div className="col-md-3">
										Preference.
									</div>
									<div className="col-md-9">
										<div className="col-md-3">
											Langue.
										</div>
										<div className="col-md-9">
											user.languageId
										</div>
										<div className="col-md-3">
											Foo.
										</div>
										<div className="col-md-9">
											bar<br/>
											baz<br/>
										</div>
									</div>
								</div>
								<div className="col-md-6 row">
									<div className="col-md-3">
										Preference.
									</div>
									<div className="col-md-9">
										<div className="col-md-3">
											Langue.
										</div>
										<div className="col-md-9">
											user.languageId
										</div>
										<div className="col-md-3">
											Foo.
										</div>
										<div className="col-md-9">
											bar<br/>
											baz<br/>
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
