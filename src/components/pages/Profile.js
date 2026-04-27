import React, { useState, useEffect, useContext } from "react";
import dayjs from 'dayjs';

import { useNavigate, Link, useLocation } from 'react-router-dom';
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
// ModalRemoveAnimal removed – no longer needed
import SingleFieldManager from '../SingleFieldManager';
// import ModalEmailValidate from '../ModalEmailValidate';

import LanguageSelector from '../LanguageSelector.js';
import CurrencySelector from '../CurrencySelector.js';

import Title from '../Title';
import ModalProfile from '../ModalProfile.js';

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
		// Removed: getUserPets, userPets, setUserPets, getBase64, setSelectedAnimal, setModalRemoveAnimalOpen, removeAnimalOpen, photoAnimalDefaultSrc, truncateString, speciesBreedList, setCurrentConsultationPet, especes, races
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
	} = useContext(SiteContext);

	const [profile, setProfile] = useState('');
	const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');

	// Removed: userTotalAnimal, breedNames

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

	// File upload
	const { Dragger } = Upload;
	const [uploading, setUploading] = useState(false);
	const [photoError, setPhotoError] = useState('');
	const [profilePhoto, setProfilePhoto] = useState('');
	const [fileList, setFileList] = useState([]);
	const [showUploadList, setShowUploadList] = useState(false);

	const handleBeforeUpload = (file) => {
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
			const a = async () => {
				let newFileList = [...info.fileList];
				setFileList(newFileList);
				setProfilePhoto(info.file);
				await setIsModalPhotoOpen(true);
			}
			a()
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};

	// modal photo
	const [isModalPhotoOpen, setIsModalPhotoOpen] = useState(false);
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
		const data = {
			profileId: profileId,
			userId: userId
		};
		const rep = await profileUpdate(data, profilePhoto, profileTypeId);

		if (rep) {
			message.success(getAContent('cmp_vetonest.com_TrN9a8bKzV'));
			const random = generateRandomDigits(3);
			setProfileFormUpdated(random);
		} else {
			message.error(getAContent('cmp_vetonest.com_Tk5QwY1LhZ'))
		}
		setIsModalPhotoOpen(false);
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

	const navigate = useNavigate();
	const handleClickGoToClinic = (cliniqueId) => {
		var url = '';
		!cliniqueId ?
			url = "/etablissement" + `?userId=${userId}&etablissementId=${vetoCliniqueInfo?.id}`
			:
			url = "/etablissement" + `?userId=${userId}&etablissementId=${cliniqueId}`
		navigate(url);
	}

	const getCLinicLink = (cliniqueId) => {
		var url = '';
		!cliniqueId ?
			url = "/etablissement" + `?userId=${userId}&etablissementId=${vetoCliniqueInfo?.id}`
			:
			url = "/etablissement" + `?userId=${userId}&etablissementId=${cliniqueId}`
		return url;
	}

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
				if (profileTypeId == 2 && profileId) {
					try {
						const vetoCliniqueInfo = await getVetoCliniqueInfo(profileId);
						if (vetoCliniqueInfo && !vetoCliniqueInfo.error) {
							setVetoCliniqueInfo(vetoCliniqueInfo);
						} else {
							console.log('No clinic info found for vet');
							setVetoCliniqueInfo(null);
						}
					} catch (clinicError) {
						console.error('Error fetching clinic info:', clinicError);
						setVetoCliniqueInfo(null);
					}

					const statusId = 2;
					const aGuest = await isAGuest(profileId);
					setAGuest(aGuest);

					if (vetoCliniqueInfo && vetoCliniqueInfo?.id) {
						const vetos = await getEtablissementVeto(statusId, vetoCliniqueInfo?.id);
						setCountClinicVets(vetos.length);
					}
				}

				const profile = await profileGet(profileId, profileTypeId);
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

					const timeslotObj = await getTimeslot(profile.id);
					const timeslotArray = await Object.entries(timeslotObj || {});
					setTimeslot(timeslotArray);

					const absencesList = await getAbsences(profile.id);
					setAbsences(absencesList || []);
					setCountAbsence(absencesList?.length || 0);

					const hollydaysList = await getHollydays(profile.id);
					setHollydays(hollydaysList || []);
					setCountHollydays(hollydaysList?.length || 0);
				}
			} catch (error) {
				console.error('Error fetching profile data:', error);
			}
		};

		fetchProfileData();
	}, [modalProfileIdentityOpen, profileFormUpdated, profileId, profileTypeId]);

	const userProfileId = userProfile?.id ?? null;
	const userProfileAtHome = userProfile?.atHome ?? null;
	const vetoCliniqueInfoId = vetoCliniqueInfo?.id ?? null;

	useEffect(() => {
		const a = async () => {
			// Only fetch lieux for vet profiles – pets removed
			if (profileTypeId == 2) {
				var vetoLieux = [];

				if (userProfileAtHome) {
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
					setVetLocationCity(firstLieu.ville?.nom || '');
					setVetLocationCountry(firstLieu.pays?.nom || '');
				} else {
					setVetLocationAddress('');
					setVetLocationCity('');
					setVetLocationCountry('');
				}
			}
		}

		a()
	}, [vetoCliniqueInfoId, userProfileId, userProfileAtHome, profileFormUpdated, profileId, profileTypeId]);

	// Build timeslot
	const BuildTimeslot = () => {
		if (!timeslot)
			return

		const getHoraire = (dateObj01, dateObj02) => {
			return (
				dayjs(dateObj01).format('HH:ss') + ' - ' +
				dayjs(dateObj02).format('HH:ss')
			)
		};

		const getFieldName = (type) => {
			if (type == 1)
				return 'Opened'
			if (type == 2)
				return 'Closed'
			if (type == 3)
				return 'Absence'
			if (type == 4)
				return 'Hollydays'
		}

		const getStatus = (type) => {
			if (type == 1)
				return 'opened'
			if (type == 2)
				return 'closed'
			if (type == 3)
				return 'absent'
			if (type == 4)
				return 'hollydays'
		}

		return (
			timeslot.map((e, index) =>
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'timeslot_' + index}
						params={{
							fieldName: getFieldName(e[1].type),
							title: e[1].opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
							nom: e[1].nom ? e[1].nom : '',
							description: e[1].description ? e.description : '',
							placeholder: getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
							value: e[1].opened ? getDayName(e[0]) + ': ' +
								getHoraire(e[1].startTime.date, e[1].endTime.date) :
								getDayName(e[0]) + ' ' + (e[1].closedDate ? ' ' + dayjs(e[1].closedDate.date).format('DD') + ' ' + getMonthName(dayjs(e[1].closedDate.date).format('MM')) + ': ' + getStatus(e[1].type) : ': ' + getAContent('cmp_vetonest.com_Nx55Qa02Df')),
							style: e[1].opened ? 'opened' : 'closed',
							selectedAbsenceId: e[1].type == 3 ? e[1].id : '',
							startTime: e[1].opened ? e[1].startTime.date : '',
							endTime: e[1].opened ? e[1].endTime.date : '',
							opened: e[1].opened ? e[1].opened : '',
							day: getDayName(e[0]),
							dayId: e[0],
							timeSlotId: e[1].timeSlotId,
							type: getFieldName(e[1].type) == 'Hollydays' ? '' : 2,
						}}
					/>
				</div>
			)
		)
	}

	// Build absence
	const BuildAbsence = () => {
		if (!absences)
			return

		return (
			absences.map((e, index) =>
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'absence_' + index}
						params={{
							fieldName: 'Absence',
							title: getAContent('cmp_vetonest.com_Bz7Nq4wYpJ'),
							nom: e.nom,
							selectedAbsenceId: e.id,
							description: e.description ? e.description : '',
							placeholder: getAContent('cmp_vetonest.com_Wr2Hc9vXsK'),
							value: dayjs(e.closedDate.date).format('DD') + ' ' +
								getMonthName(dayjs(e.closedDate.date).format('MM')) + ', ' + truncateString(e.nom, 10),
							style: 'closed',
							type: 2,
						}}
					/>
				</div>
			)
		)
	}

	// Build system's hollydays
	const BuildHollydays = () => {
		if (!hollydays)
			return

		return (
			hollydays.map((e, index) =>
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
							value: truncateString(e.nom, 10) + ', ' + dayjs(e.closedDate.date).format('DD') + ' ' +
								getMonthName(dayjs(e.closedDate.date).format('MM')),
							style: 'closed',
							type: '',
						}}
					/>
				</div>
			)
		)
	}

	// Build veto's Lieux
	const BuildVetoLieux = () => {
		if (!vetoLieux.length)
			return

		return (
			vetoLieux.map((e, index) =>
				<>
					<div className="singleFieldManager">
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
						<p>&nbsp;</p>
					</div>
				</>
			)
		)
	}

	const getDayName = (dayNumber, locale = siteLocale) => {
		const date = new Date(2000, 0, 1);
		date.setDate(date.getDate() + dayNumber);
		const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
		return dayName;
	}

	const getMonthName = (monthNumber, locale = siteLocale) => {
		const date = new Date();
		const monthName = date.toLocaleDateString(locale, { month: 'short' });
		return monthName;
	}

	// separator
	const SectionSeparator = () => (
		<div className="row my-4">
			<div className="col-12 col-lg-9 offset-lg-3">
				<div className="section-separator" />
			</div>
		</div>
	);

	// form
	const [form] = Form.useForm();

	return (
		<>
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
				closable={{ 'aria-label': 'Custom Close Button' }}
				open={isModalPhotoOpen}
				onOk={modalPhotoHandleOk}
				onCancel={() => modalPhotoCancel(false)}
				afterClose={modalPhotoHandleOkClosed}
				okText={modalPhotoConfirmText()}
				cancelText={modalPhotoCancelText()}
				styles={{
					body: {
						maxHeight: '400px',
						overflowY: 'auto',
					},
				}}
			>
				<div className="profilePhotoContainerModal">
					<img
						id="profilePhotoId"
						src={profilePhoto}
					/>
				</div>
			</Modal>
			{/* ModalRemoveAnimal removed */}

			<div className="profile-page">
				<Form form={form}>
					<div className="container-fluid profile-page">
						<div className="row gx-4">
							{/* LEFT COLUMN : PHOTO */}
							<div className="col-12 col-lg-3">
								<div className="profile-photo-block text-center">
									<b>{getAContent('cmp_vetonest.com_t1gCGfRTd4')}</b>
									<img
										className="profilePhotoContainer mt-3"
										src={
											userProfile.picture
												? base_url + 'uploads/files/profile/' + userProfile.picture
												: photoDefaultSrc
										}
										style={{ width: '100%' }}
									/>
									<div className="gray">
										{getAContent('cmp_vetonest.com_Ph44Pr11Pu')}
									</div>
									<div className="mt-3">
										<Dragger {...props}>
											<i className="fa fa-camera" />{' '}
											{getAContent('cmp_vetonest.com_Su6Qp0zVtY')}
										</Dragger>
									</div>
								</div>
								<p>&nbsp;</p>
							</div>

							{/* RIGHT COLUMN : CONTENT */}
							<div className="col-12 col-lg-9">
								{/* MY ACCOUNT */}
								<div className="row align-items-start mb-5">
									<div className="col-12 col-lg-3">
										<strong>{getAContent('cmp_vetonest.com_Ra1Kp8mYvZ')}</strong>
										<p className="columnLabelText gray">{getAContent('cmp_vetonest.com_Pr55St88Mg')}</p>
										<p>&nbsp;</p>
									</div>
									<div className="col-12 col-lg-9">
										<div className="mb-4">
											{getAContent('cmp_vetonest.com_Id99En44Ti')}
										</div>
										<div className="marginTop10"></div>
										<SingleFieldManager
											params={{
												fieldName: 'Email',
												title: getAContent('cmp_vetonest.com_Er7Hk3sBnQ'),
												placeholder: getAContent('cmp_vetonest.com_Um6Jp2vKdL'),
												value: getAContent('cmp_vetonest.com_Zq1Nc8rMbX'),
												type: 2,
											}}
										/>
										<div className="marginTop10"></div>
										<SingleFieldManager
											params={{
												fieldName: 'PasswordReset',
												title: getAContent('cmp_vetonest.com_Pa5Ls9nQvW'),
												placeholder: getAContent('cmp_vetonest.com_Ct3Xy6mKrV'),
												value: getAContent('cmp_vetonest.com_Sn0Bd4pYtJ'),
												type: 2,
											}}
										/>
										<div className="marginTop10"></div>
										<div className="mb-2">
											{profileTypeId == 1
												? getAContent('cmp_vetonest.com_hJ9Wv2qXsL')
												: getAContent('cmp_vetonest.com_Tk6Nm4bPrF')}
										</div>
										<div className="marginTop10"></div>
										<SingleFieldManager
											params={{
												fieldName: profileTypeId == 1 ? 'Profile' : 'ProfileVeto',
												title: getAContent('cmp_vetonest.com_Yp3Qm9rKsD'),
												placeholder:
													profileTypeId == 1
														? getAContent('cmp_vetonest.com_Gt4Vz6nLjH')
														: getAContent('cmp_vetonest.com_Nr84Qs29Lp'),
												value: '',
												type: 2,
											}}
										/>
										<div className="marginTop10"></div>
										<div className="mb-2">
											{getAContent('cmp_vetonest.com_Lk8Vm1pYsQ')}
										</div>
										<div className="marginTop10"></div>
										<SingleFieldManager
											params={{
												fieldName: 'Language',
												title: getAContent('cmp_vetonest.com_Mr6Qh2vLpS'),
												placeholder: getAContent('cmp_vetonest.com_Ty9Nc3wKbD'),
												value: getAContent('cmp_vetonest.com_Jv4Pm7sQxF'),
												type: 1,
											}}
										/>
									</div>
								</div>

								<SectionSeparator />

								{/* MY ANIMALS SECTION FULLY REMOVED */}

								{/* Activity area (vet only) */}
								{profileTypeId == 2 && (
									<>
										<div className="row section-row activity-area-section">
											<div className="col-12 col-lg-3 section-label">
												<b>{getAContent('cmp_vetonest.com_nDHuiDhEz3')}</b>
												<p className="columnLabelText gray">{getAContent('cmp_vetonest.com_Cl11Mg99Zon')}</p>
												<p>&nbsp;</p>
											</div>
											<div className="col-12 col-lg-9 section-content">
												<p className="mb-3">
													{userProfile.atHome
														? getAContent('cmp_vetonest.com_Oc4Kx2mLpS')
														: getAContent('cmp_vetonest.com_5c0GBBGNHC')}
												</p>

												{userProfile.atHome && vetoCliniqueInfo &&
													<>
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

												{!userProfile.atHome &&
													<div className="col-md-9">
														<div className="marginTop10">
															{!vetoCliniqueInfo ?
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
																			title: getAContent('cmp_vetonest.com_Su6Qp0zVtY') + ' ' + vetoCliniqueInfo?.nom ?? '',
																			placeholder: getAContent('cmp_vetonest.com_Cn3Xk9bHwV'),
																			value: vetoCliniqueInfo?.nom ?? '',
																			type: 2,
																			goToLink: getCLinicLink(aGuest.id)
																		}}
																		/>
																	</div>
																	<div className='marginTop2'>
																		<a
																			href={getCLinicLink(vetoCliniqueInfo?.id)}
																			className='text-info'
																		>
																			{getAContent('cmp_vetonest.com_Tb91Qw4NcR')} >
																		</a>
																	</div>
																</>
															}
														</div>
														{vetoCliniqueInfo &&
															<>
																<div className="marginTop10px">
																	{getAContent('cmp_vetonest.com_Q6FO7QyF7m') + ' (' +
																		countClinicVets + ')'}
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
																<div className="marginTop25px">
																	{getAContent('cmp_vetonest.com_kFunk0HFRg')}
																</div>
																<div className="singleFieldManager">
																	<SingleFieldManager
																		params={{
																			fieldName: 'Etablissement_lieu',
																			title: getAContent('cmp_vetonest.com_Pj6Rm2vSnQ'),
																			placeholder: getAContent('cmp_vetonest.com_Lc9Xk1bMvT'),
																			value: vetoCliniqueInfo?.name ?? '',
																			type: 1,
																		}}
																	/>
																</div>
																<BuildVetoLieux />
															</>
														}
													</div>
												}

												{(vetLocationCity || vetLocationCountry) && (
													<div className="row mt-4">
														<div className="col-12">
															<div className="vet-location-box p-3 bg-light rounded">
																<strong>{getAContent('cmp_vetonest.com_consultation_location') || 'Consultation location'}</strong><br />
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
										<div className="row align-items-start mt-5">
											<div className="col-12 col-lg-3">
												<strong>{getAContent('cmp_vetonest.com_Kp72Rm84Qs')}</strong>
												<p className="columnLabelText gray">{getAContent('cmp_vetonest.com_Sk22Op88Ab')}</p>
												<p>&nbsp;</p>
											</div>
											<div className="col-12 col-lg-9">
												<div className="mb-3">
													{getAContent('cmp_vetonest.com_Ox5Qm1vLpT')}
												</div>
												<BuildTimeslot />
												<div className="mb-3">
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
												<div className="mb-3">
													{getAContent('cmp_vetonest.com_Cq1Vm8nLsP')}{' '}
													{countAbsence}{' '}
													{getAContent('cmp_vetonest.com_Zr4Kp6mQtW')}
												</div>
												<div className="mt-3">
													<BuildAbsence />
												</div>
											</div>
										</div>

										<SectionSeparator />

										{/* Consultations */}
										<div className="row align-items-start mt-5">
											<div className="col-12 col-lg-3">
												<strong>{getAContent('cmp_vetonest.com_Xp6Qv2mLsR')}</strong>
												<p className="columnLabelText gray">{getAContent('cmp_vetonest.com_Cn33Lt11Hs')}</p>
												<p>&nbsp;</p>
											</div>
											<div className="col-12 col-lg-9">
												<div className="row marginLeft20 marginLeftRight2percent">
													{getAContent('cmp_vetonest.com_FLBx5ixGp5')}
												</div>
												<div className="row">
													<div className="col-md-9 marginLeftRight2percent">
														{getAContent('cmp_vetonest.com_wI6NjnXH8S')}
													</div>
												</div>
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