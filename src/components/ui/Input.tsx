import React from 'react';
import _ from 'lodash';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-primary-700 ml-0.5">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2 bg-white border rounded-lg text-primary-800 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-primary-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error
                ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                : 'border-primary-200',
              className,
            )}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={cn('text-xs ml-0.5', error ? 'text-danger-600' : 'text-primary-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-primary-700 ml-0.5">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2 bg-white border rounded-lg text-primary-800 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-primary-50 disabled:cursor-not-allowed',
            error
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-primary-200',
            className,
          )}
          {...props}
        >
          {_.map(options, (opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs ml-0.5 text-danger-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
