import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Função para reconhecer alimento com Clarifai
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
  try {
    // Redimensiona e comprime a imagem antes de converter para base64
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Converte a imagem manipulada para base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

      //Credenciais do Clarifai
    const PAT = '622f783cf8b7489f887095dedb03d897';
    const USER_ID = '9vwg666vbfu1';
    const APP_ID = 'GlicoSleep';
    const WORKFLOW_ID = 'food-recognize';



    const raw = JSON.stringify({
      user_app_id: { user_id: USER_ID, app_id: APP_ID },
      inputs: [{ data: { image: { base64 } } }],
    });

    const response = await fetch(`https://api.clarifai.com/v2/workflows/${WORKFLOW_ID}/results`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Key ' + PAT,
        'Content-Type': 'application/json',
      },
      body: raw,
    });

    const data = await response.json();
    const concepts = data.results?.[0]?.outputs?.[0]?.data?.concepts;

    if (concepts && concepts.length > 0) {
      return concepts[0].name;
    }

    throw new Error('Nenhum alimento reconhecido');
  } catch (error) {
    console.error('Erro ao reconhecer o alimento:', error);
    throw new Error('Erro ao reconhecer o alimento. Tente novamente.');
  }
}

// Função para buscar dados reais no Edamam com quantidade escolhida pelo usuário
export async function getRealNutritionData(foodName: string, quantity: string) {
  const appId = 'ebae2a5c'; // Substitua pelo seu
  const appKey = '4ce41cf98815c43311e1e90f577d649d'; // Substitua pelo seu
  const ingredient = encodeURIComponent(`${quantity} ${foodName}`); // Agora inclui a quantidade do usuário

  const url = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${appKey}&ingr=${ingredient}`;

  console.log('Chamando API Edamam:', url); // DEBUG

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na API Edamam: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da API Edamam:', JSON.stringify(data, null, 2)); // DEBUG

    if (!data.calories || data.calories === 0) {
      throw new Error('Dados nutricionais não disponíveis para este alimento.');
    }

    return {
      name: foodName,
      portion: `${quantity}g`, // Mantém a quantidade escolhida pelo usuário
      calories: data.calories || 0,
      carbs: data.totalNutrients?.CHOCDF?.quantity || 0,
      glycemicIndex: 50, // Edamam não fornece, então usamos um valor médio
    };
  } catch (error) {
    console.error('Erro ao buscar dados nutricionais:', error);
    return null;
  }
}

// Função para calcular o impacto glicêmico
export function calculateGlycemicImpact(nutrition: any) {
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
