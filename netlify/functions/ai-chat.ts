import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

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

        // Build context-aware system prompt
        let systemPrompt = `You are Khaalo Assistant, a friendly nutrition expert for Indian food. Be concise and helpful.`;

        if (context?.user) {
            const { user, currentPlan, completedMeals, waterGlasses, waterGoal } = context;
            const bmi = user.weight / ((user.height / 100) ** 2);

            systemPrompt += `

User Profile:
- Name: ${user.name}
- Age: ${user.age}, ${user.gender}
- Height: ${user.height}cm, Weight: ${user.weight}kg
- BMI: ${bmi.toFixed(1)} (${bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'})
- Goal: ${user.goal === 'lose' ? 'Lose weight' : user.goal === 'gain' ? 'Gain muscle' : 'Maintain'}
- Daily calorie target: ~${user.dailyCalories || 2000}

Today's Progress:
- Water: ${waterGlasses}/${waterGoal} glasses
- Completed meals: ${completedMeals?.length || 0}`;

            if (currentPlan?.days) {
                const today = currentPlan.days[context.todayIndex || 0];
                if (today) {
                    systemPrompt += `

Today's Meal Plan:
- Breakfast: ${today.breakfast?.name} (${today.breakfast?.calories} cal)
- Snack: ${today.snack?.name} (${today.snack?.calories} cal)
- Lunch: ${today.lunch?.name} (${today.lunch?.calories} cal)
- Dinner: ${today.dinner?.name} (${today.dinner?.calories} cal)`;
                }
            }
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(conversationHistory || []),
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
                temperature: 0.7,
                max_tokens: 500
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: assistantMessage })
        };

    } catch (error) {
        console.error('Chat error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to get response' })
        };
    }
};

export { handler };
