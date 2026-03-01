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

const DEFAULT_ADMIN = { username: "admin", password: "mkm2024" };

export default function AdminLogin() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { loginAdmin } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeOldPass, setChangeOldPass] = useState("");
  const [changeNewUser, setChangeNewUser] = useState("");
  const [changeNewPass, setChangeNewPass] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getAdminCreds = async () => {
    const snap = await get(ref(db, "admin/credentials"));
    if (snap.exists()) return snap.val();
    return DEFAULT_ADMIN;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const creds = await getAdminCreds();
      if (username.trim() !== creds.username || password !== creds.password) {
        Alert.alert("Error", "Invalid credentials.");
        setLoading(false);
        return;
      }
      await loginAdmin();
      router.replace("/admin/dashboard");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCredentials = async () => {
    if (!changeOldPass.trim() || !changeNewUser.trim() || !changeNewPass.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    setChangeLoading(true);
    try {
      const creds = await getAdminCreds();
      if (changeOldPass !== creds.password) {
        Alert.alert("Error", "Old password is incorrect.");
        setChangeLoading(false);
        return;
      }
      await set(ref(db, "admin/credentials"), {
        username: changeNewUser.trim(),
        password: changeNewPass.trim(),
      });
      setShowChangeModal(false);
      setChangeOldPass("");
      setChangeNewUser("");
      setChangeNewPass("");
      Alert.alert("Success", "Admin credentials updated successfully!");
    } catch {
      Alert.alert("Error", "Could not update credentials.");
    } finally {
      setChangeLoading(false);
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
              <Ionicons name="shield-checkmark" size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Secure access to management panel</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              label="Username"
              placeholder="Enter admin username"
              value={username}
              onChangeText={setUsername}
              icon="person-outline"
              error={errors.username}
            />
            <StyledInput
              label="Password"
              placeholder="Enter admin password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              error={errors.password}
            />

            <StyledButton
              title="Login as Admin"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            <Pressable
              onPress={() => setShowChangeModal(true)}
              style={styles.changeCreds}
            >
              <Ionicons name="key-outline" size={14} color={Colors.whiteAlpha60} />
              <Text style={styles.changeCredsText}>Change Admin Credentials</Text>
            </Pressable>
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showChangeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Credentials</Text>
                <Pressable onPress={() => setShowChangeModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.white} />
                </Pressable>
              </View>
              <Text style={styles.modalSub}>Enter old password to verify identity</Text>
              <StyledInput
                label="Old Password"
                placeholder="Current password"
                value={changeOldPass}
                onChangeText={setChangeOldPass}
                icon="lock-closed-outline"
                isPassword
              />
              <StyledInput
                label="New Username"
                placeholder="New admin username"
                value={changeNewUser}
                onChangeText={setChangeNewUser}
                icon="person-outline"
              />
              <StyledInput
                label="New Password"
                placeholder="New password (min 6 chars)"
                value={changeNewPass}
                onChangeText={setChangeNewPass}
                icon="lock-closed-outline"
                isPassword
              />
              <StyledButton title="Update Credentials" onPress={handleChangeCredentials} loading={changeLoading} />
              <StyledButton title="Cancel" onPress={() => setShowChangeModal(false)} variant="secondary" />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, gap: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  header: { alignItems: "center", marginBottom: 32, gap: 8 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold", color: Colors.white },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60, textAlign: "center" },
  form: { gap: 4 },
  loginBtn: { marginTop: 8, marginBottom: 8 },
  changeCreds: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  changeCredsText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#0D2550",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.white },
  modalSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
});
