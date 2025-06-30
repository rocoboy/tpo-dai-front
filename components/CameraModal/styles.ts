import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    fullScreenModal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraContainer: {
        width: width ,
        height: height,
        backgroundColor: 'black',
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'flex-end', // Alinea los controles de cámara y vista previa
        alignItems: 'center',
    },
    cameraPreview: {
        flex: 1,
        width: '100%',
    },

    // --- Contenedor de la previsualización de la foto ---
    photoPreviewContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        justifyContent: 'flex-end', // Alinea los controles de previsualización
        alignItems: 'center',
    },
    photoPreview: {
        flex: 1,
        width: '100%',
        resizeMode: 'contain', // Ajusta la imagen dentro del contenedor sin recortarla
    },

    // --- Estilos para los controles de la cámara ---
    controlsContainer: { // Controles cuando la cámara está activa
        position: 'absolute',
        bottom: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
    },
    flipButton: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
    },
    takePhotoButton: { // Nuevo botón para tomar foto
        padding: 15,
        backgroundColor: 'rgba(0,122,255,0.7)', // Un azul distintivo
        borderRadius: 50, // Forma circular
        width: 70, // Tamaño del botón
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    closeButton: {
        padding: 12,
        backgroundColor: 'rgba(255,0,0,0.5)',
        borderRadius: 8,
    },

    // --- Estilos para los controles de la previsualización (después de tomar la foto) ---
    previewControls: {
        position: 'absolute',
        bottom: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: 'transparent',
    },
    retakeButton: {
        padding: 12,
        backgroundColor: 'rgba(255,165,0,0.7)', // Naranja para retomar
        borderRadius: 8,
    },
    usePhotoButton: {
        padding: 12,
        backgroundColor: 'rgba(0,128,0,0.7)', // Verde para usar
        borderRadius: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        fontSize: 16,
    },
    modalBody: {
        width: "40%",
        height: "20%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red"
    },
    content: {
        width: "auto",
        height: "auto",
        borderRadius: 20,
    },
});

export default styles;