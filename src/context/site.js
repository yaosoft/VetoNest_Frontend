import PropTypes from 'prop-types'
import { createContext, useState, useEffect, useContext, useCallback, useRef  } from 'react'

import { Space, Spin, Button, notification, message, Popconfirm, Radio, Flex, DatePicker, Image, Upload } from 'antd';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined
} from '@ant-design/icons';


// Language code → BCP 47 locale. Some languages use a country code that differs
// from their language code, so the mapping has to be explicit.
const LANGUAGE_LOCALE_MAP = {
	'en': 'en-GB',
	'fr': 'fr-FR',
	'de': 'de-DE',
	'es': 'es-ES',
	'it': 'it-IT',
	'ee': 'et-EE',  // Estonian: language code "et", country code "EE"
};
export const toSiteLocale = ( languageCode ) =>
	LANGUAGE_LOCALE_MAP[languageCode] ?? ( languageCode + '-' + languageCode.toUpperCase() );

export const SiteContext = createContext();
export const SiteProvider = ({ children }) => {

	// spiner
	const [ spiner, setSpiner ] = useState( 'none' );
	const apiCache = new Map();
	
	// helper: Fetch data definition
	async function fetchData(url, data, method) {
		const response = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
			credentials: 'include',
			...(method == 'POST' && { body: JSON.stringify(data) })
		});
		
		if (response.status != 200) {
			const errorText = await response.text();
			console.error('API Error:', response.status, errorText);
			throw new Error(`API returned status ${response.status}`);
		}
		
		return response.json();
	}
	
	// helper: wrap your fetchData function with caching
	const fetchWithCache = useCallback(async (url, options, method, cacheKey, ttl = 60000) => {
		  const key = cacheKey || url;
		  
		  // Check cache
		  if (apiCache.has(key)) {
			const cached = apiCache.get(key);
			if (Date.now() - cached.timestamp < ttl) {
			  return cached.data;
			}
		  }
		  
		  // Make request
		  const response = await fetchData(url, options, method);
		  
		  // Cache response
		  apiCache.set(key, {
			data: response,
			timestamp: Date.now()
		  });
		  
		  return response;
	}, []);
	
	// Email verification code
	const [ verificationCode, setVerificationCode ] = useState( localStorage.getItem( 'verificationCode' ) ? JSON.parse( localStorage.getItem( 'verificationCode' ) ) : '' );

	// User Id
	const [ verificationUserId, setVerificationUserId ] = useState( localStorage.getItem( 'verificationUserId' ) ? JSON.parse( localStorage.getItem( 'verificationUserId' ) ) : '' );

	// Backend api url 
	// const base_api_url = 'http://localhost/VetoNest/public/index.php/api/'; // dev
	// const base_api_url = '/api/'; // dev
	const base_api_url = 'https://backend.vetonest.com/api/'// prod 

	// Backend public url 
	// const base_url = 'http://localhost/VetoNest/public/'; // dev
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
		// return "/profile"; // temporary hack
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

	// get professional title titles
	const getVetTitles = async () => {
		const url		= base_api_url + 'vet/title';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// get vet veriication statuses
	const getVetStatuses = async () => {
		const url		= base_api_url + 'verification/statuses';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Send email
	const sendEmail = async (emailData) => {
		console.log('=== SEND EMAIL DEBUG ===');
		console.log('Email data:', emailData);
		console.log('Email template:', emailData.emailTemplate);
		console.log('To email:', emailData.to_email);
		
		const url = base_api_url + 'user/send';
		const method = 'POST';
		setSpiner('block');
		try {
			const rep = await fetchData(url, emailData, method);
			console.log('Email response:', rep);
			return rep;
		} catch (error) {
			console.error('Error sending email:', error);
			return null;
		} finally {
			setSpiner('none');
		}
	};

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

	// // In SiteContext.js - Update the signIn function
	// const signIn = async (signinData) => {
		// const url = base_api_url + 'user/login';
		// const data = signinData;
		// const method = 'POST';
		// setSpiner('block');
		
		// try {
			// const rep = await fetchData(url, data, method);
			// setSpiner('none');
			// return { success: true, data: rep };
		// } catch (error) {
			// console.error('Login error:', error);
			// setSpiner('none');
			// // Return error details instead of just false
			// return { 
				// success: false, 
				// error: error.message || "Authentication failed"
			// };
		// }
	// }

	// logOut - Complete logout with server session destruction
	const signOut = async () => {
		try {
			// ─── CALL THE SERVER LOGOUT API ──────────────────────────────────────
			const response = await apiCall('/user/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			if (!response.success) {
				console.error('Server signOut failed:', response.message);
			
			}
			
			return true;
			
		} catch (error) {
			console.error('Logout error:', error);
			
			// Even if API call fails, clear local state
			// setUser(null);
			// setProfileTypeId(null);
			// setProfileId(null);
			// setUserId(null);
			// localStorage.removeItem('user');
			
			return false;
		}
	};


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

	// List all countries
	const countryList = async () => {
		const url		= base_api_url + 'pays/list';
		const data 		= '';
		const method 	= 'GET';
		setSpiner( 'none' );
		const rep 		= await fetchData( url, data, method );
		return rep;
	}

	// list all cities by country
	const getPaysVilles = async ( countryId ) => {
		const url		= base_api_url + 'pays/villes?countryId=' + countryId;
		const data 		= '';
		const method 	= 'GET';
		const rep 		= await fetchData( url, data, method );
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
	
	// List all profesional Ids ( SIRET, RPPS, ... )
	const professionalIdList = async () => { 
		const url		= base_api_url + 'professionalIdMappings/list';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// List profesional Ids by country
	const professionalIdByCountry = async ( countryId ) => {
		const url		= base_api_url + 'professionalIdMappings/country?countryId=' + countryId;;
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
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
	// The site default locale ('fr-FR'). Used for anything addressed to someone
	// with no language preference of their own — invitation emails, for one —
	// where siteLocale (which follows the current user's choice) is wrong.
	const defaultSiteLocale   = toSiteLocale( defaultLanguageCode );
	const [ siteLanguage, setSiteLanguage ] = useState( '' );
	const [ languageFlag, setLanguageFlag ] = useState( '' );
	const languageSetup = async ( languageId ) => {
		const languages = await languageList();
		const language = await languages.filter( e => e.id == languageId )[0];
		const languageCode = language ? language.languageCode : defaultLanguageCode;
		const flag = '/img/flags/' + languageCode + '.svg';
		setLanguageFlag( flag );
		setSiteLanguage( languageCode );

		// ── Language code → correct BCP 47 locale ────────────────────────────
		setSiteLocale( toSiteLocale( languageCode ) );

		// get content
		const siteContentData = {
			siteLanguage: languageCode,
		}
		const siteContent = await getSiteContent( siteContentData );
		setSiteContent( siteContent );
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
	const [siteLocale, setSiteLocale] = useState( defaultSiteLocale );
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

	// const base_cmp_Url = "http://localhost/Diamta_CMP/public/index.php/api/"; // dev
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
	
	// Wrapper for getTranslatedMessage
	const getTranslatedMessage = (tagRef, replacements = {}) => {
		let message = getAContent(tagRef);
		
		if (!message || message === tagRef) {
			// Fallback logic
			const fallbacks = {
				'cmp_vetonest.com_professional_id_invalid_format': `Invalid ${replacements.label || 'ID'} format`,
				'cmp_vetonest.com_professional_id_required': `${replacements.label || 'ID'} is required`,
				'cmp_vetonest.com_verify': 'Verify',
				'cmp_vetonest.com_format_help': `Format: ${replacements.regex || ''}`,
				'cmp_vetonest.com_enter': `Enter ${replacements.label || 'ID'}`,
			};
			return fallbacks[tagRef] || message || tagRef;
		}
		
		Object.keys(replacements).forEach(placeholder => {
			const regex = new RegExp(`{${placeholder}}`, 'g');
			message = message.replace(regex, replacements[placeholder]);
		});
		
		return message;
	};
	
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

	// Veto notification - get appointment request Notification
	const getVetoAppointmentRequestNotification = async (consultationId) => {
		const url    = base_api_url + 'consultation/vet/appointment/notification?consultationId=' + consultationId;
		const method = 'GET';
		setSpiner('block');
		const rep = await fetchData(url, null, method);
		setSpiner('none');
		return rep;
	}

	// Pet parent notification - get confirmed appointment request 
	const getPetConfirmedAppointmentNotification = async ( userProfileId ) => {
		const url		= base_api_url + 'consultation/pet/confirmed/appointment/notification/?vetoProfileId=' + userProfileId;
		const data 		= "";
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Pet parent notification - get confirmed appointment request 
	const getPetDeclinedAppointmentNotification = async ( userProfileId ) => {
		const url		= base_api_url + 'consultation/pet/declined/appointment/notification/?vetoProfileId=' + userProfileId;
		const data 		= "";
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Impersonate
	const getImpersonationStatus = async () => {
	  return await fetchData(`${base_api_url}admin/impersonation-status`, {}, 'GET');
	};

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


	// list veto modes ( home, clinic, online )
	const listVetoMode = async () => {
		const url		= base_api_url + 'vetoMode/list';
		const data 		= '';
		const method 	= 'GET';
		//setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		//setSpiner( 'none' );
		return rep;
	}

	// show a veto mode
	const showVetoMode = async ( vetoModeId ) => {
		const url		= base_api_url + 'vetoMode/show?vetoModeId=' + vetoModeId;
		const data 		= '';
		const method 	= 'GET';
		//setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		//setSpiner( 'none' );
		return rep;
	}


	// list specialité
	const [ allSpecialities, setAllSpecialities ] = useState( [] );
	const getAllSpecialities = async () => {
		const url		= base_api_url + 'vetoSpecialite/list';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Inside your SiteContext provider component
	const [ vetos, setVetos ] = useState( [] );
	const vetosCache = useRef(new Map());
	let vetosPendingRequest = null;

	const getVetos = useCallback(async (forceRefresh = false) => {
	  const cacheKey = 'vetos_list';
	  
	  if (!forceRefresh && vetosCache.current.has(cacheKey)) {
		const cached = vetosCache.current.get(cacheKey);
		if (Date.now() - cached.timestamp < 60000) {
		  return cached.data;
		}
	  }
	  
	  if (vetosPendingRequest) {
		return vetosPendingRequest;
	  }
	  
	  setSpiner('block');
	  
	  vetosPendingRequest = (async () => {
		const url = base_api_url + 'profileVeto/list';
		
		try {
		  const rep = await fetchData(url, {}, 'GET');
		  
		  vetosCache.current.set(cacheKey, {
			data: rep,
			timestamp: Date.now()
		  });
		  
		  setVetos(rep || []);
		  return rep;
		} catch (error) {
		  console.error('Error fetching vetos:', error);
		  return [];
		} finally {
		  setSpiner('none');
		  vetosPendingRequest = null;
		}
	  })();
	  
	  return vetosPendingRequest;
	}, [base_api_url]);

	const refreshVetos = useCallback(() => {
	  const cacheKey = 'vetos_list';
	  vetosCache.current.delete(cacheKey);
	  vetosPendingRequest = null;
	  return getVetos(true);
	}, [getVetos]);

	// list etablissements
	const [ etablissements, setEtablissements ] = useState( [] );
	const getEtablissements = async () => {
		const url		= base_api_url + 'etablissement/list';
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

	// all consultation types
	const [allConsultationTypes,    setAllConsultationTypes]    = useState([]);
	const getAllConsultationTypes = async () => {
		const url		= base_api_url + 'consultationType/list';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// all consultation statuses
	const [allConsultationStatuses, setAllConsultationStatuses] = useState([]);
	const getAllConsultationStatuses = async () => {
		const url		= base_api_url + 'consultationStatus/list';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	const getPetOwnerConsultationList = async (profileId) => {
		const url = base_api_url + 'consultation/list/pet-owner?profileId=' + profileId;
		setSpiner('block');
		try {
			const rep = await fetchData(url, {}, 'GET');

			// API returns { success: true, consultations: [...] }
			if (rep?.success && Array.isArray(rep.consultations)) {
				return rep;
			}
			// Fallback: legacy bare-array response
			if (Array.isArray(rep)) {
				return { success: true, consultations: rep };
			}

			console.error('Unexpected response format:', rep);
			return { success: false, consultations: [] };
		} catch (error) {
			console.error('Error fetching consultations:', error);
			return { success: false, consultations: [] };
		} finally {
			setSpiner('none');
		}
	};

	// Consultation cancel
	const consultationCancel = async ( consultationId ) => {
		const url		= base_api_url + 'consultation/cancel?consultationId=' + consultationId;
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Consultation list
	const getVetConsultationList = async (profileVetoId) => {
		const url = base_api_url + 'consultation/list/vet?profileVetoId=' + profileVetoId;
		setSpiner('block');
		try {
			const rep = await fetchData(url, {}, 'GET');

			// API returns { success: true, consultations: [...] }
			if (rep?.success && Array.isArray(rep.consultations)) {
				return rep;
			}
			// Fallback: legacy bare-array response
			if (Array.isArray(rep)) {
				return { success: true, consultations: rep };
			}

			console.error('Unexpected response format:', rep);
			return { success: false, consultations: [] };
		} catch (error) {
			console.error('Error fetching vet consultations:', error);
			return { success: false, consultations: [] };
		} finally {
			setSpiner('none');
		}
	};

	// Consultation accept
	const consultationAccept = async (consultationId) => {
		const url    = base_api_url + 'consultation/accept';
		const data   = { consultationId };
		const method = 'POST';
		setSpiner('block');
		const rep = await fetchData(url, data, method);
		setSpiner('none');
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
	const getVetoCliniqueInfo = async (profileVetoId) => {
	  if (!profileVetoId) {
		console.error('getVetoCliniqueInfo: profileVetoId is required');
		return null;
	  }
	  
	  const url = base_api_url + 'etablissement/getVetoEtablissement?profileVetoId=' + profileVetoId;
	  const method = 'GET'; 
	  setSpiner('block');
	  try {
		const rep = await fetchData(url, {}, method);
		return rep;
	  } catch (error) {
		console.error('Error fetching veto clinic info:', error);
		return null;
	  } finally {
		setSpiner('none');
	  }
	};

	const setCliniqueVetos = async ( cliniqueVetoData ) => {
		const url		= base_api_url + 'vetoEtablissementStatus/edit';
		const data 		= cliniqueVetoData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// update etablissement photo
	const updateEtablissementPhoto = async (etablissementData, photoFile) => {
		const url = base_api_url + 'etablissement/edit';
		const method = 'POST';
		
		const formData = new FormData();
		
		// Append file if provided
		if (photoFile) {
			formData.append('files[]', photoFile);
		}
		
		// Append data
		for (const key in etablissementData) {
			if (etablissementData.hasOwnProperty(key) && etablissementData[key] !== null && etablissementData[key] !== undefined) {
				formData.append(key, etablissementData[key]);
			}
		}
		
		try {
			const response = await fetch(url, {
				method: method,
				body: formData,
			});
			const rep = await response.json();
			return rep;
		} catch (error) {
			console.error('Error updating etablissement photo:', error);
			return false;
		}
	};

	// get a user notifications
	const getUserNotifications = async (userId) => {
		const url = base_api_url + 'notification/user/get?userId=' + userId;
		const method = 'GET';
		setSpiner('block');
		try {
			const rep = await fetchData(url, {}, method);
			// Ensure each notification has the needed fields
			return rep.map(notification => ({
				...notification,
				// Add default values for new notification types if missing
				petName: notification.petName || '',
				vetId: notification.vetId || '',
				rating: notification.rating || ''
			}));
		} catch (error) {
			console.error('Error fetching notifications:', error);
			return [];
		} finally {
			setSpiner('none');
		}
	};

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

	// lieu edit
	const saveLieu  = async ( etablissementLieuData ) => {
		const url		= base_api_url + 'lieu/edit';
		const data 		= etablissementLieuData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

const getUserLieu = async (profileUserId) => {
  if (!profileUserId) return null;
  
  const url = `${base_api_url}lieu/get/userLieux?profileUserId=${profileUserId}`;
  const method = 'GET';
  setSpiner('block');
  
  try {
    const rep = await fetchData(url, null, method);
    setSpiner('none');
    
    // The endpoint returns an array of lieux; we take the first one
    if (rep && Array.isArray(rep) && rep.length > 0) {
      return rep[0];
    }
    return null;
  } catch (error) {
    setSpiner('none');
    console.error('Error fetching user lieu:', error);
    return null;
  }
};
 

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

	// Lieu Transport
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
// console.log( '------------------- Lieu', rep );
		setSpiner( 'none' );
	
		return rep;
	}

	// Get a vet profile
	const getAVetoProfile = async ( profileVetoId ) => {
		const url		= base_api_url + 'profileVeto/show/?profileVetoId=' + profileVetoId ;
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

	// professional Id validator
	// const professionalIdValidator = async ( data ) => {
		// const url	= base_api_url + 'validate/professionalId';

		// const method	= 'POST';
		// // setSpiner( 'block' );
		// const rep = await fetchData( url, data, method );
		// // setSpiner( 'none' );
		// return rep;
	// }

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
	const getUserPets = useCallback(async (profileId) => {
	  const url = base_api_url + 'carnetAnimal/user?profileUserId=' + profileId;
	  const method = 'GET';
	  setSpiner('block');
	  try {
		const rep = await fetchData(url, {}, method);
		return rep || [];
	  } catch (error) {
		console.error('Error fetching user pets:', error);
		return [];
	  } finally {
		setSpiner('none');
	  }
	}, [base_api_url]); // Only depends on base_api_url
	
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

	// veto and clinic name auto complette
	const getVetAutocomplete = async ( name, limit ) => { 
		const url		= base_api_url + "v1/autocomplete/veterinarians?q=" + name + "&limit=" + limit;

		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// veto speciality and clinic type auto complette
	const getTypeSpecialityAutocomplete = async ( name, limit ) => {  // /api/v1/autocomplete/specialties?q=${encodeURIComponent(q)}&limit=8`
		const url		= base_api_url + "v1/autocomplete/specialties?q=" + name + "&limit=" + limit;

		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}
	
	// places auto complette
	const getPlaceAutocomplete = async ( name, limit ) => {  // /api/v1/autocomplete/specialties?q=${encodeURIComponent(q)}&limit=8`
		const url		= base_api_url + "v1/autocomplete/place?q=" + name + "&limit=" + limit;

		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}
	
	// Search box - get popular cities
	const getPopularCities = async () => {  
		const url		= base_api_url + 'popular-cities';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );

		const rep = await fetchData( url, data, method );
	
		// setSpiner( 'none' );
		return rep;
	}
	
	// Search box - country list
	const getCountriesList = async () => {  
		const url		= base_api_url + 'countries/list';
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}
	
	// Search box - country list
	const getCitiesByCountry = async ( countryId ) => {  
		const url		= base_api_url + 'cities/by-country?countryId=' + countryId;
		const data 		= '';
		const method 	= 'GET';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}
	
	// Consultation primary complaint
	const consultationPrimaryComplaint = async ( symptomData ) => {
		const url		= base_api_url + 'symptoms/primary-complaint';
		const data 		= symptomData;
		const method 	= 'POST';
		// setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		// setSpiner( 'none' );
		return rep;
	}

	// Save symptom
	const saveSymtom = async ( symptomData ) => {
		const url		= base_api_url + 'symptoms/save';
		const data 		= symptomData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Save consultation
	const saveConsultation = async ( consultationData ) => {
		const url		= base_api_url + 'consultation/edit';
		const data 		= consultationData;
		const method 	= 'POST';
		setSpiner( 'block' );
		const rep = await fetchData( url, data, method );
		setSpiner( 'none' );
		return rep;
	}

	// Save veto comments - simplified without frontend notifications
	// Save veto comments
const saveComment = async (commentData) => {
    console.log('=== saveComment called ===');
    console.log('Received commentData:', commentData);
    
    const url = base_api_url + 'comment/edit';
    const data = {
        commentId: commentData.commentId || null,
        consultationId: commentData.consultationId,
        commentText: commentData.comment,
        profileUserId: commentData.profileId || commentData.profileUserId,
        enabled: true,
        locale: commentData.locale || 'en'
    };
    
    console.log('Sending data to API:', data);
    
    const method = 'POST';
    setSpiner('block');
    try {
        const rep = await fetchData(url, data, method);
        console.log('saveComment response:', rep);
        return rep;
    } catch (error) {
        console.error('Error saving comment:', error);
        throw error;
    } finally {
        setSpiner('none');
    }
};

	// Save veto rating - simplified without frontend notifications
	const saveRating = async (ratingData) => {
    console.log('=== saveRating called ===');
    console.log('ratingData.ratingId:', ratingData.ratingId);
    console.log('ratingData.rating:', ratingData.rating);
    
    const url = base_api_url + 'rating/edit';
    const data = {
        ratingId: ratingData.ratingId || null,  // Make sure this is sent
        consultationId: ratingData.consultationId,
        evaluation: ratingData.rating,
        profileUserId: ratingData.profileId,
        enabled: true,
        locale: ratingData.locale || 'en'
    };
    
    console.log('Data being sent to backend:', data);
    
    const method = 'POST';
    setSpiner('block');
    try {
        const rep = await fetchData(url, data, method);
        console.log('saveRating response:', rep);
        return rep;
    } catch (error) {
        console.error('Error saving rating:', error);
        throw error;
    } finally {
        setSpiner('none');
    }
};


	// Mark consultation as finished
	const consultationFinish = async (consultationId) => {
		const url = base_api_url + 'consultation/finish';
		const data = {
			consultationId: parseInt(consultationId)  // Make sure it's a number
		};
		const method = 'POST';
		
		console.log('Sending finish request:', { url, data }); // Debug log
		
		setSpiner('block');
		try {
			const rep = await fetchData(url, data, method);
			return rep;
		} catch (error) {
			console.error('Error finishing consultation:', error);
			throw error;
		} finally {
			setSpiner('none');
		}
	};

	// Get vet rating
	const getVetRating = async (profileVetoId) => {
		console.log('Fetching rating for vet:', profileVetoId);
		const url = base_api_url + 'rating/getVetRating?profileVetoId=' + profileVetoId;
		const method = 'GET';
		setSpiner('block');
		try {
			const rep = await fetchData(url, {}, method);
			console.log('Rating response:', rep);
			return rep;
		} catch (error) {
			console.error('Error fetching vet rating:', error);
			// Return default values instead of throwing
			return { success: false, averageRating: 0, ratingCount: 0 };
		} finally {
			setSpiner('none');
		}
	};
	

	// Get vet comments
	const getVetComments = async (profileVetoId, profileUserId = null) => {
		let url = base_api_url + 'comment/getVetComments?profileVetoId=' + profileVetoId;
		if (profileUserId) {
			url += '&profileUserId=' + profileUserId;
		}
		const method = 'GET';
		setSpiner('block');
		try {
			const rep = await fetchData(url, {}, method);
			return rep;
		} catch (error) {
			console.error('Error fetching vet comments:', error);
			return { success: false, comments: [], totalComments: 0 };
		} finally {
			setSpiner('none');
		}
	};
	
	// Delete a comment
	const deleteComment = async (commentId, profileUserId) => {
    console.log('=== deleteComment called ===', { commentId, profileUserId });
    const url = base_api_url + 'comment/deleteComment';
    const data = {
        commentId: commentId,
        profileUserId: profileUserId
    };
    const method = 'POST';
    setSpiner('block');
    try {
        const rep = await fetchData(url, data, method);
        console.log('deleteComment response:', rep);
        return rep;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    } finally {
        setSpiner('none');
    }
};

	// Mark comment as useful
	const markCommentUseful = async (commentId, profileUserId) => {
		const url = base_api_url + 'comment/markUseful';
		const data = {
			commentId: commentId,
			profileUserId: profileUserId
		};
		const method = 'POST';
		setSpiner('block');
		try {
			const rep = await fetchData(url, data, method);
			return rep;
		} catch (error) {
			console.error('Error marking comment as useful:', error);
			throw error;
		} finally {
			setSpiner('none');
		}
	};

	// Report abusive comment
	const reportCommentAbuse = async (commentId, profileUserId, abuseReason) => {
		const url = base_api_url + 'comment/reportAbuse';
		const data = {
			commentId: commentId,
			profileUserId: profileUserId,
			abuseReason: abuseReason
		};
		const method = 'POST';
		setSpiner('block');
		try {
			const rep = await fetchData(url, data, method);
			return rep;
		} catch (error) {
			console.error('Error reporting comment:', error);
			throw error;
		} finally {
			setSpiner('none');
		}
	};

	
	// Add reply to comment
	const addCommentReply = async (replyData) => {
		const url = base_api_url + 'comment/response/edit';
		const data = {
			commentResponseId: replyData.commentResponseId || null,
			commentId: replyData.commentId,
			profileUserId: replyData.profileUserId,
			commentResponseText: replyData.replyText,
			enabled: true,
			locale: replyData.locale || 'en'  // Add locale
		};
		const method = 'POST';
		setSpiner('block');
		try {
			const rep = await fetchData(url, data, method);
			return rep;
		} catch (error) {
			console.error('Error adding reply:', error);
			throw error;
		} finally {
			setSpiner('none');
		}
	};

	

	//  Consultation date
	const [ currentConsultationDate, setCurrentConsultationDate ] = useState( null );
	//  Consultation pet
	const [ currentConsultationPet, setCurrentConsultationPet ] = useState( null );
	//   Consultation recommended speciality
	const [ recommendedSpecialityId, setRecommendedSpecialityId ] = useState( null );
	//  Consultation recommended clinic
	const [ recommendedClinicTypeId, setRecommendedClinicTypeId ] = useState( null );
	//  Consultation timeslot
	const [ consultationTimeslot, setConsultationTimeslot ] = useState( null );
	//  Consultation selected vet
	const [ consultationSelectedVet, setConsultationSelectedVet ] = useState( null );
	//  selected consultation date from vet profile page
	const [ consultationSelectedDate, setConsultationSelectedDate ] = useState( null );


	// ──────────────────────────────────────────────────────────────────────────────
	// ADMIN VETERINARIAN MANAGEMENT FUNCTIONS
	// ──────────────────────────────────────────────────────────────────────────────

	/**
	 * Get all veterinarians (admin only)
	 * @param {Object} options - Filter options
	 * @param {boolean} options.showDisabled - Include disabled profiles
	 * @param {string} options.status - Filter by status: 'active', 'disabled', 'vacation', 'all'
	 * @param {string} options.search - Search by name or email
	 */
	const getAllVeterinarians = async (options = {}) => {
		try {
			const params = new URLSearchParams();
			if (options.showDisabled) params.append('showDisabled', 'true');
			if (options.status && options.status !== 'all') params.append('status', options.status);
			if (options.search) params.append('search', options.search);
			
			const url = base_api_url + 'admin/vet/list' + (params.toString() ? '?' + params.toString() : '');
			// const response = await fetch(url, {
				// method: 'GET',
				// headers: {
					// 'Accept': 'application/json',
					// 'Authorization': 'Bearer ' + getToken() // Add auth if needed
				// },
			// });
			const response = await fetchData(url, '', 'GET');
			// const data = await response.json();
			return response;
		} catch (error) {
			console.error('Error fetching veterinarians:', error);
			return { success: false, veterinarians: [], message: error.message };
		}
	};

	/**
	 * Admin: Create a veterinarian profile without an account.
	 * Requires only nom + phone. Any other known profile field can be
	 * included and will be saved immediately (specialiteId, vetTitleId,
	 * vetoModeId, languageIds, tarifs, etc. — all optional).
	 * @param {Object} vetData
	 */
	const adminCreateVeterinarian = async (vetData) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify(vetData)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error creating veterinarian:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * PUBLIC: Validate an invitation token and get pre-fill data for the
	 * vet signup page.
	 * @param {string} token
	 */
	const checkVetInvitation = async (token) => {
		try {
			const response = await fetch(base_api_url + 'vet/invitation/check?token=' + encodeURIComponent(token), {
				method: 'GET',
				headers: { 'Accept': 'application/json' },
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error checking invitation:', error);
			return { valid: false, message: error.message };
		}
	};

	/**
	 * PUBLIC: Complete an invited vet's signup.
	 * @param {Object} payload - { token, email, password }
	 */
	const completeVetInvitation = async (payload) => {
		try {
			const response = await fetch(base_api_url + 'vet/invitation/complete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify(payload)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error completing invitation signup:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Update a veterinarian's profile (partial update — only send
	 * the fields that changed).
	 * @param {number} profileVetoId
	 * @param {Object} vetData
	 */
	const adminUpdateVeterinarian = async (profileVetoId, vetData) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId, ...vetData })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error updating veterinarian:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Send (or resend) an invitation to an admin-created, unclaimed vet.
	 * Returns { success, token, vetName, email, phone } for the caller to
	 * build the WhatsApp deep link / email itself.
	 * @param {number} profileVetoId
	 */
	const adminSendVetInvitation = async (profileVetoId) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/invite', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error sending veterinarian invitation:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Disable a veterinarian profile
	 * @param {number} profileVetoId - The vet profile ID
	 * @param {string} reason - Reason for disabling
	 * @param {number} adminUserId - ID of admin performing action
	 */
	const adminDisableVeterinarian = async (profileVetoId, reason, adminUserId) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/disable', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId, reason, adminUserId })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error disabling veterinarian:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Enable a veterinarian profile
	 * @param {number} profileVetoId - The vet profile ID
	 */
	const adminEnableVeterinarian = async (profileVetoId) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/enable', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error enabling veterinarian:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Update vet verification status
	 * @param {number} profileVetoId - The vet profile ID
	 * @param {string} statusCode - 'verified', 'pending', 'rejected', 'not_submitted'
	 * @param {string} notes - Optional notes about verification
	 */
	const adminUpdateVerificationStatus = async (profileVetoId, statusCode, notes = null) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/update-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId, statusCode, notes })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error updating verification status:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Get vet profile details
	 * @param {number} profileVetoId - The vet profile ID
	 */
	const adminGetVetDetails = async (profileVetoId) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/details?profileVetoId=' + profileVetoId, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
				},
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching vet details:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Get vet statistics
	 * @param {number} profileVetoId - The vet profile ID
	 */
	const adminGetVetStatistics = async (profileVetoId) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/statistics?profileVetoId=' + profileVetoId, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
				},
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching vet statistics:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Admin: Delete vet profile (soft delete)
	 * @param {number} profileVetoId - The vet profile ID
	 * @param {string} reason - Reason for deletion
	 */
	const adminDeleteVeterinarian = async (profileVetoId, reason) => {
		try {
			const response = await fetch(base_api_url + 'admin/vet/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId, reason })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error deleting veterinarian:', error);
			return { success: false, message: error.message };
		}
	};

	// ──────────────────────────────────────────────────────────────────────────────
	// VET SELF-MANAGEMENT FUNCTIONS
	// ──────────────────────────────────────────────────────────────────────────────

	/**
	 * Get current vet profile status
	 * @param {number} profileVetoId - The vet profile ID
	 */
	const getVetStatus = async (profileVetoId) => {
		try {
			const response = await fetch(base_api_url + 'vet/status?profileVetoId=' + profileVetoId, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
				},
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching vet status:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Vet: Set vacation mode
	 * @param {Object} params - Vacation parameters
	 * @param {number} params.profileVetoId - The vet profile ID
	 * @param {string} params.startDate - Start date (Y-m-d H:i:s)
	 * @param {string} params.endDate - End date (Y-m-d H:i:s)
	 * @param {string} params.message - Vacation message
	 */
	const setVacationMode = async (params) => {
		try {
			const response = await fetch(getVetStatus + 'vet/set-vacation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify(params)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error setting vacation mode:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Vet: Disable own profile
	 * @param {Object} params - Disable parameters
	 * @param {number} params.profileVetoId - The vet profile ID
	 * @param {string} params.reason - Reason for disabling
	 * @param {number} params.duration - Auto-reactivate after days (optional)
	 */
	const disableSelf = async (params) => {
		try {
			const response = await fetch(getVetStatus + 'vet/disable-self', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify(params)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error disabling profile:', error);
			return { success: false, message: error.message };
		}
	};

	/**
	 * Vet: Enable own profile
	 * @param {number} profileVetoId - The vet profile ID
	 */
	const enableSelf = async (profileVetoId) => {
		try {
			const response = await fetch(getVetStatus + 'vet/enable-self', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ profileVetoId })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error enabling profile:', error);
			return { success: false, message: error.message };
		}
	};

	// ── API Call helper (standalone) ──────────────────────────────────────────
	const apiCall = useCallback(async (endpoint, options = {}) => {
	  const url = base_api_url + endpoint.replace(/^\//, '');
	  const method = options.method || 'POST';

	  const fetchOptions = {
		method: method,
		headers: {
		  'Content-Type': 'application/json',
		},
		credentials: 'include',
	  };

	  if (['POST', 'PUT', 'PATCH'].includes(method) && options.body) {
		fetchOptions.body = options.body;
	  }

	  const response = await fetch(url, fetchOptions);
	  const contentType = response.headers.get('content-type');

	  if (contentType && contentType.includes('application/json')) {
		const data = await response.json();
		if (!response.ok) {
		  const error = new Error(data.error || data.message || `API returned status ${response.status}`);
		  error.status = response.status; // ← Add status to error
		  throw error;
		}
		return data;
	  } else {
		const text = await response.text();
		const error = new Error(`API returned status ${response.status} - expected JSON but got HTML`);
		error.status = response.status; // ← Add status to error
		throw error;
	  }
	}, [base_api_url]);

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
// console.log( 'ttttttttttttttttttttttt transports',  transports );
			// veto list
			const vetos = await getVetos();
			setVetos( vetos )

// console.log('vetos changed in context', vetos?.length);

			// veto etablissement
			const etablissements = await getEtablissements();
			
			// Fetch consultation types
			const consultationTypes = await getAllConsultationTypes();
			setAllConsultationTypes(consultationTypes);

			// Fetch consultation statuse
			const consultationStatuses = await getAllConsultationStatuses();
			setAllConsultationStatuses(consultationStatuses);

			setEtablissements( etablissements )
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
	const [ country_estonia, setCountry_estonia ] = useState( '' );
	const [ country_usa, setCountry_usa ] = useState( '' );
	const [ country_uk, setCountry_uk ] = useState( '' );
	const [ country_canada, setCountry_canada ] = useState( '' );

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
				// signIn,
				base_api_url,
				signOut,
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
				defaultLanguageCode,
				defaultSiteLocale,
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
				country_estonia,   // add this
				country_usa,       // add this
				country_uk,        // add this
				country_canada,    // add this
				allSpecialities,
				allEtablissementTypes,
				// validateRppsNumber,
				// validateSiretNumber,
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
				saveLieu,
				getUserLieu,
				getVetoCliniqueInfo,
				vetoCliniqueInfo, 
				setVetoCliniqueInfo,
				setCliniqueVetos,
				selectedVetoClinique,
				setSelectedVetoClinique,
				transports,
				lieuTransportUpdate,
				vetos,
				getVetos,
				refreshVetos,
				recommendedSpecialityId,
				setRecommendedSpecialityId,
				recommendedClinicTypeId,
				setRecommendedClinicTypeId,
				etablissements,
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
				getALieu,
				getVetAutocomplete,
				getTypeSpecialityAutocomplete,
				getPlaceAutocomplete,
				getAVetoProfile,
				currentConsultationDate, 
				setCurrentConsultationDate,
				currentConsultationPet,
				setCurrentConsultationPet,
				consultationPrimaryComplaint,
				consultationSelectedVet,
				setConsultationSelectedVet,
				consultationTimeslot,
				setConsultationTimeslot,
				saveSymtom,
				saveConsultation,
				allConsultationTypes,
				allConsultationStatuses,
				consultationCancel,
				getPetOwnerConsultationList,
				getVetConsultationList,
				consultationAccept,
				getVetoAppointmentRequestNotification,
				getPetConfirmedAppointmentNotification,
				getPetDeclinedAppointmentNotification,
				consultationFinish,
				saveComment,  // Add this
				saveRating,   // Add this
				getVetRating,
				getVetComments,
				deleteComment,
				markCommentUseful,
				reportCommentAbuse,
				addCommentReply,
				professionalIdList,
				professionalIdByCountry,
				getTranslatedMessage,  // Add this
				updateEtablissementPhoto,
				getVetTitles,
				getVetStatuses,
				// admin
				getAllVeterinarians,
				adminCreateVeterinarian,
				adminUpdateVeterinarian,
				adminSendVetInvitation,
				checkVetInvitation,
				completeVetInvitation,
				adminDisableVeterinarian,
				adminEnableVeterinarian,
				adminGetVetDetails,
				adminGetVetStatistics,
				adminUpdateVerificationStatus,
				adminDeleteVeterinarian,
				getVetStatus,
				setVacationMode,
				disableSelf,
				enableSelf,
				getPopularCities,
				setVetos,
				getImpersonationStatus,
				apiCall,
				consultationSelectedDate,
				setConsultationSelectedDate,
				showVetoMode,
				listVetoMode
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