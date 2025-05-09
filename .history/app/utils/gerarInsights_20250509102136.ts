import { Registo } from "..//types";

export function calcularMedia(dados: Registo[]) {
  const valores = dados.map((d) => parseFloat(d.valorGlicose || "0"));
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
}

export function calcularVariancia(dados: Registo[]) {
  const media = calcularMedia(dados);
  const valores = dados.map((d) => parseFloat(d.valorGlicose || "0"));
  return valores.length
    ? valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length
    : 0;
}

export function gerarInsights(registros: Registo[]): string[] {
  const insights: string[] = [];

  const regGlicose = registros.filter((r) => r.tipo === "glicose" && r.valorGlicose);
  const regSono = registros.filter((r) => r.tipo === "sono" && r.detalhesSono);
  const regMed = registros.filter((r) => r.tipo === "medicamento" && r.medicamento);

  // Sono > 7h → glicose baixa?
  const diasBomSono = regSono.filter((s) => parseFloat(s.detalhesSono!) >= 7).map((s) => s.data);
  const glicoseBomSono = regGlicose.filter((g) => diasBomSono.includes(g.data));
  const glicoseMauSono = regGlicose.filter((g) => !diasBomSono.includes(g.data));

  const mediaBoa = calcularMedia(glicoseBomSono);
  const mediaMau = calcularMedia(glicoseMauSono);

  if (mediaBoa < mediaMau - 10) {
    insights.push(`Nos dias com mais de 7h de sono, a glicose média desce cerca de ${(mediaMau - mediaBoa).toFixed(1)} mg/dL.`);
  }

  // Medicamento "Insulina" → menor variância?
  const diasComInsulina = regMed.filter((m) => m.medicamento?.toLowerCase().includes("insulina")).map((m) => m.data);
  const glicoseComMed = regGlicose.filter((g) => diasComInsulina.includes(g.data));
  const glicoseSemMed = regGlicose.filter((g) => !diasComInsulina.includes(g.data));

  const varCom = calcularVariancia(glicoseComMed);
  const varSem = calcularVariancia(glicoseSemMed);

  if (varCom < varSem - 5) {
    insights.push(`Nos dias com insulina, a glicose é mais estável (var. ${varSem.toFixed(1)} ➝ ${varCom.toFixed(1)} mg/dL).`);
  }

  return insights;
}
