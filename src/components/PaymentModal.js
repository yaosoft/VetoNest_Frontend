import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Spin, Alert, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import { SiteContext } from '../context/site';
import StripeIcon from './icons/StripeIcon';

// ── Initialize Stripe ──────────────────────────────────────────────────────
let stripePromise = null;

const getStripePromise = () => {
  if (!stripePromise) {
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
                          'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx';
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// ── Map site locale to Stripe locale ──────────────────────────────────────
// ── Map site locale to Stripe locale ──────────────────────────────────────
const getStripeLocale = (locale) => {
  if (!locale) return 'auto';
  
  const localeMap = {
    // French
    'fr': 'fr',
    'fr-FR': 'fr',
    // English
    'en': 'en',
    'en-GB': 'en',
    'en-US': 'en',
    // German
    'de': 'de',
    'de-DE': 'de',
    // Spanish
    'es': 'es',
    'es-ES': 'es',
    // Italian
    'it': 'it',
    'it-IT': 'it',
    // Portuguese
    'pt': 'pt',
    'pt-PT': 'pt',
    // Dutch
    'nl': 'nl',
    'nl-NL': 'nl',
    // Japanese
    'ja': 'ja',
    // Chinese
    'zh': 'zh',
    // Russian
    'ru': 'ru',
    // ─── Estonian ──────────────────────────────────────────────────────────
    'ee': 'et',      // ← Your app uses 'ee', Stripe uses 'et'
    'et': 'et',      // Fallback if 'et' is used directly
    // ─── Other Nordic languages ──────────────────────────────────────────
    'fi': 'fi',
    'sv': 'sv',
    'no': 'no',
    'da': 'da',
  };
  
  return localeMap[locale] || 'auto';
};

// ── Card Form Component ──────────────────────────────────────────────────
const CardForm = ({ 
  clientSecret, 
  amount, 
  currency, 
  consultationId,
  onSuccess, 
  onError, 
  onCancel,
  isProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getAContent } = useContext(SiteContext);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not initialized. Please try again.');
      return;
    }

    if (!clientSecret) {
      setError('Payment configuration is missing.');
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Pet Owner',
            },
          },
        }
      );

      if (confirmError) {
        console.error('Payment confirmation error:', confirmError);
        setError(confirmError.message || 'Payment failed. Please try again.');
        onError(confirmError);
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
        onSuccess(paymentIntent.id);
      } else {
        setError(`Unexpected payment status: ${paymentIntent?.status || 'unknown'}`);
        onError(new Error('Unexpected payment status'));
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred.');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '4px 0' }}>
      {/* ─── Amount Display ────────────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        background: '#f8f9fa',
        borderRadius: '8px',
      }}>
        <span style={{ fontSize: '15px', color: '#555', fontWeight: 500 }}>
          {getAContent('cmp_vetonest.com_Amount_Label') || 'Amount'}
        </span>
        <span style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'EUR' }).format(amount || 0)}
        </span>
      </div>

      {/* ─── Secure Payment Notice ────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '14px',
        fontSize: '13px',
        color: '#666'
      }}>
        <LockOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
        <span>
          {getAContent('cmp_vetonest.com_SecurePayment_Label') || 'Your payment is secure and encrypted.'}
        </span>
      </div>

      {/* ─── Card Element ──────────────────────────────────────────────── */}
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px', 
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        marginBottom: '16px',
        transition: 'border-color 0.2s',
        boxShadow: error ? '0 0 0 2px #ff4d4f' : 'none',
      }}>
        <CardElement
          id="card-element"
          options={cardElementOptions}
          onChange={handleCardChange}
        />
      </div>

      {/* ─── Error Message ─────────────────────────────────────────────── */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
          onClose={() => setError(null)}
        />
      )}

      {/* ─── Buttons ────────────────────────────────────────────────────── */}
      <Space style={{ width: '100%', justifyContent: 'space-between', gap: '12px' }}>
        <Button 
          onClick={onCancel} 
          disabled={loading || isProcessing}
          style={{ 
            flex: 1,
            height: '44px',
            fontSize: '14px',
          }}
        >
          {getAContent('cmp_vetonest.com_Cancel_Btn') || 'Cancel'}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          disabled={!stripe || !cardComplete || loading || isProcessing || !clientSecret}
          loading={loading || isProcessing}
          style={{
            flex: 2,
            backgroundColor: '#FFDE59',
            borderColor: '#FFDE59',
            color: '#333',
            fontWeight: 600,
            height: '44px',
            fontSize: '14px',
          }}
        >
          {loading || isProcessing 
            ? getAContent('cmp_vetonest.com_Processing_Status') || 'Processing...'
            : getAContent('cmp_vetonest.com_PayNow_Btn') || 'Pay Now'}
        </Button>
      </Space>

      {/* ─── Disclaimer ────────────────────────────────────────────────── */}
      <div style={{ 
        marginTop: '14px', 
        fontSize: '12px', 
        color: '#555',
        textAlign: 'center',
        lineHeight: '1.6',
        padding: '8px 12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
      }}>
        <LockOutlined style={{ marginRight: '6px', fontSize: '11px', color: '#888' }} />
        {getAContent('cmp_vetonest.com_PaymentDisclaimer_Txt') || 
          'Your payment will be authorized but not charged until the vet accepts your request.'}
      </div>
    </form>
  );
};

// ── Loading State ──────────────────────────────────────────────────────────
const LoadingState = () => (
  <div style={{ textAlign: 'center', padding: '40px 0' }}>
    <Spin size="large" />
    <p style={{ marginTop: '16px', color: '#888' }}>
      Loading payment form...
    </p>
  </div>
);

// ── Error State ──────────────────────────────────────────────────────────
const ErrorState = ({ error, onRetry }) => (
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <CloseCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
    <p style={{ marginTop: '16px', color: '#666' }}>
      {error || 'Unable to load payment form.'}
    </p>
    <Button onClick={onRetry} style={{ marginTop: '12px' }}>
      Try Again
    </Button>
  </div>
);

// ── Success State ──────────────────────────────────────────────────────────
const SuccessState = ({ onClose }) => (
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
    <h3 style={{ marginTop: '16px' }}>Payment Successful!</h3>
    <p style={{ color: '#666' }}>Your payment has been processed.</p>
    <Button 
      type="primary" 
      onClick={onClose}
      style={{ marginTop: '16px' }}
    >
      Continue
    </Button>
  </div>
);

// ── Main Payment Modal Component ────────────────────────────────────────────
const PaymentModal = ({ 
  clientSecret, 
  amount, 
  currency = 'EUR', 
  consultationId,
  onSuccess, 
  onError, 
  onCancel,
  isProcessing = false
}) => {
  const { siteLocale } = useContext(SiteContext);
  const [stripeError, setStripeError] = useState(null);

  // ─── Get Stripe locale ──────────────────────────────────────────────────
  const stripeLocale = getStripeLocale(siteLocale);

  if (!clientSecret) {
    return (
      <ErrorState 
        error="Payment configuration is missing. Please try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Elements stripe={getStripePromise()} options={{ locale: stripeLocale }}>
      <CardForm
        clientSecret={clientSecret}
        amount={amount}
        currency={currency}
        consultationId={consultationId}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
        isProcessing={isProcessing}
      />
    </Elements>
  );
};

export default PaymentModal;