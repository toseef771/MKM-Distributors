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
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { StyledInput } from "@/components/StyledInput";
import { StyledButton } from "@/components/StyledButton";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

const DEFAULT_ADMIN = { username: "admin", password: "admin" };

export default function AdminLogin() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { loginAdmin }: any = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeOldPass, setChangeOldPass] = useState("");
  const [changeNewUser, setChangeNewUser] = useState("");
  const [changeNewPass, setChangeNewPass] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);

  // --- UNIVERSAL ALERT WITH ANY TYPES TO STOP RED LINES ---
  const universalAlert = (title: any, message: any) => {
    if (Platform.OS === "web") {
      // @ts-ignore
      alert(title + "\n\n" + message);
    } else {
      Alert.alert(title, message);
    }
  };

  const validate = () => {
    const e: any = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getAdminCreds = async () => {
    try {
      const snap = await get(ref(db, "admin/credentials"));
      if (snap.exists()) return snap.val();
    } catch {}
    return DEFAULT_ADMIN;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const creds: any = await getAdminCreds();
      if (username.trim() !== creds.username || password !== creds.password) {
        universalAlert(
          "Invalid Credentials",
          "Username or password is incorrect. Default login is admin / admin."
        );
        setLoading(false);
        return;
      }
      await loginAdmin();
      router.replace("/admin/dashboard" as any);
    } catch (err: any) {
      const msg = err?.message || "Could not connect to database.";
      universalAlert("Connection Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCredentials = async () => {
    if (!changeOldPass.trim() || !changeNewUser.trim() || !changeNewPass.trim()) {
      universalAlert("Error", "All fields are required.");
      return;
    }
    setChangeLoading(true);
    try {
      const creds: any = await getAdminCreds();
      if (changeOldPass !== creds.password) {
        universalAlert("Wrong Password", "The old password you entered is incorrect.");
        setChangeLoading(false);
        return;
      }
      await set(ref(db, "admin/credentials"), {
        username: changeNewUser.trim(),
        password: changeNewPass.trim(),
      });
      setShowChangeModal(false);
      universalAlert("Updated", "Admin credentials updated successfully!");
    } catch (err: any) {
      universalAlert("Error", err?.message || "Update failed.");
    } finally {
      setChangeLoading(false);
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
        >
          <Pressable onPress={() => router.replace("/" as any)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>Admin Login</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              icon="person-outline"
              error={errors.username}
            />
            <StyledInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />

            <Pressable onPress={handleLogin} disabled={loading} style={styles.loginBtn}>
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.btnText}>Login as Admin</Text>
              )}
            </Pressable>

            <Pressable onPress={() => setShowChangeModal(true)} style={styles.changeCreds}>
              <Text style={styles.changeCredsText}>Change Admin Credentials</Text>
            </Pressable>
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
  header: { alignItems: "center", marginBottom: 30 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.whiteAlpha15, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.white },
  form: { gap: 10 },
  loginBtn: { backgroundColor: Colors.whiteAlpha15, paddingVertical: 15, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: Colors.white },
  btnText: { color: Colors.white, fontWeight: "bold", fontSize: 16 },
  changeCreds: { paddingVertical: 14, alignItems: "center" },
  changeCredsText: { fontSize: 13, color: Colors.whiteAlpha60 }
});