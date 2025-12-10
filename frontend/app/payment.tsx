import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';
import { contractsService, type Contract, type Payment } from '@/services/contracts';
import { storage } from '@/utils/storage';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const { contractId } = params;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, [contractId]);

  const loadPaymentData = async () => {
    if (!contractId) {
      setError('ID de contrato no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await storage.getAccessToken();
      
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión');
        router.replace('/login');
        return;
      }

      // Load contract details
      const contractData = await contractsService.getContract(parseInt(contractId as string), token);
      setContract(contractData);

      // Initiate payment to get QR code
      const paymentData = await contractsService.initiatePayment(parseInt(contractId as string), token);
      setPayment(paymentData.payment);
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading payment:', err);
      setError(err.message || 'No se pudo cargar la información de pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!payment) return;

    try {
      setIsDownloading(true);

      // Create file in document directory
      const filename = `qr_pago_${payment.payment_reference}.png`;
      const file = new File(Paths.document, filename);

      // Remove data:image/png;base64, prefix if present
      const base64Data = payment.qr_code_image.replace(/^data:image\/\w+;base64,/, '');

      // Write base64 data to file
      await file.write(base64Data);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'image/png',
          dialogTitle: 'Guardar código QR',
        });
        Alert.alert('Éxito', 'Código QR guardado exitosamente');
      } else {
        Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
      }
    } catch (err: any) {
      console.error('Error downloading QR:', err);
      Alert.alert('Error', 'No se pudo descargar el código QR');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      'Confirmar Pago',
      '¿Has realizado el pago? Esta acción bloqueará los fondos en custodia de Kiwi.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: confirmPayment,
        },
      ]
    );
  };

  const confirmPayment = async () => {
    if (!contractId) return;

    try {
      setIsConfirming(true);
      const token = await storage.getAccessToken();
      
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      await contractsService.confirmPayment(parseInt(contractId as string), token);

      // Show success message
      Alert.alert(
        'Pago Confirmado',
        'Tu pago ha sido confirmado. Los fondos están seguros en Kiwi.',
        [
          {
            text: 'Ver seguimiento',
            onPress: () => router.replace(`/contract-tracking?contractId=${contractId}`),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      Alert.alert('Error', err.message || 'No se pudo confirmar el pago');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text className="text-gray-600 mt-4">Cargando información de pago...</Text>
      </View>
    );
  }

  if (error || !contract || !payment) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
        <Text className="text-gray-600 text-center mb-6">{error || 'No se pudo cargar el pago'}</Text>
        <Button variant="primary" onPress={() => router.back()}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          >
            <ArrowLeft size={24} color="#1A3044" strokeWidth={2} />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">
            Realizar Pago
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contract Info */}
        <View className="px-6 py-6 border-b border-gray-100">
          <Text className="text-sm text-gray-500 mb-2">Información del Contrato</Text>
          <Text className="text-xl font-bold text-gray-900 mb-3">
            {contract.title}
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Precio:</Text>
            <Text className="text-lg font-bold text-primary">
              Bs.{parseFloat(contract.price).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Código:</Text>
            <View className="px-3 py-1 bg-primary/10 rounded-full">
              <Text className="text-sm font-semibold text-primary">
                {contract.access_code}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
            Código QR de Pago
          </Text>
          
          {/* QR Code Display */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6 items-center border-2 border-gray-200">
            <Image
              source={{ uri: payment.qr_code_image }}
              className="w-64 h-64"
              resizeMode="contain"
            />
            <Text className="text-xs text-gray-500 mt-3 text-center">
              Ref: {payment.payment_reference}
            </Text>
          </View>

          {/* Instructions */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-base font-semibold text-blue-900 mb-3">
              Instrucciones:
            </Text>
            <View className="gap-2">
              <View className="flex-row">
                <Text className="text-blue-900 font-bold mr-2">1.</Text>
                <Text className="text-sm text-blue-900 flex-1">
                  Escanea el código QR con la aplicación de tu banco
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-900 font-bold mr-2">2.</Text>
                <Text className="text-sm text-blue-900 flex-1">
                  Completa el pago en tu aplicación bancaria
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-900 font-bold mr-2">3.</Text>
                <Text className="text-sm text-blue-900 flex-1">
                  Presiona "Confirmar Pago" una vez completada la transacción
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Button
              variant="outline"
              size="lg"
              onPress={handleDownloadQR}
              disabled={isDownloading}
              className="w-full flex-row items-center justify-center gap-2"
            >
              <Download size={20} color="#00B4D8" strokeWidth={2} />
              <Text className="text-primary-dark font-semibold text-base">
                {isDownloading ? 'Descargando...' : 'Descargar QR'}
              </Text>
            </Button>

            <Button
              variant="primary"
              size="lg"
              onPress={handleConfirmPayment}
              disabled={isConfirming}
              className="w-full bg-[#1A3044]"
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                'Confirmar Pago'
              )}
            </Button>
          </View>
        </View>

        {/* Security Note */}
        <View className="px-6 pb-8">
          <View className="bg-green-50 rounded-xl p-4">
            <View className="flex-row items-start">
              <CheckCircle2 size={20} color="#10B981" strokeWidth={2} className="mr-2 mt-0.5" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-green-900 mb-1">
                  Pago Seguro
                </Text>
                <Text className="text-sm text-green-800 leading-5">
                  Una vez confirmes el pago, los fondos quedarán en custodia de Kiwi hasta que recibas y apruebes el producto.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}