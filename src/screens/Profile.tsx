import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { Button3D } from '../components/Button3D';
import { AnimatePresence, motion } from 'framer-motion';

interface ProfileProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank') => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
    const { user, resetApp, resetDailyProgress } = useUserStore();
    const [showDailyResetModal, setShowDailyResetModal] = useState(false);
    const [showFullResetModal, setShowFullResetModal] = useState(false);

    if (!user) return null;

    const bmiColor = {
        underweight: 'text-blue-500',
        normal: 'text-green-500',
        overweight: 'text-orange-500',
        obese: 'text-red-500'
    }[user.bmiCategory];

    const goalLabel = {
        lose: '🏃 Lose Weight',
        maintain: '⚖️ Maintain',
        gain: '💪 Build Muscle'
    }[user.goal];

    const regionLabel = {
        north: '🫓 North Indian',
        south: '🍚 South Indian',
        east: '🍲 East Indian',
        west: '🌶️ West Indian'
    }[user.region];

    const handleDailyReset = () => {
        resetDailyProgress();
        setShowDailyResetModal(false);
        // Brief success feedback
        setTimeout(() => {
            onNavigate('home');
        }, 500);
    };

    const handleFullReset = () => {
        resetApp();
        setShowFullResetModal(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-3 safe-area-top">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'}
                    </div>
                </div>
                <h1 className="text-center text-lg font-bold text-gray-800 mt-2">{user.name}</h1>
                <p className="text-center text-sm text-gray-500">Your Profile</p>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Stats Grid */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <span className="text-sm font-bold text-gray-400 block mb-3">YOUR STATS</span>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Height</span>
                            <p className="text-lg font-bold text-gray-800">{user.height} cm</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Weight</span>
                            <p className="text-lg font-bold text-gray-800">{user.weight} kg</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">BMI</span>
                            <p className={`text-lg font-bold ${bmiColor}`}>{user.bmi.toFixed(1)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Daily Cal</span>
                            <p className="text-lg font-bold text-gray-800">{user.dailyCalories}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <span className="text-sm font-bold text-gray-400 block mb-3">STREAK</span>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🔥</span>
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-orange-500">{user.streak} days</p>
                            <p className="text-xs text-gray-500">Keep it going!</p>
                        </div>
                    </div>
                </div>

                {/* Goal */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <span className="text-sm font-bold text-gray-400 block mb-2">CURRENT GOAL</span>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{user.goal === 'lose' ? '🏃' : user.goal === 'gain' ? '💪' : '⚖️'}</span>
                        <div>
                            <span className="font-bold text-gray-800">{goalLabel}</span>
                            <span className="text-sm text-gray-400 block capitalize">{user.bmiCategory} BMI</span>
                        </div>
                    </div>
                </div>

                {/* Cuisine Preference */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <span className="text-sm font-bold text-gray-400 block mb-2">CUISINE PREFERENCE</span>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{regionLabel.split(' ')[0]}</span>
                        <span className="font-bold text-gray-800">{regionLabel}</span>
                    </div>
                </div>

                {/* Age */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">Age</span>
                        <span className="text-gray-600">{user.age} years</span>
                    </div>
                </div>

                {/* Reset Progress Options */}
                <div className="mt-6 space-y-3 pb-20">
                    <Button3D
                        variant="orange"
                        fullWidth
                        onClick={() => setShowDailyResetModal(true)}
                    >
                        Reset Today's Progress
                    </Button3D>

                    <Button3D
                        variant="gray"
                        fullWidth
                        onClick={() => setShowFullResetModal(true)}
                    >
                        Reset All Data & Re-onboard
                    </Button3D>
                </div>
            </div>

            {/* Daily Reset Confirmation Modal */}
            <AnimatePresence>
                {showDailyResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDailyResetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="text-center mb-4">
                                <div className="text-5xl mb-3">⚠️</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Today's Progress?</h3>
                                <p className="text-gray-600 text-sm">
                                    This will clear all meals and water logged for today. Your profile and streak will remain unchanged.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDailyResetModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDailyReset}
                                    className="flex-1 py-3 px-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                                >
                                    Reset Today
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full Reset Confirmation Modal */}
            <AnimatePresence>
                {showFullResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFullResetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-red-500"
                        >
                            <div className="text-center mb-4">
                                <div className="text-5xl mb-3">🚨</div>
                                <h3 className="text-xl font-bold text-red-600 mb-2">CRITICAL WARNING</h3>
                                <p className="text-gray-700 text-sm font-semibold mb-2">
                                    This will permanently delete:
                                </p>
                                <ul className="text-left text-sm text-gray-600 space-y-1 mb-3">
                                    <li>✗ Your profile & settings</li>
                                    <li>✗ All meal history</li>
                                    <li>✗ Your {user.streak}-day streak</li>
                                    <li>✗ All progress data</li>
                                </ul>
                                <p className="text-red-600 text-xs font-bold">This action CANNOT be undone!</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFullResetModal(false)}
                                    className="flex-1 py-3 px-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                                >
                                    Keep My Data
                                </button>
                                <button
                                    onClick={handleFullReset}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    Delete All
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <nav className="flex items-center justify-around py-3 border-t border-gray-100 bg-white safe-area-bottom">
                <button
                    onClick={() => onNavigate('home')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">🥗</span>
                    <span className="text-xs font-medium">Plan</span>
                </button>
                <button
                    onClick={() => onNavigate('scanner')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-medium">Scan</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-medium">Rank</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#58CC02]">
                    <span className="text-2xl">😊</span>
                    <span className="text-xs font-bold">Me</span>
                </button>
            </nav>
        </div>
    );
};

export default Profile;
