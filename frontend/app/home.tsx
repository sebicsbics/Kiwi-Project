import { View, Text, ScrollView, Pressable, Image, Animated, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { CircleUser, LogOut } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { contractsService, type MyTransaction } from '@/services/contracts';
import { storage } from '@/utils/storage';

// Helper functions
const formatCurrency = (price: string): string => {
  const numPrice = parseFloat(price);
  return `Bs.${numPrice.toFixed(2)}`;
};

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

const getStatusInfo = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'DRAFT':
      return { text: 'Borrador', color: 'bg-gray-400' };
    case 'AWAITING_PAYMENT':
      return { text: 'Por pagar', color: 'bg-[#F5C542]' };
    case 'LOCKED':
      return { text: 'En Custodia', color: 'bg-blue-500' };
    case 'IN_TRANSIT':
      return { text: 'En Tránsito', color: 'bg-purple-500' };
    case 'RELEASED':
      return { text: 'Liberado', color: 'bg-green-500' };
    case 'COMPLETED':
      return { text: 'Completado', color: 'bg-primary-dark' };
    case 'DISPUTED':
      return { text: 'En Disputa', color: 'bg-red-500' };
    case 'REFUNDED':
      return { text: 'Reembolsado', color: 'bg-orange-500' };
    default:
      return { text: status, color: 'bg-gray-400' };
  }
};

