import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  FileText, 
  Settings, 
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileSidebar({ visible, onClose }: ProfileSidebarProps) {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLogout = () => {
    onClose();
    logout();
    router.replace('/login');
  };

  const getKYCBadge = () => {
    if (!user) return null;

    const badges = {
      not_submitted: {
        icon: <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />,
        text: 'No verificado',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
      },
      pending: {
        icon: <Clock size={16} color="#3B82F6" strokeWidth={2} />,
        text: 'En revisión',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      verified: {
        icon: <CheckCircle2 size={16} color="#10B981" strokeWidth={2} />,
        text: 'Verificado',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      },
      rejected: {
        icon: <XCircle size={16} color="#EF4444" strokeWidth={2} />,
        text: 'Rechazado',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
      },
    };

    const badge = badges[user.kyc_status as keyof typeof badges];
    if (!badge) return null;

    return (
      <View className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${badge.bgColor} self-start`}>
        {badge.icon}
        <Text className={`text-sm font-semibold ${badge.textColor}`}>
          {badge.text}
        </Text>
      </View>
    );
  };

  const showVerifyOption = user && (user.kyc_status === 'not_submitted' || user.kyc_status === 'rejected');

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'black',
          opacity: backdropOpacity,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          backgroundColor: 'white',
          transform: [{ translateX: slideAnim }],
        }}
        className="shadow-2xl"
      >
        {/* Header */}
        <View className="pt-12 px-6 pb-6 bg-gray-50">
          <Pressable
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mb-6 self-end shadow-sm"
          >
            <X size={24} color="#1A3044" strokeWidth={2} />
          </Pressable>

          {/* User Info */}
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
              <Text className="text-white text-3xl font-bold">
                {user.first_name?.[0] || user.username[0].toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </Text>
            <Text className="text-sm text-gray-600 mb-3">{user.email}</Text>
            {getKYCBadge()}
          </View>
        </View>

        {/* Menu Items */}
        <View className="flex-1 pt-4">
          {/* Verify Account - Only if not verified */}
          {showVerifyOption && (
            <Pressable
              onPress={() => {
                onClose();
                router.push('/kyc-verification');
              }}
              className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
            >
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-4">
                <AlertTriangle size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Verificar cuenta
                </Text>
                <Text className="text-sm text-gray-600">
                  Completa tu verificación KYC
                </Text>
              </View>
            </Pressable>
          )}

          {/* My Profile */}
          <Pressable
            onPress={() => {
              onClose();
              // router.push('/profile');
            }}
            className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <UserIcon size={20} color="#1A3044" strokeWidth={2} />
            </View>
            <Text className="text-base text-gray-900">Mi perfil</Text>
          </Pressable>

          {/* My Transactions */}
          <Pressable
            onPress={() => {
              onClose();
              // router.push('/transactions');
            }}
            className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <FileText size={20} color="#1A3044" strokeWidth={2} />
            </View>
            <Text className="text-base text-gray-900">Mis transacciones</Text>
          </Pressable>

          {/* Settings */}
          <Pressable
            onPress={() => {
              onClose();
              // router.push('/settings');
            }}
            className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Settings size={20} color="#1A3044" strokeWidth={2} />
            </View>
            <Text className="text-base text-gray-900">Configuración</Text>
          </Pressable>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center px-6 py-4 active:bg-gray-50"
          >
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
              <LogOut size={20} color="#EF4444" strokeWidth={2} />
            </View>
            <Text className="text-base text-red-600 font-semibold">Cerrar sesión</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}