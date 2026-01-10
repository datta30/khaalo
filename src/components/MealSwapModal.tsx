import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Meal, SwapSuggestion } from '../types';
import { getSwapSuggestions } from '../services/scanner';

interface MealSwapModalProps {
    isOpen: boolean;
    meal: Meal;
    mealType: 'breakfast' | 'snack' | 'lunch' | 'dinner';
    onClose: () => void;
    onSwap: (newMealName: string, calories: number, protein: number, carbs: number, fat: number, fiber: number) => void;
    onGoToSearch?: () => void;
    userGoal?: 'lose' | 'maintain' | 'gain';
}

export const MealSwapModal: React.FC<MealSwapModalProps> = ({
    isOpen,
    meal,
    mealType,
    onClose,
    onSwap,
    onGoToSearch,
    userGoal = 'maintain'
}) => {
    const suggestions = getSwapSuggestions(meal, mealType);
    const [showNudge, setShowNudge] = useState(false);
    const [pendingSuggestion, setPendingSuggestion] = useState<SwapSuggestion | null>(null);

    // Check if a food choice is unhealthy based on user's goal
    const isUnhealthyChoice = (suggestion: SwapSuggestion): boolean => {
        const food = suggestion.food;

        // For weight loss, high calorie options are concerning
        if (userGoal === 'lose' && food.calories > 400) return true;

        // High sodium is always concerning
        if (food.sodium > 800) return true;

        // Very high fat for any goal
        if (food.fat > 25) return true;

        // For gaining, very low protein is not ideal
        if (userGoal === 'gain' && food.protein < 5 && food.calories > 300) return true;

        return false;
    };

    const handleSwapAttempt = (suggestion: SwapSuggestion) => {
        if (isUnhealthyChoice(suggestion)) {
            setPendingSuggestion(suggestion);
            setShowNudge(true);
        } else {
            confirmSwap(suggestion);
        }
    };

    const confirmSwap = (suggestion: SwapSuggestion) => {
        onSwap(
            suggestion.food.name,
            suggestion.food.calories,
            suggestion.food.protein,
            suggestion.food.carbs,
            suggestion.food.fat,
            suggestion.food.fiber
        );
        setShowNudge(false);
        setPendingSuggestion(null);
        onClose();
    };

    const getBadgeColor = (badge: string): string => {
        switch (badge) {
            case 'healthier': return 'from-green-400 to-emerald-500';
            case 'lighter': return 'from-teal-400 to-cyan-500';
            case 'protein': return 'from-purple-400 to-violet-500';
            case 'fiber': return 'from-lime-400 to-green-500';
            case 'energy': return 'from-yellow-400 to-orange-500';
            case 'tastier': return 'from-orange-400 to-red-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Swap {meal.name}</h3>
                                    <p className="text-white/80 text-sm">Choose a replacement option</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Duolingo-style Nudge Modal */}
                        <AnimatePresence>
                            {showNudge && pendingSuggestion && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <motion.div
                                        initial={{ y: -20 }}
                                        animate={{ y: 0 }}
                                        className="text-6xl mb-4"
                                    >
                                        🤔
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Are you sure?
                                    </h3>
                                    <p className="text-gray-600 mb-4 max-w-xs">
                                        <span className="font-semibold text-orange-600">{pendingSuggestion.food.name}</span> might not be the best choice for your <span className="font-semibold">{userGoal === 'lose' ? 'weight loss' : userGoal === 'gain' ? 'muscle gain' : 'health'}</span> goals.
                                    </p>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-sm text-yellow-800">
                                        {pendingSuggestion.food.calories > 400 && <p>⚠️ High in calories ({pendingSuggestion.food.calories} kcal)</p>}
                                        {pendingSuggestion.food.fat > 25 && <p>⚠️ High in fat ({pendingSuggestion.food.fat}g)</p>}
                                        {pendingSuggestion.food.sodium > 800 && <p>⚠️ High in sodium ({pendingSuggestion.food.sodium}mg)</p>}
                                    </div>

                                    <div className="flex flex-col gap-3 w-full max-w-xs">
                                        <button
                                            onClick={() => setShowNudge(false)}
                                            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                        >
                                            🥗 Pick something healthier
                                        </button>
                                        <button
                                            onClick={() => pendingSuggestion && confirmSwap(pendingSuggestion)}
                                            className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            Continue anyway
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Suggestions Grid - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {suggestions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No swap suggestions available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {suggestions.map((suggestion, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSwapAttempt(suggestion)}
                                            className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-left hover:border-orange-300 hover:shadow-lg transition-all"
                                        >
                                            {/* Badge */}
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getBadgeColor(suggestion.badge)} mb-2`}>
                                                <span>{suggestion.badgeEmoji}</span>
                                                <span>{suggestion.badgeLabel}</span>
                                            </div>

                                            {/* Food Name */}
                                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                                                {suggestion.food.name}
                                            </h4>

                                            {/* Nutrition Quick View */}
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>{suggestion.food.calories} cal</span>
                                                <span>•</span>
                                                <span>{suggestion.food.protein}g protein</span>
                                            </div>

                                            {/* Reason */}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {suggestion.reason}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer with "Don't like these" button */}
                        <div className="border-t border-gray-100 p-3 bg-gray-50 flex-shrink-0">
                            <p className="text-xs text-gray-500 text-center mb-2">
                                Current: <span className="font-semibold">{meal.name}</span> ({meal.calories} cal)
                            </p>
                            {onGoToSearch && (
                                <button
                                    onClick={() => {
                                        onClose();
                                        onGoToSearch();
                                    }}
                                    className="w-full py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>🔍</span>
                                    Don't like these? Search for something else
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
