import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const botUser: User = {
    _id: 2,
    name: 'GlicoBot',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
  };

  useEffect(() => {
    console.log('✅ chatbot.tsx montado!');
    setMessages([
      {
        _id: 1,
        text: 'Olá! Sou o GlicoBot 🤖. Como te posso ajudar hoje?',
        createdAt: new Date(),
        user: botUser,
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(prev => GiftedChat.append(prev, newMessages));

    const userMessage = newMessages[0]?.text || '';
    const reply: IMessage = {
      _id: Math.random().toString(),
      text: 'A pensar...',
      createdAt: new Date(),
      user: botUser,
    };

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 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',
        },
        body: JSON.stringify({
          model: 'openchat/openchat-3.5',
          messages: [
            {
              role: 'system',
              content:
                'És um assistente simpático chamado GlicoBot. Responde de forma simples sobre sono, glicose, saúde e bem-estar.',
            },
            { role: 'user', content: userMessage },
          ],
        }),
      });
      const data = await response.json();
      reply.text = data.choices?.[0]?.message?.content ?? reply.text;
    } catch (e) {
      console.error('Erro API:', e);
      reply.text = 'Ocorreu um erro ao comunicar com o servidor.';
    }

    setMessages(prev => GiftedChat.append(prev, [reply]));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <GiftedChat
          messages={messages}
          onSend={(msgs: IMessage[]) => onSend(msgs)}
          user={{ _id: 1 }}
          placeholder="Escreve aqui..."
          showUserAvatar
          renderUsernameOnMessage
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chatbot;
