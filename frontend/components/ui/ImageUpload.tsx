import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface ImageUploadProps {
  label: string;
  onImageSelected: (uri: string) => void;
  imageUri?: string;
  validationMessage?: string;
  validationStatus?: 'success' | 'error' | 'warning' | null;
}

export function ImageUpload({ 
  label, 
  onImageSelected, 
  imageUri,
  validationMessage,
  validationStatus 
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a la galería');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    onImageSelected('');
  };

  const getValidationColor = () => {
    switch (validationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return null;
    }
  };

  return (
    <View className="w-full mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      
      {!imageUri ? (
        <Pressable
          onPress={pickImage}
          disabled={isLoading}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 items-center justify-center active:bg-gray-100"
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#8BC53F" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center px-4">
                Toca para seleccionar imagen
              </Text>
            </>
          )}
        </Pressable>
      ) : (
        <View className="relative">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-40 rounded-xl"
            resizeMode="cover"
          />
          <Pressable
            onPress={removeImage}
            className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </Pressable>
        </View>
      )}

      {validationMessage && (
        <View className="flex-row items-center mt-2">
          {getValidationIcon() && (
            <Ionicons 
              name={getValidationIcon()!} 
              size={16} 
              color={validationStatus === 'success' ? '#16A34A' : validationStatus === 'error' ? '#DC2626' : '#CA8A04'} 
            />
          )}
          <Text className={`text-sm ml-1 ${getValidationColor()}`}>
            {validationMessage}
          </Text>
        </View>
      )}
    </View>
  );
}