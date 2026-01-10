import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, MealPlan, FoodLogEntry, MealNode, Meal, DayPlan, ChatMessage } from '../types';
import { fallbackMealPlan } from '../data/fallbackPlan';

// Water reminder type
interface WaterReminder {
    id: string;
    time: string; // HH:MM format
    completed: boolean;
}

interface UserState {
    // User data
    user: User | null;
    isOnboarding: boolean;
    onboardingStep: number;

    // Meal plan
    currentPlan: MealPlan | null;
    todayIndex: number; // 0-6 for day of week

    // Extra snacks added by user
    extraSnacks: Meal[];

    // Progress tracking
    completedMeals: string[]; // IDs of completed meals today
    currentMealIndex: number; // 0+ (can grow with extra snacks)

    // Water tracking
    waterReminders: WaterReminder[];
    waterGlasses: number; // glasses drunk today
    waterGoal: number; // daily goal

    // Food logs
    todaysLogs: FoodLogEntry[];

    // Reward state
    dailyRewardClaimed: boolean;

    // Actions
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;

    // Onboarding
    startOnboarding: () => void;
    nextOnboardingStep: () => void;
    prevOnboardingStep: () => void;
    completeOnboarding: () => void;

    // Meal plan
    setMealPlan: (plan: MealPlan) => void;

    // Meal editing
    swapMeal: (mealType: 'breakfast' | 'snack' | 'lunch' | 'dinner', newMeal: Meal) => void;
    addExtraSnack: (snack: Meal, afterMealType: 'breakfast' | 'snack' | 'lunch') => void;
    removeExtraSnack: (snackId: string) => void;

    // Progress
    completeMeal: (mealId: string) => void;
    resetDailyProgress: () => void;
    resetApp: () => void;
    incrementStreak: () => void;

    // Water tracking
    drinkWater: () => void;
    resetWater: () => void;
    completeWaterReminder: (id: string) => void;

    // Food logging
    addFoodLog: (entry: FoodLogEntry) => void;

    // Daily Reward
    claimDailyReward: () => void;

    // Chat
    chatHistory: ChatMessage[];
    addChatMessage: (message: ChatMessage) => void;
    clearChatHistory: () => void;

    // Utilities
    getMealNodes: () => MealNode[];
    getCurrentDayPlan: () => DayPlan | null;
    getTodaysMeals: () => Meal[];
    getWaterProgress: () => number;
    getNutrientTargets: () => NutrientTargets;
    getNutrientTotals: () => NutrientTotals;
}

export interface NutrientTargets {
    calories: number;
    protein: number; // g
    carbs: number; // g
    fat: number; // g
    fiber: number; // g
    sodium: number; // mg
}

export interface NutrientTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
}

const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi: number): User['bmiCategory'] => {
    // Using Indian BMI thresholds
    if (bmi < 18.5) return 'underweight';
    if (bmi < 23) return 'normal';
    if (bmi < 25) return 'overweight';
    return 'obese';
};

const calculateDailyCalories = (user: Partial<User>): number => {
    if (!user.weight || !user.height || !user.age || !user.gender) return 1800;

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (user.gender === 'male') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }

    // Activity factor (sedentary)
    const tdee = bmr * 1.4;

    // Adjust based on goal
    switch (user.goal) {
        case 'lose':
            return Math.round(tdee - 500);
        case 'gain':
            return Math.round(tdee + 300);
        default:
            return Math.round(tdee);
    }
};

