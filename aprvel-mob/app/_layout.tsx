import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect } from 'react';
import { LogBox, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

LogBox.ignoreLogs(['Encountered two children with the same key']);

import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';

import { TabBarProvider } from '@/components/tab-bar-provider';
import { ToastProvider } from '@/components/ui/toast';
import { useTabBarSettings } from '@/hooks/useTabBarSettings';
import { useThemeStorage } from '@/hooks/useThemeStorage';
import { Colors } from '@/theme/colors';
import { ThemeProvider } from '@/theme/theme-provider';
import { useFonts } from '@expo-google-fonts/inter/useFonts';

import { Inter_100Thin } from '@expo-google-fonts/inter/100Thin';
import { Inter_100Thin_Italic } from '@expo-google-fonts/inter/100Thin_Italic';
import { Inter_200ExtraLight } from '@expo-google-fonts/inter/200ExtraLight';
import { Inter_200ExtraLight_Italic } from '@expo-google-fonts/inter/200ExtraLight_Italic';
import { Inter_300Light } from '@expo-google-fonts/inter/300Light';
import { Inter_300Light_Italic } from '@expo-google-fonts/inter/300Light_Italic';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_400Regular_Italic } from '@expo-google-fonts/inter/400Regular_Italic';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_500Medium_Italic } from '@expo-google-fonts/inter/500Medium_Italic';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_600SemiBold_Italic } from '@expo-google-fonts/inter/600SemiBold_Italic';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_700Bold_Italic } from '@expo-google-fonts/inter/700Bold_Italic';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { Inter_800ExtraBold_Italic } from '@expo-google-fonts/inter/800ExtraBold_Italic';
import { Inter_900Black } from '@expo-google-fonts/inter/900Black';
import { Inter_900Black_Italic } from '@expo-google-fonts/inter/900Black_Italic';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import * as Notifications from 'expo-notifications';
import { useRouter, useSegments } from 'expo-router';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, status, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is in the auth group
    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign-in page
      router.replace('../(auth)/sign-in');
    } else if (!user && inAuthGroup) {
      // NEW: Allow access to sign-up and forgot-password pages
      const allowedRoutes = ['sign-up', 'forgot-password'];
      const currentRoute = segments[1] as string;

      if (!allowedRoutes.includes(currentRoute) && currentRoute !== 'sign-in') {
        // Redirect to sign-in page if user is in auth group but not on an allowed page
        router.replace('/(auth)/sign-in');
      }
    } else if (user && inAuthGroup) {
      // Depending on status, redirect to verify email, OID verification, or tabs
      if (status === 'active') {
        router.replace('/(tabs)');
      } else if (status === 'pending_email' && segments[1] !== 'verify-email') {
        router.replace('/(auth)/verify-email');
      } else if (status === 'pending_oid' && segments[1] !== 'verify-oid') {
        router.replace('/(auth)/verify-oid');
      }
    } else if (user && !inAuthGroup) {
      // NEW: Enforce verification for protected routes
      if (status === 'pending_email') {
        router.replace('/(auth)/verify-email');
      } else if (status === 'pending_oid') {
        router.replace('/(auth)/verify-oid');
      } else if (status === 'active' && segments[0] === 'callback') {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments, status]);

  if (isLoading) {
    // Return your splash screen placeholder here while loading session
    return null;
  }

  return <>{children}</>;
}

// Configure foreground behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const {
    colorScheme,
    themePreference,
    setTheme,
    isThemeLoaded: isThemeStorageLoaded,
  } = useThemeStorage();

  const router = useRouter();

  const { tabBarType, setTabBarType, isTabBarSettingsLoaded } =
    useTabBarSettings();

  const isThemeLoaded = isThemeStorageLoaded && isTabBarSettingsLoaded;

  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Inter_100Thin_Italic,
    Inter_200ExtraLight_Italic,
    Inter_300Light_Italic,
    Inter_400Regular_Italic,
    Inter_500Medium_Italic,
    Inter_600SemiBold_Italic,
    Inter_700Bold_Italic,
    Inter_800ExtraBold_Italic,
    Inter_900Black_Italic,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(
        colorScheme === 'light' ? 'dark' : 'light',
      );
    }
  }, [colorScheme]);

  useEffect(() => {
    setBackgroundColorAsync(
      colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
    );
  }, [colorScheme]);

  useEffect(() => {
    if (fontsLoaded && isThemeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isThemeLoaded]);

  // Determine background color for the stack container
  const backgroundColor =
    colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  useEffect(() => {
    // Listen for users tapping on the notification
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.orderId) {
          // Deep link to the order screen
          router.push(`/order/${data.orderId}`);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={{ colorScheme, themePreference, setTheme }}>
      <TabBarProvider
        value={{ tabBarType, setTabBarType, isLoaded: isTabBarSettingsLoaded }}
      >
        <QueryClientProvider client={queryClient}>
          {/* NEW: Wrap with AuthProvider */}
          <AuthProvider>
            <ToastProvider>
              <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
                {fontsLoaded && isThemeLoaded ? (
                  // NEW: Wrap with AuthGuard
                  <AuthGuard>
                    <StatusBar
                      style={colorScheme === 'dark' ? 'light' : 'dark'}
                      animated
                    />
                    <Stack
                      screenOptions={{
                        animation: 'slide_from_right',
                        presentation: 'card',
                        contentStyle: { backgroundColor },
                      }}
                    >
                      <Stack.Screen
                        name='(tabs)'
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name='(auth)'
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name='callback'
                        options={{ headerShown: false }}
                      />
                    </Stack>
                  </AuthGuard>
                ) : (
                  <View style={{ flex: 1, backgroundColor }} />
                )}
              </GestureHandlerRootView>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TabBarProvider>
    </ThemeProvider>
  );
}
