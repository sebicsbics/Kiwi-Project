import { View, ScrollView, Text, Image, Pressable, Dimensions } from 'react-native';
import { useState } from 'react';
import { X, PersonStanding } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data - In a real app, this would fetch from an API based on productId
const getProductData = (productId: string) => ({
  id: productId,
  title: `SSD 500 Gb`,
  price: 'Bs.350',
  listedTime: 'Just listed · 11 hours ago',
  location: 'Nearby · 4 km',
  description: `SSD de 500 Gb marca KINGSTON, con programas ISO como Windows 25H2, OFFICE 365 y WPI 2024, WhatsApp 75952323. Product ID: ${productId}`,
  images: [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
  ],
  seller: {
    name: 'Edgar Jinés',
    avatar: 'https://i.pravatar.cc/100?u=edgar',
    joinedYear: '2019',
  },
  condition: 'New',
});

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get product data based on productId
  const PRODUCT_DATA = getProductData(productId || '');

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(currentIndex);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Sticky Header with X button */}
      <View className="absolute top-0 left-0 right-0 z-50 pt-12 px-4 pb-4 bg-transparent">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
        >
          <X size={24} color="#000" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {PRODUCT_DATA.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                className="w-screen h-80"
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-2">
            {PRODUCT_DATA.images.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Information */}
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {PRODUCT_DATA.title}
          </Text>
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            {PRODUCT_DATA.price}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            {PRODUCT_DATA.listedTime}
          </Text>
          <View className="flex-row items-center gap-1 mb-6">
            <PersonStanding size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-sm text-gray-600">
              {PRODUCT_DATA.location}
            </Text>
          </View>
        </View>

        {/* All Content - No Tabs */}
        <View className="px-4 pb-24">
          {/* Description Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Description
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              {PRODUCT_DATA.description}
            </Text>
          </View>

          {/* Separator */}
          <View className="h-px bg-gray-200 mb-6" />

          {/* Seller Information Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Seller information
            </Text>
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: PRODUCT_DATA.seller.avatar }}
                className="w-12 h-12 rounded-full"
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {PRODUCT_DATA.seller.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  Joined Kiwi in {PRODUCT_DATA.seller.joinedYear}
                </Text>
              </View>
            </View>
          </View>

          {/* Separator */}
          <View className="h-px bg-gray-200 mb-6" />

          {/* Details Section */}
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Details
            </Text>
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-base text-gray-600">Condition</Text>
              <Text className="text-base font-semibold text-gray-900">
                {PRODUCT_DATA.condition}
              </Text>
            </View>
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-base text-gray-600">Product ID</Text>
              <Text className="text-base font-semibold text-gray-900">
                {PRODUCT_DATA.id}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onPress={() => {
            // Handle payment action
            console.log('Realizar pago pressed for product:', PRODUCT_DATA.id);
          }}
        >
          Realizar pago
        </Button>
      </View>
    </View>
  );
}