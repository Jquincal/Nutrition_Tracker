const nutrient = (food, number) =>
  food.foodNutrients?.find((item) => item.nutrientNumber === number)?.value || 0;

export function formatFood(food) {
  return {
    source: 'usda',
    usda_id: String(food.fdcId),
    name: food.description,
    protein: nutrient(food, '203'),
    calories: nutrient(food, '208'),
    carbs: nutrient(food, '205'),
    fats: nutrient(food, '204'),
    serving_size: 100,
  };
}

export async function searchFood(query) {
  if (!process.env.USDA_API_KEY) return [];
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  url.searchParams.set('api_key', process.env.USDA_API_KEY);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', '8');
  const response = await fetch(url);
  if (!response.ok) throw new Error('USDA API request failed');
  const data = await response.json();
  return data.foods.map(formatFood);
}
