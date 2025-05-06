import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      Alert.alert("Perfeito!!", "Login realizado com sucesso!");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao fazer login.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/onboarding.png")}
        resizeMode="cover"
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>GlicoSleep</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta 👋</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/registo")}>
          <Text style={styles.signupText}>Ainda não tens conta? Regista-te</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  image: {
    width: "100%",
    height: "40%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    color: "#4A90E2",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#1A2238",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderColor: "#4A90E2",
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupText: {
    color: "#8FAADC",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
});

export default SignIn;
