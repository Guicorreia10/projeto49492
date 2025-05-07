// app/help/chatbot.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

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
        text:
          'Olá! Sou o GlicoBot 🤖. Posso tirar as tuas dúvidas sobre sono, glicose e bem-estar. Em que posso ajudar?',
        createdAt: new Date(),
        user: botUser,
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Adiciona a mensagem do utilizador
    setMessages(prev => GiftedChat.append(prev, newMessages));
    setIsTyping(true);

    const userMessage = newMessages[0].text;
    const reply: IMessage = {
      _id: Math.random().toString(),
      text: 'A pensar...',
      createdAt: new Date(),
      user: botUser,
    };

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
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
                  'És o GlicoBot, um assistente amigável especializado em sono, glicose e bem-estar. Responde de forma clara e sucinta a dúvidas de utilizadores.',
              },
              { role: 'user', content: userMessage },
            ],
          }),
        }
      );
      const data = await response.json();
      reply.text =
        data.choices?.[0]?.message?.content?.trim() ||
        'Desculpa, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('Erro ao contactar a API:', error);
      reply.text = 'Ocorreu um erro ao comunicar com o servidor.';
    }

    setIsTyping(false);
    // Adiciona a resposta do bot
    setMessages(prev => GiftedChat.append(prev, [reply]));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <GiftedChat
        messages={messages}
        onSend={(msgs: IMessage[]) => onSend(msgs)}
        user={{ _id: 1 }}
        placeholder="Escreve aqui..."
        showUserAvatar
        renderUsernameOnMessage
        isTyping={isTyping}
      />
    </SafeAreaView>
  );
};

export default Chatbot;
