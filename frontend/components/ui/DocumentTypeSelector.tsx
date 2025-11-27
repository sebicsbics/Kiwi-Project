import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DocumentType = 'id-card' | 'passport' | 'driver-license';

interface DocumentOption {
  type: DocumentType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const documentOptions: DocumentOption[] = [
  { type: 'id-card', label: 'Carnet de Identidad', icon: 'card-outline' },
  { type: 'passport', label: 'Pasaporte', icon: 'book-outline' },
  { type: 'driver-license', label: 'Licencia de Conducir', icon: 'car-outline' },
];

interface DocumentTypeSelectorProps {
  selectedType: DocumentType | null;
  onSelect: (type: DocumentType) => void;
}

export function DocumentTypeSelector({ selectedType, onSelect }: DocumentTypeSelectorProps) {
  return (
    <View className="w-full mb-6">
      <Text className="text-base font-semibold text-gray-800 mb-3">
        Selecciona el tipo de documento
      </Text>
      <View className="gap-3">
        {documentOptions.map((option) => (
          <Pressable
            key={option.type}
            onPress={() => onSelect(option.type)}
            className={`flex-row items-center p-4 rounded-xl border-2 ${
              selectedType === option.type
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${
                selectedType === option.type ? 'bg-primary' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={selectedType === option.type ? 'white' : '#6B7280'}
              />
            </View>
            <Text
              className={`ml-4 text-base font-medium ${
                selectedType === option.type ? 'text-primary-dark' : 'text-gray-700'
              }`}
            >
              {option.label}
            </Text>
            {selectedType === option.type && (
              <View className="ml-auto">
                <Ionicons name="checkmark-circle" size={24} color="#8BC53F" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}