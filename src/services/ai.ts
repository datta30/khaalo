import type { User, DayPlan, AIScoreResponse } from '../types';
import { fallbackMealPlan } from '../data/fallbackPlan';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o'; // Using GPT-4o (gpt-5.1 doesn't exist yet)

/**
 * Get API key from environment
 */
const getApiKey = (): string | null => {
    return import.meta.env.VITE_OPENAI_API_KEY || null;
};

/**
 * Generate a 7-day meal plan using OpenAI GPT-5.1
 */
export const generateMealPlan = async (user: User): Promise<DayPlan[]> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.log('No OpenAI API key found, using fallback plan');
        return getFallbackPlan(user.region, user.goal);
    }

    const prompt = buildMealPlanPrompt(user);

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert Indian nutritionist. Generate meal plans in strict JSON format. Focus on regional Indian cuisine that is healthy, balanced, and achievable for home cooking.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            console.error('OpenAI API error:', response.status);
            return getFallbackPlan(user.region, user.goal);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return getFallbackPlan(user.region, user.goal);
        }

        const parsed = JSON.parse(content);
        return parsed.days || getFallbackPlan(user.region, user.goal);

    } catch (error) {
        console.error('Error generating meal plan:', error);
        return getFallbackPlan(user.region, user.goal);
    }
};

/**
 * Score a food item for goal fit and gut health using GPT-5.1
 */
export const scoreFoodItem = async (
    foodName: string,
    user: User
): Promise<AIScoreResponse> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        return getDefaultScores(foodName, user.goal);
    }

    const prompt = `
    Analyze this food for an Indian user:
    Food: ${foodName}
    User Goal: ${user.goal === 'lose' ? 'Weight Loss' : user.goal === 'gain' ? 'Muscle Gain' : 'Maintain Weight'}
    BMI Category: ${user.bmiCategory}
    
    Respond in JSON with:
    {
      "goalFitScore": <0-10 score based on how well this fits their goal>,
      "gutHealthScore": <0-10 score based on digestibility and gut health>,
      "goalFitReason": "<short reason for goal fit score>",
      "gutHealthReason": "<short reason for gut health score>",
      "suggestedServingSize": "<recommended serving size, e.g. '1 bowl (200g)', '2 rotis', '1 plate'>"
    }
  `;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a nutrition expert. Provide scores and brief explanations in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            return getDefaultScores(foodName, user.goal);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return getDefaultScores(foodName, user.goal);
        }

        return JSON.parse(content);

    } catch (error) {
        console.error('Error scoring food:', error);
        return getDefaultScores(foodName, user.goal);
    }
};

/**
 * Identify food from an image using GPT-5.1 Vision
 */
export interface FoodIdentificationResult {
    name: string;
    cuisine: string;
    estimatedCalories: number;
    estimatedProtein: number;
    estimatedFat: number;
    estimatedCarbs: number;
    estimatedSodium: number;
    confidence: number;
}

export const identifyFoodFromImage = async (imageBase64: string): Promise<FoodIdentificationResult | null> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.log('No API key for image recognition');
        return null;
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a food recognition expert specializing in Indian cuisine. Identify foods from images and provide nutritional estimates. Always respond in valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Identify this food and provide nutritional information. Respond ONLY in this exact JSON format:
{
  "name": "<specific food name>",
  "cuisine": "<cuisine type, e.g. North Indian, South Indian, etc>",
  "estimatedCalories": <number>,
  "estimatedProtein": <grams>,
  "estimatedFat": <grams>,
  "estimatedCarbs": <grams>,
  "estimatedSodium": <mg>,
  "confidence": <0-1 confidence score>
}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Vision API error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return null;
        }

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonStr = content;
        if (content.includes('```')) {
            jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Error identifying food from image:', error);
        return null;
    }
};

/**
 * Build the meal plan prompt
 */
