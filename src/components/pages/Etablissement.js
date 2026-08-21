import React, { useMemo, useState, useEffect, useContext } from "react";
import { Table, Button, Avatar, Modal, notification, message, Tag, Spin, Card, Row, Col, Image } from "antd";

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined,
	EnvironmentOutlined,
	PhoneOutlined,
	InfoCircleOutlined,
	CarOutlined,
	CalendarOutlined,
	UserOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';

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
import VetName from '../VetName';

const Etablissement = () => {
	
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		setUser,
	} = useContext( AuthContext );

	const { 
		getVetoClinicStatus,
		getEtablissementInfo,
		getVetoEtablissementStatus,
		updateVetoEtablissementStatus,
		postNotification,
		generateRandomDigits,
		getEtablissementVeto,
		base_url,
		allSpecialities,
		siteLocale,
		siteLanguage,
		getEtablissementInvitations,
		getAContent,
		getAVetoProfile 
	} = useContext( SiteContext );

	const navigate = useNavigate();

	// Read only userId from query string
	const params = useMemo(() => new URLSearchParams(window.location.search), []);
	const [ etablissementId, setEtablissementId ] = useState( params.get( "etablissementId" ) || null );

	// Internal state for role and currentVetId if relevant
	const [role, setRole] = useState(null);
	const [currentVetId, setCurrentVetId] = useState(null);
	const [loading, setLoading] = useState(true);

	const [clinicData, setClinicData] = useState( {} );
	const [isCreator, setIsCreator] = useState( false );
	const [isInvited, setIsInvited] = useState( false );
	
	const [vets, setVets] = useState([]);
	const [invitations, setInvitations] = useState([]);
	const [invitationMessage, setInvitationMessage ] = useState( '' );
	
	const [updateRandom, setUpdateRandom ] = useState( generateRandomDigits( 3 ) );
	const [creatorProfile, setCreatorProfile] = useState( '' );
	
	const photoDefaultSrc = '/img/etablissement/1.jpg';
	const vetPhotoDefaultSrc = '/img/user/1.jpg';
	
	// Helper function to get invitation message with clinic name
	const getInvitationMessageWithClinicName = (clinicName) => {
		// Get the translation template or use default English
		const template = getAContent('cmp_vetonest.com_VetInvitedNotice_Txt') || 'You have been invited to join {clinicName} as a veterinarian.';
		// Replace the placeholder with the actual clinic name
		return template.replace('{clinicName}', clinicName);
	};
	
	// Fetch clinic data
	useEffect(() => {
		const a = async() => {
			// set clinic's data
			const clinicData = await getEtablissementInfo( etablissementId );
			const creatorProfileId = clinicData.creatorProfileId;
			const creatorProfile = await getAVetoProfile( creatorProfileId );
			setCreatorProfile( creatorProfile );
			
			// Set invitation message with clinic name
			const invitationMsg = getInvitationMessageWithClinicName(clinicData.nom);
			setInvitationMessage( invitationMsg );
			
			setClinicData( clinicData );
			
			// Set visitor role 
			if( profileTypeId != 2 ){
				setRole("CLIENT");
			}
			else if( clinicData.creatorId == userId ){
				setRole("CREATOR");
			}
			else{ // or invited
				const status = await getVetoEtablissementStatus( profileId );
				if( status == 1 ){
					setRole("INVITED_VET");
				}
				else if( status == 2 ){
					setRole("VET_MEMBER");
					setCurrentVetId( userId );
				}
				else{
					setRole("CLIENT");
				}
			}
			
			// Vets
			const statusId = 2; // invitation accepted ( clinic member )
			const vetos = await getEtablissementVeto( statusId, etablissementId);
			setVets(vetos);
			
			// Invitations
			const invitations = await getEtablissementInvitations( etablissementId ); 
			setInvitations( invitations );
		}
		a();
		
	}, [userId, updateRandom, allSpecialities]);

	// get date format local
	const getDateFormatLocale = () =>{
		if( siteLanguage =='fr' )
			return 'DD MMM YYYY'
		if( siteLanguage =='de' )
			return 'YYYY-MM-DD'
		if( siteLanguage =='es' )
			return 'YYYY-MM-DD'
		if( siteLanguage =='it' )
			return 'YYYY-MM-DD'
		
		return 'YYYY-MM-DD'
	}

	const formatDate = (date) => {
		return dayjs( date ).format( getDateFormatLocale() );
	};

	const resendInvitation = (id) => {
		setInvitations((prev) =>
			prev.map((it) => (it.id === id ? { ...it, sentAt: new Date().toISOString(), status: "NOT_VIEWED" } : it))
		);
		notification.success({ message: getAContent( "cmp_vetonest.com_Iv61Rs82Qa" )} );
	};

	const invitationResponse = async ( statusId ) => {
		const statusData = {
			etablissementId 	: clinicData.id,
			profileVetoId		: profileId,
			statusId 			: statusId,
		}
		
		const resp = await updateVetoEtablissementStatus( statusData );
		if( !resp ){
			message.error( getAContent( 'cmp_vetonest.com_Ia92Ts44Lm' ) );
			return;
		}

		const notificationTypeId = statusId;
		const notificationData = {
			notificationTypeId: notificationTypeId, 
			receiverId: clinicData.creatorId,
		}
		const res = await postNotification( notificationData );
		if( !res ){
			message.error( getAContent( 'cmp_vetonest.com_Ne77Pw21Df' ) );
			return;
		}
		if( statusId == 2 )
			message.success( getAContent( 'cmp_vetonest.com_Ia92Ts44Lm' ) );
		if( statusId == 3 )
			message.success( getAContent( 'cmp_vetonest.com_Dc57Zm91Ha' ) );
		
		setUpdateRandom( generateRandomDigits( 3 ) )
	};

	const declineInvitation = () => {
		if (!pendingInvitation) return;
		Modal.confirm({
			title: getAContent( 'cmp_vetonest.com_Di55Cm90Ax' ),
			content: getAContent( 'cmp_vetonest.com_Ad83Qn74Zp' ) + ' ' + clinicData.nom + '?',
			okText: getAContent( 'cmp_vetonest.com_Yd84Lm29Qs' ),
			cancelText: getAContent( 'cmp_vetonest.com_Ca09Lp62Bw' ),
			okButtonProps: { danger: true },
			onOk() {
				invitationResponse(3);
			},
		});
	};

	const quitClinic = (vetId) => {
		Modal.confirm({
			title: getAContent( 'cmp_vetonest.com_Qc71Hs48Nm' ),
			content: getAContent( 'cmp_vetonest.com_Aq50Pm18Xs?' ),
			onOk() {
				setVets((prev) => prev.filter((v) => v.id !== vetId));
				notification.success({ message: getAContent( 'cmp_vetonest.com_Yl84Tr02Vp' ) });
			},
		});
	};

	// Navigate to vet profile
	const goToVetProfile = (vetId) => {
		navigate(`/vet-profile?vetId=${vetId}`);
	};

	const vetColumns = [
		{
			title: getAContent( 'cmp_vetonest.com_Ph73Zs61Qe' ),
			dataIndex: "photo",
			key: "photo",
			render: (_, vet) => (
				<Avatar 
					src={vet.picture ? base_url + 'uploads/files/profile/' + vet.picture : vetPhotoDefaultSrc} 
					style={{ backgroundColor: "#87d068", cursor: 'pointer' }}
					onClick={() => goToVetProfile(vet.id)}
				>
					{vet.prenom && vet.prenom.charAt(0)} 
				</Avatar>
			),
			width: 80,
		},
		{
			title: getAContent( 'cmp_vetonest.com_wc4hVvXB3N' ),
			dataIndex: "nom",
			key: "nom",
			render: (_, vet) => <p>
				<VetName 
					vet={vet}
					showTitle={true}
					format="full"
					//linkToProfile={true}
					// withTooltip={true}
				/>
				</p>
			,
		},
		{
			title: getAContent( 'cmp_vetonest.com_Mn2Vr7sLpQ' ),
			dataIndex: "biography",
			key: "biography",
			render: (t) => <div style={{ maxWidth: 420, whiteSpace: "normal" }}>{t || '—'}</div>,
		},
		{
			title: getAContent( 'cmp_vetonest.com_Sp44Ma27Kw' ),
			dataIndex: "speciality",
			key: "speciality",
			width: 160,
			render: (_, vet) => <div style={{ maxWidth: 420, whiteSpace: "normal" }}>
				{( allSpecialities.length && vet.vetoSpecialite ) ?
					getAContent( allSpecialities.filter( e => e.id == vet.vetoSpecialite.id )[0]?.tagRef )
					: getAContent( 'cmp_vetonest.com_Ga83Kd92Lm' )
				}
			</div>,
		},
		{
			title: getAContent( 'cmp_vetonest.com_Di20Jp58Xn' ),
			dataIndex: "createdAt",
			key: "createdAt",
			width: 200,
			render: (_, vet) => vet.dateCreated ? formatDate(vet.dateCreated.date) : '—',
		},
		...( role === "VET_MEMBER"
			? [
				{
					title: "Action",
					key: "action",
					width: 120,
					render: (_, vet) =>
						vet.id == profileId ?
							<Button danger onClick={() => quitClinic(vet.id)}>
								{getAContent( 'cmp_vetonest.com_Qc71Hs48Nm' )} 
							</Button>
							: null,
				},
			]
			: []),
	];

	const invitationColumns = [
		{
			title: getAContent( 'cmp_vetonest.com_Ph73Zs61Qe' ),
			dataIndex: "photo",
			key: "photo",
			render: (_, invitation) => (
				<Avatar 
					src={invitation.picture ? base_url + 'uploads/files/profile/' + invitation.picture : vetPhotoDefaultSrc} 
					style={{ backgroundColor: "#87d068" }}
				>
					{invitation.name && invitation.name.charAt(0)} 
				</Avatar>
			),
			width: 80,
		},
		{
			title: getAContent( 'cmp_vetonest.com_wc4hVvXB3N' ),
			dataIndex: "name",
			key: "name",
			render: (_, invitation) => (
				<VetName 
					vet={{
						id: invitation.profileVetoId,
						nom: invitation.name,
						prenom: '',
						vetTitle: invitation.vetTitle
					}}
					showTitle={true}
					format="full"
					linkToProfile={true}
					withTooltip={true}
					id='1000'
				/>
			),
		},
		{
			title: getAContent( 'cmp_vetonest.com_Mn2Vr7sLpQ' ),
			dataIndex: "biography",
			key: "biography",
			render: (t) => <div style={{ maxWidth: 420 }}>{t || '—'}</div>,
		},
		{
			title: getAContent( 'cmp_vetonest.com_Sp44Ma27Kw' ),
			dataIndex: "speciality",
			key: "speciality",
			render: (t) => <div style={{ maxWidth: 420 }}>{t || '—'}</div>,
		},
		{
			title: getAContent( 'cmp_vetonest.com_St66Qr91Pa' ),
			dataIndex: "status",
			key: "status",
			width: 140,
			render: (s) => (s === true ? <Tag color="blue">Viewed</Tag> : <Tag color="orange">Not viewed</Tag>),
		},
		{
			title: getAContent( 'cmp_vetonest.com_Ds18Nc43Lm' ),
			dataIndex: "creation",
			key: "creation",
			width: 200,
			render: (d) => formatDate(d),
		},
		{
			title: getAContent( 'cmp_vetonest.com_Re92Hw07Qm' ),
			key: "resend",
			width: 120,
			render: (_, record) => <Button onClick={() => resendInvitation(record.id)}>Resend</Button>,
		},
	];

	const pendingInvitation = invitations ? ( invitations.find((i) => i.status === "NOT_VIEWED") || invitations[0] || null ) : [];

	return (
		<>
			<div className="sticky-stack">
				<Header />
				<Title title={getAContent( 'cmp_vetonest.com_Ev73Qp91Lm' )} />
			</div>

			<div className="contact">
				<div className="container">
					<div className="row">
						<div className="container py-4">
							{/* Clinic Header with Photo - Photo on the RIGHT side */}
							<Row gutter={[24, 24]} className="mb-4" align="middle">
								<Col xs={24} sm={24} md={16} lg={16}>
									<h1 style={{ marginTop: 0, marginBottom: '8px' }}>{clinicData.nom}</h1>
									<p className="text-muted" style={{ marginBottom: '12px' }}>
										{clinicData.etablissementTypeTagRef ? getAContent(clinicData.etablissementTypeTagRef) : clinicData.etablissementType}
									</p>
									<p className="small" style={{ marginBottom: '8px' }}>
										{getAContent( 'cmp_vetonest.com_Rb73Qx91Lm' )}{' '}
										<VetName 
											vet={creatorProfile}
											showTitle={true}
											format="full"
											withTooltip={true}
										/>
									</p>
									{clinicData.creatorPhone && (
										<p style={{ marginBottom: 0 }}>
											<PhoneOutlined style={{ marginRight: '8px' }} />
											{clinicData.creatorPhone}
										</p>
									)}
								</Col>
								<Col xs={24} sm={24} md={8} lg={8}>
									<div style={{ 
										backgroundColor: '#f5f5f5', 
										borderRadius: '12px',
										overflow: 'hidden',
										minHeight: '180px',
										display: 'flex',
										alignItems: 'center',
										 justifyContent: 'center'
									}}>
										<img 
											src={clinicData.picture 
												? base_url + 'uploads/files/etablissement/' + clinicData.picture 
												: photoDefaultSrc}
											alt={clinicData.nom || 'Clinic'}
											style={{ 
												width: '100%',
												height: 'auto',
												minHeight: '180px',
												maxHeight: '200px',
												objectFit: 'cover',
											}}
											onError={(e) => { e.target.src = photoDefaultSrc; }}
										/>
									</div>
								</Col>
							</Row>

							{/* Clinic Description */}
							{clinicData.description && (
								<div className="row mb-4">
									<div className="col-12">
										<p className="text-muted">{clinicData.description}</p>
									</div>
								</div>
							)}

							{/* Locations Section */}
							{clinicData.lieux && clinicData.lieux.length > 0 && (
								<div className="row mb-4">
									<div className="col-12">
										<h5>{ getAContent( 'cmp_vetonest.com_kFunk0HFRg' ) || 'Locations' }</h5>
										<Row gutter={[16, 16]}>
											{ clinicData.lieux.map((loc, idx) => (
												<Col xs={24} sm={12} md={8} lg={6} key={idx}>
													<div className="border rounded p-3" style={{ backgroundColor: '#f9f9f9', height: '100%' }}>
														{loc.pays && <div><strong>{loc.pays}</strong></div>}
														{loc.ville && <div className="small"><b>{loc.ville}</b></div>}
														{loc.adresse && <div className="small">{loc.adresse}</div>}
														{loc.info && <div className="small text-muted mt-1">{loc.info}</div>}
														{loc.parking && <div className="small mt-1"><CarOutlined /> {loc.parking}</div>}
													</div>
												</Col>
											))}
										</Row>
									</div>
								</div>
							)}

							{/* Vets Section */}
							{role === "CREATOR" && (
								<>
									<div className="row mb-4">
										<div className="col-12">
											<h4>{getAContent('cmp_vetonest.com_OurVeterinarians_Title') || 'Our veterinarians'}</h4>
											<Table 
												scroll={{ x: true }} 
												rowKey={(r) => r.id} 
												dataSource={vets} 
												columns={vetColumns} 
												pagination={{ pageSize: 5 }} 
											/>
										</div>
									</div>

									<div className="row">
										<div className="col-12">
											<h4>{ getAContent( 'cmp_vetonest.com_In51Za84Ct' ) || 'Invitations' }</h4>
											<Table
												scroll={{ x: true }}
												rowKey={(r, i) => r.id ?? r.name ?? i}
												dataSource={invitations}
												columns={invitationColumns}
												pagination={{ pageSize: 5 }}
											/>
										</div>
									</div>
								</>
							)}

							{role === "INVITED_VET" && (
								<div className="row">
									<div className="col-12">
										<div className="card p-3 mb-3" style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}>
											<h5>{getAContent('cmp_vetonest.com_Invitation_Txt') || 'Invitation'}</h5>
											<p>{invitationMessage}</p>
											{pendingInvitation ? (
												<div>
													<Button type="primary" className="me-2" onClick={() => invitationResponse(2)}>
														{getAContent('cmp_vetonest.com_AcceptInvitation_Bt') || 'Accept Invitation'}
													</Button>
													<Button danger onClick={() => declineInvitation(pendingInvitation.id)}>
														{getAContent('cmp_vetonest.com_Decline_Btn') || 'Decline'}
													</Button>
												</div>
											) : (
												<div className="text-muted">{getAContent('cmp_vetonest.com_NoPendingInvitation_Txt') || 'No pending invitation found.'}</div>
											)}
										</div>
									</div>
								</div>
							)}

							{(role === "VET_MEMBER" || role === "CLIENT") && vets.length > 0 && (
								<div className="row mb-3">
									<div className="col-12">
										<h4>{getAContent('cmp_vetonest.com_Q6FO7QyF7m') || 'Veterinarians'}</h4>
										<Table 
											scroll={{ x: true }} 
											rowKey={(r) => r.id} 
											dataSource={vets} 
											columns={vetColumns} 
											pagination={{ pageSize: 5 }} 
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default Etablissement;