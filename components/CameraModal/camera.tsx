import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useState, useRef } from "react"; // Importa useRef
import { Button, Pressable, Text, Modal, View, Image, Alert } from 'react-native'; // Importa Image y Alert
import styles from './styles';
import { FontAwesome } from '@expo/vector-icons';

import { useAppContext } from '@/context/Context';

interface CameraModalProps {
    isOpen: boolean;
    toogleOpen: () => void;
}

type Facing = 'front' | 'back';

export default function CameraModal({ isOpen, toogleOpen }: CameraModalProps) {
    const [facing, setFacing] = useState<Facing>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const { camera: { backURI, frontURI, actualIdSide, setCameraData } } = useAppContext();

    if (!permission) {
        return <View style={styles.permissionContainer} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.message}>Necesitamos tu permiso para acceder a la cámara.</Text>
                <Button onPress={requestPermission} title="Otorgar Permiso" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                // takePictureAsync devuelve un objeto con la URI de la imagen en la caché
                const photo: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
                    quality: 1, // Calidad de la imagen (0 a 1)
                });

                if (photo) {
                    setPhotoUri(photo.uri); // Guarda la URI de la foto en el estado
                    if (actualIdSide == "front") {
                        setCameraData({ frontURI: photo.uri, backURI, actualIdSide });
                    } else {
                        setCameraData({ frontURI, backURI: photo.uri, actualIdSide });
                    }
                    console.log('Foto tomada, URI temporal:', photo.uri);
                }
            } catch (error) {
                console.error("Error al tomar la foto:", error);
                Alert.alert("Error", "No se pudo tomar la foto. Inténtalo de nuevo.");
            }
        } else {
            Alert.alert("Error", "Cámara no lista.");
        }
    };

    const retakePhoto = () => {
        if (actualIdSide == "front") {
            setCameraData({ frontURI: "", backURI, actualIdSide });
        }else {
            setCameraData({ frontURI, backURI: "", actualIdSide });
        }
    };

    return (
        <Modal
            visible={isOpen}
            onRequestClose={toogleOpen}
            animationType="fade"
            transparent={false}
            style={styles.fullScreenModal}
        >
            <View style={styles.cameraContainer}>
                {(actualIdSide == "front" ? frontURI : backURI).length > 0 ? ( // Si hay una foto tomada, la muestra
                    <View style={styles.photoPreviewContainer}>
                        <Image source={{ uri: actualIdSide == "front" ? frontURI : backURI }} style={styles.photoPreview} />
                        <View style={styles.previewControls}>
                            <Pressable onPress={retakePhoto} style={styles.retakeButton}>
                                <Text style={styles.text}>Retomar</Text>
                            </Pressable>
                            <Pressable onPress={toogleOpen} style={styles.closeButton}>
                                <Text style={styles.text}>Cerrar</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <CameraView style={styles.cameraPreview} facing={facing} ref={cameraRef} autofocus={'on'}>
                        <View style={styles.controlsContainer}>
                            <Pressable onPress={toggleCameraFacing} style={styles.flipButton}>
                                <FontAwesome name="retweet" size={24} color="white" />
                            </Pressable>

                            <Pressable onPress={takePhoto} style={styles.takePhotoButton}>
                                <FontAwesome name="camera" size={32} color="white" />
                            </Pressable>

                            <Pressable onPress={toogleOpen} style={styles.closeButton}>
                                <FontAwesome name="times" size={24} color="white" />
                            </Pressable>
                        </View>
                    </CameraView>
                )}
            </View>
        </Modal>
    );
}