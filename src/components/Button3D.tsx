import { motion } from 'framer-motion';
import React from 'react';

interface Button3DProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'green' | 'gray' | 'orange' | 'outline';
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Button3D: React.FC<Button3DProps> = ({
    children,
    onClick,
    variant = 'green',
    disabled = false,
    className = '',
    fullWidth = false,
    size = 'md'
}) => {
    const baseStyles = 'relative font-bold rounded-2xl transition-all duration-100 select-none';

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const variantStyles = {
        green: disabled
            ? 'bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed'
            : 'bg-[#58CC02] text-white border-b-4 border-[#4CAD00] hover:bg-[#4CAD00] active:border-b-0 active:translate-y-1',
        gray: 'bg-gray-200 text-gray-600 border-b-4 border-gray-300 hover:bg-gray-300 active:border-b-0 active:translate-y-1',
        orange: disabled
            ? 'bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed'
            : 'bg-[#FF9600] text-white border-b-4 border-[#E08600] hover:bg-[#E08600] active:border-b-0 active:translate-y-1',
        outline: disabled
            ? 'bg-white text-gray-400 border-2 border-gray-300 cursor-not-allowed'
            : 'bg-white text-[#1CB0F6] border-2 border-gray-200 hover:bg-gray-50 active:bg-gray-100'
    };

    return (
        <motion.button
            whileTap={disabled ? {} : { scale: 0.98 }}
            onClick={disabled ? undefined : onClick}
            className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};

export default Button3D;
