import { supabase } from '@/lib/supabase';

/**
 * Guarda um registo de dados vindos do smartwatch no Supabase.
 *
 * @param tipo - Tipo de dado ('sono', 'passos', 'exercicio')
 * @param valor - Valor numérico do dado (ex: 7.2, 8300, 45)
 * @param unidade - Unidade do valor (ex: 'horas', 'passos', 'minutos')
 */
export async function guardarDadoSmartwatch(
  tipo: 'sono' | 'passos' | 'exercicio',
  valor: number,
  unidade: string
): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error('❌ Utilizador não autenticado no Supabase');
    return;
  }

  const { error } = await supabase.from('dados_smartwatch').insert({
    user_id: userData.user.id,
    tipo,
    valor,
    unidade,
  });

  if (error) {
    console.error('❌ Erro ao guardar no Supabase:', error.message);
  } else {
    console.log(`✅ Dado guardado: ${tipo} = ${valor} ${unidade}`);
  }
}
