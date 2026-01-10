import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Button3D } from '../components/Button3D';
import { Mascot } from '../components/Mascot';

interface ClerkUserData {
    clerkId: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    firstName: string | null;
    lastName: string | null;
}

interface OnboardingProps {
    clerkUser?: ClerkUserData | null;
}

export const Onboarding: React.FC<OnboardingProps> = ({ clerkUser }) => {
    const {
        user,
        onboardingStep,
        updateUser,
        nextOnboardingStep,
        prevOnboardingStep,
        completeOnboarding
    } = useUserStore();

    // Determine which steps to show based on available Clerk data
    const steps = useMemo(() => {
        const allSteps = [
            { id: 'name', title: 'Name', type: 'name' },
            { id: 'gender', title: 'Gender', type: 'gender' },
            { id: 'age', title: 'Age', type: 'age' },
            { id: 'measurements', title: 'Body Measurements', type: 'measurements' },
            { id: 'region', title: 'Region', type: 'region' },
            { id: 'goal', title: 'Goal', type: 'goal' }
        ];

        // If we have name from Clerk (Google), skip name step
        if (clerkUser?.name) {
            return allSteps.filter(step => step.id !== 'name');
        }

        return allSteps;
    }, [clerkUser?.name]);

    // Initialize with Clerk data if available
    const [localValues, setLocalValues] = useState({
        name: clerkUser?.name || user?.name || '',
        gender: user?.gender || 'male',
        age: user?.age || 25,
        weight: user?.weight || 70,
        height: user?.height || 170,
        region: user?.region || 'north',
        goal: user?.goal || 'maintain'
    });

    // Update name from clerk user when it changes
    useEffect(() => {
        if (clerkUser?.name && !localValues.name) {
            setLocalValues(v => ({ ...v, name: clerkUser.name || '' }));
        }
    }, [clerkUser?.name]);

    const currentStep = steps[onboardingStep];

    const handleNext = () => {
        // Always save the current step's data
        switch (currentStep?.type) {
            case 'name':
                updateUser({ name: localValues.name });
                break;
            case 'gender':
                updateUser({ gender: localValues.gender });
                break;
            case 'age':
                updateUser({ age: localValues.age });
                break;
            case 'measurements':
                updateUser({ weight: localValues.weight, height: localValues.height });
                break;
            case 'region':
                updateUser({ region: localValues.region });
                break;
            case 'goal':
                // Save any Clerk data along with final goal
                updateUser({
                    goal: localValues.goal,
                    name: localValues.name, // Ensure name is saved even if skipped
                    ...(clerkUser ? {
                        email: clerkUser.email || undefined,
                        picture: clerkUser.picture || undefined,
                        clerkId: clerkUser.clerkId
                    } : {})
                });
                completeOnboarding();
                return;
        }
        nextOnboardingStep();
    };

    const progress = ((onboardingStep + 1) / steps.length) * 100;
    const canContinue = currentStep?.type === 'name' ? localValues.name.trim().length >= 2 : true;

    const renderStep = () => {
        switch (onboardingStep) {
            case 0: // Name
                return (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="happy" message="Hi there! What's your name?" size="lg" />

                        <div className="w-full mt-8">
                            <input
                                type="text"
                                value={localValues.name}
                                onChange={(e) => setLocalValues(v => ({ ...v, name: e.target.value }))}
                                placeholder="Enter your name..."
                                className="w-full p-4 text-2xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-[#58CC02] focus:outline-none transition-colors"
                                autoFocus
                            />
                            <p className="text-center text-gray-400 text-sm mt-3">
                                We'll use this to personalize your experience
                            </p>
                        </div>
                    </motion.div>
                );

            case 1: // Gender
                return (
                    <motion.div
                        key="gender"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="happy" message={`Nice to meet you, ${localValues.name}! What's your gender?`} size="lg" />

                        <div className="w-full mt-8 space-y-3">
                            {[
                                { value: 'male', label: '👨 Male' },
                                { value: 'female', label: '👩 Female' },
                                { value: 'other', label: '🧑 Other' }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setLocalValues(v => ({ ...v, gender: option.value as typeof localValues.gender }))}
                                    className={`w-full p-4 rounded-2xl border-2 font-bold text-lg transition-all ${localValues.gender === option.value
                                        ? 'border-[#58CC02] bg-[#58CC02]/10 text-[#58CC02]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 2: // Age
                return (
                    <motion.div
                        key="age"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="thinking" message="How old are you?" size="lg" />

                        <div className="w-full mt-8">
                            <div className="text-center mb-6">
                                <span className="text-6xl font-extrabold text-[#58CC02]">{localValues.age}</span>
                                <span className="text-2xl text-gray-400 ml-2">years</span>
                            </div>

                            <input
                                type="range"
                                min="12"
                                max="80"
                                value={localValues.age}
                                onChange={(e) => setLocalValues(v => ({ ...v, age: parseInt(e.target.value) }))}
                                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#58CC02]"
                            />

                            <div className="flex justify-between text-sm text-gray-400 mt-2">
                                <span>12</span>
                                <span>80</span>
                            </div>
                        </div>
                    </motion.div>
                );

            case 3: // Measurements
                return (
                    <motion.div
                        key="measurements"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="encouraging" message="What's your weight & height?" size="md" />

                        <div className="w-full mt-6 space-y-6">
                            {/* Weight */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <label className="text-sm font-bold text-gray-500 mb-3 block">WEIGHT</label>
                                <div className="flex items-center justify-center gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setLocalValues(v => ({ ...v, weight: Math.max(30, v.weight - 1) }))}
                                        className="w-12 h-12 bg-white rounded-full shadow text-2xl font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        −
                                    </motion.button>
                                    <span className="text-5xl font-extrabold text-gray-800 w-24 text-center">{localValues.weight}</span>
                                    <span className="text-xl text-gray-400">kg</span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setLocalValues(v => ({ ...v, weight: Math.min(200, v.weight + 1) }))}
                                        className="w-12 h-12 bg-white rounded-full shadow text-2xl font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        +
                                    </motion.button>
                                </div>
                            </div>

                            {/* Height */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <label className="text-sm font-bold text-gray-500 mb-3 block">HEIGHT</label>
                                <div className="flex items-center justify-center gap-2">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setLocalValues(v => ({ ...v, height: Math.max(100, v.height - 1) }))}
                                        className="w-12 h-12 bg-white rounded-full shadow text-2xl font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        −
                                    </motion.button>
                                    <span className="text-5xl font-extrabold text-gray-800 w-24 text-center">{localValues.height}</span>
                                    <span className="text-xl text-gray-400">cm</span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setLocalValues(v => ({ ...v, height: Math.min(220, v.height + 1) }))}
                                        className="w-12 h-12 bg-white rounded-full shadow text-2xl font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        +
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 4: // Region
                return (
                    <motion.div
                        key="region"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="happy" message="Which Indian cuisine do you prefer?" size="md" />

                        <div className="w-full mt-6 grid grid-cols-2 gap-3">
                            {[
                                { value: 'north', label: 'North', icon: '🫓', desc: 'Roti, Dal, Paneer' },
                                { value: 'south', label: 'South', icon: '🍚', desc: 'Idli, Dosa, Sambar' },
                                { value: 'east', label: 'East', icon: '🐟', desc: 'Rice, Fish, Sweets' },
                                { value: 'west', label: 'West', icon: '🥗', desc: 'Thali, Dhokla, Vada' }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLocalValues(v => ({ ...v, region: option.value as typeof localValues.region }))}
                                    className={`p-4 rounded-2xl border-2 text-center transition-all ${localValues.region === option.value
                                        ? 'border-[#58CC02] bg-[#58CC02]/10'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-3xl block mb-1">{option.icon}</span>
                                    <span className={`font-bold block ${localValues.region === option.value ? 'text-[#58CC02]' : 'text-gray-700'}`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-gray-400">{option.desc}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 5: // Goal
                return (
                    <motion.div
                        key="goal"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center px-6"
                    >
                        <Mascot mood="celebrating" message="What's your health goal?" size="md" />

                        <div className="w-full mt-6 space-y-3">
                            {[
                                { value: 'lose', label: '🏃 Lose Weight', desc: 'Caloric deficit plan' },
                                { value: 'maintain', label: '⚖️ Maintain Weight', desc: 'Balanced nutrition' },
                                { value: 'gain', label: '💪 Build Muscle', desc: 'Protein-rich plan' }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setLocalValues(v => ({ ...v, goal: option.value as typeof localValues.goal }))}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${localValues.goal === option.value
                                        ? 'border-[#58CC02] bg-[#58CC02]/10'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`font-bold text-lg block ${localValues.goal === option.value ? 'text-[#58CC02]' : 'text-gray-700'}`}>
                                        {option.label}
                                    </span>
                                    <span className="text-sm text-gray-400">{option.desc}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Progress bar */}
            <div className="px-6 pt-6">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#58CC02] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-400">Step {onboardingStep + 1} of {steps.length}</span>
                    {onboardingStep > 0 && (
                        <button
                            onClick={prevOnboardingStep}
                            className="text-sm text-[#1CB0F6] font-bold"
                        >
                            ← Back
                        </button>
                    )}
                </div>
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center py-8">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </div>

            {/* Continue button */}
            <div className="px-6 pb-8 safe-area-bottom">
                <Button3D
                    variant="green"
                    fullWidth
                    size="lg"
                    onClick={handleNext}
                    disabled={!canContinue}
                >
                    {onboardingStep === steps.length - 1 ? "Let's Go! 🚀" : 'Continue'}
                </Button3D>
            </div>
        </div>
    );
};

export default Onboarding;
