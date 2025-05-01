import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const botUser: User = {
    _id: 2,
    name: 'GlicoBot',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
  };

  useEffect(() => {
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
        'Os níveis de sono ajudam a monitorizar a qualidade do teu descanso. Idealmente, deverias dormir entre 7 a 9 horas por noite.';
    } else if (userMessage.includes('glicose')) {
      botReply =
        'Os níveis de glicose indicam a quantidade de açúcar no sangue. O normal está entre 70-100 mg/dL em jejum.';
    } else if (userMessage.includes('app')) {
      botReply =
        'A app ajuda-te a monitorizar a saúde através de dados de sono e glicose conectados por bluetooth.';
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
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: 1 }}
        placeholder="Escreve aqui..."
        showUserAvatar
        renderUsernameOnMessage
      />
    </SafeAreaView>
  );
};

export default Chatbot; // Certifique-se de que esta exportação padrão está no final
