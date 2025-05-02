import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// --- Clarifai: Reconhecimento de alimento na imagem ---
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const PAT = '622f783cf8b7489f887095dedb03d897';
  const USER_ID = '9vwg666vbfu1';
  const APP_ID = 'GlicoSleep';
  const WORKFLOW_ID = 'food-recognize';

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            base64,
          },
        },
      },
    ],
  });

  const clarifaiResponse = await fetch(
    `https://api.clarifai.com/v2/workflows/${WORKFLOW_ID}/results`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
        'Content-Type': 'application/json',
      },
      body: raw,
    }
  );

  const data = await clarifaiResponse.json();
  console.log(JSON.stringify(data, null, 2)); // DEBUG

  const concepts = data.results?.[0]?.outputs?.[0]?.data?.concepts;
  if (concepts && concepts.length > 0) {
    return concepts[0].name;
  }

  throw new Error('Alimento não reconhecido');
}

// --- Edamam: Busca de dados nutricionais reais ---
const EDAMAM_APP_ID = 'ebae2a5c'; // substitua
const EDAMAM_APP_KEY = '4ce41cf98815c43311e1e90f577d649d	—'; // substitua

export async function getFoodNutritionByName(foodName: string) {
  const url = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=100g%20${encodeURIComponent(foodName)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.totalNutrients) {
    throw new Error('Dados nutricionais não encontrados no Edamam.');
  }

  const carbs = data.totalNutrients.CHOCDF?.quantity || 0;
  const calories = data.calories || 0;

  return {
    name: foodName,
    calories: Math.round(calories),
    carbs: parseFloat(carbs.toFixed(1)),
    glycemicIndex: 50, // estimado ou ajustável manualmente
    portion: "100g"
  };
}

// --- Cálculo da Carga Glicêmica ---
export function calculateGlycemicImpact(nutrition: any) {
  const carbs = nutrition.carbs || 0;
  const glycemicIndex = nutrition.glycemicIndex || 50;
  const glycemicLoad = (carbs * glycemicIndex) / 100;
  let classification = "baixo";
  if (glycemicLoad >= 20) classification = "alto";
  else if (glycemicLoad >= 11) classification = "médio";

  return {
    glycemicLoad: glycemicLoad.toFixed(1),
    classification,
    description: `Carga glicêmica: ${glycemicLoad.toFixed(1)} (${classification})`,
  };
}
