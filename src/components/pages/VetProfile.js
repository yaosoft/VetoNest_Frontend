import React, { useMemo, useState, useEffect, useContext, useParams } from "react";
import { Button, Card, Row, Col, Rate, Modal, message } from "antd";
import { PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation  } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import { MessageOutlined } from '@ant-design/icons'; // Import the chat icon
import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';


import Header from '../Header';
import Footer from '../Footer';

import Title from '../Title';
import SingleFieldManager from '../SingleFieldManager';

const VetProfile = () => {
	
	const { 
		getUser,
		profileTypeId,
		profileId,
		userId,
		user,
		setUser,
	} = useContext( AuthContext );
	
	const { 
		getAContent,
		getAVetoProfile,
		getTimeslot,
		getHollydays,
		getAbsences,
		truncateString,
		getAVetoLieux,
		siteLocale,
		base_url,
		allSpecialities,
	} = useContext(SiteContext);
	const navigate = useNavigate();
  
	const [vetData, setVetData] = useState([]);

	const params = useMemo(() => new URLSearchParams(window.location.search), []);
	const [ vetId, setVetId ] = useState( params.get( "vetId" ) || null );

	const [ vetTimeslot, setVetTimeslot ] = useState([]);
	const [ vetHollyday, setVetHollyday ] = useState([]);
	const [ vetAbsences, setAbsences ] = useState([]);
	const [ vetLieux, setVetLieux ] = useState([]);

	const [ profilePhoto, setProfilePhoto ] = useState('');	
	const [ photoDefaultSrc, setPhotoDefaultSrc ] = useState( '/img/user/1.jpg' );

	// Fetch vet data from the backend based on vetId
	useEffect(() => {
		// Fetch data from your backend API, replace with actual API call
		const a = async () => {
			const vetData = await getAVetoProfile(vetId);
			setVetData(vetData);
console.log( '>>>>> vetData: ', vetData );
			const timeslot  = await getTimeslot(vetId);
			const vetTimeslot = await Object.entries( timeslot );
			setVetTimeslot( vetTimeslot );
			const vetHollyday  = await getHollydays(vetId);
			setVetHollyday( vetHollyday );
			const vetAbsences  = await getAbsences(vetId);
			setAbsences( vetAbsences );
			const vetLieux  = await getAVetoLieux( { profileVetoId: vetId });
			setVetLieux( vetLieux );

		};
		a();

	}, [vetId]);

// Build timeslot
	const BuildTimeslot = () => {
		if( !vetTimeslot )
			return

		const getHoraire = ( dateObj01, dateObj02 ) => { return(
			dayjs( dateObj01 ).format( 'HH:ss' ) + ' - ' + 
			dayjs( dateObj02 ).format( 'HH:ss' ) 
		)};
		
		const getFieldName = ( type ) => {
			if( type == 1 )
				return 'Opened'
			if( type == 2 )
				return 'Closed'
			if( type == 3 )
				return 'Absence'
			if( type == 4 )
				return 'Hollydays'
		}
		
		const getStatus = ( type ) => {
			if( type == 1 )
				return 'opened'
			if( type == 2 )
				return 'closed'
			if( type == 3 )
				return 'absent'
			if( type == 4 )
				return 'hollydays'
		}

		return(
			vetTimeslot.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager 
						key={'timeslot_' + index}
						params={{
							fieldName: 		getFieldName( e[1].type ),
							title:			e[1].opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
							nom:			e[1].nom ? e[1].nom : '',
							description:	e[1].description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
							value: 			e[1].opened ? getDayName( e[0] ) + ': ' +   
												getHoraire( e[1].startTime.date, e[1].endTime.date ) :
											getDayName( e[0] ) + ' ' + ( e[1].closedDate ?  ' ' + dayjs( e[1].closedDate.date ).format( 'DD' ) + ' ' + getMonthName( dayjs( e[1].closedDate.date ).format( 'MM' ) ) + ': ' + getStatus( e[1].type ) : ': ' + getAContent('cmp_vetonest.com_Nx55Qa02Df') ),
							style:			e[1].opened ? 'opened' : 'closed',
							selectedAbsenceId:	e[1].type == 3 ? e[1].id : '',
							startTime:		e[1].opened ? e[1].startTime.date : '',
							endTime:		e[1].opened ? e[1].endTime.date : '',
							opened:			e[1].opened ? e[1].opened : '',
							day:			getDayName( e[0] ),
							dayId:			e[0],
							timeSlotId:		e[1].timeSlotId,
							type: 			e[1].opened ? 4 : 0,
							goToLink:		"foo/bar"
						}}
					/>
				</div>
			)
		)
	}
	
	// Build absence
	const BuildAbsence = () => {

		if( !vetAbsences )
			return

		return (
			vetAbsences.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'absence_' + index}
						params={{
							fieldName: 		'Absence',
							title:			getAContent('cmp_vetonest.com_Bz7Nq4wYpJ'),
							nom:			e.nom,
							selectedAbsenceId:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Wr2Hc9vXsK'),
							value: 			dayjs( e.closedDate.date ).format( 'DD' ) + ' ' + 
							getMonthName( dayjs( e.closedDate.date ).format( 'MM' ) ) + ', ' + truncateString( e.nom, 10 ),
							style:			'closed',
							type: 			2, // 2 = update
						}}
					/>
				</div>
			)
		)
	}

	// Build system's hollydays
	const BuildHollydays = () => {
		if( !vetHollyday )
			return

		return(
			vetHollyday.map( ( e, index ) => 
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager 
						key={'hollydays_' + index}
						params={{
							fieldName: 		'Hollydays',
							title:			getAContent('cmp_vetonest.com_Lv5Jm2nRqT'),
							nom:			e.nom,
							selectedHollyday:	e.id,
							description:	e.description ? e.description : '',
							placeholder:	getAContent('cmp_vetonest.com_Sf8Yc1pWkZ'),
							value: 			truncateString( e.nom, 10 ) + ', ' + dayjs( e.closedDate.date ).format( 'DD' ) + ' ' + 
							getMonthName( dayjs( e.closedDate.date ).format( 'MM' ) ),
							style:			'closed',
							type: 			'', // no click
							
						}}
					/>
				</div>
			)
		)
	}
	
	// Build veto's Lieux
	const BuildVetoLieux = () => {
		if (!vetLieux.length) {
			return <p><strong>{getAContent('cmp_vetonest.com_kFunk0HFRg')}</strong>: {getAContent('cmp_vetonest.com_NotAvail_Txt')}</p>;
		}

		return (
			<>
				<p>
					<strong>{getAContent('cmp_vetonest.com_kFunk0HFRg')}</strong>:&nbsp;
					{vetLieux.map((e, index) => (
						<span key={index}>
							{truncateString(e.adresse, 40)}&nbsp;
							{e.villeTagRef && getAContent(e.villeTagRef)}&nbsp;
							{e.paysTagRef && getAContent(e.paysTagRef)}&nbsp;
						</span>
					))}
				</p>
			</>
		);
	};




	// Get a day name from day number
	const getDayName = ( dayNumber, locale = siteLocale ) => {
		const date = new Date(2000, 0, 1);
		date.setDate(date.getDate() + dayNumber);
		const dayName = date.toLocaleDateString( locale, { weekday: 'long' } );
		return dayName;
	}

	// get a month name from month number
	const getMonthName = ( monthNumber, locale = siteLocale ) => {
		const date = new Date();
		const monthName = date.toLocaleDateString( locale, { month: 'short' } );
		return monthName;
	}

	// Handle appointment booking
	const handleGetAppointment = () => {
		// Redirect to an appointment booking page or show modal
		Modal.success({
			title: 'Appointment Request',
			content: 'Redirecting you to the appointment page...',
		});
	};

	if (!vetData) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<div className="sticky-stack">
				<Header />
				<Title title={ getAContent('cmp_vetonest.com_ProfileOf_Txt') + ' ' + vetData.nom }  />
			</div>

			<div className="vet-profile-page">
				<Row gutter={16} className="vet-profile-header">
					<Col xs={24} sm={30} md={6} className="vet-profile-img">
						<img 
							src={
								vetData.picture
								? base_url + 'uploads/files/profile/' + vetData.picture
								: photoDefaultSrc
							}
							alt="Vet Profile" 
							className="profile-img" 
						/>
						
					</Col>
					<Col xs={24} sm={16} md={18}>
						<Card className="vet-profile-card">
							<h2>{vetData.nom} {vetData.prenom}</h2>
                            <h3>
                                {allSpecialities.length && vetData.vetoSpecialite
                                    ? getAContent(allSpecialities.filter(e => e.id === vetData.vetoSpecialite.id)[0].tagRef)
                                    : getAContent('cmp_vetonest.com_nDHuiDhEz3')}
                            </h3>
                            <h3>0 consultation</h3>
                            <Rate disabled value={vetData.rating || 0} />
							<p className="vet-profile-buttons marginTop20">
								<Button
									className="btn btn-success profileBtn"
									icon={<CalendarOutlined />}
									size="large"
									onClick={handleGetAppointment}
								>
									{ getAContent( 'cmp_vetonest.com_BXJ8ERfKvZ' ) }
								</Button>
								&nbsp;
								<Button
									className="btn btn-warning profileBtn"
									icon={<MessageOutlined />} // Use the chat icon here
									size="large"
									onClick={handleGetAppointment}
								>
									Talk to this vet
								</Button>
							</p>
                            <div className="marginTop10">&nbsp;</div>
                            {vetData.biography && vetData.biography.trim() && (
                                <p><strong>{ getAContent( 'cmp_vetonest.com_Vn5Xk3bHsD' ) }:</strong> {vetData.biography}</p>
                            )}
                            
                            
							<BuildVetoLieux />
                            <p><strong>{ getAContent( 'cmp_vetonest.com_Zp83Na41Lt' ) }:</strong> <PhoneOutlined /> {vetData.phone || getAContent( 'cmp_vetonest.com_NotAvail_Txt' ) }</p>
                            <p><strong>{ getAContent( 'cmp_vetonest.com_Qr84Lm20Ps' ) }:</strong> {vetData.tarifConsultation || getAContent( 'cmp_vetonest.com_NotAvail_Txt' ) } EUR</p>
                            
                            {vetData.tarifConsultationVideo && vetData.tarifConsultationVideo.trim() && (
                                <p><strong>{ getAContent( 'cmp_vetonest.com_Mn92Ks41Wa' ) } :</strong> {vetData.tarifConsultationVideo} EUR</p>
                            )}
                            
                            <p><strong>SIRET:</strong> {vetData.siret || getAContent( 'cmp_vetonest.com_NotAvail_Txt' ) }</p>
                            <p><strong>RPPS:</strong> {vetData.rpps || getAContent( 'cmp_vetonest.com_NotAvail_Txt' ) }</p>
                            
						</Card>
					</Col>
				</Row>

				{/* Availability (Time Slots) */}
				<Row className="availability-section">
					<Col span={24}>
						<Card title="Availability" className="vet-availability-card">
							<h3>{ getAContent( 'cmp_vetonest.com_AvailSlots_Txt' ) }:</h3>
							<BuildTimeslot />
						</Card>
					</Col>
				</Row>
			</div>
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default VetProfile;
