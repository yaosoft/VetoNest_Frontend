import React, { useMemo, useState, useEffect, useContext } from "react";
import { Table, Button, Avatar, Modal, notification, message, Tag, Spin } from "antd";

import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import {
	RadiusBottomleftOutlined,
	RadiusBottomrightOutlined,
	RadiusUpleftOutlined,
	RadiusUprightOutlined,
	LoadingOutlined,
	InboxOutlined, 
	QuestionCircleOutlined
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
		getEtablissementInvitations
	} = useContext( SiteContext );

	const navigate = useNavigate();

// Read only userId from query string
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const etablissementId = params.get("etablissementId") || null;

  // Internal state for role and currentVetId if relevant
  const [role, setRole] = useState(null);
  const [currentVetId, setCurrentVetId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const MOCK_CLINIC = {
    id: "clinic-1",
    title: "Demo pets facility",
    description: "A friendly facility providing vet care across locations.",
    locations: [
      { city: "Douala", address: "12 Rue des Acacias" },
      { city: "Yaoundé", address: "45 Boulevard Central" },
    ],
  };

  const MOCK_VETS = [
    {
      id: "vet-1",
      photo: undefined,
      name: "Dr. Amina Kouyate",
      biography: "10 years experience in small animals. Loves surgery and preventative care.",
      speciality: "Surgery",
      createdAt: "2025-10-01T08:30:00Z",
    },
    {
      id: "vet-2",
      photo: undefined,
      name: "Dr. John Mbappe",
      biography: "Focus on exotic pets and rehabilitation.",
      speciality: "Exotics",
      createdAt: "2025-09-19T11:00:00Z",
    },
  ];

  const MOCK_INVITATIONS = [
    {
      id: "inv-1",
      name: "Dr. Fatou Diop",
      biography: "Interested in community outreach programmes.",
      status: "NOT_VIEWED",
      sentAt: "2025-10-10T09:00:00Z",
    },
    {
      id: "inv-2",
      name: "Dr. Pierre N’Guessan",
      biography: "Large animal specialist.",
      status: "VIEWED",
      sentAt: "2025-09-02T16:00:00Z",
    },
  ];

  const [clinicData, setClinicData] = useState( {} );
  const [isCreator, setIsCreator] = useState( false );
  const [isInvited, setIsInvited] = useState( false );
  
  // const [clinic] = useState(MOCK_CLINIC);
  // const [vets, setVets] = useState([]);
  const [vets, setVets] = useState(MOCK_VETS);
  const [invitations, setInvitations] = useState([]);
  const [invitationMessage, setInvitationMessage ] = useState( '' );
	
	const [updateRandom, setUpdateRandom ] = useState( generateRandomDigits( 3 ) );
	
  // Mock API call to detect role
  useEffect(() => {
    // setLoading(true);
	
	const a = async() => {
		// set clinic's data
		const clinicData = await getEtablissementInfo( etablissementId );
console.log( '--------- > clinicData:', clinicData );
console.log( '--------- > allSpecialities:', allSpecialities );

		setInvitationMessage( "etablissement_invitationMessage " +  clinicData.creatorNom + '\r\n ' + clinicData.creatorPrenom + ', ' + clinicData.nom );
		// clinicData.locations = [
		//	{ country: clinicData.pays, city: clinicData.ville, address: clinicData.adresse, info: clinicData.info },
		// ];
		setClinicData( clinicData );
console.log( '--------- > profileTypeId:', profileTypeId );
		//  Set visitor role 
		if( profileTypeId != 2 ){
console.log( '--------- > Role: CLIENT' );
			setRole("CLIENT");
		}
		else if( clinicData.creatorId == userId ){
console.log( '--------- > Role: CREATOR' );
			setRole("CREATOR");
		}
		else{ // or invited
			const status = await getVetoEtablissementStatus( profileId );
			if( status == 1 ){ // invitation sent
console.log( '--------- > Role: INVITED_VET' );
				setRole("INVITED_VET");
			}
			else if( status == 2 ){ // invitation accepted
console.log( '--------- > Role: VET_MEMBER' );
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
console.log( '--------- > vetos', vetos );
		setVets(vetos);
		
		// setLoading(false);
		
		// Invitations
		const invitations = await getEtablissementInvitations( etablissementId ); 
console.log( '--------- > invitations', invitations );
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
		
		return 'YYYY-MM-DD' // falback
	}

  const formatDate = (date) => {
	return dayjs( date ).format( getDateFormatLocale() );
  };

  const resendInvitation = (id) => {
    setInvitations((prev) =>
      prev.map((it) => (it.id === id ? { ...it, sentAt: new Date().toISOString(), status: "NOT_VIEWED" } : it))
    );
    notification.success({ message: "Invitation resent" });
  };

  const invitationResponse = async ( statusId ) => {
	// Update veto etablissement status
	const statusData = {
		etablissementId 	: clinicData.id,
		profileVetoId		: profileId,
		statusId 			: statusId, // accepted
	}
	
	const resp = await updateVetoEtablissementStatus( statusData );
console.log( '>>>>>>>>>> resp', resp );
	if( !resp ){
		message.error( 'etablisementText_invitationAccepted' );
		return;
	}

	// Post the creator's motification
	const notificationTypeId = statusId; // 2: accepted, 3: declined, 
	const notificationData = {
		notificationTypeId: notificationTypeId, 
		receiverId: clinicData.creatorId,
	}
	const res = await postNotification( notificationData );
console.log( '>>>>>>>>>> res', res );
	if( !res ){
		message.error( 'etablisementText_notification_error' );
		return;
	}
	if( statusId == 2 )
		message.success( 'etablisementText_invitationAcceptedNotification' );
	if( statusId == 3 )
		message.success( 'etablisementText_invitationDeclinedNotification' );
	
	setUpdateRandom( generateRandomDigits( 3 ) )
  };


	const declineInvitation = (id) => {
	  const inv = invitations.find((i) => i.id === id);
	  if (!inv) return;
	  Modal.confirm({
		title: "Decline invitation",
		content: `Are you sure you want to decline the invitation from ${inv.name}?`,
		okText: "Yes, decline",
		cancelText: "Cancel",
		okButtonProps: { danger: true },
		onOk() {
		  invitationResponse( 3 ) // notification declined id
		},
	  });
	};

  const quitClinic = (vetId) => {
    Modal.confirm({
      title: "Quit clinic",
      content: "Are you sure you want to quit this clinic?",
      onOk() {
        setVets((prev) => prev.filter((v) => v.id !== vetId));
        notification.success({ message: "You have left the clinic" });
      },
    });
  };

  const vetColumns = [
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (_, vetos) => (
        <Avatar src={ base_url + 'uploads/files/profile/' + vetos.picture} style={{ backgroundColor: "#87d068" }}>
          {vetos.prenom && vetos.prenom.charAt(0)} 
        </Avatar>
      ),
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (_, vetos) => <strong>{ vetos.prenom + ' ' + vetos.nom } </strong>,
    },
    {
      title: "Biography",
      dataIndex: "biography",
      key: "biography",
      render: (t) => <div style={{ maxWidth: 420, whiteSpace: "normal" }}>{t}</div>,
    },
    {
      title: "Speciality",
      dataIndex: "speciality",
      key: "speciality",
      width: 160,
	  render: (_, vetos) => <div style={{ maxWidth: 420, whiteSpace: "normal" }}>{
		  ( allSpecialities.length && vetos.vetoSpecialite ) ?
		    allSpecialities.filter( e => e.id == vetos.vetoSpecialite.id )[0].name
		  : '-'
		}</div>,
    },
    {
      title: "Date of insertion",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (_, vetos) => vetos.dateCreated ? formatDate(vetos.dateCreated.date) : '',
    },
    ...( role === "VET_MEMBER"
      ? [
          {
            title: "Action",
            key: "action",
            width: 120,
            render: (_, vetos) =>
              vetos.id == profileId ?
                <Button danger onClick={() => quitClinic(vetos.id)}>
                  Quit
                </Button>
                : null,
          },
        ]
      : []),
  ];

  const invitationColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (t) => <strong>{t}</strong>,
    },
    {
      title: "Biography",
      dataIndex: "biography",
      key: "biography",
      render: (t) => <div style={{ maxWidth: 420 }}>{t}</div>,
    },
    {
      title: "Speciality",
      dataIndex: "speciality",
      key: "speciality",
      render: (t) => <div style={{ maxWidth: 420 }}>{t}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => (s === true ? <Tag color="blue">Viewed</Tag> : <Tag color="orange">Not viewed</Tag>),
    },
    {
      title: "Date of sending",
      dataIndex: "sentAt",
      key: "sentAt",
      width: 200,
      render: (d) => formatDate(d),
    },
    {
      title: "Resend",
      key: "resend",
      width: 120,
      render: (_, record) => <Button onClick={() => resendInvitation(record.id)}>Resend</Button>,
    },
  ];

  const pendingInvitation = invitations ? ( invitations.find((i) => i.status === "NOT_VIEWED") || invitations[0] || null ) : [];

  /* if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spin size="large" />
      </div>
    );
  }
  */
	
	
	return (
		<>
			<Header />
			<Title title = { 'etablissement_title' } />
			<div className="back_re">
      </div>

      <div className="contact">
         <div className="container">
            <div className="row">
               
			   <div className="container py-4">
				  <div className="row mb-3">
					<div className="col-12">
					  <h1>{clinicData.nom}</h1>
					  <p className="text-muted">{clinicData.etablissementType}</p>
					</div>
				  </div>
				<div className="row mb-3">
					<div className="col-12">
					  <p className="text-muted">{clinicData.description}</p>
					</div>
				  </div>
				  <div className="row mb-4">
					<div className="col-12">
					  <h5>Locations</h5>
					  <div className="d-flex gap-3 flex-wrap">
						{ clinicData.lieux && clinicData.lieux.map((loc, idx) => (
						  <div key={idx} className="border rounded p-2" style={{ minWidth: 180 }}>
							<strong>{loc.pays}</strong>
							<div className="small"><b>{loc.ville}</b></div>
							<div className="small">{loc.adresse}</div>
							<div className="small">{loc.info}</div>
						  </div>
						))}
					  </div>
					</div>
				  </div>

				  {role === "CREATOR" && (
					<>
					  <div className="row mb-4">
						<div className="col-12">
						  <h4>Vets</h4>
						  <Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
						</div>
					  </div>

					  <div className="row">
						<div className="col-12">
						  <h4>Invitations</h4>
						  <Table
							rowKey={(r) => r.id}
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
						<div className="card p-3 mb-3">
						  <h5>Invitation</h5>
						  <p>{invitationMessage}</p>
						  {pendingInvitation ? (
							<div>
							  <Button type="primary" className="me-2" onClick={() => invitationResponse(2)}>
								Accept
							  </Button>
							  <Button danger onClick={() => declineInvitation()}>
								Decline
							  </Button>
							</div>
						  ) : (
							<div className="text-muted">No pending invitation found.</div>
						  )}
						</div>
					  </div>
					</div>
				  )}

				  {role === "VET_MEMBER" && (
					<div className="row mb-3">
					  <div className="col-12">
						<h4>Vets</h4>
						<Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
					  </div>
					</div>
				  )}

				  {role === "CLIENT" && (
					<div className="row mb-3">
					  <div className="col-12">
						<h4>Vets</h4>
						<Table rowKey={(r) => r.id} dataSource={vets} columns={vetColumns} pagination={{ pageSize: 5 }} />
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