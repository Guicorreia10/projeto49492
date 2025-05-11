export function sugerirAlternativas(foodName: string): string[] {
  const mapaAlternativas: Record<string, string[]> = {
    "bread": ["pão integral", "tapioca", "aveia"],
    "rice": ["arroz integral", "quinoa", "couve-flor ralada"],
    "potatoe": ["batata-doce", "abóbora", "cenoura cozida"],
    "pasta": ["massa integral", "espaguete de courgette", "leguminosas"],
    "juice": ["água com gás", "chá gelado sem açúcar", "sumo natural diluído"]
  };

  const nome = foodName.toLowerCase();
  for (const [chave, sugestoes] of Object.entries(mapaAlternativas)) {
    if (nome.includes(chave)) {
      return sugestoes;
    }
  }

  return [];
}
