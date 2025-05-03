import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from "react-native";
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
        source={require('../assets/images/onboarding.png')}
        resizeMode="contain"
        style={styles.image}
      />

      <Text style={styles.title}>Bem-vindo de Volta</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.loginButton}
      >
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/registo")}
        style={styles.signupButton}
      >
        <Text style={styles.signupButtonText}>Criar Nova Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F1F8FF",
  },
  image: {
    width: "100%",
    height: 450,
    marginBottom: 30,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#08457E",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    marginBottom: 15,
    fontSize: 16,
    borderColor: "#00796B",
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    marginBottom: 15,
  },
  loginButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: "transparent",
    width: "100%",
  },
  signupButtonText: {
    textAlign: "center",
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SignIn;
