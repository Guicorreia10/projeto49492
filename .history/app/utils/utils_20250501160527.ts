// utils/utils.ts

export const recognizeFood = async (imageUri: string): Promise<string> => {
    // Simulação: sempre retorna "Maçã"
    return "Maçã";
  };
  
  export const getFoodNutrition = async (imageUri: string) => {
    const foodName = await recognizeFood(imageUri);
    const database: Record<string, any> = {
      "Maçã": {
        name: "Maçã",
        calories: 52,
        carbs: 14,
        glycemicIndex: 36,
        portion: "100g"
      },
      "Banana": {
        name: "Banana",
        calories: 89,
        carbs: 23,
        glycemicIndex: 51,
        portion: "100g"
      },
      "Arroz branco": {
        name: "Arroz branco",
        calories: 130,
        carbs: 28,
        glycemicIndex: 70,
        portion: "100g"
      }
    };
    return database[foodName] || {
      name: foodName,
      calories: 95,
      carbs: 25,
      glycemicIndex: 50,
      portion: "100g"
    };
  };
  
  export const calculateGlycemicImpact = (nutrition: any) => {
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
  };
  