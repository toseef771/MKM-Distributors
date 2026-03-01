import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import Colors from "@/constants/colors";

interface Distributor {
  phone: string;
  name: string;
  shopName: string;
  city: string;
  createdAt: number;
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { logout } = useAuth();

  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const distRef = ref(db, "distributors");
    const unsub = onValue(distRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list: Distributor[] = Object.entries(data).map(([phone, val]: any) => ({
          phone,
          ...val,
        }));
        list.sort((a, b) => b.createdAt - a.createdAt);
        setDistributors(list);
      } else {
        setDistributors([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = distributors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.shopName.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  );

  const handleDeleteAccount = (dist: Distributor) => {
    Alert.alert(
      "Delete Account",
      `Permanently delete ${dist.name}'s account and all their reports?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(ref(db, `distributors/${dist.phone}`));
              await remove(ref(db, `reports/${dist.phone}`));
            } catch {
              Alert.alert("Error", "Could not delete account.");
            }
          },
        },
      ]
    );
  };

  const doLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch {
      router.replace("/");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Logout from admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]
    );
  };

  return (
    <LinearGradient colors={Colors.gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: bottomInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>MKM Distributor Hub</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={22} color={Colors.accent} />
            <Text style={styles.statNum}>{distributors.length}</Text>
            <Text style={styles.statLabel}>Distributors</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={22} color={Colors.accent} />
            <Text style={styles.statNum}>
              {new Set(distributors.map((d) => d.city)).size}
            </Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.whiteAlpha60} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search distributors..."
            placeholderTextColor={Colors.whiteAlpha60}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.whiteAlpha60} />
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.accent} size="large" />
            <Text style={styles.loadingText}>Loading distributors...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.whiteAlpha30} />
            <Text style={styles.emptyTitle}>
              {search ? "No Results Found" : "No Distributors Yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search ? "Try a different search term." : "Registered distributors will appear here."}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((dist) => (
              <Pressable
                key={dist.phone}
                style={({ pressed }) => [styles.distCard, pressed && styles.cardPressed]}
                onPress={() =>
                  router.push({
                    pathname: "/admin/distributor/[id]",
                    params: { id: dist.phone, name: dist.name, shopName: dist.shopName, city: dist.city },
                  })
                }
              >
                <View style={styles.distAvatar}>
                  <Text style={styles.distAvatarText}>
                    {dist.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.distInfo}>
                  <Text style={styles.distName}>{dist.name}</Text>
                  <Text style={styles.distShop}>{dist.shopName}</Text>
                  <View style={styles.distMeta}>
                    <View style={styles.metaChip}>
                      <Ionicons name="location" size={10} color={Colors.accent} />
                      <Text style={styles.metaChipText}>{dist.city}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="call" size={10} color={Colors.accent} />
                      <Text style={styles.metaChipText}>{dist.phone}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.distActions}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(dist);
                    }}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </Pressable>
                  <Ionicons name="chevron-forward" size={18} color={Colors.whiteAlpha30} />
                </View>
              </Pressable>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold", color: Colors.white },
  subtitle: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,82,82,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,82,82,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 26, fontFamily: "Poppins_700Bold", color: Colors.white },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.white,
    padding: 0,
  },
  centered: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.whiteAlpha60 },
  emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha30, textAlign: "center" },
  list: { gap: 10 },
  distCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardPressed: { opacity: 0.8 },
  distAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,180,216,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  distAvatarText: { fontSize: 18, fontFamily: "Poppins_700Bold", color: Colors.accent },
  distInfo: { flex: 1, gap: 2 },
  distName: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: Colors.white },
  distShop: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Colors.whiteAlpha60 },
  distMeta: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,180,216,0.12)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaChipText: { fontSize: 10, fontFamily: "Poppins_400Regular", color: Colors.accent },
  distActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,82,82,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
