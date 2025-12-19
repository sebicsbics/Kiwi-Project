import { View, Image } from 'react-native';

export function SplashScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Image
        source={require('@/assets/images/logo-Kiwi.png')}
        className="w-64 h-64"
        resizeMode="contain"
      />
    </View>
  );
}