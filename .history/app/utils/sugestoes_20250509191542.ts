export function sugerirAlternativas(foodName: string): string[] {
   const mapaAlternativas: Record<string, string[]> = {
  // Pão
  "bread": ["pão integral", "pão de centeio", "pão de espelta", "tapioca", "wrap de alface", "pão de linhaça"],
  "white bread": ["pão de sementes", "pão escuro", "galetes de arroz sem sal"],

  // Arroz
  "rice": ["arroz integral", "arroz basmati", "quinoa", "bulgur", "cevada", "couve-flor ralada", "millet"],
  "white rice": ["arroz selvagem", "arroz vermelho", "quinoa", "lentilhas cozidas"],

  // Batata
  "potato": ["batata-doce", "abóbora assada", "cenoura cozida", "inhame", "nabo", "pastinaca"],
  "mashed potato": ["puré de couve-flor", "puré de abóbora", "puré de cenoura", "puré de batata-doce"],

  // Massa
  "pasta": ["massa integral", "massa de lentilhas", "massa de grão-de-bico", "espaguete de courgette", "massa konjac"],
  "spaghetti": ["espaguete de courgette", "massa de algas", "espaguete de abóbora"],

  // Bolachas e doces
  "cookie": ["bolachas de aveia sem açúcar", "barras de frutos secos", "quadrados de coco e cacau"],
  "cake": ["bolo de aveia e banana", "tarte de maçã sem açúcar", "bolo de cenoura integral"],
  "donut": ["panqueca de banana e ovo", "bolo de aveia no microondas"],
  "waffle": ["waffle de aveia", "panqueca de banana", "tapioca recheada"],

  // Refrigerantes e bebidas doces
  "soda": ["água com gás e limão", "infusão de hortelã gelada", "kombucha sem açúcar"],
  "juice": ["sumo natural diluído", "chá frio sem açúcar", "água aromatizada com fruta"],
  "milkshake": ["batido de banana com leite vegetal", "smoothie de frutos vermelhos e iogurte grego"],

  // Gelados e sobremesas
  "ice cream": ["gelado de banana congelada", "iogurte grego com frutos vermelhos", "sorvete de manga natural"],
  "chocolate": ["chocolate negro 85%", "tâmaras recheadas com nozes", "amêndoas com cacau amargo"],

  // Pizza e fast food
  "pizza": ["pizza de base de couve-flor", "pizza de beringela", "pizza de wrap integral"],
  "hamburger": ["hambúrguer caseiro em pão integral", "hambúrguer em folha de alface", "hambúrguer de grão-de-bico"],
  "fries": ["batata-doce no forno", "palitos de courgette no forno", "chips de nabo"],

  // Cereais e pequeno-almoço
  "cereal": ["papas de aveia", "granola caseira sem açúcar", "farelo de trigo", "chia com bebida vegetal"],
  "croissant": ["pão integral com queijo fresco", "panqueca de aveia"],

  // Leite e lacticínios
  "milk": ["leite magro", "leite de amêndoa sem açúcar", "leite de aveia", "leite de coco light"],
  "yogurt": ["iogurte natural sem açúcar", "iogurte grego magro", "iogurte vegetal sem adição de açúcar"],

  // Snacks e aperitivos
  "snack": ["cenouras baby", "pepino com húmus", "ovo cozido", "nozes", "amêndoas"],
  "chips": ["chips de couve", "chips de batata-doce assada", "palitos de vegetais desidratados"],
  "crackers": ["galetes de arroz", "crackers de linhaça", "palitos de vegetais crus com húmus"],

  // Açúcar e adoçantes
  "sugar": ["stevia", "eritritol", "canela", "mel em moderação", "extrato de baunilha"],

  // Outros
  "pastry": ["bolo caseiro com aveia", "biscoitos sem açúcar", "fruta com canela"],
  "alcohol": ["água com gás e limão", "kombucha", "sumo diluído com água"],
};


  const nome = foodName.toLowerCase();
  for (const [chave, sugestoes] of Object.entries(mapaAlternativas)) {
    if (nome.includes(chave)) {
      return sugestoes;
    }
  }

  return [];
}
