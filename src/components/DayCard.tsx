import React from 'react';
import { motion } from 'framer-motion';
import type { Meal } from '../types';

interface DayCardProps {
    dayName: string;
    dayIndex: number;
    isToday: boolean;
    breakfast: Meal;
    snack: Meal;
    lunch: Meal;
    dinner: Meal;
    completedMeals: string[];
    onMealClick: (meal: Meal) => void;
    compact?: boolean;
}

export const DayCard: React.FC<DayCardProps> = ({
    dayName,
    dayIndex,
    isToday,
    breakfast,
    snack,
    lunch,
    dinner,
    completedMeals,
    onMealClick,
    compact = false
}) => {
    const isCompleted = (mealId: string) => completedMeals.includes(mealId);

    const meals = [
        { meal: breakfast, label: '🌅 Breakfast', time: '8:00 AM' },
        { meal: snack, label: '🍎 Snack', time: '11:00 AM' },
        { meal: lunch, label: '☀️ Lunch', time: '1:00 PM' },
        { meal: dinner, label: '🌙 Dinner', time: '7:00 PM' }
    ];

    const completedCount = meals.filter(m => isCompleted(m.meal?.id || '')).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className={`
                bg-white rounded-2xl overflow-hidden shadow-md
                ${isToday ? 'ring-2 ring-[#58CC02] ring-offset-2' : ''}
                ${compact ? 'min-w-[280px]' : 'w-full'}
            `}
        >
            {/* Day Header */}
            <div className={`
                p-3 flex items-center justify-between
                ${isToday
                    ? 'bg-gradient-to-r from-[#58CC02] to-[#7ED321] text-white'
                    : 'bg-gray-50 text-gray-700'}
            `}>
                <div className="flex items-center gap-2">
                    <span className="font-bold">{dayName}</span>
                    {isToday && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Today
                        </span>
                    )}
                </div>
                <div className="text-sm">
                    <span className={isToday ? 'text-white/80' : 'text-gray-400'}>
                        {completedCount}/4 meals
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / 4) * 100}%` }}
                    className="h-full bg-[#58CC02]"
                />
            </div>

            {/* Meals */}
            <div className="p-2 space-y-2">
                {meals.map(({ meal, label, time: _time }) => (
                    <button
                        key={meal?.id || label}
                        onClick={() => meal && onMealClick(meal)}
                        disabled={!meal}
                        className={`
                            w-full p-2 rounded-xl flex items-center gap-3 text-left transition-all
                            ${isCompleted(meal?.id || '')
                                ? 'bg-green-50 border border-green-100'
                                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}
                        `}
                    >
                        {/* Completion Indicator */}
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${isCompleted(meal?.id || '')
                                ? 'bg-[#58CC02] text-white'
                                : 'bg-gray-200 text-gray-400'}
                        `}>
                            {isCompleted(meal?.id || '') ? '✓' : '○'}
                        </div>

                        {/* Meal Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{label}</span>
                            </div>
                            <p className={`text-sm font-medium truncate ${isCompleted(meal?.id || '') ? 'text-green-700' : 'text-gray-800'
                                }`}>
                                {meal?.name || 'Not planned'}
                            </p>
                        </div>

                        {/* Calories */}
                        <div className="text-right">
                            <span className="text-xs text-gray-400">{meal?.calories || 0}</span>
                            <span className="text-[10px] text-gray-300 ml-0.5">cal</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Total Calories Footer */}
            <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-sm font-bold text-gray-700">
                    {(breakfast?.calories || 0) + (snack?.calories || 0) + (lunch?.calories || 0) + (dinner?.calories || 0)} cal
                </span>
            </div>
        </motion.div>
    );
};
