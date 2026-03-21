import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, onValue, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

interface Report {
  id: string;
  city: string;
  date: string;
  note: string;
  submittedAt: number;
  editedAt?: number;
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

export default function AdminDistributorDetail() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { id, name, shopName, city } = useLocalSearchParams<{
    id: string;
    name: string;
    shopName: string;
    city: string;
  }>();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Double Tap States
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const clearTimerRef = useRef<any>(null);
  const deleteTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    const reportsRef = ref(db, `reports/${id}`);
    const unsub = onValue(reportsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Report[] = Object.entries(data)
          .map(([rid, val]: any) => ({ id: rid, ...val }))
          .filter((r) => isCurrentMonth(r.submittedAt))
          .sort((a, b) => b.submittedAt - a.submittedAt);
        setReports(list);
      } else {
        setReports([]);
      }
      setLoading(false);
    }, (err) => {
      setErrorMsg("Failed to load reports.");
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleDeleteMonthlyData = async () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setIsConfirmingClear(false), 3000);
      return;
    }

    try {
      const updates: Record<string, null> = {};
      reports.forEach((r) => {
        updates[`reports/${id}/${r.id}`] = null;
      });
      await update(ref(db), updates);
      setIsConfirmingClear(false);
    } catch {
      setErrorMsg("Could not clear reports.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }

    try {
      await remove(ref(db, `distributors/${id}`));
      await remove(ref(db, `reports/${id}`));
      router.back();
    } catch {
      setErrorMsg("Could not delete account.");
    }
  };

  return (
    <LinearGradient colors={Colors.gradient as any} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subtitle}>{shopName} • {city}</Text>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileShop}>{shopName}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.metaChip}><Text style={styles.metaChipText}>{city}</Text></View>
              <View style={styles.metaChip}><Text style={styles.metaChipText}>{id}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, styles.warnBtn, isConfirmingClear && { backgroundColor: Colors.warning }]}
            onPress={handleDeleteMonthlyData}
          >
            <Ionicons name="calendar-outline" size={18} color={isConfirmingClear ? Colors.white : Colors.warning} />
            <Text style={[styles.actionBtnText, { color: isConfirmingClear ? Colors.white : Colors.warning }]}>
              {isConfirmingClear ? "Confirm Clear?" : "Clear Month"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.dangerBtn, isConfirmingDelete && { backgroundColor: Colors.error }]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={18} color={isConfirmingDelete ? Colors.white : Colors.error} />
            <Text style={[styles.actionBtnText, { color: isConfirmingDelete ? Colors.white : Colors.error }]}>
              {isConfirmingDelete ? "Confirm Delete?" : "Delete Account"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reports — {getCurrentMonthLabel()}</Text>
          <View style={styles.countBadge}><Text style={styles.countBadgeText}>{reports.length}</Text></View>
        </View>

        {loading ? (
          <View style={styles.centered}><ActivityIndicator color={Colors.accent} size="large" /></View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Colors.whiteAlpha30} />
            <Text style={styles.emptyTitle}>No Reports This Month</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{report.city}</Text></View>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
                <Text style={styles.reportNote}>{report.note}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.whiteAlpha15, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.white },
  subtitle: { fontSize: 12, color: Colors.whiteAlpha60 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,82,82,0.1)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,82,82,0.3)' },
  errorText: { color: Colors.error, fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  profileCard: { backgroundColor: Colors.cardBg, borderRadius: 16, borderWidth: 1, borderColor: Colors.whiteAlpha15, padding: 16, flexDirection: "row", gap: 14, alignItems: "center" },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,180,216,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.accent },
  avatarText: { fontSize: 22, fontFamily: "Poppins_700Bold", color: Colors.accent },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 16, fontFamily: "Poppins_700Bold", color: Colors.white },
  profileShop: { fontSize: 12, color: Colors.whiteAlpha60 },
  profileMeta: { flexDirection: "row", gap: 6 },
  metaChip: { backgroundColor: "rgba(0,180,216,0.1)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  metaChipText: { fontSize: 10, color: Colors.accent },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  warnBtn: { backgroundColor: "rgba(255,179,0,0.1)", borderColor: "rgba(255,179,0,0.3)" },
  dangerBtn: { backgroundColor: "rgba(255,82,82,0.1)", borderColor: "rgba(255,82,82,0.3)" },
  actionBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", color: Colors.white, flex: 1 },
  countBadge: { backgroundColor: "rgba(0,180,216,0.2)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: Colors.accent },
  countBadgeText: { fontSize: 12, fontFamily: "Poppins_700Bold", color: Colors.accent },
  centered: { alignItems: "center", paddingVertical: 40 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, color: Colors.whiteAlpha60 },
  list: { gap: 10 },
  reportCard: { backgroundColor: Colors.cardBg, borderRadius: 14, borderWidth: 1, borderColor: Colors.whiteAlpha15, padding: 14, gap: 8 },
  reportHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { backgroundColor: "rgba(0,180,216,0.15)", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 10, color: Colors.accent },
  reportDate: { fontSize: 11, color: Colors.whiteAlpha60 },
  reportNote: { fontSize: 14, color: Colors.white, lineHeight: 21 },
});
