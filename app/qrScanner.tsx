import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMutation } from '@tanstack/react-query';
import BottomBar from '@/components/BottomBar';
import { useAppContext } from '@/context/Context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { registrarAsistencia } from '@/services/curso';

interface QRScannerRouteParams {
  inscripcionId: string;
}

const { width: screenWidth } = Dimensions.get('window');
const scannerSize = screenWidth * 0.5; // 50% del ancho de la pantalla

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { modal, userData } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { inscripcionId } = route.params as QRScannerRouteParams;

  // Mutation para registrar asistencia
  const asistenciaMutation = useMutation({
    mutationFn: async ({ idCronograma }: { idCronograma: string }) => {
      if (!userData.token) {
        throw new Error('No hay token de autenticación');
      }
      return registrarAsistencia(idCronograma, userData.token);
    },
    onSuccess: (data) => {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Asistencia Registrada',
        subTitle: `Tu asistencia ha sido registrada exitosamente. Porcentaje de asistencia: ${data.porcentajeAsistencia}`,
        icon: 'check-circle',
        showButton: true,
        buttonText: 'OK',
        onButtonPress: () => {
          modal.setOpenModal(false);
          navigation.goBack();
        },
      });
      modal.setOpenModal(true);
    },
    onError: (error: any) => {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Error',
        subTitle: error.message || 'No se pudo registrar la asistencia. Inténtalo de nuevo.',
        icon: 'exclamation-triangle',
        showButton: true,
        buttonText: 'OK',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
      setScanned(false); // Permitir escanear de nuevo
    }
  });

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code escaneado:', data);
    
    // Validar que el QR code sea válido (debe contener el idCronograma)
    if (data && data.trim()) {
      // El QR debe contener el idCronograma directamente
      asistenciaMutation.mutate({ idCronograma: data.trim() });
    } else {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'QR Inválido',
        subTitle: 'El código QR escaneado no es válido. Inténtalo de nuevo.',
        icon: 'exclamation-triangle',
        showButton: true,
        buttonText: 'OK',
        onButtonPress: () => {
          modal.setOpenModal(false);
          setScanned(false);
        },
      });
      modal.setOpenModal(true);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'<'} </Text>
          </Pressable>
          <Text style={styles.title}>Escanear QR</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.message}>Solicitando permisos de cámara...</Text>
        </View>
        <BottomBar />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'<'} </Text>
          </Pressable>
          <Text style={styles.title}>Escanear QR</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.message}>Sin acceso a la cámara</Text>
          <Text style={styles.subMessage}>
            Necesitas permitir el acceso a la cámara para escanear códigos QR.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Otorgar Permiso</Text>
          </Pressable>
        </View>
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'<'} </Text>
        </Pressable>
        <Text style={styles.title}>Escanear QR</Text>
      </View>
      
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        
        {/* Overlay con área de escaneo transparente */}
        <View style={styles.overlay}>
          {/* Área superior oscura */}
          <View style={[styles.overlaySection, styles.topSection]} />
          
          {/* Área central con scanner */}
          <View style={styles.centerSection}>
            {/* Área izquierda oscura */}
            <View style={[styles.overlaySection, styles.sideSection]} />
            
            {/* Área de escaneo transparente */}
            <View style={styles.scannerFrame}>
              {/* Esquinas del marco */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            {/* Área derecha oscura */}
            <View style={[styles.overlaySection, styles.sideSection]} />
          </View>
          
          {/* Área inferior oscura */}
          <View style={[styles.overlaySection, styles.bottomSection]} />
        </View>
        
        {scanned && (
          <View style={styles.processingOverlay}>
            <View style={styles.scanningMessage}>
              <FontAwesome name="spinner" size={24} color="#fff" />
              <Text style={styles.scanningText}>Procesando...</Text>
            </View>
          </View>
        )}
        
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Coloca el código QR dentro del marco para registrar tu asistencia
          </Text>
        </View>
      </View>
      
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginRight: 12,
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: '#00bfa5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#00bfa5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  topSection: {
    flex: 1,
  },
  centerSection: {
    flexDirection: 'row',
    height: scannerSize,
  },
  sideSection: {
    flex: 1,
  },
  bottomSection: {
    flex: 1,
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00bfa5',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningMessage: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanningText: {
    color: '#fff',
    fontSize: 16,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
}); 