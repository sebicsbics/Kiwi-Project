import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSendReset = () => {
    console.log('Send reset email to:', email);
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Login with:', provider);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-6 py-12">
          {/* Back Button */}
          <Pressable 
            onPress={() => router.back()}
            className="mb-8"
          >
            <AntDesign name="arrowleft" size={24} color="#1A3044" />
          </Pressable>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-gray-600 mb-8">
            Enter Email Address
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <Input
              placeholder="name@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Back to Login Link */}
          <Pressable 
            onPress={() => router.push('/login')}
            className="mb-6"
          >
            <Text className="text-sm text-primary text-center">
              Back to login in
            </Text>
          </Pressable>

          {/* Send Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSendReset}
            className="mb-6"
          >
            Send
          </Button>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-sm text-gray-500">Or</Text>
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
              onPress={() => handleSocialLogin('Apple')}
              className="w-14 h-14 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
            >
              <AntDesign name="apple1" size={24} color="#000000" />
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
    </KeyboardAvoidingView>
  );
}