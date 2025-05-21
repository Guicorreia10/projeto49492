import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants'; 

type Message = { id: string; text: string; fromBot: boolean };
type RoleMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RoleMessage[]>([
    {
      role: 'system',
      content:
        'És o GlicoBot, um assistente amigável especializado em sono, glicose e bem-estar.',
    },
  ]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Olá! Sou o GlicoBot 🤖. Estou aqui para te ajudar em todas as tuas dúvidas.',
        fromBot: true,
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      fromBot: false,
    };
    setMessages(prev => [...prev, userMsg]);

    const entry: RoleMessage = { role: 'user', content: input };
    const newHistory = [...history, entry];
    setHistory(newHistory);

    setInput('');
    setLoading(true);

    try {
      const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newHistory,
          max_tokens: 400,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`status ${res.status}: ${text}`);
      }

      const json = await res.json();
      const botContent =
        (json.choices?.[0]?.message?.content as string)?.trim() ||
        'Desculpa, mas não consegui gerar uma resposta.';

      const assistantEntry: RoleMessage = {
        role: 'assistant',
        content: botContent,
      };
      setHistory(prev => [...prev, assistantEntry]);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botContent,
        fromBot: true,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(' Erro ao comunicar com a API:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Erro: ${err.message}`,
          fromBot: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, history]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.fromBot ? styles.botBubble : styles.userBubble,
            ]}
          >
            <Text style={msg.fromBot ? styles.botText : styles.userText}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <ActivityIndicator
            style={styles.loading}
            size="small"
            color="#4A90E2"
          />
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escreve aqui..."
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
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
  scrollContent: { padding: 16, paddingBottom: 80 },
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    height: 40,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendText: { color: '#fff', fontWeight: '600' },
  loading: { marginTop: 8 },
});
