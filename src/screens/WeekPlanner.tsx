import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { DayCard } from '../components/DayCard';
import { ScoreCard } from '../components/ScoreCard';
import { scoreFoodItem } from '../services/ai';
import type { Meal, FoodItem } from '../types';

interface WeekPlannerProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank' | 'week') => void;
}

// Get the dates for the current week (Monday to Sunday)
const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + mondayOffset + i);
        return date;
    });
};

const formatDateRange = (dates: Date[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const start = dates[0];
    const end = dates[6];
    if (start.getMonth() === end.getMonth()) {
        return `${months[start.getMonth()]} ${start.getDate()} - ${end.getDate()}`;
    }
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
};

export const WeekPlanner: React.FC<WeekPlannerProps> = ({ onNavigate }) => {
    const { currentPlan, completedMeals, user, completeMeal, addFoodLog } = useUserStore();
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [scoredFood, setScoredFood] = useState<FoodItem | null>(null);
    const [showScoreCard, setShowScoreCard] = useState(false);
    const [isScoring, setIsScoring] = useState(false);

    const weekDates = useMemo(() => getWeekDates(), []);
    const todayStr = new Date().toDateString();
    const todayIndex = weekDates.findIndex(d => d.toDateString() === todayStr);

    const handleMealClick = async (meal: Meal) => {
        setSelectedMeal(meal);
        setIsScoring(true);

        if (user) {
            const scores = await scoreFoodItem(meal.name, user);
            setScoredFood({
                id: meal.id,
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                fat: meal.fat,
                carbs: meal.carbs,
                fiber: meal.fiber,
                goalFitScore: scores?.goalFitScore || 0,
                gutHealthScore: scores?.gutHealthScore || 0,
                goalFitReason: scores?.goalFitReason || '',
                gutHealthReason: scores?.gutHealthReason || '',
                sodium: meal.sodium || 500,
                servingSize: scores?.suggestedServingSize || meal.servingSize || '1 serving'
            });
            setShowScoreCard(true);
        }
        setIsScoring(false);
    };

    const handleComplete = () => {
        if (selectedMeal && scoredFood) {
            completeMeal(selectedMeal.id);
            addFoodLog({
                id: crypto.randomUUID(),
                foodItem: scoredFood,
                mealType: selectedMeal.type,
                quantity: 1,
                loggedAt: new Date()
            });
            setShowScoreCard(false);
            setSelectedMeal(null);
        }
    };

    if (!currentPlan?.days) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">📅</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Meal Plan Yet</h2>
                    <p className="text-gray-500 mb-6">Generate your personalized 7-day meal plan from the home screen</p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-[#58CC02] text-white font-bold rounded-xl hover:bg-[#4CAF00] transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                        ←
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-gray-800">Weekly Plan</h1>
                        <p className="text-sm text-gray-500">{formatDateRange(weekDates)}</p>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            {/* Week Overview Pills */}
            <div className="bg-white border-b border-gray-100 py-3 px-4 overflow-x-auto">
                <div className="max-w-7xl mx-auto flex gap-2 min-w-max">
                    {weekDates.map((date, idx) => {
                        const isToday = idx === todayIndex;
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        return (
                            <div
                                key={idx}
                                className={`
                                    px-3 py-2 rounded-xl text-center min-w-[60px]
                                    ${isToday
                                        ? 'bg-[#58CC02] text-white'
                                        : 'bg-gray-100 text-gray-600'}
                                `}
                            >
                                <div className="text-xs font-medium">{days[date.getDay()]}</div>
                                <div className="text-lg font-bold">{date.getDate()}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day Cards */}
            <div className="max-w-7xl mx-auto p-4">
                {/* Mobile: Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 lg:hidden snap-x snap-mandatory -mx-4 px-4">
                    {currentPlan.days.map((day, idx) => (
                        <div key={idx} className="snap-start flex-shrink-0">
                            <DayCard
                                date={weekDates[idx]}
                                dayIndex={idx}
                                isToday={idx === todayIndex}
                                breakfast={day.breakfast}
                                snack={day.snack}
                                lunch={day.lunch}
                                dinner={day.dinner}
                                completedMeals={completedMeals}
                                onMealClick={handleMealClick}
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop: Grid */}
                <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {currentPlan.days.map((day, idx) => (
                        <DayCard
                            key={idx}
                            date={weekDates[idx]}
                            dayIndex={idx}
                            isToday={idx === todayIndex}
                            breakfast={day.breakfast}
                            snack={day.snack}
                            lunch={day.lunch}
                            dinner={day.dinner}
                            completedMeals={completedMeals}
                            onMealClick={handleMealClick}
                        />
                    ))}
                </div>
            </div>

            {/* Loading Overlay */}
            {isScoring && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-white rounded-2xl p-6 flex flex-col items-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="text-4xl mb-3"
                        >
                            🍳
                        </motion.div>
                        <p className="text-gray-600 font-medium">Analyzing meal...</p>
                    </motion.div>
                </div>
            )}

            {/* Score Card Modal */}
            {showScoreCard && scoredFood && (
                <ScoreCard
                    isOpen={showScoreCard}
                    food={scoredFood}
                    onClose={() => {
                        setShowScoreCard(false);
                        setSelectedMeal(null);
                    }}
                    onAddToLog={handleComplete}
                />
            )}
        </div>
    );
};
