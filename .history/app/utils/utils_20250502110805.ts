import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// ========== Função para reconhecer alimento usando Clarifai ==========
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  try {
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

    const body = JSON.stringify({
      user_app_id: { user_id: USER_ID, app_id: APP_ID },
      inputs: [{ data: { image: { base64 } } }],
    });

    const response = await fetch(`https://api.clarifai.com/v2/workflows/${WORKFLOW_ID}/results`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Key ${PAT}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    console.log("Alimento reconhecido:", data);

    const concepts = data.results?.[0]?.outputs?.[0]?.data?.concepts;
    if (concepts?.length > 0) return concepts[0].name;

    throw new Error('Nenhum alimento reconhecido');
  } catch (error) {
    console.error('Erro ao reconhecer o alimento:', error);
    throw new Error('Erro ao reconhecer o alimento. Tente novamente.');
  }
}

// ========== Função para obter dados nutricionais reais (Edamam) ==========
export async function getRealNutritionData(foodName: string, quantityGrams: string) {
  const appId = 'ebae2a5c';
  const appKey = '4ce41cf98815c43311e1e90f577d649d';

  // Torna a unidade explícita para evitar erro de interpretação
  const ingredient = encodeURIComponent(`${quantityGrams} grams ${foodName}`);
  const url = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${appKey}&ingr=${ingredient}`;

  console.log('Chamada API Edamam:', url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na API Edamam: ${response.status}`);

    const data = await response.json();
    console.log('Dados nutricionais recebidos:', JSON.stringify(data, null, 2));

    const parsed = data.ingredients?.[0]?.parsed?.[0]?.nutrients;
    if (!parsed) throw new Error('Dados nutricionais não encontrados ou inválidos.');

    return {
      name: foodName,
      portion: `${quantityGrams}g`,
      calories: parsed.ENERC_KCAL?.quantity || 0,
      carbs: parsed.CHOCDF?.quantity || 0,
      glycemicIndex: 50, // Valor padrão por falta de dado real
    };
  } catch (error) {
    console.error('Erro ao buscar dados nutricionais:', error);
    return null;
  }
}

// ========== Função para calcular a carga glicêmica ==========
export function calculateGlycemicImpact(nutrition: {
  carbs: number;
  glycemicIndex: number;
}) {
  const carbs = nutrition.carbs || 0;
  const gi = nutrition.glycemicIndex || 50;
  const glycemicLoad = (carbs * gi) / 100;

  const classification =
    glycemicLoad >= 20 ? 'alto' : glycemicLoad >= 11 ? 'médio' : 'baixo';

  return {
    glycemicLoad: glycemicLoad.toFixed(1),
    classification,
    description: `Carga glicêmica: ${glycemicLoad.toFixed(1)} (${classification})`,
  };
}
