import { ScreenHeader } from "@/components/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useAppColors } from "@/hooks/useAppColors";
import { AppColors } from "@/interfaces/color";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Helper to get initials from a full name (e.g., "Juan Dela Cruz" -> "JC")
const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);

  // Push notifications state
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Pull user data and logout function from our AuthContext
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Note: AuthGuard in _layout.tsx will automatically redirect to /(auth)/sign-in
      // once the user state becomes null, so we don't strictly need router.replace here.
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userName = user?.name || "Unknown User";
  const userEmail = user?.email || "No email provided";
  const initials = getInitials(userName);

  // Format permission: "fuel" -> "Fuel", or default to "Pending"
  const rawPermission = user?.prefs?.permission;
  const getPermissionLabel = (perm?: string) => {
    if (!perm) return "Pending";
    switch (perm) {
      case "all":
        return "All Orders";
      case "general":
        return "General";
      case "fuel":
        return "Fuel";
      default:
        return perm.charAt(0).toUpperCase() + perm.slice(1);
    }
  };

  const permissionBadge = getPermissionLabel(rawPermission);

  // If using Google Auth, you can save the Google picture URL to prefs.avatar_url during signup
  const avatarUrl = user?.prefs?.avatar_url;

  return (
    <>
      <ScreenHeader title="Profile" enableBackground={true} />
      <View style={styles.container}>
        {/* --- Top Card: User Info & Logout --- */}
        <View style={styles.card}>
          <View style={styles.userProfile}>
            <Avatar size={48}>
              {avatarUrl && <AvatarImage source={{ uri: avatarUrl }} />}
              <AvatarFallback textStyle={{ fontSize: 18 }}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.userName}>
                  {userName}
                </Text>

                <View style={styles.badgeContainer}>
                  <View
                    style={[
                      styles.badgeDot,
                      // Change dot color if they are still pending
                      !rawPermission && { backgroundColor: colors.destructive },
                    ]}
                  />
                  <Text style={styles.badgeText}>{permissionBadge}</Text>
                </View>
              </View>

              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>

          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Logout"
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.primaryForeground}
              />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Change Password Button --- */}
        {user?.passwordUpdate && (
          <View style={styles.secondaryActionContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/profile/change-password")}
              accessibilityRole="button"
              accessibilityLabel="Change Password"
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={colors.accentForeground}
              />
              <Text style={styles.secondaryButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- Menu List --- */}
        <View style={styles.menuContainer}>
          {/* Help Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/help")}
            accessibilityRole="button"
            accessibilityLabel="Help and Feedback"
          >
            <View style={styles.menuItemLeft}>
              <FontAwesome5
                name="headset"
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={styles.menuItemText}>Help & Feedback</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          {/* Settings Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/settings")}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="settings-sharp"
                size={20}
                color={colors.mutedForeground}
              />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          {/* About Item */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/about")}
            accessibilityRole="button"
            accessibilityLabel="About"
          >
            <View style={styles.menuItemLeft}>
              <Entypo name="info" size={20} color={colors.mutedForeground} />
              <Text style={styles.menuItemText}>About</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 22,
      gap: 22,
    },
    card: {
      gap: 16,
      flexDirection: "column",
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 16,
      backgroundColor: colors.accent,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    // User Profile Section
    userProfile: {
      flexDirection: "row",
      gap: 12,
    },
    userDetails: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    userName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      color: colors.accentForeground,
      flexShrink: 1,
    },
    userEmail: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    // Badge Styles
    badgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 99,
      borderWidth: 1,
      backgroundColor: colors.accent,
      borderColor: colors.border,
      marginRight: Platform.OS === "ios" ? 0 : 10,
      gap: 6,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    // Button Commons
    button: {
      flex: 1,
      gap: 4,
      flexDirection: "row",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    // Logout Button
    actionButtonContainer: {
      height: 40,
    },
    logoutButton: {
      backgroundColor: colors.primary,
    },
    logoutButtonText: {
      fontFamily: "Inter_600SemiBold",
      color: colors.primaryForeground,
    },
    // Secondary Button (Change Password)
    secondaryActionContainer: {
      height: 40,
      paddingHorizontal: 16,
    },
    secondaryButton: {
      backgroundColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontFamily: "Inter_600SemiBold",
      color: colors.accentForeground,
    },
    // Menu Section
    menuContainer: {
      backgroundColor: colors.accent,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginHorizontal: 16,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuItemText: {
      fontFamily: "Inter_500Medium",
      fontSize: 16,
      color: colors.accentForeground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 50,
    },
  });
