import React from 'react';
import { motion } from 'framer-motion';

interface LandingProps {
    onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="w-full px-4 py-4 sm:px-6 md:px-8 lg:px-12 sticky top-0 z-50 bg-green-50/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#6ee724] p-1.5 sm:p-2 rounded-lg">
                            <span className="text-white text-lg sm:text-xl">🍛</span>
                        </div>
                        <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-800">Khaalo</span>
                    </div>
                    <div className="hidden md:flex gap-6 lg:gap-8 font-medium text-gray-600">
                        <a className="hover:text-[#6ee724] transition-colors cursor-pointer" href="#features">Features</a>
                        <a className="hover:text-[#6ee724] transition-colors cursor-pointer" href="#science">Science</a>
                        <a className="hover:text-[#6ee724] transition-colors cursor-pointer" href="#about">About</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-4 pt-8 pb-16 sm:px-6 md:px-8 lg:px-12 md:pt-16 md:pb-24">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    <motion.div
                        className="flex-1 text-center lg:text-left space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-sm font-bold tracking-wide">
                            <span>⭐</span>
                            NEW V2.0
                        </div>
                        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900">
                            Make Healthy Eating a Game with{' '}
                            <span className="text-[#5bc51d] relative inline-block">
                                Khaalo!
                                <span className="absolute -bottom-1 left-0 w-full h-2 sm:h-3 bg-green-200 -z-10 rounded transform -rotate-1"></span>
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Your personal gamified Indian meal planner. Level up your health with every roti.
                        </p>
                        <div className="flex flex-col items-center lg:items-start gap-3 pt-4">
                            <motion.button
                                onClick={onGetStarted}
                                className="bg-[#6ee724] hover:bg-[#5bc51d] text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get Started
                                <span>→</span>
                            </motion.button>
                            <span className="text-sm text-gray-400 font-medium">No credit card required</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex-1 w-full max-w-md lg:max-w-none relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="relative z-10 bg-gradient-to-br from-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl overflow-hidden aspect-square sm:aspect-[4/3] flex items-center justify-center">
                            <div className="text-center relative z-10">
                                <motion.div
                                    className="text-6xl sm:text-8xl md:text-9xl mb-4"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    🤖
                                </motion.div>
                                <div className="absolute -top-2 left-4 sm:left-8 text-2xl sm:text-4xl animate-pulse">🥦</div>
                                <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-xl sm:text-3xl animate-pulse" style={{ animationDelay: '0.7s' }}>🥕</div>
                                <div className="absolute bottom-12 sm:bottom-16 left-2 sm:left-4 text-xl sm:text-3xl animate-pulse" style={{ animationDelay: '0.3s' }}>🥣</div>
                            </div>
                            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                <span className="text-lg sm:text-xl">👋</span>
                                <span className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">Hi, I'm Khaalo-Bot!</span>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-48 sm:w-64 h-48 sm:h-64 bg-[#6ee724]/20 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute -bottom-10 -left-10 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-400/20 rounded-full blur-3xl -z-0"></div>
                    </motion.div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 md:px-8 lg:px-12 md:py-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
                    <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900">Why Play?</h2>
                    <span className="px-4 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold tracking-widest uppercase">Features</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Gamified Path */}
                    <motion.div
                        className="bg-yellow-50 border border-yellow-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                        whileHover={{ y: -5 }}
                    >
                        <div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-400 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-md text-white text-xl sm:text-2xl">
                                🏆
                            </div>
                            <h3 className="font-bold text-xl sm:text-2xl text-yellow-900 mb-2 sm:mb-3">Gamified Path</h3>
                            <p className="text-yellow-800/80 leading-relaxed text-sm sm:text-base">Earn XP and unlock avatars as you eat your veggies.</p>
                        </div>
                        <div className="mt-6 sm:mt-8">
                            <div className="flex justify-between text-xs font-bold text-yellow-800 mb-1">
                                <span>XP</span>
                                <span>Lvl 5</span>
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-2 sm:h-3">
                                <div className="bg-yellow-500 h-2 sm:h-3 rounded-full w-2/3 shadow-sm"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Smart Scanner */}
                    <motion.div
                        className="bg-pink-50 border border-pink-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
                        whileHover={{ y: -5 }}
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-md text-white text-xl sm:text-2xl">
                                📷
                            </div>
                            <h3 className="font-bold text-xl sm:text-2xl text-rose-900 mb-2 sm:mb-3">Smart Scanner</h3>
                            <p className="text-rose-800/80 leading-relaxed text-sm sm:text-base max-w-[80%]">Snap your Paneer. Get instant nutrition stats.</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gray-800 rounded-2xl rotate-6 border-4 border-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                            <span className="text-3xl sm:text-5xl">🧀</span>
                        </div>
                    </motion.div>

                    {/* Thali Tracking */}
                    <motion.div
                        className="bg-green-50 border border-green-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                        whileHover={{ y: -5 }}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-md text-white text-xl sm:text-2xl">
                                    🍽️
                                </div>
                                <div className="bg-white px-2 sm:px-3 py-1 rounded-full border border-green-100 shadow-sm flex items-center gap-1.5">
                                    <span className="text-xs">🇮🇳</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-green-800 uppercase">Made for India</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-xl sm:text-2xl text-green-900 mb-2 sm:mb-3">Thali Tracking</h3>
                            <p className="text-green-800/80 leading-relaxed text-sm sm:text-base">Tailored specifically for Roti, Sabzi, and Dal nutrition.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Science Section */}
            <section id="science" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 md:px-8 lg:px-12 pb-20 md:pb-24">
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center text-gray-900 mb-8 sm:mb-12">Science-Backed Nutrition</h2>
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Publication Card */}
                        <div className="lg:w-5/12 bg-gray-50 p-6 sm:p-8 md:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="w-full max-w-sm">
                                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600 text-xl sm:text-2xl">
                                        📚
                                    </div>
                                    <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Publication Overview</h3>
                                    <p className="text-xs sm:text-sm text-gray-700 mb-1">
                                        <strong>Authors:</strong> Aswathy Vijayakumar et al.
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700">
                                        <strong>Journal:</strong> Current Developments in Nutrition
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">Volume 8, Issue 7 • 2024</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Research Content */}
                        <div className="lg:w-7/12 p-6 sm:p-8 md:p-12">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100 inline-block mb-4 sm:mb-6">Cited Research</span>
                            <h3 className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 mb-4">
                                Development of an Indian Food Composition Database
                            </h3>

                            {/* Why This Matters */}
                            <div className="bg-green-50 border-l-4 border-[#6ee724] p-3 sm:p-4 rounded-r-lg mb-4 sm:mb-6">
                                <h4 className="font-bold text-green-800 mb-2 text-sm sm:text-base">🎯 Why This Matters for Khaalo</h4>
                                <p className="text-green-700 text-xs sm:text-sm leading-relaxed">
                                    The INDB provides accurate nutrition data for <strong>1,095 raw ingredients</strong> and <strong>1,014 traditional recipes</strong>. Khaalo uses this to give you precise information for dishes like Dal Makhani and Paneer Tikka!
                                </p>
                            </div>

                            <a
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 hover:border-[#6ee724] text-gray-700 hover:text-[#6ee724] transition-all duration-300 font-bold text-sm sm:text-base"
                                href="https://doi.org/10.1016/j.cdnut.2024.103790"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                🔗 Read Full Article ↗
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="about" className="bg-white pt-12 sm:pt-16 pb-8 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
                    <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-6 sm:mb-8">Ready to Level Up?</h2>
                    <motion.button
                        onClick={onGetStarted}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-2xl shadow-lg shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-300 mb-8 sm:mb-12"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Join the Movement
                    </motion.button>
                    <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <a className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#6ee724] hover:text-white transition-all text-sm sm:text-base" href="#">𝕏</a>
                        <a className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#6ee724] hover:text-white transition-all" href="#">📷</a>
                        <a className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#6ee724] hover:text-white transition-all" href="https://github.com" target="_blank" rel="noopener noreferrer">💻</a>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm">© 2024 Khaalo. Eat Wise, Play Hard.</p>
                </div>
            </footer>
        </div>
    );
};
