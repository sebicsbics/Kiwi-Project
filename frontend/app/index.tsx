import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui";
import { Card, CardHeader, CardContent } from "@/components/ui";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 py-6">
        <Card className="mb-4">
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              NativeWind v4 Demo
            </Text>
          </CardHeader>
          
          <CardContent>
            <Text className="text-gray-600 dark:text-gray-300 mb-4">
              This project is configured with NativeWind v4, allowing you to use Tailwind CSS classes in React Native.
            </Text>
            
            <View className="gap-3">
              <Button variant="primary" onPress={() => router.push('/login')}>
                Go to Login
              </Button>
              
              <Button variant="secondary" onPress={() => router.push('/signup')}>
                Go to Sign Up
              </Button>
              
              <Button variant="outline" onPress={() => router.push('/forgot-password')}>
                Forgot Password
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Features
            </Text>
          </CardHeader>
          
          <CardContent>
            <View className="gap-3">
              <FeatureItem 
                title="Tailwind Classes" 
                description="Use className prop with Tailwind utilities"
              />
              <FeatureItem 
                title="Dark Mode" 
                description="Built-in dark mode support via dark: variant"
              />
              <FeatureItem 
                title="Platform Variants" 
                description="ios:, android:, web: specific styles"
              />
              <FeatureItem 
                title="TypeScript" 
                description="Full TypeScript support with strict mode"
              />
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Edit app/index.tsx to customize this screen
            </Text>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View className="flex-row gap-3">
      <View className="w-2 h-2 rounded-full bg-primary mt-2" />
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </Text>
      </View>
    </View>
  );
}