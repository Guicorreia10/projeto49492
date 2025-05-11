// app/components/Insight.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Registo } from "../types";
import { gerarInsights } from "./Insights";

interface Props {
  registros: Registo[];
}

export const Insight = ({ registros }: Props) => {
  const insights = gerarInsights(registros);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Insights Inteligentes</Text>
      {insights.length > 0 ? (
        insights.map((txt, idx) => (
          <Text key={idx} style={styles.insight}>
            • {txt}
          </Text>
        ))
      ) : (
        <Text style={styles.insight}>Sem dados suficientes para gerar insights ainda.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e40af",
  },
  insight: {
    fontSize: 15,
    marginBottom: 6,
    color: "#334155",
  },
});