const buildMealPlanPrompt = (user: User): string => {
    const goalText = user.goal === 'lose'
        ? `weight loss with ${user.dailyCalories} calories/day (caloric deficit)`
        : user.goal === 'gain'
            ? `muscle gain with ${user.dailyCalories} calories/day (caloric surplus)`
            : `maintaining weight with ${user.dailyCalories} calories/day`;

    const regionText = {
        north: 'North Indian (Punjabi, Delhi, UP style)',
        south: 'South Indian (Tamil, Kerala, Karnataka style)',
        east: 'East Indian (Bengali, Odia style)',
        west: 'West Indian (Gujarati, Maharashtrian style)'
    }[user.region];

    return `
    Generate a 7-day Indian meal plan in JSON format.
    
    User Profile:
    - Goal: ${goalText}
    - Region Preference: ${regionText}
    - BMI: ${user.bmi.toFixed(1)} (${user.bmiCategory})
    
    Requirements:
    - 4 meals per day: breakfast, snack, lunch, dinner
    - Include regional dishes the user would enjoy
    - Balance macros appropriately for their goal
    - Use common Indian ingredients
    
    JSON structure:
    {
      "days": [
        {
          "day": 1,
          "dayName": "Monday",
          "breakfast": {
            "id": "unique-id",
            "name": "Dish Name",
            "type": "breakfast",
            "calories": 300,
            "protein": 15,
            "carbs": 40,
            "fat": 10,
            "fiber": 5,
            "description": "Brief description",
            "region": "north"
          },
          "snack": {...},
          "lunch": {...},
          "dinner": {...},
          "totalCalories": 1800
        }
      ]
    }
  `;
};

/**
 * Get fallback plan based on region and goal
 */
const getFallbackPlan = (_region: User['region'], _goal: User['goal']): DayPlan[] => {
    // TODO: Implement region/goal filtering
    return fallbackMealPlan.days;
};

/**
 * Get default scores when AI is unavailable
 */
const getDefaultScores = (foodName: string, goal: User['goal']): AIScoreResponse => {
    const lowerName = foodName.toLowerCase();

    let goalFitScore = 6;
    let gutHealthScore = 6;
    let goalFitReason = 'Moderate fit for your goal.';
    let gutHealthReason = 'Generally okay for digestion.';

    if (lowerName.includes('salad') || lowerName.includes('vegetable') || lowerName.includes('sabzi')) {
        goalFitScore = goal === 'lose' ? 9 : 7;
        gutHealthScore = 8;
        goalFitReason = goal === 'lose' ? 'Low calorie, high fiber!' : 'Nutritious choice.';
        gutHealthReason = 'High fiber supports gut health.';
    } else if (lowerName.includes('fried') || lowerName.includes('pakora') || lowerName.includes('samosa')) {
        goalFitScore = goal === 'lose' ? 3 : 5;
        gutHealthScore = 4;
        goalFitReason = 'High in calories and oil.';
        gutHealthReason = 'Fried foods can be hard to digest.';
    } else if (lowerName.includes('dal') || lowerName.includes('lentil')) {
        goalFitScore = 8;
        gutHealthScore = 7;
        goalFitReason = 'Great protein source!';
        gutHealthReason = 'May cause bloating for some.';
    } else if (lowerName.includes('paneer') || lowerName.includes('cheese')) {
        goalFitScore = goal === 'gain' ? 8 : 5;
        gutHealthScore = 5;
        goalFitReason = goal === 'gain' ? 'Great for muscle gain!' : 'High in fat and calories.';
        gutHealthReason = 'Heavy on dairy. May cause bloating.';
    } else if (lowerName.includes('water')) {
        goalFitScore = 10;
        gutHealthScore = 10;
        goalFitReason = 'Essential for health!';
        gutHealthReason = 'Perfect for hydration.';
    }

    return { goalFitScore, gutHealthScore, goalFitReason, gutHealthReason };
};
