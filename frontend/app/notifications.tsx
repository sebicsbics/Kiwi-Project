import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, CheckCircle2 } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/ui';
import { notificationsService, type Notification } from '@/services/notifications';
import { storage } from '@/utils/storage';

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Hace unos minutos';
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  
  return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
};

// Notification type icons and colors
const getNotificationStyle = (type: string): { icon: string; color: string } => {
  switch (type) {
    case 'FUNDS_LOCKED':
      return { icon: '🔒', color: 'bg-blue-500' };
    case 'PAYMENT_RECEIVED':
      return { icon: '💰', color: 'bg-green-500' };
    case 'PRODUCT_SHIPPED':
      return { icon: '📦', color: 'bg-purple-500' };
    case 'PRODUCT_RECEIVED':
      return { icon: '✅', color: 'bg-green-500' };
    case 'FUNDS_RELEASED':
      return { icon: '💸', color: 'bg-primary' };
    case 'DISPUTE_OPENED':
      return { icon: '⚠️', color: 'bg-red-500' };
    default:
      return { icon: '🔔', color: 'bg-gray-500' };
  }
};

// Notification Card Component
function NotificationCard({ 
  notification, 
  onPress 
}: { 
  notification: Notification; 
  onPress: () => void;
}) {
  const style = getNotificationStyle(notification.type);

  return (
    <Pressable
      onPress={onPress}
      className={`bg-white rounded-xl p-4 mb-3 border ${
        notification.is_read ? 'border-gray-200' : 'border-primary/30 bg-primary/5'
      } active:opacity-70`}
    >
      <View className="flex-row">
        {/* Icon */}
        <View className={`w-10 h-10 rounded-full ${style.color} items-center justify-center mr-3`}>
          <Text className="text-xl">{style.icon}</Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text className={`text-base flex-1 ${
              notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
            }`}>
              {notification.title}
            </Text>
            {!notification.is_read && (
              <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-1.5" />
            )}
          </View>
          
          <Text className="text-sm text-gray-600 mb-2 leading-5">
            {notification.message}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-500">
              {notification.contract_title}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDate(notification.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const token = await storage.getAccessToken();
      
      if (!token) {
        router.replace('/login');
        return;
      }

      const data = await notificationsService.getNotifications(token);
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      const token = await storage.getAccessToken();
      if (!token) return;

      // Mark as read
      if (!notification.is_read) {
        await notificationsService.markAsRead(notification.id, token);
        
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }

      // Navigate to contract tracking
      router.push(`/contract-tracking?contractId=${notification.contract_id}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) return;

      await notificationsService.markAllAsRead(token);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text className="text-gray-600 mt-4">Cargando notificaciones...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
            >
              <ArrowLeft size={24} color="#1A3044" strokeWidth={2} />
            </Pressable>
            <Text className="text-xl font-bold text-gray-900">
              Notificaciones
            </Text>
          </View>
          
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              className="px-3 py-1.5 bg-primary/10 rounded-full active:opacity-70"
            >
              <Text className="text-sm font-semibold text-primary">
                Marcar todas leídas
              </Text>
            </Pressable>
          )}
        </View>

        {unreadCount > 0 && (
          <Text className="text-sm text-gray-600">
            {unreadCount} {unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
          </Text>
        )}
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Bell size={48} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Error al cargar
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <Button variant="primary" onPress={() => loadNotifications()}>
            Reintentar
          </Button>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Bell size={64} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">
            Sin notificaciones
          </Text>
          <Text className="text-gray-600 text-center">
            Aquí aparecerán las actualizaciones de tus contratos
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#00B4D8"
            />
          }
        >
          {notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))}
          
          <View className="h-6" />
        </ScrollView>
      )}
    </View>
  );
}