export interface Registo {
    id: string;
    data: string;
    dia: string;
    hora: string;
    tipo: "glicose" | "sono" | "comida" | "medicamento";
    valorGlicose?: string;
    detalhesSono?: string;
    food_name?: string;
    quantity?: number;
    calories?: number;
    carbs?: number;
    glycemic_index?: number;
    glycemic_impact?: number;
    medicamento?: string;
    dose?: string;
    descricao?: string;
  }
  