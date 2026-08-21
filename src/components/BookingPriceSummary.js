// src/components/BookingPriceSummary.js
import React, { useContext } from 'react';
import { SiteContext } from '../context/site';

const BookingPriceSummary = ({ 
  vet, 
  consultationType = 'physical',
  compact = false 
}) => {
  const { getAContent, siteLocale } = useContext(SiteContext);

  const getBasePrice = () => {
    if (consultationType === 'online' && vet.tarifConsultationVideo) {
      return parseFloat(vet.tarifConsultationVideo) || 0;
    }
    return parseFloat(vet.tarifConsultation) || 0;
  };

  const basePrice = getBasePrice();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(siteLocale || 'en-GB', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (compact) {
    return (
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {getAContent('cmp_vetonest.com_Consultation_Txt') || 'Consultation'}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFDE59' }}>
          {formatCurrency(basePrice)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px', 
      padding: '12px',
      marginTop: '12px'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>
        {getAContent('cmp_vetonest.com_PriceDetails_Label') || 'Price details'}
      </div>
      
      <div style={{ fontSize: '13px', color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{getAContent('cmp_vetonest.com_Consultation_Txt') || 'Consultation'}</span>
          <span>{formatCurrency(basePrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingPriceSummary;