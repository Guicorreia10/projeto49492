// utils/utils.ts

// Reconhecimento real usando Clarifai
export async function recognizeFoodWithClarifai(imageUri: string): Promise<string> {
    // 1. Converta a imagem para base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    const base64 = await base64Promise;
  
    // 2. Chave da API Clarifai
    const apiKey = 'SUA_API_KEY_DO_CLARIFAI'; // Substitua pela sua chave!
    const modelId = 'food-item-recognition'; // Modelo de alimentos do Clarifai
    const url = `https://api.clarifai.com/v2/models/${modelId}/outputs`;
  
    const clarifaiBody = {
      inputs: [
        {
          data: {
            image: {
              base64: base64
            }
          }
        }
      ]
    };
  
    const clarifaiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clarifaiBody)
    });
  
    const data = await clarifaiResponse.json();
  
    // 3. Pegue o alimento mais provável
    const concepts = data.outputs?.[0]?.data?.concepts;
    if (concepts && concepts.length > 0) {
      return concepts[0].name; // Exemplo: "banana", "apple", etc.
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
  