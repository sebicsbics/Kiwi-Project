import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui";
import { Card, CardHeader, CardContent } from "@/components/ui";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 py-6">
        <Card className="mb-4">
          <CardHeader>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Home Screen
            </Text>
          </CardHeader>
          
          <CardContent>
            <Text className="text-gray-600 dark:text-gray-300 mb-4">
              Welcome to the Kiwi app home screen!
            </Text>
            
            <View className="gap-3">
              <Button variant="primary" onPress={() => router.back()}>
                Go Back
              </Button>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}