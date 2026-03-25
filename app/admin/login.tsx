import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === "123456") { // Apna asli password yahan likhein
      setLoading(true);
      // Login hone ke baad Dashboard ya List par bhejein
      router.replace("/admin/dashboard"); 
    } else {
      Alert.alert("Error", "Invalid Admin Password");
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="lock-closed" size={50} color={Colors.accent} style={{ alignSelf: 'center' }} />
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter password to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="rgba(255,255,255,0.4)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={handleLogin}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>
        
        <Pressable onPress={() => router.back()} style={{ marginTop: 15 }}>
          <Text style={{ color: '#fff', textAlign: 'center', opacity: 0.6 }}>Go Back</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "rgba(255,255,255,0.1)", padding: 30, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginTop: 10 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 15, color: "#fff", marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  button: { backgroundColor: Colors.accent, padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});
