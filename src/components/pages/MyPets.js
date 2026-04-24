import React, { useState, useEffect, useContext, useCallback } from "react";
import dayjs from 'dayjs';

import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import {
	Modal, Spin, message, Form, Select, Radio,
	Upload, ConfigProvider, DatePicker
} from 'antd';
import { Input } from 'antd';
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	MedicineBoxOutlined,
	CameraOutlined,
} from '@ant-design/icons';

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

import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';
import ModalRemoveAnimal from '../ModalRemoveAnimal';

const { Option } = Select;
const { Dragger } = Upload;

const MyPets = () => {
	// ── Contexts ──────────────────────────────────────────────────────────────
	const {
		profileTypeId,
		profileId,
		isAuthenticated,
	} = useContext(AuthContext);

	const {
		base_url,
		generateRandomDigits,
		setProfileFormUpdated,
		profileFormUpdated,
		getUserPets,
		userPets,
		setUserPets,
		getBase64,
		setSelectedAnimal,
		setModalRemoveAnimalOpen,
		photoAnimalDefaultSrc,
		getAContent,
		especes,
		speciesBreedList,
		setCurrentConsultationPet,
		editUserPets,
		dateFormater,
		siteLanguage,
		signUp_popConfirmPetTitle,
		signUp_popConfirmPetDescription,
		signUp_popConfirmYes,
		signUp_popConfirmDeleteBtn,
	} = useContext(SiteContext);

	const navigate = useNavigate();

	// ── State ─────────────────────────────────────────────────────────────────
	const [loading, setLoading]               = useState(true);
	const [submitting, setSubmitting]         = useState(false);
	const [userTotalAnimal, setUserTotalAnimal] = useState(0);
	const [breedNames, setBreedNames]         = useState({});
	const [modalVisible, setModalVisible]     = useState(false);
	const [editingAnimal, setEditingAnimal]   = useState(null);
	const [form]                               = Form.useForm();

	// Species / Breeds (mirrors ModalProfile logic)
	const [especeSelectedId, setEspeceSelectedId] = useState(null);
	const [raceSelectedId, setRaceSelectedId]     = useState(null);
	const [races, setRaces]                       = useState([]);
	const [showBreeds, setShowBreeds]             = useState('none');
	const [breedSpinner, setBreedSpinner]         = useState(false);

	// Animal form fields (mirrors ModalProfile state names)
	const [animalName, setAnimalName]                   = useState('');
	const [animalNameError, setAnimalNameError]         = useState('');
	const [animalSexe, setAnimalSexe]                   = useState(null);
	const [animalSexeError, setAnimalSexeError]         = useState('');
	const [animalInsurance, setAnimalInsurance]         = useState(null);
	const [animalInsuranceError, setAnimalInsuranceError] = useState('');
	const [animalDateNaissance, setAnimalDateNaissance] = useState('');
	const [animalDateNaissanceRaw, setAnimalDateNaissanceRaw] = useState('');
	const [animalDateNaissanceError, setAnimalDateNaissanceError] = useState('');
	const [animalBirthDatePickerValue, setAnimalBirthDatePickerValue] = useState(null);
	const [animalEspeceError, setAnimalEspeceError]     = useState('');
	const [animalRaceError, setAnimalRaceError]         = useState('');

	// Photo (mirrors ModalProfile Upload props)
	const [animalPhoto, setAnimalPhoto]   = useState('');
	const [animalPhotoError]              = useState('');
	const [fileList, setFileList]         = useState([]);
	const [showUploadList]                = useState(false);

	// Remove modal
	const [removeModalVisible, setRemoveModalVisible] = useState(false);
	const [animalToRemove, setAnimalToRemove]         = useState(null);

	// ── Date picker locale (mirrors ModalProfile) ─────────────────────────────
	const getDatePickerLocale = useCallback(() => {
		const lang = siteLanguage || 'fr';
		if (lang === 'en') return locale_en;
		if (lang === 'es') return locale_es;
		if (lang === 'de') return locale_de;
		if (lang === 'it') return locale_it;
		return locale_fr;
	}, [siteLanguage]);

	const getDateFormatLocale = useCallback(() => {
		const lang = siteLanguage || 'fr';
		if (lang === 'en') return 'MM/DD/YYYY';
		return 'DD/MM/YYYY';
	}, [siteLanguage]);

	// ── Name validator (mirrors ModalProfile) ────────────────────────────────
	const nameValidator = (name) =>
		/^[A-Za-z0-9éàèêêâäë]+([-' ]?[A-Za-z0-9éàèêêâäë]+)*$/.test(name);

	// ── Handlers that mirror ModalProfile exactly ─────────────────────────────

	const handleChangeAnimalName = (e) => {
		const data = e.target.value;
		setAnimalName(data);
		let err = '';
		if (data && !nameValidator(data))
			err = getAContent('cmp_vetonest.com_c9QpA2mLfs');
		setAnimalNameError(err);
	};

	const handleChangeAnimalEspece = async (specieId) => {
		setBreedSpinner(true);
		const breeds = await speciesBreedList(specieId);
		setRaces(breeds || []);
		setShowBreeds('');
		setEspeceSelectedId(specieId);
		setRaceSelectedId(null);
		form.setFieldValue('Race', null);
		setBreedSpinner(false);
		setAnimalEspeceError('');
		form.validateFields();
	};

	const handleChangeAnimalRace = (raceId) => {
		setRaceSelectedId(raceId);
		setAnimalRaceError('');
		form.validateFields();
	};

	const handleChangeAnimalSex = (e) => {
		setAnimalSexe(e.target.value);
		setAnimalSexeError('');
		form.validateFields();
	};

	const handleChangeAnimalInsurance = (e) => {
		setAnimalInsurance(e.target.value);
		setAnimalInsuranceError('');
		form.validateFields();
	};

	const handleAnimalBirthDateChange = async (date) => {
		if (!date) {
			setAnimalDateNaissance('');
			setAnimalDateNaissanceRaw('');
			setAnimalBirthDatePickerValue(null);
			return;
		}
		const dateStr = date.format('YYYY-MM-DD');
		const formatedDate = await dateFormater(dateStr);
		setAnimalDateNaissance(formatedDate);
		setAnimalDateNaissanceRaw(dateStr);
		setAnimalBirthDatePickerValue(null);
		setAnimalDateNaissanceError('');
		form.validateFields();
	};

	// Upload props (mirrors ModalProfile props object)
	const uploadProps = {
		accept: '.png,.jpg,.jpeg',
		listType: 'picture',
		fileList,
		multiple: false,
		maxCount: 1,
		showUploadList,
		className: 'avatar-uploader',
		onChange(info) {
			const newFileList = [...info.fileList];
			setFileList(newFileList);
			setAnimalPhoto(info.file);
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};

	// ── Load animal photo preview (mirrors ModalProfile useEffect on fileList) ─
	useEffect(() => {
		if (!animalPhoto?.originFileObj) return;
		const a = async () => {
			const dataUri = await getBase64(animalPhoto.originFileObj);
			const elt = document.getElementById('animalPhotoIdMyPets');
			if (elt) elt.src = dataUri;
		};
		a();
	}, [fileList]);

	// ── Species display name ──────────────────────────────────────────────────
	const getEspeceName = useCallback((especeId) => {
		if (!especes?.length) return '—';
		const esp = especes.find(j => j.id === especeId);
		return esp ? esp.nom : '—';
	}, [especes]);

	// ── Date formatter for card display ──────────────────────────────────────
	const formatDate = useCallback((dateString) => {
		if (!dateString) return '—';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
		} catch { return '—'; }
	}, []);

	// ── Load pets + species on mount ──────────────────────────────────────────
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			if (!isAuthenticated()) { navigate('/connexion'); return; }
			if (Number(profileTypeId) === 2) { navigate('/profile'); return; }

			const pets = await getUserPets(profileId);
			if (pets?.length) {
				setUserPets(pets);
				setUserTotalAnimal(pets.length);
			} else {
				setUserPets([]);
				setUserTotalAnimal(0);
			}
			setLoading(false);
		};
		loadData();
	}, [profileId, profileFormUpdated]);

	// ── Load breed names for all cards ────────────────────────────────────────
	useEffect(() => {
		const loadBreeds = async () => {
			const map = {};
			for (const pet of userPets) {
				if (pet?.race?.nom) {
					map[pet.id] = pet.race.nom;
				} else if (pet?.espece?.id && pet?.race?.id) {
					try {
						const breeds = await speciesBreedList(pet.espece.id);
						const breed = breeds.find(b => b.id === pet.race.id);
						map[pet.id] = breed ? breed.nom : '—';
					} catch { map[pet.id] = '—'; }
				} else {
					map[pet.id] = '—';
				}
			}
			setBreedNames(map);
		};
		if (userPets?.length) loadBreeds();
	}, [userPets]);

	// ── Reset / populate form (mirrors ModalProfile Effect 2 for Animaux) ─────
	const clearAnimalForm = () => {
		setAnimalName('');
		setAnimalNameError('');
		setAnimalSexe(null);
		setAnimalSexeError('');
		setAnimalInsurance(null);
		setAnimalInsuranceError('');
		setAnimalDateNaissance('');
		setAnimalDateNaissanceRaw('');
		setAnimalDateNaissanceError('');
		setAnimalBirthDatePickerValue(null);
		setEspeceSelectedId(null);
		setRaceSelectedId(null);
		setRaces([]);
		setShowBreeds('none');
		setAnimalEspeceError('');
		setAnimalRaceError('');
		setAnimalPhoto('');
		setFileList([]);
		form.resetFields();
	};

	const openAnimalModal = async (animal = null) => {
		clearAnimalForm();
		setEditingAnimal(animal);

		if (animal) {
			// Populate — mirrors ModalProfile's Animaux block in useEffect
			const animalNameVal = animal.nom;
			setAnimalName(animalNameVal);
			form.setFieldsValue({ AnimalName: animalNameVal });

			const especeId = animal.espece?.id;
			form.setFieldsValue({ Espece: especeId });
			setEspeceSelectedId(especeId);
			if (especeId) {
				const breeds = await speciesBreedList(especeId);
				setRaces(breeds || []);
				const raceId = animal.race?.id;
				form.setFieldsValue({ Race: raceId });
				setRaceSelectedId(raceId);
				setShowBreeds('');
			}

			const dateStr = animal.dateNaissance?.date || animal.dateNaissance;
			if (dateStr) {
				setAnimalDateNaissanceRaw(dateStr);
				const formated = await dateFormater(dateStr);
				setAnimalDateNaissance(formated);
			}

			const haveInsurance = animal.assurance;
			form.setFieldsValue({ HaveInsurance: haveInsurance });
			setAnimalInsurance(haveInsurance);

			const sexId = animal.sexe?.id;
			form.setFieldsValue({ AnimalSex: sexId });
			setAnimalSexe(sexId);

			const picture = animal.picture;
			setAnimalPhoto(picture);
		}

		setModalVisible(true);
	};

	// ── Submit — mirrors ModalProfile's Animaux submit block exactly ──────────
	const handleAnimalSubmit = async () => {
		setSubmitting(true);

		// Validate errors
		if (animalNameError !== '') {
			message.error(getAContent('cmp_vetonest.com_Af92YTwI3c'));
			setSubmitting(false);
			return;
		}

		// Check empty fields
		let formHasEmpty = false;
		if (!animalName) {
			setAnimalNameError(getAContent('cmp_vetonest.com_Na82Lm51Qw'));
			formHasEmpty = true;
		}
		if (!animalSexe) {
			setAnimalSexeError(getAContent('cmp_vetonest.com_Rp84Bt62Mn'));
			formHasEmpty = true;
		}
		if (!animalDateNaissance) {
			setAnimalDateNaissanceError(getAContent('cmp_vetonest.com_Zu38Qp10Fx'));
			formHasEmpty = true;
		}
		if (!especeSelectedId) {
			setAnimalEspeceError(getAContent('cmp_vetonest.com_Wv62Ak55Lo'));
			formHasEmpty = true;
		}
		if (!raceSelectedId) {
			setAnimalRaceError(getAContent('cmp_vetonest.com_Mf29Dz83Qr'));
			formHasEmpty = true;
		}
		if (animalInsurance == null) {
			setAnimalInsuranceError(getAContent('cmp_vetonest.com_Ba82Hr60Qn'));
			formHasEmpty = true;
		}
		if (formHasEmpty) {
			form.validateFields();
			message.error(getAContent('cmp_vetonest.com_Af92YTwI3c'));
			setSubmitting(false);
			return;
		}

		// Build payload (mirrors ModalProfile exactly)
		const animalData = {
			nomAnimal: animalName,
			sexeId: animalSexe,
			dateDeNaissance: dayjs(animalDateNaissanceRaw).format('YYYY-MM-DD'),
			especeId: especeSelectedId,
			raceId: raceSelectedId,
			profileUserId: profileId,
			assurance: animalInsurance,
			active: 1,
			...(editingAnimal && { carnetAnimalId: editingAnimal.id }),
		};

		const originFileObj = animalPhoto?.originFileObj || null;
		const resp = await editUserPets(animalData, originFileObj);

		setSubmitting(false);

		if (resp === false) {
			message.error(getAContent('cmp_vetonest.com_Jm3eXy90Pa'));
			return;
		}

		message.success(getAContent('cmp_vetonest.com_Fg6kVs22Qe'));
		setModalVisible(false);
		setEditingAnimal(null);
		clearAnimalForm();
		const random = generateRandomDigits(3);
		setProfileFormUpdated(random);

		// Refresh list
		const pets = await getUserPets(profileId);
		if (pets?.length) {
			setUserPets(pets);
			setUserTotalAnimal(pets.length);
		} else {
			setUserPets([]);
			setUserTotalAnimal(0);
		}
	};

	// ── Remove ────────────────────────────────────────────────────────────────
	const handleRemoveClick = (animal) => {
		setAnimalToRemove(animal);
		setRemoveModalVisible(true);
	};

	const handleConfirmRemove = async () => {
		if (!animalToRemove) return;
		setSelectedAnimal(animalToRemove);
		setModalRemoveAnimalOpen(true);
		setRemoveModalVisible(false);
		setAnimalToRemove(null);
	};

	const handleConsultation = (animal) => {
		setCurrentConsultationPet(animal);
		navigate('/consultation/creation');
	};

	const handleModalCancel = () => {
		setModalVisible(false);
		setEditingAnimal(null);
		clearAnimalForm();
	};

	const MAX_ANIMALS = 4;

	// ── Animal Card ───────────────────────────────────────────────────────────
	const AnimalCard = ({ animal }) => {
		const breedNameValue = breedNames[animal.id] || animal.race?.nom || '—';
		const speciesName    = getEspeceName(animal.espece?.id);
		const photoUrl       = animal.picture
			? (animal.picture.startsWith('http') ? animal.picture : base_url + 'uploads/files/pets/' + animal.picture)
			: photoAnimalDefaultSrc;
		const birthDate = formatDate(animal.dateNaissance?.date || animal.dateNaissance);
		const hasSex     = animal.sexe?.id;

		return (
			<div className="pet-card">
				{/* Photo */}
				<div className="pet-photo-wrapper">
					<img
						src={photoUrl}
						alt={animal.nom}
						onError={(e) => { e.target.src = photoAnimalDefaultSrc; }}
					/>
				</div>

				{/* Info */}
				<div className="pet-info">
					<div className="pet-name">🐾 {animal.nom}</div>
					<div className="pet-meta-line">
						<span className="meta-label">{getAContent('cmp_vetonest.com_Sp94Te63Kz')}</span>
						<span className="meta-value">{speciesName}</span>
					</div>
					<div className="pet-meta-line">
						<span className="meta-label">{getAContent('cmp_vetonest.com_Br61Mx80Qp')}</span>
						<span className="meta-value">{breedNameValue}</span>
					</div>
					<div className="pet-meta-line">
						<span className="meta-label">{getAContent('cmp_vetonest.com_ZEuz13yjyi')}</span>
						<span className="meta-value">
							{hasSex == 1
								? getAContent('cmp_vetonest.com_Ml72Ks84Np')
								: getAContent('cmp_vetonest.com_Fm59Qa21Rt')}
						</span>
					</div>
					{animal.dateNaissance && (
						<div className="pet-meta-line">
							<span className="meta-label">{getAContent('cmp_vetonest.com_Kd41Ws97Pl')}</span>
							<span className="meta-value">{birthDate}</span>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="pet-actions">
					<button className="btn-action btn-consult" onClick={() => handleConsultation(animal)} title="Consultation">
						<MedicineBoxOutlined />
						<span>{getAContent('cmp_vetonest.com_consultation') || 'Consultation'}</span>
					</button>
					<button className="btn-action btn-edit" onClick={() => openAnimalModal(animal)} title="Modifier">
						<EditOutlined />
						<span>{getAContent('cmp_vetonest.com_Lp71Sf94Uw') || 'Modifier'}</span>
					</button>
					<button className="btn-action btn-delete" onClick={() => handleRemoveClick(animal)} title="Supprimer">
						<DeleteOutlined />
						<span>{signUp_popConfirmDeleteBtn || 'Supprimer'}</span>
					</button>
				</div>
			</div>
		);
	};

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<>
			<div className="sticky-stack">
				<Header />
				<Title title={getAContent('cmp_vetonest.com_Zr3Hq6mLpT') || 'Mes Animaux'} />
			</div>

			<ModalRemoveAnimal />

			{/* Remove confirmation */}
			<Modal
				title={
					<>
						<span style={{ marginRight: 8, color: '#ff4d4f', fontSize: 18 }}>⚠️</span>
						<span>{signUp_popConfirmPetTitle || 'Supprimer l\'animal'}</span>
					</>
				}
				open={removeModalVisible}
				onOk={handleConfirmRemove}
				onCancel={() => { setRemoveModalVisible(false); setAnimalToRemove(null); }}
				okText={signUp_popConfirmYes || 'Oui'}
				cancelText={signUp_popConfirmDeleteBtn || 'Annuler'}
				okButtonProps={{ danger: true }}
				width={420}
			>
				<p style={{ fontSize: 15, marginBottom: 6 }}>
					{signUp_popConfirmPetDescription
						? <>{signUp_popConfirmPetDescription} <strong>{animalToRemove?.nom}</strong> ?</>
						: <>Êtes-vous sûr de vouloir supprimer <strong>{animalToRemove?.nom}</strong> ?</>
					}
				</p>
			</Modal>

			{/* Main page */}
			<div className="my-pets-page">
				<div className="container">

					{/* Header */}
					<div className="my-pets-header">
						<div className="my-pets-header-content">
							<h1 className="my-pets-title">
								🐾 {getAContent('cmp_vetonest.com_Zr3Hq6mLpT') || 'Mes Animaux'}
							</h1>
							<p className="my-pets-subtitle">
								{getAContent('cmp_vetonest.com_An88Mt11Vr')}
							</p>
						</div>
						{userTotalAnimal < MAX_ANIMALS && (
							<button className="btn-add-animal" onClick={() => openAnimalModal()}>
								<PlusOutlined /> {getAContent('cmp_vetonest.com_Bx9Lm3pQsW') || 'Créer un nouvel animal'}
							</button>
						)}
					</div>

					{/* Counter */}
					<div className="my-pets-stats">
						<span className="stats-badge">
							{getAContent('cmp_vetonest.com_Aq5Fm2vNsR')} {userTotalAnimal} {getAContent('cmp_vetonest.com_Nz7Xk4pTbL')}
						</span>
					</div>

					{/* Grid */}
					{loading ? (
						<div className="loading-container"><Spin size="large" /></div>
					) : userPets.length > 0 ? (
						<div className="animals-grid">
							{userPets.map(animal => <AnimalCard key={animal.id} animal={animal} />)}
						</div>
					) : (
						<div className="empty-state">
							<div className="empty-icon">🐾</div>
							<p>{getAContent('cmp_vetonest.com_Dp8Kx1vQmS') || 'Aucun animal enregistré pour le moment.'}</p>
							<button className="btn-add-animal" onClick={() => openAnimalModal()}>
								<PlusOutlined /> {getAContent('cmp_vetonest.com_Bx9Lm3pQsW') || 'Créer un nouvel animal'}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* ═══════════════════════════════════════════════
			    Add / Edit Modal — mirrors ModalProfile Animaux
			    ═══════════════════════════════════════════════ */}
			<Modal
				title={
					<div className="modal-title">
						{editingAnimal
							? `${getAContent('cmp_vetonest.com_Lp71Sf94Uw') || 'Modifier'} ${editingAnimal.nom}`
							: (getAContent('cmp_vetonest.com_Bx9Lm3pQsW') || 'Créer un nouvel animal')}
					</div>
				}
				open={modalVisible}
				onOk={handleAnimalSubmit}
				onCancel={handleModalCancel}
				confirmLoading={submitting}
				width={560}
				okText={getAContent('cmp_vetonest.com_Ms51qAa28Y') || 'Confirmer'}
				cancelText={getAContent('cmp_vetonest.com_Jd02LmP91w') || 'Annuler'}
				className="animal-modal"
				okButtonProps={{ className: 'modal-ok-btn' }}
				footer={(_, { OkBtn, CancelBtn }) => (
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '4px 0' }}>
						<CancelBtn />
						<OkBtn />
					</div>
				)}
			>
				<Form form={form} layout="vertical">

					{/* ── Animal Name ── */}
					<Form.Item
						label={getAContent('cmp_vetonest.com_Na82Lm51Qw')}
						name="AnimalName"
						rules={[{
							message: animalNameError,
							validator: () => animalNameError ? Promise.reject(animalNameError) : Promise.resolve(),
						}]}
					>
						<Input
							autoComplete="new-password"
							name="field_animal_123"
							className="backgroundYellow rounded10 height40 width100per100 borderNone"
							placeholder={getAContent('cmp_vetonest.com_Rx47Pe92Ts')}
							type="text"
							value={animalName}
							onChange={handleChangeAnimalName}
						/>
					</Form.Item>

					{/* ── Sex ── */}
					<Form.Item
						label={getAContent('cmp_vetonest.com_Rp84Bt62Mn')}
						name="AnimalSex"
						rules={[{
							message: animalSexeError,
							validator: () => animalSexeError ? Promise.reject(animalSexeError) : Promise.resolve(),
						}]}
					>
						<Radio.Group style={{ width: '100%' }} onChange={handleChangeAnimalSex} value={animalSexe}>
							<div className="radio-row">
								<div className="radio-option backgroundYellow rounded10 height40">
									<Radio value={1} className="checkbox-like-radio">
										{getAContent('cmp_vetonest.com_Ml72Ks84Np')}
									</Radio>
								</div>
								<div className="radio-option backgroundYellow rounded10 height40">
									<Radio value={2} className="checkbox-like-radio">
										{getAContent('cmp_vetonest.com_Fm59Qa21Rt')}
									</Radio>
								</div>
							</div>
						</Radio.Group>
					</Form.Item>

					{/* ── Birth date ── */}
					<Form.Item
						name="AnimalBirthdate"
						label={getAContent('cmp_vetonest.com_Kd41Ws97Pl')}
						rules={[{
							message: animalDateNaissanceError,
							validator: () => animalDateNaissanceError ? Promise.reject(animalDateNaissanceError) : Promise.resolve(),
						}]}
					>
						<div className="row backgroundYellow rounded10 height40 width100per100 birthdateField dateSelector"
							style={{ display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
							<div style={{ flex: 1 }}>
								<ConfigProvider
									locale={getDatePickerLocale()}
									theme={{ token: { colorPrimary: '#FFDE59', border: 'none' } }}
								>
									<DatePicker
										value={animalBirthDatePickerValue}
										onChange={handleAnimalBirthDateChange}
										format={getDateFormatLocale()}
										style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
									/>
								</ConfigProvider>
							</div>
							<div style={{ paddingRight: 12, color: '#555' }}>
								<span>{animalDateNaissance}</span>
							</div>
						</div>
					</Form.Item>

					{/* ── Species ── */}
					<Form.Item
						label={getAContent('cmp_vetonest.com_Sp94Te63Kz')}
						name="Espece"
						rules={[{
							message: animalEspeceError,
							validator: () => animalEspeceError ? Promise.reject(animalEspeceError) : Promise.resolve(),
						}]}
					>
						<Select
							variant="borderless"
							className="customAntselect custom-select-rounded backgroundYellow height40 birthdateField borderNone"
							bordered={false}
							value={especeSelectedId}
							onChange={handleChangeAnimalEspece}
							showSearch
							optionFilterProp="label"
							filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
							placeholder={getAContent('cmp_vetonest.com_Xp47Na93Qs')}
						>
							{(especes || []).map((v) => (
								<Option key={v.id} value={v.id}>{v.nom}</Option>
							))}
						</Select>
					</Form.Item>

					{/* ── Breed spinner ── */}
					{breedSpinner && (
						<div style={{ textAlign: 'center', marginBottom: 10 }}>
							<Spin size="small" />
						</div>
					)}

					{/* ── Breed ── */}
					<div style={{ display: showBreeds }}>
						<label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
							{getAContent('cmp_vetonest.com_Br61Mx80Qp')}
						</label>
						<Form.Item
							name="Race"
							rules={[{
								message: animalRaceError,
								validator: () => animalRaceError ? Promise.reject(animalRaceError) : Promise.resolve(),
							}]}
						>
							<Select
								variant="borderless"
								className="customAntselect custom-select-rounded backgroundYellow height40 birthdateField borderNone"
								bordered={false}
								value={raceSelectedId}
								onChange={handleChangeAnimalRace}
								showSearch
								optionFilterProp="label"
								filterSort={(a, b) => (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())}
								placeholder={getAContent('cmp_vetonest.com_Sl9bX2qZm')}
							>
								{races.map((v) => (
									<Option key={v.id} value={v.id}>{v.nom}</Option>
								))}
							</Select>
						</Form.Item>
					</div>

					{/* ── Insurance ── */}
					<Form.Item
						label={getAContent('cmp_vetonest.com_In73Dz45Hw')}
						name="HaveInsurance"
						rules={[{
							message: animalInsuranceError,
							validator: () => animalInsuranceError ? Promise.reject(animalInsuranceError) : Promise.resolve(),
						}]}
					>
						<Radio.Group style={{ width: '100%' }} onChange={handleChangeAnimalInsurance} value={animalInsurance}>
							<div className="radio-row">
								<div className="radio-option backgroundYellow rounded10 height40">
									<Radio value={true} className="checkbox-like-radio">
										{getAContent('cmp_vetonest.com_Hi20Qw67Ps')}
									</Radio>
								</div>
								<div className="radio-option backgroundYellow rounded10 height40">
									<Radio value={false} className="checkbox-like-radio">
										{getAContent('cmp_vetonest.com_Tc91Vm47Bs')}
									</Radio>
								</div>
							</div>
						</Radio.Group>
					</Form.Item>

					{/* ── Photo ── */}
					<Form.Item
						name="AnimalPhoto"
						label={getAContent('cmp_vetonest.com_An87Lp40Zc')}
						rules={[{
							message: animalPhotoError,
							validator: () => animalPhotoError ? Promise.reject(animalPhotoError) : Promise.resolve(),
						}]}
					>
						<div>
							<div className="row marginTop10px" style={{ paddingLeft: 8 }}>
								<Dragger {...uploadProps}>
									<CameraOutlined /> {getAContent('cmp_vetonest.com_Lp71Sf94Uw')}
								</Dragger>
							</div>
							{animalPhoto && (
								<div className="align-items-center" style={{ marginTop: 12 }}>
									<img
										id="animalPhotoIdMyPets"
										className="marginTop10px profilePhotoContainer"
										src={
											typeof animalPhoto === 'string'
												? base_url + 'uploads/files/pets/' + animalPhoto
												: undefined
										}
										style={{ width: '95%', borderRadius: 10 }}
										alt="animal"
									/>
								</div>
							)}
						</div>
					</Form.Item>

				</Form>
			</Modal>

			<Footer />

			<style jsx="true">{`
				/* ── Page layout ─────────────────────────────── */
				.my-pets-page {
					min-height: calc(100vh - 200px);
					padding: 40px 0 60px;
					background: #f5f6fa;
				}

				/* ── Header ──────────────────────────────────── */
				.my-pets-header {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					flex-wrap: wrap;
					margin-bottom: 24px;
					padding-bottom: 20px;
					border-bottom: 2px solid #e0e0e0;
					gap: 16px;
				}
				.my-pets-title {
					font-size: 26px;
					font-weight: 700;
					color: #1a1a1a;
					margin-bottom: 8px;
				}
				.my-pets-subtitle {
					font-size: 14px;
					color: #6c757d;
					line-height: 1.6;
					max-width: 580px;
				}

				/* ── Add button ──────────────────────────────── */
				.btn-add-animal {
					background: #FFDE59;
					border: none;
					padding: 10px 22px;
					border-radius: 30px;
					font-weight: 600;
					font-size: 14px;
					cursor: pointer;
					display: flex;
					align-items: center;
					gap: 8px;
					transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
					white-space: nowrap;
					box-shadow: 0 2px 8px rgba(255,222,89,.4);
				}
				.btn-add-animal:hover {
					background: #f0cc40;
					transform: translateY(-2px);
					box-shadow: 0 4px 14px rgba(255,222,89,.5);
				}

				/* ── Stats badge ─────────────────────────────── */
				.my-pets-stats { margin-bottom: 28px; }
				.stats-badge {
					background: #fff;
					border: 1px solid #dee2e6;
					padding: 6px 16px;
					border-radius: 20px;
					font-size: 13px;
					color: #495057;
					font-weight: 500;
				}

				/* ── Grid ────────────────────────────────────── */
				.animals-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
					gap: 24px;
				}

				/* ── Card ────────────────────────────────────── */
				.pet-card {
					background: #fff;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 2px 12px rgba(0,0,0,.07);
					transition: transform .25s ease, box-shadow .25s ease;
				}
				.pet-card:hover {
					transform: translateY(-4px);
					box-shadow: 0 8px 24px rgba(0,0,0,.11);
				}

				/* Photo */
				.pet-photo-wrapper {
					width: 100%;
					height: 200px;
					overflow: hidden;
					background: #e9ecef;
				}
				.pet-photo-wrapper img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform .3s ease;
				}
				.pet-card:hover .pet-photo-wrapper img { transform: scale(1.04); }

				/* Info section */
				.pet-info {
					padding: 16px 18px 12px;
				}
				.pet-name {
					font-size: 17px;
					font-weight: 700;
					color: #212529;
					margin-bottom: 10px;
				}
				.pet-meta-line {
					display: flex;
					gap: 6px;
					font-size: 13px;
					color: #6c757d;
					margin-bottom: 4px;
				}
				.meta-label { font-weight: 600; color: #343a40; }
				.meta-value { color: #555; }

				/* Actions */
				.pet-actions {
					display: flex;
					border-top: 1px solid #f0f0f0;
					padding: 0;
				}
				.btn-action {
					flex: 1;
					border: none;
					background: transparent;
					padding: 10px 6px;
					font-size: 12px;
					cursor: pointer;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					color: #6c757d;
					font-weight: 500;
					transition: background .15s, color .15s;
				}
				.btn-action + .btn-action { border-left: 1px solid #f0f0f0; }
				.btn-action:hover { background: #f8f9fa; }
				.btn-consult:hover { color: #2d7d46; }
				.btn-edit:hover    { color: #0d6efd; }
				.btn-delete:hover  { color: #dc3545; }
				.btn-action span   { font-size: 11px; }

				/* ── Empty state ──────────────────────────────── */
				.empty-state {
					text-align: center;
					padding: 60px 24px;
					background: #fff;
					border-radius: 16px;
					color: #6c757d;
				}
				.empty-icon { font-size: 48px; margin-bottom: 16px; }

				/* ── Loading ──────────────────────────────────── */
				.loading-container {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: 300px;
				}

				/* ── Modal ───────────────────────────────────── */
				.animal-modal .ant-modal-content { border-radius: 16px; overflow: hidden; }
				.animal-modal .ant-modal-header  { background: #2c6e49; padding: 18px 24px; }
				.animal-modal .ant-modal-title   { color: #fff; font-size: 18px; font-weight: 700; }
				.animal-modal .ant-modal-close   { color: #fff; }
				.animal-modal .ant-modal-body    { background: #5cb85c; padding: 24px; }
				.animal-modal .ant-modal-footer  { background: #5cb85c; border-top: 1px solid rgba(255,255,255,.2); padding: 12px 24px; }

				.modal-ok-btn {
					background: #2c6e49 !important;
					border-color: #2c6e49 !important;
					border-radius: 8px;
					font-weight: 600;
					min-width: 130px;
				}
				.modal-ok-btn:hover {
					background: #1e4f34 !important;
					border-color: #1e4f34 !important;
				}

				/* Radio rows inside modal */
				.radio-row {
					display: flex;
					gap: 12px;
				}
				.radio-option {
					flex: 1;
					display: flex;
					align-items: center;
					padding-left: 14px;
				}

				/* Ant Design overrides inside modal */
				.animal-modal .ant-form-item-label > label { color: #fff; font-weight: 600; font-size: 13px; }
				.animal-modal .backgroundYellow { background: #FFDE59 !important; }
				.animal-modal .ant-upload-drag  { background: rgba(255,255,255,.15) !important; border-color: rgba(255,255,255,.5) !important; color: #fff; }
				.animal-modal .ant-upload-drag:hover { border-color: #fff !important; }
				.animal-modal .ant-select-selector { background: #FFDE59 !important; border: none !important; }

				/* ── Responsive ──────────────────────────────── */
				@media (max-width: 768px) {
					.my-pets-page     { padding: 20px 0 40px; }
					.my-pets-header   { flex-direction: column; }
					.my-pets-title    { font-size: 22px; }
					.animals-grid     { grid-template-columns: 1fr; gap: 16px; }
					.btn-add-animal   { width: 100%; justify-content: center; }
					.radio-row        { flex-direction: column; }
				}
			`}</style>
		</>
	);
};

export default MyPets;