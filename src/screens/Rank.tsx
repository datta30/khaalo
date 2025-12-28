import { motion } from 'framer-motion';
import React from 'react';
import { useUserStore } from '../store/userStore';

interface RankProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank') => void;
}

// Placeholder leaderboard data
const leaderboard = [
    { rank: 1, name: 'Priya S.', streak: 45, badge: '👑' },
    { rank: 2, name: 'Rahul K.', streak: 38, badge: '🥇' },
    { rank: 3, name: 'Ananya M.', streak: 32, badge: '🥈' },
    { rank: 4, name: 'Vikram P.', streak: 28, badge: '🥉' },
    { rank: 5, name: 'Sneha R.', streak: 25, badge: '' },
    { rank: 6, name: 'Arjun D.', streak: 21, badge: '' },
    { rank: 7, name: 'Neha G.', streak: 18, badge: '' },
    { rank: 8, name: 'Karthik V.', streak: 15, badge: '' },
];

export const Rank: React.FC<RankProps> = ({ onNavigate }) => {
    const { user } = useUserStore();

    if (!user) return null;

    // Calculate user's rank based on streak
    const userRank = leaderboard.filter(p => p.streak > user.streak).length + 1;

    return (
        <div className="h-full bg-gradient-to-b from-purple-50 to-white flex flex-col">
            {/* Header */}
            <header className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Leaderboard</h1>
                </div>
            </header>

            {/* User's Rank Card */}
            <div className="px-4 py-4">
                <motion.div
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                            {user.gender === 'male' ? '👨' : user.gender === 'female' ? '👩' : '🧑'}
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-lg block">{user.name || 'You'}</span>
                            <span className="text-white/70 text-sm">🔥 {user.streak} day streak</span>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold">#{userRank}</div>
                            <span className="text-xs text-white/70">Your Rank</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Leaderboard */}
            <div className="flex-1 px-4 overflow-y-auto pb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-3">TOP STREAKERS</h3>
                <div className="space-y-2">
                    {leaderboard.map((person, index) => (
                        <motion.div
                            key={person.rank}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 rounded-2xl flex items-center gap-3 ${person.rank <= 3
                                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
                                    : 'bg-gray-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${person.rank === 1 ? 'bg-amber-400 text-white' :
                                    person.rank === 2 ? 'bg-gray-300 text-white' :
                                        person.rank === 3 ? 'bg-amber-600 text-white' :
                                            'bg-gray-200 text-gray-600'
                                }`}>
                                {person.rank}
                            </div>
                            <div className="flex-1">
                                <span className="font-semibold text-gray-800 block">
                                    {person.name} {person.badge}
                                </span>
                                <span className="text-sm text-gray-400">🔥 {person.streak} days</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Coming Soon */}
                <div className="mt-6 p-4 bg-gray-100 rounded-2xl text-center">
                    <span className="text-2xl">🚀</span>
                    <p className="font-semibold text-gray-700 mt-2">Weekly Challenges Coming Soon!</p>
                    <p className="text-sm text-gray-500">Compete with friends and win rewards</p>
                </div>
            </div>

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
                <button className="flex flex-col items-center gap-1 text-[#58CC02]">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-bold">Rank</span>
                </button>
                <button
                    onClick={() => onNavigate('profile')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                    <span className="text-2xl">😊</span>
                    <span className="text-xs font-medium">Me</span>
                </button>
            </nav>
        </div>
    );
};

export default Rank;
