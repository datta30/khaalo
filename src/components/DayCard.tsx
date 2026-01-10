import React from 'react';
import { motion } from 'framer-motion';
import type { Meal } from '../types';

interface DayCardProps {
    date: Date;
    dayIndex: number;
    isToday: boolean;
    breakfast: Meal;
    snack: Meal;
    lunch: Meal;
    dinner: Meal;
    completedMeals: string[];
    onMealClick: (meal: Meal) => void;
}

const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
        dayName: days[date.getDay()],
        dayNum: date.getDate(),
        month: months[date.getMonth()]
    };
};

export const DayCard: React.FC<DayCardProps> = ({
    date,
    dayIndex,
    isToday,
    breakfast,
    snack,
    lunch,
    dinner,
    completedMeals,
    onMealClick
}) => {
    const isCompleted = (mealId: string) => completedMeals.includes(mealId);
    const { dayName, dayNum, month } = formatDate(date);

    const meals = [
        { meal: breakfast, label: 'Breakfast', icon: '🌅', time: '8 AM' },
        { meal: snack, label: 'Snack', icon: '🍎', time: '11 AM' },
        { meal: lunch, label: 'Lunch', icon: '☀️', time: '1 PM' },
        { meal: dinner, label: 'Dinner', icon: '🌙', time: '7 PM' }
    ];

    const completedCount = meals.filter(m => isCompleted(m.meal?.id || '')).length;
    const totalCalories = (breakfast?.calories || 0) + (snack?.calories || 0) + (lunch?.calories || 0) + (dinner?.calories || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className={`
                bg-white rounded-xl shadow-sm border overflow-hidden
                ${isToday ? 'ring-2 ring-[#58CC02] border-[#58CC02]' : 'border-gray-100'}
                min-w-[260px] sm:min-w-[280px]
            `}
        >
            {/* Day Header */}
            <div className={`
                px-4 py-3 flex items-center justify-between
                ${isToday
                    ? 'bg-[#58CC02] text-white'
                    : 'bg-gray-50 text-gray-700'}
            `}>
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold
                        ${isToday ? 'bg-white/20' : 'bg-white shadow-sm'}
                    `}>
                        <span className={isToday ? 'text-white' : 'text-gray-500'}>{dayName}</span>
                        <span className={`text-lg leading-none ${isToday ? 'text-white' : 'text-gray-800'}`}>{dayNum}</span>
                    </div>
                    <div>
                        <span className={`font-semibold ${isToday ? 'text-white' : 'text-gray-800'}`}>
                            {isToday ? 'Today' : `${month} ${dayNum}`}
                        </span>
                    </div>
                </div>
                <div className={`text-xs font-medium ${isToday ? 'text-white/80' : 'text-gray-400'}`}>
                    {completedCount}/4 ✓
                </div>
            </div>

            {/* Meals List */}
            <div className="p-3 space-y-2">
                {meals.map(({ meal, label, icon }) => (
                    <button
                        key={meal?.id || label}
                        onClick={() => meal && onMealClick(meal)}
                        disabled={!meal}
                        className={`
                            w-full p-3 rounded-lg flex items-center gap-3 text-left transition-all
                            ${isCompleted(meal?.id || '')
                                ? 'bg-green-50 border border-green-100'
                                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}
                        `}
                    >
                        <span className="text-lg">{icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isCompleted(meal?.id || '') ? 'text-green-600' : 'text-gray-400'}`}>
                                {label}
                            </p>
                            <p className={`text-sm font-semibold truncate ${isCompleted(meal?.id || '') ? 'text-green-700' : 'text-gray-800'
                                }`}>
                                {meal?.name || 'Not planned'}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold text-gray-600">{meal?.calories || 0}</span>
                            <span className="text-xs text-gray-400 ml-0.5">cal</span>
                        </div>
                        {isCompleted(meal?.id || '') && (
                            <span className="text-green-500">✓</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">Daily Total</span>
                <span className="text-sm font-bold text-gray-700">{totalCalories} cal</span>
            </div>
        </motion.div>
    );
};
