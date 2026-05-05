import React from 'react';
import './components.css';

function Button({
  children,
  variant = 'primary', // primary, outline, danger
  size = 'md', // sm, md, lg
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const classes = [
    'rb-btn',
    `rb-btn-${variant}`,
    `rb-btn-${size}`,
    fullWidth ? 'rb-btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
