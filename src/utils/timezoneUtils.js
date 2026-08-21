// src/utils/timezoneUtils.js

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get a human-readable timezone abbreviation or name
 * @param {string} timezone - IANA timezone string (e.g., 'Europe/Paris')
 * @returns {string} - Timezone abbreviation or short name
 */
export const getTimezoneDisplay = (timezone) => {
  if (!timezone) return '';
  
  // Common timezone abbreviations
  const tzAbbreviations = {
    'Europe/Paris': 'CET',
    'Europe/London': 'GMT',
    'Europe/Berlin': 'CET',
    'Europe/Rome': 'CET',
    'Europe/Madrid': 'CET',
    'Europe/Amsterdam': 'CET',
    'Europe/Brussels': 'CET',
    'Europe/Vienna': 'CET',
    'Europe/Prague': 'CET',
    'Europe/Budapest': 'CET',
    'Europe/Athens': 'EET',
    'Europe/Istanbul': 'EET',
    'Europe/Moscow': 'MSK',
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'America/Toronto': 'EST',
    'America/Mexico_City': 'CST',
    'America/Argentina/Buenos_Aires': 'ART',
    'Australia/Sydney': 'AEDT',
    'Australia/Melbourne': 'AEDT',
    'Australia/Brisbane': 'AEST',
    'Australia/Perth': 'AWST',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Asia/Hong_Kong': 'HKT',
    'Asia/Singapore': 'SGT',
    'Asia/Bangkok': 'ICT',
    'Asia/Dubai': 'GST',
    'Asia/Kolkata': 'IST',
    'Asia/Bangkok': 'ICT',
    'Africa/Cairo': 'EET',
    'Africa/Johannesburg': 'SAST',
    'Africa/Lagos': 'WAT',
    'UTC': 'UTC',
  };
  
  return tzAbbreviations[timezone] || timezone.split('/').pop() || timezone;
};

/**
 * Get the offset display for a timezone (e.g., "+02:00")
 * @param {string} timezone - IANA timezone string
 * @returns {string} - Timezone offset
 */
export const getTimezoneOffset = (timezone) => {
  if (!timezone) return '';
  const tz = dayjs().tz(timezone);
  return tz.format('Z'); // Returns +HH:mm format
};

/**
 * Check if consultation is ready to join (video enabled)
 * Uses the consultation's timezone, not user's local timezone
 * 
 * @param {object} consultation - Consultation object with startingDatetime and timezone
 * @returns {boolean} - True if within 5 minutes before start
 */
export const isReadyToJoinInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2) return false; // Only for accepted consultations

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  
  // Parse the starting datetime
  // The backend returns startingDatetime as a UTC timestamp
  
  // Convert to the consultation's timezone for comparison
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  
  // Get current time in the consultation's timezone
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  // Calculate minutes until consultation start
  const minutesUntil = consultationTimeLocal.diff(nowInConsultationTz, 'minute');
  
  // Ready to join if between 0 and 5 minutes before start (inclusive)
  return minutesUntil >= 0 && minutesUntil <= 5;
};

/**
 * Check if consultation is currently in progress
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const isInProgressInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesSinceStart = nowInConsultationTz.diff(consultationTimeLocal, 'minute');
  return minutesSinceStart >= 0;
};

/**
 * Check if consultation has expired (passed 60 minutes without being accepted)
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const isExpiredInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 1) return false; // Only pending can expire

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesSinceStart = nowInConsultationTz.diff(consultationTimeLocal, 'minute');
  return minutesSinceStart > 60;
};

/**
 * Check if vet can start the video call
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const canVetStartVideoInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  if (consultation.consultationType?.id !== 1) return false; // Only for video consultations
  if (consultation.consultationStatus?.id !== 2) return false; // Only for accepted

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesUntil = consultationTimeLocal.diff(nowInConsultationTz, 'minute');
  return minutesUntil <= 5 && minutesUntil >= 0;
};

/**
 * Check if pet owner can join the video call
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @param {boolean} isCallReady - Whether the vet has started the call
 * @returns {boolean}
 */
export const canPetJoinVideoInConsultationTimezone = (consultation, isCallReady) => {
  if (!consultation?.startingDatetime) return false;
  if (consultation.consultationType?.id !== 1) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;
  
  // If the vet has already started, pet can join
  if (isCallReady) return true;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesUntil = consultationTimeLocal.diff(nowInConsultationTz, 'minute');
  return minutesUntil <= 5 && minutesUntil >= 0;
};

/**
 * Check if consultation is about to start (within 5 minutes)
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const isAboutToStartInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesUntil = consultationTimeLocal.diff(nowInConsultationTz, 'minute');
  return minutesUntil > 0 && minutesUntil <= 5;
};

/**
 * Check if consultation can be finished
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const isFinishableInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId !== 2 && statusId !== 3) return false;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const isStarted = consultationTimeLocal.isBefore(nowInConsultationTz);
  const isInProgressStatus = statusId === 3;
  return isStarted || isInProgressStatus;
};

/**
 * Check if consultation can be cancelled
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {boolean}
 */
export const canCancelInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return false;
  const statusId = consultation.consultationStatus?.id;
  if (statusId === 4 || statusId === 5) return false; // Can't cancel completed or cancelled
  
  if (isExpiredInConsultationTimezone(consultation)) return false;
  if (isInProgressInConsultationTimezone(consultation)) return false;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  const minutesUntil = consultationTimeLocal.diff(nowInConsultationTz, 'minute');
  return minutesUntil > 60; // Can cancel only if more than 60 minutes before start
};

/**
 * Format consultation time with timezone display
 * @param {string} dateTimeStr - DateTime string from backend
 * @param {string} timezone - IANA timezone string
 * @param {string} atLabel - Label for "at" in current language
 * @param {string} locale - Locale for date formatting
 * @returns {string} - Formatted datetime with timezone
 */
export const formatConsultationDateTimeWithTimezone = (
  dateTimeStr,
  timezone,
  atLabel = 'at',
  locale = 'en-GB'
) => {
  if (!dateTimeStr) return '—';

  // Try to parse as ISO or Y-m-d H:i format
  let dayjsObj = dayjs(dateTimeStr);
  
  // If parsing failed, try the Y-m-d H:i format used by backend
  if (!dayjsObj.isValid()) {
    const [datePart, timePart] = dateTimeStr.split(' ');
    if (datePart && timePart) {
      const [year, month, day] = datePart.split('-');
      dayjsObj = dayjs(`${year}-${month}-${day} ${timePart}`);
    }
  }

  if (!dayjsObj.isValid()) return dateTimeStr;

  // Format the date
  const formattedDate = dayjsObj.toDate().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const time = dayjsObj.format('HH:mm');
  const tzDisplay = getTimezoneDisplay(timezone);
  
  return `${formattedDate} ${atLabel} ${time} (${tzDisplay})`;
};

/**
 * Get minutes until consultation starts
 * Uses the consultation's timezone
 * 
 * @param {object} consultation - Consultation object
 * @returns {number} - Minutes until start (negative if in past)
 */
export const getMinutesUntilStartInConsultationTimezone = (consultation) => {
  if (!consultation?.startingDatetime) return -Infinity;

  const consultationTimezone = consultation.timezone || 'Europe/Paris';
  const consultationTimeLocal = dayjs.tz(consultation.startingDatetime.date || consultation.startingDatetime, consultationTimezone);
  const nowInConsultationTz = dayjs().tz(consultationTimezone);
  
  return consultationTimeLocal.diff(nowInConsultationTz, 'minute', true);
};
