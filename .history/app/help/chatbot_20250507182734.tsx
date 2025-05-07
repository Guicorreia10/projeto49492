// app/help/chatbot.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const Chatbot: React.FC = () => {
  useEffect(() => {
    console.log('✅ chatbot.tsx montado!');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Olá, sou o Chatbot!</Text>
    </View>
  );
};

export default Chatbot;
