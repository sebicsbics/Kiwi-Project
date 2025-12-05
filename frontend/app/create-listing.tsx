import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useState } from 'react';
import { ArrowLeft, ImagePlus, ChevronDown, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Input, Button } from '@/components/ui';

// Mock seller data
const SELLER_DATA = {
  name: 'Sebastian Davalos Rosas',
  avatar: 'https://i.pravatar.cc/100?u=sebastian',
};

const CONDITIONS = [
  'Nuevo',
  'Usado - como nuevo',
  'Usado - buen estado',
  'Usado - aceptable',
];

export default function CreateListingScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 10) {
      Alert.alert('Limit reached', 'You can only add up to 10 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!title || !price || !condition) {
      Alert.alert('Missing fields', 'Please fill in all required fields');
      return;
    }

    // TODO: Implement publish logic
    Alert.alert('Success', 'Listing published successfully!');
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
          >
            <ArrowLeft size={24} color="#1A3044" strokeWidth={2} />
          </Pressable>
          <Text className="text-xl font-semibold text-gray-900">
            New listing
          </Text>
          <Pressable onPress={handlePublish}>
            <Text className="text-base font-semibold text-primary">
              Publish
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Seller Info */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
          <Image
            source={{ uri: SELLER_DATA.avatar }}
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {SELLER_DATA.name}
            </Text>
            <View className="flex-row items-center gap-1">
            </View>
          </View>
        </View>

        {/* Add Photos Section */}
        <View className="px-4 py-6 items-center">
          <Pressable
            onPress={pickImage}
            className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-3"
          >
            <ImagePlus size={32} color="#1A3044" strokeWidth={2} />
          </Pressable>
          <Text className="text-base font-semibold text-gray-900 mb-1">
            Add photos
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Photos: {photos.length}/10 · Choose your listing's main photo first.
          </Text>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <View className="w-full mt-4 flex-row flex-wrap gap-2">
              {photos.map((photo, index) => (
                <Pressable
                  key={index}
                  onPress={() => removePhoto(index)}
                  className="relative"
                >
                  <Image
                    source={{ uri: photo }}
                    className="w-20 h-20 rounded-lg"
                  />
                  <View className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 items-center justify-center">
                    <Text className="text-white text-xs font-bold">×</Text>
                  </View>
                  {index === 0 && (
                    <View className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary rounded">
                      <Text className="text-white text-xs font-semibold">Main</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View className="px-4 pb-6 gap-4">
          {/* Title */}
          <Input
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Price */}
          <Input
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Condition Dropdown */}
          <Pressable
            onPress={() => setShowConditionPicker(!showConditionPicker)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex-row items-center justify-between"
          >
            <Text className={condition ? 'text-gray-900' : 'text-gray-400'}>
              {condition || 'Condition'}
            </Text>
            <ChevronDown size={20} color="#9CA3AF" strokeWidth={2} />
          </Pressable>

          {/* Condition Options */}
          {showConditionPicker && (
            <View className="border border-gray-200 rounded-lg overflow-hidden">
              {CONDITIONS.map((cond) => (
                <Pressable
                  key={cond}
                  onPress={() => {
                    setCondition(cond);
                    setShowConditionPicker(false);
                  }}
                  className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                >
                  <Text className="text-base text-gray-900">{cond}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Description */}
          <View>
            <Input
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className="h-24"
              style={{ textAlignVertical: 'top' }}
            />
            <Text className="text-sm text-gray-500 mt-1">Optional</Text>
          </View>

          {/* Location */}
          <View className="mt-4">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Location
            </Text>
            <View className="flex-row items-center gap-2">
              <MapPin size={20} color="#6B7280" strokeWidth={2} />
              <Text className="text-base text-gray-600">
                Cochabamba, Bolivia
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}