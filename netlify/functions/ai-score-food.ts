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
        const { foodName, user } = JSON.parse(event.body || '{}');

        if (!foodName) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Food name required' }) };
        }

        const prompt = `Analyze this Indian food item: "${foodName}"

User context:
- Goal: ${user?.goal || 'maintain'} weight
- Daily calorie target: ${user?.dailyCalories || 2000}

Provide a JSON response with:
{
  "goalFitScore": number (1-100, how well it fits user's goal),
  "gutHealthScore": number (1-100, based on fiber, probiotics, etc),
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sodium": number (mg),
  "suggestedServingSize": "string",
  "warnings": ["string array of health concerns if any"],
  "benefits": ["string array of health benefits"],
  "tips": "personalized tip for the user"
}`;

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are a nutrition expert. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const scores = JSON.parse(content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(scores)
        };

    } catch (error) {
        console.error('Food scoring error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to score food' })
        };
    }
};

export { handler };
