
// This file redirects to the main button component
// It maintains backward compatibility with existing imports

import { Button as ShadcnButton } from "@/components/ui/button";
import React from 'react';

// Create a wrapper component that mimics the custom Button component's props
// but uses the shadcn Button internally
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  // Map 'primary' variant to 'default' for backward compatibility
  const mappedVariant = variant === 'primary' ? 'default' : variant;
  
  // Create className based on fullWidth
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <ShadcnButton
      className={`${widthClass} ${className || ''} inline-flex items-center justify-center gap-2`}
      disabled={isLoading || props.disabled}
      variant={mappedVariant}
      size={size}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </ShadcnButton>
  );
};

export { Button };
export default Button;
