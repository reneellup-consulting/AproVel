import { ScreenHeader } from "@/components/screen-header";
import { useAppColors } from "@/hooks/useAppColors";
import { useFinalHeaderHeight } from "@/hooks/useFinalHeaderHeight";
import { AppColors } from "@/interfaces/color";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation on Android
const isFabricEnabled = (global as any)._IS_FABRIC_ === true;

if (
  Platform.OS === "android" &&
  !isFabricEnabled &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Animation Config for smoother "accordion" feel
const toggleAnimation = {
  duration: 300,
  update: {
    duration: 300,
    property: LayoutAnimation.Properties.opacity,
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    duration: 200,
    property: LayoutAnimation.Properties.opacity,
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

const FAQ_DATA = [
  {
    question: "How do I reset my password?",
    answer:
      'Go to the profile settings tab and select "Security." From there, you can choose "Change Password" to send a reset link to your email.',
    icon: "key-outline",
  },
  {
    question: "Where can I find my approval history?",
    answer:
      'Your approval history is located in the "Activity" tab. Filter by "Completed" to see all past approvals.',
    icon: "documents-outline",
  },
  {
    question: "How do I change my profile picture?",
    answer:
      "Tap your avatar in the top right corner of the Home screen, then click the camera icon to upload a new photo.",
    icon: "camera-outline",
  },
  {
    question: "Why am I not receiving notifications?",
    answer:
      'Please check your device settings to ensure notifications are allowed for Gavel Logistics. Also, check the "Notifications" section in the app settings.',
    icon: "notifications-off-outline",
  },
];

const HelpScreen = () => {
  const finalHeaderHeight = useFinalHeaderHeight();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const colors = useAppColors();

  const styles = makeStyles(colors);

  const handleToggleFaq = (index: number) => {
    LayoutAnimation.configureNext(toggleAnimation);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleEmailSupport = () => {
    Linking.openURL(
      "mailto:gscgavel48@gmail.com?subject=[APRVEL] App Support Request",
    );
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+639171790771");
  };

  return (
    <>
      <ScreenHeader
        title="Help & Feedback"
        enableBackground={true}
        showBackButton={true}
      />
      <View style={[styles.container, { paddingTop: finalHeaderHeight }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Section: Contact --- */}
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[
                styles.contactItem,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={handleEmailSupport}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle}>Email Customer Service</Text>
                <Text style={styles.itemSubtitle}>
                  Response within 24 hours
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleCallSupport}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle}>Call Support Line</Text>
                <Text style={styles.itemSubtitle}>Mon-Fri, 8am - 5pm</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* --- Section: FAQs --- */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.card}>
            {FAQ_DATA.map((item, index) => {
              const isLast = index === FAQ_DATA.length - 1;
              return (
                <View key={index}>
                  <FaqItem
                    question={item.question}
                    answer={item.answer}
                    icon={item.icon}
                    isExpanded={expandedIndex === index}
                    onToggle={() => handleToggleFaq(index)}
                    styles={styles}
                    colors={colors}
                  />
                  {!isLast && <View style={styles.separator} />}
                </View>
              );
            })}
          </View>

          {/* --- Footer --- */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>App Version 1.0.4 (Build 202)</Text>
            <Text style={styles.footerText}>
              © 2026 Hyper Solutions PH. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

// --- Helper Component ---
const FaqItem = ({
  question,
  answer,
  icon,
  isExpanded,
  onToggle,
  styles,
  colors,
}: {
  question: string;
  answer: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  styles: any;
  colors: any;
}) => {
  return (
    <View style={styles.faqWrapper}>
      <TouchableOpacity
        style={styles.contactItem}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isExpanded ? colors.primary : colors.mutedForeground}
        />
        <Text style={[styles.itemTitle, { flex: 1, fontSize: 14 }]}>
          {question}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default HelpScreen;

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      gap: 24,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: -16,
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
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemTitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.accentForeground,
    },
    itemSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 50,
    },
    faqWrapper: {
      backgroundColor: colors.accent,
    },
    answerContainer: {
      paddingLeft: 48,
      paddingRight: 16,
      paddingBottom: 16,
    },
    answerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    footer: {
      alignItems: "center",
      gap: 4,
      marginTop: 20,
    },
    footerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
  });
