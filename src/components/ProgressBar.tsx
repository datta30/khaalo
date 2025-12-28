import { motion } from 'framer-motion';
import React from 'react';

interface ProgressBarProps {
    value: number; // 0-100 or 0-10
    max?: number;
    variant?: 'green' | 'orange' | 'blue' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    label?: string;
    className?: string;
    animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    variant = 'green',
    size = 'md',
    showLabel = false,
    label,
    className = '',
    animated = true
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const heightStyles = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const colorStyles = {
        green: 'bg-[#58CC02]',
        orange: 'bg-[#FF9600]',
        blue: 'bg-[#1CB0F6]',
        gold: 'bg-[#FFC800]'
    };

    const bgStyles = {
        green: 'bg-[#58CC02]/20',
        orange: 'bg-[#FF9600]/20',
        blue: 'bg-[#1CB0F6]/20',
        gold: 'bg-[#FFC800]/20'
    };

    return (
        <div className={`w-full ${className}`}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-1">
                    {label && <span className="text-sm font-semibold text-gray-600">{label}</span>}
                    {showLabel && (
                        <span className="text-sm font-bold text-gray-700">
                            {value}{max !== 100 ? `/${max}` : '%'}
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full ${heightStyles[size]} ${bgStyles[variant]} rounded-full overflow-hidden`}>
                <motion.div
                    className={`h-full ${colorStyles[variant]} rounded-full`}
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: animated ? 0.8 : 0,
                        ease: 'easeOut',
                        delay: animated ? 0.2 : 0
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
