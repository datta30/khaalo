import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { Button3D } from '../components/Button3D';
import { ScoreCard } from '../components/ScoreCard';
import { searchProducts, getFoodImage } from '../services/scanner';
import { scoreFoodItem, identifyFoodFromImage } from '../services/ai';
import type { FoodItem, FoodLogEntry } from '../types';

interface ScannerProps {
    onNavigate: (screen: 'home' | 'scanner' | 'profile' | 'streak' | 'rank') => void;
}

// Popular Indian foods with static Pexels images
const popularFoods = [
    { name: 'Paneer Butter Masala', imageUrl: 'https://images.pexels.com/photos/9609835/pexels-photo-9609835.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Rajma Chawal', imageUrl: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Chicken Biryani', imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Masala Dosa', imageUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Chole Bhature', imageUrl: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Dal Tadka', imageUrl: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Aloo Paratha', imageUrl: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { name: 'Samosa', imageUrl: 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export const Scanner: React.FC<ScannerProps> = ({ onNavigate }) => {
    const { user, addFoodLog, swapMeal, completeMeal, getCurrentDayPlan, completedMeals } = useUserStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Partial<FoodItem>[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [scoredFood, setScoredFood] = useState<FoodItem | null>(null);
    const [showScoreCard, setShowScoreCard] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showActionSelector, setShowActionSelector] = useState(false);

    // Search for foods
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const results = await searchProducts(searchQuery, 8);
            if (results.length === 0) {
                setSearchResults([{
                    name: searchQuery,
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0,
                    fiber: 0,
                    imageUrl: getFoodImage(searchQuery)
                }]);
            } else {
                // Add food images to results
                setSearchResults(results.map(r => ({
                    ...r,
                    imageUrl: r.imageUrl || getFoodImage(r.name || 'food')
                })));
            }
        } catch (err) {
            setError('Failed to search. Try again.');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsIdentifying(true);
        setError(null);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                // Send to GPT for identification
                const result = await identifyFoodFromImage(base64);

                if (result) {
                    // Automatically score the identified food
                    if (user) {
                        const scores = await scoreFoodItem(result.name, user);
                        setScoredFood({
                            id: crypto.randomUUID(),
                            name: result.name,
                            calories: result.estimatedCalories,
                            protein: result.estimatedProtein,
                            fat: result.estimatedFat,
                            carbs: result.estimatedCarbs,
                            fiber: 0,
                            goalFitScore: scores.goalFitScore,
                            gutHealthScore: scores.gutHealthScore,
                            goalFitReason: scores.goalFitReason,
                            gutHealthReason: scores.gutHealthReason,
                            imageUrl: base64,
                            cuisine: result.cuisine,
                            sodium: result.estimatedSodium || 800
                        });
                        setShowScoreCard(true);
                    }
                } else {
                    setError('Could not identify food. Try a clearer image.');
                }

                setIsIdentifying(false);
            };

            reader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to process image.');
            setIsIdentifying(false);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Score a food item
    const handleSelectFood = async (food: Partial<FoodItem> | { name: string }) => {
        if (!user) return;

        setIsScoring(true);
        setError(null);

        try {
            const foodName = food.name || 'Unknown Food';
            const scores = await scoreFoodItem(foodName, user);

            const fullFood: FoodItem = {
                id: crypto.randomUUID(),
                name: foodName,
                barcode: 'barcode' in food ? food.barcode : undefined,
                calories: 'calories' in food && food.calories ? food.calories : Math.floor(Math.random() * 300) + 200,
                protein: 'protein' in food && food.protein ? food.protein : Math.floor(Math.random() * 20) + 5,
                fat: 'fat' in food && food.fat ? food.fat : Math.floor(Math.random() * 20) + 5,
                carbs: 'carbs' in food && food.carbs ? food.carbs : Math.floor(Math.random() * 40) + 20,
                fiber: 'fiber' in food && food.fiber ? food.fiber : Math.floor(Math.random() * 10) + 2,
                goalFitScore: scores.goalFitScore,
                gutHealthScore: scores.gutHealthScore,
                goalFitReason: scores.goalFitReason,
                gutHealthReason: scores.gutHealthReason,
                imageUrl: 'imageUrl' in food ? food.imageUrl : getFoodImage(foodName),
                cuisine: 'cuisine' in food ? food.cuisine : 'Indian',
                sodium: 'sodium' in food && typeof food.sodium === 'number' ? food.sodium : 400,
                servingSize: scores.suggestedServingSize || '1 serving'
            };

            setScoredFood(fullFood);
            setShowScoreCard(true);
        } catch (err) {
            setError('Failed to analyze food. Try again.');
        } finally {
            setIsScoring(false);
        }
    };

    // Add to log - showing selector first
    const handleAddToLog = () => {
        setShowActionSelector(true);
    };

    const handleConfirmLog = (action: 'snack' | 'replace-current' | 'replace-next') => {
        if (!scoredFood || !user) return;

        const dayPlan = getCurrentDayPlan();
        if (!dayPlan) return;

        const mealTypes: ('breakfast' | 'snack' | 'lunch' | 'dinner')[] = ['breakfast', 'snack', 'lunch', 'dinner'];
        const completedIds = completedMeals;

        let targetType: 'breakfast' | 'snack' | 'lunch' | 'dinner' = 'snack';
        let isReplacement = false;

        if (action === 'replace-current') {
            // Find first uncompleted meal
            const currentType = mealTypes.find(type => !completedIds.includes(dayPlan[type].id)) || 'snack';
            targetType = currentType;
            isReplacement = true;
        } else if (action === 'replace-next') {
            // Find second uncompleted meal
            const uncompleted = mealTypes.filter(type => !completedIds.includes(dayPlan[type].id));
            targetType = uncompleted[1] || uncompleted[0] || 'snack';
            isReplacement = true;
        }

        const newMeal: FoodLogEntry = {
            id: crypto.randomUUID(),
            foodItem: scoredFood,
            mealType: targetType,
            quantity: 1,
            loggedAt: new Date()
        };

        if (isReplacement) {
            const mealToReplaceId = dayPlan[targetType].id;
            swapMeal(targetType, {
                ...scoredFood,
                id: crypto.randomUUID(),
                type: targetType,
                description: `Replaced with ${scoredFood.name}`,
                region: 'all'
            });
            completeMeal(mealToReplaceId);
        } else {
            addFoodLog(newMeal);
        }

        setShowActionSelector(false);
        setShowScoreCard(false);
        setScoredFood(null);
        setSearchQuery('');
        setSearchResults([]);
        onNavigate('home');
    };

    return (
        <div className="h-full bg-white flex flex-col">
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
                    <h1 className="text-xl font-bold text-gray-800">Food Scanner</h1>
                </div>
            </header>

            {/* Image Upload Section */}
            <div className="px-4 py-4 border-b border-gray-100">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 bg-gradient-to-br from-[#58CC02]/10 to-[#58CC02]/5 border-2 border-dashed border-[#58CC02]/40 rounded-2xl flex flex-col items-center gap-3 hover:border-[#58CC02] transition-all"
                >
                    <div className="w-16 h-16 bg-[#58CC02] rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-[#58CC02]">Take Photo or Upload</p>
                        <p className="text-sm text-gray-500">GPT will identify your food instantly</p>
                    </div>
                </motion.button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Or search for food..."
                        className="w-full px-4 py-3 pl-12 bg-gray-100 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58CC02] focus:bg-white transition-all"
                    />
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {searchQuery && (
                    <Button3D
                        variant="green"
                        fullWidth
                        className="mt-3"
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </Button3D>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="px-4 mb-4">
                    <h3 className="text-sm font-bold text-gray-500 mb-3">SEARCH RESULTS</h3>
                    <div className="space-y-2">
                        {searchResults.map((food, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelectFood(food)}
                                className="w-full p-3 bg-gray-50 rounded-2xl flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img
                                        src={food.imageUrl || getFoodImage(food.name || 'food')}
                                        alt={food.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://source.unsplash.com/100x100/?indian,food';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-gray-800 block truncate">{food.name}</span>
                                    {food.calories ? (
                                        <span className="text-sm text-gray-400">{food.calories} kcal</span>
                                    ) : (
                                        <span className="text-sm text-[#58CC02]">Tap to analyze with AI</span>
                                    )}
                                </div>
                                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Foods with Images */}
            {searchResults.length === 0 && (
                <div className="flex-1 px-4 overflow-y-auto pb-4">
                    <h3 className="text-sm font-bold text-gray-500 mb-3">POPULAR INDIAN FOODS</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {popularFoods.map((food, index) => (
                            <motion.button
                                key={food.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelectFood(food)}
                                className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all"
                            >
                                <div className="relative h-24 bg-gray-200">
                                    <img
                                        src={food.imageUrl}
                                        alt={food.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="absolute bottom-2 left-2 right-2 font-bold text-white text-sm">
                                        {food.name}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading overlays */}
            {(isScoring || isIdentifying) && (
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
                            {isIdentifying ? '📸' : '🔍'}
                        </motion.div>
                        <span className="font-semibold text-gray-700">
                            {isIdentifying ? 'AI identifying food...' : 'Analyzing food...'}
                        </span>
                    </motion.div>
                </div>
            )}

            {/* Score Card */}
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

            {/* Action Selector Modal */}
            <AnimatePresence>
                {showActionSelector && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-[60]"
                            onClick={() => setShowActionSelector(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] max-w-[430px] mx-auto"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">How to add this?</h3>
                            <p className="text-sm text-gray-500 mb-6 text-center">Would you like to replace a meal in your plan or add this as extra?</p>

                            <div className="space-y-3 pb-safe">
                                <Button3D variant="green" fullWidth onClick={() => handleConfirmLog('replace-current')}>
                                    Replace Current Planned Meal
                                </Button3D>
                                <Button3D variant="orange" fullWidth onClick={() => handleConfirmLog('snack')}>
                                    Add as Extra Snack
                                </Button3D>
                                <Button3D variant="gray" fullWidth onClick={() => handleConfirmLog('replace-next')}>
                                    Replace Next Planned Meal
                                </Button3D>
                                <button
                                    onClick={() => setShowActionSelector(false)}
                                    className="w-full py-3 text-gray-400 font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
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
                <button className="flex flex-col items-center gap-1 text-[#58CC02]">
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-bold">Scan</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
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
        </div>
    );
};

export default Scanner;
