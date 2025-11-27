import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo */}
        <Image
          source={require('@/assets/images/logo-Kiwi.png')}
          className="w-40 h-40 mb-12"
          resizeMode="contain"
        />

        {/* Title */}
        <Text className="text-3xl font-bold text-navy text-center mb-2">
          Bienvenido a Kiwi
        </Text>
        <Text className="text-base text-gray-600 text-center mb-12 px-4">
          Compra y vende de forma segura
        </Text>

        {/* Navigation Buttons */}
        <View className="w-full gap-4">
          {/* Login Button */}
          <Pressable 
            className="bg-primary rounded-full py-4 px-6 shadow-lg active:opacity-90"
            onPress={() => router.push('/login')}
          >
            <Text className="text-center font-semibold text-base text-white">
              Iniciar Sesión
            </Text>
          </Pressable>

          {/* Home Button */}
          <Pressable 
            className="bg-navy rounded-full py-4 px-6 shadow-lg active:opacity-90"
            onPress={() => router.push('/home')}
          >
            <Text className="text-center font-semibold text-base text-white">
              Ir al Home
            </Text>
          </Pressable>

          {/* KYC Button */}
          <Pressable 
            className="bg-white border-2 border-primary rounded-full py-4 px-6 shadow-lg active:opacity-90"
            onPress={() => router.push('/kyc-verification')}
          >
            <Text className="text-center font-semibold text-base text-primary">
              Verificación KYC
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}