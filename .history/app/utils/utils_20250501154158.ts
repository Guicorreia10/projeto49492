// Função para simular análise nutricional
export const getFoodNutrition = async (imageUri: string) => {
    // Aqui você pode integrar uma API real (ex.: Edamam ou Nutritionix)
    console.log(`Imagem enviada para análise: ${imageUri}`);
    return {
      name: 'Exemplo de Alimento', // Nome do alimento (ex.: "Maçã")
      calories: 95, // Calorias em kcal
      carbs: 25, // Carboidratos em gramas
      glycemicIndex: 40, // Índice glicêmico do alimento
    };
  };
  
  // Função para calcular o impacto glicêmico baseado nos carboidratos e índice glicêmico
  export const calculateGlycemicImpact = (nutrition: any) => {
    const carbs = nutrition.carbs || 0; // Carboidratos do alimento
    const glycemicIndex = nutrition.glycemicIndex || 50; // Índice glicêmico (padrão 50)
    return (carbs * glycemicIndex) / 100; // Fórmula de impacto glicêmico
  };
  