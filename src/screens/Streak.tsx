import { motion } from 'framer-motion';
import React from 'react';
import { useUserStore } from '../store/userStore';
import { Button3D } from '../components/Button3D';

interface StreakProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank') => void;
}

export const Streak: React.FC<StreakProps> = ({ onNavigate }) => {
    const { user } = useUserStore();

    if (!user) return null;

    const streakMilestones = [
        { days: 3, reward: '🥉 Bronze Badge', unlocked: user.streak >= 3 },
        { days: 7, reward: '🥈 Silver Badge', unlocked: user.streak >= 7 },
        { days: 14, reward: '🥇 Gold Badge', unlocked: user.streak >= 14 },
        { days: 30, reward: '💎 Diamond Badge', unlocked: user.streak >= 30 },
        { days: 60, reward: '👑 Crown Badge', unlocked: user.streak >= 60 },
        { days: 100, reward: '🏆 Legend Badge', unlocked: user.streak >= 100 },
    ];

    return (
        <div className="h-full bg-gradient-to-b from-orange-50 to-white flex flex-col">
            {/* Header */}
            <header className="px-4 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Streak</h1>
                </div>
            </header>

            {/* Streak Display */}
            <div className="px-4 py-6">
                <motion.div
                    className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-center text-white shadow-xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-4"
                    >
                        🔥
                    </motion.div>
                    <div className="text-7xl font-extrabold mb-2">{user.streak}</div>
                    <div className="text-xl font-semibold opacity-90">Day Streak!</div>
                    <p className="text-sm opacity-75 mt-2">
                        {user.streak === 0
                            ? "Complete a meal to start your streak!"
                            : user.streak === 1
                                ? "Great start! Keep it up!"
                                : `You've been consistent for ${user.streak} days!`}
                    </p>
                </motion.div>
            </div>

            {/* Milestones */}
            <div className="flex-1 px-4 overflow-y-auto pb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-3">MILESTONES</h3>
                <div className="space-y-3">
                    {streakMilestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.days}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${milestone.unlocked
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${milestone.unlocked ? 'bg-green-100' : 'bg-gray-200'
                                }`}>
                                {milestone.unlocked ? '✅' : '🔒'}
                            </div>
                            <div className="flex-1">
                                <span className={`font-bold block ${milestone.unlocked ? 'text-green-700' : 'text-gray-500'}`}>
                                    {milestone.days} Day Streak
                                </span>
                                <span className="text-sm text-gray-400">{milestone.reward}</span>
                            </div>
                            {milestone.unlocked && (
                                <span className="text-2xl">{milestone.reward.split(' ')[0]}</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Back Button */}
            <div className="px-4 pb-6 safe-area-bottom">
                <Button3D variant="green" fullWidth onClick={() => onNavigate('home')}>
                    Back to Plan
                </Button3D>
            </div>
        </div>
    );
};

export default Streak;
