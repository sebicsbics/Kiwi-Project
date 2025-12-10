import { View, Text, Image, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Input, Button } from '@/components/ui';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');

    // Validate username
    if (!username) {
      setUsernameError('Nombre de usuario necesario');
      return;
    }

    // Validate email
    if (!email) {
      setEmailError('Email necesario');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Porfavor ingrese un email válido');
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError('Contraseña necesaria');
      return;
    }
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username,
        email,
        password,
        password2: confirmPassword,
      });
      // Navigation will be handled by _layout.tsx
      Alert.alert('Éxito', 'Cuenta creada exitosamente');
    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.data) {
        if (error.data.username) {
          errorMessage = Array.isArray(error.data.username) 
            ? error.data.username[0] 
            : error.data.username;
        } else if (error.data.email) {
          errorMessage = Array.isArray(error.data.email) 
            ? error.data.email[0] 
            : error.data.email;
        } else if (error.data.password) {
          errorMessage = Array.isArray(error.data.password) 
            ? error.data.password[0] 
            : error.data.password;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    Alert.alert('Próximamente', `Inicio de sesión con ${provider} estará disponible pronto`);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        {/* Back Button */}
        <Pressable 
          onPress={() => router.back()}
          className="mb-4"
        >
          <AntDesign name="left" size={24} color="#1A3044" />
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

        {/* Username Input */}
        <View className="mb-4">
          <Input
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameError('');
            }}
            autoCapitalize="none"
            error={usernameError}
          />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Input
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            secureTextEntry
            error={passwordError}
          />
        </View>

        {/* Confirm Password Input */}
        <View className="mb-4">
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setPasswordError('');
            }}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSignUp}
          className="mb-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            'Sign up'
          )}
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