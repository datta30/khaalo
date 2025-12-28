import { motion } from 'framer-motion';
import React, { useState } from 'react';
import type { MealNode as MealNodeType } from '../types';
import { getFoodImage } from '../services/scanner';

interface MealNodeProps {
    node: MealNodeType;
    onClick?: () => void;
    index: number;
}

const typeLabels = {
    breakfast: 'BREAKFAST',
    snack: 'SNACK',
    lunch: 'LUNCH',
    dinner: 'DINNER'
};

export const MealNode: React.FC<MealNodeProps> = ({ node, onClick, index }) => {
    const { meal, state, stars, position } = node;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Generate image URL
    const imageUrl = meal.imageUrl || getFoodImage(meal.name);

    // Position offsets for winding path effect
    const xOffset = position === 'left' ? -40 : position === 'right' ? 40 : 0;

    // Render based on state
    if (state === 'completed') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
                style={{ transform: `translateX(${xOffset}px)` }}
            >
                {/* Stars */}
                <div className="flex gap-1 mb-1">
                    {[...Array(stars)].map((_, i) => (
                        <motion.span
                            key={i}
                            className="text-xl"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            ⭐
                        </motion.span>
                    ))}
                </div>

                {/* Gold checkmark circle */}
                <motion.div
                    className="w-16 h-16 rounded-full bg-[#FFC800] flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                >
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>

                {/* Label */}
                <span className="mt-2 px-3 py-1 bg-[#58CC02] text-white text-xs font-bold rounded-full">
                    COMPLETED
                </span>
                <span className="text-gray-700 font-semibold text-sm mt-1">{meal.name}</span>
            </motion.div>
        );
    }

    if (state === 'current') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
                style={{ transform: `translateX(${xOffset}px)` }}
                onClick={onClick}
            >
                {/* START NOW label */}
                <motion.span
                    className="px-3 py-1 bg-white text-gray-600 text-xs font-bold rounded-full shadow mb-2 border border-gray-200"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    START NOW!
                </motion.span>

                {/* Bouncing card with image */}
                <motion.div
                    className="relative cursor-pointer"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-[#58CC02] blur-xl opacity-30 animate-pulse" />

                    {/* Image circle */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-[#58CC02] overflow-hidden bg-green-50 shadow-lg">
                        {!imageError && (
                            <img
                                src={imageUrl}
                                alt={meal.name}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                            />
                        )}
                        {(!imageLoaded || imageError) && (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                🍽️
                            </div>
                        )}
                    </div>

                    {/* Fork icon */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
                        <span className="text-lg">🍴</span>
                    </div>
                </motion.div>

                {/* Label pill */}
                <motion.div
                    className="mt-3 px-4 py-2 bg-[#58CC02] rounded-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                >
                    <span className="text-white text-xs font-bold block">{typeLabels[meal.type]}</span>
                    <span className="text-white font-bold text-sm">{meal.name}</span>
                </motion.div>
            </motion.div>
        );
    }

    // Locked state
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center opacity-50"
            style={{ transform: `translateX(${xOffset}px)` }}
        >
            {/* Locked circle */}
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            </div>

            {/* Label */}
            <span className="text-gray-400 text-xs font-bold mt-2">{typeLabels[meal.type]}</span>
            <span className="text-gray-400 font-semibold text-sm">{meal.name}</span>
        </motion.div>
    );
};

export default MealNode;
