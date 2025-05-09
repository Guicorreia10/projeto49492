// app/help/chatbot.tsx
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
        text:
          'Olá! Sou o GlicoBot 🤖. Posso esclarecer dúvidas sobre sono, glicose e bem-estar.',
        fromBot: true,
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // 1) bolha do utilizador
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      fromBot: false,
    };
    setMessages(prev => [...prev, userMsg]);

    // 2) atualiza histórico
    const entry: RoleMessage = { role: 'user', content: input };
    const newHistory = [...history, entry];
    setHistory(newHistory);

    setInput('');
    setLoading(true);

    try {
      console.log('🚀 sendMessage chamado, histórico:', newHistory);
      const res = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer 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',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: newHistory,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`status ${res.status}: ${text}`);
      }

      const json = await res.json();
      console.log('✅ Resposta da API:', json);

      const botContent =
        (json.choices?.[0]?.message?.content as string)?.trim() ||
        'Desculpa, não consegui gerar uma resposta.';

      // 3) atualiza histórico
      const assistantEntry: RoleMessage = {
        role: 'assistant',
        content: botContent,
      };
      setHistory(prev => [...prev, assistantEntry]);

      // 4) bolha do bot
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botContent,
        fromBot: true,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('❌ Erro ao comunicar com a API:', err);
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
