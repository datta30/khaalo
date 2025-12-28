import type { DayPlan, Meal, MealPlan } from '../types';

// Helper to generate unique IDs
const genId = () => Math.random().toString(36).substr(2, 9);

// Fallback meals - North Indian focus with some variety
const breakfastOptions: Meal[] = [
    {
        id: genId(),
        name: 'Poha & Chai',
        type: 'breakfast',
        calories: 280,
        protein: 8,
        carbs: 45,
        fat: 8,
        fiber: 4,
        sodium: 400,
        description: 'Flattened rice with peanuts, curry leaves, and masala chai',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Idli Sambar',
        type: 'breakfast',
        calories: 250,
        protein: 10,
        carbs: 48,
        fat: 3,
        fiber: 6,
        sodium: 600,
        description: 'Steamed rice cakes with lentil soup',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Paratha & Curd',
        type: 'breakfast',
        calories: 350,
        protein: 12,
        carbs: 42,
        fat: 15,
        fiber: 3,
        sodium: 500,
        description: 'Stuffed whole wheat flatbread with yogurt',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Upma & Coconut Chutney',
        type: 'breakfast',
        calories: 290,
        protein: 9,
        carbs: 40,
        fat: 10,
        fiber: 5,
        sodium: 450,
        description: 'Semolina porridge with vegetables',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Besan Chilla',
        type: 'breakfast',
        calories: 220,
        protein: 14,
        carbs: 28,
        fat: 8,
        fiber: 4,
        sodium: 300,
        description: 'Savory chickpea flour pancakes with vegetables',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Dosa & Sambar',
        type: 'breakfast',
        calories: 270,
        protein: 8,
        carbs: 42,
        fat: 8,
        fiber: 4,
        sodium: 650,
        description: 'Crispy fermented rice crepe with lentil soup',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Oats Cheela',
        type: 'breakfast',
        calories: 200,
        protein: 12,
        carbs: 30,
        fat: 5,
        fiber: 6,
        sodium: 250,
        description: 'Healthy oats pancake with vegetables',
        region: 'all'
    }
];

const snackOptions: Meal[] = [
    {
        id: genId(),
        name: 'Fruit Salad',
        type: 'snack',
        calories: 120,
        protein: 2,
        carbs: 28,
        fat: 1,
        fiber: 4,
        sodium: 50,
        description: 'Fresh seasonal fruits with chaat masala',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Roasted Chana',
        type: 'snack',
        calories: 150,
        protein: 10,
        carbs: 22,
        fat: 3,
        fiber: 6,
        sodium: 200,
        description: 'Crunchy roasted chickpeas with spices',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Sprouts Chaat',
        type: 'snack',
        calories: 140,
        protein: 9,
        carbs: 20,
        fat: 2,
        fiber: 5,
        sodium: 400,
        description: 'Mixed sprouts with onion, tomato, and lemon',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Makhana',
        type: 'snack',
        calories: 110,
        protein: 4,
        carbs: 18,
        fat: 3,
        fiber: 2,
        sodium: 150,
        description: 'Roasted fox nuts with light spices',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Buttermilk & Cucumber',
        type: 'snack',
        calories: 80,
        protein: 3,
        carbs: 8,
        fat: 2,
        fiber: 1,
        sodium: 500,
        description: 'Refreshing spiced buttermilk',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Dates & Almonds',
        type: 'snack',
        calories: 160,
        protein: 4,
        carbs: 25,
        fat: 6,
        fiber: 3,
        sodium: 20,
        description: 'Natural energy boost with healthy fats',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Masala Muri',
        type: 'snack',
        calories: 130,
        protein: 3,
        carbs: 24,
        fat: 3,
        fiber: 2,
        sodium: 600,
        description: 'Puffed rice with peanuts and vegetables',
        region: 'east'
    }
];

