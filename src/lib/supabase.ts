import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Database types
export interface DbUser {
    id: string;
    clerk_id: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    age: number | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
    goal: 'lose' | 'maintain' | 'gain' | null;
    activity_level: string | null;
    cuisine_preference: string | null;
    created_at: string;
}

export interface DbMealPlan {
    id: string;
    user_id: string;
    week_start: string;
    is_ai_generated: boolean;
    created_at: string;
}

export interface DbDailyMeal {
    id: string;
    plan_id: string;
    day_index: number;
    breakfast: Record<string, any>;
    snack: Record<string, any>;
    lunch: Record<string, any>;
    dinner: Record<string, any>;
    completed_meals: string[];
}

export interface DbFoodLog {
    id: string;
    user_id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    logged_at: string;
}

export interface DbDailyProgress {
    id: string;
    user_id: string;
    date: string;
    water_glasses: number;
    streak_count: number;
    reward_claimed: boolean;
}

// Helper functions
export const saveUserToDb = async (clerkId: string, userData: Partial<DbUser>) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('users')
        .upsert({ clerk_id: clerkId, ...userData }, { onConflict: 'clerk_id' })
        .select()
        .single();

    if (error) {
        console.error('Error saving user:', error);
        return null;
    }
    return data;
};

export const getUserFromDb = async (clerkId: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return data as DbUser;
};

export const saveMealPlan = async (userId: string, weekStart: string, days: any[]) => {
    if (!supabase) return null;

    // Create meal plan
    const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .insert({ user_id: userId, week_start: weekStart })
        .select()
        .single();

    if (planError) {
        console.error('Error saving meal plan:', planError);
        return null;
    }

    // Create daily meals
    const dailyMeals = days.map((day, index) => ({
        plan_id: planData.id,
        day_index: index,
        breakfast: day.breakfast,
        snack: day.snack,
        lunch: day.lunch,
        dinner: day.dinner,
        completed_meals: []
    }));

    const { error: mealsError } = await supabase
        .from('daily_meals')
        .insert(dailyMeals);

    if (mealsError) {
        console.error('Error saving daily meals:', mealsError);
        return null;
    }

    return planData;
};

export const getCurrentMealPlan = async (userId: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('meal_plans')
        .select(`
            *,
            daily_meals(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching meal plan:', error);
        return null;
    }
    return data;
};

export const updateDailyProgress = async (userId: string, date: string, progress: Partial<DbDailyProgress>) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('daily_progress')
        .upsert({ user_id: userId, date, ...progress }, { onConflict: 'user_id,date' })
        .select()
        .single();

    if (error) {
        console.error('Error updating progress:', error);
        return null;
    }
    return data;
};
