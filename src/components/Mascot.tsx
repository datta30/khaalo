import { motion } from 'framer-motion';
import React from 'react';

interface MascotProps {
    mood?: 'happy' | 'thinking' | 'celebrating' | 'encouraging';
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
    mood = 'happy',
    message,
    size = 'md',
    className = ''
}) => {
    const sizeStyles = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    // Different expressions based on mood
    const expressions = {
        happy: {
            emoji: '🥗',
            eyes: '◠ ◠',
            mouth: '◡',
            color: 'from-green-400 to-emerald-500'
        },
        thinking: {
            emoji: '🤔',
            eyes: '◠ –',
            mouth: '~',
            color: 'from-blue-400 to-cyan-500'
        },
        celebrating: {
            emoji: '🎉',
            eyes: '★ ★',
            mouth: 'D',
            color: 'from-yellow-400 to-orange-500'
        },
        encouraging: {
            emoji: '💪',
            eyes: '◠ ◠',
            mouth: 'ᴗ',
            color: 'from-purple-400 to-pink-500'
        }
    };

    const expr = expressions[mood];

    return (
        <motion.div
            className={`flex flex-col items-center ${className}`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Speech bubble */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-white rounded-2xl px-4 py-3 shadow-lg mb-3 max-w-[250px]"
                >
                    <p className="text-gray-700 text-sm font-medium text-center">{message}</p>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                </motion.div>
            )}

            {/* Mascot character */}
            <motion.div
                className={`${sizeStyles[size]} relative`}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
                {/* Main body - cute food character */}
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${expr.color} shadow-lg flex items-center justify-center relative overflow-hidden`}>
                    {/* Face highlight */}
                    <div className="absolute top-2 left-1/4 w-1/3 h-1/4 bg-white/30 rounded-full blur-sm" />

                    {/* Eyes */}
                    <div className="absolute top-1/3 w-full flex justify-center gap-3">
                        <motion.div
                            className="w-3 h-3 bg-gray-800 rounded-full"
                            animate={{ scaleY: [1, 0.2, 1] }}
                            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                        />
                        <motion.div
                            className="w-3 h-3 bg-gray-800 rounded-full"
                            animate={{ scaleY: [1, 0.2, 1] }}
                            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                        />
                    </div>

                    {/* Mouth */}
                    <div className="absolute bottom-1/3 w-4 h-2 border-b-2 border-gray-800 rounded-b-full" />

                    {/* Blush marks */}
                    <div className="absolute top-1/2 left-2 w-3 h-2 bg-pink-300/50 rounded-full" />
                    <div className="absolute top-1/2 right-2 w-3 h-2 bg-pink-300/50 rounded-full" />
                </div>

                {/* Accessory based on mood */}
                {mood === 'celebrating' && (
                    <motion.div
                        className="absolute -top-2 -right-2 text-2xl"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        🎊
                    </motion.div>
                )}

                {mood === 'thinking' && (
                    <motion.div
                        className="absolute -top-4 right-0 text-xl"
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        💭
                    </motion.div>
                )}

                {/* Small leaf on top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🌱
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Mascot;
