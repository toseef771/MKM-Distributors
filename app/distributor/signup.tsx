import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
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

const CITIES = [
  "Rawalpindi", "Islamabad", "Chakwal", "Lahore", "Karachi",
  "Peshawar", "Quetta", "Multan", "Faisalabad", "Sialkot",
];

export default function DistributorSignup() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [form, setForm] = useState({
    name: "",
    shopName: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCityPicker, setShowCityPicker] = useState(false);

  const update = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.shopName.trim()) e.shopName = "Shop name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (form.phone.trim().length < 10) e.phone = "Enter a valid phone number";
    if (!form.city) e.city = "City is required";
    if (!form.password) e.password = "Password is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const snap = await get(ref(db, `distributors/${form.phone.trim()}`));
      if (snap.exists()) {
        Alert.alert("Error", "An account with this phone number already exists.");
        setLoading(false);
        return;
      }
      await set(ref(db, `distributors/${form.phone.trim()}`), {
        name: form.name.trim(),
        shopName: form.shopName.trim(),
        phone: form.phone.trim(),
        city: form.city,
        password: form.password,
        createdAt: Date.now(),
      });
      Alert.alert("Success", "Account created successfully! You can now log in.", [
        { text: "Login", onPress: () => router.replace("/distributor/login") },
      ]);
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topInset + 20, paddingBottom: bottomInset + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={28} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register as a Distributor</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={(v) => update("name", v)}
              icon="person-outline"
              error={errors.name}
              autoCapitalize="words"
            />
            <StyledInput
              label="Shop Name"
              placeholder="Enter your shop/business name"
              value={form.shopName}
              onChangeText={(v) => update("shopName", v)}
              icon="storefront-outline"
              error={errors.shopName}
              autoCapitalize="words"
            />
            <StyledInput
              label="Phone Number (Used as ID)"
              placeholder="03XX-XXXXXXX"
              value={form.phone}
              onChangeText={(v) => update("phone", v)}
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>City</Text>
              <Pressable
                style={[styles.citySelector, errors.city ? styles.cityError : null]}
                onPress={() => setShowCityPicker(!showCityPicker)}
              >
                <Ionicons name="location-outline" size={18} color={Colors.whiteAlpha60} />
                <Text style={[styles.citySelectorText, !form.city && styles.cityPlaceholder]}>
                  {form.city || "Select your city"}
                </Text>
                <Ionicons
                  name={showCityPicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.whiteAlpha60}
                />
              </Pressable>
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

              {showCityPicker && (
                <View style={styles.cityDropdown}>
                  {CITIES.map((city) => (
                    <Pressable
                      key={city}
                      style={[styles.cityItem, form.city === city && styles.cityItemSelected]}
                      onPress={() => {
                        update("city", city);
                        setShowCityPicker(false);
                      }}
                    >
                      <Text style={[styles.cityItemText, form.city === city && styles.cityItemTextSelected]}>
                        {city}
                      </Text>
                      {form.city === city && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <StyledInput
              label="Password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChangeText={(v) => update("password", v)}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />
            <StyledInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChangeText={(v) => update("confirmPassword", v)}
              icon="lock-closed-outline"
              isPassword
              error={errors.confirmPassword}
            />

            <StyledButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupBtn}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()}>
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
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: { alignItems: "center", marginBottom: 28, gap: 8 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,180,216,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
  },
  form: { gap: 4 },
  signupBtn: { marginTop: 8, marginBottom: 16 },
  loginRow: { flexDirection: "row", justifyContent: "center" },
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
  inputWrapper: { marginBottom: 14 },
  inputLabel: {
    fontSize: 13,
    color: Colors.whiteAlpha80,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 2,
    marginBottom: 6,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  cityError: { borderColor: Colors.error },
  citySelectorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.white,
  },
  cityPlaceholder: { color: Colors.whiteAlpha60 },
  cityDropdown: {
    backgroundColor: "#0D2550",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    marginTop: 4,
    overflow: "hidden",
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha10,
  },
  cityItemSelected: { backgroundColor: "rgba(0,180,216,0.15)" },
  cityItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha80,
  },
  cityItemTextSelected: { color: Colors.accent, fontFamily: "Poppins_600SemiBold" },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    fontFamily: "Poppins_400Regular",
    marginLeft: 2,
    marginTop: 4,
  },
});
