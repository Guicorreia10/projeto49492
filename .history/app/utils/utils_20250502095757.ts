import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Função para reconhecer alimento usando modelo do Clarifai
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  // 1. Redimensiona e comprime a imagem
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );

  // 2. Converte imagem para base64
  const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 3. Credenciais Clarifai
  const PAT = '622f783cf8b7489f887095dedb03d897';
  const USER_ID = '9vwg666vbfu1';
  const APP_ID = 'GlicoSleep';
  const MODEL_ID = 'food-item-recognition';

  // 4. Corpo da requisição
  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            base64: base64,
          },
        },
      },
    ],
  });

  // 5. Chamada à API Clarifai
  const clarifaiResponse = await fetch(
    `https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Key ' + PAT,
        'Content-Type': 'application/json',
      },
      body: raw,
    }
  );

  const data = await clarifaiResponse.json();
  console.log(JSON.stringify(data, null, 2)); // DEBUG

  const concepts = data.outputs?.[0]?.data?.concepts;
  if (concepts && concepts.length > 0) {
    return concepts[0].name;
  }
  throw new Error('Alimento não reconhecido');
}

// Função para obter informações nutricionais usando Edamam (com fallback local)
export async function getFoodNutritionByName(foodName: string) {
  const EDAMAM_APP_ID = 'ebae2a5c';
  const EDAMAM_APP_KEY = '4ce41cf98815c43311e1e90f577d649d';
  const query = encodeURIComponent(foodName);

  try {
    const response = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=100g%20${query}`
    );
    const data = await response.json();

    if (data.calories && data.totalNutrients) {
      return {
        name: foodName,
        calories: data.calories,
        carbs: data.totalNutrients.CHOCDF?.quantity || 0,
        glycemicIndex: 50, // Valor padrão, já que Edamam não fornece GI
        portion: "100g"
      };
    } else {
      throw new Error('Edamam não retornou dados válidos');
    }
  } catch (error) {
    console.warn('Erro ao consultar Edamam, usando banco local:', error);

    const database: Record<string, any> = {
      "banana": { name: "Banana", calories: 89, carbs: 23, glycemicIndex: 51, portion: "100g" },
      "apple": { name: "Maçã", calories: 52, carbs: 14, glycemicIndex: 36, portion: "100g" },
      "rice": { name: "Arroz branco", calories: 130, carbs: 28, glycemicIndex: 70, portion: "100g" }
    };

    return database[foodName.toLowerCase()] || {
      name: foodName,
      calories: 95,
      carbs: 25,
      glycemicIndex: 50,
      portion: "100g"
    };
  }
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
