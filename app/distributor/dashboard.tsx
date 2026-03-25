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

  useEffect(() => {
    const backAction = () => {
      Alert.alert("MKM Distributor", "Kya aap app band karna chahte hain?", [
        { text: "Nahi", style: "cancel" },
        { text: "Haan", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Kya aap logout karna chahte hain?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
          try {
            await logout();
            router.replace("/");
          } catch (e) {
            console.log(e);
          }
        } 
      }
    ]);
  };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!reportCity.trim()) e.city = "City is required";
    if (!date.trim()) e.date = "Date is required";
    if (!note.trim()) e.note = "Note is required";
    
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
      Alert.alert("Error", "Submit nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} style={styles.container}>
      {/* Logout Button: Absolute Positioned for Max Priority */}
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: 20,
            top: topInset + 10,
            zIndex: 9999, // Sab se upar
            width: 45,
            height: 45,
            borderRadius: 22.5,
            backgroundColor: pressed ? 'rgba(255,82,82,0.4)' : 'rgba(255,82,82,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,82,82,0.5)',
          }
        ]}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff5252" />
      </Pressable>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 },
          ]}
          keyboardShouldPersistTaps="always"
        >
          {/* Header Content */}
          <View style={styles.topBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0] || "User"}</Text>
              <Text style={styles.subGreeting}>{user?.phone}</Text>
            </View>
            {/* Space for absolute button */}
            <View style={{ width: 50 }} />
          </View>

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

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Submit Daily Report</Text>
            </View>

            <StyledInput label="City" value={reportCity} onChangeText={setReportCity} icon="location-outline" error={errors.city} />
            <StyledInput label="Date" value={date} onChangeText={setDate} icon="calendar-outline" error={errors.date} />
            <StyledInput label="Note" value={note} onChangeText={setNote} icon="create-outline" multiline error={errors.note} />

            <Pressable onPress={handleSubmit} disabled={loading} style={[styles.submitBtn, loading && { opacity: 0.6 }]}>
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
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 15 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  greeting: { fontSize: 22, color: Colors.white, fontWeight: 'bold' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, flexDirection: 'row' },
  infoItem: { flex: 1, alignItems: 'center' },
  infoDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10 },
  infoValue: { color: Colors.white, fontSize: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  submitBtn: { backgroundColor: Colors.accent, padding: 15, borderRadius: 12, alignItems: 'center' },
  submitText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});
