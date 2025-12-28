import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import type { FoodItem } from '../types';
import { ProgressBar } from './ProgressBar';
import { Button3D } from './Button3D';
import { getFoodImage } from '../services/scanner';

interface ScoreCardProps {
    food: FoodItem;
    isOpen: boolean;
    onClose: () => void;
    onAddToLog: () => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
    food,
    isOpen,
    onClose,
    onAddToLog
}) => {
    const { getNutrientTargets } = useUserStore();
    const targets = getNutrientTargets();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const imageUrl = food.imageUrl || getFoodImage(food.name);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={onClose}
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
                    >
                        {/* Image Header */}
                        <div className="relative h-48 bg-gray-900 rounded-t-3xl overflow-hidden">
                            {!imageError && (
                                <img
                                    src={imageUrl}
                                    alt={food.name}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                            {(!imageLoaded || imageError) && (
                                <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-b from-gray-800 to-gray-900">
                                    🍽️
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Action buttons */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                </button>
                                <button className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Green accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#58CC02]" />
                        </div>

                        {/* Content */}
                        <div className="bg-[#FFF8E7] px-5 py-6 rounded-t-3xl -mt-4">
                            {/* Drag handle */}
                            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                            {/* Title row */}
                            <div className="flex justify-between items-start mb-1">
                                <h2 className="text-2xl font-extrabold text-gray-900">{food.name}</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm mb-4">
                                {food.cuisine || 'Indian'} Cuisine
                            </p>

                            {/* Macros */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                    🔥 {food.calories} kcal
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                    💪 {food.protein}g Protein
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                    🧈 {food.fat}g Fat
                                </span>
                            </div>

                            {/* Serving Size */}
                            {food.servingSize && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
                                    <span className="text-lg">🍽️</span>
                                    <div>
                                        <span className="text-xs font-bold text-amber-700 uppercase">Suggested Serving</span>
                                        <p className="text-sm font-bold text-amber-900">{food.servingSize}</p>
                                    </div>
                                </div>
                            )}

                            {/* Goal Fit Score */}
                            <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#58CC02] rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="font-bold text-gray-800">Goal Fit</span>
                                    </div>
                                    <span className="text-gray-600">
                                        <span className="font-bold text-lg">{food.goalFitScore}</span>
                                        <span className="text-gray-400">/10</span>
                                    </span>
                                </div>
                                <ProgressBar
                                    value={food.goalFitScore}
                                    max={10}
                                    variant="green"
                                    size="md"
                                />
                                <p className="text-sm text-[#58CC02] mt-2 font-medium">{food.goalFitReason}</p>
                            </div>

                            {/* Daily Impact Section */}
                            <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Daily Impact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-500">Calories</span>
                                            <span className={Math.round((food.calories / targets.calories) * 100) > 35 ? 'text-red-500' : 'text-gray-800'}>
                                                {Math.round((food.calories / targets.calories) * 100)}%
                                            </span>
                                        </div>
                                        <ProgressBar value={Math.round((food.calories / targets.calories) * 100)} max={100} variant={Math.round((food.calories / targets.calories) * 100) > 35 ? 'orange' : 'green'} size="sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-500">Protein</span>
                                            <span className="text-gray-800">{Math.round((food.protein / targets.protein) * 100)}%</span>
                                        </div>
                                        <ProgressBar value={Math.round((food.protein / targets.protein) * 100)} max={100} variant="blue" size="sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-500">Sodium</span>
                                            <span className={Math.round(((food.sodium || 400) / targets.sodium) * 100) > 40 ? 'text-red-500' : 'text-gray-800'}>
                                                {Math.round(((food.sodium || 400) / targets.sodium) * 100)}%
                                            </span>
                                        </div>
                                        <ProgressBar value={Math.round(((food.sodium || 400) / targets.sodium) * 100)} max={100} variant={Math.round(((food.sodium || 400) / targets.sodium) * 100) > 40 ? 'orange' : 'green'} size="sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-gray-500">Carbs</span>
                                            <span className="text-gray-800">{Math.round((food.carbs / targets.carbs) * 100)}%</span>
                                        </div>
                                        <ProgressBar value={Math.round((food.carbs / targets.carbs) * 100)} max={100} variant="orange" size="sm" />
                                    </div>
                                </div>
                                {Math.round(((food.sodium || 400) / targets.sodium) * 100) > 40 && (
                                    <div className="mt-3 p-2 bg-red-50 rounded-xl flex items-center gap-2 border border-red-100">
                                        <span className="text-lg">⚠️</span>
                                        <p className="text-[10px] leading-tight text-red-600 font-bold">High Sodium! This meal has {'>'}40% of your daily limit. Drink extra water.</p>
                                    </div>
                                )}
                            </div>

                            {/* Gut Health Score */}
                            <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#FF9600] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            +
                                        </span>
                                        <span className="font-bold text-gray-800">Gut Health</span>
                                    </div>
                                    <span className="text-gray-600">
                                        <span className="font-bold text-lg">{food.gutHealthScore}</span>
                                        <span className="text-gray-400">/10</span>
                                    </span>
                                </div>
                                <ProgressBar
                                    value={food.gutHealthScore}
                                    max={10}
                                    variant="orange"
                                    size="md"
                                />
                                <p className="text-sm text-[#FF9600] mt-2 font-medium">{food.gutHealthReason}</p>
                            </div>

                            {/* Add to Log Button */}
                            <Button3D
                                variant="green"
                                fullWidth
                                size="lg"
                                onClick={onAddToLog}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">+</span>
                                    Add to Log
                                </span>
                            </Button3D>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ScoreCard;