// Default water reminders throughout the day
const defaultWaterReminders: WaterReminder[] = [
    { id: 'w1', time: '08:00', completed: false },
    { id: 'w2', time: '10:00', completed: false },
    { id: 'w3', time: '12:00', completed: false },
    { id: 'w4', time: '14:00', completed: false },
    { id: 'w5', time: '16:00', completed: false },
    { id: 'w6', time: '18:00', completed: false },
    { id: 'w7', time: '20:00', completed: false },
    { id: 'w8', time: '22:00', completed: false },
];

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isOnboarding: false,
            onboardingStep: 0,
            currentPlan: null,
            todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
            completedMeals: [],
            currentMealIndex: 0,
            todaysLogs: [],
            extraSnacks: [],
            waterReminders: defaultWaterReminders,
            waterGlasses: 0,
            waterGoal: 8,
            dailyRewardClaimed: false,
            chatHistory: [],

            // User actions
            setUser: (user) => set({ user }),

            updateUser: (updates) => set((state) => {
                if (!state.user) return state;

                const newUser = { ...state.user, ...updates };

                if (updates.weight || updates.height) {
                    newUser.bmi = calculateBMI(newUser.weight, newUser.height);
                    newUser.bmiCategory = getBMICategory(newUser.bmi);
                }

                if (updates.weight || updates.height || updates.age || updates.gender || updates.goal) {
                    newUser.dailyCalories = calculateDailyCalories(newUser);
                }

                return { user: newUser };
            }),

            // Onboarding
            startOnboarding: () => set({
                isOnboarding: true,
                onboardingStep: 0,
                user: {
                    id: crypto.randomUUID(),
                    name: '',
                    gender: 'male',
                    age: 25,
                    weight: 70,
                    height: 170,
                    region: 'north',
                    goal: 'maintain',
                    bmi: 0,
                    bmiCategory: 'normal',
                    dailyCalories: 1800,
                    streak: 0,
                    onboardingComplete: false,
                    createdAt: new Date()
                }
            }),

            nextOnboardingStep: () => set((state) => ({
                onboardingStep: Math.min(state.onboardingStep + 1, 5)
            })),

            prevOnboardingStep: () => set((state) => ({
                onboardingStep: Math.max(state.onboardingStep - 1, 0)
            })),

            completeOnboarding: () => set((state) => {
                if (!state.user) return state;

                const bmi = calculateBMI(state.user.weight, state.user.height);

                return {
                    isOnboarding: false,
                    onboardingStep: 0,
                    user: {
                        ...state.user,
                        bmi,
                        bmiCategory: getBMICategory(bmi),
                        dailyCalories: calculateDailyCalories(state.user),
                        onboardingComplete: true,
                        streak: 1
                    },
                    currentPlan: fallbackMealPlan,
                    waterReminders: defaultWaterReminders,
                    waterGlasses: 0,
                    dailyRewardClaimed: false
                };
            }),

            // Meal plan
            setMealPlan: (plan) => set({ currentPlan: plan }),

            // Meal editing - swap a meal
            swapMeal: (mealType, newMeal) => set((state) => {
                if (!state.currentPlan) return state;

                const newDays = state.currentPlan.days.map((day, index) => {
                    if (index === state.todayIndex) {
                        return {
                            ...day,
                            [mealType]: { ...newMeal, type: mealType }
                        };
                    }
                    return day;
                });

                return {
                    currentPlan: {
                        ...state.currentPlan,
                        days: newDays
                    }
                };
            }),

            // Add an extra snack
            addExtraSnack: (snack, _afterMealType) => set((state) => ({
                extraSnacks: [...state.extraSnacks, { ...snack, id: crypto.randomUUID(), type: 'snack' }]
            })),

            // Remove extra snack
            removeExtraSnack: (snackId) => set((state) => ({
                extraSnacks: state.extraSnacks.filter(s => s.id !== snackId)
            })),

            // Progress
            completeMeal: (mealId) => set((state) => {
                const newCompleted = [...state.completedMeals, mealId];
                const totalMeals = 4 + state.extraSnacks.length;
                return {
                    completedMeals: newCompleted,
                    currentMealIndex: Math.min(state.currentMealIndex + 1, totalMeals - 1)
                };
            }),

            resetDailyProgress: () => set({
                completedMeals: [],
                currentMealIndex: 0,
                todaysLogs: [],
                extraSnacks: [],
                waterGlasses: 0,
                waterReminders: defaultWaterReminders,
                dailyRewardClaimed: false,
                todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
            }),

            resetApp: () => {
                // Clear the main storage key
                localStorage.removeItem('khaalo-storage');

                // Also clear any other potential lingering items
                localStorage.clear();
                sessionStorage.clear();

                // Reset in-memory state
                set({
                    user: null,
                    isOnboarding: true,
                    onboardingStep: 0,
                    currentPlan: null,
                    completedMeals: [],
                    currentMealIndex: 0,
                    todaysLogs: [],
                    extraSnacks: [],
                    waterGlasses: 0,
                    waterReminders: defaultWaterReminders,
                    dailyRewardClaimed: false,
                    todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
                });

                // Immediate reload is often more reliable than a delay
                window.location.reload();
            },

            incrementStreak: () => set((state) => ({
                user: state.user ? { ...state.user, streak: state.user.streak + 1 } : null
            })),

            // Water tracking
            drinkWater: () => set((state) => ({
                waterGlasses: Math.min(state.waterGlasses + 1, state.waterGoal + 4)
            })),

            resetWater: () => set({
                waterGlasses: 0,
                waterReminders: defaultWaterReminders
            }),

            completeWaterReminder: (id) => set((state) => ({
                waterReminders: state.waterReminders.map(r =>
                    r.id === id ? { ...r, completed: true } : r
                ),
                waterGlasses: state.waterGlasses + 1
            })),

            // Food logging
            addFoodLog: (entry) => set((state) => ({
                todaysLogs: [...state.todaysLogs, entry]
            })),

            // Chat actions
            addChatMessage: (message) => set((state) => ({
                chatHistory: [...state.chatHistory, message]
            })),

            clearChatHistory: () => set({ chatHistory: [] }),

            // Computed helpers
            getMealNodes: () => {
                const state = get();
                const dayPlan = state.getCurrentDayPlan();
                if (!dayPlan) return [];

                // Base meals only (no water nodes)
                const baseMeals: Meal[] = [dayPlan.breakfast, dayPlan.snack, dayPlan.lunch, dayPlan.dinner];
                const positions: ('left' | 'center' | 'right')[] = ['center', 'right', 'left', 'center'];

                const nodes: MealNode[] = [];
                let nodeIndex = 0;

                // Add all 4 meals
                baseMeals.forEach((meal, i) => {
                    nodes.push(createMealNode(meal, nodeIndex, positions[i], state));
                    nodeIndex++;
                });

                // Add any extra snacks
                state.extraSnacks.forEach((snack) => {
                    nodes.push(createMealNode(snack, nodeIndex, 'center', state));
                    nodeIndex++;
                });

                // Add Daily Reward node if all 4 main meals are completed
                const mainMealsCompleted = baseMeals.every(m => state.completedMeals.includes(m.id));
                if (mainMealsCompleted) {
                    nodes.push({
                        id: 'daily-reward',
                        meal: {
                            id: 'daily-reward-id',
                            name: 'Daily Cheat Reward! 🎁',
                            type: 'snack',
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                            fiber: 0,
                            sodium: 0,
                            description: 'You finished your plan! Enjoy a small cheat snack.',
                            region: 'all'
                        },
                        state: state.dailyRewardClaimed ? 'completed' : 'current',
                        stars: state.dailyRewardClaimed ? 3 : 0,
                        position: 'center'
                    });
                }

                return nodes;
            },

            getCurrentDayPlan: () => {
                const state = get();
                if (!state.currentPlan) return null;
                return state.currentPlan.days[state.todayIndex] || state.currentPlan.days[0];
            },

            getTodaysMeals: () => {
                const state = get();
                const dayPlan = state.getCurrentDayPlan();
                if (!dayPlan) return [];
                return [dayPlan.breakfast, dayPlan.snack, ...state.extraSnacks, dayPlan.lunch, dayPlan.dinner];
            },

            getWaterProgress: () => {
                const state = get();
                return Math.round((state.waterGlasses / state.waterGoal) * 100);
            },

            claimDailyReward: () => set({ dailyRewardClaimed: true }),

            getNutrientTargets: () => {
                const state = get();
                const user = state.user;
                if (!user) return { calories: 2000, protein: 100, carbs: 250, fat: 65, fiber: 25, sodium: 2300 };

                const cal = user.dailyCalories;
                return {
                    calories: cal,
                    protein: Math.round((cal * 0.20) / 4),
                    carbs: Math.round((cal * 0.50) / 4),
                    fat: Math.round((cal * 0.30) / 9),
                    fiber: 25,
                    sodium: 2300
                };
            },

            getNutrientTotals: () => {
                const state = get();
                return state.todaysLogs.reduce((acc, log) => ({
                    calories: acc.calories + log.foodItem.calories,
                    protein: acc.protein + log.foodItem.protein,
                    carbs: acc.carbs + log.foodItem.carbs,
                    fat: acc.fat + log.foodItem.fat,
                    fiber: acc.fiber + log.foodItem.fiber,
                    sodium: acc.sodium + (log.foodItem.sodium || 0)
                }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
            }
        }),
        {
            name: 'khaalo-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                currentPlan: state.currentPlan,
                completedMeals: state.completedMeals,
                currentMealIndex: state.currentMealIndex,
                todayIndex: state.todayIndex,
                extraSnacks: state.extraSnacks,
                waterGlasses: state.waterGlasses,
                waterReminders: state.waterReminders,
                dailyRewardClaimed: state.dailyRewardClaimed
            })
        }
    )
);

// Helper to create meal node
function createMealNode(meal: Meal, index: number, position: 'left' | 'center' | 'right', state: UserState): MealNode {
    const isCompleted = state.completedMeals.includes(meal.id);
    const isCurrent = index === state.currentMealIndex && !isCompleted;

    return {
        id: meal.id,
        meal,
        state: isCompleted ? 'completed' : isCurrent ? 'current' : 'locked',
        stars: isCompleted ? Math.floor(Math.random() * 2) + 2 : 0,
        position
    };
}
