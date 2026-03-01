import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, onValue, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { StyledInput } from "@/components/StyledInput";
import { StyledButton } from "@/components/StyledButton";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

interface Report {
  id: string;
  city: string;
  date: string;
  note: string;
  submittedAt: number;
}

function getCurrentMonthLabel() {
  const d = new Date();
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

function isCurrentMonth(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function DistributorHistory() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!user?.phone) return;
    const reportsRef = ref(db, `reports/${user.phone}`);
    const unsub = onValue(reportsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Report[] = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .filter((r) => isCurrentMonth(r.submittedAt))
          .sort((a, b) => b.submittedAt - a.submittedAt);
        setReports(list);
      } else {
        setReports([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user?.phone]);

  const handleEdit = (report: Report) => {
    setEditReport(report);
    setEditNote(report.note);
  };

  const handleSaveEdit = async () => {
    if (!editReport || !user?.phone) return;
    if (!editNote.trim()) {
      Alert.alert("Error", "Note cannot be empty.");
      return;
    }
    setEditLoading(true);
    try {
      await update(ref(db, `reports/${user.phone}/${editReport.id}`), {
        note: editNote.trim(),
        editedAt: Date.now(),
      });
      setEditReport(null);
    } catch {
      Alert.alert("Error", "Could not save changes.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My History</Text>
            <Text style={styles.subtitle}>{getCurrentMonthLabel()}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={Colors.whiteAlpha30} />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
              No reports submitted for this month.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportMeta}>
                    <View style={styles.badge}>
                      <Ionicons name="location" size={12} color={Colors.accent} />
                      <Text style={styles.badgeText}>{report.city}</Text>
                    </View>
                    <Text style={styles.reportDate}>{report.date}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleEdit(report)}
                    style={styles.editBtn}
                  >
                    <Ionicons name="create-outline" size={18} color={Colors.accent} />
                  </Pressable>
                </View>
                <Text style={styles.reportNote}>{report.note}</Text>
                <Text style={styles.reportTime}>
                  {new Date(report.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Footer />
      </ScrollView>

      <Modal
        visible={!!editReport}
        animationType="slide"
        transparent
        onRequestClose={() => setEditReport(null)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Report</Text>
                <Pressable onPress={() => setEditReport(null)}>
                  <Ionicons name="close" size={24} color={Colors.white} />
                </Pressable>
              </View>
              <Text style={styles.modalSub}>
                {editReport?.city} • {editReport?.date}
              </Text>
              <StyledInput
                label="Note / Description"
                value={editNote}
                onChangeText={setEditNote}
                multiline
                numberOfLines={5}
                style={{ minHeight: 100, textAlignVertical: "top" } as any}
              />
              <StyledButton
                title="Save Changes"
                onPress={handleSaveEdit}
                loading={editLoading}
              />
              <StyledButton
                title="Cancel"
                onPress={() => setEditReport(null)}
                variant="secondary"
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontFamily: "Poppins_700Bold", color: Colors.white },
  subtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.whiteAlpha60 },
  emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha30, textAlign: "center" },
  list: { gap: 12 },
  reportCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 16,
    gap: 8,
  },
  reportHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reportMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,180,216,0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: Colors.accent },
  reportDate: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,180,216,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  reportNote: { fontSize: 14, fontFamily: "Poppins_400Regular", color: Colors.white, lineHeight: 22 },
  reportTime: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
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
