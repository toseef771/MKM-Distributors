import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "distributor") {
      router.replace("/distributor/dashboard");
    } else if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [user]);

  const scale1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.8);

  useEffect(() => {
    scale1.value = withDelay(300, withSpring(1, { damping: 15 }));
    scale2.value = withDelay(500, withSpring(1, { damping: 15 }));
  }, []);

  const card1Style = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }] }));
  const card2Style = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }] }));

  return (
    <LinearGradient
      colors={Colors.gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.inner, { paddingTop: topInset + 24, paddingBottom: bottomInset + 16 }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={36} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>MKM Distributor</Text>
          <Text style={styles.tagline}>Medicine Distribution Management</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300)} style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Select Your Panel</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        <View style={styles.cardsContainer}>
          <Animated.View style={[styles.cardWrap, card1Style]}>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/distributor/login");
              }}
            >
              <LinearGradient
                colors={["rgba(0,180,216,0.3)", "rgba(0,180,216,0.1)"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIconWrap}>
                  <Ionicons name="person" size={32} color={Colors.accent} />
                </View>
                <Text style={styles.cardTitle}>Distributor</Text>
                <Text style={styles.cardSubtitle}>Submit daily reports & view history</Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={18} color={Colors.accent} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.cardWrap, card2Style]}>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/admin/login");
              }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.cardIconWrap, styles.adminIconWrap]}>
                  <Ionicons name="shield-checkmark" size={32} color={Colors.white} />
                </View>
                <Text style={[styles.cardTitle, styles.adminTitle]}>Admin</Text>
                <Text style={[styles.cardSubtitle, styles.adminSubtitle]}>
                  Manage distributors & reports
                </Text>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={18} color={Colors.whiteAlpha80} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        <Footer />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.whiteAlpha30,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.whiteAlpha60,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardsContainer: {
    gap: 16,
    flex: 1,
  },
  cardWrap: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
  },
  cardPressed: { opacity: 0.85 },
  cardGradient: {
    flex: 1,
    padding: 24,
    gap: 6,
  },
  cardIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,180,216,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  adminIconWrap: {
    backgroundColor: Colors.whiteAlpha15,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.accent,
  },
  adminTitle: { color: Colors.white },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(0,180,216,0.8)",
    lineHeight: 20,
  },
  adminSubtitle: { color: Colors.whiteAlpha60 },
  cardArrow: {
    marginTop: "auto",
    alignSelf: "flex-end",
  },
});
