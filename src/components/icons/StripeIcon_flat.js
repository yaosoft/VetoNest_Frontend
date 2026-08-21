import React from 'react';

const StripeIcon = ({ 
  size = 24, 
  className = '', 
  style = {}, 
  variant = 'default',
  gradient = true 
}) => {
  const isCircle = variant === 'circle';
  const radius = isCircle ? 12 : 4;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
    >
      <defs>
        {gradient && (
          <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6778E5" />
            <stop offset="100%" stopColor="#635BFF" />
          </linearGradient>
        )}
      </defs>
      
      <rect 
        x="0" 
        y="0" 
        width="24" 
        height="24" 
        rx={radius}
        fill={gradient ? "url(#stripeGradient)" : "#635BFF"}
      />
      
      <path
        d="M14.4 8.8c0-.8-.6-1.2-1.6-1.2-1.4 0-2.8.6-3.8 1.6l-.6-1c1.2-1 2.8-1.8 4.6-1.8 1.6 0 2.8.8 2.8 2 0 1.4-1.2 2.2-2.6 2.8l-.2.1c-.6.2-1.2.6-1.2 1.2 0 .8.6 1.2 1.4 1.2 1.4 0 2.6-.6 3.4-1.6l.6 1c-1 1-2.4 1.8-4.2 1.8-1.6 0-2.8-.8-2.8-2 0-1.4 1.2-2.2 2.6-2.8l.2-.1c.6-.2 1.2-.6 1.2-1.2z"
        fill="white"
      />
    </svg>
  );
};

export default StripeIcon;