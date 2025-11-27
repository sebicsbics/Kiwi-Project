# Interfaz de Verificación KYC - Kiwi Platform

## Descripción

La interfaz de verificación KYC (Know Your Customer) permite a los usuarios de la plataforma Kiwi validar su identidad mediante la carga de documentos oficiales y una selfie.

## Características Implementadas

### 1. Selección de Tipo de Documento
- **Carnet de Identidad**: Para ciudadanos bolivianos
- **Pasaporte**: Para documentos internacionales
- **Licencia de Conducir**: Como documento alternativo

### 2. Carga de Documentos
- Carga de imagen del anverso del documento
- Carga de imagen del reverso del documento
- Validación automática de imágenes
- Previsualización de imágenes cargadas
- Opción para eliminar y recargar imágenes

### 3. Captura de Selfie
- Acceso directo a la cámara frontal
- Previsualización de la selfie capturada
- Opción para retomar la foto

### 4. Barra de Progreso
- Indicador visual del progreso de verificación
- Actualización automática según el paso actual

### 5. Validación y Retroalimentación
- Mensajes de validación para cada imagen
- Indicadores visuales de éxito/error
- Deshabilitación de botones hasta completar requisitos

## Estructura de Componentes

```
components/ui/
├── ProgressBar.tsx           # Barra de progreso visual
├── ImageUpload.tsx           # Componente para carga de imágenes
├── DocumentTypeSelector.tsx  # Selector de tipo de documento
└── index.ts                  # Exportaciones

app/
└── kyc-verification.tsx      # Pantalla principal de verificación
```

## Flujo de Usuario

1. **Paso 1**: Selección del tipo de documento
   - El usuario elige entre ID Card, Pasaporte o Licencia de Conducir
   - Botón "Continuar" se habilita al seleccionar un tipo

2. **Paso 2**: Carga de documentos
   - Carga del anverso del documento
   - Carga del reverso del documento
   - Validación automática de cada imagen
   - Botón "Subir Documentos" se habilita cuando ambas imágenes están cargadas

3. **Paso 3**: Captura de selfie
   - Solicitud de permisos de cámara
   - Captura de selfie con cámara frontal
   - Opción para retomar la foto
   - Botón "Completar Verificación" se habilita con la selfie

4. **Paso 4**: Confirmación
   - Pantalla de éxito con resumen
   - Lista de verificación completada
   - Botón para finalizar y volver

## Paleta de Colores

- **Primario**: `#8BC53F` (verde claro)
- **Secundario**: `#A8DA63` (verde brillante)
- **Primario Oscuro**: `#6FA830`
- **Fondo**: `#FFFFFF` (blanco)
- **Fondo Secundario**: `#F9FAFB` (gris muy claro)

## Permisos Necesarios

La aplicación requiere los siguientes permisos:

- **Galería de fotos**: Para seleccionar imágenes del documento
- **Cámara**: Para capturar la selfie

Estos permisos se solicitan automáticamente cuando el usuario intenta usar la funcionalidad correspondiente.

## Uso

Para acceder a la verificación KYC desde la pantalla principal:

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/kyc-verification');
```

## Dependencias

- `expo-image-picker`: Para selección de imágenes y captura de fotos
- `expo-camera`: Para acceso a la cámara del dispositivo
- `@expo/vector-icons`: Para iconos de la interfaz

## Próximas Mejoras

- [ ] Integración con backend para subida real de documentos
- [ ] Validación de calidad de imagen (nitidez, iluminación)
- [ ] Detección de rostro en selfie
- [ ] OCR para extracción automática de datos del documento
- [ ] Soporte para múltiples idiomas
- [ ] Guardado de progreso para continuar después
- [ ] Notificaciones push sobre estado de verificación

## Notas de Diseño

La interfaz sigue los principios de Material Design 3:
- Bordes redondeados en componentes
- Espaciado consistente
- Retroalimentación visual clara
- Accesibilidad mejorada con iconos y textos descriptivos
- Estados deshabilitados claramente visibles