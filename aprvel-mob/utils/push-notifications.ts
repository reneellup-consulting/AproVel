import { account } from '@/lib/appwrite';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ID } from 'react-native-appwrite';

export async function registerAppwritePushTarget() {
  if (!Device.isDevice) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    // IMPORTANT: Get the NATIVE token (FCM/APNs), NOT the Expo Push Token
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData.data;

    // Register this device to the currently logged-in Appwrite user
    await account.createPushTarget({
      targetId: ID.unique(),
      identifier: token,
      providerId: '69995d97002c73d725de',
    });
    console.log('Appwrite Push Target registered successfully');
  } catch (error: any) {
    // Appwrite throws a 409 if the target already exists, which is safe to ignore
    if (error.code !== 409) {
      console.error('Failed to register push target:', error);
    }
  }
}
