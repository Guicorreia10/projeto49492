import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const GlicoseInfoScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-primary-100 h-full">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Cabeçalho */}
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            🩸 Níveis de Glicose
          </Text>
          <Text style={{ fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 }}>
            Descubra como manter a glicose equilibrada e melhorar sua saúde.
          </Text>
        </View>

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
  }}
>
  <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>⬅️ Voltar</Text>
</TouchableOpacity>


        {/* Seção: O que é a glicose? */}
        <View style={{ marginTop: 30, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🔍 O que é a glicose?</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            A glicose é um açúcar simples (monossacarídeo), com elevada importância como fonte de energia para as células. Esta é obtida através da digestão dos alimentos, principalmente carboidratos, e é transportada pelo sangue para ser utilizada no metabolismo celular, principalmente para gerar ATP (energia). A glicose é regulada pelas hormonas insulina e glucagon, e o seu excesso pode ser armazenado como glicogénio no fígado e músculos.{"\n"}É essencial para o funcionamento do corpo humano, especialmente para o cérebro e os músculos.
          </Text>
        </View>

        {/* Seção: Níveis Normais de Glicose */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>📊 Níveis Normais de Glicose</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            - **70 a 100 mg/dL**: Valores em jejum considerados normais para indivíduos saudáveis.{"\n"}
            - **100 a 125 mg/dL**: Pode indicar pré-diabetes.{"\n"}
            - **Mais de 126 mg/dL**: Um possível sinal de diabetes, sendo necessária avaliação médica.
          </Text>
        </View>

        {/* Seção: Alimentação Equilibrada */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🍎 Alimentação Equilibrada</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Uma dieta rica em fibras é essencial para manter a glicose estável. Priorize alimentos como frutas, vegetais, grãos integrais e legumes. Evite refeições ricas em carboidratos simples, que podem causar picos repentinos de glicose no sangue.
          </Text>
        </View>

        {/* Seção: Exercícios Físicos */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🏃‍♂️ Exercícios Físicos</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Praticar atividades físicas regularmente é uma forma poderosa de manter a glicose equilibrada. Caminhadas diárias, corridas leves ou atividades como yoga e natação ajudam na sensibilidade à insulina e promovem saúde metabólica.
          </Text>
        </View>

        {/* Seção: Evitar Excesso de Açúcar */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>🚫 Evite Excesso de Açúcar</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Limite o consumo de alimentos e bebidas com alto teor de açúcar, como doces, sorvetes, e refrigerantes. Prefira alternativas mais saudáveis, como frutas frescas e sucos naturais, para satisfazer sua vontade de doces sem prejudicar sua glicose.
          </Text>
        </View>

        {/* Seção: Hidrate-se Bem */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>💧 Hidrate-se Bem</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            A hidratação adequada ajuda a manter os níveis de glicose no sangue sob controle. Beba pelo menos 2 litros de água por dia para otimizar o metabolismo e garantir o bom funcionamento de seus órgãos.
          </Text>
        </View>

        {/* Seção: Por que é Importante Monitorizar? */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>📌 Por que é que é Importante Monitorizar?</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 }}>
            Monitorizar os níveis de glicose é essencial para prevenir complicações, como:{"\n"}
            - Aumento do risco de doenças cardiovasculares.{"\n"}
            - Desenvolvimento de neuropatia diabética.{"\n"}
            - Manutenção da energia e bem-estar geral.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GlicoseInfoScreen;
