import { View, Text, ScrollView, Pressable, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { CircleUser } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';

// Types
type TransactionStatus = 'pending' | 'accepted' | 'sent';

interface Transaction {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  status: TransactionStatus;
  statusText: string;
  amount: number;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    userName: 'Eleanor Pena',
    userAvatar: 'https://i.pravatar.cc/100?u=eleanor',
    date: '15 May 2023',
    status: 'pending',
    statusText: 'Enviado',
    amount: 275.43
  },
  {
    id: '2',
    userName: 'Darrell Steward',
    userAvatar: 'https://i.pravatar.cc/100?u=darrell',
    date: '15 May 2023',
    status: 'accepted',
    statusText: 'Aceptado',
    amount: 275.43
  }
];

// Helper functions
const formatCurrency = (amount: number): string => {
  return `+$${amount.toFixed(2)}`;
};

const getStatusBadgeColor = (status: TransactionStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-[#F5C542]';
    case 'accepted':
      return 'bg-primary-dark';
    default:
      return 'bg-gray-400';
  }
};

// Transaction Card Component
function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm">
      {/* Avatar */}
      <Image
        source={{ uri: transaction.userAvatar }}
        className="w-12 h-12 rounded-full"
      />
      
      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-navy mb-1">
          {transaction.userName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-500">
            {transaction.date}
          </Text>
          <View className={`px-2 py-1 rounded-full ${getStatusBadgeColor(transaction.status)}`}>
            <Text className="text-xs text-white font-medium">
              {transaction.statusText}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Amount */}
      <Text className="text-base font-bold text-primary ml-2">
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
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
  const [activeTab, setActiveTab] = useState('home');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  const cardMargin = useRef(new Animated.Value(0)).current;
  const cardRadius = useRef(new Animated.Value(0)).current;
  const state1Opacity = useRef(new Animated.Value(1)).current;
  const state2Opacity = useRef(new Animated.Value(0)).current;

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
                {/* Profile Icon - Left */}
                <Pressable className="p-2">
                  <CircleUser size={28} color="#FFFFFF" strokeWidth={2} />
                </Pressable>

                {/* Logo - Center */}
                <Image
                  source={require('@/assets/images/logo-Kiwi-contrast.png')}
                  className="w-20 h-20"
                  resizeMode="contain"
                />

                {/* Notification Icon - Right */}
                <Pressable className="p-2">
                  <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
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
        <ScrollView className="flex-1 pt-6">

          {/* Last Transactions Section */}
          <View className="px-6">
            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-navy">
                Últimas transacciones
              </Text>
              <Pressable>
                <Text className="text-primary font-semibold">
                  Ver todo
                </Text>
              </Pressable>
            </View>

            {/* Transaction Cards */}
            {mockTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
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