import React, { useState, useEffect, useRef, useContext } from "react";
import dayjs from 'dayjs';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { Space, Modal, Spin, Button, notification, message, Popconfirm, Upload } from 'antd';
import { Form, Input, Select } from 'antd';
import AccountStatusCard from '../AccountStatusCard';
import VerificationSteps from '../VerificationSteps';
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	UserOutlined,
	ShopOutlined,
	CalendarOutlined,
	MedicineBoxOutlined,
} from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import InputCode from "../InputCode";

import Header from '../Header';
import Footer from '../Footer';
import SingleFieldManager from '../SingleFieldManager';
import LanguageSelector from '../LanguageSelector.js';
import CurrencySelector from '../CurrencySelector.js';
import Title from '../Title';
import ModalProfile from '../ModalProfile.js';
import VetName from '../VetName';
// Removed: VetStripeConnect import
// Removed: StripeIcon import

const Profile = (params) => {
	// context
	const {
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		setUser,
	} = useContext(AuthContext);
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
		setSelectedPaymentMethod,
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
		getBase64,
		enableSelf,
	} = useContext(SiteContext);

	const [profile, setProfile] = useState('');
	const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');

	const [countAbsence, setCountAbsence] = useState(0);
	const [countHollydays, setCountHollydays] = useState(0);
	const [aGuest, setAGuest] = useState(false);
	const [selectedLanguageId, setSelectedLanguageId] = useState(user ? user.languageId : defaultLanguageId);
	const [spin, setSpin] = useState('none');

	// veto / etablissement lieu
	const [vetoLieux, setVetoLieux] = useState([]);
	const MAX_LIEUX = 2;

	// Vet location display
	const [vetLocationAddress, setVetLocationAddress] = useState('');
	const [vetLocationCity, setVetLocationCity] = useState('');
	const [vetLocationCountry, setVetLocationCountry] = useState('');

	// Account status state
	const [accountStatus, setAccountStatus] = useState(null);
	const [accountStatusReason, setAccountStatusReason] = useState(null);
	const [reactivateLoading, setReactivateLoading] = useState(false);

	// File upload
	const [uploading, setUploading] = useState(false);
	const [photoError, setPhotoError] = useState('');
	const [profilePhoto, setProfilePhoto] = useState('');
	const [fileList, setFileList] = useState([]);
	const [showUploadList, setShowUploadList] = useState(false);

	// modal photo
	const [isModalPhotoOpen, setIsModalPhotoOpen] = useState(false);

	// Side menu: tracks which section is currently in view, for highlighting
	const [activeSection, setActiveSection] = useState('section-my-account');

	const navigate = useNavigate();

	// ============================================================
	// TIMEZONE HELPER FUNCTIONS
	// ============================================================

	// Profile.js - Replace the formatTimeWithTimezone function with this version
	const formatTimeWithTimezone = (dateStr, timezone = 'UTC') => {
		if (!dateStr) return '—';
		
		try {
			// Parse the date string as a local time
			// The API returns dates in the format "YYYY-MM-DD HH:mm:ss.000000"
			// We need to treat these as local times in the vet's timezone
			
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return '—';
			
			// Get the time components as they are (local time)
			// We don't want to convert, we just want to display the time as-is
			// with the timezone label
			
			const hours = date.getHours();
			const minutes = date.getMinutes();
			const ampm = hours >= 12 ? 'PM' : 'AM';
			const hours12 = hours % 12 || 12;
			const minutesStr = String(minutes).padStart(2, '0');
			const timeStr = `${hours12}:${minutesStr} ${ampm}`;
			
			// Format the timezone nicely
			const displayTz = timezone
				.replace(/_/g, ' ')
				.replace(/\//g, ' / ');
			
			return `${timeStr} (${displayTz})`;
		} catch (e) {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) return '—';
			const hours = date.getHours();
			const minutes = date.getMinutes();
			const ampm = hours >= 12 ? 'PM' : 'AM';
			const hours12 = hours % 12 || 12;
			const minutesStr = String(minutes).padStart(2, '0');
			return `${hours12}:${minutesStr} ${ampm} (UTC)`;
		}
	};

	// Helper function to handle file selection
	const handleFileSelect = (file) => {
		if (file) {
			setFileList([file]);
			setProfilePhoto(file);
			setIsModalPhotoOpen(true);
		}
	};

	useEffect(() => {
		const a = async () => {
			if (isModalPhotoOpen && profilePhoto?.originFileObj) {
				const dataUri = await getBase64(profilePhoto.originFileObj);
				const elt = document.getElementById("profilePhotoId");
				if (elt) elt.src = dataUri;
			}
		}
		a();
	}, [isModalPhotoOpen, fileList]);

	const modalPhotoHandleOk = async () => {
		if (!profilePhoto) {
			setIsModalPhotoOpen(false);
			return;
		}
		
		setUploading(true);
		const formData = new FormData();
		formData.append('profileId', profileId);
		formData.append('userId', userId);
		formData.append('files', profilePhoto.originFileObj || profilePhoto);
		
		try {
			const rep = await profileUpdate(formData, profilePhoto, profileTypeId);
			if (rep) {
				message.success(getAContent('cmp_vetonest.com_TrN9a8bKzV'));
				const random = generateRandomDigits(3);
				setProfileFormUpdated(random);
				// Refresh profile to show new photo
				const updatedProfile = await profileGet(profileId, profileTypeId);
				setUserProfile(updatedProfile);
			} else {
				message.error(getAContent('cmp_vetonest.com_Tk5QwY1LhZ'));
			}
		} catch (error) {
			console.error('Upload error:', error);
			message.error('Erreur lors du téléchargement');
		} finally {
			setUploading(false);
			setIsModalPhotoOpen(false);
		}
	}

	const modalPhotoCancel = () => {
		setIsModalPhotoOpen(false);
	}
	
	const modalPhotoHandleOkClosed = () => {
		console.log('modalPhotoHandleOkClosed')
	}
	
	const modalPhotoConfirmText = () => {
		return getAContent('cmp_vetonest.com_Lf7mU3vRpQ')
	}
	
	const modalPhotoCancelText = () => {
		return getAContent('cmp_vetonest.com_Pa8Rk2sYnB')
	}

	// Handle reactivate account
	const handleReactivateAccount = async () => {
		Modal.confirm({
			title: getAContent('cmp_vetonest.com_ReactivateAccount_Title'),
			content: getAContent('cmp_vetonest.com_ReactivateAccount_Confirm'),
			okText: getAContent('cmp_vetonest.com_Reactivate_Btn'),
			cancelText: getAContent('cmp_vetonest.com_Cancel_Btn'),
			onOk: async () => {
				setReactivateLoading(true);
				try {
					const response = await enableSelf({ profileVetoId: profileId });
					if (response.success) {
						message.success(getAContent('cmp_vetonest.com_AccountReactivated_Success'));
						// Refresh profile data
						const updatedProfile = await profileGet(profileId, profileTypeId);
						setUserProfile(updatedProfile);
						setAccountStatus(updatedProfile.profileStatus || 'active');
						setAccountStatusReason(updatedProfile.disabledReason || updatedProfile.vacationMessage || null);
					} else {
						message.error(response.message || getAContent('cmp_vetonest.com_ReactivateFailed_Error'));
					}
				} catch (error) {
					message.error(getAContent('cmp_vetonest.com_ReactivateFailed_Error'));
				} finally {
					setReactivateLoading(false);
				}
			}
		});
	};

	// Resolve the clinic ID from vetoCliniqueInfo
	const resolveClinicId = (cliniqueObj) => {
		if (!cliniqueObj) return null;
		return cliniqueObj.etablissementId || cliniqueObj.id || null;
	};

	const handleClickGoToClinic = (cliniqueId) => {
		const id = cliniqueId || resolveClinicId(vetoCliniqueInfo);
		if (!id) {
			console.error('handleClickGoToClinic: no clinic ID available', vetoCliniqueInfo);
			return;
		}
		navigate(`/etablissement?userId=${userId}&etablissementId=${id}`);
	};

	const getCLinicLink = (cliniqueId) => {
		const id = cliniqueId || resolveClinicId(vetoCliniqueInfo);
		if (!id) {
			console.warn('getCLinicLink: no clinic ID available', vetoCliniqueInfo);
			return '#';
		}
		return `/etablissement?userId=${userId}&etablissementId=${id}`;
	};

	const [name, setName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [dateNaissance, setDateNaissance] = useState('');
	const [biography, setBiography] = useState('');
	const [profileNom, setProfileNom] = useState('');
	const [sexId, setSexId] = useState('');
	const [selectedCountryId, setSelectedCountryId] = useState(null);
	const [countClinicVets, setCountClinicVets] = useState(0);

	useEffect(() => {
		if (modalProfileIdentityOpen === true) return;

		const fetchProfileData = async () => {
			try {
				// Kick off profile fetch immediately
				const profilePromise = profileGet(profileId, profileTypeId);

				// For vets, fetch clinic info and guest status in parallel
				if (profileTypeId == 2 && profileId) {
					const [vetoCliniqueInfoResult, aGuestResult] = await Promise.all([
						getVetoCliniqueInfo(profileId).catch(e => { console.error('Error fetching clinic info:', e); return null; }),
						isAGuest(profileId).catch(() => false),
					]);

					if (vetoCliniqueInfoResult && !vetoCliniqueInfoResult.error) {
						setVetoCliniqueInfo(vetoCliniqueInfoResult);
						const clinicId = vetoCliniqueInfoResult.etablissementId;
						if (clinicId) {
							const statusId = 2;
							getEtablissementVeto(statusId, clinicId)
								.then(vetos => setCountClinicVets(vetos.length))
								.catch(() => {});
						}
					} else {
						setVetoCliniqueInfo(null);
					}

					setAGuest(aGuestResult);
				}

				// Await the profile (already in-flight)
				const profile = await profilePromise;
				if (profile && !profile.error) {
					setUserProfile(profile);
					setName(profile.nom);
					setFirstName(profile.prenom);
					setSexId(profile.userSexeId);
					setSelectedCountryId(profile.paysDelaConsultationId ?? profile.pays_de_la_consultation_id ?? null);

					const birthDate = profile.dateNaissance ? profile.dateNaissance.date : '';
					const dateNaissanceFormatted = birthDate ? await dateFormater(birthDate) : '';
					setDateNaissance(dateNaissanceFormatted);

					setBiography(profile.biography);
					setProfileNom(profile.nom && truncateString(profile.nom, 12));

					// Fetch timeslot, absences, hollydays in parallel
					const [timeslotObj, absencesList, hollydaysList] = await Promise.all([
						getTimeslot(profile.id).catch(() => ({})),
						getAbsences(profile.id).catch(() => []),
						getHollydays(profile.id).catch(() => []),
					]);

					// CRITICAL FIX: Use Object.values() instead of Object.entries()
					// The API returns an object with keys 0-6 (0=Sunday, 6=Saturday)
					// Object.values() gives us the day objects in the correct order
					// Object.entries() would give us [key, value] pairs which breaks the slot lookup
					const timeslotArray = Object.values(timeslotObj || {});
					setTimeslot(timeslotArray);

					setAbsences(absencesList || []);
					setCountAbsence(absencesList?.length || 0);

					setHollydays(hollydaysList || []);
					setCountHollydays(hollydaysList?.length || 0);

					if (profile.profileStatus) {
						setAccountStatus(profile.profileStatus);
						setAccountStatusReason(profile.disabledReason || profile.vacationMessage || null);
					} else {
						setAccountStatus('active');
						setAccountStatusReason(null);
					}
				}
			} catch (error) {
				console.error('Error fetching profile data:', error);
			}
		};

		fetchProfileData();
	}, [modalProfileIdentityOpen, profileFormUpdated, profileId, profileTypeId]);

	const userProfileId = userProfile?.id ?? null;

	// Derive the vet's practice mode from the vetoMode object (new API field)
	// with a backward-compatible fallback to the legacy atHome bool so profiles
	// that haven't been re-saved since the migration still display correctly.
	const practiceMode = userProfile?.vetoMode?.name
		?? ( userProfile?.atHome === true  ? 'home'
		   : userProfile?.atHome === false ? 'clinic'
		   : null );
	const userProfileAtHome    = practiceMode === 'home';   // legacy alias — kept for safety
	const isOnlineOnlyVet      = practiceMode === 'online';

	const vetoCliniqueInfoId = vetoCliniqueInfo?.etablissementId ?? null;

	useEffect(() => {
		const a = async () => {
			if (profileTypeId == 2) {
				var vetoLieux = [];

				// Online-only vets have no physical location — skip both fetches
				if (isOnlineOnlyVet) {
					// nothing to load
				} else if (userProfileAtHome) {
					const data = { profileVetoId: userProfileId };
					vetoLieux = await getAVetoLieux(data);
				} else if (!userProfileAtHome && vetoCliniqueInfoId) {
					const data = { etablissementId: vetoCliniqueInfoId };
					vetoLieux = await getAVetoLieux(data);
				}
				setVetoLieux(vetoLieux);

				if (vetoLieux.length) {
					const firstLieu = vetoLieux[0];
					setVetLocationAddress(firstLieu.adresse || '');
					const vetCity = await getAContent( firstLieu.villeTagRef );
					await setVetLocationCity( vetCity );  
					const vetCountry = await getAContent( firstLieu.paysTagRef );
					await setVetLocationCountry( vetCountry );
				} else {
					setVetLocationAddress('');
					setVetLocationCity('');
					setVetLocationCountry('');
				}
			}
		}

		a()
	}, [vetoCliniqueInfoId, userProfileId, userProfileAtHome, profileFormUpdated, profileId, profileTypeId]);

	// ============================================================
	// BUILD FUNCTIONS WITH TIMEZONE SUPPORT
	// ============================================================

	// Build timeslot with timezone support
	// Profile.js - Updated BuildTimeslot with Intl.DateTimeFormat using siteLocale

	const BuildTimeslot = () => {
		if (!timeslot || !timeslot.length) return null;

		const vetTimezone = userProfile?.timezone || 'UTC';

		const getHoraireWithTz = (start, end) => {
			const startStr = formatTimeWithTimezone(start, vetTimezone);
			const endStr = formatTimeWithTimezone(end, vetTimezone);
			const tzMatch = startStr.match(/\(([^)]+)\)$/);
			const tzLocation = tzMatch ? tzMatch[1] : vetTimezone;
			const startTime = startStr.replace(` (${tzLocation})`, '');
			const endTime = endStr.replace(` (${tzLocation})`, '');
			return `${startTime} – ${endTime} (${tzLocation})`;
		};

		const getFieldName = (type) => {
			if (type == 1) return 'Opened'
			if (type == 2) return 'Closed'
			if (type == 3) return 'Absence'
			if (type == 4) return 'Hollydays'
			return ''
		}

		const getStatus = (type) => {
			if (type == 1) return 'opened'
			if (type == 2) return 'closed'
			if (type == 3) return 'absent'
			if (type == 4) return 'hollydays'
			return ''
		}

		// Get localized day name using Intl.DateTimeFormat with siteLocale
		const getLocalizedDayName = (index) => {
			// index: 0=Sunday, 1=Monday, etc.
			// Create a date that falls on the correct day of the week
			const date = new Date();
			const diff = (date.getDay() - index + 7) % 7;
			date.setDate(date.getDate() - diff);
			
			// Use siteLocale (fr, en, es, de, it, ee) or fallback to 'en'
			const locale = siteLocale || 'en';
			return date.toLocaleDateString(locale, { weekday: 'long' });
		};

		const getMonthName = (monthNumber) => {
			const date = new Date(2000, monthNumber - 1, 1);
			const locale = siteLocale || 'en';
			return date.toLocaleDateString(locale, { month: 'short' });
		}

		// Monday first: the API numbers days 0=Sunday..6=Saturday, so shifting by
		// six and wrapping puts Monday at 0 and Sunday last.
		const mondayFirst = (dayNumber) => (Number(dayNumber) + 6) % 7;

		const orderedSlots = [...timeslot].sort(
			(a, b) => mondayFirst(a.dayNumber) - mondayFirst(b.dayNumber)
		);

		return orderedSlots.map((slot, index) => {
			// Label from the slot's own day, not its position: the two only agreed
			// while the list happened to arrive in Sunday-first order.
			const dayName = getLocalizedDayName(Number(slot.dayNumber));
			let displayValue;

			if (slot.opened) {
				const timeRange = getHoraireWithTz(slot.startTime.date, slot.endTime.date);
				displayValue = `${dayName}: ${timeRange}`;
			} else {
				const datePart = slot.closedDate ? 
					' ' + dayjs(slot.closedDate.date).format('DD') + ' ' + getMonthName(dayjs(slot.closedDate.date).format('MM')) : '';
				const status = getStatus(slot.type);
				const closedText = getAContent('cmp_vetonest.com_Ho2Kx9bFmC') || 'closed';
				displayValue = `${dayName}${datePart}: ${closedText}`;
			}

			return (
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'timeslot_' + index}
						params={{
							fieldName: getFieldName(slot.type),
							title: slot.opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
							nom: slot.nom ? slot.nom : '',
							description: slot.description ? slot.description : '',
							placeholder: getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
							value: displayValue,
							style: slot.opened ? 'opened' : 'closed',
							selectedAbsenceId: slot.type == 3 ? slot.id : '',
							startTime: slot.opened ? slot.startTime.date : '',
							endTime: slot.opened ? slot.endTime.date : '',
							opened: slot.opened ? slot.opened : '',
							day: dayName,
							// The real day of the week, not the row position: the modal sends
							// this straight back as dayNumber, so an index would write to the
							// wrong day now that the list is ordered from Monday.
							dayId: Number(slot.dayNumber),
							timeSlotId: slot.timeSlotId,
							type: getFieldName(slot.type) == 'Hollydays' ? '' : 2,
						}}
					/>
				</div>
			)
		})
	}

	// Build absence
	const BuildAbsence = () => {
		if (!absences || !absences.length) return null;
		
		return absences.map((e, index) => {
			const closedDate = new Date(e.closedDate.date);
			// Compact date (no year) — matches the format used for hollydays rows
			const formattedDate = closedDate.toLocaleDateString(siteLocale || 'en-GB', {
				day: 'numeric',
				month: 'short',
			});
			
			// Get localized "Absence" label
			const absenceLabel = getAContent('cmp_vetonest.com_Absence_Label') || 'Absence';
			
			// Get localized "closed" text
			const closedText = getAContent('cmp_vetonest.com_Ho2Kx9bFmC') || 'closed';
			
			// Truncate the name to the same length used for hollydays, for a consistent row width
			const displayName = e.nom ? truncateString(e.nom, 10) : absenceLabel;
			
			// Build display value - compact format, mirrors "name, DD Mon" used elsewhere
			const displayValue = `${displayName}, ${formattedDate}`;
			
			return (
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'absence_' + index}
						params={{
							fieldName: 'Absence',
							title: getAContent('cmp_vetonest.com_Bz7Nq4wYpJ') || 'Edit absence',
							nom: e.nom,
							selectedAbsenceId: e.id,
							description: e.description ? e.description : '',
							placeholder: getAContent('cmp_vetonest.com_Wr2Hc9vXsK'),
							value: displayValue,
							style: 'closed',
							type: 2,
						}}
					/>
				</div>
			);
		});
	}

	// Build system's hollydays
	const BuildHollydays = () => {
		if (!hollydays) return
		const getMonthName = (monthNumber, locale = siteLocale) => {
			const date = new Date();
			return date.toLocaleDateString(locale, { month: 'short' });
		}
		
		return hollydays.map((e, index) =>
			<div className="row singleFieldManager" key={index}>
				<SingleFieldManager
					key={'hollydays_' + index}
					params={{
						fieldName: 'Hollydays',
						title: getAContent('cmp_vetonest.com_Lv5Jm2nRqT'),
						nom: e.nom,
						selectedHollyday: e.id,
						description: e.description ? e.description : '',
						placeholder: getAContent('cmp_vetonest.com_Sf8Yc1pWkZ'),
						value: truncateString(e.nom, 10) + ', ' + dayjs(e.closedDate.date).format('DD') + ' ' + getMonthName(dayjs(e.closedDate.date).format('MM')),
						style: 'closed',
						type: '',
					}}
				/>
			</div>
		)
	}

	// Build veto's Lieux
	const BuildVetoLieux = () => {
		if (!vetoLieux.length) return
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
				{vetoLieux.map((e, index) =>
					<SingleFieldManager
						key={'lieux_' + index}
						params={{
							fieldName: 'Etablissement_lieu',
							lieuId: e.id,
							title: truncateString(e.adresse, 40),
							value: truncateString(e.adresse, 30),
							type: 2,
						}}
					/>
				)}
			</div>
		)
	}

	const getDayName = (dayNumber, locale = siteLocale) => {
		const date = new Date(2000, 0, 1);
		date.setDate(date.getDate() + dayNumber);
		return date.toLocaleDateString(locale, { weekday: 'long' });
	}

	const getMonthName = (monthNumber, locale = siteLocale) => {
		const date = new Date();
		return date.toLocaleDateString(locale, { month: 'short' });
	}

	// separator
	const SectionSeparator = () => (
		<div className="row my-4">
			<div className="col-12">
				<div className="section-separator" />
			</div>
		</div>
	);

	// Reusable section title: icon chip + bold title + gray description.
	// Used to keep every "section-label" column visually consistent across the page.
	const SectionTitle = ({ icon, iconBg = '#FFF7DC', iconColor = '#D9A900', title, description }) => (
		<>
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<span
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '32px',
						height: '32px',
						minWidth: '32px',
						borderRadius: '8px',
						background: iconBg,
						color: iconColor,
						fontSize: '16px',
					}}
				>
					{icon}
				</span>
				<strong style={{ fontSize: '15px' }}>{title}</strong>
			</div>
			{description && (
				<p className="columnLabelText gray" style={{ marginTop: '6px', marginBottom: '0' }}>
					{description}
				</p>
			)}
		</>
	);

	// Side menu items — mirrors the 5 section titles above.
	// "Activity", "My week" and "Veterinary consultation" only render for vet profiles (profileTypeId == 2),
	// so they're filtered out of the menu for other profile types further below.
	const sideMenuItems = [
		{ id: 'section-my-account', label: getAContent('cmp_vetonest.com_Ra1Kp8mYvZ'), icon: <UserOutlined />, iconBg: '#FFF7DC', iconColor: '#D9A900', vetOnly: false },
		// Removed: Payment method menu item
		{ id: 'section-activity', label: getAContent('cmp_vetonest.com_nDHuiDhEz3'), icon: <ShopOutlined />, iconBg: '#E6F7EE', iconColor: '#1AA260', vetOnly: true },
		{ id: 'section-my-week', label: getAContent('cmp_vetonest.com_Kp72Rm84Qs'), icon: <CalendarOutlined />, iconBg: '#FDEFE0', iconColor: '#D9822B', vetOnly: true },
		{ id: 'section-veterinary-consultation', label: getAContent('cmp_vetonest.com_Xp6Qv2mLsR'), icon: <MedicineBoxOutlined />, iconBg: '#FDE8EC', iconColor: '#D63B5C', vetOnly: true },
	];

	// Returns the live height of the sticky header (Header + "Account Settings" title bar).
	// Measuring it instead of hardcoding a number keeps the offset correct even if that
	// header's height changes (different breakpoint, longer title, future redesign, etc).
	const getStickyHeaderOffset = (extraBreathingRoom = 20) => {
		const headerEl = document.querySelector('.sticky-stack');
		const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 140;
		return headerHeight + extraBreathingRoom;
	};

	// Smooth-scrolls to a section, offsetting for the fixed top header so the title isn't hidden behind it.
	const scrollToSection = (id) => {
		const el = document.getElementById(id);
		if (!el) return;
		const headerOffset = getStickyHeaderOffset();
		const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
		window.scrollTo({ top, behavior: 'smooth' });
	};

	// Scroll-spy: highlights the side menu item matching the section currently in view.
	useEffect(() => {
		const sectionIds = sideMenuItems
			.filter((item) => !item.vetOnly || profileTypeId == 2)
			.map((item) => item.id);

		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter(Boolean);

		if (sections.length === 0) return;

		// Keep the scroll-spy's "top of viewport" boundary aligned with the same header
		// height used by scrollToSection, so the highlighted item always matches the
		// section actually sitting just below the header.
		const topMargin = getStickyHeaderOffset(30);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{ rootMargin: `-${topMargin}px 0px -60% 0px`, threshold: 0 }
		);

		sections.forEach((section) => observer.observe(section));
		return () => observer.disconnect();
	}, [profileTypeId, userProfile]);

	// Sticky side menu rendered under the profile photo/name.
	const SideMenu = () => (
		<nav className="profile-side-menu" aria-label="Profile sections">
			{sideMenuItems
				.filter((item) => !item.vetOnly || profileTypeId == 2)
				.map((item) => {
					const isActive = activeSection === item.id;
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => scrollToSection(item.id)}
							className="profile-side-menu-item"
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								width: '100%',
								border: 'none',
								background: isActive ? '#F5F8FF' : 'transparent',
								borderLeft: isActive ? '3px solid #4D6BFE' : '3px solid transparent',
								padding: '8px 10px',
								borderRadius: '6px',
								cursor: 'pointer',
								textAlign: 'left',
								transition: 'background 0.15s, border-color 0.15s',
							}}
						>
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: '26px',
									height: '26px',
									minWidth: '26px',
									borderRadius: '7px',
									background: item.iconBg,
									color: item.iconColor,
									fontSize: '13px',
								}}
							>
								{item.icon}
							</span>
							<span
								style={{
									fontSize: '13px',
									fontWeight: isActive ? 600 : 500,
									color: isActive ? '#1f1f1f' : '#555',
									lineHeight: 1.3,
								}}
							>
								{item.label}
							</span>
						</button>
					);
				})}
		</nav>
	);

	// form
	const [form] = Form.useForm();

	return (
		<>
			<style>{`
				/* Sticky sidebar: photo, name & section menu stay in view while the page scrolls.
				   Disabled on small screens (<992px) since the layout stacks into a single column there
				   and a sticky photo would just eat scroll space above the content. */
				@media (min-width: 992px) {
					.profile-sticky-sidebar {
						position: sticky;
						top: 20px;
						max-height: calc(100vh - 40px);
						overflow-y: auto;
					}
				}
				@media (max-width: 991px) {
					.profile-sticky-sidebar {
						position: static !important;
					}
				}

				.profile-side-menu-item:hover {
					background: #F5F8FF !important;
				}
				.profile-side-menu-item:focus-visible {
					outline: 2px solid #4D6BFE;
					outline-offset: 2px;
				}
			`}</style>
			<div className="sticky-stack">
				<Header />
				<Title title={getAContent('cmp_vetonest.com_9tk5GcZYkq')} />
			</div>

			<ModalProfile params={{
				fieldName: visibleModalName,
				title: visibleModalTitle,
				selectedCountryId: selectedCountryId,
			}}
			/>
			
			<Modal
				title={
					<>
						<ExclamationCircleOutlined style={{ marginRight: 8, color: '#FFDE59' }} />
						<span>{getAContent('cmp_vetonest.com_Jk4Sd7nHrV')}</span>
					</>
				}
				open={isModalPhotoOpen}
				onOk={modalPhotoHandleOk}
				onCancel={modalPhotoCancel}
				afterClose={modalPhotoHandleOkClosed}
				okText={modalPhotoConfirmText()}
				cancelText={modalPhotoCancelText()}
				confirmLoading={uploading}
				styles={{
					body: {
						maxHeight: '400px',
						overflowY: 'auto',
					},
				}}
			>
				<div className="profilePhotoContainerModal" style={{ textAlign: 'center' }}>
					<img
						id="profilePhotoId"
						src={profilePhoto ? (profilePhoto.originFileObj ? URL.createObjectURL(profilePhoto.originFileObj) : profilePhoto) : ''}
						style={{ maxWidth: '100%', borderRadius: '12px' }}
						alt="Preview"
					/>
				</div>
			</Modal>

			<div className="profile-page" style={{ padding: '0 20px', marginTop: '20px' }}>
				<Form form={form}>
					<div className="container-fluid profile-page" style={{ padding: '0 15px' }}>
						<div className="row gx-4">
							{/* LEFT COLUMN : PHOTO & PROFILE INFO */}
							<div className="col-12 col-lg-3" style={{ paddingRight: '30px' }}>
								{/* Sticky wrapper: keeps photo, name & menu in view while the right column scrolls */}
								<div className="profile-sticky-sidebar" style={{ position: 'sticky', top: '190px' }}>
								{/* Photo Section with overlapping upload button */}
								<div className="profile-photo-block" style={{ marginTop: '0', paddingTop: '0' }}>
									<div className="profile-photo-wrapper" style={{ position: 'relative', width: '50%', margin: '0 auto' }}>
									  <img
										className="profile-photo-img"
										src={
										  userProfile?.picture
											? base_url + 'uploads/files/profile/' + userProfile.picture
											: photoDefaultSrc
										}
										alt="Profile"
										style={{ 
										  width: '100%', 
										  borderRadius: '16px',
										  aspectRatio: '1/1',
										  objectFit: 'cover',
										  border: '2px solid #f0f0f0'
										}}
									  />
									  {/* upload button and input remain unchanged */}
									</div>
									<div className="text-center" style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
										{(() => {
											const captionText = getAContent('cmp_vetonest.com_Ph44Pr11Pu') || '';
											if (!profileId) return captionText;
											// Find "public profile" / "profil public" wherever it appears inside the
											// existing CMS string (case-insensitive) and wrap just that part in a link,
											// leaving the rest of the sentence exactly as authored.
											const phrases = ['public profile', 'profil public'];
											const lower = captionText.toLowerCase();
											let matchAt = -1, matchLen = 0;
											for (const phrase of phrases) {
												const idx = lower.indexOf(phrase);
												if (idx !== -1) { matchAt = idx; matchLen = phrase.length; break; }
											}
											if (matchAt === -1) return captionText;
											const before = captionText.slice(0, matchAt);
											const linkText = captionText.slice(matchAt, matchAt + matchLen);
											const after = captionText.slice(matchAt + matchLen);
											return (
												<>
													{before}
													<a
														href={`/vet-profile?vetId=${profileId}`}
														target="_blank"
														rel="noopener noreferrer"
														style={{ color: '#999', textDecoration: 'underline' }}
													>
														{linkText}
													</a>
													{after}
												</>
											);
										})()}
									</div>
								</div>

								{/* Name Section */}
								<div className="profile-name-section text-center" style={{ marginTop: '16px' }}>
									{profileTypeId == 2 ? (
										<h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
											<VetName 
												vet={userProfile}
												showTitle={true}
												format="full"
												withTooltip={true}
											/>
										</h2>
									) : (
										<h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
											{userProfile?.prenom} {userProfile?.nom}
										</h2>
									)}
								</div>

								{/* Side menu: quick anchors to each section below */}
								<div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
									<SideMenu />
								</div>
								</div>
							</div>

							{/* RIGHT COLUMN : CONTENT */}
							<div className="col-12 col-lg-9" style={{ paddingLeft: '30px' }}>
								{/* MY ACCOUNT */}
								<div id="section-my-account" className="row align-items-start mb-3">
									<div className="col-12 col-lg-3">
										<SectionTitle
											icon={<UserOutlined />}
											iconBg="#FFF7DC"
											iconColor="#D9A900"
											title={getAContent('cmp_vetonest.com_Ra1Kp8mYvZ')}
											description={getAContent('cmp_vetonest.com_Pr55St88Mg')}
										/>
										{/* Account Status Card - inside the fields column, below the last field */}
										{profileTypeId == 2 && accountStatus && (
											<div className="mt-4">
												<AccountStatusCard 
													status={accountStatus}
													reason={accountStatusReason}
													onEnable={accountStatus !== 'active' ? handleReactivateAccount : null}
													loading={reactivateLoading}
													disableButton={true}
												/>
											</div>
										)}
										{profileTypeId == 2 && (() => {
											// Same status codes / translation keys as VerificationStatusBadge,
											// so wording stays consistent with the rest of the app.
											const verificationConfig = {
												verified: { color: '#52c41a', key: 'cmp_vetonest.com_verification_verified', fallback: 'Verified' },
												pending: { color: '#faad14', key: 'cmp_vetonest.com_verification_pending', fallback: 'Verification in Progress' },
												rejected: { color: '#ff4d4f', key: 'cmp_vetonest.com_verification_rejected', fallback: 'Verification Failed' },
												not_submitted: { color: '#888', key: 'cmp_vetonest.com_verification_not_submitted', fallback: 'Not Verified' },
											};
											const statusCode = userProfile?.verificationStatus?.code || 'not_submitted';
											const { color, key, fallback } = verificationConfig[statusCode] || verificationConfig.not_submitted;
											return (
												<div className="mt-3" style={{
													padding: '16px 20px',
													background: `${color}10`,
													border: `1px solid ${color}40`,
													borderRadius: '12px',
												}}>
													<div style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>
														{getAContent('cmp_vetonest.com_professional_verification') || 'Professional verification'}
													</div>
													<div style={{ color, fontWeight: 600 }}>
														{getAContent(key) || fallback}
													</div>
												</div>
											);
										})()}
									</div>
									<div className="col-12 col-lg-9">
										<div className="mb-4">
											{getAContent('cmp_vetonest.com_Id99En44Ti')}
										</div>
										<SingleFieldManager
											params={{
												fieldName: 'Email',
												title: getAContent('cmp_vetonest.com_Er7Hk3sBnQ'),
												placeholder: getAContent('cmp_vetonest.com_Um6Jp2vKdL'),
												value: getAContent('cmp_vetonest.com_Zq1Nc8rMbX'),
												type: 2,
											}}
										/>
										<div className="mb-2"></div>
										<SingleFieldManager
											params={{
												fieldName: 'PasswordReset',
												title: getAContent('cmp_vetonest.com_Pa5Ls9nQvW'),
												placeholder: getAContent('cmp_vetonest.com_Ct3Xy6mKrV'),
												value: getAContent('cmp_vetonest.com_Sn0Bd4pYtJ'),
												type: 2,
											}}
										/>
										<div className="mb-2"></div>
										<div className="mb-2">
											{getAContent('cmp_vetonest.com_Language_Label')}
										</div>
										<div className="mb-2"></div>
										<SingleFieldManager
											params={{
												fieldName: 'Language',
												title: getAContent('cmp_vetonest.com_Mr6Qh2vLpS'),
												placeholder: getAContent('cmp_vetonest.com_Ty9Nc3wKbD'),
												value: getAContent('cmp_vetonest.com_Jv4Pm7sQxF'),
												type: 1,
											}}
										/>
										
										<div className="mb-2"></div>
										<div className="mb-2">
											{profileTypeId == 1
												? getAContent('cmp_vetonest.com_hJ9Wv2qXsL')
												: getAContent('cmp_vetonest.com_Tk6Nm4bPrF')}
										</div>
										<div className="mb-2"></div>

										<SingleFieldManager
											params={{
												fieldName: profileTypeId == 1 ? 'Profile' : 'ProfileVeto',
												title: getAContent('cmp_vetonest.com_Yp3Qm9rKsD'),
												placeholder: profileTypeId == 1
													? getAContent('cmp_vetonest.com_Gt4Vz6nLjH')
													: getAContent('cmp_vetonest.com_Nr84Qs29Lp'),
												value: '',
												type: 2,
											}}
										/>

										{profileTypeId == 2 && (
											<div className="mt-3">
												<VerificationSteps vet={userProfile} />
											</div>
										)}

									</div>
								</div>

								<SectionSeparator />
								
								{/* Removed: Payment Method Section */}
								
								{/* Activity area (vet only) */}
								{profileTypeId == 2 && (
									<>
										<div id="section-activity" className="row section-row activity-area-section">
											<div className="col-12 col-lg-3 section-label">
												<SectionTitle
													icon={<ShopOutlined />}
													iconBg="#E6F7EE"
													iconColor="#1AA260"
													title={getAContent('cmp_vetonest.com_nDHuiDhEz3')}
													description={getAContent('cmp_vetonest.com_Cl11Mg99Zon')}
												/>
											</div>
											<div className="col-12 col-lg-9 section-content">
												<p className="mb-3">
													{practiceMode === 'home'   && getAContent('cmp_vetonest.com_Oc4Kx2mLpS')}
													{practiceMode === 'clinic' && getAContent('cmp_vetonest.com_5c0GBBGNHC')}
													{practiceMode === 'online' && (getAContent('cmp_vetonest.com_OnlineOnlyDescription_Label') || 'You offer video consultations only. No physical location is required.')}
													{practiceMode === null     && getAContent('cmp_vetonest.com_5c0GBBGNHC')}
												</p>

												{/* Clinic management — only for clinic-mode vets */}
												{practiceMode === 'clinic' &&
													<div>
														<div className="mt-2">
															{!vetoCliniqueInfo?.etablissementId ? 
																!aGuest ?
																	<SingleFieldManager params={{
																		fieldName: 'Etablissement',
																		title: getAContent('cmp_vetonest.com_Ms8Qp2vLrT'),
																		placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																		value: getAContent('cmp_vetonest.com_Zp5Ln6mQrS'),
																		type: 1,
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
																				onClick={() => handleClickGoToClinic(aGuest.id)}
																			>
																				<i className='fa fa-ambulance'></i>&nbsp;
																				{getAContent('cmp_vetonest.com_LZ4g7ZjhQh')}
																			</a>
																		</div>
																	</div>
																:
																<>
																	<div className='width100per100 marginTop10px'>
																		<SingleFieldManager params={{
																			fieldName: 'Etablissement',
																			title: getAContent('cmp_vetonest.com_Su6Qp0zVtY') + ' ' + (vetoCliniqueInfo?.name ?? ''),
																			placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																			value: vetoCliniqueInfo?.name ?? '',
																			type: 2,
																			goToLink: getCLinicLink(aGuest?.id)
																		}}
																		/>
																	</div>
																	<div className='marginTop2'>
																		<a
																			href={getCLinicLink(resolveClinicId(vetoCliniqueInfo))}
																			className='text-info'
																		>
																			{getAContent('cmp_vetonest.com_Tb91Qw4NcR')} &gt;
																		</a>
																	</div>
																</>
															}
														</div>
														{vetoCliniqueInfo?.etablissementId &&
															<>
																<div className="mt-2">
																	{getAContent('cmp_vetonest.com_Q6FO7QyF7m') + ' (' + countClinicVets + ')'}
																</div>
																<div className="singleFieldManager">
																	<SingleFieldManager params={{
																		fieldName: 'Etablissement_veto',
																		title: getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		placeholder: getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		value: getAContent('cmp_vetonest.com_Ij0RMA6SpM'),
																		cliniqueId: vetoCliniqueInfo?.id,
																		type: 1,
																	}}
																	/>
																</div>
																<div className="mt-4">
																	{getAContent('cmp_vetonest.com_kFunk0HFRg') + ' (' + vetoLieux.length + ')'} 
																</div>
																<SingleFieldManager
																	params={{
																		fieldName: 'Etablissement_lieu',
																		title: getAContent('cmp_vetonest.com_Pj6Rm2vSnQ'),
																		placeholder: getAContent('cmp_vetonest.com_Lc9Xk1bMvT'),
																		value: vetoCliniqueInfo?.name ?? '',
																		type: 1,
																	}}
																/>
																<BuildVetoLieux />
															</>
														}
													</div>
												}

												{/* Location display — only for home-visiting vets */}
												{practiceMode === 'home' && (vetLocationCity || vetLocationCountry) && (
													<div className="row mt-4">
														<div className="col-12">
															<div className="vet-location-box p-3 bg-light rounded">
																{vetLocationAddress && <span>{vetLocationAddress}<br /></span>}
																{vetLocationCity && <span>{vetLocationCity}</span>}
																{vetLocationCountry && <span>, {vetLocationCountry}</span>}
															</div>
														</div>
													</div>
												)}
											</div>
										</div>

										<SectionSeparator />

										{/* Doctor timeslot */}
										<div id="section-my-week" className="row align-items-start mt-5">
											<div className="col-12 col-lg-3">
												<SectionTitle
													icon={<CalendarOutlined />}
													iconBg="#FDEFE0"
													iconColor="#D9822B"
													title={getAContent('cmp_vetonest.com_Kp72Rm84Qs')}
													description={getAContent('cmp_vetonest.com_Sk22Op88Ab')}
												/>
											</div>
											<div className="col-12 col-lg-9">
												<div className="mb-3">
													{getAContent('cmp_vetonest.com_Ox5Qm1vLpT')}
												</div>
												<BuildTimeslot />
												<div className="mb-2">
													{getAContent('cmp_vetonest.com_Bn6Lp3vQrS')}
												</div>
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
												{countAbsence > 0 &&
													<div className="mt-3 mb-2 text-muted small">
														{getAContent('cmp_vetonest.com_Cq1Vm8nLsP')} {countAbsence} {getAContent('cmp_vetonest.com_Zr4Kp6mQtW')}
													</div>
												}
												<BuildAbsence />
											</div>
										</div>

										<SectionSeparator />

										{/* Consultations */}
										<div id="section-veterinary-consultation" className="row align-items-start mt-5">
											<div className="col-12 col-lg-3">
												<SectionTitle
													icon={<MedicineBoxOutlined />}
													iconBg="#FDE8EC"
													iconColor="#D63B5C"
													title={getAContent('cmp_vetonest.com_Xp6Qv2mLsR')}
													description={getAContent('cmp_vetonest.com_Cn33Lt11Hs')}
												/>
											</div>
											<div className="col-12 col-lg-9">
												<Button 
													type="primary"
													onClick={() => navigate('/consultation/vet/list')}
													style={{
														backgroundColor: '#FFDE59',
														borderColor: '#FFDE59',
														color: '#333',
														fontWeight: 600,
														height: 'auto',
														padding: '10px 20px',
														borderRadius: '8px'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = '#e6c84f';
														e.currentTarget.style.borderColor = '#e6c84f';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = '#FFDE59';
														e.currentTarget.style.borderColor = '#FFDE59';
													}}
												>
													{getAContent('cmp_vetonest.com_FLBx5ixGp5')}
												</Button>
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