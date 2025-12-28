import Dexie, { type EntityTable } from 'dexie';
import type { User, MealPlan, FoodLogEntry } from '../types';

// Define the database
const db = new Dexie('NeuroNourishDB') as Dexie & {
    users: EntityTable<User, 'id'>;
    mealPlans: EntityTable<MealPlan, 'id'>;
    foodLogs: EntityTable<FoodLogEntry, 'id'>;
};

// Schema definition
db.version(1).stores({
    users: 'id, name, createdAt',
    mealPlans: 'id, weekNumber, createdAt',
    foodLogs: 'id, mealType, loggedAt'
});

// User operations
export const saveUser = async (user: User): Promise<void> => {
    await db.users.put(user);
};

export const getUser = async (): Promise<User | undefined> => {
    return await db.users.toCollection().first();
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    await db.users.update(id, updates);
};

// Meal Plan operations
export const saveMealPlan = async (plan: MealPlan): Promise<void> => {
    await db.mealPlans.put(plan);
};

export const getMealPlan = async (weekNumber: number): Promise<MealPlan | undefined> => {
    return await db.mealPlans.where('weekNumber').equals(weekNumber).first();
};

export const getCurrentMealPlan = async (): Promise<MealPlan | undefined> => {
    return await db.mealPlans.toCollection().last();
};

// Food Log operations
export const logFood = async (entry: FoodLogEntry): Promise<void> => {
    await db.foodLogs.put(entry);
};

export const getTodaysLogs = async (): Promise<FoodLogEntry[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db.foodLogs
        .filter(log => new Date(log.loggedAt) >= today)
        .toArray();
};

export const getLogsByDate = async (date: Date): Promise<FoodLogEntry[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.foodLogs
        .filter(log => {
            const logDate = new Date(log.loggedAt);
            return logDate >= startOfDay && logDate <= endOfDay;
        })
        .toArray();
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
    await db.users.clear();
    await db.mealPlans.clear();
    await db.foodLogs.clear();
};

export { db };
