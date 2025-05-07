// app/help/chatbot.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

type Message = {
  id: string;
  text: string;
  fromBot: boolean;
};

type RoleMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // histórico para a API
  const [history, setHistory] = useState<RoleMessage[]>([
    {
      role: 'system',
      content:
        'És o GlicoBot, um assistente amigável especializado em sono, glicose e bem-estar.',
    },
  ]);

  // mensagem inicial
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text:
          'Olá! Sou o GlicoBot 🤖. Posso esclarecer dúvidas sobre sono, glicose e bem-estar.',
        fromBot: true,
      },
    ]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // 1) adiciona user bubble
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      fromBot: false,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2) adiciona ao histórico (assegura literal do role)
    setHistory((prev) => [
      ...prev,
      { role: 'user', content: input } as RoleMessage,
    ]);

    setInput('');
    setLoading(true);

    // 3) chama a API com todo o histórico
    try {
      const payload = [
        ...history,
        { role: 'user', content: input } as RoleMessage,
      ];
      console.log('📤 Payload para API:', payload);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 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',
        },
        body: JSON.stringify({
          model: 'openchat/openchat-3.5',
          messages: payload,
        }),
      });
      const json = await res.json();
      console.log('📥 Resposta da API:', json);

      const botContent =
        json.choices?.[0]?.message?.content?.trim() ||
        'Desculpa, não consegui gerar uma resposta.';
      // 4) adiciona assistant ao histórico
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: botContent } as RoleMessage,
      ]);

      // 5) adiciona bot bubble
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botContent,
        fromBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('❌ Erro ao contactar a API:', e);
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Ocorreu um erro ao comunicar com o servidor.',
        fromBot: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, history]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          padding: 16,
        }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.fromBot ? styles.botBubble : styles.userBubble,
            ]}
          >
            <Text style={item.fromBot ? styles.botText : styles.userText}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#4A90E2" />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escreve aqui..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#F1F1F1',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600' },
  loading: { position: 'absolute', right: 16, bottom: 60 },
});
