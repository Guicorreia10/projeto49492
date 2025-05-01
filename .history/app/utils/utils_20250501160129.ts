// utils/utils.ts

// Passo 1: Reconhecer o alimento (simulação)
export const recognizeFood = async (imageUri: string): Promise<string> => {
    // Simule reconhecimento: sempre retorna "Maçã"
    // Você pode trocar para "Banana" ou outro alimento para testar
    return "Maçã";
  };
  
  // Passo 2: Retornar valores nutricionais simulados
  export const getFoodNutrition = async (imageUri: string) => {
    const foodName = await recognizeFood(imageUri);
  
    // Simulação de dados para alguns alimentos comuns
    const database: Record<string, any> = {
      "Maçã": {
        name: "Maçã",
        calories: 52,
        carbs: 14,
        glycemicIndex: 36, // IG médio da maçã
        portion: "100g"
      },
      "Banana": {
        name: "Banana",
        calories: 89,
        carbs: 23,
        glycemicIndex: 51, // IG médio da banana
        portion: "100g"
      },
      "Arroz branco": {
        name: "Arroz branco",
        calories: 130,
        carbs: 28,
        glycemicIndex: 70,
        portion: "100g"
      }
      // Adicione mais alimentos conforme desejar
    };
  
    // Se não encontrar, retorna um alimento genérico
    const nutrition = database[foodName] || {
      name: foodName,
      calories: 95,
      carbs: 25,
      glycemicIndex: 50,
      portion: "100g"
    };
  
    return nutrition;
  };
  
  // Passo 3: Calcular e classificar o impacto glicêmico (carga glicêmica)
  export const calculateGlycemicImpact = (nutrition: any) => {
    // Fórmula: CG = (IG x Carboidratos) / 100
    const carbs = nutrition.carbs || 0;
    const glycemicIndex = nutrition.glycemicIndex || 50;
    const glycemicLoad = (carbs * glycemicIndex) / 100;
  
    // Classificação baseada em referências[4][5][6]:
    // Baixa: 0-10 | Média: 11-19 | Alta: 20+
    let classification = "baixo";
    if (glycemicLoad >= 20) classification = "alto";
    else if (glycemicLoad >= 11) classification = "médio";
  
    // Retorno detalhado
    return {
      glycemicLoad: glycemicLoad.toFixed(1),
      classification,
      description: `Carga glicêmica: ${glycemicLoad.toFixed(1)} (${classification})`
    };
  };
  