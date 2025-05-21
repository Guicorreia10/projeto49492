// app/utils/guardarSmartwatch.ts
import { supabase } from '@/lib/supabase';

export async function guardarDadoSmartwatch(
  tipo: 'sono' | 'passos' | 'exercicio',
  valor: number,
  unidade: string
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error('❌ Utilizador não autenticado');
    return;
  }

  const { error } = await supabase.from('dados_smartwatch').insert({
    user_id: userData.user.id,
    tipo,
    valor,
    unidade,
  });

  if (error) {
    console.error('❌ Erro ao guardar no Supabase:', error);
  } else {
    console.log(`✅ ${tipo} guardado: ${valor} ${unidade}`);
  }
}
