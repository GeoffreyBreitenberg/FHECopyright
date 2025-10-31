import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        className={`form-input ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <small style={{ color: 'var(--error)', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </small>
      )}
      {helperText && !error && (
        <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
          {helperText}
        </small>
      )}
    </div>
  );
}
