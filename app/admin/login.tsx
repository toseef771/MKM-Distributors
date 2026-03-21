import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
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
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
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
    setErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      const creds = await getAdminCreds();
      if (username.trim() !== creds.username || password !== creds.password) {
        setErrors({ general: "Invalid username or password. Default is admin/admin." });
        setLoading(false);
        return;
      }
      await loginAdmin();
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setErrors({ general: "Connection error. Check your internet." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCredentials = async () => {
    setModalErrors({});
    const e: Record<string, string> = {};
    if (!changeOldPass.trim()) e.old = "Current password required";
    if (!changeNewUser.trim()) e.user = "New username required";
    if (!changeNewPass.trim()) e.pass = "New password required";

    if (Object.keys(e).length > 0) {
      setModalErrors(e);
      return;
    }

    setChangeLoading(true);
    try {
      const creds = await getAdminCreds();
      if (changeOldPass !== creds.password) {
        setModalErrors({ old: "Incorrect current password." });
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
      // Success is implied by closing modal
    } catch (err: any) {
      setModalErrors({ general: "Update failed. Check connection." });
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
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.replace("/")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Secure access to management panel</Text>
            <View style={styles.defaultHint}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.accent} />
              <Text style={styles.hintText}>Default: admin / admin</Text>
            </View>
          </View>

          <View style={styles.form}>
            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

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

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              <View style={styles.btnInner}>
                {loading ? (
                  <>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.btnText}>Logging in...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                    <Text style={styles.btnText}>Login as Admin</Text>
                  </>
                )}
              </View>
            </Pressable>

            <Pressable onPress={() => setShowChangeModal(true)} style={styles.changeCreds}>
              <Ionicons name="key-outline" size={15} color={Colors.whiteAlpha60} />
              <Text style={styles.changeCredsText}>Change Admin Credentials</Text>
            </Pressable>
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showChangeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Change Credentials</Text>
                  <Text style={styles.modalSub}>Verify with old password</Text>
                </View>
                <Pressable onPress={() => setShowChangeModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={Colors.white} />
                </Pressable>
              </View>

              {modalErrors.general && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{modalErrors.general}</Text>
                </View>
              )}

              <StyledInput
                label="Current Password"
                placeholder="Old password"
                value={changeOldPass}
                onChangeText={setChangeOldPass}
                icon="lock-closed-outline"
                isPassword
                error={modalErrors.old}
              />
              <StyledInput
                label="New Username"
                placeholder="New username"
                value={changeNewUser}
                onChangeText={setChangeNewUser}
                icon="person-outline"
                error={modalErrors.user}
              />
              <StyledInput
                label="New Password"
                placeholder="New password"
                value={changeNewPass}
                onChangeText={setChangeNewPass}
                icon="lock-closed-outline"
                isPassword
                error={modalErrors.pass}
              />

              <StyledButton title="Update Now" onPress={handleChangeCredentials} loading={changeLoading} />
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
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
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
  header: { alignItems: "center", marginBottom: 30, gap: 8 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.whiteAlpha30,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold", color: Colors.white },
  subtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60, textAlign: "center" },
  defaultHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,180,216,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,180,216,0.3)",
    marginTop: 4,
  },
  hintText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: Colors.accent },
  form: { gap: 6 },
  errorBanner: {
    backgroundColor: "rgba(255,82,82,0.1)",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,82,82,0.3)",
  },
  errorBannerText: { color: Colors.error, fontSize: 12, fontFamily: "Poppins_600SemiBold", flex: 1 },
  loginBtn: {
    backgroundColor: Colors.whiteAlpha15,
    borderWidth: 1.5,
    borderColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: Colors.white, letterSpacing: 0.3 },
  btnPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.6 },
  changeCreds: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  changeCredsText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#0D2550",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.white },
  modalSub: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.whiteAlpha15, alignItems: "center", justifyContent: "center" },
});
