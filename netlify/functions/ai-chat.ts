import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

// Define available functions the AI can call
const AVAILABLE_FUNCTIONS = [
    {
        name: "swap_meal",
        description: "Replace a meal in the user's plan with a different dish",
        parameters: {
            type: "object",
            properties: {
                meal_type: {
                    type: "string",
                    enum: ["breakfast", "snack", "lunch", "dinner"],
                    description: "Which meal to swap"
                },
                new_meal_name: {
                    type: "string",
                    description: "Name of the new Indian dish to replace with"
                },
                reason: {
                    type: "string",
                    description: "Brief reason for the swap suggestion"
                }
            },
            required: ["meal_type", "new_meal_name"]
        }
    },
    {
        name: "update_goal",
        description: "Change the user's health goal",
        parameters: {
            type: "object",
            properties: {
                new_goal: {
                    type: "string",
                    enum: ["lose", "maintain", "gain"],
                    description: "The new health goal"
                }
            },
            required: ["new_goal"]
        }
    },
    {
        name: "log_water",
        description: "Add a glass of water to today's intake",
        parameters: {
            type: "object",
            properties: {
                glasses: {
                    type: "number",
                    description: "Number of glasses to log (default 1)"
                }
            }
        }
    },
    {
        name: "get_nutrition_info",
        description: "Get detailed nutrition information for a specific Indian food",
        parameters: {
            type: "object",
            properties: {
                food_name: {
                    type: "string",
                    description: "Name of the Indian food item"
                }
            },
            required: ["food_name"]
        }
    }
];

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    try {
        const { message, conversationHistory, context } = JSON.parse(event.body || '{}');

        if (!message) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message required' }) };
        }

        // Build comprehensive system prompt with user context
        let systemPrompt = `You are Khaalo Assistant, a friendly and knowledgeable Indian food nutrition expert. You help users with their meal planning, nutrition questions, and health goals.

CAPABILITIES:
- You can SWAP meals in the user's plan using the swap_meal function
- You can UPDATE the user's health goal using update_goal function
- You can LOG water intake using log_water function
- You can PROVIDE nutrition info using get_nutrition_info function

PERSONALITY:
- Be warm, encouraging, and culturally aware
- Use occasional Hindi food terms (with English explanations)
- Give specific, actionable advice
- Celebrate small wins and healthy choices

RULES:
- When user asks to change/swap a meal, USE the swap_meal function
- When user mentions drinking water, offer to log it with log_water
- When user wants to change their goal, use update_goal
- Always explain WHY you're making a suggestion
`;

        if (context?.user) {
            const user = context.user;
            systemPrompt += `
USER PROFILE:
- Name: ${user.name || 'Friend'}
- Goal: ${user.goal || 'maintain'} weight
- Daily calories: ${user.dailyCalories || 2000}
- Cuisine preference: ${user.region || 'pan-Indian'}
- Current streak: ${user.streak || 0} days

TODAY'S PROGRESS:
- Calories consumed: ${context.todaysCalories || 0} / ${user.dailyCalories || 2000}
- Water: ${context.waterGlasses || 0} / 8 glasses
- Meals completed: ${context.completedMeals?.length || 0} / 4
`;
        }

        if (context?.currentPlan?.days?.[0]) {
            const today = context.currentPlan.days[0];
            systemPrompt += `
TODAY'S MEAL PLAN:
- Breakfast: ${today.breakfast?.name || 'Not set'} (${today.breakfast?.calories || 0} cal)
- Snack: ${today.snack?.name || 'Not set'} (${today.snack?.calories || 0} cal)
- Lunch: ${today.lunch?.name || 'Not set'} (${today.lunch?.calories || 0} cal)
- Dinner: ${today.dinner?.name || 'Not set'} (${today.dinner?.calories || 0} cal)
`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(conversationHistory || []).slice(-10), // Keep last 10 messages for context
            { role: 'user', content: message }
        ];

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                functions: AVAILABLE_FUNCTIONS,
                function_call: 'auto',
                temperature: 0.7,
                max_tokens: 500
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: 'AI service error', details: errorText })
            };
        }

        const data = await response.json();
        const choice = data.choices[0];

        // Check if the AI wants to call a function
        if (choice.message.function_call) {
            const functionCall = choice.message.function_call;
            const functionArgs = JSON.parse(functionCall.arguments || '{}');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: choice.message.content || '',
                    action: {
                        type: functionCall.name,
                        params: functionArgs
                    }
                })
            };
        }

        // Regular text response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: choice.message.content || 'I apologize, I could not generate a response.',
                action: null
            })
        };

    } catch (error) {
        console.error('Chat error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process chat', message: String(error) })
        };
    }
};

export { handler };
