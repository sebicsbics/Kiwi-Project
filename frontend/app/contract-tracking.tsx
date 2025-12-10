import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';
import { contractsService, type Contract } from '@/services/contracts';
import { storage } from '@/utils/storage';

// Timeline step configuration
interface TimelineStep {
  id: string;
  status: string;
  title: string;
  description: string;
  number: number;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'created',
    status: 'AWAITING_PAYMENT',
    title: 'Creado',
    description: 'El vendedor ha listado el producto.',
    number: 1,
  },
  {
    id: 'paid',
    status: 'LOCKED',
    title: 'Pagado',
    description: 'Tu pago está seguro en Vault.',
    number: 2,
  },
  {
    id: 'shipped',
    status: 'IN_TRANSIT',
    title: 'Enviado',
    description: 'El vendedor ha despachado el producto.',
    number: 3,
  },
  {
    id: 'received',
    status: 'RELEASED',
    title: 'Recibido',
    description: 'Confirma que el producto está de acuerdo con el contrato y estás satisfecho.',
    number: 4,
  },
  {
    id: 'completed',
    status: 'COMPLETED',
    title: 'Fondos liberados',
    description: 'El pago se enviará al vendedor.',
    number: 5,
  },
];

// Helper to determine step state
const getStepState = (step: TimelineStep, currentStatus: string): 'completed' | 'active' | 'pending' => {
  const statusOrder = ['DRAFT', 'AWAITING_PAYMENT', 'LOCKED', 'IN_TRANSIT', 'RELEASED', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(step.status);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
};

// Timeline Step Component
function TimelineStepItem({ 
  step, 
  state, 
  isLast 
}: { 
  step: TimelineStep; 
  state: 'completed' | 'active' | 'pending'; 
  isLast: boolean;
}) {
  return (
    <View className="flex-row">
      {/* Icon Column */}
      <View className="items-center mr-4">
        {/* Icon */}
        {state === 'completed' ? (
          <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
            <CheckCircle2 size={24} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        ) : (
          <View 
            className={`w-10 h-10 rounded-full items-center justify-center ${
              state === 'active' ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <Text 
              className={`text-lg font-bold ${
                state === 'active' ? 'text-white' : 'text-gray-500'
              }`}
            >
              {step.number}
            </Text>
          </View>
        )}

        {/* Connector Line */}
        {!isLast && (
          <View 
            className={`w-0.5 flex-1 my-2 ${
              state === 'completed' ? 'bg-green-500' : 'bg-gray-300'
            }`}
            style={{ minHeight: 40 }}
          />
        )}
      </View>

      {/* Content Column */}
      <View className="flex-1 pb-8">
        <Text 
          className={`text-lg mb-1 ${
            state === 'pending' ? 'text-gray-500' : 'text-gray-900 font-semibold'
          }`}
        >
          {step.title}
        </Text>
        <Text 
          className={`text-sm leading-5 ${
            state === 'pending' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {step.description}
        </Text>
      </View>
    </View>
  );
}

export default function ContractTrackingScreen() {
  const params = useLocalSearchParams();
  const { contractId } = params;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
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

      const contractData = await contractsService.getContract(parseInt(contractId as string), token);
      setContract(contractData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      setError(err.message || 'No se pudo cargar el contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseFunds = () => {
    Alert.alert(
      'Liberar Fondos',
      '¿Confirmas que recibiste el producto en perfectas condiciones? Esta acción liberará el pago al vendedor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: () => {
            // TODO: Implement release funds API call
            Alert.alert('Próximamente', 'La liberación de fondos estará disponible pronto');
          },
        },
      ]
    );
  };

  const handleReportProblem = () => {
    Alert.alert(
      'Reportar Problema',
      '¿Hay algún problema con el producto o la transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement dispute API call
            Alert.alert('Próximamente', 'El sistema de disputas estará disponible pronto');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text className="text-gray-600 mt-4">Cargando seguimiento...</Text>
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

  const canReleaseFunds = contract.status === 'IN_TRANSIT' || contract.status === 'LOCKED';
  const canReportProblem = contract.status !== 'COMPLETED' && contract.status !== 'REFUNDED' && contract.status !== 'DRAFT';

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
            Estado de Kiwi
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contract Info */}
        <View className="px-6 py-4 border-b border-gray-100">
          <Text className="text-sm text-gray-500 mb-1">Contrato</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {contract.title}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="px-3 py-1 bg-primary/10 rounded-full">
              <Text className="text-sm font-semibold text-primary">
                {contract.access_code}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">
              Bs.{parseFloat(contract.price).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="px-6 py-6">
          {TIMELINE_STEPS.map((step, index) => {
            const state = getStepState(step, contract.status);
            const isLast = index === TIMELINE_STEPS.length - 1;
            
            return (
              <TimelineStepItem
                key={step.id}
                step={step}
                state={state}
                isLast={isLast}
              />
            );
          })}
        </View>

        {/* Actions */}
        <View className="px-6 pb-8 gap-3">
          {canReleaseFunds && (
            <Button
              variant="primary"
              size="lg"
              onPress={handleReleaseFunds}
              className="w-full bg-[#1A3044]"
            >
              Liberar fondos
            </Button>
          )}
          
          {canReportProblem && (
            <Pressable
              onPress={handleReportProblem}
              className="w-full py-4 rounded-xl bg-red-500 active:opacity-80"
            >
              <Text className="text-white text-center font-semibold text-base">
                Reportar un problema
              </Text>
            </Pressable>
          )}
        </View>

        {/* Info Note */}
        <View className="px-6 pb-8">
          <View className="bg-blue-50 rounded-xl p-4">
            <Text className="text-sm text-blue-900 leading-5">
              💡 <Text className="font-semibold">Nota:</Text> Tu pago está seguro en Kiwi hasta que confirmes la recepción del producto. Si hay algún problema, puedes reportarlo en cualquier momento.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}