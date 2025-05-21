export interface Registo {
  id: string;
  data: string;
  dia?: string;
  hora: string;
  tipo:
    | "glicose"
    | "sono"
    | "comida"
    | "medicamento"
    | "smartwatch_passos"
    | "smartwatch_exercicio"
    | "smartwatch_sono";
  valor?: number | string;
  unidade?: string;
  detalhes?: string;
}
