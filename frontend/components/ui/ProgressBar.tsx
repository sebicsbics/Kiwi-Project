import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
}

export function ProgressBar({ progress, showPercentage = true }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View className="w-full">
      <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
      {showPercentage && (
        <Text className="text-xs text-gray-600 mt-1 text-right">
          {clampedProgress}%
        </Text>
      )}
    </View>
  );
}