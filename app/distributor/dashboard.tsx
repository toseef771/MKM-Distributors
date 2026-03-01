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
import { StyledButton } from "@/components/StyledButton";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

const CITIES = [
  "Rawalpindi", "Islamabad", "Chakwal", "Lahore", "Karachi",
  "Peshawar", "Quetta", "Multan", "Faisalabad", "Sialkot",
];

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DistributorDashboard() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { user, logout } = useAuth();

  const [reportCity, setReportCity] = useState(user?.city || "");
  const [date, setDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!reportCity) e.city = "City is required";
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
        city: reportCity,
        date: date.trim(),
        note: note.trim(),
        distributorName: user?.name,
        shopName: user?.shopName,
        distributorPhone: user?.phone,
        submittedAt: Date.now(),
      });
      setSubmitted(true);
      setNote("");
    } catch (err) {
      Alert.alert("Error", "Could not submit report. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/"); } },
    ]);
  };

  return (
    <LinearGradient colors={Colors.gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]}</Text>
              <Text style={styles.subGreeting}>{user?.shopName} • {user?.city}</Text>
            </View>
            <View style={styles.topBarRight}>
              <Pressable
                onPress={() => router.push("/distributor/history")}
                style={styles.iconBtn}
              >
                <Ionicons name="time-outline" size={22} color={Colors.white} />
              </Pressable>
              <Pressable onPress={handleLogout} style={styles.iconBtn}>
                <Ionicons name="log-out-outline" size={22} color={Colors.white} />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="person-outline" size={20} color={Colors.accent} />
              <Text style={styles.statLabel}>Phone</Text>
              <Text style={styles.statValue}>{user?.phone}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="location-outline" size={20} color={Colors.accent} />
              <Text style={styles.statLabel}>City</Text>
              <Text style={styles.statValue}>{user?.city}</Text>
            </View>
          </View>

          {submitted && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.successText}>Report submitted successfully!</Text>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Daily Report</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>City</Text>
              <Pressable
                style={[styles.citySelector, errors.city ? styles.cityError : null]}
                onPress={() => setShowCityPicker(!showCityPicker)}
              >
                <Ionicons name="location-outline" size={18} color={Colors.whiteAlpha60} />
                <Text style={[styles.citySelectorText, !reportCity && styles.cityPlaceholder]}>
                  {reportCity || "Select city"}
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
                      style={[styles.cityItem, reportCity === city && styles.cityItemSelected]}
                      onPress={() => { setReportCity(city); setShowCityPicker(false); }}
                    >
                      <Text style={[styles.cityItemText, reportCity === city && styles.cityItemTextSelected]}>
                        {city}
                      </Text>
                      {reportCity === city && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

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
              style={{ minHeight: 100, textAlignVertical: "top" } as any}
            />

            <StyledButton
              title="Submit Report"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>

          <Pressable
            style={styles.historyBtn}
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
    alignItems: "flex-start",
  },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
  },
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 14,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
    marginTop: 4,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.white,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,230,118,0.15)",
    borderRadius: 12,
    padding: 12,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
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
  citySelectorText: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: Colors.white },
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
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha10,
  },
  cityItemSelected: { backgroundColor: "rgba(0,180,216,0.15)" },
  cityItemText: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha80 },
  cityItemTextSelected: { color: Colors.accent, fontFamily: "Poppins_600SemiBold" },
  errorText: { fontSize: 11, color: Colors.error, fontFamily: "Poppins_400Regular", marginLeft: 2, marginTop: 4 },
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
