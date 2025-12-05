import { View, Text, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { ArrowLeft, QrCode, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Input } from '@/components/ui';

// Utility function to extract productId from various formats
function extractProductId(code: string): string {
  // Remove whitespace
  const trimmedCode = code.trim();
  
  // Check if it's a deep link format
  if (trimmedCode.startsWith('kiwiapp://product/')) {
    return trimmedCode.split('kiwiapp://product/')[1];
  }
  
  // Otherwise, assume it's a direct product ID
  return trimmedCode;
}

export default function ScanOrEnterCodeScreen() {
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    if (hasScanned) return;
    
    setHasScanned(true);
    const productId = extractProductId(data);
    
    if (productId) {
      router.push(`/product/${productId}`);
    } else {
      Alert.alert('Error', 'Código QR inválido');
      setHasScanned(false);
    }
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código o link');
      return;
    }

    const productId = extractProductId(manualCode);
    
    if (productId) {
      router.push(`/product/${productId}`);
    } else {
      Alert.alert('Error', 'Código inválido');
    }
  };

  const handleScanModeToggle = async () => {
    if (scanMode === 'manual') {
      // Switching to QR mode - request camera permission
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            'Permiso de cámara requerido',
            'Necesitamos acceso a la cámara para escanear códigos QR'
          );
          return;
        }
      }
      setScanMode('qr');
      setHasScanned(false);
    } else {
      setScanMode('manual');
    }
  };

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
            Buscar producto
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4 pt-6">
        {/* Mode Toggle Buttons */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={handleScanModeToggle}
            className={`flex-1 py-4 rounded-xl border-2 flex-row items-center justify-center gap-2 ${
              scanMode === 'qr'
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-300'
            }`}
          >
            <QrCode
              size={24}
              color={scanMode === 'qr' ? '#FFFFFF' : '#1A3044'}
              strokeWidth={2}
            />
            <Text
              className={`font-semibold ${
                scanMode === 'qr' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Escanear QR
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setScanMode('manual')}
            className={`flex-1 py-4 rounded-xl border-2 flex-row items-center justify-center gap-2 ${
              scanMode === 'manual'
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-300'
            }`}
          >
            <Search
              size={24}
              color={scanMode === 'manual' ? '#FFFFFF' : '#1A3044'}
              strokeWidth={2}
            />
            <Text
              className={`font-semibold ${
                scanMode === 'manual' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Ingresar código
            </Text>
          </Pressable>
        </View>

        {/* QR Scanner Mode */}
        {scanMode === 'qr' && (
          <View className="flex-1">
            <Text className="text-base text-gray-600 mb-4 text-center">
              Apunta la cámara al código QR del producto
            </Text>
            
            <View className="flex-1 rounded-2xl overflow-hidden bg-black">
              {permission?.granted ? (
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  onBarcodeScanned={handleQRCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                >
                  {/* Scanner overlay */}
                  <View className="flex-1 items-center justify-center">
                    <View className="w-64 h-64 border-4 border-white rounded-3xl" />
                  </View>
                </CameraView>
              ) : (
                <View className="flex-1 items-center justify-center p-6">
                  <QrCode size={64} color="#FFFFFF" strokeWidth={2} />
                  <Text className="text-white text-center mt-4">
                    Permiso de cámara requerido
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={() => setScanMode('manual')}
              className="mt-4 py-3"
            >
              <Text className="text-primary text-center font-semibold">
                ¿Prefieres ingresar el código manualmente?
              </Text>
            </Pressable>
          </View>
        )}

        {/* Manual Entry Mode */}
        {scanMode === 'manual' && (
          <View className="flex-1">
            <Text className="text-base text-gray-600 mb-4">
              Ingresa el código del producto o el link completo
            </Text>

            <Input
              placeholder="Ej: 12345 o kiwiapp://product/12345"
              value={manualCode}
              onChangeText={setManualCode}
              className="mb-4"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handleManualSearch}
              className="w-full"
            >
              Buscar producto
            </Button>

            <View className="mt-6 p-4 bg-gray-50 rounded-xl">
              <Text className="text-sm text-gray-600 mb-2">
                💡 <Text className="font-semibold">Formatos aceptados:</Text>
              </Text>
              <Text className="text-sm text-gray-600 ml-4">
                • ID directo: 12345
              </Text>
              <Text className="text-sm text-gray-600 ml-4">
                • Link interno: kiwiapp://product/12345
              </Text>
            </View>

            <Pressable
              onPress={handleScanModeToggle}
              className="mt-6 py-3"
            >
              <Text className="text-primary text-center font-semibold">
                ¿Prefieres escanear un código QR?
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}