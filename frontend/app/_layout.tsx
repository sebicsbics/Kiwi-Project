import { Stack, useRouter, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/shared";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./global.css";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onSignup = segments[0] === 'signup';
    const onLogin = segments[0] === 'login';

    // Don't redirect while on signup page
    if (onSignup) return;

    if (!isAuthenticated && !inAuthGroup && !onLogin && !onSignup) {
      router.replace('/login');
    } else if (isAuthenticated && (onLogin || onSignup)) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time - show splash for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}