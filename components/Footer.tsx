import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Designed and Developed by Toseef Bhatti | 
           Instructions by Amir Shahzad
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    fontSize: 10,
    color: Colors.whiteAlpha60,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0.2,
  },
});
