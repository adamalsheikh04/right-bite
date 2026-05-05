import React from 'react';
import './components.css';

function Card({
  children,
  header,
  footer,
  className = '',
  interactive = false,
  ...props
}) {
  return (
    <div
      className={`rb-card ${interactive ? 'rb-card-interactive' : ''} ${className}`}
      {...props}
    >
      {header && <div className="rb-card-header">{header}</div>}
      <div className="rb-card-body">{children}</div>
      {footer && <div className="rb-card-footer">{footer}</div>}
    </div>
  );
}

export default Card;