const lunchOptions: Meal[] = [
    {
        id: genId(),
        name: 'Rajma Chawal',
        type: 'lunch',
        calories: 450,
        protein: 18,
        carbs: 68,
        fat: 12,
        fiber: 10,
        sodium: 800,
        description: 'Kidney bean curry with steamed rice',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Curd Rice & Pickle',
        type: 'lunch',
        calories: 380,
        protein: 12,
        carbs: 58,
        fat: 10,
        fiber: 3,
        sodium: 500,
        description: 'Cooling yogurt rice, great for digestion',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Dal Tadka & Roti',
        type: 'lunch',
        calories: 400,
        protein: 16,
        carbs: 55,
        fat: 12,
        fiber: 8,
        sodium: 600,
        description: 'Tempered yellow lentils with whole wheat bread',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Sambar Rice & Papad',
        type: 'lunch',
        calories: 420,
        protein: 14,
        carbs: 65,
        fat: 10,
        fiber: 7,
        sodium: 750,
        description: 'Lentil vegetable stew with rice',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Chole & Bhature',
        type: 'lunch',
        calories: 550,
        protein: 16,
        carbs: 70,
        fat: 22,
        fiber: 10,
        sodium: 1100,
        description: 'Spiced chickpea curry with fried bread',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Khichdi & Kadhi',
        type: 'lunch',
        calories: 380,
        protein: 14,
        carbs: 55,
        fat: 10,
        fiber: 6,
        sodium: 450,
        description: 'Comfort food rice-lentil porridge with yogurt curry',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Vegetable Biryani',
        type: 'lunch',
        calories: 480,
        protein: 12,
        carbs: 70,
        fat: 16,
        fiber: 5,
        sodium: 700,
        description: 'Aromatic spiced rice with mixed vegetables',
        region: 'all'
    }
];

const dinnerOptions: Meal[] = [
    {
        id: genId(),
        name: 'Roti & Sabzi',
        type: 'dinner',
        calories: 380,
        protein: 12,
        carbs: 52,
        fat: 14,
        fiber: 8,
        sodium: 400,
        description: 'Whole wheat flatbread with seasonal vegetables',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Dal Fry & Rice',
        type: 'dinner',
        calories: 420,
        protein: 16,
        carbs: 62,
        fat: 12,
        fiber: 7,
        sodium: 550,
        description: 'Spiced lentils with steamed rice',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Paneer Bhurji & Roti',
        type: 'dinner',
        calories: 450,
        protein: 22,
        carbs: 40,
        fat: 22,
        fiber: 5,
        sodium: 850,
        description: 'Scrambled cottage cheese with spices',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Rasam Rice & Poriyal',
        type: 'dinner',
        calories: 350,
        protein: 10,
        carbs: 58,
        fat: 8,
        fiber: 6,
        sodium: 650,
        description: 'Light pepper soup rice with stir-fried vegetables',
        region: 'south'
    },
    {
        id: genId(),
        name: 'Palak Dal & Jeera Rice',
        type: 'dinner',
        calories: 400,
        protein: 18,
        carbs: 55,
        fat: 12,
        fiber: 9,
        sodium: 500,
        description: 'Spinach lentils with cumin-flavored rice',
        region: 'north'
    },
    {
        id: genId(),
        name: 'Moong Dal Cheela',
        type: 'dinner',
        calories: 280,
        protein: 16,
        carbs: 35,
        fat: 8,
        fiber: 6,
        sodium: 350,
        description: 'Light mung bean pancakes, easy to digest',
        region: 'all'
    },
    {
        id: genId(),
        name: 'Vegetable Soup & Toast',
        type: 'dinner',
        calories: 250,
        protein: 8,
        carbs: 38,
        fat: 6,
        fiber: 6,
        sodium: 300,
        description: 'Light dinner option for weight management',
        region: 'all'
    }
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Generate the 7-day plan
const generateDays = (): DayPlan[] => {
    return dayNames.map((dayName, index) => {
        const breakfast = breakfastOptions[index % breakfastOptions.length];
        const snack = snackOptions[index % snackOptions.length];
        const lunch = lunchOptions[index % lunchOptions.length];
        const dinner = dinnerOptions[index % dinnerOptions.length];

        return {
            day: index + 1,
            dayName,
            breakfast: { ...breakfast, id: genId() },
            snack: { ...snack, id: genId() },
            lunch: { ...lunch, id: genId() },
            dinner: { ...dinner, id: genId() },
            totalCalories: breakfast.calories + snack.calories + lunch.calories + dinner.calories
        };
    });
};

export const fallbackMealPlan: MealPlan = {
    id: 'fallback-plan-v1',
    weekNumber: 1,
    days: generateDays(),
    createdAt: new Date(),
    isAIGenerated: false
};

export default fallbackMealPlan;
