import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context";
import { useTheme } from "@/lib/appTheme";
import { Icon } from "@/lib/layout";

interface AppHeaderProps {
  name?: string;
  subtitle?: string;
  onNotificationPress?: () => void;
}

export default function AppHeader({ name, subtitle, onNotificationPress }: AppHeaderProps) {
  const { theme } = useTheme();
  const { role } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName = name || (role === "manager" ? "Admin" : "CS Specialist");
  const displaySubtitle = subtitle || (role === "manager" ? "CS Admin" : "Customer Success");
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join("");

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.palette.primary.main,
      paddingHorizontal: 16,
      paddingTop: insets.top,
      paddingBottom: 16
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      maxWidth: 1120,
      width: "100%",
      alignSelf: "center",
      gap: 12
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      minWidth: 0
    },
    textContainer: {
      flex: 1,
      minWidth: 0
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    avatarText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700"
    },
    name: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.2
    },
    subtitle: {
      color: "rgba(255,255,255,0.75)",
      fontSize: 11,
      marginTop: 1
    },
    right: {
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    notificationBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center"
    }
  });

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{displaySubtitle}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <TouchableOpacity style={styles.notificationBtn} onPress={onNotificationPress} activeOpacity={0.7}>
            <Icon name="bell" type="feather" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
