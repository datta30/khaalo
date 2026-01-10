import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { DayCard } from '../components/DayCard';
import { ScoreCard } from '../components/ScoreCard';
import { scoreFoodItem } from '../services/ai';
import type { Meal, FoodItem } from '../types';

interface WeekPlannerProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank' | 'week') => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeekPlanner: React.FC<WeekPlannerProps> = ({ onNavigate }) => {
    const { currentPlan, completedMeals, user, completeMeal, addFoodLog } = useUserStore();
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [scoredFood, setScoredFood] = useState<FoodItem | null>(null);
    const [showScoreCard, setShowScoreCard] = useState(false);
    const [isScoring, setIsScoring] = useState(false);

    // Get current day of week (0 = Monday, 6 = Sunday)
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">📅</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Meal Plan Yet</h2>
                    <p className="text-gray-500 mb-4">Generate your personalized 7-day meal plan</p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-[#58CC02] text-white font-bold rounded-xl"
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
            <div className="bg-gradient-to-r from-[#58CC02] to-[#7ED321] p-4 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                    >
                        ←
                    </button>
                    <h1 className="text-xl font-bold text-white">7-Day Meal Plan</h1>
                    <div className="w-10" />
                </div>

                {/* Week Overview */}
                <div className="flex justify-between px-2">
                    {DAYS.map((day, idx) => (
                        <div
                            key={day}
                            className={`
                                flex flex-col items-center
                                ${idx === todayIndex ? 'opacity-100' : 'opacity-60'}
                            `}
                        >
                            <span className="text-xs text-white/80">{day.slice(0, 3)}</span>
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-1
                                ${idx === todayIndex
                                    ? 'bg-white text-[#58CC02]'
                                    : 'bg-white/20 text-white'}
                            `}>
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day Cards - Responsive Grid */}
            <div className="p-4 -mt-2">
                {/* Mobile: Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 md:hidden snap-x snap-mandatory">
                    {currentPlan.days.map((day, idx) => (
                        <div key={idx} className="snap-start flex-shrink-0">
                            <DayCard
                                dayName={DAYS[idx]}
                                dayIndex={idx}
                                isToday={idx === todayIndex}
                                breakfast={day.breakfast}
                                snack={day.snack}
                                lunch={day.lunch}
                                dinner={day.dinner}
                                completedMeals={completedMeals}
                                onMealClick={handleMealClick}
                                compact
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentPlan.days.map((day, idx) => (
                        <DayCard
                            key={idx}
                            dayName={DAYS[idx]}
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
