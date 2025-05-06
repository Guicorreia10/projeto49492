import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

// Imagem nova horizontal
import iconImage from "../assets/images/registo.png";

const Registo = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nome,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        Alert.alert("Perfeito", "Conta criada com sucesso! Verifique o seu e-mail.");
        router.push("/sign-in");
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao criar conta.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Imagem topo */}
        <Image source={iconImage} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>

          <TextInput
            placeholder="Nome Completo"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#DDE6ED"
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#DDE6ED"
            style={styles.input}
          />

          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#DDE6ED"
            style={styles.input}
          />

          <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Registar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text style={styles.loginRedirect}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#183D5D",
  },
  scroll: {
    flexGrow: 1,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F0F4F8",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#23527C",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderColor: "#4A90E2",
    borderWidth: 1,
  },
  registerButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginRedirect: {
    color: "#DCE7F1",
    textAlign: "center",
    fontSize: 14,
  },
});

export default Registo;
