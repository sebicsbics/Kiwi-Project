import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  tips: string[];
}

export function HelpModal({ visible, onClose, title, tips }: HelpModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white rounded-2xl w-full max-w-md">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                <Ionicons name="help-circle" size={24} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900 flex-1">
                {title}
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="max-h-96 p-6">
            <View className="gap-4">
              {tips.map((tip, index) => (
                <View key={index} className="flex-row gap-3">
                  <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center mt-0.5">
                    <Text className="text-primary-dark font-bold text-sm">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-gray-700 leading-6">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-6 border-t border-gray-200">
            <Pressable
              onPress={onClose}
              className="bg-primary rounded-lg py-3 items-center active:bg-primary-dark"
            >
              <Text className="text-white font-semibold text-base">
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}