import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login with:', email, password);
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Login with:', provider);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require('@/assets/images/logo-Kiwi.png')}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-center text-gray-900 mb-8">
          Login to your Account
        </Text>

        {/* Email Input */}
        <View className="mb-4">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Forgot Password Link */}
        <View className="mb-6">
          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text className="text-sm text-primary text-right">
              ¿olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        {/* Sign In Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleLogin}
          className="mb-6"
        >
          Sign in
        </Button>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-sm text-gray-500">Or sign in with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-4 mb-8">
          <Pressable
            onPress={() => handleSocialLogin('Google')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <AntDesign name="google" size={24} color="#DB4437" />
          </Pressable>

          <Pressable
            onPress={() => handleSocialLogin('Facebook')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <FontAwesome name="facebook" size={24} color="#1877F2" />
          </Pressable>

          <Pressable
            onPress={() => handleSocialLogin('Twitter')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <AntDesign name="twitter" size={24} color="#1DA1F2" />
          </Pressable>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text className="text-primary font-semibold">Sign up</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}