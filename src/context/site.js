import PropTypes from 'prop-types'
import { createContext, useState, useEffect, useContext } from 'react'
import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Image, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';


export const SiteContext = createContext();
export const SiteProvider = ({ children }) => {

	// spiner
	const [ spiner, setSpiner ] = useState( 'none' );

	// helper: Fetch data definition
	async function fetchData( url, data, method ) {
		// if( !isOnline ){
// message.error( 'No network!' );
		//	return false;
		// }

		const response = await fetch( url, {
			method: method, // *GET, POST, PUT, DELETE, etc.
			// mode: "no-cors", // no-cors, *cors, same-origin
			headers: {
				"Content-Type": "application/json",
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			...( method == 'POST' && { body: JSON.stringify( data ), } )
		});
// console.log( '+++++++++++++++++ response', response );
		// setTimeout( setSpiner, 2000, 'none' );
		if( response.status != 200 ){
			return false;
		}
		
		if( response.status == 200 ){
			return response.json(); // parses JSON response into native JavaScript objects
		}
		
	}
	
	// Email verification code
	const [ verificationCode, setVerificationCode ] = useState( localStorage.getItem( 'verificationCode' ) ? JSON.parse( localStorage.getItem( 'verificationCode' ) ) : '' );

	// User Id
	const [ verificationUserId, setVerificationUserId ] = useState( localStorage.getItem( 'verificationUserId' ) ? JSON.parse( localStorage.getItem( 'verificationUserId' ) ) : '' );

	// Backend api url 
	// const base_api_url = 'http://localhost/vetonest_backend/public/index.php/api/'; // dev
	const base_api_url = 'https://backend.vetonest.com/api/'// prod 

	// Backend public url 
	// const base_url = 'http://localhost/vetonest_backend/public/'; // dev
	const base_url = 'https://backend.vetonest.com/'// prod 

	const [ siteDomainName, setSiteDomainName ] = useState( 'vetonest.com' );
	const [ siteName, setSiteName ] = useState( 'VetoNest' );
	const [ siteUrl, setSiteUrl ] 	= useState( 'http://vetonest.com' );
	const [ siteEmail, setEmail ] 	= useState( 'info@vetonest.com' );

	// site
	const [ site, setSite ] = useState( {} );
	// set user referrer before redirection to login page
	const setReferrer = ( url ) => {
		site[ 'referrer' ] = url;
	}
	
	// get user referrer
	const getReferrer = () => {
		return site.referrer;
	}

	// check if email is not already registered
	const checkEmail = async ( email ) => {
		const url	= base_api_url + 'user/email/check';
		
		const data 		= email;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep	 	= await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// send an email 
	const sendEmail = async ( sendEmailData ) => {
		const url	= base_api_url + 'user/send';

		const data 		= sendEmailData;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		
		return rep;
	}

	// signup
	const signUp = async ( signupData ) => {
		const url	= base_api_url + 'user/create';

		const data 		= signupData;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update email address
	const updateEmail = async ( emailData ) => {
		const url	= base_api_url + 'user/update/email';

		const data 		= emailData;
		const method	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	
	// signin
	const signIn = async ( signinData ) => {
		const url		= base_api_url + 'user/login';
		const data 		= signinData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update password
	const updatePassword = async ( updatePasswordData ) => {
		const url		= base_api_url + 'user/password/save';
		const data 		= updatePasswordData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update default language
	const updateLanguagePreference = async ( languagePreferenceData ) => {
		const url		= base_api_url + 'profile/language/preference/update';
		const data 		= languagePreferenceData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	const [ profileFormUpdated, setProfileFormUpdated ] = useState( '' );

	// List all languages
	const languageList = async () => {
		const url		= base_api_url + 'langue/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// List all site countries
	const countryList = async () => {
		const url		= base_api_url + 'pays/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		return rep;
	}

	// list all pays villes
	const getPaysVilles = async ( countryId ) => {
		const url		= base_api_url + 'pays/villes?countryId=' + countryId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		return rep;
	}

	// list all payment's method
	const paymentMethodList = async () => {
		const url		= base_api_url + 'paymentMethod/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Generate random digits
	const generateRandomDigits = (n) => {
		// const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const characters = '123456789';
		let result = '';
		for (let i = 0; i < n; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters.charAt(randomIndex);
		}
		return result;
	}

	const defaultLanguageId   = 1; // fr
	const defaultLanguageCode = 'fr'; // fr
	const [ siteLanguage, setSiteLanguage ] = useState( '' );
	const [ languageFlag, setLanguageFlag ] = useState( '' );
	const languageSetup = async ( languageId ) => {
		const languages = await languageList();
// console.log( languageId );		
		const language = await languages.filter( e => e.id == languageId )[0];
// console.log( language );
		const languageCode = language ? language.languageCode : defaultLanguageCode;
		const flag = '/img/flags/' + languageCode + '.svg';
// console.log( 'Flag, ' + flag );	

		setLanguageFlag( flag );
		setSiteLanguage( languageCode );
		setSiteLocale( languageCode ? languageCode + '-' + languageCode.toUpperCase() : 'fr-FR' ); // en-En
		

		// get content
		const siteContentData = {
			siteLanguage: languageCode,
		}
		const siteContent = await getSiteContent( siteContentData );

		setSiteContent( siteContent ); // to use in secondary DOMs ( modal )
		
	}

	const getLanguagePreference = async ( userData ) => {
		const url		= base_api_url + 'profile/language/preference/get/?userId=' + userData.userId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	const [ selectedLanguageId, setSelectedLanguageId ] = useState( defaultLanguageId ); 

	// Format date
	const [siteLocale, setSiteLocale] = useState( defaultLanguageCode + '-' + defaultLanguageCode.toUpperCase() );
	const formatter = new Intl.DateTimeFormat( siteLocale, {
		/*weekday: 'long',*/
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		/*hour: 'numeric',*/
		/*minute: 'numeric',*/
		/*second: 'numeric'*/
	});
	const dateFormater = async( rawDate ) => {
		const formatedDate = await formatter.format( new Date( rawDate ));
		return formatedDate;
	}

	const truncateString = (str, maxLength) => {
		if( !str )
			return

		if (str.length > maxLength) {
			// If the string is longer than maxLength,
			// slice it to maxLength - 3 characters
			// and append '...'
			return str.slice(0, maxLength - 3) + '...';
		}
		// If the string is not longer than maxLength, return it as is
		return str;
	}

	// const base_cmp_Url = "http://localhost/diamta-cmp_backend/public/index.php/api/"; // dev
	const base_cmp_Url = "https://cmp.diamta.com/api/"; // prod
	const [ siteContent, setSiteContent ] = useState( [] );
	const getSiteContent = async ( siteContentData ) => {
		const siteLanguage = siteContentData.siteLanguage;
		
		const url	= base_cmp_Url + 'tag_content/list/?domain=' + siteDomainName + '&languageCode=' + siteLanguage;

		const data		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );

// console.log( 'getSiteContent', rep );

		setSpiner( 'none' );
		return rep;
	}
	// Get a content from site siteContent.
	const getAContent = ( tagRef ) => {
		if( !siteContent.length )
			return '...'


		const content = siteContent.filter( v => v.tagRef == tagRef )[0];

		if( !content )
			return '***'

		if( !content.contents.length )
			return '***'

		return content.contents[0].textContent
	}
	
	// insert space at position x
	const insertSpaceAtPosition = ( originalString, position ) => {
	  // Ensure the position is within valid bounds
	  if (position < 0 || position > originalString.length) {
		console.warn("Position is out of bounds. No space inserted.");
		return originalString;
	  }

	  // Split the string into two parts and insert the space in between
	  const part1 = originalString.substring(0, position);
	  const part2 = originalString.substring(position);
// console.log(part1 + " " + part2);
	  return part1 + " " + part2;
	}

	// get a user profile
	const profileGet = async ( profileId, profileTypeId ) => {
		const type 		= profileTypeId == 1 ? 'profileUser' : 'profileVeto';
		const url		= base_api_url + type + '/show/?' + type + 'Id=' + profileId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	
	const [ userProfile, setUserProfile ] = useState( '' );

	// update user / veto profile
	const profileUpdate = async ( dataObj, picture, profileTypeId ) => {

		const type 	= profileTypeId == 1 ? 'profileUser' : 'profileVeto';
		const url	= base_api_url + type + '/edit';
		const method 	= 'POST';
		// const resp 		= await fetchData( url, data, method );

		const formData = new FormData();
		
		// Append file
		if( picture )
			formData.append('files[]', picture.originFileObj)

		// Append data
		for ( var key in dataObj ) 
			formData.append( key, dataObj[key] );

		// You can use any AJAX library you like
		setSpiner( 'block' );
		const resp = await fetch( url, {
			method: 'POST',
			body: formData,
		})
		setSpiner( 'none' );
		
		return resp;
	}

	// profile - active modal
	const [ visibleModalName, setVisibleModalName ] = useState( false );
	const [ visibleModalTitle, setVisibleModalTitle ] = useState( false );

	// profile payment modals
	const [ modalPaymentMethodOpen, setModalPaymentMethodOpen ] = useState( false );

	// profile payment modals
	const [ modalProfileIdentityOpen, setModalProfileIdentityOpen ] = useState( false );
	
	
	const [ isNew, setIsNew ] = useState( false ) 

	// Notifications - veto invitation to join a facility
	const getVetoInvitationNotification = async ( vetoProfileId ) => {
		const url		= base_api_url + 'vetoEtablissementStatus/invitationNotification/?vetoProfileId=' + vetoProfileId;
		const data 		= "";
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Notifications - post
	const postNotification = async ( notificationData ) => {
		const url		= base_api_url + 'notification/post';
		const data 		= notificationData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Notifications - post
	const notificationViewed = async ( notificationData ) => {
		const url		= base_api_url + 'notification/viewed';
		const data 		= notificationData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// profile - get user payment methods
	const userPaymentMethodList = async ( userId ) => {
		const url		= base_api_url + 'user/payment-method/list/?userId=' + userId;
		const data 		= "";
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// User payment methods
	const userPaymentMethodEdit = async ( userPaymentMethodObj ) => {
		const url		= base_api_url + 'user/payment-method/edit';
		const data 		= userPaymentMethodObj;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// profile remove animal modal
	const [ selectedAnimal, setSelectedAnimal ] = useState( '' );
	const [ modalRemoveAnimalOpen, setModalRemoveAnimalOpen ] = useState( false );
	const [ photoAnimalDefaultSrc, setPhotoAnimalDefaultSrc ] = useState( '/img/user/paw.png' );

	// profile - remove payment methods
	const userPaymentMethodRemove = async ( userPaymentMethodObj ) => {
		const url		= base_api_url + 'user/payment-method/remove';
		const data 		= userPaymentMethodObj;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	
	// Carnet animal - remove
	const carnetAnimalRemove = async ( carnetAnimal ) => {
		const url		= base_api_url + 'carnetAnimal/delete';
		const data 		= carnetAnimal;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Carnet animal modals
	const [ removeAnimalOpen, setRemoveAnimalOpen ] = useState( false );


	// user payment method
	const [ userPaymentMethods, setUserPaymentMethods ] = useState( [] );

	// list specialité
	const [ allSpecialities, setAllSpecialities ] = useState( [] );
	const getAllSpecialities = async () => {
		const url		= base_api_url + 'vetoSpecialite/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// list vetos
	const [ vetos, setVetos ] = useState( [] );
	const getVetos = async () => {
		const url		= base_api_url + 'profileVeto/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// list specialité
	const [ allEtablissementTypes, setAllEtablissementTypes ] = useState( [] );
	const getAllEtablissementTypes = async () => {
		const url		= base_api_url + 'etablissementType/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// list all animals species
	const [ especes, setEspeces ] = useState( [] );
	const speciesList = async () => {
		const url		= base_api_url + 'espece/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Time slot
	const [ timeslot, setTimeslot ] = useState( '' );
	const getTimeslot = async ( profileVetoId ) => {
		const url		= base_api_url + 'timeSlot/get?profileVetoId=' + profileVetoId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Veto's hollydays
	const getHollydays = async ( profileVetoId ) => {
		const url		= base_api_url + 'timeSlotClosedDateDefault/list';
		const data 		= ''; 
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Veto's absence
	const getAbsences = async ( profileVetoId ) => {
		const url		= base_api_url + 'timeSlotClosedDate/list?profileVetoId=' + profileVetoId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update veto absence
	const timeSlotClosedDateUpdate = async ( timeSlotData ) => {
		const url		= base_api_url + 'timeSlotClosedDate/edit';
		const data 		= timeSlotData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update veto timeslot
	const timeSlotDateUpdate = async ( timeSlotData ) => {
		const url		= base_api_url + 'timeSlot/edit';
		const data 		= timeSlotData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// get vetos's etablissement
	const [ vetoCliniqueInfo, setVetoCliniqueInfo ] = useState( null );
	const getVetoCliniqueInfo = async ( profileVetoId ) => {
		const url		= base_api_url + 'etablissement/getVetoEtablissement?profileVetoId=' + profileVetoId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	
	// set veto etablissement
	const setCliniqueVetos = async ( cliniqueVetoData ) => {
		const url		= base_api_url + 'vetoEtablissementStatus/edit';
		const data 		= cliniqueVetoData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// get a user notifications
	const getUserNotifications = async ( userId ) => {
		const url		= base_api_url + 'notification/user/get?userId=' + userId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// get a veto's etablissement invitation status
	const getVetoEtablissementStatus = async ( profileVetoId ) => {
		const url		= base_api_url + 'vetoEtablissementStatus/user/get?profileVetoId=' + profileVetoId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// get a veto's etablissement invitation status update
	const updateVetoEtablissementStatus = async ( updateData ) => { 
		const url		= base_api_url + 'vetoEtablissementStatus/update';
		const data 		= updateData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// List an etablissement's vetos
	const getEtablissementVeto = async ( statusId, etablissementId ) => { 
		const url		= base_api_url + 'vetoEtablissementStatus/listVeto?statusId=' + statusId + '&etablissementId=' + etablissementId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// List an etablissement's current invitation
	const getEtablissementInvitations = async ( etablissementId ) => { 
		const url		= base_api_url + 'vetoEtablissementStatus/etablissementInvitation?etablissementId=' + etablissementId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// 
	const isAGuest = async ( profileVetoId ) => { 
		const url		= base_api_url + 'vetoEtablissementStatus/isAGuest?profileVetoId=' + profileVetoId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	

	// get etablissement info
	const getEtablissementInfo = async ( etablissementId ) => {
		const url		= base_api_url + 'etablissement/show?etablissementId=' + etablissementId;
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}



	// selected veto's clinique
	const [ selectedVetoClinique, setSelectedVetoClinique ] = useState( '' ); 
	
	// Transports list
	const [ transports, setTransports ] = useState( [] );
	const getTransports = async ( ) => {
		const url		= base_api_url + 'transport/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	
	// close a day
	const timeSlotDayClose = async ( timeSlotData ) => {
		const url		= base_api_url + 'timeSlotClosedDay/edit';
		const data 		= timeSlotData;
		const method 	= 'POST';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// delete veto absence
	const timeSlotClosedDateRemove = async ( timeSlotData ) => {
		const url		= base_api_url + 'timeSlotClosedDate/delete';
		const data 		= timeSlotData;
		const method 	= 'POST';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// etablissement edit
	const etablissementUpdate = async ( etablissementData ) => {
		const url		= base_api_url + 'etablissement/edit';
		const data 		= etablissementData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// etablissement lieu edit
	const etablissementLieuUpdate = async ( etablissementLieuData ) => {
		const url		= base_api_url + 'lieu/edit';
		const data 		= etablissementLieuData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// etablissement lieu delete
	const lieuDelete = async ( lieuData ) => {
		const url		= base_api_url + 'lieu/delete';
		const data 		= lieuData;
		const method 	= 'POST';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Lieu Transport edit lieu /edit
	const lieuTransportUpdate = async ( lieuTransportData ) => {
		const url		= base_api_url + 'lieuTransport/edit';
		const data 		= lieuTransportData;
		const method 	= 'POST';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Get a lieu info
	const getALieu = async ( lieuId ) => {
		const url		= base_api_url + 'lieu/show?id=' + lieuId;
		const data 		= null;
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}
	

	// A vet or etablissement lieux
	const getAVetoLieux = async ( vetoData ) => {
		const url		= base_api_url + 'lieu/get/vetoLieux?' + ( vetoData.profileVetoId !== undefined ? ( 'profileVetoId=' + vetoData.profileVetoId ) :  ( 'etablissementId=' + vetoData.etablissementId )) ;
// console.log( '------------------- url', url );
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep = await fetchData( url, data, method );
// console.log( '------------------- rep', rep );
		setSpiner( 'none' );
	
		return rep;
	}

	const [ selectedLieuId, setSelectedLieuId ] = useState( null );

	// RPPS validator
	const validateRppsNumber = (rppsNumber) => {
		// Remove any spaces or non-digit characters from the input string
		const cleanedNumber = rppsNumber.toString().replace(/\D/g, '');
		// Check if the cleaned number is a numeric string of exactly 11 digits
		const rppsRegex = /^\d{11}$/;
		return rppsRegex.test(cleanedNumber);
	}

	// SIRET number
	const validateSiretNumber = (siret) => {
		// Remove any non-digit characters
		siret = String(siret).replace(/\D/g, '');

		// A SIRET number must be 14 digits long
		if (siret.length !== 14 || !/^\d+$/.test(siret)) {
			return false;
		}

		let sum = 0;
		for (let i = 0; i < siret.length; i++) {
			let digit = parseInt(siret[i], 10);

			// Double every second digit from the right (or every digit at an even index from the left)
			if (i % 2 === 0) { // For SIRET, the Luhn algorithm usually applies to every second digit from the right.
						   // When iterating from the left, this means digits at even indices (0, 2, 4...)
						   // are treated differently. For SIRET specifically, the 1st, 3rd, 5th... digits
						   // (from the left, index 0, 2, 4...) are multiplied by 2.
				digit *= 2;
				if (digit > 9) {
					digit -= 9;
				}
			}
			sum += digit;
		}

		return sum % 10 === 0;
	}

	// get a specie's breed
	const speciesBreedList = async ( especeId ) => { 
		const url		= base_api_url + "especeRace/list/?especeId=" + especeId;
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// get a user pets book
	const getUserPets = async ( userProfileId ) => { 
		const url		= base_api_url + "carnetAnimal/user?profileUserId=" + userProfileId;
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}
	
	// edit a user pets book
	const editUserPets = async ( animalBook, animalPhoto ) => {
		const url		= base_api_url + 'carnetAnimal/edit';
		const data 		= animalBook;
		const method 	= 'POST';

		const formData = new FormData();

		// Append file
		if( animalPhoto )
			formData.append('files[]', animalPhoto )

		// Append data
		for ( var key in data ) 
			formData.append( key, data[key] );

		// Post data
		setSpiner( 'block' );
		const resp = await fetch( url, {
			method: 'POST',
			body: formData,
		})
		setSpiner( 'none' );

		return resp;
	}
	
	// Timeslot - veto's absences
	const [ absences, setAbsences ] = useState( '' );
	const [ selectedAbsenceId, setSelectedAbsenceId ] = useState( null );
	// Timeslot - hollyday
	const [ hollydays, setHollydays ] = useState( '' );
	const [ selectedHollydayId, setSelectedHollydayId ] = useState( '' );
	// Timeslot
	const [ selectedTimeslotId, setSelectedTimeslotId ] = useState( '' );
	const [ selectedTimeslotOpen, setSelectedTimeslotOpen ] = useState( {} );
	
	// selected ( active ) pets
	const [ userPets, setUserPets ] = useState( [] );
	const [ selectedPetId, setSelectedPetId ] = useState( '' );
	

	const [ languages, setLanguages ] = useState( [] );
	// const [ countries, setCountries ] = useState( [] );
	const [ countriesAllowed, setCountriesAllowed ] = useState( [] );

	
	useEffect(() => {
		const a = async () =>{
			// Languages
			const getLanguages = async () => {
				const languages = await languageList();
				return languages
			}
			const languages = await getLanguages();
			setLanguages( languages );
			
			// Countries
			const getCountries = async () => {
				const countries = await countryList();
				return countries
			}
			const countries = await getCountries();
			setCountriesAllowed( countries );
			
			// Especies
			const getEspeces = async () => {
				const species = await speciesList();
				return species
			} 
			const especes = await getEspeces();
			setEspeces( especes )
			
			// specialities
			const specialities = await getAllSpecialities();
			setAllSpecialities( specialities )
			
			// etablissement type
			const etablissementTypes = await getAllEtablissementTypes();
			setAllEtablissementTypes( etablissementTypes )
			
			// transport
			const transports = await getTransports();
			setTransports( transports )

			// veto list
			const vetos = await getVetos();
			setVetos( vetos )

		}

		a()
	}, []);
	

	
	// language Options
	
	
	
	// placeholder translate for indirect translation cases
	const [ searchInputVeto, setSearchInputVeto ] = useState( '' );
	const [ searchInputVetoType, setSearchInputVetoType ] = useState( '' );
	const [ searchInputLocation, setSearchInputLocation ] = useState( '' );
	const [ homeTitle, setHomeTitle ] = useState( '' );
	const [ contactTitle, setContactTitle ] = useState( '' );
	const [ blogTitle, setBlogTitle ] = useState( '' );
	const [ placeholderFullname, setPlaceholderFullname ] = useState( '' );
	const [ placeholderEmail, setPlaceholderEmail ] = useState( '' );
	const [ placeholderPhone, setPlaceholderPhone ] = useState( '' );
	const [ placeholderMessage, setPlaceholderMessage ] = useState( '' );
	const [ contactCorrectError, setContactCorrectError ] = useState( '' );
	const [ contactErrorsExistText, setContactErrorsExistText ] = useState( '' );
	const [ contactErrorOccured, setContactErrorOccured ] = useState( '' );
	const [ contactThankYou, setContactThankYou ] = useState( '' );
	const [ contactEmailError, setContactEmailError ] = useState( '' );
	const [ contactFullnameErrorText, setContactFullnameErrorText ] = useState( '' );
	const [ contactPhoneNumberErrorText, setContactPhoneNumberErrorText ] = useState( '' );
	const [ contactFormMessageErrorText, setContactFormMessageErrorText ] = useState( '' );
	const [ contactFullnameErrorEmptyText, setContactFullnameErrorEmptyText ] = useState( '' );
	const [ contactEmailEmptyError, setContactEmailEmptyError ] = useState( '' );
	const [ contactErrorPhonenumberEmpty, setContactErrorPhonenumberEmpty ] = useState( '' );
	const [ contactEmptyMessageError, setContactEmptyMessageError ] = useState( '' );
	const [ signUp_nameErrorText, setSignUp_nameErrorText ] = useState( '' );
	const [ signUp_firstNameErrorText, setSignUp_firstNameErrorText ] = useState( '' );
	const [ signUp_emailErrorText, setSignUp_emailErrorText ] = useState( '' );
	const [ signUp_passwordErrorText, setSignUp_passwordErrorText ] = useState( '' );
	const [ signUp_passwordRepeatErrorText,	setSignUp_passwordRepeatErrorText ] = useState( '' );
	const [ signUp_type1, setSignUp_type1 ] = useState( '' );
	const [ signUp_type2, setSignUp_type2 ] = useState( '' );
	const [ signUp_nameEmpty, setSignUp_nameEmpty ] = useState( '' );
	const [ signUp_emailEmpty, setSignUp_emailEmpty ] = useState( '' );
	const [ signUp_passwordEmpty, setSignUp_passwordEmpty ] = useState( '' );
	const [ signUp_correctErrors, setSignUp_correctErrors ] = useState( '' );
	const [ signUp_selectTypeError, setSignUp_selectTypeError ] = useState( '' );
	const [ signUp_verifyEmailSubjet, setSignUp_verifyEmailSubjet ] = useState( '' );
	const [ signUp_firstNamePlaceholder, setSignUp_firstNamePlaceholder ] = useState( '' );
	const [ signUp_emailPlaceholder, setSignUp_emailPlaceholder ] = useState( '' );
	const [ signUp_passwordPlaceholder, setSignUp_passwordPlaceholder ] = useState( '' );
	const [ signUp_passwordRepeatPlaceholder, setSignUp_passwordRepeatPlaceholder ] = useState( '');
	const [ signUp_passwordRepeatEmpty, setSignUp_passwordRepeatEmpty ] = useState( '' );
	const [ signUp_namePlaceholder, setSignUp_namePlaceholder ] = useState( '' );
	const [ signUp_formOption1ErrorText, setSignUp_formOption1ErrorText ] = useState( '' );
	const [ signUp_formOption2ErrorText, setSignUp_formOption2ErrorText ] = useState( '' );
	const [ signUp_codeTitle, setSignUp_codeTitle ] = useState( '' );
	const [ signUp_codeCorrect, setSignUp_codeCorrect ] = useState( '' );
	const [ signUp_codeIncorrect, setSignUp_codeIncorrect ] = useState( '' );	
	const [ signUp_codeIntro, setSignUp_codeIntro ] = useState( '' );	
	const [ signUp_codeResend, setSignUp_codeResend ] = useState( '' );
	const [ signUp_popConfirmVetTitle, setSignUp_popConfirmVetTitle ] = useState( '' );
	const [ signUp_popConfirmPetTitle, setSignUp_popConfirmPetTitle ] = useState( '' );
	const [ signUp_popConfirmVetDescription, setSignUp_popConfirmVetDescription ] = useState( '' );
	const [ signUp_popConfirmPetDescription, setSignUp_popConfirmPetDescription ] = useState( '' );
	const [ signUp_popConfirmYes, setSignUp_popConfirmYes ] = useState( '' );
	const [ signUp_popConfirmNo, setSignUp_popConfirmNo ] = useState( '' );
	const [ signUp_popConfirmDeleteBtn, setSignUp_popConfirmDeleteBtn ] = useState( '' );
	const [ signUp_accountCreationSuccess, setSignUp_accountCreationSuccess ] = useState( '' );
	const [ signUp_title, setSignUp_title ] = useState( '' );
	const [ signIn_title, setSignIn_title ] = useState( '' );
	const [ profile_title, setProfile_title ] = useState( '' );
	const [ signUp_btnSubmit, setSignUp_btnSubmit ] = useState( '' );
	const [ signUp_termsUsage, setSignUp_termsUsage ] = useState( '' );
	const [ signUp_accountCreationFails, setSignUp_accountCreationFails ] = useState( '' );
	const [ signIn_passwordForgot, setSignIn_passwordForgot ] = useState( '' );
	const [ passwordForgot_updateSuccess, setPasswordForgot_updateSuccess ] = useState( '' );
	const [ passwordForgotReset_title, setPasswordForgotReset_title ] = useState( '' );
	const [ paymentMethod_bankNamePlaceholder, setPaymentMethod_bankNamePlaceholder ] = useState( '' );
	const [ paymentMethod_bankAddressPlaceholder, setPaymentMethod_bankAddressPlaceholder ] = useState( '' );
	const [ paymentMethod_ibanPlaceholder, setPaymentMethod_ibanPlaceholder ] = useState( '' );
	const [ paymentMethod_fullNamePlaceholder, setPaymentMethod_fullNamePlaceholder ] = useState( '' );
	const [ paymentMethod_bankNameErrorText, setPaymentMethod_bankNameErrorText ] = useState( '' );
	const [ paymentMethod_paypalEmail, setPaymentMethod_paypalEmail ] = useState( '' );
	const [ paymentMethod_bankAddressErrorText, setPaymentMethod_bankAddressErrorText ] = useState( '' );
	const [ paymentMethod_ibanErrorText, setPaymentMethod_ibanErrorText ] = useState( '' );
	const [ paymentMethod_fullNameEmpty, setPaymentMethod_fullNameEmpty ] = useState( '' );
	const [ paymentMethod_bankNameEmpty, setPaymentMethod_bankNameEmpty ] = useState( '' );
	const [ paymentMethod_bankAddressEmpty, setPaymentMethod_bankAddressEmpty ] = useState( '' );
	const [ paymentMethod_ibanEmpty, setPaymentMethod_ibanEmpty ] = useState( '' );
	const [ paymentMethod_descriptionPaypal, setPaymentMethod_descriptionPaypal ] = useState( '' );
	const [ paymentMethod_descriptionBank, setPaymentMethod_descriptionBank ] = useState( '' );
	const currency = 'EUR';
	const [ profile_sexe_male, setProfile_sexe_male ] = useState( '' );
	const [ profile_sexe_female, setProfile_sexe_female ] = useState( '' );
	// language translate
	const [ language_french, setLanguage_french ] = useState( '' );
	const [ language_english, setLanguage_english ] = useState( '' );
	const [ language_spanish, setLanguage_spanish ] = useState( '' );
	const [ language_german, setLanguage_german ] = useState( '' );
	const [ language_italian, setLanguage_italian ] = useState( '' );
	const [ language_estonian, setLanguage_estonian ] = useState( '' );
	// countries translate
	const [ country_france, setCountry_france ] = useState( '' );
	const [ country_italy, setCountry_italy ] = useState( '' );
	const [ country_suiss, setCountry_suiss ] = useState( '' );
	const [ country_belgium, setCountry_belgium ] = useState( '' );				
	const [ country_spain, setCountry_spain ] = useState( '' );	
	const [ country_germain, setCountry_germain ] = useState( '' );	


	const getBase64 = async (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		})
	}

	// const truncateString = ( str, maxLength ) => {
		// if (str.length > maxLength) {
			// // If maxLength is less than or equal to 3, the ellipsis takes up all the space
			// // Otherwise, reserve 3 characters for the ellipsis
			// const actualLength = (maxLength <= 3) ? maxLength : maxLength - 3;
			// return str.substring(0, actualLength) + '...';
		// }
		// return str; // Return original string if no truncation is needed
	// }

	return (	
	
		<SiteContext.Provider 
			value={{
				getBase64,
				siteName,
				siteEmail,
				siteDomainName,
				base_url,
				signUp,
				signIn,
				checkEmail,
				insertSpaceAtPosition,
				sendEmail,
				userPaymentMethods, 
				setUserPaymentMethods,
				getReferrer,
				setReferrer,
				generateRandomDigits,
				setVerificationCode,
				verificationCode,
				verificationUserId,
				setVerificationUserId,
				updatePassword,
				profileUpdate,
				userPaymentMethodList,
				userPaymentMethodEdit,
				userPaymentMethodRemove,
				visibleModalName, 
				visibleModalTitle,
				setVisibleModalName,
				setVisibleModalTitle,
				languageList,
				paymentMethodList,
				isNew, 
				setIsNew,
				updateLanguagePreference,
				getLanguagePreference,
				profileGet,
				userProfile, 
				setUserProfile,
				defaultLanguageId,
				siteLanguage,
				setSiteLanguage,
				languageSetup,
				languageFlag,
				selectedLanguageId, 
				setSelectedLanguageId,
				truncateString,
				getSiteContent,
				getAContent,
				siteContent,
				setSiteContent,
				searchInputVeto, 
				setSearchInputVeto,
				searchInputVetoType, 
				setSearchInputVetoType,
				setSearchInputLocation,
				searchInputLocation,
				homeTitle,
				setHomeTitle,
				contactTitle,
				setContactTitle,
				blogTitle,
				setBlogTitle,
				placeholderFullname, 
				setPlaceholderFullname,
				placeholderEmail, 
				setPlaceholderEmail,
				placeholderPhone, 
				setPlaceholderPhone,
				placeholderMessage, 
				setPlaceholderMessage,
				contactCorrectError,
				setContactCorrectError,
				contactErrorsExistText,
				setContactErrorsExistText,
				contactErrorOccured,
				setContactErrorOccured,	
				contactThankYou,
				setContactThankYou,	
				contactEmailError,
				setContactEmailError,
				contactFullnameErrorText,
				setContactFullnameErrorText,
				contactPhoneNumberErrorText,			
				setContactPhoneNumberErrorText,
				contactFormMessageErrorText,
				setContactFormMessageErrorText,
				contactFullnameErrorEmptyText,
				setContactFullnameErrorEmptyText,
				contactEmailEmptyError,
				setContactEmailEmptyError,
				contactErrorPhonenumberEmpty,
				setContactErrorPhonenumberEmpty,
				contactEmptyMessageError,
				setContactEmptyMessageError,
				signUp_nameErrorText,
				setSignUp_nameErrorText,
				signUp_firstNameErrorText,
				setSignUp_firstNameErrorText,
				signUp_emailErrorText,
				setSignUp_emailErrorText,
				signUp_passwordErrorText,
				setSignUp_passwordErrorText,
				signUp_passwordRepeatErrorText,
				setSignUp_passwordRepeatErrorText,
				signUp_type1,
				setSignUp_type1,
				signUp_type2,
				setSignUp_type2,
				signUp_nameEmpty,
				setSignUp_nameEmpty,
				signUp_emailEmpty,
				setSignUp_emailEmpty,
				signUp_passwordEmpty,
				setSignUp_passwordEmpty,
				signUp_passwordRepeatEmpty,
				setSignUp_passwordRepeatEmpty,
				signUp_correctErrors,
				setSignUp_correctErrors,
				signUp_selectTypeError,
				setSignUp_selectTypeError,
				signUp_verifyEmailSubjet,
				setSignUp_verifyEmailSubjet,
				signUp_namePlaceholder,
				setSignUp_namePlaceholder,
				signUp_firstNamePlaceholder,
				setSignUp_firstNamePlaceholder,
				signUp_emailPlaceholder,
				setSignUp_emailPlaceholder,
				signUp_passwordPlaceholder,
				setSignUp_passwordPlaceholder,
				signUp_passwordRepeatPlaceholder,
				setSignUp_passwordRepeatPlaceholder,
				signUp_formOption1ErrorText,
				setSignUp_formOption1ErrorText,
				signUp_formOption2ErrorText,
				setSignUp_formOption2ErrorText,
				signUp_codeTitle,
				setSignUp_codeTitle,
				signUp_codeCorrect,
				setSignUp_codeCorrect,
				signUp_codeIncorrect,
				setSignUp_codeIncorrect,
				signUp_codeIntro, 
				setSignUp_codeIntro,
				signUp_codeResend,
				setSignUp_codeResend,
				signUp_popConfirmVetTitle,
				setSignUp_popConfirmVetTitle,
				signUp_popConfirmPetTitle,
				setSignUp_popConfirmPetTitle,
				signUp_popConfirmVetDescription,
				setSignUp_popConfirmVetDescription,
				signUp_popConfirmPetDescription,
				setSignUp_popConfirmPetDescription,
				signUp_popConfirmYes,
				setSignUp_popConfirmYes,
				signUp_popConfirmNo,
				setSignUp_popConfirmNo,
				signUp_popConfirmDeleteBtn,
				setSignUp_popConfirmDeleteBtn,
				signUp_accountCreationSuccess,	
				setSignUp_accountCreationSuccess,	
				signUp_title,
				setSignUp_title,
				signUp_btnSubmit,
				setSignUp_btnSubmit,
				signUp_termsUsage,
				setSignUp_termsUsage,
				signUp_accountCreationFails,
				setSignUp_accountCreationFails,
				signIn_passwordForgot,
				setSignIn_passwordForgot,
				signIn_title,
				setSignIn_title,
				profile_title,
				setProfile_title,
				passwordForgot_updateSuccess,
				setPasswordForgot_updateSuccess,
				passwordForgotReset_title, 
				setPasswordForgotReset_title,
				paymentMethod_bankNamePlaceholder,
				setPaymentMethod_bankNamePlaceholder,
				paymentMethod_bankAddressPlaceholder,
				setPaymentMethod_bankAddressPlaceholder,
				paymentMethod_ibanPlaceholder,
				setPaymentMethod_ibanPlaceholder,
				paymentMethod_fullNamePlaceholder,
				setPaymentMethod_fullNamePlaceholder,
				paymentMethod_bankNameErrorText,
				setPaymentMethod_bankNameErrorText,
				paymentMethod_paypalEmail,
				setPaymentMethod_paypalEmail,
				paymentMethod_bankAddressErrorText,
				setPaymentMethod_bankAddressErrorText,
				paymentMethod_ibanErrorText,
				setPaymentMethod_ibanErrorText,
				paymentMethod_fullNameEmpty,
				setPaymentMethod_fullNameEmpty,
				paymentMethod_bankNameEmpty,
				setPaymentMethod_bankNameEmpty,
				paymentMethod_bankAddressEmpty,
				setPaymentMethod_bankAddressEmpty,
				paymentMethod_ibanEmpty,
				setPaymentMethod_ibanEmpty,
				paymentMethod_descriptionPaypal,
				setPaymentMethod_descriptionPaypal,
				paymentMethod_descriptionBank,
				setPaymentMethod_descriptionBank,
				currency,
				modalProfileIdentityOpen,
				setModalProfileIdentityOpen,
				profile_sexe_male,
				setProfile_sexe_male,
				profile_sexe_female,
				setProfile_sexe_female,
				profileFormUpdated, 
				setProfileFormUpdated,
				dateFormater,
				siteLocale,
				language_french,
				setLanguage_french,
				language_english,
				setLanguage_english,
				language_spanish,
				setLanguage_spanish,
				language_german,
				setLanguage_german,
				language_italian,
				setLanguage_italian,
				language_estonian,
				setLanguage_estonian,
				updateEmail,
				speciesList,
				speciesBreedList,
				getUserPets,
				selectedPetId,
				setSelectedPetId,
				editUserPets,
				userPets, 
				setUserPets,
				languages,
				// site countries list
				countriesAllowed,
				especes,
				selectedAnimal, 
				setSelectedAnimal,
				modalRemoveAnimalOpen, 
				setModalRemoveAnimalOpen,
				photoAnimalDefaultSrc,
				carnetAnimalRemove,
				// translate countries
				country_france,
				setCountry_france,
				country_italy,
				setCountry_italy,
				country_suiss,
				setCountry_suiss,
				country_belgium,
				setCountry_belgium,
				country_spain,
				setCountry_spain,
				country_germain,
				setCountry_germain,
				allSpecialities,
				allEtablissementTypes,
				validateRppsNumber,
				validateSiretNumber,
				getTimeslot,
				timeslot, 
				setTimeslot,
				getAbsences,
				setAbsences,
				absences,
				getHollydays,
				setHollydays,
				selectedTimeslotId,
				setSelectedTimeslotId,
				selectedTimeslotOpen,
				setSelectedTimeslotOpen,
				selectedAbsenceId,
				setSelectedAbsenceId,
				selectedHollydayId,
				setSelectedHollydayId,
				timeSlotClosedDateUpdate,
				timeSlotClosedDateRemove,
				timeSlotDateUpdate,
				timeSlotDayClose,
				etablissementUpdate,
				etablissementLieuUpdate,
				getVetoCliniqueInfo,
				vetoCliniqueInfo, 
				setVetoCliniqueInfo,
				setCliniqueVetos,
				selectedVetoClinique,
				setSelectedVetoClinique,
				transports,
				lieuTransportUpdate,
				vetos,
				getVetoInvitationNotification,
				getUserNotifications,
				getVetoEtablissementStatus,
				getEtablissementInfo,
				updateVetoEtablissementStatus,
				postNotification,
				getPaysVilles,
				getEtablissementVeto,
				getEtablissementInvitations,
				notificationViewed,
				getAVetoLieux,
				lieuDelete,
				isAGuest,
				selectedLieuId, 
				setSelectedLieuId,
				getALieu
			}}
		>

			<Space
				style={{ display: spiner }}
			>
				<Spin
					indicator={
						<LoadingOutlined
							style={{
									display:		spiner,
									fontSize: 		60,
									color: 			'#fcb800',
									zIndex: 		9000,
								}}
							spin
						/>
					}
					fullscreen
					tip		= "" 
					size	= "large"
				/>
			
			</Space>

		{children}

		</SiteContext.Provider>

	);
	
	
	
};

SiteProvider.propTypes = {
	children: PropTypes.node.isRequired,
};