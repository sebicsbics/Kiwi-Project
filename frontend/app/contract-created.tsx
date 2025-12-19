import { View, Text, ScrollView, Pressable, Share, Alert } from 'react-native';
import { CheckCircle, Copy, Share2, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/ui';

export default function ContractCreatedScreen() {
  const params = useLocalSearchParams();
  const { contractId, accessCode, qrData } = params;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(accessCode as string);
    Alert.alert('Copiado', 'Código copiado al portapapeles');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este producto en Kiwi!\n\nCódigo: ${accessCode}\nLink: ${qrData}`,
        title: 'Compartir producto',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewContract = () => {
    router.replace(`/product/${contractId}`);
  };

  const handleClose = () => {
    router.replace('/home');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="w-10" />
          <Text className="text-xl font-semibold text-gray-900">
            ¡Contrato Creado!
          </Text>
          <Pressable onPress={handleClose} className="w-10 h-10 items-center justify-center">
            <X size={24} color="#1A3044" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View className="items-center pt-8 pb-6">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <CheckCircle size={48} color="#10B981" strokeWidth={2} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            ¡Publicación exitosa!
          </Text>
          <Text className="text-base text-gray-600 text-center px-6">
            Tu producto ya está disponible. Comparte el código o QR con compradores interesados.
          </Text>
        </View>

        {/* QR Code Section */}
        <View className="px-6 py-6">
          <View className="bg-white rounded-2xl border-2 border-gray-200 p-6 items-center">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Código QR
            </Text>
            
            <View className="bg-white p-4 rounded-xl">
              <QRCode
                value={qrData as string}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>

            <Text className="text-sm text-gray-600 mt-4 text-center">
              Los compradores pueden escanear este código para ver tu producto
            </Text>
          </View>
        </View>

        {/* Access Code Section */}
        <View className="px-6 pb-6">
          <View className="bg-primary/10 rounded-2xl border-2 border-primary/20 p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3 text-center">
              Código de Acceso
            </Text>
            
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-3xl font-bold text-primary text-center tracking-widest">
                {accessCode}
              </Text>
            </View>

            <Pressable
              onPress={handleCopyCode}
              className="flex-row items-center justify-center gap-2 py-3 bg-white rounded-xl border border-gray-300"
            >
              <Copy size={20} color="#1A3044" strokeWidth={2} />
              <Text className="text-base font-semibold text-gray-900">
                Copiar código
              </Text>
            </Pressable>

            <Text className="text-sm text-gray-600 mt-3 text-center">
              Los compradores también pueden ingresar este código manualmente
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 pb-8 gap-3">
          <Button
            variant="primary"
            size="lg"
            onPress={handleShare}
            className="flex-row items-center justify-center gap-2"
          >
            <Share2 size={20} color="#FFFFFF" strokeWidth={2} />
            <Text className="text-white font-semibold text-base">
              Compartir
            </Text>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onPress={handleViewContract}
          >
            Ver contrato
          </Button>

          <Pressable onPress={handleClose} className="py-3">
            <Text className="text-primary text-center font-semibold">
              Volver al inicio
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}