import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { StyledInput } from "@/components/StyledInput";
import { StyledButton } from "@/components/StyledButton";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

export default function DistributorSignup() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    if (phone.trim().length < 10) e.phone = "Enter a valid phone number";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const snap = await get(ref(db, `distributors/${phone.trim()}`));
      if (snap.exists()) {
        setErrors({ phone: "This number is already registered. Please login." });
        setLoading(false);
        return;
      }

      await set(ref(db, `distributors/${phone.trim()}`), {
        name: name.trim(),
        phone: phone.trim(),
        password: password,
        shopName: "",
        city: "",
        createdAt: Date.now(),
      });

      // Account banne ke baad seedha login par le jayen
      router.replace("/distributor/login");
      
    } catch (err) {
      setErrors({ phone: "Connection Error: Check your internet." });
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
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.replace("/distributor/login")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={30} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register as a Distributor</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              error={errors.name}
            />

            <StyledInput
              label="Phone Number"
              placeholder="e.g. 03001234567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />

            <StyledInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />

            <Pressable onPress={handleSignup} disabled={loading} style={[styles.signupBtn, loading && styles.btnDisabled]}>
              {loading ? (
                <View style={styles.btnInner}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={styles.btnText}>Creating Account...</Text>
                </View>
              ) : (
                <View style={styles.btnInner}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  <Text style={styles.btnText}>Create Account</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/distributor/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.whiteAlpha15, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  header: { alignItems: "center", marginBottom: 32, gap: 8 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,180,216,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: Colors.accent, marginBottom: 8 },
  title: { fontSize: 24, color: Colors.white, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: Colors.whiteAlpha60 },
  form: { gap: 6 },
  signupBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 15, marginTop: 10, marginBottom: 16, alignItems: "center" },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { fontSize: 16, color: Colors.white, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: 4 },
  loginText: { fontSize: 13, color: Colors.whiteAlpha60 },
  loginLink: { fontSize: 13, color: Colors.accent },
});
