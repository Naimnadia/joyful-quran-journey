
// This file redirects to the main button component
// It maintains backward compatibility with existing imports

import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";
import React from 'react';

// Re-export the shadcn Button and buttonVariants
export { buttonVariants };

// Create a wrapper component that mimics the custom Button component's props
// but uses the shadcn Button internally
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  // Map our custom variant names to shadcn variants
  const variantMap = {
    primary: "default",
    secondary: "secondary",
    outline: "outline",
    ghost: "ghost"
  };
  
  // Map our custom sizes to shadcn sizes
  const sizeMap = {
    sm: "sm",
    md: "default",
    lg: "lg"
  };

  // Base classes
  const baseClasses = "rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Variant classes for custom styling
  const variantClasses = {
    primary: "bg-theme-blue text-white hover:bg-theme-blue-light focus:ring-theme-blue",
    secondary: "bg-theme-purple text-white hover:bg-theme-purple-light focus:ring-theme-purple",
    outline: "bg-transparent border-2 border-theme-blue text-theme-blue hover:bg-theme-blue/10 focus:ring-theme-blue",
    ghost: "bg-transparent text-theme-blue hover:bg-theme-blue/10 focus:ring-theme-blue",
  };
  
  // Loading state
  const loadingClasses = isLoading ? "opacity-80 cursor-not-allowed" : "";
  
  // Full width
  const widthClasses = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${loadingClasses} ${widthClasses} ${className || ''} inline-flex items-center justify-center gap-2`}
      disabled={isLoading || props.disabled}
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
    </button>
  );
};

export { Button };
export default Button;
