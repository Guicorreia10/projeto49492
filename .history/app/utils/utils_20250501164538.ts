import * as FileSystem from 'expo-file-system';

// Função para reconhecer alimento usando workflow do Clarifai
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

  const PAT = '622f783cf8b7489f887095dedb03d897';
  const USER_ID = '9vwg666vbfu1';
  const APP_ID = 'GlicoSleep';
  const WORKFLOW_ID = 'food-recognize';

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID
    },
    inputs: [
      {
        data: {
          image: {
            base64: base64
          }
        }
      }
    ]
  });

  const clarifaiResponse = await fetch(
    `https://api.clarifai.com/v2/workflows/${WORKFLOW_ID}/results`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT,
        'Content-Type': 'application/json'
      },
      body: raw
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

// Banco local de alimentos para nutrição
export async function getFoodNutritionByName(foodName: string) {
  const database: Record<string, any> = {
    "banana": { name: "Banana", calories: 89, carbs: 23, glycemicIndex: 51, portion: "100g" },
    "apple": { name: "Maçã", calories: 52, carbs: 14, glycemicIndex: 36, portion: "100g" },
    "rice": { name: "Arroz branco", calories: 130, carbs: 28, glycemicIndex: 70, portion: "100g" }
    // Adicione mais alimentos conforme desejar
  };
  return database[foodName.toLowerCase()] || {
    name: foodName,
    calories: 95,
    carbs: 25,
    glycemicIndex: 50,
    portion: "100g"
  };
}

// Cálculo do impacto glicêmico
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
    description: `Carga glicêmica: ${glycemicLoad.toFixed(1)} (${classification})`
  };
}
