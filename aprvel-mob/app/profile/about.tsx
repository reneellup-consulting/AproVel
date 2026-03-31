import { ScreenHeader } from "@/components/screen-header";
import { useAppColors } from "@/hooks/useAppColors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFinalHeaderHeight } from "@/hooks/useFinalHeaderHeight";
import { AppColors } from "@/interfaces/color";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AboutScreen = () => {
  const finalHeaderHeight = useFinalHeaderHeight();

  const colors = useAppColors();

  const styles = makeStyles(colors);

  const { colorScheme } = useColorScheme(); // Get current scheme

  // Mock handlers for links
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <ScreenHeader
        title="About"
        enableBackground={true}
        showBackButton={true}
      />
      <View style={[styles.container, { paddingTop: finalHeaderHeight }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Branding Section --- */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              {/* TODO: if colorScheme=='light' logo_light.png alse logo_dark.png */}
              <Image
                source={
                  colorScheme === "dark"
                    ? require("@/assets/images/logo_dark.png")
                    : require("@/assets/images/logo_light.png")
                }
                style={styles.logoImage}
                resizeMode="contain"
              />
              {/* <Ionicons name='cube' size={48} color={colors.primary} /> */}
            </View>
            <Text style={styles.appName}>AproVel</Text>
            <Text style={styles.appDescription}>
              Mobile purchase approval solution for GS Gavel Logistics Co. Inc.
            </Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                Version {Constants.expoConfig?.version || "Unknown"} (Build{" "}
                {Constants.expoConfig?.android?.versionCode ||
                  Constants.expoConfig?.ios?.buildNumber ||
                  "Unknown"}
                )
              </Text>
            </View>
          </View>

          {/* --- Legal & Info Card --- */}
          <Text style={styles.sectionTitle}>Legal & Information</Text>
          <View style={styles.card}>
            <MenuItem
              label="Privacy Policy"
              icon="shield-checkmark-outline"
              onPress={() =>
                openLink("https://aprovel.gavellogistics.com/privacy-policy")
              }
              styles={styles}
              colors={colors}
            />
            <View style={styles.separator} />
            <MenuItem
              label="Terms of Service"
              icon="document-text-outline"
              onPress={() =>
                openLink("https://aprovel.gavellogistics.com/terms-of-service")
              }
              styles={styles}
              colors={colors}
            />
          </View>

          {/* --- Company Card --- */}
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.card}>
            <MenuItem
              label="Visit Website"
              icon="globe-outline"
              onPress={() => openLink("https://aprovel.gavellogistics.com")}
              styles={styles}
              colors={colors}
            />
            {/* <View style={styles.separator} /> */}
            {/* <MenuItem
              label='Rate on App Store'
              icon='star-outline'
              onPress={() =>
                openLink('market://details?id=com.gavel_logistics.aprvelmob')
              }
            /> */}
          </View>

          <Text style={styles.copyright}>
            Designed & Developed by Renee L. Llup.{"\n"}© 2026 Hyper Solutions
            PH. All rights reserved.
          </Text>
        </ScrollView>
      </View>
    </>
  );
};

// Reusable Menu Item Component
const MenuItem = ({
  label,
  icon,
  onPress,
  styles,
  colors,
}: {
  label: string;
  icon: any;
  onPress: () => void;
  styles: any;
  colors: any;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Ionicons name={icon} size={20} color={colors.mutedForeground} />
      <Text style={styles.menuItemText}>{label}</Text>
    </View>
    <Ionicons name="open-outline" size={16} color={colors.border} />
  </TouchableOpacity>
);

export default AboutScreen;

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 24, // Spacing between major sections
      paddingBottom: 40,
    },
    // Branding Styles
    brandSection: {
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
      marginTop: 10,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 20,
      backgroundColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 24,
      fontFamily: "Inter_600SemiBold",
      color: colors.accentForeground,
    },
    appDescription: {
      textAlign: "center",
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      maxWidth: "80%",
      lineHeight: 20,
    },
    versionBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.accent,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    versionText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    // Section Styles
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: -16, // Pull closer to card
      marginLeft: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuItemText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.accentForeground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 48, // Indent to align with text
    },
    copyright: {
      textAlign: "center",
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 18,
      marginTop: 8,
    },
    logoImage: {
      width: 80,
      height: 80,
    },
  });
