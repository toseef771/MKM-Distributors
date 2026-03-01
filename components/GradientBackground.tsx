import React, { ReactNode } from "react";
import { StyleSheet, View, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Footer } from "@/components/Footer";

interface GradientBackgroundProps {
  children: ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
}

export function GradientBackground({
  children,
  scrollable = false,
  noPadding = false,
}: GradientBackgroundProps) {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const content = (
    <View
      style={[
        styles.inner,
        !noPadding && {
          paddingTop: topInset + 16,
          paddingBottom: bottomInset + 16,
          paddingHorizontal: 20,
        },
        noPadding && { paddingTop: topInset },
      ]}
    >
      {children}
      <Footer />
    </View>
  );

  return (
    <LinearGradient
      colors={Colors.gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
});
