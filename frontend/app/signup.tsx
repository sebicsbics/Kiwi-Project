import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    console.log('Sign up with:', email, password);
  };

  const handleSocialSignUp = (provider: string) => {
    console.log('Sign up with:', provider);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        {/* Back Button */}
        <Pressable 
          onPress={() => router.back()}
          className="mb-4"
        >
          <AntDesign name="arrowleft" size={24} color="#1A3044" />
        </Pressable>

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
          Create your Account
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

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSignUp}
          className="mb-6"
        >
          Sign up
        </Button>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-sm text-gray-500">Or sign up with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Social Sign Up Buttons */}
        <View className="flex-row justify-center gap-4 mb-8">
          <Pressable
            onPress={() => handleSocialSignUp('Google')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <AntDesign name="google" size={24} color="#DB4437" />
          </Pressable>

          <Pressable
            onPress={() => handleSocialSignUp('Facebook')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <FontAwesome name="facebook" size={24} color="#1877F2" />
          </Pressable>

          <Pressable
            onPress={() => handleSocialSignUp('Twitter')}
            className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
          >
            <AntDesign name="twitter" size={24} color="#1DA1F2" />
          </Pressable>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text className="text-primary font-semibold">Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}