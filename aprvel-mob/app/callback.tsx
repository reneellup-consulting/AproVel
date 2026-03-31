import { ActivityIndicator, View } from 'react-native';

export default function CallbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' color='#ff6900' />
    </View>
  );
}
