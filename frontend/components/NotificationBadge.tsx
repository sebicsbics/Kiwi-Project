import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { notificationsService } from '@/services/notifications';
import { storage } from '@/utils/storage';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) return;
      
      const count = await notificationsService.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 9 ? '9+' : unreadCount}
      </Text>
    </View>
  );
}