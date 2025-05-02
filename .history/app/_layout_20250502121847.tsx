import { Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "@/lib/supabase";

// Impede o SplashScreen de desaparecer até que o app esteja pronto
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Obtendo a sessão
      setUser(session?.user ?? null); // Atualizando o estado com o usuário
    };

    const prepareApp = async () => {
      // Verifica a sessão do usuário assim que o app carrega
      await checkSession();

      if (!fontsLoaded) return;
      setAppIsReady(true);
      await SplashScreen.hideAsync();
    };

    prepareApp();
  }, [fontsLoaded]);

  // Espera até as fontes estarem carregadas e o app estiver pronto
  if (!fontsLoaded || !appIsReady) {
    return null;
  }

  // Redireciona para a tela de login se o usuário não estiver autenticado
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" />
      </Stack>
    );
  }

  // Caso o usuário esteja autenticado, o app continua normalmente
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  );
}
