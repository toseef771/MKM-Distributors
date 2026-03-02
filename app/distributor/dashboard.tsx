import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { StyledInput } from "@/components/StyledInput";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DistributorDashboard() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { user, logout } = useAuth();

  const [reportCity, setReportCity] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!reportCity.trim()) e.city = "City is required";
    if (!date.trim()) e.date = "Date is required";
    if (!note.trim()) e.note = "Note/Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const reportRef = push(ref(db, `reports/${user?.phone}`));
      await set(reportRef, {
        city: reportCity.trim(),
        date: date.trim(),
        note: note.trim(),
        distributorName: user?.name,
        distributorPhone: user?.phone,
        submittedAt: Date.now(),
      });
      setSubmitted(true);
      setNote("");
      setReportCity("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not submit report. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]
    );
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
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.greeting}>
                Hello, {user?.name?.split(" ")[0] || "Distributor"}
              </Text>
              <Text style={styles.subGreeting}>
                {user?.phone}
              </Text>
            </View>
            <View style={styles.topBarRight}>
              <Pressable
                onPress={() => router.push("/distributor/history")}
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Ionicons name="time-outline" size={22} color={Colors.white} />
              </Pressable>
              <Pressable
                onPress={handleLogout}
                style={[styles.iconBtn, styles.logoutBtn]}
                hitSlop={8}
              >
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              </Pressable>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={16} color={Colors.accent} />
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={16} color={Colors.accent} />
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
          </View>

          {/* Success Banner */}
          {submitted && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.successText}>Report submitted successfully!</Text>
            </View>
          )}

          {/* Report Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Submit Daily Report</Text>
            </View>

            <StyledInput
              label="City"
              placeholder="Type your city name"
              value={reportCity}
              onChangeText={setReportCity}
              icon="location-outline"
              error={errors.city}
              autoCapitalize="words"
            />

            <StyledInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              icon="calendar-outline"
              error={errors.date}
            />

            <StyledInput
              label="Note / Description"
              placeholder="Enter today's report details..."
              value={note}
              onChangeText={setNote}
              icon="create-outline"
              multiline
              numberOfLines={5}
              error={errors.note}
              style={{ minHeight: 110, textAlignVertical: "top" } as any}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.submitPressed,
                loading && styles.submitDisabled,
              ]}
            >
              <View style={styles.submitInner}>
                {loading ? (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
                    <Text style={styles.submitText}>Submitting...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
                    <Text style={styles.submitText}>Submit Report</Text>
                  </>
                )}
              </View>
            </Pressable>
          </View>

          {/* History Button */}
          <Pressable
            style={({ pressed }) => [styles.historyBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/distributor/history")}
          >
            <Ionicons name="time-outline" size={20} color={Colors.accent} />
            <Text style={styles.historyBtnText}>View My History</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
          </Pressable>

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
    paddingHorizontal: 20,
    gap: 14,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarLeft: { flex: 1 },
  topBarRight: { flexDirection: "row", gap: 8 },
  greeting: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  subGreeting: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
    marginTop: 2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
  },
  logoutBtn: {
    backgroundColor: "rgba(255,82,82,0.12)",
    borderColor: "rgba(255,82,82,0.3)",
  },
  infoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.whiteAlpha15,
    marginHorizontal: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
    marginTop: 2,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.white,
    textAlign: "center",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,230,118,0.15)",
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(0,230,118,0.3)",
  },
  successText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.success,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 18,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 13,
    paddingVertical: 14,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  submitInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  submitPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  submitDisabled: { opacity: 0.6 },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  historyBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.accent,
  },
});
