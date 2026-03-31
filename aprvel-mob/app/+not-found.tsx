import { ScreenHeader } from '@/components/screen-header';
import { useAppColors } from '@/hooks/useAppColors';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const colors = useAppColors();
  return (
    <>
      <ScreenHeader
        title='Oops!'
        enableBackground={true}
        showBackButton={true}
      />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.foreground,
          }}
        >
          This screen does not exist.
        </Text>
      </View>
    </>
  );
}
