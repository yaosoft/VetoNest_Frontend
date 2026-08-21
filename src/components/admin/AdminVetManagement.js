// src/components/Admin/AdminVetManagement.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Table, 
    Card, 
    Tag, 
    Button, 
    Modal, 
    message, 
    Spin, 
    Avatar, 
    Input, 
    Space, 
    Tooltip,
    Select,
    Row,
    Col,
    Statistic,
    Drawer,
    Descriptions,
    Divider,
    Alert,
    Tabs,
    Rate,
    Form,
    Collapse,
} from 'antd';
import { 
    UserOutlined, 
    SearchOutlined, 
    ReloadOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    TeamOutlined,
    StopOutlined,
    PlayCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    EyeOutlined,
    FlagOutlined,
	IdcardOutlined,
	UserAddOutlined,
	ClockCircleOutlined,
	SendOutlined,
	EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import HeaderDashboard from '../HeaderDashboard';
import Footer from '../Footer';
import { SiteContext } from '../../context/site';
import { AuthContext } from '../../context/AuthProvider';
import VetName from '../VetName';
import VerificationStatusBadge from '../VerificationStatusBadge';
import dayjs from 'dayjs';
import Title from '../Title';
import 'dayjs/locale/fr';

// Set dayjs locale to French
dayjs.locale('fr');

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const AdminVetManagement = () => {
    const navigate = useNavigate();
    const { user, profileTypeId } = useContext(AuthContext);
    const { 
        getAContent, 
        getAllVeterinarians,
        adminDisableVeterinarian,
        adminEnableVeterinarian,
        adminGetVetDetails,
        adminGetVetStatistics,
        adminUpdateVerificationStatus,
        adminCreateVeterinarian,
        adminUpdateVeterinarian,
        adminSendVetInvitation,
        sendEmail,
        allSpecialities,
        getVetTitles,
        listVetoMode,
        languages,
        countriesAllowed,
        getPaysVilles,
        siteName,
        siteEmail,
        siteDomainName,
        defaultSiteLocale,
        base_url 
    } = useContext(SiteContext);
    
    // State
    const [veterinarians, setVeterinarians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVerification, setFilterVerification] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedVet, setSelectedVet] = useState(null);
    const [vetDetails, setVetDetails] = useState(null);
    const [vetStats, setVetStats] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [disableModalVisible, setDisableModalVisible] = useState(false);
    const [disableReason, setDisableReason] = useState('');
    const [vetToDisable, setVetToDisable] = useState(null);
    const [verificationModalVisible, setVerificationModalVisible] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [vetToVerify, setVetToVerify] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Add Veterinarian modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [vetTitles, setVetTitles] = useState([]);
    const [vetoModes, setVetoModes] = useState([]);
    const [addForm] = Form.useForm();

    // Claim status filter ("pending" = admin-created, not yet claimed)
    const [filterClaimStatus, setFilterClaimStatus] = useState('all');

    // Country/city cascading selects (same pattern as ModalProfile's LieuCountry/LieuCity)
    const [addVetCountryId, setAddVetCountryId] = useState(null);
    const [addVetCities, setAddVetCities] = useState([]);
    const [addVetCitiesLoading, setAddVetCitiesLoading] = useState(false);

    // Invitation sending
    const [invitationLoadingId, setInvitationLoadingId] = useState(null);

    // Edit Veterinarian modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editFetching, setEditFetching] = useState(false);
    const [editingVetId, setEditingVetId] = useState(null);
    const [editForm] = Form.useForm();
    const [editVetCountryId, setEditVetCountryId] = useState(null);
    const [editVetCities, setEditVetCities] = useState([]);
    const [editVetCitiesLoading, setEditVetCitiesLoading] = useState(false);
    const [editVetClaimed, setEditVetClaimed] = useState(false);
    
    // Check admin authentication
    useEffect(() => {
        const isAdminLoggedIn = localStorage.getItem('admin_logged_in');
        const adminData = localStorage.getItem('admin_data');
        const storedAdminData = adminData ? JSON.parse(adminData) : null;
        
        if (!isAdminLoggedIn || isAdminLoggedIn !== 'true' || !storedAdminData || storedAdminData.profileTypeId !== 3) {
            message.error('Accès non autorisé. Veuillez vous connecter.');
            navigate('/admin/login');
            return;
        }
        
        setAuthChecked(true);
    }, [navigate]);
    
    // Fetch veterinarians
    const fetchVeterinarians = useCallback(async () => {
        if (!authChecked) return;
        
        setLoading(true);
        try {
            const response = await getAllVeterinarians({
                showDisabled: true,
                status: filterStatus !== 'all' ? filterStatus : null,
                search: searchText || null
            });
            if (response.success) {
                setVeterinarians(response.veterinarians || []);
            } else {
                message.error(response.message || 'Erreur lors du chargement des vétérinaires');
            }
        } catch (error) {
            console.error('Error fetching veterinarians:', error);
            message.error('Erreur lors du chargement des vétérinaires');
        } finally {
            setLoading(false);
        }
    }, [getAllVeterinarians, filterStatus, searchText, authChecked]);
    
    useEffect(() => {
        if (authChecked) {
            fetchVeterinarians();
        }
    }, [fetchVeterinarians, authChecked]);

    // Load option lists used by the "Add Veterinarian" optional fields
    useEffect(() => {
        if (!authChecked) return;
        (async () => {
            try {
                const titles = await getVetTitles();
                setVetTitles(titles || []);
            } catch (error) {
                console.error('Error fetching vet titles:', error);
            }
            try {
                const modes = typeof listVetoMode === 'function' ? await listVetoMode() : listVetoMode;
                setVetoModes(modes || []);
            } catch (error) {
                console.error('Error fetching veto modes:', error);
            }
        })();
    }, [authChecked, getVetTitles, listVetoMode]);
    
    // View vet details
    const handleViewDetails = async (vet) => {
        setSelectedVet(vet);
        setDrawerVisible(true);
        setDetailsLoading(true);
        
        try {
            const [details, stats] = await Promise.all([
                adminGetVetDetails(vet.id),
                adminGetVetStatistics(vet.id)
            ]);
            setVetDetails(details);
            setVetStats(stats);
        } catch (error) {
            console.error('Error fetching vet details:', error);
            message.error('Erreur lors du chargement des détails');
        } finally {
            setDetailsLoading(false);
        }
    };
    
    // Handle disable
    const handleDisableVet = async () => {
        if (!disableReason.trim()) {
            message.warning('Veuillez fournir une raison pour la désactivation');
            return;
        }
        
        setActionLoading(vetToDisable?.id);
        try {
            const response = await adminDisableVeterinarian(vetToDisable.id, disableReason, user?.userId);
            if (response.success) {
                message.success(response.message);
                setDisableModalVisible(false);
                setDisableReason('');
                setVetToDisable(null);
                fetchVeterinarians();
            } else {
                message.error(response.message || 'Échec de la désactivation');
            }
        } catch (error) {
            message.error('Erreur lors de la désactivation');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Handle enable
    const handleEnableVet = async (vet) => {
        Modal.confirm({
            title: `Activer ${vet.fullName}`,
            content: 'Êtes-vous sûr de vouloir activer ce vétérinaire ? Il apparaîtra dans les résultats de recherche et pourra recevoir des demandes de consultation.',
            okText: 'Oui, activer',
            cancelText: 'Annuler',
            onOk: async () => {
                setActionLoading(vet.id);
                try {
                    const response = await adminEnableVeterinarian(vet.id);
                    if (response.success) {
                        message.success(response.message);
                        fetchVeterinarians();
                    } else {
                        message.error(response.message || 'Échec de l\'activation');
                    }
                } catch (error) {
                    message.error('Erreur lors de l\'activation');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };
    
    // Handle verification status update
    const handleUpdateVerification = async () => {
        setActionLoading(vetToVerify?.id);
        try {
            const response = await adminUpdateVerificationStatus(vetToVerify.id, verificationStatus, verificationNotes);
            if (response.success) {
                const statusText = {
                    'verified': 'vérifié',
                    'pending': 'en attente',
                    'rejected': 'rejeté',
                    'not_submitted': 'non soumis'
                }[verificationStatus] || verificationStatus;
                message.success(`Statut de vérification mis à jour : ${statusText}`);
                setVerificationModalVisible(false);
                setVerificationStatus('');
                setVerificationNotes('');
                setVetToVerify(null);
                fetchVeterinarians();
            } else {
                message.error(response.message || 'Échec de la mise à jour');
            }
        } catch (error) {
            message.error('Erreur lors de la mise à jour');
        } finally {
            setActionLoading(null);
        }
    };
    
    // Build the name used in the invitation ("Dr Jean Dupont").
    // The invite endpoint may or may not return a ready-made name, so fall back
    // to the row we already have in the table before giving up on an empty
    // greeting ("Dear ," in the email).
    const buildVetInvitationName = (record, data) => {
        const fromApi = (data?.vetName || '').trim();
        if (fromApi) return fromApi;

        const title = record?.vetTitle?.code || '';
        const firstName = record?.prenom || data?.firstName || '';
        const lastName = record?.nom || data?.lastName || '';
        const composed = [title, firstName, lastName].filter(Boolean).join(' ').trim();
        if (composed) return composed;

        // Last resort: the local part of the email, so the greeting is never blank.
        const email = data?.email || record?.email || '';
        return email.split('@')[0] || '';
    };

    // Send (or resend) an invitation to an admin-created, unclaimed vet.
    // WhatsApp: opens a pre-filled wa.me link — the admin reviews and hits
    // send themselves (no WhatsApp Business API wired up yet).
    // Email: goes through the existing sendEmail()/user/send pipeline.
    //
    // NOTE: '/inscription-veterinaire?token=...' — update the path segment
    // if your router uses a different route name for the signup page.
    // Update this to match the real signup page route once it's built.
    const handleSendInvitation = async (record) => {
        setInvitationLoadingId(record.id);
        try {
            const data = await adminSendVetInvitation(record.id);

            if (!data || !data.success) {
                message.error(data?.message || "Échec de l'envoi de l'invitation");
                return;
            }

            const vetName = buildVetInvitationName(record, data);
            const firstName = record.prenom || data.firstName || vetName;
            const signupLink = `${window.location.origin}/inscription-veterinaire?token=${data.token}`;
            const waText = `Bonjour ${firstName}, vous avez été ajouté(e) comme vétérinaire sur ${siteName}. Créez votre compte ici : ${signupLink}`;

            const sentChannels = [];

            if (data.phone) {
                const digitsOnly = data.phone.replace(/\D/g, '');
                window.open(`https://wa.me/${digitsOnly}?text=${encodeURIComponent(waText)}`, '_blank');
                sentChannels.push('WhatsApp');
            }

            if (data.email) {
                const emailDomain = data.email.split('@')[1] || '';
                const emailResult = await sendEmail({
                    to_email: data.email,
                    to_domain: emailDomain,
                    subject: `Vous êtes invité(e) à rejoindre ${siteName}`,
                    emailTemplate: 'vet_invitation',
                    // The site default locale (defaultLanguageCode = 'fr'), not the
                    // admin's current siteLocale: the invited vet has no account
                    // yet, and therefore no language preference of their own.
                    siteLocale: defaultSiteLocale,
                    timezone: 'Europe/Paris',
                    // Site variables — vet_invitation.twig prints these in the
                    // header, the body and the footer. They were missing, which is
                    // why the email read "Invitation to join on".
                    siteName: siteName,
                    siteDomain: siteDomainName,
                    siteEmail: siteEmail,
                    // The public site, NOT window.location.origin: the template builds
                    // the header logo from siteURL ({{ siteURL }}/img/logo01.png),
                    // and a dev origin like http://localhost:3001 only resolves on
                    // the machine running the dev server — every other recipient
                    // gets a broken image. The signup link below stays on the
                    // current origin so invitations remain testable in dev.
                    siteURL: `https://${siteDomainName}`,
                    // The template greets {{ userName }}; vetName is kept for the
                    // consultation-style templates that read that key instead.
                    userName: vetName,
                    vetName,
                    invitationUrl: signupLink,
                });
                if (emailResult) {
                    sentChannels.push('Email');
                } else {
                    message.warning("L'email n'a pas pu être envoyé — vérifiez la configuration du template vet_invitation.");
                }
            }

            if (sentChannels.length > 0) {
                message.success(`Invitation envoyée à ${vetName} (${sentChannels.join(' + ')})`);
            } else {
                message.warning(`${vetName} n'a ni email ni téléphone valide pour recevoir l'invitation.`);
            }

            fetchVeterinarians();
        } catch (error) {
            console.error('Error sending invitation:', error);
            message.error("Erreur lors de l'envoi de l'invitation");
        } finally {
            setInvitationLoadingId(null);
        }
    };

    // Open edit modal, prefilled with full vet details
    const handleEditVeterinarian = async (record) => {
        setEditingVetId(record.id);
        setEditModalVisible(true);
        setEditFetching(true);
        setEditVetCountryId(null);
        setEditVetCities([]);

        try {
            const details = await adminGetVetDetails(record.id);
            if (!details || details.success === false) {
                message.error(details?.message || 'Erreur lors du chargement du vétérinaire');
                setEditModalVisible(false);
                return;
            }

            setEditVetClaimed(details.isClaimed !== false);

            editForm.setFieldsValue({
                nom: details.nom,
                prenom: details.prenom,
                phone: details.phone,
                email: details.email,
                phonePro: details.phonePro,
                phoneUrgence: details.phoneUrgence,
                biography: details.biography,
                codePostal: details.codePostal,
                zoneActivite: details.zoneActivite,
                tarifConsultation: details.tarifConsultation,
                tarifConsultationVideo: details.tarifConsultationVideo,
                specialiteId: details.speciality?.id,
                vetTitleId: details.vetTitle?.id,
                vetoModeId: details.vetoMode?.id,
                languageIds: details.languageIds || [],
                lieuCountryId: details.lieuCountryId || undefined,
                lieuCityId: details.lieuCityId || undefined,
            });

            if (details.lieuCountryId) {
                setEditVetCountryId(details.lieuCountryId);
                setEditVetCitiesLoading(true);
                try {
                    const cities = await getPaysVilles(details.lieuCountryId);
                    setEditVetCities(cities || []);
                } catch (error) {
                    console.error('Error fetching cities:', error);
                } finally {
                    setEditVetCitiesLoading(false);
                }
            }
        } catch (error) {
            console.error('Error fetching veterinarian details:', error);
            message.error('Erreur lors du chargement du vétérinaire');
            setEditModalVisible(false);
        } finally {
            setEditFetching(false);
        }
    };

    // Country changed in the Edit Veterinarian form: load its cities
    const handleEditVetCountryChange = async (countryId) => {
        setEditVetCountryId(countryId || null);
        editForm.setFieldsValue({ lieuCityId: undefined });

        if (!countryId) {
            setEditVetCities([]);
            return;
        }

        setEditVetCitiesLoading(true);
        try {
            const cities = await getPaysVilles(countryId);
            setEditVetCities(cities || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setEditVetCities([]);
        } finally {
            setEditVetCitiesLoading(false);
        }
    };

    const handleUpdateVeterinarian = async (values) => {
        setEditLoading(true);
        try {
            const response = await adminUpdateVeterinarian(editingVetId, {
                nom: values.nom,
                prenom: values.prenom,
                phone: values.phone,
                email: editVetClaimed ? undefined : values.email,
                biography: values.biography,
                phonePro: values.phonePro,
                phoneUrgence: values.phoneUrgence,
                codePostal: values.codePostal,
                zoneActivite: values.zoneActivite,
                tarifConsultation: values.tarifConsultation,
                tarifConsultationVideo: values.tarifConsultationVideo,
                specialiteId: values.specialiteId || null,
                vetTitleId: values.vetTitleId || null,
                vetoModeId: values.vetoModeId || null,
                languageIds: values.languageIds || [],
                lieuCountryId: values.lieuCountryId || null,
                lieuCityId: values.lieuCityId || null,
            });

            if (response.success) {
                message.success('Vétérinaire mis à jour');
                setEditModalVisible(false);
                editForm.resetFields();
                setEditVetCountryId(null);
                setEditVetCities([]);
                fetchVeterinarians();
            } else {
                message.error(response.message || 'Échec de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating veterinarian:', error);
            message.error('Erreur lors de la mise à jour du vétérinaire');
        } finally {
            setEditLoading(false);
        }
    };

    // Country changed in the Add Veterinarian form: load its cities, same pattern as ModalProfile
    const handleAddVetCountryChange = async (countryId) => {
        setAddVetCountryId(countryId || null);
        addForm.setFieldsValue({ lieuCityId: undefined });

        if (!countryId) {
            setAddVetCities([]);
            return;
        }

        setAddVetCitiesLoading(true);
        try {
            const cities = await getPaysVilles(countryId);
            setAddVetCities(cities || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setAddVetCities([]);
        } finally {
            setAddVetCitiesLoading(false);
        }
    };

    // Handle create veterinarian (admin dashboard "Add Veterinarian")
    const handleAddVeterinarian = async (values) => {
        const phone = (values.phone || '').trim();

        const duplicate = veterinarians.find(v => v.phone && v.phone.trim() === phone);
        if (duplicate) {
            Modal.confirm({
                title: 'Numéro déjà utilisé',
                content: `${duplicate.fullName} a déjà ce numéro de téléphone. Continuer quand même ?`,
                okText: 'Continuer',
                cancelText: 'Annuler',
                onOk: () => confirmMissingEmailThenSubmit(values),
            });
            return;
        }

        confirmMissingEmailThenSubmit(values);
    };

    const confirmMissingEmailThenSubmit = (values) => {
        if (!values.email) {
            Modal.confirm({
                title: 'Aucun email renseigné',
                content: "Sans email, vous ne pourrez pas envoyer d'invitation à ce vétérinaire plus tard. Ajouter quand même sans email ?",
                okText: 'Ajouter sans email',
                cancelText: 'Retour',
                onOk: () => submitNewVeterinarian(values),
            });
            return;
        }
        submitNewVeterinarian(values);
    };

    const submitNewVeterinarian = async (values) => {
        setAddLoading(true);
        try {
            const response = await adminCreateVeterinarian({
                nom: values.nom,
                phone: values.phone,
                email: values.email || undefined,
                prenom: values.prenom || undefined,
                biography: values.biography || undefined,
                phonePro: values.phonePro || undefined,
                phoneUrgence: values.phoneUrgence || undefined,
                codePostal: values.codePostal || undefined,
                zoneActivite: values.zoneActivite || undefined,
                tarifConsultation: values.tarifConsultation || undefined,
                tarifConsultationVideo: values.tarifConsultationVideo || undefined,
                specialiteId: values.specialiteId || undefined,
                vetTitleId: values.vetTitleId || undefined,
                vetoModeId: values.vetoModeId || undefined,
                languageIds: values.languageIds || undefined,
                lieuCountryId: values.lieuCountryId || undefined,
                lieuCityId: values.lieuCityId || undefined,
                adminUserId: user?.userId,
            });

            if (response.success) {
                message.success(`${values.nom} a été ajouté. Non réservable tant que l'invitation n'est pas acceptée.`);
                setAddModalVisible(false);
                addForm.resetFields();
                setAddVetCountryId(null);
                setAddVetCities([]);
                fetchVeterinarians();
            } else {
                message.error(response.message || "Échec de l'ajout du vétérinaire");
            }
        } catch (error) {
            console.error('Error creating veterinarian:', error);
            message.error("Erreur lors de l'ajout du vétérinaire");
        } finally {
            setAddLoading(false);
        }
    };
    
    // Get status color and text
    const getProfileStatusConfig = (status) => {
        switch(status) {
            case 'active':
                return { color: 'success', text: 'Actif', icon: <CheckCircleOutlined /> };
            case 'disabled':
                return { color: 'error', text: 'Désactivé', icon: <CloseCircleOutlined /> };
            case 'vacation':
                return { color: 'warning', text: 'En vacances', icon: <CalendarOutlined /> };
            default:
                return { color: 'default', text: status, icon: null };
        }
    };
    
    // Table columns
    const columns = [
        {
            title: 'Vétérinaire',
            key: 'name',
            width: 280,
            fixed: 'left',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                        src={record.picture ? base_url + 'uploads/files/profile/' + record.picture : null}
                        icon={<UserOutlined />}
                        size={48}
                    />
                    <div>
                        <VetName 
                            vet={record}
                            showTitle={true}
                            format="full"
                            withTooltip={true}
                        />
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            ID: {record.id} | {record.speciality?.name || 'Généraliste'}
                        </div>
                        {record.isClaimed === false && (
                            <Tag 
                                icon={<ClockCircleOutlined />} 
                                color="gold" 
                                style={{ marginTop: 4, fontSize: '11px' }}
                            >
                                {record.invitationStatus === 'sent' ? 'Invitation envoyée' : 'Non revendiqué'}
                            </Tag>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            width: 220,
            render: (_, record) => (
                <div>
                    <div><MailOutlined style={{ marginRight: 8 }} />{record.email || '—'}</div>
                    <div><PhoneOutlined style={{ marginRight: 8 }} />{record.phone || '—'}</div>
                </div>
            )
        },
        {
            title: 'Localisation',
            dataIndex: 'location',
            key: 'location',
            width: 120,
            render: (location) => location ? <><EnvironmentOutlined /> {location}</> : '—'
        },
		{
			title: 'ID Pro',
			key: 'professionalIds',
			width: 120,
			render: (_, record) => {
				const hasIndividualId = record.individualProfessionalId;
				const hasBusinessId = record.businessProfessionalId;
				
				if (!hasIndividualId && !hasBusinessId) {
					return <Tag icon={<CloseCircleOutlined />} color="default">Non soumis</Tag>;
				}
				
				return (
					<Space direction="vertical" size={2}>
						{hasIndividualId && (
							<Tag icon={<IdcardOutlined />} color="blue" style={{ margin: 0 }}>
								{record.individualProfessionalId}
							</Tag>
						)}
						{hasBusinessId && (
							<Tag icon={<IdcardOutlined />} color="cyan" style={{ margin: 0 }}>
								{record.businessProfessionalId}
							</Tag>
						)}
					</Space>
				);
			}
		},
        {
            title: 'Vérification',
            key: 'verification',
            width: 140,
            render: (_, record) => (
                <VerificationStatusBadge 
                    status={record.verificationStatus}
                    showTooltip={true}
                    showIcon={true}
                    size="small"
                />
            )
        },
        {
            title: 'Statut du profil',
            key: 'profileStatus',
            width: 130,
            render: (_, record) => {
                const config = getProfileStatusConfig(record.profileStatus);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir les détails">
                        <Button 
                            icon={<EyeOutlined />} 
                            size="small"
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Modifier">
                        <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => handleEditVeterinarian(record)}
                        />
                    </Tooltip>
                    
                    <Tooltip title="Mettre à jour la vérification">
                        <Button 
                            icon={<FlagOutlined />} 
                            size="small"
                            onClick={() => {
                                setVetToVerify(record);
                                setVerificationModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    
                    {record.profileStatus === 'active' ? (
                        <Tooltip title="Désactiver le vétérinaire">
                            <Button 
                                danger
                                icon={<StopOutlined />} 
                                size="small"
                                onClick={() => {
                                    setVetToDisable(record);
                                    setDisableModalVisible(true);
                                }}
                                loading={actionLoading === record.id}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Activer le vétérinaire">
                            <Button 
                                type="primary"
                                icon={<PlayCircleOutlined />} 
                                size="small"
                                style={{ background: '#52c41a' }}
                                onClick={() => handleEnableVet(record)}
                                loading={actionLoading === record.id}
                            />
                        </Tooltip>
                    )}
                    {record.isClaimed === false && (
                        <Tooltip title={record.invitationStatus === 'sent' ? "Renvoyer l'invitation" : "Envoyer l'invitation"}>
                            <Button
                                icon={<SendOutlined />}
                                size="small"
                                onClick={() => handleSendInvitation(record)}
                                loading={invitationLoadingId === record.id}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];
    
    // Statistics
    const stats = {
        total: veterinarians.length,
        active: veterinarians.filter(v => v.profileStatus === 'active').length,
        disabled: veterinarians.filter(v => v.profileStatus === 'disabled').length,
        verified: veterinarians.filter(v => v.verificationStatus?.code === 'verified').length,
        pending: veterinarians.filter(v => v.verificationStatus?.code === 'pending').length,
        unverified: veterinarians.filter(v => !v.verificationStatus || v.verificationStatus?.code === 'not_submitted').length,
        pendingInvitation: veterinarians.filter(v => v.isClaimed === false).length,
    };

    // Apply the claim-status filter client-side (list endpoint doesn't filter on it yet)
    const displayedVeterinarians = veterinarians.filter(v => {
        if (filterClaimStatus === 'pending') return v.isClaimed === false;
        if (filterClaimStatus === 'claimed') return v.isClaimed !== false;
        return true;
    });
    
    // Show loading while checking auth
    if (!authChecked) {
        return (
            <>
                <HeaderDashboard />
                <div style={{
                    minHeight: 'calc(100vh - 200px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Spin size="large" />
                    <span style={{ marginLeft: 16 }}>Vérification des droits d'accès...</span>
                </div>
                <Footer />
            </>
        );
    }
    
    return (
        <>
            <div className="sticky-stack">
                <HeaderDashboard />
                <Title title="Gestion des vétérinaires" />
            </div>
            <p>&nbsp;</p>
            <div className="admin-vet-management" style={{ padding: '0 24px' }}>
                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="Total vétérinaires"
                                value={stats.total}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="Actifs"
                                value={stats.active}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="Désactivés"
                                value={stats.disabled}
                                prefix={<StopOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="Vérifiés"
                                value={stats.verified}
                                suffix={`/ ${stats.total}`}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="En attente"
                                value={stats.pending}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="Non vérifiés"
                                value={stats.unverified}
                                valueStyle={{ color: '#888' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card>
                            <Statistic
                                title="En attente d'invitation"
                                value={stats.pendingInvitation}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>
                
                {/* Filters */}
                <Card style={{ marginBottom: '24px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={6}>
                            <Input
                                placeholder="Rechercher par nom ou email..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                onPressEnter={fetchVeterinarians}
                            />
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                style={{ width: '100%' }}
                                className="filter-select"
                                value={filterStatus}
                                onChange={setFilterStatus}
                                placeholder="Filtrer par statut"
                            >
                                <Option value="all">Tous les statuts</Option>
                                <Option value="active">Actifs</Option>
                                <Option value="disabled">Désactivés</Option>
                            </Select>
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                style={{ width: '100%' }}
                                className="filter-select"
                                value={filterVerification}
                                onChange={setFilterVerification}
                                placeholder="Filtrer par vérification"
                            >
                                <Option value="all">Tous</Option>
                                <Option value="verified">Vérifiés</Option>
                                <Option value="pending">En attente</Option>
                                <Option value="not_verified">Non vérifiés</Option>
                            </Select>
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                style={{ width: '100%' }}
                                className="filter-select"
                                value={filterClaimStatus}
                                onChange={setFilterClaimStatus}
                                placeholder="Filtrer par invitation"
                            >
                                <Option value="all">Tous</Option>
                                <Option value="pending">En attente d'invitation</Option>
                                <Option value="claimed">Compte activé</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={6}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={fetchVeterinarians}
                                    loading={loading}
                                >
                                    Actualiser
                                </Button>
                                <Button 
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    onClick={() => setAddModalVisible(true)}
                                    style={{ background: '#FFDE59', border: 'none', color: '#333', fontWeight: 600 }}
                                >
                                    Ajouter un vétérinaire
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
                
                {/* Veterinarians Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={displayedVeterinarians}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} vétérinaires`,
                        }}
                        scroll={{ x: 1300 }}
                    />
                </Card>
                
                {/* Vet Details Drawer */}
                {/* Vet Details Drawer - Update the content */}
				<Drawer
					title={
						<div>
							<VetName 
								vet={selectedVet}
								showTitle={true}
								format="full"
								withTooltip={true}
							/>
						</div>
					}
					width={700}
					open={drawerVisible}
					onClose={() => setDrawerVisible(false)}
					loading={detailsLoading}
				>
					{vetDetails && (
						<div>
							<Descriptions column={1} bordered size="small">
								<Descriptions.Item label="ID du profil">{vetDetails.id}</Descriptions.Item>
								<Descriptions.Item label="ID utilisateur">{vetDetails.userId}</Descriptions.Item>
								<Descriptions.Item label="Email">{vetDetails.email}</Descriptions.Item>
								<Descriptions.Item label="Téléphone">{vetDetails.phone}</Descriptions.Item>
								<Descriptions.Item label="Spécialité">
									{vetDetails.speciality?.name || '—'}
								</Descriptions.Item>
								<Descriptions.Item label="Localisation">
									{vetDetails.location || '—'}
								</Descriptions.Item>
								<Descriptions.Item label="Statut du profil">
									<Tag color={getProfileStatusConfig(vetDetails.profileStatus).color}>
										{getProfileStatusConfig(vetDetails.profileStatus).text}
									</Tag>
								</Descriptions.Item>
								{vetDetails.disabledReason && (
									<Descriptions.Item label="Raison de la désactivation">
										{vetDetails.disabledReason}
									</Descriptions.Item>
								)}
							</Descriptions>
							
							<Divider orientation="left">Identifiants professionnels</Divider>
							
							<Descriptions column={1} bordered size="small">
								<Descriptions.Item label="Statut de vérification">
									<VerificationStatusBadge 
										status={vetDetails.verificationStatus}
										showTooltip={true}
										showIcon={true}
										size="default"
									/>
								</Descriptions.Item>
								
								{/* Individual Professional ID */}
								<Descriptions.Item 
									label={vetDetails.professionalIdMapping?.individualLabel || "Identifiant individuel"}
								>
									{vetDetails.individualProfessionalId ? (
										<Space direction="vertical" size={4}>
											<span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
												{vetDetails.individualProfessionalId}
											</span>
											{vetDetails.professionalIdMapping?.individualExample && (
												<span style={{ fontSize: '11px', color: '#888' }}>
													Exemple: {vetDetails.professionalIdMapping.individualExample}
												</span>
											)}
											{vetDetails.professionalIdMapping?.verificationUrl && (
												<div>
													<Button 
														type="link" 
														size="small"
														icon={<EyeOutlined />}
														onClick={() => window.open(vetDetails.professionalIdMapping.verificationUrl, '_blank')}
														style={{ paddingLeft: 0 }}
													>
														Vérifier sur le site officiel
													</Button>
												</div>
											)}
										</Space>
									) : (
										<span style={{ color: '#999' }}>Non renseigné</span>
									)}
								</Descriptions.Item>
								
								{/* Business Professional ID */}
								<Descriptions.Item 
									label={vetDetails.professionalIdMapping?.businessLabel || "Identifiant d'établissement"}
								>
									{vetDetails.businessProfessionalId ? (
										<Space direction="vertical" size={4}>
											<span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
												{vetDetails.businessProfessionalId}
											</span>
											{vetDetails.professionalIdMapping?.businessExample && (
												<span style={{ fontSize: '11px', color: '#888' }}>
													Exemple: {vetDetails.professionalIdMapping.businessExample}
												</span>
											)}
										</Space>
									) : (
										<span style={{ color: '#999' }}>Non renseigné</span>
									)}
								</Descriptions.Item>
								
								{/* Submission dates */}
								{vetDetails.professionalIdSubmittedAt && (
									<Descriptions.Item label="Soumis le">
										{dayjs(vetDetails.professionalIdSubmittedAt).format('D MMM YYYY HH:mm')}
									</Descriptions.Item>
								)}
								{vetDetails.professionalIdVerifiedAt && (
									<Descriptions.Item label="Vérifié le">
										{dayjs(vetDetails.professionalIdVerifiedAt).format('D MMM YYYY HH:mm')}
									</Descriptions.Item>
								)}
								{vetDetails.verificationNotes && (
									<Descriptions.Item label="Notes">
										{vetDetails.verificationNotes}
									</Descriptions.Item>
								)}
							</Descriptions>
							
							<Divider />
							
							{vetStats && (
								<>
									<h4>Statistiques</h4>
									<Row gutter={[16, 16]}>
										<Col span={12}>
											<Card size="small">
												<Statistic 
													title="Total consultations"
													value={vetStats.totalConsultations || 0}
												/>
											</Card>
										</Col>
										<Col span={12}>
											<Card size="small">
												<Statistic 
													title="Terminées"
													value={vetStats.completedConsultations || 0}
													valueStyle={{ color: '#52c41a' }}
												/>
											</Card>
										</Col>
										<Col span={12}>
											<Card size="small">
												<Statistic 
													title="Note moyenne"
													value={vetStats.averageRating || 0}
													prefix={<Rate disabled value={vetStats.averageRating || 0} style={{ fontSize: 14 }} />}
												/>
											</Card>
										</Col>
										<Col span={12}>
											<Card size="small">
												<Statistic 
													title="Total avis"
													value={vetStats.totalReviews || 0}
												/>
											</Card>
										</Col>
									</Row>
								</>
							)}
						</div>
					)}
				</Drawer>
                
                {/* Disable Modal */}
                <Modal
                    title={`Désactiver ${vetToDisable?.fullName}`}
                    open={disableModalVisible}
                    onOk={handleDisableVet}
                    onCancel={() => {
                        setDisableModalVisible(false);
                        setDisableReason('');
                        setVetToDisable(null);
                    }}
                    okText="Désactiver"
                    okButtonProps={{ danger: true }}
                    confirmLoading={actionLoading === vetToDisable?.id}
                >
                    <div style={{ marginBottom: 16 }}>
                        <label>Raison de la désactivation :</label>
                        <TextArea
                            rows={3}
                            placeholder="ex: Non-respect des conditions, Demandé par le vétérinaire, etc."
                            value={disableReason}
                            onChange={(e) => setDisableReason(e.target.value)}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                    <Alert
                        message="Note"
                        description="Les vétérinaires désactivés n'apparaîtront pas dans les résultats de recherche et ne pourront pas recevoir de nouvelles demandes de consultation. Ils peuvent toujours se connecter pour consulter leurs consultations existantes."
                        type="warning"
                        showIcon
                    />
                </Modal>
                
                {/* Update Verification Modal */}
                <Modal
                    title={`Mettre à jour la vérification - ${vetToVerify?.fullName}`}
                    open={verificationModalVisible}
                    onOk={handleUpdateVerification}
                    onCancel={() => {
                        setVerificationModalVisible(false);
                        setVerificationStatus('');
                        setVerificationNotes('');
                        setVetToVerify(null);
                    }}
                    okText="Mettre à jour"
                    confirmLoading={actionLoading === vetToVerify?.id}
                >
                    <div style={{ marginBottom: 16 }}>
                        <label>Statut de vérification :</label>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            value={verificationStatus}
                            onChange={setVerificationStatus}
                            placeholder="Sélectionner un statut"
                        >
                            <Option value="verified">✅ Vérifié</Option>
                            <Option value="pending">⏳ En attente</Option>
                            <Option value="rejected">❌ Rejeté</Option>
                            <Option value="not_submitted">📝 Non soumis</Option>
                        </Select>
                    </div>
                    <div>
                        <label>Notes (optionnel) :</label>
                        <TextArea
                            rows={3}
                            placeholder="Ajouter des notes concernant cette décision de vérification..."
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Modal>

                {/* Add Veterinarian Modal */}
                <Modal
                    title="Ajouter un vétérinaire"
                    open={addModalVisible}
                    onCancel={() => {
                        setAddModalVisible(false);
                        addForm.resetFields();
                        setAddVetCountryId(null);
                        setAddVetCities([]);
                    }}
                    onOk={() => addForm.submit()}
                    okText="Ajouter"
                    confirmLoading={addLoading}
                    width={640}
                    destroyOnClose
                >
                    <Alert
                        message="Ajout sans compte"
                        description="Ce vétérinaire sera visible dans les listings mais ne pourra pas recevoir de consultations tant qu'il n'aura pas accepté une invitation à créer son compte (fonctionnalité à venir)."
                        type="info"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />

                    <Form
                        form={addForm}
                        layout="vertical"
                        onFinish={handleAddVeterinarian}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Nom"
                                    name="nom"
                                    rules={[{ required: true, message: 'Le nom est requis' }]}
                                >
                                    <Input placeholder="Dupont" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Prénom" name="prenom">
                                    <Input placeholder="Marie" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Téléphone"
                                    name="phone"
                                    rules={[{ required: true, message: 'Le téléphone est requis' }]}
                                >
                                    <Input placeholder="+33 6 12 34 56 78" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ type: 'email', message: 'Adresse email invalide' }]}
                                >
                                    <Input placeholder="marie.dupont@exemple.com (recommandé)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div style={{ marginTop: -16, marginBottom: 16, fontSize: '12px', color: '#888' }}>
                            Email recommandé : nécessaire pour envoyer l'invitation de création de compte plus tard.
                        </div>

                        <Collapse
                            ghost
                            items={[
                                {
                                    key: 'more',
                                    label: 'Informations complémentaires (optionnel)',
                                    children: (
                                        <>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Titre professionnel" name="vetTitleId">
                                                        <Select
                                                            allowClear
                                                            placeholder="Sélectionner un titre"
                                                            showSearch
                                                            optionFilterProp="children"
                                                        >
                                                            {vetTitles.map(title => (
                                                                <Option key={title.id} value={title.id}>
                                                                    {title.code}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Spécialité" name="specialiteId">
                                                        <Select
                                                            allowClear
                                                            placeholder="Sélectionner une spécialité"
                                                            showSearch
                                                            optionFilterProp="children"
                                                        >
                                                            {(allSpecialities || []).map(s => (
                                                                <Option key={s.id} value={s.id}>{s.name}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Téléphone professionnel" name="phonePro">
                                                        <Input placeholder="Optionnel" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Téléphone d'urgence" name="phoneUrgence">
                                                        <Input placeholder="Optionnel" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item label="Biographie" name="biography">
                                                <Input.TextArea rows={3} placeholder="Parcours, expertise..." />
                                            </Form.Item>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Mode d'exercice" name="vetoModeId">
                                                        <Select allowClear placeholder="Cabinet / domicile / en ligne">
                                                            {vetoModes.map(mode => (
                                                                <Option key={mode.id} value={mode.id}>{mode.name}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Langues parlées" name="languageIds">
                                                        <Select mode="multiple" allowClear placeholder="Sélectionner des langues">
                                                            {(languages || []).map(l => (
                                                                <Option key={l.id} value={l.id}>{l.name || l.nom}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            {/* Country / City - same cascading pattern as ModalProfile's LieuCountry/LieuCity */}
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item label="Pays" name="lieuCountryId">
                                                        <Select
                                                            allowClear
                                                            showSearch
                                                            placeholder="Sélectionner un pays"
                                                            optionFilterProp="label"
                                                            filterSort={(a, b) =>
                                                                (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                                                            }
                                                            options={(countriesAllowed || []).map(country => ({
                                                                value: country.id,
                                                                label: country.nom,
                                                            }))}
                                                            onChange={handleAddVetCountryChange}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Ville" name="lieuCityId">
                                                        <Select
                                                            allowClear
                                                            showSearch
                                                            placeholder={addVetCountryId ? 'Sélectionner une ville' : 'Sélectionnez un pays d\'abord'}
                                                            optionFilterProp="label"
                                                            filterSort={(a, b) =>
                                                                (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                                                            }
                                                            disabled={!addVetCountryId}
                                                            loading={addVetCitiesLoading}
                                                            options={addVetCities.map(city => ({
                                                                value: city.id,
                                                                label: city.nom,
                                                            }))}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={8}>
                                                    <Form.Item label="Code postal" name="codePostal">
                                                        <Input placeholder="75001" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item label="Tarif consultation (min-max)" name="tarifConsultation">
                                                        <Input placeholder="ex: 30-60" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={8}>
                                                    <Form.Item label="Tarif vidéo (min-max)" name="tarifConsultationVideo">
                                                        <Input placeholder="ex: 20-40" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item label="Zone d'activité" name="zoneActivite">
                                                <Input placeholder="Optionnel" />
                                            </Form.Item>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </Form>
                </Modal>

                {/* Edit Veterinarian Modal */}
                <Modal
                    title="Modifier le vétérinaire"
                    open={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        editForm.resetFields();
                        setEditVetCountryId(null);
                        setEditVetCities([]);
                    }}
                    onOk={() => editForm.submit()}
                    okText="Enregistrer"
                    confirmLoading={editLoading}
                    width={640}
                    destroyOnClose
                >
                    {editFetching ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {editVetClaimed && (
                                <Alert
                                    message="Compte activé"
                                    description="Ce vétérinaire a déjà son propre compte. Son email n'est modifiable que depuis son profil personnel."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 20 }}
                                />
                            )}

                            <Form
                                form={editForm}
                                layout="vertical"
                                onFinish={handleUpdateVeterinarian}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Nom"
                                            name="nom"
                                            rules={[{ required: true, message: 'Le nom est requis' }]}
                                        >
                                            <Input placeholder="Dupont" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Prénom" name="prenom">
                                            <Input placeholder="Marie" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Téléphone"
                                            name="phone"
                                            rules={[{ required: true, message: 'Le téléphone est requis' }]}
                                        >
                                            <Input placeholder="+33 6 12 34 56 78" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{ type: 'email', message: 'Adresse email invalide' }]}
                                        >
                                            <Input
                                                placeholder="marie.dupont@exemple.com"
                                                disabled={editVetClaimed}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Collapse
                                    ghost
                                    defaultActiveKey={['more']}
                                    items={[
                                        {
                                            key: 'more',
                                            label: 'Informations complémentaires',
                                            children: (
                                                <>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Titre professionnel" name="vetTitleId">
                                                                <Select
                                                                    allowClear
                                                                    placeholder="Sélectionner un titre"
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                >
                                                                    {vetTitles.map(title => (
                                                                        <Option key={title.id} value={title.id}>
                                                                            {title.code}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Spécialité" name="specialiteId">
                                                                <Select
                                                                    allowClear
                                                                    placeholder="Sélectionner une spécialité"
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                >
                                                                    {(allSpecialities || []).map(s => (
                                                                        <Option key={s.id} value={s.id}>{s.name}</Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Téléphone professionnel" name="phonePro">
                                                                <Input placeholder="Optionnel" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Téléphone d'urgence" name="phoneUrgence">
                                                                <Input placeholder="Optionnel" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Form.Item label="Biographie" name="biography">
                                                        <Input.TextArea rows={3} placeholder="Parcours, expertise..." />
                                                    </Form.Item>

                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Mode d'exercice" name="vetoModeId">
                                                                <Select allowClear placeholder="Cabinet / domicile / en ligne">
                                                                    {vetoModes.map(mode => (
                                                                        <Option key={mode.id} value={mode.id}>{mode.name}</Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Langues parlées" name="languageIds">
                                                                <Select mode="multiple" allowClear placeholder="Sélectionner des langues">
                                                                    {(languages || []).map(l => (
                                                                        <Option key={l.id} value={l.id}>{l.name || l.nom}</Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="Pays" name="lieuCountryId">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    placeholder="Sélectionner un pays"
                                                                    optionFilterProp="label"
                                                                    filterSort={(a, b) =>
                                                                        (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                                                                    }
                                                                    options={(countriesAllowed || []).map(country => ({
                                                                        value: country.id,
                                                                        label: country.nom,
                                                                    }))}
                                                                    onChange={handleEditVetCountryChange}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="Ville" name="lieuCityId">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    placeholder={editVetCountryId ? 'Sélectionner une ville' : 'Sélectionnez un pays d\'abord'}
                                                                    optionFilterProp="label"
                                                                    filterSort={(a, b) =>
                                                                        (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
                                                                    }
                                                                    disabled={!editVetCountryId}
                                                                    loading={editVetCitiesLoading}
                                                                    options={editVetCities.map(city => ({
                                                                        value: city.id,
                                                                        label: city.nom,
                                                                    }))}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Form.Item label="Code postal" name="codePostal">
                                                                <Input placeholder="75001" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item label="Tarif consultation (min-max)" name="tarifConsultation">
                                                                <Input placeholder="ex: 30-60" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item label="Tarif vidéo (min-max)" name="tarifConsultationVideo">
                                                                <Input placeholder="ex: 20-40" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Form.Item label="Zone d'activité" name="zoneActivite">
                                                        <Input placeholder="Optionnel" />
                                                    </Form.Item>
                                                </>
                                            ),
                                        },
                                    ]}
                                />
                            </Form>
                        </>
                    )}
                </Modal>
            </div>
            <Footer />
        </>
    );
};

export default AdminVetManagement;