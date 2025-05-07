import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const botUser: User = {
    _id: 2,
    name: 'GlicoBot',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
  };

  // DEBUG log
  useEffect(() => {
    console.log("✅ Chatbot.tsx montado com sucesso!");
    setMessages([
      {
        _id: 1,
        text: 'Olá! Sou o GlicoBot 🤖. Como te posso ajudar hoje?',
        createdAt: new Date(),
        user: botUser,
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0]?.text.toLowerCase() || '';
    let botReply = 'Desculpa, não entendi. Podes tentar outra pergunta?';

    if (userMessage.includes('sono')) {
      botReply =
        'O sono ajuda-te a recuperar energia. Tenta dormir entre 7 a 9 horas por noite.';
    } else if (userMessage.includes('glicose')) {
      botReply =
        'Os níveis normais de glicose estão entre 70 e 100 mg/dL em jejum.';
    }

    const reply: IMessage = {
      _id: Math.random().toString(),
      text: botReply,
      createdAt: new Date(),
      user: botUser,
    };

    setTimeout(() => {
      setMessages((prev) => GiftedChat.append(prev, [reply]));
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={(msgs) => onSend(msgs)}
          user={{ _id: 1 }}
          placeholder="Escreve aqui..."
          showUserAvatar
          renderUsernameOnMessage
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Chatbot;