// Transaction Card Component
function TransactionCard({ transaction, onPress }: { transaction: MyTransaction; onPress: () => void }) {
  const statusInfo = getStatusInfo(transaction.status);
  const otherPartyInitial = transaction.other_party_name?.[0]?.toUpperCase() || '?';

  return (
    <Pressable 
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm active:opacity-70"
    >
      {/* Avatar or Photo */}
      {transaction.main_photo ? (
        <Image
          source={{ uri: transaction.main_photo }}
          className="w-12 h-12 rounded-full"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
          <Text className="text-white text-lg font-bold">{otherPartyInitial}</Text>
        </View>
      )}
      
      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-navy mb-1" numberOfLines={1}>
          {transaction.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-500">
            {formatDate(transaction.created_at)}
          </Text>
          <View className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
            <Text className="text-xs text-white font-medium">
              {statusInfo.text}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          {transaction.role === 'seller' ? 'Comprador' : 'Vendedor'}: {transaction.other_party_name}
        </Text>
      </View>
      
      {/* Amount */}
      <Text className="text-base font-bold text-primary ml-2">
        {formatCurrency(transaction.price)}
      </Text>
    </Pressable>
  );
}

// Bottom Tab Button Component
function TabButton({ 
  icon, 
  label, 
  isActive, 
  onPress 
}: { 
  icon: string; 
  label: string; 
  isActive: boolean; 
  onPress: () => void;
}) {
  const getIconComponent = () => {
    switch (icon) {
      case 'home':
        return <Ionicons name="home" size={24} color={isActive ? '#8BC53F' : '#1A3044'} />;
      case 'transaction':
        return <FontAwesome5 name="exchange-alt" size={20} color={isActive ? '#8BC53F' : '#1A3044'} />;
      case 'more':
        return <Ionicons name="ellipsis-horizontal" size={24} color={isActive ? '#8BC53F' : '#1A3044'} />;
      default:
        return null;
    }
  };

  return (
    <Pressable 
      onPress={onPress}
      className="flex-1 items-center justify-center py-3"
    >
      {getIconComponent()}
      <Text 
        className={`text-xs mt-1 ${isActive ? 'text-primary font-semibold' : 'text-navy opacity-60'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Main Home Screen
export default function Home() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const cardMargin = useRef(new Animated.Value(0)).current;
  const cardRadius = useRef(new Animated.Value(0)).current;
  const state1Opacity = useRef(new Animated.Value(1)).current;
  const state2Opacity = useRef(new Animated.Value(0)).current;

  // Load transactions
  const loadTransactions = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoadingTransactions(true);
      }
      
      const token = await storage.getAccessToken();
      if (!token) {
        console.log('No token available');
        return;
      }

      const data = await contractsService.getMyTransactions(token);
      setTransactions(data);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      // Don't show alert for silent refresh
      if (showLoader) {
        Alert.alert('Error', 'No se pudieron cargar las transacciones');
      }
    } finally {
      setIsLoadingTransactions(false);
      setIsRefreshing(false);
    }
  };

  // Refresh transactions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions(false);
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions(false);
  };

  const handleTransactionPress = (transaction: MyTransaction) => {
    router.push(`/product/${transaction.id}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    Animated.parallel([
      // Fade out the current state
      Animated.timing(state1Opacity, {
        toValue: showTransactionForm ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Fade in the new state
      Animated.timing(state2Opacity, {
        toValue: showTransactionForm ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      // Animate card properties
      Animated.timing(cardMargin, {
        toValue: showTransactionForm ? 24 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(cardRadius, {
        toValue: showTransactionForm ? 24 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [showTransactionForm]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header - Both states rendered, controlled by opacity */}
        <View className="relative">
          {/* State 1: Green background covering header (Iniciar nueva transacción) */}
          <Animated.View 
            style={{ 
              opacity: state1Opacity,
              position: showTransactionForm ? 'absolute' : 'relative',
              width: '100%',
              zIndex: showTransactionForm ? 0 : 1,
            }}
            pointerEvents={showTransactionForm ? 'none' : 'auto'}
          >
            <LinearGradient
              colors={['#8BC53F', '#A8DA63']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="pt-2 pb-6"
            >
              {/* Top Bar */}
              <View className="flex-row items-center justify-between px-6 pb-6">
                {/* User Info - Left */}
                <View className="flex-row items-center gap-2">
                  <CircleUser size={28} color="#FFFFFF" strokeWidth={2} />
                  <Text className="text-white font-semibold text-base">
                    {user?.username || 'Usuario'}
                  </Text>
                </View>

                {/* Logo - Center */}
                <Image
                  source={require('@/assets/images/logo-Kiwi-contrast.png')}
                  className="w-20 h-20"
                  resizeMode="contain"
                />

                {/* Logout Icon - Right */}
                <Pressable className="p-2" onPress={handleLogout}>
                  <LogOut size={24} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
              </View>

              {/* Title and Subtitle */}
              <View className="px-6 pb-6">
                <Text className="text-2xl font-bold text-white text-center mb-2">
                  Compra y vende de forma segura
                </Text>
                <Text className="text-sm text-white text-center opacity-90 leading-5">
                  Realiza transacciones con un proceso 100% seguro entre tú y tus socios
                </Text>
              </View>

              {/* Action Button */}
              <View className="px-6">
                <Pressable 
                  className="bg-white rounded-full py-4 px-6 shadow-lg active:opacity-90"
                  onPress={() => setShowTransactionForm(!showTransactionForm)}
                >
                  <Text className="text-center font-semibold text-base text-navy">
                    Iniciar nueva transacción
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* State 2: White header with green card below (Sell / Buy) */}
          <Animated.View 
            style={{ 
              opacity: state2Opacity,
              position: !showTransactionForm ? 'absolute' : 'relative',
              width: '100%',
              zIndex: showTransactionForm ? 1 : 0,
            }}
            pointerEvents={!showTransactionForm ? 'none' : 'auto'}
          >
            {/* Top Bar with white background */}
            <View className="bg-white pt-2 pb-6">
              <View className="flex-row items-center justify-between px-6 pb-6">
                {/* Profile Icon - Left */}
                <Pressable className="p-2">
                  <CircleUser size={28} color="#1A3044" strokeWidth={2} />
                </Pressable>

                {/* Logo - Center */}
                <Image
                  source={require('@/assets/images/logo-Kiwi.png')}
                  className="w-20 h-20"
                  resizeMode="contain"
                />

                {/* Notification Icon - Right */}
                <Pressable className="p-2">
                  <Ionicons name="notifications-outline" size={28} color="#1A3044" />
                </Pressable>
              </View>

              {/* Animated Gradient Card */}
              <Animated.View
                style={{
                  marginHorizontal: cardMargin,
                  borderRadius: cardRadius,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['#8BC53F', '#A8DA63']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  className="pb-6"
                >
                  {/* Title and Subtitle */}
                  <View className="px-6 pt-6 pb-6">
                    <Text className="text-2xl font-bold text-white text-center mb-2">
                      Compra y vende de forma segura
                    </Text>
                    <Text className="text-sm text-white text-center opacity-90 leading-5">
                      Realiza transacciones con un proceso 100% seguro entre tú y tus socios
                    </Text>
                  </View>

                  {/* Sell and Buy Buttons */}
                  <View className="px-6 mb-4">
                    <View className="flex-row gap-3">
                      <Pressable 
                        className="flex-1 bg-white rounded-2xl py-3.5 active:opacity-90"
                        onPress={() => router.push('/create-listing')}
                      >
                        <Text className="text-center font-semibold text-base text-navy">
                          Sell
                        </Text>
                      </Pressable>
                      <Pressable 
                        className="flex-1 bg-white rounded-2xl py-3.5 active:opacity-90"
                        onPress={() => router.push('/scan-or-enter-code')}
                      >
                        <Text className="text-center font-semibold text-base text-navy">
                          Buy
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Action Button */}
                  <View className="px-6">
                    <Pressable 
                      className="bg-navy rounded-full py-4 px-6 shadow-lg active:opacity-90"
                      onPress={() => setShowTransactionForm(!showTransactionForm)}
                    >
                      <Text className="text-center font-semibold text-base text-white">
                        Iniciar nueva transacción
                      </Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </Animated.View>
        </View>

        {/* Main Content */}
        <ScrollView 
          className="flex-1 pt-6"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#8BC53F']}
              tintColor="#8BC53F"
            />
          }
        >

          {/* Last Transactions Section */}
          <View className="px-6">
            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-navy">
                Mis transacciones
              </Text>
              {transactions.length > 3 && (
                <Pressable>
                  <Text className="text-primary font-semibold">
                    Ver todo
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Loading State */}
            {isLoadingTransactions ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#8BC53F" />
                <Text className="text-gray-500 mt-4">Cargando transacciones...</Text>
              </View>
            ) : transactions.length === 0 ? (
              /* Empty State */
              <View className="bg-white rounded-2xl p-8 items-center">
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4 text-base">
                  No tienes transacciones aún
                </Text>
                <Text className="text-gray-500 text-center mt-2 text-sm">
                  Comienza comprando o vendiendo un producto
                </Text>
              </View>
            ) : (
              /* Transaction Cards */
              transactions.slice(0, 5).map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction}
                  onPress={() => handleTransactionPress(transaction)}
                />
              ))
            )}
          </View>

          {/* Bottom spacing */}
          <View className="h-20" />
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="bg-white border-t border-gray-200">
          <View className="flex-row">
            <TabButton
              icon="home"
              label="Home"
              isActive={activeTab === 'home'}
              onPress={() => setActiveTab('home')}
            />
            <TabButton
              icon="transaction"
              label="Transaction"
              isActive={activeTab === 'transaction'}
              onPress={() => setActiveTab('transaction')}
            />
            <TabButton
              icon="more"
              label="More"
              isActive={activeTab === 'more'}
              onPress={() => setActiveTab('more')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}