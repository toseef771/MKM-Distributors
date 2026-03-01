import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: ViewStyle;
}

export function StyledButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: StyledButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantStyles = {
    primary: { backgroundColor: Colors.accent },
    secondary: { backgroundColor: Colors.whiteAlpha15, borderWidth: 1, borderColor: Colors.whiteAlpha30 },
    danger: { backgroundColor: Colors.error },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.accent },
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.text, variant === "ghost" && styles.ghostText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  text: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  ghostText: {
    color: Colors.accent,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
