import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Politica = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold mt-6 mb-4 text-blue-600">Política de Privacidade - GlicoSleep</Text>
        <Text className="text-gray-700 mb-4">Atualizado em: [14/05/2025]</Text>

        <Section title="1. Informações Recolhidas">
          <Bullet>Dados de registo: nome, email e palavra-passe</Bullet>
          <Bullet>Dados de saúde: níveis de glicose, horas de sono, serviços utilizados, medicação,  análise alimentar</Bullet>
          <Bullet>Dados de dispositivo: modelo, sistema operativo, ID de dispositivo</Bullet>
        </Section>

        <Section title="2. Finalidade da Recolha">
          <Bullet>Criar e gerir a sua conta</Bullet>
          <Bullet>Apresentar históricos e relatórios personalizados</Bullet>
          <Bullet>Melhorar a funcionalidade da aplicação</Bullet>
          <Bullet>Cumprir obrigações legais e de segurança</Bullet>
        </Section>

        <Section title="3. Partilha de Dados">
          <Bullet>Quando exigido por lei ou autorização judicial</Bullet>
          <Bullet>Com serviços de backend (como Supabase), estritamente para operações da app</Bullet>
        </Section>

        <Section title="4. Armazenamento e Segurança">
          <Text className="text-base text-gray-700">
            Todos os dados são armazenados de forma segura com uso da infraestrutura da Supabase.
            Implementamos medidas técnicas para proteger os dados contra acesso não autorizado.
          </Text>
        </Section>

        <Section title="5. Direitos do Utilizador">
          <Bullet>Aceder aos seus dados</Bullet>
          <Bullet>Corrigir ou atualizar informações</Bullet>
          <Bullet>Eliminar a sua conta e dados associados</Bullet>
          <Text className="mt-2 text-base text-gray-700">
            Para tal, contacte-nos através de: <Text className="font-semibold">glicosleep@gmail.com</Text>
          </Text>
        </Section>

        <Section title="6. Cookies">
          <Text className="text-base text-gray-700">
            A aplicação não utiliza cookies. No entanto, serviços externos poderão armazenar dados temporários
            para autenticação ou análise.
          </Text>
        </Section>
      
        <Section title="7. Alterações a Esta Política">
          <Text className="text-base text-gray-700">
            Reservamo-nos o direito de alterar esta política a qualquer momento. Notificaremos os utilizadores
            por email ou pela app sempre que isso acontecer.
          </Text>
        </Section>

        <Section title="8. Definições Bluetooth">
          <Text className="text-base text-gray-700">
            O acesso a dados via wearable está dependente da versão e fabricante do seu smartwatch.
            A GlicoSleep não é responsável por alterações de política de privacidade de terceiros.
          </Text>
        </Section>

        <Text className="mt-6 text-base text-gray-700">
          Para qualquer dúvida, entre em contacto connosco em <Text className="font-semibold">glicosleep@gmail.com</Text>.
        </Text>

        <Text className="mt-4 text-base font-medium text-center text-gray-500">
          Obrigado por confiar na GlicoSleep!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="text-lg font-bold mb-2 text-gray-800">{title}</Text>
    <View className="pl-2">{children}</View>
  </View>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-row mb-1">
    <Text className="text-base text-gray-700">• </Text>
    <Text className="text-base text-gray-700 flex-1">{children}</Text>
  </View>
);

export default Politica;
