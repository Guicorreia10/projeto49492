import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// ========== Função para reconhecer alimento usando Clarifai ==========

/**
 * Função para reconhecer alimento a partir de uma imagem utilizando a API do Clarifai
 * @param imageUri - URI da imagem a ser analisada
 * @returns Nome do alimento reconhecido
 */
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  try {
    // Redimensiona e comprime a imagem para melhorar o desempenho
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Converte a imagem manipulada para base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Credenciais do Clarifai
    const PAT = '622f783cf8b7489f887095dedb03d897'; // Substitua pelo seu
    const USER_ID = '9vwg666vbfu1'; // Substitua pelo seu
    const APP_ID = 'GlicoSleep'; // Substitua pelo seu
    const WORKFLOW_ID = 'food-recognize'; // Substitua pelo seu

    // Corpo da requisição para a API Clarifai
    const body = JSON.stringify({
      user_app_id: { user_id: USER_ID, app_id: APP_ID },
      inputs: [{ data: { image: { base64 } } }],
    });

    // Requisição para a API Clarifai
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
    if (concepts?.length > 0) return concepts[0].name; // Retorna o nome do alimento

    throw new Error('Nenhum alimento reconhecido');
  } catch (error) {
    console.error('Erro ao reconhecer o alimento:', error);
    throw new Error('Erro ao reconhecer o alimento. Tente novamente.');
  }
}

// ========== Função para obter dados nutricionais reais (Edamam) ==========

/**
 * Função para obter dados nutricionais reais de um alimento utilizando a API Edamam
 * @param foodName - Nome do alimento
 * @param quantityGrams - Quantidade em gramas do alimento
 * @returns Dados nutricionais do alimento
 */
export async function getRealNutritionData(foodName: string, quantityGrams: string) {
  const appId = 'ebae2a5c'; // Substitua pelo seu app_id
  const appKey = '4ce41cf98815c43311e1e90f577d649d'; // Substitua pelo seu app_key

  // Codifica o nome e quantidade do alimento
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
    return null; // Retorna null em caso de erro
  }
}

// ========== Função para calcular a carga glicêmica ==========

/**
 * Função para calcular a carga glicêmica de um alimento
 * @param nutrition - Dados nutricionais do alimento
 * @returns Cálculo da carga glicêmica e classificação
 */
export function calculateGlycemicImpact(nutrition: { carbs: number; glycemicIndex: number }) {
  const carbs = nutrition.carbs || 0;
  const glycemicIndex = nutrition.glycemicIndex || 50;
  const glycemicLoad = (carbs * glycemicIndex) / 100;

  let classification = 'baixo';
  if (glycemicLoad >= 20) classification = 'alto';
  else if (glycemicLoad >= 11) classification = 'médio';

  return {
    glycemicLoad: glycemicLoad.toFixed(1),
    classification,
    description: `Carga glicêmica: ${glycemicLoad.toFixed(1)} (${classification})`,
  };
}
