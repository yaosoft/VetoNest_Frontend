// src/components/ConsultationPricingCard.js
import React, { useContext } from 'react';
import { Card, Tooltip, Divider, Tag } from 'antd';
import { InfoCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { SiteContext } from '../context/site';

const ConsultationPricingCard = ({ 
  vet, 
  consultationType = 'physical', // 'physical' or 'online'
  showFeeBreakdown = true,
  onBook 
}) => {
  const { getAContent, siteLocale } = useContext(SiteContext);

  // Get base price based on consultation type
  const getBasePrice = () => {
    if (consultationType === 'online' && vet.tarifConsultationVideo) {
      return parseFloat(vet.tarifConsultationVideo) || 0;
    }
    return parseFloat(vet.tarifConsultation) || 0;
  };

  const basePrice = getBasePrice();
  
  // Platform fees configuration
  const platformFeePercentage = 15; // 15% commission
  const platformFixedFee = 2; // €2 fixed fee per consultation
  const vatRate = 20; // 20% VAT
  
  // Calculate fees
  const platformCommission = (basePrice * platformFeePercentage) / 100;
  const totalPlatformFee = platformCommission + platformFixedFee;
  const vatAmount = (totalPlatformFee * vatRate) / 100;
  const vetEarnings = basePrice - totalPlatformFee;
  const totalPrice = basePrice + totalPlatformFee + vatAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(siteLocale || 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card 
      className="pricing-card"
      style={{
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        marginBottom: '16px',
        backgroundColor: '#fafafa'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          {getAContent('cmp_vetonest.com_PriceBreakdown_Title') || 'Price breakdown'}
        </h3>
      </div>

      {/* Base Price */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px dashed #e0e0e0'
      }}>
        <span style={{ color: '#666' }}>
          {consultationType === 'online' 
            ? getAContent('cmp_vetonest.com_VideoConsultation_Label') || 'Video consultation'
            : getAContent('cmp_vetonest.com_Consultation_Label') || 'Consultation'}
        </span>
        <span style={{ fontWeight: 500 }}>{formatCurrency(basePrice)}</span>
      </div>

      

      {/* Total Price */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '2px solid #e0e0e0'
      }}>
        <span style={{ fontWeight: 700, fontSize: '18px' }}>
          {getAContent('cmp_vetonest.com_Total_Label') || 'Total'}
        </span>
        <span style={{ fontWeight: 700, fontSize: '20px', color: '#FFDE59' }}>
          {formatCurrency(totalPrice)}
        </span>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="consultation-next-button"
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#FFDE59',
          border: 'none',
          borderRadius: '8px',
          color: '#333',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e6c84f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFDE59';
        }}
      >
        {getAContent('cmp_vetonest.com_ConfirmAndPay_Btn') || 'Confirm & Pay'} →
      </button>
    </Card>
  );
};

export default ConsultationPricingCard;