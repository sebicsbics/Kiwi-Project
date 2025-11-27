import { View, Text, ScrollView, Alert, Image } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { 
  Button, 
  Card, 
  ProgressBar, 
  ImageUpload, 
  DocumentTypeSelector,
  HelpModal,
  type DocumentType 
} from '@/components/ui';

type VerificationStep = 'document-type' | 'document-upload' | 'selfie' | 'complete';

interface ValidationState {
  message: string;
  status: 'success' | 'error' | 'warning' | null;
}

export default function KYCVerification() {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('document-type');
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [selfieImage, setSelfieImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [frontValidation, setFrontValidation] = useState<ValidationState>({ 
    message: '', 
    status: null 
  });
  const [backValidation, setBackValidation] = useState<ValidationState>({ 
    message: '', 
    status: null 
  });

  // Calculate progress based on current step
  const getProgress = () => {
    switch (currentStep) {
      case 'document-type':
        return documentType ? 25 : 0;
      case 'document-upload':
        if (frontImage && backImage) return 75;
        if (frontImage || backImage) return 50;
        return 25;
      case 'selfie':
        return selfieImage ? 100 : 75;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  const validateImage = (uri: string, type: 'front' | 'back') => {
    // Simulate image validation
    setTimeout(() => {
      const validation: ValidationState = {
        message: 'Imagen cargada correctamente',
        status: 'success'
      };
      
      if (type === 'front') {
        setFrontValidation(validation);
      } else {
        setBackValidation(validation);
      }
    }, 500);
  };

  const handleFrontImageSelect = (uri: string) => {
    setFrontImage(uri);
    if (uri) {
      validateImage(uri, 'front');
    } else {
      setFrontValidation({ message: '', status: null });
    }
  };

  const handleBackImageSelect = (uri: string) => {
    setBackImage(uri);
    if (uri) {
      validateImage(uri, 'back');
    } else {
      setBackValidation({ message: '', status: null });
    }
  };

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setDocumentType(type);
  };

  const handleContinueToUpload = () => {
    if (!documentType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de documento');
      return;
    }
    setCurrentStep('document-upload');
  };

  const handleUploadDocuments = async () => {
    if (!frontImage || !backImage) {
      Alert.alert('Error', 'Por favor sube ambas imágenes del documento');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep('selfie');
    }, 2000);
  };

  const handleTakeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos de cámara para tomar la selfie');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      Alert.alert('Error', 'No se pudo tomar la selfie');
    }
  };

  const handleCompleteSelfie = async () => {
    if (!selfieImage) {
      Alert.alert('Error', 'Por favor toma una selfie para continuar');
      return;
    }

    setIsUploading(true);
    
    // Simulate final upload
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep('complete');
    }, 2000);
  };

  const handleFinish = () => {
    Alert.alert(
      'Verificación Completada',
      'Tu verificación ha sido enviada. Recibirás una notificación cuando sea aprobada.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getDocumentLabel = () => {
    switch (documentType) {
      case 'id-card':
        return 'Carnet de Identidad';
      case 'passport':
        return 'Pasaporte';
      case 'driver-license':
        return 'Licencia de Conducir';
      default:
        return 'Documento';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.back()}
            className="mr-3 w-10 h-10 rounded-full p-0"
          >
            <Ionicons name="arrow-back" size={20} color="#6FA830" />
          </Button>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Verificación de Identidad
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setShowHelp(true)}
            className="w-10 h-10 rounded-full p-0"
          >
            <Ionicons name="help-circle-outline" size={20} color="#6FA830" />
          </Button>
        </View>
        <ProgressBar progress={getProgress()} />
      </View>

      {/* Help Modal */}
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Consejos para una buena verificación"
        tips={[
          'Asegúrate de que tu documento esté completamente visible y sin reflejos',
          'Toma las fotos en un lugar bien iluminado',
          'Verifica que toda la información del documento sea legible',
          'Para la selfie, mira directamente a la cámara',
          'No uses filtros ni edites las imágenes',
          'El proceso puede tardar hasta 24 horas en ser revisado'
        ]}
      />

      <ScrollView className="flex-1 px-6 py-6">
        {/* Document Type Selection */}
        {currentStep === 'document-type' && (
          <View>
            <Card className="mb-7">
              <Text className="text-white text-base leading-6">
                Para completar tu verificación, necesitamos validar tu identidad. 
                Selecciona el tipo de documento que deseas usar.
              </Text>
            </Card>

            <DocumentTypeSelector
              selectedType={documentType}
              onSelect={handleDocumentTypeSelect}
            />

            <Button
              size="lg"
              onPress={handleContinueToUpload}
              disabled={!documentType}
              className={`w-full ${!documentType ? 'opacity-50' : ''}`}
            >
              Continuar
            </Button>
          </View>
        )}

        {/* Document Upload */}
        {currentStep === 'document-upload' && (
          <View>
            <Card className="mb-6">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                  <Ionicons name="information" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white mb-1">
                    Sube las imágenes de tu {getDocumentLabel()}
                  </Text>
                  <Text className="text-white text-sm">
                    Asegúrate de que las imágenes sean claras y que toda la información sea legible.
                  </Text>
                </View>
              </View>
            </Card>

            <ImageUpload
              label={`Anverso del ${getDocumentLabel()}`}
              onImageSelected={handleFrontImageSelect}
              imageUri={frontImage}
              validationMessage={frontValidation.message}
              validationStatus={frontValidation.status}
            />

            <ImageUpload
              label={`Reverso del ${getDocumentLabel()}`}
              onImageSelected={handleBackImageSelect}
              imageUri={backImage}
              validationMessage={backValidation.message}
              validationStatus={backValidation.status}
            />

            <Button
              size="lg"
              onPress={handleUploadDocuments}
              disabled={!frontImage || !backImage || isUploading}
              className={`w-full ${(!frontImage || !backImage || isUploading) ? 'opacity-50' : ''}`}
            >
              {isUploading ? 'Subiendo documentos...' : 'Subir Documentos'}
            </Button>
          </View>
        )}

        {/* Selfie Capture */}
        {currentStep === 'selfie' && (
          <View>
            <Card className="mb-6">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                  <Ionicons name="camera" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white mb-1">
                    Toma una selfie
                  </Text>
                  <Text className="text-white text-sm">
                    Para validar tu identidad, necesitamos una foto tuya. 
                    Asegúrate de estar en un lugar bien iluminado.
                  </Text>
                </View>
              </View>
            </Card>

            {!selfieImage ? (
              <Button
                size="lg"
                onPress={handleTakeSelfie}
                className="w-full mb-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="camera-outline" size={24} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Tomar Selfie
                  </Text>
                </View>
              </Button>
            ) : (
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Tu selfie
                </Text>
                <View className="relative">
                  <Image
                    source={{ uri: selfieImage }}
                    className="w-full aspect-[3/4] rounded-xl"
                    resizeMode="cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setSelfieImage('')}
                    className="absolute top-2 right-2 bg-white"
                  >
                    <Ionicons name="refresh" size={20} color="#6FA830" />
                  </Button>
                </View>
                <View className="flex-row items-center mt-3 bg-green-50 p-3 rounded-lg">
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text className="text-green-700 text-sm ml-2">
                    Selfie capturada correctamente
                  </Text>
                </View>
              </View>
            )}

            {selfieImage && (
              <Button
                size="lg"
                onPress={handleCompleteSelfie}
                disabled={isUploading}
                className={`w-full ${isUploading ? 'opacity-50' : ''}`}
              >
                {isUploading ? 'Procesando...' : 'Completar Verificación'}
              </Button>
            )}
          </View>
        )}

        {/* Completion */}
        {currentStep === 'complete' && (
          <View className="items-center py-8">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-6">
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
              ¡Verificación Completada!
            </Text>
            
            <Text className="text-gray-600 text-center mb-8 px-4">
              Tu verificación ha sido enviada exitosamente. 
              Recibirás una notificación cuando sea aprobada.
            </Text>

            <Card className="w-full mb-6">
              <View className="space-y-3">
                <View className="flex-row items-center py-2">
                  <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  <Text className="text-gray-700 ml-3">Tipo de documento seleccionado</Text>
                </View>
                <View className="flex-row items-center py-2">
                  <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  <Text className="text-gray-700 ml-3">Documentos subidos</Text>
                </View>
                <View className="flex-row items-center py-2">
                  <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  <Text className="text-gray-700 ml-3">Selfie capturada</Text>
                </View>
              </View>
            </Card>

            <Button
              size="lg"
              onPress={handleFinish}
              className="w-full"
            >
              Finalizar
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}