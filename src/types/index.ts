// User Profile
export interface User {
    id: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    weight: number; // kg
    height: number; // cm
    region: 'north' | 'south' | 'east' | 'west';
    goal: 'lose' | 'maintain' | 'gain';
    bmi: number;
    bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
    dailyCalories: number;
    streak: number;
    onboardingComplete: boolean;
    createdAt: Date;
}

// Single Meal
export interface Meal {
    id: string;
    name: string;
    type: 'breakfast' | 'snack' | 'lunch' | 'dinner';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number; // mg
    servingSize?: string; // e.g., "1 bowl (250g)", "2 pieces"
    imageUrl?: string;
    description: string;
    region: 'north' | 'south' | 'east' | 'west' | 'all';
}

// Daily Plan
export interface DayPlan {
    day: number; // 1-7
    dayName: string;
    breakfast: Meal;
    snack: Meal;
    lunch: Meal;
    dinner: Meal;
    totalCalories: number;
}

// Weekly Meal Plan
export interface MealPlan {
    id: string;
    weekNumber: number;
    days: DayPlan[];
    createdAt: Date;
    isAIGenerated: boolean;
}

// Food Item (from scanner or search)
export interface FoodItem {
    id: string;
    name: string;
    barcode?: string;
    brand?: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sodium: number; // mg
    servingSize?: string; // e.g., "1 plate", "200g"
    goalFitScore: number; // 0-10
    gutHealthScore: number; // 0-10
    goalFitReason: string;
    gutHealthReason: string;
    imageUrl?: string;
    cuisine?: string;
}

// Food Log Entry
export interface FoodLogEntry {
    id: string;
    foodItem: FoodItem;
    mealType: 'breakfast' | 'snack' | 'lunch' | 'dinner';
    quantity: number;
    loggedAt: Date;
}

// Meal Node State for Game Path
export type MealNodeState = 'completed' | 'current' | 'locked';

export interface MealNode {
    id: string;
    meal: Meal;
    state: MealNodeState;
    stars: number; // 0-3 stars for completed
    position: 'left' | 'center' | 'right';
}

// Onboarding Step
export interface OnboardingStep {
    id: number;
    title: string;
    type: 'name' | 'gender' | 'age' | 'measurements' | 'region' | 'goal';
}

// API Response Types
export interface OpenFoodFactsProduct {
    product_name: string;
    brands?: string;
    nutriments: {
        'energy-kcal_100g'?: number;
        proteins_100g?: number;
        fat_100g?: number;
        carbohydrates_100g?: number;
        fiber_100g?: number;
    };
    image_url?: string;
}

export interface AIScoreResponse {
    goalFitScore: number;
    gutHealthScore: number;
    goalFitReason: string;
    gutHealthReason: string;
    suggestedServingSize?: string;
}

export interface AIMealPlanResponse {
    days: DayPlan[];
}

// Chat Message
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    action?: ChatAction;
}

// Chat Action (when chatbot performs an operation)
export interface ChatAction {
    type: 'swap_meal' | 'update_goal' | 'update_calories' | 'suggest_meal';
    params: any;
    status: 'pending' | 'completed' | 'failed';
    result?: string;
}

// Swap Badge for meal replacement suggestions
export type SwapBadge = 'healthier' | 'tastier' | 'lighter' | 'protein' | 'fiber' | 'energy';

export interface SwapSuggestion {
    food: IndianFood;
    badge: SwapBadge;
    badgeLabel: string;
    badgeEmoji: string;
    reason: string;
}

// Indian Food from database
export interface IndianFood {
    code: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    source: string;
}
