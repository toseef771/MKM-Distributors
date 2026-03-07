import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { StyledInput } from "@/components/StyledInput";
import { StyledButton } from "@/components/StyledButton";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

export default function DistributorLogin() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { loginDistributor } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!phone.trim()) e.phone = "Phone number is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({}); // Purane errors clear karein

    try {
      const snap = await get(ref(db, `distributors/${phone.trim()}`));
      
      if (!snap.exists()) {
        // Alert ki bajaye input ke niche error dikhayen
        setErrors({ phone: "No account found with this phone number." });
        setLoading(false);
        return;
      }

      const data = snap.val();
      if (data.password !== password) {
        // Password field ke niche error dikhayen
        setErrors({ password: "Incorrect password." });
        setLoading(false);
        return;
      }

      await loginDistributor({
        role: "distributor",
        phone: phone.trim(),
        name: data.name,
        shopName: data.shopName,
        city: data.city,
      });
      router.replace("/distributor/dashboard");
      
    } catch (err) {
      setErrors({ phone: "Connection Error: Please check internet." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.replace("/")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person" size={32} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Distributor Login</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Phone Number"
              placeholder="03XX-XXXXXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone} // Yahan error text dikhega
            />
            <StyledInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password} // Yahan error text dikhega
            />
            <StyledButton title="Sign In" onPress={handleLogin} loading={loading} />
          </View>
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.whiteAlpha15, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  header: { alignItems: "center", marginBottom: 32, gap: 8 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,180,216,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.accent, marginBottom: 8 },
  title: { fontSize: 24, color: Colors.white, fontFamily: "System" }, // Safe font
  form: { gap: 4 }
});
