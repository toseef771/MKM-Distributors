

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const cleanPhone = phone.trim();

    if (!name.trim()) e.name = "Full name is required";
    if (!cleanPhone) {
      e.phone = "Phone number is required";
    } else if (cleanPhone.length !== 11) {
      e.phone = "Enter exactly 11 digits (e.g. 03001234567)";
    }
    if (!password) e.password = "Password is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setErrors({});
    if (!validate()) return;
    setLoading(true);

    try {
      const phoneKey = phone.trim();
      const snap = await get(ref(db, `distributors/${phoneKey}`));

      if (snap.exists()) {
        setErrors({ phone: "This number is already registered. Please login." });
        setLoading(false);
        return;
      }

      await set(ref(db, `distributors/${phoneKey}`), {
        name: name.trim(),
        phone: phoneKey,
        password: password,
        shopName: "",
        city: "",
        createdAt: Date.now(),
      });

      router.replace("/distributor/login");
    } catch (err: any) {
      setErrors({ 
        general: "Connection error. Please check your internet and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={Colors.gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.replace("/distributor/login")}
            style={styles.backBtn}
          >
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
            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            <StyledInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              error={errors.name}
              autoCapitalize="words"
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

            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.signupBtn,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              <View style={styles.btnInner}>
                {loading ? (
                  <>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.btnText}>Creating Account...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    <Text style={styles.btnText}>Create Account</Text>
                  </>
                )}
              </View>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
  },
  header: { alignItems: "center", marginBottom: 32, gap: 8 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,180,216,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
  },
  form: { gap: 6 },
  errorBanner: {
    backgroundColor: "rgba(255,82,82,0.1)",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,82,82,0.3)",
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
  },
  signupBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  btnPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.6 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
  },
  loginText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
  },
  loginLink: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.accent,
  },
});
