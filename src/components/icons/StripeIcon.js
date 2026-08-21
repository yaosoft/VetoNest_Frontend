import React from 'react';

/**
 * Stripe Logo SVG Icon
 * Official Stripe mark with the signature blue/purple gradient
 * 
 * @param {Object} props
 * @param {number|string} props.size - Size in pixels (default: 24)
 * @param {string} props.className - Optional CSS class name
 * @param {Object} props.style - Optional inline styles
 * @param {string} props.variant - 'default' (rounded rect) or 'circle'
 */
const StripeIcon = ({ 
  size = 24, 
  className = '', 
  style = {}, 
  variant = 'default' 
}) => {
  const isCircle = variant === 'circle';
  const radius = isCircle ? 12 : 4;
  const viewBox = "0 0 24 24";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
    >
      {/* Background - purple/blue gradient */}
      <rect 
        x="0" 
        y="0" 
        width="24" 
        height="24" 
        rx={radius} 
        fill="#635BFF" 
      />
      
      {/* Stripe "S" mark */}
      <path
        d="M14.4 8.8c0-.8-.6-1.2-1.6-1.2-1.4 0-2.8.6-3.8 1.6l-.6-1c1.2-1 2.8-1.8 4.6-1.8 1.6 0 2.8.8 2.8 2 0 1.4-1.2 2.2-2.6 2.8l-.2.1c-.6.2-1.2.6-1.2 1.2 0 .8.6 1.2 1.4 1.2 1.4 0 2.6-.6 3.4-1.6l.6 1c-1 1-2.4 1.8-4.2 1.8-1.6 0-2.8-.8-2.8-2 0-1.4 1.2-2.2 2.6-2.8l.2-.1c.6-.2 1.2-.6 1.2-1.2z"
        fill="white"
      />
    </svg>
  );
};

export default StripeIcon;