import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface StyledInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export function StyledInput({
  label,
  error,
  icon,
  isPassword = false,
  ...props
}: StyledInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={Colors.whiteAlpha60}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.whiteAlpha60}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={Colors.whiteAlpha60}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: Colors.whiteAlpha80,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha30,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputError: {
    borderColor: Colors.error,
  },
  icon: {},
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Poppins_400Regular",
    padding: 0,
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    fontFamily: "Poppins_400Regular",
    marginLeft: 2,
  },
});
