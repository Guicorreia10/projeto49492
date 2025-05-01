// utils/utils.ts

// Função para reconhecer alimento usando Clarifai
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
  
    // 2. Suas credenciais do Clarifai
    const PAT = 'SEU_PERSONAL_ACCESS_TOKEN'; // <- Substitua pelo seu token!
    const USER_ID = 'SEU_USER_ID';           // <- Substitua pelo seu user_id!
    const APP_ID = 'SEU_APP_ID';             // <- Substitua pelo seu app_id!
    const MODEL_ID = 'food-item-recognition';
  
    // 3. Corpo da requisição
    const raw = JSON.stringify({
      "user_app_id": {
        "9vwg666vbfu1": USER_ID,
        "GlicoSleep": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": base64
            }
          }
        }
      ]
    });
  
    // 4. Chamada à API Clarifai
    const clarifaiResponse = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`,
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
  
    // 5. Pegue o alimento mais provável
    const concepts = data.outputs?.[0]?.data?.concepts;
    if (concepts && concepts.length > 0) {
      return concepts[0].name; // Exemplo: "banana"
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
  