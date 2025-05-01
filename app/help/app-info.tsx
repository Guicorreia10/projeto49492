import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const AppInfoScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: '#f0f0f0', flex: 1 }}>
      {/* Botão Voltar */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 10,
          padding: 10,
          backgroundColor: '#007AFF',
          borderRadius: 5,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>⬅️ Voltar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Cabeçalho */}
        <View style={{ marginTop: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            📱 Funcionalidades da App
          </Text>
          <Text style={{ fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 }}>
            Saiba como utilizar os recursos da aplicação para melhorar a sua saúde e bem-estar.
          </Text>
        </View>

        {/* Seção: Propósito da Aplicação */}
        <View style={{ marginTop: 30, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🎯 Qual o nosso propósito?</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            A aplicação foi criada para auxiliar a monitorização dos seus hábitos de sono e níveis de glicose no sangue. Com gráficos intuitivos e recomendações personalizadas, esta vai tentar ajudar a desenvolver uma rotina mais equilibrada e saudável.
          </Text>
        </View>

        {/* Seção: Monitorização do Sono */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🛏️ Monitorização do Sono</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Utilize a funcionalidade de monitorização do sono para registar as horas dormidas, qualidade do sono e obter análises detalhadas. A aplicação também irá oferecer insights sobre o impacto do sono na sua saúde.
          </Text>
        </View>

        {/* Seção: Monitorização da Glicose */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🩸 Monitorização de Glicose</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Registe os seus níveis de glicose ao longo do dia /ou apenas conecte o seu medidor glicémico de forma a visualizar gráficos para acompanhar tendências e controlar a sua saúde de forma mais facilitada. 
          </Text>
        </View>

        {/* Seção: Conexões Bluetooth */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>📡 Conexões Bluetooth</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            A aplicação conecta-se diretamente com dispositivos compatíveis via Bluetooth de forma a facilitar a sincronização de dados, como níveis de glicose e qualidade do sono. Certifique-se de ativar o Bluetooth no seu dispositivo quando tentar conectar o seu wearable.
          </Text>
        </View>

        {/* Seção: Recomendações Personalizadas */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>💡 Recomendações</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Com base nos dados registrados, a aplicação cria recomendações personalizadas para melhorar os seus hábitos de sono e manter os níveis de glicose e sono em equilíbrio.
          </Text>
        </View>

        {/* Seção: Benefícios */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🌟 Benefícios</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            - Tem tudo em vista para que melhore a sua qualidade de vida ao monitorizar sono e glicose com precisão.{"\n"}
            - Receba insights úteis de forma a otimizar a sua saúde e bem-estar.{"\n"}
            - Acompanhe o seu progresso e veja os resultados ao longo do tempo, podendo aceder ao histórico para poder rever os seus dados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppInfoScreen;
