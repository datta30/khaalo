import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { MealNode } from '../components/MealNode';
import { ProgressBar } from '../components/ProgressBar';
import type { Meal, FoodItem, FoodLogEntry } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { scoreFoodItem } from '../services/ai';
import { Button3D } from '../components/Button3D';
import {
    requestNotificationPermission,
    getNotificationPermission,
    showWaterReminder,
    startMealReminders,
    stopAllReminders
} from '../services/notifications';

interface HomeProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const {
        user,
        getMealNodes,
        completeMeal,
        addFoodLog,
        waterGlasses,
        waterGoal,
        drinkWater,
        getWaterProgress,
        swapMeal,
        claimDailyReward,
        dailyRewardClaimed,
        completedMeals,
        getCurrentDayPlan
    } = useUserStore();

    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [showScoreCard, setShowScoreCard] = useState(false);
    const [scoredFood, setScoredFood] = useState<FoodItem | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [mealToSwap, setMealToSwap] = useState<Meal | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(getNotificationPermission() === 'granted');

    // Initialize notifications on mount
    useEffect(() => {
        const dayPlan = getCurrentDayPlan();
        if (!dayPlan || !notificationsEnabled) return;

        const getMealName = (type: string): string => {
            const meal = dayPlan[type as keyof typeof dayPlan];
            return typeof meal === 'object' && 'name' in meal ? meal.name : type;
        };

        const isMealCompleted = (type: string): boolean => {
            const meal = dayPlan[type as keyof typeof dayPlan];
            return typeof meal === 'object' && 'id' in meal && completedMeals.includes(meal.id);
        };

        startMealReminders(getMealName, isMealCompleted);

        return () => stopAllReminders();
    }, [notificationsEnabled, completedMeals, getCurrentDayPlan]);

    // Handle notification toggle
    const handleEnableNotifications = async () => {
        const permission = await requestNotificationPermission();
        setNotificationsEnabled(permission === 'granted');
        if (permission === 'granted') {
            showWaterReminder(waterGlasses, waterGoal);
        }
    };

    const nodes = getMealNodes();
    const completedCount = nodes.filter(n => n.id !== 'daily-reward' && n.state === 'completed').length;
    const todayProgress = (completedCount / 4) * 100;

    // Alternative meals for swapping
    const alternativeMeals: Record<string, { name: string; calories: number; protein: number; fat: number; carbs: number; fiber: number; sodium: number }[]> = {
        breakfast: [
            { name: 'Poha', calories: 250, protein: 6, fat: 8, carbs: 42, fiber: 3, sodium: 400 },
            { name: 'Upma', calories: 280, protein: 8, fat: 10, carbs: 45, fiber: 4, sodium: 500 },
            { name: 'Idli Sambar', calories: 200, protein: 7, fat: 4, carbs: 38, fiber: 3, sodium: 600 },
            { name: 'Oats Cheela', calories: 180, protein: 10, fat: 5, carbs: 28, fiber: 5, sodium: 300 },
        ],
        snack: [
            { name: 'Fruit Bowl', calories: 120, protein: 2, fat: 1, carbs: 28, fiber: 4, sodium: 50 },
            { name: 'Roasted Makhana', calories: 100, protein: 4, fat: 2, carbs: 18, fiber: 2, sodium: 200 },
            { name: 'Sprouts Chaat', calories: 150, protein: 8, fat: 3, carbs: 22, fiber: 5, sodium: 450 },
            { name: 'Buttermilk', calories: 60, protein: 3, fat: 2, carbs: 8, fiber: 0, sodium: 400 },
        ],
        lunch: [
            { name: 'Rajma Chawal', calories: 450, protein: 15, fat: 10, carbs: 70, fiber: 8, sodium: 800 },
            { name: 'Chole Roti', calories: 420, protein: 14, fat: 12, carbs: 62, fiber: 10, sodium: 900 },
            { name: 'Vegetable Pulao', calories: 380, protein: 10, fat: 8, carbs: 65, fiber: 5, sodium: 700 },
            { name: 'Dal Rice', calories: 400, protein: 14, fat: 8, carbs: 68, fiber: 6, sodium: 750 },
        ],
        dinner: [
            { name: 'Paneer Tikka', calories: 320, protein: 18, fat: 20, carbs: 15, fiber: 2, sodium: 800 },
            { name: 'Mixed Veg Curry', calories: 280, protein: 8, fat: 12, carbs: 35, fiber: 6, sodium: 600 },
            { name: 'Grilled Chicken', calories: 350, protein: 35, fat: 15, carbs: 10, fiber: 2, sodium: 700 },
            { name: 'Soup & Salad', calories: 200, protein: 8, fat: 6, carbs: 28, fiber: 6, sodium: 450 },
        ],
    };

    const handleMealClick = async (meal: Meal) => {
        if (meal.id === 'daily-reward-id') {
            if (!dailyRewardClaimed) {
                claimDailyReward();
                alert('🎉 Daily Reward Claimed! Enjoy your cheat snack!');
            }
            return;
        }

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
                goalFitScore: scores.goalFitScore,
                gutHealthScore: scores.gutHealthScore,
                goalFitReason: scores.goalFitReason,
                gutHealthReason: scores.gutHealthReason,
                cuisine: meal.region === 'all' ? 'Pan-Indian' : `${meal.region.charAt(0).toUpperCase() + meal.region.slice(1)} Indian`,
                sodium: meal.sodium || 500,
                servingSize: scores.suggestedServingSize || meal.servingSize || '1 serving'
            });
            setShowScoreCard(true);
        }
        setIsScoring(false);
    };

    const handleSwapClick = (meal: Meal) => {
        setMealToSwap(meal);
        setShowSwapModal(true);
    };

    const handleSwapMeal = (newMealData: typeof alternativeMeals.breakfast[0]) => {
        if (!mealToSwap) return;

        const newMeal: Meal = {
            id: crypto.randomUUID(),
            name: newMealData.name,
            type: mealToSwap.type,
            calories: newMealData.calories,
            protein: newMealData.protein,
            fat: newMealData.fat,
            carbs: newMealData.carbs,
            fiber: newMealData.fiber,
            region: 'all',
            description: `Fresh ${newMealData.name}`,
            sodium: newMealData.sodium
        };

        swapMeal(mealToSwap.type, newMeal);
        setShowSwapModal(false);
        setMealToSwap(null);
    };

    const handleAddToLog = () => {
        if (selectedMeal && scoredFood) {
            const entry: FoodLogEntry = {
                id: crypto.randomUUID(),
                foodItem: scoredFood,
                mealType: selectedMeal.type,
                quantity: 1,
                loggedAt: new Date()
            };
            addFoodLog(entry);
            completeMeal(selectedMeal.id);
            setShowScoreCard(false);
            setSelectedMeal(null);
            setScoredFood(null);
        }
    };

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Header */}
            <header className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    {/* Streak - clickable */}
                    <motion.button
                        onClick={() => onNavigate('streak')}
                        className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-xl">🔥</span>
                        <span className="font-bold text-orange-500">{user?.streak || 0}</span>
                    </motion.button>

                    {/* Water tracker */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={drinkWater}
                        className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
                    >
                        <span className="text-lg">💧</span>
                        <span className="font-semibold text-blue-500">{waterGlasses}/{waterGoal}</span>
                    </motion.button>
                </div>

                {/* Settings button */}
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </header>

            {/* Greeting & Water Progress */}
            <div className="px-4 py-3 space-y-2">
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        Hi {user?.name || 'there'}! 👋
                    </h2>
                    <p className="text-sm text-gray-500">Here's your meal plan for today</p>
                </div>

                {/* Water Progress Bar */}
                <div className="bg-blue-50 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-blue-600">💧 Water Today</span>
                        <span className="text-sm font-bold text-blue-600">{getWaterProgress()}%</span>
                    </div>
                    <ProgressBar value={getWaterProgress()} variant="blue" size="sm" animated={false} />
                </div>
            </div>

            {/* Main scrollable area with meal path */}
            <div className="flex-1 overflow-y-auto">
                <div className="relative min-h-full py-6">
                    {/* SVG Path */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#58CC02" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#E5E5E5" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 215 80 
                  Q 270 180 215 280 
                  Q 160 380 215 480`}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="4"
                            strokeDasharray="10,10"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Meal Nodes */}
                    <div className="relative z-10 flex flex-col items-center gap-12 px-4">
                        {nodes.map((node, index) => (
                            <div key={node.id} className="relative">
                                <MealNode
                                    node={node}
                                    index={index}
                                    onClick={() => node.state === 'current' && handleMealClick(node.meal)}
                                />
                                {/* Swap button for current/completed meals */}
                                {(node.state === 'current' || node.state === 'completed') && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => handleSwapClick(node.meal)}
                                        className="absolute -right-2 -top-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-lg text-sm"
                                    >
                                        🔄
                                    </motion.button>
                                )}
                            </div>
                        ))}

                        {/* Weekly Reward */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col items-center mt-4 mb-8"
                        >
                            <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl opacity-50">
                                🏆
                            </div>
                            <span className="text-gray-400 text-xs font-bold mt-2">WEEKLY REWARD</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Today's Progress */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <ProgressBar
                    value={todayProgress}
                    max={100}
                    variant="green"
                    size="sm"
                    label="Meals Completed"
                    showLabel
                />
            </div>

            {/* Bottom Navigation */}
            <nav className="flex items-center justify-around py-3 border-t border-gray-100 bg-white safe-area-bottom">
                <button className="flex flex-col items-center gap-1 text-[#58CC02]">
                    <span className="text-2xl">🥗</span>
                    <span className="text-xs font-bold">Plan</span>
                </button>
                <button
                    onClick={() => onNavigate('scanner')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-medium">Scan</span>
                </button>
                <button
                    onClick={() => onNavigate('rank')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-medium">Rank</span>
                </button>
                <button
                    onClick={() => onNavigate('profile')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">😊</span>
                    <span className="text-xs font-medium">Me</span>
                </button>
            </nav>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl w-full p-6 pb-8 safe-area-bottom"
                        >
                            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setShowSettings(false); onNavigate('profile'); }}
                                    className="w-full p-4 bg-gray-50 rounded-2xl text-left flex items-center gap-3"
                                >
                                    <span className="text-2xl">👤</span>
                                    <span className="font-semibold text-gray-700">Edit Profile</span>
                                </button>

                                <button
                                    onClick={() => { setShowSettings(false); onNavigate('streak'); }}
                                    className="w-full p-4 bg-gray-50 rounded-2xl text-left flex items-center gap-3"
                                >
                                    <span className="text-2xl">🔥</span>
                                    <span className="font-semibold text-gray-700">Streak & Achievements</span>
                                </button>

                                <button
                                    onClick={handleEnableNotifications}
                                    className="w-full p-4 bg-gray-50 rounded-2xl text-left flex items-center gap-3 justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🔔</span>
                                        <span className="font-semibold text-gray-700">
                                            {notificationsEnabled ? 'Reminders On' : 'Enable Reminders'}
                                        </span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : ''}`} />
                                    </div>
                                </button>

                                <button className="w-full p-4 bg-gray-50 rounded-2xl text-left flex items-center gap-3">
                                    <span className="text-2xl">🌙</span>
                                    <span className="font-semibold text-gray-700">Dark Mode (Coming Soon)</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full mt-4 p-3 text-gray-500 font-semibold"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Swap Meal Modal */}
            <AnimatePresence>
                {showSwapModal && mealToSwap && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSwapModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-sm p-6 max-h-[80vh] overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Swap {mealToSwap.type}</h2>
                            <p className="text-gray-500 text-sm mb-4">Replace "{mealToSwap.name}" with:</p>

                            <div className="space-y-2">
                                {alternativeMeals[mealToSwap.type]?.map((meal) => (
                                    <motion.button
                                        key={meal.name}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSwapMeal(meal)}
                                        className="w-full p-4 bg-gray-50 rounded-2xl text-left hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-800 block">{meal.name}</span>
                                        <span className="text-sm text-gray-400">{meal.calories} kcal • {meal.protein}g protein</span>
                                    </motion.button>
                                ))}
                            </div>

                            <Button3D
                                variant="gray"
                                fullWidth
                                className="mt-4"
                                onClick={() => setShowSwapModal(false)}
                            >
                                Cancel
                            </Button3D>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading overlay */}
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
                            🍽️
                        </motion.div>
                        <span className="font-semibold text-gray-700">Analyzing with AI...</span>
                    </motion.div>
                </div>
            )}

            {/* Score Card Modal */}
            {scoredFood && (
                <ScoreCard
                    food={scoredFood}
                    isOpen={showScoreCard}
                    onClose={() => {
                        setShowScoreCard(false);
                        setScoredFood(null);
                    }}
                    onAddToLog={handleAddToLog}
                />
            )}
        </div>
    );
};

export default Home;
