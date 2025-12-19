import { View, Text } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="px-4 py-6 bg-navy">
      <Text className="text-3xl font-bold text-white mb-1">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-base text-primary-light">
          {subtitle}
        </Text>
      )}
    </View>
  );
}