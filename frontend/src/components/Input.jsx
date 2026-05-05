import React from 'react';
import './components.css';

function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`rb-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="rb-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`rb-input ${error ? 'rb-input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <span className="rb-input-error-msg">{error}</span>}
    </div>
  );
}

export default Input;
