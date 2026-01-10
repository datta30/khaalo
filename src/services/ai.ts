import type { User, MealPlan, DayPlan, AIScoreResponse } from '../types';
import { fallbackMealPlan } from '../data/fallbackPlan';

// API endpoints - these call Netlify Functions which securely handle the OpenAI API key
const API_BASE = '/.netlify/functions';

/**
 * Generate a 7-day meal plan using the secure serverless function
 */
export const generateMealPlan = async (user: User): Promise<DayPlan[]> => {
    try {
        const response = await fetch(`${API_BASE}/ai-meal-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        });

        if (!response.ok) {
            console.error('Meal plan API error:', response.status);
            return getFallbackPlan(user.region, user.goal);
        }

        const data = await response.json();

        if (data.days && Array.isArray(data.days)) {
            return data.days.map((day: any, index: number) => ({
                dayIndex: index,
                breakfast: {
                    ...day.breakfast,
                    id: `breakfast-${index}`,
                    type: 'breakfast' as const
                },
                snack: {
                    ...day.snack,
                    id: `snack-${index}`,
                    type: 'snack' as const
                },
                lunch: {
                    ...day.lunch,
                    id: `lunch-${index}`,
                    type: 'lunch' as const
                },
                dinner: {
                    ...day.dinner,
                    id: `dinner-${index}`,
                    type: 'dinner' as const
                },
                totalCalories: day.totalCalories ||
                    (day.breakfast?.calories || 0) +
                    (day.snack?.calories || 0) +
                    (day.lunch?.calories || 0) +
                    (day.dinner?.calories || 0)
            }));
        }

        return getFallbackPlan(user.region, user.goal);
    } catch (error) {
        console.error('Meal plan generation failed:', error);
        return getFallbackPlan(user.region, user.goal);
    }
};

/**
 * Score a food item using the secure serverless function
 */
export const scoreFoodItem = async (
    foodName: string,
    user: User | null
): Promise<AIScoreResponse | null> => {
    try {
        const response = await fetch(`${API_BASE}/ai-score-food`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                foodName,
                user: user ? {
                    goal: user.goal,
                    dailyCalories: user.dailyCalories
                } : null
            })
        });

        if (!response.ok) {
            console.error('Food scoring API error:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Food scoring failed:', error);
        return null;
    }
};

/**
 * Identify food from image using the secure serverless function
 */
export const identifyFoodFromImage = async (
    imageBase64: string
): Promise<{ name: string; confidence: number; calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number } | null> => {
    try {
        const response = await fetch(`${API_BASE}/ai-identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64 })
        });

        if (!response.ok) {
            console.error('Image identification API error:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Image identification failed:', error);
        return null;
    }
};

/**
 * Chat with AI assistant using the secure serverless function
 */
export interface ChatContext {
    user: User;
    currentPlan: MealPlan | null;
    completedMeals: string[];
    todayIndex: number;
    waterGlasses: number;
    waterGoal: number;
}

export const chatWithAssistant = async (
    message: string,
    conversationHistory: { role: string; content: string }[],
    context: ChatContext
): Promise<{ message: string } | null> => {
    try {
        const response = await fetch(`${API_BASE}/ai-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                conversationHistory,
                context
            })
        });

        if (!response.ok) {
            console.error('Chat API error:', response.status);
            return { message: "Sorry, I'm having trouble connecting right now. Please try again." };
        }

        return await response.json();
    } catch (error) {
        console.error('Chat failed:', error);
        return { message: "Sorry, I'm having trouble connecting right now. Please try again." };
    }
};

/**
 * Get fallback meal plan when API is unavailable
 */
const getFallbackPlan = (_region: string = 'north', goal: string = 'maintain'): DayPlan[] => {
    // Adjust fallback based on goal
    const calorieMultiplier = goal === 'lose' ? 0.85 : goal === 'gain' ? 1.15 : 1;

    return fallbackMealPlan.days.map((day, index) => ({
        ...day,
        dayIndex: index,
        breakfast: {
            ...day.breakfast,
            id: `breakfast-${index}`,
            type: 'breakfast' as const,
            calories: Math.round(day.breakfast.calories * calorieMultiplier)
        },
        snack: {
            ...day.snack,
            id: `snack-${index}`,
            type: 'snack' as const,
            calories: Math.round(day.snack.calories * calorieMultiplier)
        },
        lunch: {
            ...day.lunch,
            id: `lunch-${index}`,
            type: 'lunch' as const,
            calories: Math.round(day.lunch.calories * calorieMultiplier)
        },
        dinner: {
            ...day.dinner,
            id: `dinner-${index}`,
            type: 'dinner' as const,
            calories: Math.round(day.dinner.calories * calorieMultiplier)
        },
        totalCalories: Math.round(day.totalCalories * calorieMultiplier)
    }));
};
