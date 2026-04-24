// src/components/consultationValidation.js

export const validateConsultationAccess = async (petOwnerId, veterinarianId, getConsultationsFn = null) => {
  // Check 1: User logged in?
  if (!petOwnerId) {
    return {
      allowed: false,
      redirect: '/signup',
      message: 'Please create an account to start a video consultation'
    };
  }

  // Check 2: Fetch upcoming consultations for this pet owner and vet
  let consultations = [];
  if (getConsultationsFn && typeof getConsultationsFn === 'function') {
    try {
      consultations = await getConsultationsFn(petOwnerId, veterinarianId);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return {
        allowed: false,
        message: 'Unable to verify consultation status. Please try again.'
      };
    }
  }
  
  const upcomingConsultation = consultations.find(consult => {
    let consultTime;
    if (consult.startingDatetime?.date) {
      consultTime = new Date(consult.startingDatetime.date);
    } else if (consult.startingDatetime) {
      consultTime = new Date(consult.startingDatetime);
    } else {
      return false;
    }
    const now = new Date();
    const minutesUntil = (consultTime - now) / 1000 / 60;
    return minutesUntil > 0 && minutesUntil <= 60; // Within next hour
  });

  // Check 3: No scheduled consultation?
  if (!upcomingConsultation) {
    return {
      allowed: false,
      redirect: '/consultation/creation',
      message: 'No upcoming consultation scheduled with this veterinarian. Please book an appointment first.'
    };
  }

  // Check 4: Calculate time until consultation
  let consultTime;
  if (upcomingConsultation.startingDatetime?.date) {
    consultTime = new Date(upcomingConsultation.startingDatetime.date);
  } else {
    consultTime = new Date(upcomingConsultation.startingDatetime);
  }
  const now = new Date();
  const minutesUntil = (consultTime - now) / 1000 / 60;

  // Check 5: More than 5 minutes before?
  if (minutesUntil > 5) {
    return {
      allowed: false,
      message: `Your consultation starts in ${Math.floor(minutesUntil)} minutes. The video call will open 5 minutes before your appointment time.`
    };
  }

  // Check 6: Less than 5 minutes before - All good!
  if (minutesUntil <= 5 && minutesUntil > 0) {
    return {
      allowed: true,
      consultation: upcomingConsultation,
      message: 'Your consultation is ready to start!'
    };
  }

  // Past appointment
  if (minutesUntil <= 0) {
    return {
      allowed: false,
      message: 'This consultation time has passed. Please book a new appointment.'
    };
  }

  return { allowed: false, message: 'Unable to start consultation' };
};