import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
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
        const { user } = JSON.parse(event.body || '{}');

        if (!user) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'User data required' }) };
        }

        // Calculate calorie needs
        const bmr = user.gender === 'male'
            ? 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age)
            : 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);

        const activityMultipliers: Record<string, number> = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9
        };

        const tdee = bmr * (activityMultipliers[user.activityLevel] || 1.55);
        let targetCalories = Math.round(tdee);

        if (user.goal === 'lose') targetCalories -= 500;
        else if (user.goal === 'gain') targetCalories += 300;

        const cuisineMap: Record<string, string> = {
            north: 'North Indian (Punjabi, Rajasthani)',
            south: 'South Indian (Tamil, Kerala, Karnataka)',
            east: 'East Indian (Bengali, Odia)',
            west: 'West Indian (Gujarati, Maharashtrian)'
        };

        const prompt = `Generate a 7-day Indian meal plan for:
- Daily calories: ${targetCalories}
- Goal: ${user.goal === 'lose' ? 'weight loss' : user.goal === 'gain' ? 'muscle gain' : 'maintenance'}
- Cuisine preference: ${cuisineMap[user.cuisinePreference] || 'Mixed Indian'}
- Include traditional Indian dishes with proper nutrition data

Return a JSON object with this EXACT structure:
{
  "days": [
    {
      "dayIndex": 0,
      "dayName": "Monday",
      "breakfast": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sodium": number, "servingSize": "string" },
      "snack": { same structure },
      "lunch": { same structure },
      "dinner": { same structure },
      "totalCalories": number
    }
  ]
}

IMPORTANT:
- All nutrition values must be realistic numbers
- Include 7 days (dayIndex 0-6)
- Vary dishes across days
- Include fiber and sodium for gut health scoring`;

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are a nutrition expert specializing in Indian cuisine. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        const mealPlan = JSON.parse(content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(mealPlan)
        };

    } catch (error) {
        console.error('Meal plan generation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to generate meal plan' })
        };
    }
};

export { handler };
