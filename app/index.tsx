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

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const scale1 = useSharedValue(0.85);
  const scale2 = useSharedValue(0.85);

  useEffect(() => {
    scale1.value = withDelay(200, withSpring(1, { damping: 14 }));
    scale2.value = withDelay(400, withSpring(1, { damping: 14 }));
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
            <Ionicons name="medical" size={38} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>MKM Distributor</Text>
          <Text style={styles.tagline}>Medicine Distribution Management</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(250)} style={styles.chooseTxt}>
          <Text style={styles.chooseLabel}>Choose Your Panel</Text>
        </Animated.View>

        <View style={styles.cardsContainer}>
          {/* DISTRIBUTOR PANEL BUTTON */}
          <Animated.View style={[styles.cardWrap, card1Style]}>
            <Pressable
              style={({ pressed }) => [styles.card, styles.cardDistributor, pressed && styles.cardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/distributor/login");
              }}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person" size={28} color={Colors.accent} />
                </View>
                <View style={styles.cardTexts}>
                  <Text style={styles.panelTitle}>Distributor Panel</Text>
                  <Text style={styles.panelSub}>Submit & view daily reports</Text>
                </View>
              </View>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={20} color={Colors.accent} />
              </View>
            </Pressable>
          </Animated.View>

          {/* ADMIN PANEL BUTTON */}
          <Animated.View style={[styles.cardWrap, card2Style]}>
            <Pressable
              style={({ pressed }) => [styles.card, styles.cardAdmin, pressed && styles.cardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/admin/login");
              }}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconCircle, styles.adminIconCircle]}>
                  <Ionicons name="shield-checkmark" size={28} color={Colors.white} />
                </View>
                <View style={styles.cardTexts}>
                  <Text style={[styles.panelTitle, styles.adminPanelTitle]}>Admin Panel</Text>
                  <Text style={[styles.panelSub, styles.adminPanelSub]}>Manage distributors & data</Text>
                </View>
              </View>
              <View style={[styles.arrowCircle, styles.adminArrowCircle]}>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </View>
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
    paddingHorizontal: 22,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.whiteAlpha15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent,
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: Colors.white,
    marginBottom: 4,
    textAlign: "center",
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.whiteAlpha60,
    textAlign: "center",
  },
  chooseTxt: {
    marginBottom: 18,
    alignItems: "center",
  },
  chooseLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.whiteAlpha60,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  cardWrap: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  cardDistributor: {
    backgroundColor: "rgba(0,180,216,0.18)",
    borderColor: Colors.accent,
  },
  cardAdmin: {
    backgroundColor: Colors.whiteAlpha15,
    borderColor: Colors.whiteAlpha30,
  },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,180,216,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  adminIconCircle: {
    backgroundColor: Colors.whiteAlpha15,
    borderColor: Colors.whiteAlpha30,
  },
  cardTexts: { flex: 1 },
  panelTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.accent,
    marginBottom: 4,
  },
  adminPanelTitle: {
    color: Colors.white,
  },
  panelSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(0,180,216,0.75)",
    lineHeight: 18,
  },
  adminPanelSub: {
    color: Colors.whiteAlpha60,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,180,216,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  adminArrowCircle: {
    backgroundColor: Colors.whiteAlpha10,
    borderColor: Colors.whiteAlpha30,
  },
});
