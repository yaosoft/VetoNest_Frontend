import React, { useMemo, useState, useEffect, useContext } from "react";
import { Button, Card, Row, Col, Rate, Modal, message, Avatar, Divider, Empty, Spin, Tooltip, Dropdown, Input, Tag } from "antd";
import { 
	PhoneOutlined, 
	CalendarOutlined, 
	FlagOutlined, 
	EnvironmentOutlined, 
	InfoCircleOutlined,
	CarOutlined,
	UserOutlined,
	MessageOutlined,
	LikeOutlined,
	LikeFilled,
	DeleteOutlined,
	MoreOutlined,
	ClockCircleOutlined,
	StarOutlined,
	SafetyCertificateOutlined,
	BankOutlined,
	GlobalOutlined,
	IdcardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";
import dayjs from 'dayjs';

import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';
import SingleFieldManager from '../SingleFieldManager';
import VetName from '../VetName';
import VerificationStatusBadge from '../VerificationStatusBadge';

const { TextArea } = Input;

// Reusable section title component matching Profile.js style
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
		getPetOwnerConsultationList,
		getVetoCliniqueInfo,
		siteLanguage,
		setConsultationSelectedDate, // ADD THIS
	} = useContext(SiteContext);
	
	const navigate = useNavigate();
    const location = useLocation();
	
	const [userProfile, setUserProfile] = useState(null);
	
	const [vetData, setVetData] = useState(null);
	const [vetId, setVetId] = useState(null);
	const [vetTimeslot, setVetTimeslot] = useState([]);
	const [vetHollyday, setVetHollyday] = useState([]);
	const [vetAbsences, setAbsences] = useState([]);
	const [vetLieux, setVetLieux] = useState([]);
	const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');
	const [title, setTitle] = useState(null);
	
	const [isLoading, setIsLoading] = useState(true);
	const [loadingVetDataText, setLoadingVetDataText] = useState('');
	
	// Clinic info state
	const [vetoCliniqueInfo, setVetoCliniqueInfo] = useState(null);
	
	// Translations state - initialized with defaults (no placeholders)
	const [translations, setTranslations] = useState({
		profileOf: 'Profile of',
		clientReviews: 'Client reviews',
		reviews: 'reviews',
		viewReviews: 'View reviews'
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

	// ============================================================
	// HELPER FUNCTIONS
	// ============================================================

	// Helper to format a datetime in the vet's timezone with IANA identifier
	//
	// IMPORTANT: dateStr is a raw, timezone-less string like
	// "2026-06-26 14:00:00.000000" coming straight from the DB (see
	// TimeSlotController::edit(), which just does
	// DateTime::createFromFormat('H:i', $startTime) - no timezone is ever
	// associated with the vet's chosen hours). The HH:mm digits ARE the
	// vet's literal local wall-clock time as they typed it in.
	//
	// We previously ran this through `new Date(dateStr)` and then
	// re-projected it via Intl.DateTimeFormat(timeZone). That round-trip is
	// wrong: `new Date()` on a string with no zone marker parses it as the
	// *browser/runtime's own local system timezone*, not the vet's. So the
	// displayed time silently shifted depending on what timezone the
	// machine viewing the page happened to be set to (e.g. it only came out
	// correct if the viewer's system clock was already in Europe/Paris).
	// Extracting the digits directly avoids that dependency entirely and
	// keeps this page consistent with the booking page, which already reads
	// these values the same way.
	const formatTimeWithTimezone = (dateStr, timezone = 'UTC') => {
		if (!dateStr) return '—';

		const timeMatch = dateStr.match(/(\d{2}):(\d{2})/);
		if (!timeMatch) return '—';

		const hours24 = parseInt(timeMatch[1], 10);
		const minutes = timeMatch[2];
		const period = hours24 >= 12 ? 'PM' : 'AM';
		const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
		const timeStr = `${String(hours12).padStart(2, '0')}:${minutes} ${period}`;

		const displayTz = timezone
			.replace(/_/g, ' ')
			.replace(/\//g, ' / ');

		return `${timeStr} (${displayTz})`;
	};

	// Helper function to build clinic link
	const getClinicLink = (cliniqueId) => {
		const id = cliniqueId || (vetoCliniqueInfo?.etablissementId);
		if (!id) {
			return '#';
		}
		return `/etablissement?userId=${userId}&etablissementId=${id}`;
	};

	// Load translations (re-runs when language changes)
	useEffect(() => {
		const loadTranslations = async () => {
			const profileOfText = await getAContent('cmp_vetonest.com_ProfileOf_Txt');
			const clientReviewsText = await getAContent('cmp_vetonest.com_ClientReviews_Txt');
			const reviewsText = await getAContent('cmp_vetonest.com_Reviews_Txt');
			const viewReviewsText = await getAContent('cmp_vetonest.com_ViewReviews_Btn');

			// Only update if we got a real translation (not a placeholder)
			setTranslations(prev => ({
				profileOf: profileOfText && profileOfText !== '...' && profileOfText !== '***' 
					? profileOfText : prev.profileOf,
				clientReviews: clientReviewsText && clientReviewsText !== '...' && clientReviewsText !== '***' 
					? clientReviewsText : prev.clientReviews,
				reviews: reviewsText && reviewsText !== '...' && reviewsText !== '***' 
					? reviewsText : prev.reviews,
				viewReviews: viewReviewsText && viewReviewsText !== '...' && viewReviewsText !== '***' 
					? viewReviewsText : prev.viewReviews,
			}));
		};

		loadTranslations();
	}, [siteLanguage]);

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

	useEffect(() => {
		const a = async () => {
			const text = await getAContent( 'cmp_vetonest.com_loading_veterinarian_profile' );
			setLoadingVetDataText( text );
		};
		a();
	}, []);

	// Fetch vet data from the backend based on vetId
	useEffect(() => {
		if (!translations.profileOf) return;

		const fetchVetData = async () => {
			setIsLoading(true);
			const currentParams = new URLSearchParams(location.search);
			const vetIdParam = currentParams.get("vetId");
			setVetId(vetIdParam);
			
			if (!vetIdParam) {
				setIsLoading(false);
				return;
			}
			
			const vetDataResult = await getAVetoProfile(vetIdParam);
			if (vetDataResult && !vetDataResult.error) {
				setVetData(vetDataResult);
				setTitle((translations.profileOf || 'Profile of') + ' ' + (vetDataResult.nom || ''));
			}
			
			// Fetch clinic info for this vet
			const clinicInfo = await getVetoCliniqueInfo(vetIdParam);
			if (clinicInfo && clinicInfo.etablissementId) {
				setVetoCliniqueInfo(clinicInfo);
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
			// CRITICAL FIX: Use Object.values() instead of Object.entries()
			// The API returns an object with keys 0-6 (0=Sunday, 6=Saturday)
			// Object.values() gives us the day objects in the correct order
			const timeslotArray = Object.values(timeslot || {});
			setVetTimeslot(timeslotArray);
			
			const hollydays = await getHollydays(vetIdParam);
			setVetHollyday(hollydays || []);
			
			const absences = await getAbsences(vetIdParam);
			setAbsences(absences || []);
			
			const lieux = await getAVetoLieux({ profileVetoId: vetIdParam });

			const allLocationsFromVetData = vetDataResult?.allLocations || [];
			let mergedLieux = lieux && lieux.length > 0 ? lieux : [];

			if (allLocationsFromVetData.length > 0) {
				if (!mergedLieux.length) {
					mergedLieux = allLocationsFromVetData;
				} else {
					mergedLieux = mergedLieux.map((lieu, idx) => {
						const match = allLocationsFromVetData[idx] || {};
						return {
							...match,
							...lieu,
							adresse: lieu.adresse || match.adresse,
							parking: lieu.parking || match.parking,
							info: lieu.info || match.info,
							transports: (lieu.transports && lieu.transports.length > 0)
								? lieu.transports
								: (match.transports || []),
						};
					});
				}
			}

			setVetLieux(mergedLieux);
			setIsLoading(false);
		};
		
		fetchVetData();
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

	// ============================================================
	// BUILD FUNCTIONS
	// ============================================================

	// Build timeslot with timezone support
	const BuildTimeslot = () => {
		if (!vetTimeslot || !vetTimeslot.length) return null;

		const vetTimezone = vetData?.timezone || 'UTC';

		const getHoraireWithTz = (start, end) => {
			const startStr = formatTimeWithTimezone(start, vetTimezone);
			const endStr = formatTimeWithTimezone(end, vetTimezone);
			const tzMatch = startStr.match(/\(([^)]+)\)$/);
			const tzLocation = tzMatch ? tzMatch[1] : vetTimezone;
			const startTime = startStr.replace(` (${tzLocation})`, '');
			const endTime = endStr.replace(` (${tzLocation})`, '');
			return `${startTime} – ${endTime} (${tzLocation})`;
		};

		// dayNumber is 0=Sunday..6=Saturday, matching Date.getDay(). Resolve the
		// label from that rather than from the row's position: the API returns an
		// object keyed by day, so position and day are not the same thing.
		const getDayName = (dayNumber) => {
			const date = new Date();
			const diff = (date.getDay() - Number(dayNumber) + 7) % 7;
			date.setDate(date.getDate() - diff);
			return date.toLocaleDateString(siteLocale || 'en', { weekday: 'long' });
		};

		// Monday first, Sunday last.
		const mondayFirst = (dayNumber) => (Number(dayNumber) + 6) % 7;

		// Get the next date for a given weekday (0=Sunday, 1=Monday, etc.)
		// Rule: use THIS week's occurrence if it hasn't passed yet (today counts as "not passed"),
		// otherwise roll forward to NEXT week's occurrence.
		const getNextDateForWeekday = (slotIndex) => {
			// slotIndex maps to day: 0=Sunday, 1=Monday, ..., 6=Saturday
			const today = new Date();
			let daysAhead = slotIndex - today.getDay();
			// Only roll to next week if the day has ALREADY passed this week.
			// (Bug fix: was `<= 0`, which incorrectly pushed "today" to next week too.)
			if (daysAhead < 0) daysAhead += 7;
			const result = new Date(today);
			result.setDate(today.getDate() + daysAhead);

			// Bug fix: format using LOCAL date parts instead of toISOString().
			// toISOString() converts to UTC, which can shift the date by ±1 day
			// depending on the user's timezone offset and current local time
			// (e.g. for someone at UTC+2 it's already "tomorrow" in UTC after 10pm).
			const yyyy = result.getFullYear();
			const mm = String(result.getMonth() + 1).padStart(2, '0');
			const dd = String(result.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		};

		const handleGetAppointmentFromSlot = (slotIndex) => {
			if (profileTypeId == 2) {
				message.warning(getAContent('cmp_vetonest.com_VetCannotBook_Txt') || 'A vet cannot book a consultation');
				return;
			}

			// Get the selected date
			const selectedDate = getNextDateForWeekday(slotIndex);
			
			// Save the selected vet
			setConsultationSelectedVet({ ...vetData, id: Number(vetId) });
			
			// Save the selected date in context
			setConsultationSelectedDate(selectedDate);
			
			// Clear other consultation state
			setCurrentConsultationDate(null);
			setConsultationTimeslot(null);
			setCurrentConsultationPet(null);
			
			navigate('/consultation/creation');
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

		const orderedSlots = [...vetTimeslot].sort(
			(a, b) => mondayFirst(a.dayNumber) - mondayFirst(b.dayNumber)
		);

		return orderedSlots.map((slot, index) => {
			const dayNumber = Number(slot.dayNumber);
			const dayName = getDayName(dayNumber);
			let displayValue;

			if (slot.opened) {
				const timeRange = getHoraireWithTz(slot.startTime.date, slot.endTime.date);
				displayValue = `${dayName}: ${timeRange}`;
			} else {
				const datePart = slot.closedDate ? dayjs(slot.closedDate.date).format('DD MMMM') : '';
				const status = getStatus(slot.type);
				displayValue = `${dayName} ${datePart} – ${status}`;
			}

			return (
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'timeslot_' + index}
						params={{
							fieldName: getFieldName(slot.type),
							title: slot.opened ? getAContent('cmp_vetonest.com_Yh8Qk1rVtA') : getAContent('cmp_vetonest.com_Zn3Lm6sWpR'),
							nom: slot.nom || '',
							description: slot.description || '',
							placeholder: getAContent('cmp_vetonest.com_Ho2Kx9bFmC'),
							value: displayValue,
							style: slot.opened ? 'opened' : 'closed',
							selectedAbsenceId: slot.type == 3 ? slot.id : '',
							startTime: slot.opened ? slot.startTime.date : '',
							endTime: slot.opened ? slot.endTime.date : '',
							opened: slot.opened || false,
							day: dayName,
							dayId: dayNumber,
							timeSlotId: slot.timeSlotId,
							type: slot.opened ? 4 : 0,
							goToLink: "#",
							onClick: slot.opened ? () => handleGetAppointmentFromSlot(dayNumber) : undefined,
						}}
					/>
				</div>
			);
		});
	};
	
	// Build absence
	const BuildAbsence = () => {
		if (!vetAbsences || !vetAbsences.length) return null;

		return vetAbsences.map((e, index) => {
			const closedDate = new Date(e.closedDate.date);
			const formattedDate = closedDate.toLocaleDateString(siteLocale || 'en-GB', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			});
			return (
				<div className="row singleFieldManager" key={index}>
					<SingleFieldManager
						key={'absence_' + index}
						params={{
							fieldName: 'Absence',
							title: getAContent('cmp_vetonest.com_Bz7Nq4wYpJ'),
							nom: e.nom,
							selectedAbsenceId: e.id,
							description: e.description || '',
							placeholder: getAContent('cmp_vetonest.com_Wr2Hc9vXsK'),
							value: `${formattedDate} – ${truncateString(e.nom, 20)}`,
							style: 'closed',
							type: 2,
						}}
					/>
				</div>
			);
		});
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
	
	// Build veto's Lieux - Improved display with parking, info, and transport
	const BuildVetoLieux = () => {
		if (!vetLieux || !vetLieux.length) {
			return (
				<div className="vet-location-item">
					<EnvironmentOutlined style={{ marginRight: '8px', color: '#999' }} />
					<span>{getAContent('cmp_vetonest.com_NoLocation_Txt') || 'No location information available'}</span>
				</div>
			);
		}

		// Helper function to get localized name with tagRef
		const getLocalizedName = (item, tagRef, defaultName) => {
			if (tagRef) {
				const translated = getAContent(tagRef);
				if (translated && translated !== tagRef) {
					return translated;
				}
			}
			return defaultName;
		};

		// Helper to get transport icon/name
		const getTransportInfo = (transportId) => {
			const transports = {
				1: { icon: '🚌', name: 'Bus' },
				2: { icon: '🚇', name: 'Metro' },
				3: { icon: '🚈', name: 'Tram' },
				4: { icon: '🚆', name: 'Train' },
				5: { icon: '🅿️', name: 'Parking' },
				6: { icon: '🚲', name: 'Bike' },
			};
			return transports[transportId] || { icon: '📍', name: 'Transport' };
		};

		return (
			<div className="vet-locations-list">
				{vetLieux.map((e, index) => {
					// Get city and country with localization
					const cityName = e.ville?.nom || e.city;
					const cityTagRef = e.ville?.tagRef || e.cityTagRef;
					const countryName = e.pays?.nom || e.country;
					const countryTagRef = e.pays?.tagRef || e.countryTagRef;
					const countryIso = e.pays?.iso || e.countryIso;
					
					const localizedCity = getLocalizedName(e.ville, cityTagRef, cityName);
					const localizedCountry = getLocalizedName(e.pays, countryTagRef, countryName);
					
					return (
						<div key={index} className="vet-location-item" style={{ 
							marginBottom: '16px', 
							padding: '12px',
							background: '#f9f9f9',
							borderRadius: '12px',
							border: '1px solid #f0f0f0'
						}}>
							{/* Address */}
							{e.adresse && (
								<div style={{ 
									display: 'flex', 
									alignItems: 'flex-start', 
									gap: '8px',
									marginBottom: '8px'
								}}>
									<EnvironmentOutlined style={{ marginTop: '2px', color: '#FFDE59' }} />
									<div style={{ flex: 1, fontSize: '14px', color: '#333', fontWeight: 500 }}>
										{e.adresse}
									</div>
								</div>
							)}
							
							{/* City / Country with Flag */}
							{(localizedCity || localizedCountry) && (
								<div style={{ 
									fontSize: '13px', 
									color: '#666',
									display: 'flex',
									alignItems: 'center',
									gap: '6px',
									flexWrap: 'wrap',
									marginBottom: '8px',
									paddingLeft: '24px'
								}}>
									{countryIso && (
										<div style={{ 
											width: "16px", 
											height: "12px", 
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											backgroundImage: `url(/img/flags/${countryIso.toLowerCase()}.svg)`,
											backgroundSize: "cover",
											backgroundPosition: "center",
											backgroundRepeat: "no-repeat",
											borderRadius: "2px",
											border: "1px solid #e0e0e0"
										}} />
									)}
									<span>
										{localizedCity && localizedCountry 
											? `${localizedCity} / ${localizedCountry}`
											: localizedCity || localizedCountry}
									</span>
								</div>
							)}
							
							{/* Parking Info */}
							{e.parking && (
								<div style={{ 
									display: 'flex', 
									alignItems: 'center', 
									gap: '6px',
									marginBottom: '6px',
									paddingLeft: '24px',
									fontSize: '12px',
									color: '#555'
								}}>
									<span>🅿️</span>
									<span>{e.parking}</span>
								</div>
							)}
							
							{/* Additional Info */}
							{e.info && (
								<div style={{ 
									display: 'flex', 
									alignItems: 'flex-start', 
									gap: '6px',
									marginBottom: '6px',
									paddingLeft: '24px',
									fontSize: '12px',
									color: '#777',
									fontStyle: 'italic'
								}}>
									<span>ℹ️</span>
									<span>{e.info}</span>
								</div>
							)}
							
							{/* Transport Info */}
							{e.transports && e.transports.length > 0 && (
								<div style={{ 
									display: 'flex', 
									alignItems: 'center', 
									gap: '8px',
									flexWrap: 'wrap',
									marginTop: '8px',
									paddingLeft: '24px'
								}}>
									{e.transports.map((transport, tIdx) => {
										const transportInfo = getTransportInfo(transport.transportId);
										return (
											<Tooltip key={tIdx} title={transport.description || transportInfo.name}>
												<span style={{ 
													fontSize: '12px',
													cursor: 'help',
													background: '#f0f0f0',
													padding: '4px 8px',
													borderRadius: '16px',
													display: 'inline-flex',
													alignItems: 'center',
													gap: '4px'
												}}>
													<span>{transportInfo.icon}</span>
													<span>{transportInfo.name}</span>
												</span>
											</Tooltip>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	// "Get an appointment" from the profile header
	const handleGetAppointment = async () => {
		if (profileTypeId == 2) {
			message.warning(getAContent('cmp_vetonest.com_VetCannotBook_Txt') || 'A vet cannot book a consultation');
			return;
		}

		setConsultationSelectedVet({ ...vetData, id: Number(vetId) });
		setCurrentConsultationDate(null);
		setConsultationTimeslot(null);
		setCurrentConsultationPet(null);
		navigate('/consultation/creation');
	};

	// Helper function to mask phone number - shows only last 4 digits
	const maskPhoneNumber = (phone) => {
		if (!phone) return '';
		// Remove spaces for processing
		const cleaned = phone.replace(/\s/g, '');
		const lastFour = cleaned.slice(-4);
		const maskedLength = cleaned.length - 4;
		const maskedPart = '*'.repeat(maskedLength);
		// Re-insert original spacing pattern if needed
		if (phone.includes(' ')) {
			// Try to preserve the original spacing pattern
			const parts = phone.split(' ');
			let result = '';
			let digitsProcessed = 0;
			for (let i = 0; i < parts.length - 1; i++) {
				result += '*'.repeat(parts[i].length) + ' ';
				digitsProcessed += parts[i].length;
			}
			result += lastFour;
			return result;
		}
		return `${maskedPart}${lastFour}`;
	};

	if (!vetData || !Object.keys(vetData).length || isLoading) {
		return (
			<>
				<Header />
				<div className="vet-profile-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
					<Row gutter={[32, 32]}>
						<Col span={24}>
							<Card style={{ borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
								<Spin size="large" />
								<p style={{ marginTop: '16px' }}>{ loadingVetDataText }</p>
							</Card>
						</Col>
					</Row>
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

			<div key={vetId} className="vet-profile-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
				{/* Profile Header Section */}
				<Row gutter={[32, 32]} className="vet-profile-header">
					{/* Photo Column - STICKY */}
					<Col xs={24} sm={24} md={8} lg={6}>
						<div 
							className="vet-photo-section" 
							style={{ 
								textAlign: 'center',
								position: 'sticky', 
								top: '190px',
								maxHeight: 'calc(100vh - 180px)', 
								overflowY: 'auto'
							}}
						>
							<div className="photo-wrapper" style={{ 
								position: 'relative', 
								display: 'inline-block',
								width: '100%',
								maxWidth: '280px'
							}}>
								<img 
									src={vetData.picture
										? base_url + 'uploads/files/profile/' + vetData.picture
										: photoDefaultSrc}
									alt="Vet Profile" 
									className="vet-profile-photo"
									style={{ 
										width: '100%',
										borderRadius: '16px',
										aspectRatio: '1/1',
										objectFit: 'cover',
										border: '3px solid #FFDE59',
										boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
									}}
									onError={(e) => { e.target.src = photoDefaultSrc; }}
								/>
							</div>
						</div>
					</Col>

					{/* Info Column */}
					<Col xs={24} sm={24} md={16} lg={18}>
						<Card className="vet-info-card" style={{ 
							borderRadius: '16px',
							boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
							border: 'none',
							height: '100%'
						}}>
							{/* Name and Title */}
							<div className="vet-name-section">
								<h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 600 }}>
									<VetName 
										vet={vetData}
										showTitle={true}
										format="full"
										withTooltip={true}
									/>
								</h1>
								<h3 style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
									{allSpecialities.length && vetData.vetoSpecialite
										? getAContent(allSpecialities.filter(e => e.id === vetData.vetoSpecialite.id)[0]?.tagRef || 'cmp_vetonest.com_nDHuiDhEz3')
										: getAContent('cmp_vetonest.com_nDHuiDhEz3')}
								</h3>
							</div>

							{/* Verification Badge */}
							<div style={{ marginBottom: '16px' }}>
								<VerificationStatusBadge 
									status={vetData.verificationStatus}
									showTooltip={true}
									showIcon={true}
									size="default"
								/>
							</div>

							{/* Rating Section */}
							<div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
								<Rate disabled value={vetRating} allowHalf style={{ fontSize: '16px' }} />
								{vetRating > 0 && (
									<span style={{ color: '#666', fontSize: '14px' }}>
										{vetRating.toFixed(1)} / 5 ({ratingCount} {translations.reviews || 'reviews'})
									</span>
								)}
								{ratingCount === 0 && (
									<span style={{ color: '#999', fontSize: '14px' }}>
										{getAContent('cmp_vetonest.com_NoReviewsYet_Txt') || 'No reviews yet'}
									</span>
								)}
							</div>

							{/* Action Buttons */}
							<div className="vet-action-buttons" style={{ marginBottom: '20px' }}>
								{vetData.bookable === false ? (
									<Tooltip title={getAContent('cmp_vetonest.com_VetNotClaimedTooltip_Txt') || "Ce vétérinaire n'a pas encore activé son compte"}>
										<Button
											disabled
											icon={<CalendarOutlined />}
											size="large"
											style={{
												borderRadius: '8px',
												height: '44px',
												padding: '0 32px'
											}}
										>
											{getAContent('cmp_vetonest.com_ComingSoon_Txt') || 'Bientôt disponible'}
										</Button>
									</Tooltip>
								) : (
									<Button
										type="primary"
										icon={<CalendarOutlined />}
										size="large"
										onClick={handleGetAppointment}
										style={{
											background: '#FFDE59',
											borderColor: '#FFDE59',
											color: '#333',
											fontWeight: 600,
											borderRadius: '8px',
											height: '44px',
											padding: '0 32px'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = '#e6c84f';
											e.currentTarget.style.borderColor = '#e6c84f';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = '#FFDE59';
											e.currentTarget.style.borderColor = '#FFDE59';
										}}
									>
										{getAContent('cmp_vetonest.com_BookConsultation_Btn') || 'Book a consultation'}
									</Button>
								)}
							</div>

							{/* Biography */}
							{vetData.biography && vetData.biography.trim() && (
								<div className="vet-biography" style={{ marginBottom: '20px' }}>
									<Divider style={{ margin: '0 0 16px 0' }} />
									<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', whiteSpace: 'pre-wrap' }}>
										{vetData.biography}
									</p>
								</div>
							)}

							{/* Contact & Location Info Grid */}
							<Divider style={{ margin: '0 0 16px 0' }} />
							
							{/* Contact Info - Using SectionTitle */}
							<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
								<Col xs={24}>
									<SectionTitle
										icon={<PhoneOutlined />}
										iconBg="#EEF0FF"
										iconColor="#4D6BFE"
										title={getAContent('cmp_vetonest.com_EeTPYxP4vF') || 'Contact'}
									/>
									<div style={{ marginTop: '8px' }}>
										{vetData.phone && (
											<div style={{ marginBottom: '8px' }}>
												<Tooltip 
													title={getAContent('cmp_vetonest.com_PhoneNumberTooltip_Txt') || 'The phone number will be revealed after booking a consultation'}
													placement="top"
												>
													<span style={{ color: '#999', cursor: 'help' }}>
														{maskPhoneNumber(vetData.phone)}
													</span>
												</Tooltip>
											</div>
										)}
										{!vetData.phone && (
											<p style={{ color: '#999' }}>{getAContent('cmp_vetonest.com_NotAvail_Txt') || 'Not available'}</p>
										)}
									</div>
								</Col>
							</Row>

							{/* Pricing Info - Using SectionTitle */}
							<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
								<Col xs={24}>
									<SectionTitle
										icon={<BankOutlined />}
										iconBg="#E6F7EE"
										iconColor="#1AA260"
										title={getAContent('cmp_vetonest.com_Qr84Lm20Ps') || 'Consultation fees'}
									/>
									<div style={{ marginTop: '8px' }}>
										{vetData.tarifConsultation && (
											<p style={{ marginBottom: '8px' }}>
												<strong>{vetData.tarifConsultation} €</strong>
												{vetData.tarifConsultationVideo && vetData.tarifConsultationVideo !== '0' && (
													<span style={{ color: '#666', marginLeft: '8px' }}>
														({getAContent('cmp_vetonest.com_VideoConsultation_Btn') || 'Video'}: {vetData.tarifConsultationVideo} €)
													</span>
												)}
											</p>
										)}
										{vetData.videoAllowed && (
											<Tag color="cyan" icon={<SafetyCertificateOutlined />} style={{ marginTop: '4px' }}>
												{getAContent('cmp_vetonest.com_VideoConsultationAvailable_Label') || 'Video consultation available'}
											</Tag>
										)}
									</div>
								</Col>
							</Row>

							{/* Location Info - Using SectionTitle */}
							<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
								<Col xs={24}>
									<SectionTitle
										icon={<EnvironmentOutlined />}
										iconBg="#FDEFE0"
										iconColor="#D9822B"
										title={getAContent('cmp_vetonest.com_consultation_location') || 'Location'}
									/>
									<div style={{ marginTop: '8px' }}>
										{/* Display all locations with full details */}
										{vetLieux && vetLieux.length > 0 ? (
											<div className="vet-locations-list">
												{vetLieux.map((lieu, idx) => {
													const cityName = lieu.ville?.nom || lieu.city;
													const cityTagRef = lieu.ville?.tagRef || lieu.cityTagRef;
													const countryName = lieu.pays?.nom || lieu.country;
													const countryTagRef = lieu.pays?.tagRef || lieu.countryTagRef;
													const countryIso = lieu.pays?.iso || lieu.countryIso;
													
													const localizedCity = cityTagRef ? (getAContent(cityTagRef) || cityName) : cityName;
													const localizedCountry = countryTagRef ? (getAContent(countryTagRef) || countryName) : countryName;
													
													return (
														<div key={idx} style={{ 
															marginBottom: '16px', 
															padding: '12px',
															background: '#f9f9f9',
															borderRadius: '12px',
															border: '1px solid #f0f0f0'
														}}>
															{/* Address */}
															{lieu.adresse && (
																<div style={{ 
																	display: 'flex', 
																	alignItems: 'flex-start', 
																	gap: '8px',
																	marginBottom: '8px'
																}}>
																	<EnvironmentOutlined style={{ marginTop: '2px', color: '#FFDE59' }} />
																	<div style={{ flex: 1, fontSize: '14px', color: '#333', fontWeight: 500 }}>
																		{lieu.adresse}
																	</div>
																</div>
															)}
															
															{/* City / Country with Flag */}
															{(localizedCity || localizedCountry) && (
																<div style={{ 
																	fontSize: '13px', 
																	color: '#666',
																	display: 'flex',
																	alignItems: 'center',
																	gap: '6px',
																	flexWrap: 'wrap',
																	marginBottom: '8px',
																	paddingLeft: '24px'
																}}>
																	{countryIso && (
																		<div style={{ 
																			width: "16px", 
																			height: "12px", 
																			display: "inline-flex",
																			alignItems: "center",
																			justifyContent: "center",
																			backgroundImage: `url(/img/flags/${countryIso.toLowerCase()}.svg)`,
																			backgroundSize: "cover",
																			backgroundPosition: "center",
																			backgroundRepeat: "no-repeat",
																			borderRadius: "2px",
																			border: "1px solid #e0e0e0"
																		}} />
																	)}
																	<span>
																		{localizedCity && localizedCountry 
																			? `${localizedCity} / ${localizedCountry}`
																			: localizedCity || localizedCountry}
																	</span>
																</div>
															)}
															
															{/* Parking Info */}
															{lieu.parking && (
																<div style={{ 
																	display: 'flex', 
																	alignItems: 'center', 
																	gap: '6px',
																	marginBottom: '6px',
																	paddingLeft: '24px',
																	fontSize: '12px',
																	color: '#555'
																}}>
																	<span>🅿️</span>
																	<span>{lieu.parking}</span>
																</div>
															)}
															
															{/* Additional Info */}
															{lieu.info && (
																<div style={{ 
																	display: 'flex', 
																	alignItems: 'flex-start', 
																	gap: '6px',
																	marginBottom: '6px',
																	paddingLeft: '24px',
																	fontSize: '12px',
																	color: '#777',
																	fontStyle: 'italic'
																}}>
																	<span>ℹ️</span>
																	<span>{lieu.info}</span>
																</div>
															)}
															
															{/* Transport Info */}
															{lieu.transports && lieu.transports.length > 0 && (
																<div style={{ 
																	display: 'flex', 
																	alignItems: 'center', 
																	gap: '8px',
																	flexWrap: 'wrap',
																	marginTop: '8px',
																	paddingLeft: '24px'
																}}>
																	{lieu.transports.map((transport, tIdx) => {
																		const transportInfo = {
																			1: { icon: '🚌', name: 'Bus' },
																			2: { icon: '🚇', name: 'Metro' },
																			3: { icon: '🚈', name: 'Tram' },
																			4: { icon: '🚆', name: 'Train' },
																			5: { icon: '🅿️', name: 'Parking' },
																			6: { icon: '🚲', name: 'Bike' },
																		}[transport.transportId] || { icon: '📍', name: 'Transport' };
																		
																		return (
																			<Tooltip key={tIdx} title={transport.description || transportInfo.name}>
																				<span style={{ 
																					fontSize: '12px',
																					cursor: 'help',
																					background: '#f0f0f0',
																					padding: '4px 8px',
																					borderRadius: '16px',
																					display: 'inline-flex',
																					alignItems: 'center',
																					gap: '4px'
																				}}>
																					<span>{transportInfo.icon}</span>
																					<span>{transportInfo.name}</span>
																				</span>
																			</Tooltip>
																		);
																	})}
																</div>
															)}
														</div>
													);
												})}
											</div>
										) : (
											<p style={{ color: '#999' }}>{getAContent('cmp_vetonest.com_NoLocation_Txt') || 'No location information available'}</p>
										)}
									</div>
								</Col>
							</Row>

							{/* Languages Section - Using SectionTitle */}
							{vetData.langueDefault && vetData.langueDefault.tagRef && (() => {
								const lang = vetData.langueDefault;
								const localizedLanguageName = getAContent(lang.tagRef) || lang.name || lang.code || 'Language';
								
								return (
									<>
										<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
											<Col xs={24}>
												<SectionTitle
													icon={<GlobalOutlined />}
													iconBg="#FDE8EC"
													iconColor="#D63B5C"
													title={getAContent('cmp_vetonest.com_PreferredLanguage_Label') || 'Preferred Language'}
												/>
												<div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
													<Tag color="blue" style={{ borderRadius: '16px', padding: '4px 12px', fontSize: '13px' }}>
														{localizedLanguageName}
													</Tag>
												</div>
											</Col>
										</Row>
										<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
											{vetData.atHome === true && (
												<Tag color="green" icon={<CarOutlined />} style={{ marginTop: '8px' }}>
													{getAContent('cmp_vetonest.com_HomeVisitsAvailable_Txt') || 'Home visits available'}
												</Tag>
											)}
										</Row>
									</>
								);
							})()}

							{/* Clinic Info Section */}
							{vetoCliniqueInfo && vetoCliniqueInfo.etablissementId && (
								<>
									<Divider style={{ margin: '16px 0' }} />
									<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
										<Col xs={24}>
											<SectionTitle
												icon={<span>🏥</span>}
												iconBg="#EEF0FF"
												iconColor="#4D6BFE"
												title={getAContent('cmp_vetonest.com_MyClinic_Label') || 'My Clinic'}
											/>
											<div style={{ marginTop: '8px' }}>
												<div 
													style={{ 
														display: 'flex', 
														alignItems: 'center', 
														gap: '16px',
														padding: '16px',
														background: '#f9f9f9',
														borderRadius: '12px',
														border: '1px solid #f0f0f0',
														cursor: 'pointer',
														transition: 'all 0.2s ease'
													}}
													onClick={() => {
														navigate(getClinicLink(vetoCliniqueInfo.etablissementId));
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.background = '#f0f0f0';
														e.currentTarget.style.transform = 'translateY(-2px)';
														e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.background = '#f9f9f9';
														e.currentTarget.style.transform = 'translateY(0)';
														e.currentTarget.style.boxShadow = 'none';
													}}
												>
													{/* Clinic Logo/Image */}
													<div style={{ flexShrink: 0 }}>
														<img 
															src={vetoCliniqueInfo.picture 
																? base_url + 'uploads/files/etablissement/' + vetoCliniqueInfo.picture 
																: '/img/clinic-default.jpg'}
															alt={vetoCliniqueInfo.name || 'Clinic'}
															style={{ 
																width: '80px',
																height: '80px',
																borderRadius: '12px',
																objectFit: 'cover',
																border: '2px solid #FFDE59'
															}}
															onError={(e) => { 
																e.target.onerror = null;
																e.target.src = '/img/clinic-default.jpg';
															}}
														/>
													</div>
													
													{/* Clinic Info */}
													<div style={{ flex: 1 }}>
														<div style={{ 
															fontSize: '16px', 
															fontWeight: 600, 
															color: '#333',
															marginBottom: '6px'
														}}>
															{vetoCliniqueInfo.name}
														</div>
														
														{/* Clinic Type */}
														{vetoCliniqueInfo.type && vetoCliniqueInfo.type.nom && (
															<div style={{ 
																fontSize: '13px', 
																color: '#666',
																marginBottom: '6px',
																display: 'flex',
																alignItems: 'center',
																gap: '6px'
															}}>
																<span>📋</span>
																<span>{getAContent(vetoCliniqueInfo.type.tagRef) || vetoCliniqueInfo.type.nom}</span>
															</div>
														)}
														
														{/* Location */}
														{vetoCliniqueInfo.lieux && vetoCliniqueInfo.lieux.length > 0 && vetoCliniqueInfo.lieux[0].ville && (
															<div style={{ 
																fontSize: '12px', 
																color: '#888',
																display: 'flex',
																alignItems: 'center',
																gap: '6px'
															}}>
																<EnvironmentOutlined style={{ fontSize: '12px', color: '#FFDE59' }} />
																<span>
																	{vetoCliniqueInfo.lieux[0].adresse && `${vetoCliniqueInfo.lieux[0].adresse}, `}
																	{vetoCliniqueInfo.lieux[0].ville}
																</span>
															</div>
														)}
													</div>
													
													{/* Arrow Icon */}
													<div style={{ flexShrink: 0, color: '#FFDE59' }}>
														<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
															<path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
														</svg>
													</div>
												</div>
												
												{/* Clinic presentation preview */}
												{vetoCliniqueInfo.presentation && (
													<div style={{ 
														marginTop: '12px',
														fontSize: '13px',
														color: '#666',
														lineHeight: '1.5',
														padding: '10px 12px',
														background: '#fff',
														borderRadius: '8px',
														border: '1px solid #f0f0f0'
													}}>
														{vetoCliniqueInfo.presentation.length > 150 
															? vetoCliniqueInfo.presentation.substring(0, 150) + '...' 
															: vetoCliniqueInfo.presentation}
													</div>
												)}
											</div>
										</Col>
									</Row>
								</>
							)}

							{/* Clinic Info Section from vetData (legacy) */}
							{(vetData.clinicName || vetData.clinicTypeName || vetData.atHome === false) && !vetoCliniqueInfo && (
								<>
									<Divider style={{ margin: '16px 0' }} />
									<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
										<Col xs={24}>
											<SectionTitle
												icon={<span>🏥</span>}
												iconBg="#E6F7EE"
												iconColor="#1AA260"
												title={getAContent('cmp_vetonest.com_Clinic_Label') || 'Clinic Information'}
											/>
											<div style={{ marginTop: '8px' }}>
												{vetData.clinicName && (
													<p style={{ marginBottom: '4px', fontSize: '14px', color: '#555' }}>
														<strong>{vetData.clinicName}</strong>
													</p>
												)}
												{vetData.clinicTypeName && (
													<p style={{ marginBottom: '4px', fontSize: '13px', color: '#666' }}>
														{vetData.clinicTypeName}
													</p>
												)}
											</div>
										</Col>
									</Row>
								</>
							)}

							{/* Professional IDs Section */}
							{(vetData.individualProfessionalId || vetData.businessProfessionalId) && (
								<>
									<Divider style={{ margin: '16px 0' }} />
									<Row gutter={[24, 16]} style={{ marginBottom: '16px' }}>
										<Col xs={24}>
											<SectionTitle
												icon={<IdcardOutlined />}
												iconBg="#FFF7DC"
												iconColor="#D9A900"
												title={getAContent('cmp_vetonest.com_ProfessionalIDs_Label') || 'Professional IDs'}
											/>
											<div style={{ marginTop: '8px' }}>
												{vetData.individualProfessionalId && (
													<p style={{ marginBottom: '8px', fontSize: '13px' }}>
														<strong>{getAContent('cmp_vetonest.com_IndividualID_Label') || 'Individual ID'}:</strong>{' '}
														{vetData.individualProfessionalId}
													</p>
												)}
												{vetData.businessProfessionalId && (
													<p style={{ marginBottom: '8px', fontSize: '13px' }}>
														<strong>{getAContent('cmp_vetonest.com_BusinessID_Label') || 'Business ID'}:</strong>{' '}
														{vetData.businessProfessionalId}
													</p>
												)}
											</div>
										</Col>
									</Row>
								</>
							)}
						</Card>
					</Col>
				</Row>
				
				{/* Availability Section */}
				<Row style={{ marginTop: '32px' }}>
					<Col span={24}>
						<Card className="vet-availability-card" style={{ borderRadius: '16px' }}>
							<SectionTitle
								icon={<ClockCircleOutlined />}
								iconBg="#FDEFE0"
								iconColor="#D9822B"
								title={getAContent('cmp_vetonest.com_AvailSlots_Txt') || 'Availability'}
							/>
							<div style={{ marginTop: '16px' }}>
								<BuildTimeslot />
							</div>
						</Card>
					</Col>
				</Row>
				
				{/* Comments Section */}
				<Row style={{ marginTop: '32px' }} id="client-reviews">
					<Col span={24}>
						<Card className="vet-comments-card" style={{ borderRadius: '16px' }}>
							<SectionTitle
								icon={<MessageOutlined />}
								iconBg="#E6F7EE"
								iconColor="#1AA260"
								title={translations.clientReviews || 'Client reviews'}
							/>
							<div style={{ marginTop: '16px' }}>
								{totalComments > 0 && (
									<span style={{ fontSize: '14px', color: '#888', marginLeft: '10px' }}>
										({totalComments} {translations.reviews || 'reviews'})
									</span>
								)}
								
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
							</div>
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