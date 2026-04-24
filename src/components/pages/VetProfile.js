import React, { useMemo, useState, useEffect, useContext } from "react";
import { Button, Card, Row, Col, Rate, Modal, message, Avatar, List, Divider, Empty, Spin, Tooltip, Dropdown, Input } from "antd";
import { 
	PhoneOutlined, 
	CalendarOutlined, 
	FlagOutlined, 
	EnvironmentOutlined, 
	InfoCircleOutlined,
	CarOutlined,
	UserOutlined,
	MessageOutlined,
	StarOutlined,
	LikeOutlined,
	LikeFilled,
	DeleteOutlined,
	MoreOutlined,
	VideoCameraOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import dayjs from 'dayjs';

import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';
import SingleFieldManager from '../SingleFieldManager';
import VideoConsultationButton from '../VideoConsultationButton';

const { TextArea } = Input;

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
		setConsultationSelectedVet,
		setCurrentConsultationDate,
		setConsultationTimeslot,
		setCurrentConsultationPet,
		getVetRating,
		getVetComments,
		deleteComment,
		markCommentUseful,
		reportCommentAbuse,
		addCommentReply,
		profileGet,
		getPetOwnerConsultationList
	} = useContext(SiteContext);
	
	const navigate = useNavigate();
    const location = useLocation();
	
	const [userProfile, setUserProfile] = useState(null);
	
	const [vetData, setVetData] = useState(null);
	const [vetId, setVetId] = useState(null);
	const [videoAllowed, setVideoAllowed] = useState(false);
	const [vetTimeslot, setVetTimeslot] = useState([]);
	const [vetHollyday, setVetHollyday] = useState([]);
	const [vetAbsences, setAbsences] = useState([]);
	const [vetLieux, setVetLieux] = useState([]);
	const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');
	const [title, setTitle] = useState(null);
	
	// Translations state
	const [translations, setTranslations] = useState({
		profileOf: 'Profile of',
		clientReviews: 'Client Reviews',
		reviews: 'reviews',
		viewReviews: 'View Reviews'
	});
	
	// Rating states
	const [vetRating, setVetRating] = useState(0);
	const [ratingCount, setRatingCount] = useState(0);
	
	// Comments states
	const [comments, setComments] = useState([]);
	const [loadingComments, setLoadingComments] = useState(false);
	const [totalComments, setTotalComments] = useState(0);
	
	// Reply states
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyText, setReplyText] = useState('');
	const [submittingReply, setSubmittingReply] = useState(false);
	
	// Report states
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [reportingCommentId, setReportingCommentId] = useState(null);
	const [reportReason, setReportReason] = useState('');
	const [submittingReport, setSubmittingReport] = useState(false);

	// Helper function to safely get translated content
	const getSafeContent = async (key, defaultValue) => {
		try {
			const content = await getAContent(key);
			if (content && content !== '***' && content !== '...' && !content.includes('undefined')) {
				return content;
			}
			return defaultValue;
		} catch (error) {
			console.error(`Error getting translation for ${key}:`, error);
			return defaultValue;
		}
	};

	// Load translations
	useEffect(() => {
		const loadTranslations = async () => {
			const profileOfText = await getSafeContent('cmp_vetonest.com_ProfileOf_Txt', 'Profile of');
			const clientReviewsText = await getSafeContent('cmp_vetonest.com_ClientReviews_Txt', 'Client Reviews');
			const reviewsText = await getSafeContent('cmp_vetonest.com_Reviews_Txt', 'reviews');
			const viewReviewsText = await getSafeContent('cmp_vetonest.com_ViewReviews_Btn', 'View Reviews');
			
			setTranslations({
				profileOf: profileOfText,
				clientReviews: clientReviewsText,
				reviews: reviewsText,
				viewReviews: viewReviewsText
			});
		};
		
		loadTranslations();
	}, []);

	// Format date for display
	const formatDate = (dateTimeData) => {
		if (!dateTimeData) return "—";
		
		let date;
		if (typeof dateTimeData === 'object' && dateTimeData.date) {
			date = new Date(dateTimeData.date);
		} else if (typeof dateTimeData === 'string') {
			date = new Date(dateTimeData.replace(" ", "T"));
		} else {
			date = new Date(dateTimeData);
		}
		
		if (isNaN(date.getTime())) return "—";
		
		return date.toLocaleDateString(siteLocale || "en-GB", {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Fetch vet comments
	const fetchVetComments = async (vetIdParam) => {
		if (!vetIdParam) return;
		
		setLoadingComments(true);
		try {
			const data = await getVetComments(vetIdParam, profileId);
			if (data && data.success && data.comments) {
				setComments(data.comments);
				setTotalComments(data.totalComments);
			} else {
				setComments([]);
				setTotalComments(0);
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
			setComments([]);
			setTotalComments(0);
		} finally {
			setLoadingComments(false);
		}
	};

	// Delete a comment
	const handleDeleteComment = async (commentId) => {
		Modal.confirm({
			title: getAContent('cmp_vetonest.com_DeleteComment') || 'Delete Comment',
			content: getAContent('cmp_vetonest.com_ConfirmDeleteComment') || 'Are you sure you want to delete this comment?',
			okText: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
			cancelText: getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel',
			okButtonProps: { danger: true },
			onOk: async () => {
				try {
					const result = await deleteComment(commentId, profileId);
					if (result && result.success !== false) {
						message.success(getAContent('cmp_vetonest.com_CommentDeleted') || 'Comment deleted');
						await fetchVetComments(vetId);
					}
				} catch (error) {
					console.error('Error deleting comment:', error);
					message.error(getAContent('cmp_vetonest.com_ErrorDeletingComment') || 'Error deleting comment');
				}
			}
		});
	};

	// Mark comment as useful
	const handleMarkUseful = async (commentId) => {
		try {
			const result = await markCommentUseful(commentId, profileId);
			if (result && result.success) {
				await fetchVetComments(vetId);
			}
		} catch (error) {
			console.error('Error marking comment as useful:', error);
			message.error('Error updating useful mark');
		}
	};

	// Report abusive comment
	const handleReportAbuse = async () => {
		if (!reportReason.trim()) {
			message.warning(getAContent('cmp_vetonest.com_EnterReportReason') || 'Please enter a reason');
			return;
		}
		
		setSubmittingReport(true);
		try {
			const result = await reportCommentAbuse(reportingCommentId, profileId, reportReason);
			if (result && result.success) {
				message.success(getAContent('cmp_vetonest.com_CommentReported') || 'Comment reported successfully');
				setReportModalOpen(false);
				setReportReason('');
				setReportingCommentId(null);
			} else {
				throw new Error(result?.error || 'Failed to report comment');
			}
		} catch (error) {
			console.error('Error reporting comment:', error);
			message.error(getAContent('cmp_vetonest.com_ErrorReportingComment') || 'Error reporting comment');
		} finally {
			setSubmittingReport(false);
		}
	};

	// Add a reply to a comment
	const handleAddReply = async (commentId) => {
		if (!replyText.trim()) {
			message.warning(getAContent('cmp_vetonest.com_EnterReplyMessage') || 'Please enter a reply');
			return;
		}
		
		setSubmittingReply(true);
		try {
			const comment = comments.find(c => c.id === commentId);
			const responderName = userProfile ? `${userProfile.prenom || ''} ${userProfile.nom || ''}`.trim() : 'User';
			
			const currentLocale = siteLocale || 'en-GB';
			const languageCode = currentLocale.split('-')[0];
			
			const replyData = {
				commentResponseId: null,
				commentId: commentId,
				profileUserId: profileId,
				replyText: replyText,
				commentOwnerUserId: comment?.profileUserId,
				commentOwnerEmail: comment?.userEmail,
				commentOwnerName: comment?.userName,
				responderName: responderName,
				originalComment: comment?.commentText,
				vetId: vetId,
				locale: languageCode
			};
			
			const result = await addCommentReply(replyData);
			
			if (result && result.success) {
				message.success(getAContent('cmp_vetonest.com_ReplyAdded') || 'Reply added successfully');
				setReplyText('');
				setReplyingTo(null);
				await fetchVetComments(vetId);
			} else {
				throw new Error(result?.error || 'Failed to add reply');
			}
		} catch (error) {
			console.error('Error adding reply:', error);
			message.error(error.message || getAContent('cmp_vetonest.com_ErrorAddingReply') || 'Error adding reply');
		} finally {
			setSubmittingReply(false);
		}
	};

	// Fetch user profile
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (profileId && profileTypeId) {
				const profile = await profileGet(profileId, profileTypeId);
				setUserProfile(profile);
			}
		};
		fetchUserProfile();
	}, [profileId, profileTypeId]);

	// Fetch vet data from the backend based on vetId
	useEffect(() => {
		const fetchVetData = async () => {
			const currentParams = new URLSearchParams(location.search);
			const vetIdParam = currentParams.get("vetId");
			setVetId(vetIdParam);
			
			if (!vetIdParam) return;
			
			const vetDataResult = await getAVetoProfile(vetIdParam);
			if (vetDataResult && !vetDataResult.error) {
				setVetData(vetDataResult);
				setTitle(translations.profileOf + ' ' + (vetDataResult.nom || ''));
				
				// DEBUG: Log the entire vet data object to see what's coming from API
    console.log('=== FULL VET DATA FROM API ===');
    console.log(vetDataResult);
    console.log('videoAllowed field:', vetDataResult.videoAllowed);
    console.log('video_allowed field:', vetDataResult.video_allowed);
    console.log('All keys:', Object.keys(vetDataResult));
    
    // Check if video consultation is allowed for this vet
    const isVideoAllowed = vetDataResult.videoAllowed === true || 
                          vetDataResult.videoAllowed === 1 || 
                          vetDataResult.videoAllowed === "1" ||
                          vetDataResult.video_allowed === true ||
                          vetDataResult.video_allowed === 1 ||
                          vetDataResult.video_allowed === "1";
    console.log('isVideoAllowed after conversion:', isVideoAllowed);
    setVideoAllowed(isVideoAllowed);
			}
			
			try {
				const ratingData = await getVetRating(vetIdParam);
				if (ratingData && ratingData.success) {
					setVetRating(ratingData.averageRating || 0);
					setRatingCount(ratingData.ratingCount || 0);
				}
			} catch (error) {
				console.error('Error fetching rating:', error);
			}
			
			await fetchVetComments(vetIdParam);
			
			const timeslot = await getTimeslot(vetIdParam);
			setVetTimeslot(Object.entries(timeslot || {}));
			
			const hollydays = await getHollydays(vetIdParam);
			setVetHollyday(hollydays || []);
			
			const absences = await getAbsences(vetIdParam);
			setAbsences(absences || []);
			
			const lieux = await getAVetoLieux({ profileVetoId: vetIdParam });
			setVetLieux(lieux || []);
		};
		
		if (translations.profileOf) {
			fetchVetData();
		}
	}, [location.search, translations.profileOf]);

	// Handle hash scrolling for comments anchor
	useEffect(() => {
		if (window.location.hash === '#client-reviews') {
			setTimeout(() => {
				const commentsSection = document.getElementById('client-reviews');
				if (commentsSection) {
					commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 500);
		}
	}, [location.hash, comments]);

	// Scroll to comments section
	const scrollToComments = () => {
	  const commentsSection = document.getElementById('client-reviews');
	  if (commentsSection) {
		const elementPosition = commentsSection.getBoundingClientRect().top;
		const offsetPosition = elementPosition + window.pageYOffset - 260;
		
		window.scrollTo({
		  top: offsetPosition,
		  behavior: 'smooth'
		});
	  }
	};

	// Build timeslot
	const BuildTimeslot = () => {
		if (!vetTimeslot.length) return null;

		const getHoraire = (dateObj01, dateObj02) => {
			return dayjs(dateObj01).format('HH:mm') + ' - ' + dayjs(dateObj02).format('HH:mm');
		};
		
		const getFieldName = (type) => {
			if (type == 1) return 'Opened';
			if (type == 2) return 'Closed';
			if (type == 3) return 'Absence';
			if (type == 4) return 'Hollydays';
			return '';
		};
		
		const getStatus = (type) => {
			if (type == 1) return 'opened';
			if (type == 2) return 'closed';
			if (type == 3) return 'absent';
			if (type == 4) return 'hollydays';
			return '';
		};

		const getDayName = (dayNumber, locale = siteLocale) => {
			const date = new Date(2000, 0, dayNumber + 1);
			return date.toLocaleDateString(locale, { weekday: 'long' });
		};

		const handleGetAppointmentFromSlot = (slotIndex) => {
			const getNextDateForWeekday = (slotIndex) => {
				const jsTarget = Number(slotIndex) === 6 ? 0 : Number(slotIndex) + 1;
				const today = new Date();
				let daysAhead = jsTarget - today.getDay();
				if (daysAhead <= 0) daysAhead += 7;
				const result = new Date(today);
				result.setDate(today.getDate() + daysAhead);
				return result.toISOString().split('T')[0];
			};

			setConsultationSelectedVet({ ...vetData, id: Number(vetId) });
			setCurrentConsultationDate(getNextDateForWeekday(slotIndex));
			setCurrentConsultationPet(null);
			setConsultationTimeslot(vetTimeslot);
			navigate('/consultation/creation');
		};

		const resp = vetTimeslot.map((e, index) => (
			<div className="row singleFieldManager" key={index}>
				<SingleFieldManager 
					key={'timeslot_' + index}
					params={{
						fieldName: getFieldName(e[1].type),
						title: e[1].opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
						nom: e[1].nom ? e[1].nom : '',
						description: e[1].description ? e.description : '',
						placeholder: getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
						value: e[1].opened ? getDayName(e[0]) + ': ' + getHoraire(e[1].startTime.date, e[1].endTime.date) :
							getDayName(e[0]) + ' ' + (e[1].closedDate ? ' ' + dayjs(e[1].closedDate.date).format('DD') + ' ' + dayjs(e[1].closedDate.date).format('MMMM') + ': ' + getStatus(e[1].type) : ': ' + getAContent('cmp_vetonest.com_Nx55Qa02Df')),
						style: e[1].opened ? 'opened' : 'closed',
						selectedAbsenceId: e[1].type == 3 ? e[1].id : '',
						startTime: e[1].opened ? e[1].startTime.date : '',
						endTime: e[1].opened ? e[1].endTime.date : '',
						opened: e[1].opened ? e[1].opened : '',
						day: getDayName(e[0]),
						dayId: e[0],
						timeSlotId: e[1].timeSlotId,
						type: e[1].opened ? 4 : 0,
						goToLink: "#",
						onClick: e[1].opened ? () => handleGetAppointmentFromSlot(e[0]) : undefined,
					}}
				/>
			</div>
		));
		
		return resp;
	};
	
	// Build absence
	const BuildAbsence = () => {
		if (!vetAbsences || !vetAbsences.length) return null;

		return vetAbsences.map((e, index) => (
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
						dayjs(e.closedDate.date).format('MMMM') + ', ' + truncateString(e.nom, 10),
						style: 'closed',
						type: 2,
					}}
				/>
			</div>
		));
	};

	// Build system's hollydays
	const BuildHollydays = () => {
		if (!vetHollyday || !vetHollyday.length) return null;

		return vetHollyday.map((e, index) => (
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
						dayjs(e.closedDate.date).format('MMMM'),
						style: 'closed',
						type: '',
					}}
				/>
			</div>
		));
	};
	
	// Build veto's Lieux
	const BuildVetoLieux = () => {
		if (!vetLieux || !vetLieux.length) {
			return <p><strong>{getAContent('cmp_vetonest.com_kFunk0HFRg')}</strong>: {getAContent('cmp_vetonest.com_NotAvail_Txt')}</p>;
		}

		return (
			<>
				<p>
					<strong>{getAContent('cmp_vetonest.com_kFunk0HFRg')}</strong>:&nbsp;
					{vetLieux.map((e, index) => (
						<span key={index}>
							{truncateString(e.adresse, 100)}&nbsp;,
							{e.villeTagRef && getAContent(e.villeTagRef)}&nbsp;
							{e.paysTagRef && getAContent(e.paysTagRef)}&nbsp;
							{index < vetLieux.length - 1 && '; '}
						</span>
					))}
				</p>
			</>
		);
	};

	// "Get an appointment" from the profile header
	const handleGetAppointment = async () => {
		setConsultationSelectedVet({ ...vetData, id: Number(vetId) });
		setCurrentConsultationDate(null);
		setConsultationTimeslot(null);
		setCurrentConsultationPet(null);
		navigate('/consultation/creation');
	};

	if (!vetData || !Object.keys(vetData).length) {
		return (
			<>
				<Header />
				<div style={{ textAlign: 'center', padding: '60px' }}>
					<Spin size="large" />
				</div>
				<Footer />
			</>
		);
	}

	return (
		<>
			<div className="sticky-stack">
				<Header />
				<Title title={title} />
			</div>

			<div className="vet-profile-page">
				<Row gutter={16} className="vet-profile-header">
					<Col xs={24} sm={30} md={6} className="vet-profile-img">
						<img 
							src={vetData.picture
								? base_url + 'uploads/files/profile/' + vetData.picture
								: photoDefaultSrc}
							alt="Vet Profile" 
							className="profile-img" 
							onError={(e) => { e.target.src = photoDefaultSrc; }}
						/>
					</Col>
					<Col xs={24} sm={16} md={18}>
						<Card className="vet-profile-card">
							<h2>{vetData.prenom} {vetData.nom}</h2>
							<h3>
								{allSpecialities.length && vetData.vetoSpecialite
									? getAContent(allSpecialities.filter(e => e.id === vetData.vetoSpecialite.id)[0]?.tagRef || 'cmp_vetonest.com_nDHuiDhEz3')
									: getAContent('cmp_vetonest.com_nDHuiDhEz3')}
							</h3>
							
							{/* Rating Display */}
							<div style={{ marginBottom: '10px' }}>
								<Rate disabled value={vetRating} allowHalf />
								{vetRating > 0 && (
									<span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
										({vetRating.toFixed(1)} {getAContent('cmp_vetonest.com_OutOf5_Txt') || 'out of 5'} - {ratingCount} {translations.reviews})
									</span>
								)}
								{ratingCount === 0 && (
									<span style={{ marginLeft: '8px', color: '#999', fontSize: '14px' }}>
										{getAContent('cmp_vetonest.com_NoReviewsYet_Txt') || 'No reviews yet'}
									</span>
								)}
							</div>
							
							<Button 
							  type="link" 
							  onClick={scrollToComments}
							>
							  {translations.viewReviews || getAContent('cmp_vetonest.com_ViewReviews_Btn') || 'View Reviews'} ({totalComments})
							</Button>
							
							<p className="vet-profile-buttons marginTop20">
								<Button
									className="btn btn-success profileBtn"
									icon={<CalendarOutlined />}
									size="large"
									onClick={handleGetAppointment}
								>
									&nbsp;{getAContent('cmp_vetonest.com_BXJ8ERfKvZ')}
								</Button>
								&nbsp;
								{/* Video Consultation Button - Only show if vet allows video consultations */}
								{videoAllowed && (
									<VideoConsultationButton
										petOwnerId={profileId}
										veterinarianId={vetId}
										vetName={`${vetData?.prenom || ''} ${vetData?.nom || ''}`}
										buttonText={getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Video Consultation'}
										className="profileBtn"
										onValidationFail={(redirectPath) => navigate(redirectPath)}
										getAContent={getAContent}
										getPetOwnerConsultationList={getPetOwnerConsultationList}
										profileId={profileId}
										navigate={navigate}
									/>
								)}
							</p>
							
							<div className="marginTop10">&nbsp;</div>
							
							{vetData.biography && vetData.biography.trim() && (
								<p>
									<strong>{getAContent('cmp_vetonest.com_Vn5Xk3bHsD')}:</strong> {vetData.biography}
								</p>
							)}
							
							<BuildVetoLieux />
							
							<p>
								<strong>{getAContent('cmp_vetonest.com_n17Fd02Cka')}:</strong> 
								<FlagOutlined /> {vetLieux.length ? getAContent(vetLieux[0].paysTagRef) : getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>{getAContent('cmp_vetonest.com_L20sx18Qmv')}:</strong> 
								<EnvironmentOutlined /> {vetLieux.length && vetLieux[0].ville ? vetLieux[0].ville.nom : getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>Parking:</strong> 
								<CarOutlined /> {vetLieux.length && vetLieux[0].parking ? vetLieux[0].parking : getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>Autre info:</strong> 
								<InfoCircleOutlined /> {vetLieux.length && vetLieux[0].info ? vetLieux[0].info : getAContent('cmp_vetonest.com_wI6NjnXH8S')}
							</p>
							
							<p>
								<strong>{getAContent('cmp_vetonest.com_Zp83Na41Lt')}:</strong> 
								<PhoneOutlined /> {vetData.phone || getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>{getAContent('cmp_vetonest.com_Qr84Lm20Ps')}:</strong> 
								{vetData.tarifConsultation ? vetData.tarifConsultation + ' EUR' : getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>{getAContent('cmp_vetonest.com_Mn92Ks41Wa')}:</strong> 
								{vetData.tarifConsultationVideo && vetData.tarifConsultationVideo !== '0' && vetData.tarifConsultationVideo !== 0
									? vetData.tarifConsultationVideo + ' EUR' 
									: ' ' + getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>SIRET:</strong> {vetData.siret || getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
							
							<p>
								<strong>RPPS:</strong> {vetData.rpps || getAContent('cmp_vetonest.com_NotAvail_Txt')}
							</p>
						</Card>
					</Col>
				</Row>
				
				{/* Availability (Time Slots) */}
				<Row className="availability-section">
					<Col span={24}>
						<Card className="vet-availability-card">
							<h3>{getAContent('cmp_vetonest.com_AvailSlots_Txt')}:</h3>
							<BuildTimeslot />
						</Card>
					</Col>
				</Row>
				
				{/* Comments Section */}
				<Row 
					id="client-reviews"
					className="comments-section" 
					style={{ marginTop: '30px' }}
				>
					<Col span={24}>
						<Card className="vet-comments-card">
							<h3>
								{translations.clientReviews}
								{totalComments > 0 && (
									<span style={{ fontSize: '14px', color: '#888', marginLeft: '10px' }}>
										({totalComments} {translations.reviews})
									</span>
								)}
							</h3>
							
							{loadingComments ? (
								<div style={{ textAlign: 'center', padding: '40px' }}>
									<Spin size="large" />
								</div>
							) : comments.length > 0 ? (
								<div>
									{comments.map((comment) => {
										const isOwner = comment.profileUserId === profileId;
										
										const menuItems = [
											{
												key: 'reply',
												icon: <MessageOutlined />,
												label: getAContent('cmp_vetonest.com_Reply_Btn') || 'Reply',
												onClick: () => setReplyingTo(replyingTo === comment.id ? null : comment.id)
											},
											{
												key: 'report',
												icon: <FlagOutlined />,
												label: getAContent('cmp_vetonest.com_Report_Btn') || 'Report',
												onClick: () => {
													setReportingCommentId(comment.id);
													setReportModalOpen(true);
												}
											}
										];
										
										if (isOwner) {
											menuItems.push({
												key: 'delete',
												icon: <DeleteOutlined />,
												label: getAContent('cmp_vetonest.com_Delete_Btn') || 'Delete',
												danger: true,
												onClick: () => handleDeleteComment(comment.id)
											});
										}
										
										return (
											<div 
												key={comment.id} 
												style={{ 
													borderBottom: '1px solid #f0f0f0',
													padding: '16px 0',
													marginBottom: '8px'
												}}
											>
												<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
													<Avatar 
														src={comment.userPicture ? `${base_url}uploads/files/profile/${comment.userPicture}` : null}
														icon={<UserOutlined />}
														size={40}
													/>
													<div style={{ flex: 1 }}>
														<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
															<div>
																<strong style={{ fontSize: '15px' }}>{comment.userName}</strong>
																<div>
																	{comment.rating && (
																		<Rate disabled value={comment.rating} style={{ fontSize: '12px' }} />
																	)}
																	<span style={{ marginLeft: '10px', fontSize: '11px', color: '#999' }}>
																		{formatDate(comment.consultationDate)}
																	</span>
																</div>
															</div>
															<Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
																<Button type="text" icon={<MoreOutlined />} size="small" />
															</Dropdown>
														</div>
														
														<p style={{ margin: '8px 0', fontSize: '14px', color: '#333', fontStyle: 'italic' }}>
															"{comment.commentText}"
														</p>
														
														<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
															<Tooltip title={getAContent('cmp_vetonest.com_MarkUseful_Tooltip') || 'Mark as useful'}>
																<Button 
																	type="text" 
																	size="small"
																	icon={comment.isUseful ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
																	onClick={() => handleMarkUseful(comment.id)}
																>
																	{comment.usefulCount > 0 && comment.usefulCount}
																</Button>
															</Tooltip>
															<span style={{ fontSize: '11px', color: '#bbb' }}>
																{getAContent('cmp_vetonest.com_PostedOn_Txt') || 'Posted on'}: {formatDate(comment.dateCreated)}
															</span>
														</div>
														
														{/* Replies */}
														{comment.responses && comment.responses.length > 0 && (
															<div style={{ marginTop: '12px', paddingLeft: '20px', borderLeft: '2px solid #f0f0f0' }}>
																{comment.responses.map((reply) => (
																	<div key={reply.id} style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
																		<Avatar 
																			src={reply.userPicture ? `${base_url}uploads/files/profile/${reply.userPicture}` : null}
																			icon={<UserOutlined />}
																			size={24}
																		/>
																		<div style={{ flex: 1 }}>
																			<div>
																				<strong style={{ fontSize: '12px' }}>{reply.userName}</strong>
																				<span style={{ marginLeft: '8px', fontSize: '10px', color: '#999' }}>
																					{formatDate(reply.dateCreated)}
																				</span>
																			</div>
																			<p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
																				{reply.commentResponseText}
																			</p>
																		</div>
																	</div>
																))}
															</div>
														)}
														
														{/* Reply Form */}
														{replyingTo === comment.id && (
															<div style={{ marginTop: '12px' }}>
																<TextArea
																	rows={3}
																	value={replyText}
																	onChange={(e) => setReplyText(e.target.value)}
																	placeholder={getAContent('cmp_vetonest.com_WriteReply_Placeholder') || 'Write your reply...'}
																/>
																<div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
																	<Button size="small" onClick={() => {
																		setReplyingTo(null);
																		setReplyText('');
																	}}>
																		{getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel'}
																	</Button>
																	<Button 
																		size="small" 
																		type="primary" 
																		loading={submittingReply}
																		onClick={() => handleAddReply(comment.id)}
																	>
																		{getAContent('cmp_vetonest.com_Submit_Btn') || 'Submit'}
																	</Button>
																</div>
															</div>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<Empty 
									description={getAContent('cmp_vetonest.com_NoReviewsYet_Txt') || 'No reviews yet'} 
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
							)}
						</Card>
					</Col>
				</Row>
			</div>
			
			{/* Report Modal */}
			<Modal
				title={getAContent('cmp_vetonest.com_ReportComment_Title') || 'Report Comment'}
				open={reportModalOpen}
				onOk={handleReportAbuse}
				onCancel={() => {
					setReportModalOpen(false);
					setReportReason('');
					setReportingCommentId(null);
				}}
				confirmLoading={submittingReport}
				okText={getAContent('cmp_vetonest.com_Submit_Btn') || 'Submit'}
				cancelText={getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel'}
			>
				<TextArea
					rows={4}
					value={reportReason}
					onChange={(e) => setReportReason(e.target.value)}
					placeholder={getAContent('cmp_vetonest.com_ReportReason_Placeholder') || 'Please explain why this comment is inappropriate...'}
				/>
			</Modal>
			
			<div>&nbsp;</div>
			<Footer />
		</>
	);
};

export default VetProfile;