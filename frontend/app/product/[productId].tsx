import { View, ScrollView, Text, Image, Pressable, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { X, PersonStanding, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';
import { contractsService, type Contract } from '@/services/contracts';
import { storage } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Recién publicado';
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper function to format price
const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price);
  return `Bs.${numPrice.toFixed(2)}`;
};

export default function ProductDetailScreen() {
  const { user } = useAuth();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContract();
  }, [productId]);

  const loadContract = async () => {
    if (!productId) {
      setError('ID de contrato no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await storage.getAccessToken();
      
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para ver este contrato');
        router.replace('/login');
        return;
      }

      const contractData = await contractsService.getContract(parseInt(productId as string), token);
      setContract(contractData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      setError(err.message || 'No se pudo cargar el contrato');
      Alert.alert('Error', err.message || 'No se pudo cargar el contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(currentIndex);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text className="text-gray-600 mt-4">Cargando contrato...</Text>
      </View>
    );
  }

  if (error || !contract) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
        <Text className="text-gray-600 text-center mb-6">{error || 'Contrato no encontrado'}</Text>
        <Button variant="primary" onPress={() => router.back()}>
          Volver
        </Button>
      </View>
    );
  }

  const images = contract.photos.length > 0 
    ? contract.photos.map(photo => photo.image)
    : ['https://picsum.photos/400/300?random=1'];

  const sellerName = contract.seller.first_name && contract.seller.last_name
    ? `${contract.seller.first_name} ${contract.seller.last_name}`
    : contract.seller.username;

  const sellerInitial = contract.seller.first_name?.[0] || contract.seller.username[0].toUpperCase();

  // Check if user is involved in the contract (seller or buyer)
  const isUserInvolved = user && (
    contract.seller.id === user.id || 
    (contract.buyer && contract.buyer.id === user.id)
  );

  // Show tracking button if user is involved and contract is not in DRAFT
  const showTrackingButton = isUserInvolved && contract.status !== 'DRAFT';

  return (
    <View className="flex-1 bg-white">
      {/* Sticky Header with X button */}
      <View className="absolute top-0 left-0 right-0 z-50 pt-12 px-4 pb-4 bg-transparent">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
        >
          <X size={24} color="#000" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                className="w-screen h-80"
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-2">
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Information */}
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {contract.title}
          </Text>
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            {formatPrice(contract.price)}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            {formatDate(contract.created_at)}
          </Text>
          <View className="flex-row items-center gap-1 mb-2">
            <PersonStanding size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-sm text-gray-600">
              Cochabamba, Bolivia
            </Text>
          </View>
          
          {/* Status Badge */}
          <View className="flex-row items-center gap-2 mb-6">
            <View className="px-3 py-1 bg-primary/10 rounded-full">
              <Text className="text-sm font-semibold text-primary">
                {contract.status}
              </Text>
            </View>
            <View className="px-3 py-1 bg-gray-100 rounded-full">
              <Text className="text-sm font-semibold text-gray-700">
                Código: {contract.access_code}
              </Text>
            </View>
          </View>
        </View>

        {/* All Content - No Tabs */}
        <View className="px-4 pb-24">
          {/* Description Section */}
          {contract.description && (
            <>
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Descripción
                </Text>
                <Text className="text-base text-gray-700 leading-6">
                  {contract.description}
                </Text>
              </View>
              <View className="h-px bg-gray-200 mb-6" />
            </>
          )}

          {/* Seller Information Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Información del vendedor
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {sellerInitial}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {sellerName}
                </Text>
                <Text className="text-sm text-gray-600">
                  {contract.seller.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Separator */}
          <View className="h-px bg-gray-200 mb-6" />

          {/* Details Section */}
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Detalles
            </Text>
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-base text-gray-600">Condición</Text>
              <Text className="text-base font-semibold text-gray-900">
                {contract.condition}
              </Text>
            </View>
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-base text-gray-600">ID del Contrato</Text>
              <Text className="text-base font-semibold text-gray-900">
                {contract.id}
              </Text>
            </View>
            <View className="flex-row justify-between py-3 border-b border-gray-200">
              <Text className="text-base text-gray-600">Código de Acceso</Text>
              <Text className="text-base font-semibold text-gray-900">
                {contract.access_code}
              </Text>
            </View>
          </View>

          {/* Tracking Button Section */}
          {showTrackingButton && (
            <>
              <View className="h-px bg-gray-200 my-6" />
              <View>
                <Pressable
                  onPress={() => router.push(`/contract-tracking?contractId=${contract.id}`)}
                  className="bg-primary/10 rounded-xl p-4 flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      Seguimiento del Contrato
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Ver el estado actual de tu transacción
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                    <MapPin size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        {showTrackingButton ? (
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onPress={() => router.push(`/contract-tracking?contractId=${contract.id}`)}
            >
              Seguimiento
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onPress={() => {
                Alert.alert('Próximamente', 'La funcionalidad de pago estará disponible pronto');
              }}
            >
              Realizar pago
            </Button>
          </View>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={() => {
              Alert.alert('Próximamente', 'La funcionalidad de pago estará disponible pronto');
            }}
          >
            Realizar pago
          </Button>
        )}
      </View>
    </View>
  );
}