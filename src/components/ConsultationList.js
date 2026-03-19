import React from 'react';

const ConsultationList = () => {
  return (
    <div>
      <h3>{ getAContent( 'cmp_vetonest.com_YourConsultations_Txt' ) /* Your Consultations */ }</h3>
      {/* Display a list of past and current consultations here */}
    </div>
  );
};

export default ConsultationList;