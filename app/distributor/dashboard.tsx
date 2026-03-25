import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  BackHandler,
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

  // Back Button Logic (App Exit)
  useEffect(() => {
    const backAction = () => {
      // Exit ke liye alert rehne diya hai taake ghalti se app band na ho jaye
      Alert.alert("MKM Distributor", "Exit?", [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  // --- DIRECT LOGOUT (NO ALERT) ---
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.log("Logout Error:", err);
    }
  };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!reportCity.trim()) e.city = "City required";
    if (!date.trim()) e.date = "Date required";
    if (!note.trim()) e.note = "Note required";
    
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

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
      Alert.alert("Success", "Report submit ho gayi!");
    } catch (err: any) {
      Alert.alert("Error", "Submit fail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar Fix */}
          <View style={[styles.topBar, { zIndex: 100 }]}>
            <View style={styles.topBarLeft}>
              <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0] || "User"}</Text>
              <Text style={styles.subGreeting}>{user?.phone}</Text>
            </View>
            <View style={styles.topBarRight}>
              <Pressable
                onPress={() => router.push("/distributor/history")}
                style={styles.iconBtn}
                hitSlop={10}
              >
                <Ionicons name="time-outline" size={22} color={Colors.white} />
              </Pressable>
              
              {/* Logout Button: No Alert, Just Direct Action */}
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.iconBtn, 
                  styles.logoutBtn,
                  { opacity: pressed ? 0.5 : 1 }
                ]}
                hitSlop={15}
              >
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              </Pressable>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={16} color={Colors.accent} />
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={16} color={Colors.accent} />
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Submit Daily Report</Text>
            </View>

            <StyledInput label="City" value={reportCity} onChangeText={setReportCity} error={errors.city} icon="location-outline" />
            <StyledInput label="Date" value={date} onChangeText={setDate} error={errors.date} icon="calendar-outline" />
            <StyledInput label="Note" value={note} onChangeText={setNote} error={errors.note} icon="create-outline" multiline />

            <Pressable onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
              <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit Report"}</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 14 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topBarLeft: { flex: 1 },
  topBarRight: { flexDirection: "row", gap: 10 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  subGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  logoutBtn: { backgroundColor: "rgba(255,82,82,0.12)", borderColor: "rgba(255,82,82,0.3)" },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, flexDirection: "row" },
  infoItem: { flex: 1, alignItems: "center" },
  infoDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  infoValue: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.white },
  submitBtn: { backgroundColor: Colors.accent, borderRadius: 12, padding: 15, alignItems: "center" },
  submitText: { color: Colors.white, fontWeight: 'bold' },
});
