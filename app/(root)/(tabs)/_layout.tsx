import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '@/constants/icons';

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: any; title: string }) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? '#0061ff' : '#666876'}
      resizeMode="contain"
      className="size-6"
    />
    <Text
      className={`${
        focused ? 'text-primary-300 font-rubik-medium' : 'text-black-200 font-rubik'
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  const [tabVisible, setTabVisible] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: tabVisible
            ? {
                position: 'absolute',
                bottom: 20,
                left: 15,
                right: 15,
                backgroundColor: '#E3F2FD',
                borderRadius: 25,
                borderTopWidth: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 5,
                height: 75,
              }
            : { display: 'none' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon={icons.home} focused={focused} title="Início" />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Histórico',
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.calendar} focused={focused} title="Histórico" />
            ),
          }}
        />
       
        <Tabs.Screen
          name="conectar"
          options={{
            title: 'Conectar',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon={icons.bed} focused={focused} title="Conectar" />,
          }}
        />
        <Tabs.Screen
          name="manual-input"
          options={{
            title: 'Entrada Manual',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon={icons.edit} focused={focused} title="Dados" />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon icon={icons.person} focused={focused} title="Perfil" />,
          }}
        />
      </Tabs>

      {/* Botão flutuante para esconder/mostrar tab bar */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setTabVisible(!tabVisible)}
      >
        <Text style={styles.toggleButtonText}>{tabVisible ? '↓' : '↑'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 25,
    zIndex: 999,
    elevation: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TabsLayout;
