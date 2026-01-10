import type { FoodItem, OpenFoodFactsProduct, IndianFood, SwapSuggestion, SwapBadge, Meal } from '../types';
import { indianFoodsDB } from '../data/indianFoods';

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Search Indian food database (local, fast)
 */
export const searchIndianFoods = (query: string, limit: number = 10): IndianFood[] => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return indianFoodsDB
        .filter(food => food.name.toLowerCase().includes(searchTerm))
        .slice(0, limit);
};

/**
 * Get swap suggestions with badges for a meal
 */
export const getSwapSuggestions = (currentMeal: Meal, _mealType: 'breakfast' | 'snack' | 'lunch' | 'dinner'): SwapSuggestion[] => {
    const suggestions: SwapSuggestion[] = [];
    const currentCal = currentMeal.calories;

    // Define badge criteria and find matching foods
    const badgeCriteria: { badge: SwapBadge; emoji: string; label: string; filter: (f: IndianFood) => boolean; reason: string }[] = [
        {
            badge: 'healthier',
            emoji: '🥗',
            label: 'Healthier',
            filter: (f) => f.calories < currentCal * 0.8 && f.protein > currentMeal.protein,
            reason: 'Lower calories, higher protein'
        },
        {
            badge: 'lighter',
            emoji: '🍃',
            label: 'Lighter',
            filter: (f) => f.calories < 300 && f.fat < 10,
            reason: 'Under 300 cal, low fat'
        },
        {
            badge: 'protein',
            emoji: '💪',
            label: 'Protein-Rich',
            filter: (f) => f.protein > 15,
            reason: 'High protein (>15g)'
        },
        {
            badge: 'fiber',
            emoji: '🌿',
            label: 'High-Fiber',
            filter: (f) => f.fiber > 5,
            reason: 'Great for digestion (>5g fiber)'
        },
        {
            badge: 'energy',
            emoji: '⚡',
            label: 'Quick Energy',
            filter: (f) => f.carbs > 30 && f.fat < 15,
            reason: 'High carbs for energy'
        },
        {
            badge: 'tastier',
            emoji: '😋',
            label: 'Tastier',
            filter: (f) => f.calories >= currentCal * 0.9 && f.calories <= currentCal * 1.1,
            reason: 'Popular choice, similar calories'
        }
    ];

    // Find one food for each badge type
    for (const criteria of badgeCriteria) {
        const matching = indianFoodsDB
            .filter(criteria.filter)
            .filter(f => f.name !== currentMeal.name)
            .slice(0, 1)[0];

        if (matching) {
            suggestions.push({
                food: matching,
                badge: criteria.badge,
                badgeLabel: criteria.label,
                badgeEmoji: criteria.emoji,
                reason: criteria.reason
            });
        }
    }

    return suggestions.slice(0, 6); // Return max 6 suggestions
};

/**
 * Fetch product data from OpenFoodFacts by barcode
 */
export const fetchProductByBarcode = async (barcode: string): Promise<Partial<FoodItem> | null> => {
    try {
        const response = await fetch(`${OPENFOODFACTS_API}/${barcode}.json`);

        if (!response.ok) {
            console.error('OpenFoodFacts API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            console.log('Product not found in OpenFoodFacts');
            return null;
        }

        const product: OpenFoodFactsProduct = data.product;

        return {
            name: product.product_name || 'Unknown Product',
            brand: product.brands,
            barcode: barcode,
            calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
            protein: Math.round(product.nutriments?.proteins_100g || 0),
            fat: Math.round(product.nutriments?.fat_100g || 0),
            carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
            fiber: Math.round(product.nutriments?.fiber_100g || 0),
            imageUrl: product.image_url,
        };
    } catch (error) {
        console.error('Error fetching from OpenFoodFacts:', error);
        return null;
    }
};

/**
 * Search for products by name
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Partial<FoodItem>[]> => {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=true&page_size=${limit}`
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return [];
        }

        return data.products.map((product: OpenFoodFactsProduct & { code?: string }) => ({
            name: product.product_name || 'Unknown Product',
            brand: product.brands,
            barcode: product.code,
            calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
            protein: Math.round(product.nutriments?.proteins_100g || 0),
            fat: Math.round(product.nutriments?.fat_100g || 0),
            carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
            fiber: Math.round(product.nutriments?.fiber_100g || 0),
            imageUrl: product.image_url,
        }));
    } catch (error) {
        console.error('Error searching OpenFoodFacts:', error);
        return [];
    }
};

/**
 * Get food image - using static Pexels URLs for reliable loading
 */
export const getFoodImage = (foodName: string): string => {
    const lowerName = foodName.toLowerCase();

    // Static curated food images from Pexels (guaranteed to work)
    const foodImages: Record<string, string> = {
        'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
        'paneer': 'https://images.pexels.com/photos/9609835/pexels-photo-9609835.jpeg?auto=compress&cs=tinysrgb&w=400',
        'butter': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
        'masala': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
        'curry': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
        'dal': 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
        'dosa': 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400',
        'samosa': 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400',
        'naan': 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=400',
        'roti': 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=400',
        'paratha': 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=400',
        'rice': 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
        'chawal': 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
        'chole': 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400',
        'chana': 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400',
        'rajma': 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=400',
        'idli': 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400',
        'poha': 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
        'upma': 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400',
        'soup': 'https://images.pexels.com/photos/1731535/pexels-photo-1731535.jpeg?auto=compress&cs=tinysrgb&w=400',
        'salad': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        'fruit': 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400',
        'chai': 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
        'tea': 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
        'water': 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
        'chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400',
        'egg': 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=400',
        'oats': 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=400',
        'cheela': 'https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg?auto=compress&cs=tinysrgb&w=400',
        'muri': 'https://images.pexels.com/photos/5836771/pexels-photo-5836771.jpeg?auto=compress&cs=tinysrgb&w=400',
        'vegetable': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    // Find matching image by keyword
    for (const [keyword, url] of Object.entries(foodImages)) {
        if (lowerName.includes(keyword)) {
            return url;
        }
    }

    // Default fallback - generic Indian food image
    return 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400';
};

