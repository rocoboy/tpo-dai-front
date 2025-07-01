import CustomButton from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import theme from '@/constants/types';
import { ensureRecipeFolderId, useAppContext } from '@/context/Context';
import { getSupabasePublicUrl, handleUploadStepMedia } from '@/helpers/uploadPhotos';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Paso {
  descripcion: string;
}

interface RouteParams {
  pasos?: Paso[];
  editIndex?: number | null;
  titulo?: string;
  descripcion?: string;
  porciones?: string;
  ingredientes?: string[];
  idTipo?: string;
}

const AddStepScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pasos: initialPasos = [], titulo = '', descripcion: initialDescripcion = '', porciones = '', ingredientes = [], idTipo = '' } = (route.params || {}) as RouteParams;
  const { recipeDraft, setRecipeDraft } = useAppContext();

  const [descripcion, setDescripcion] = useState(initialDescripcion);
  const [charCount, setCharCount] = useState(initialDescripcion.length);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
    name: string;
    uploading?: boolean;
    url?: string;
    path?: string;
    extension?: string;
    tipo_contenido?: 'foto' | 'video';
    fullPath?: string;
  }[]>([]);

  useEffect(() => {
    setCharCount(initialDescripcion.length);
  }, [initialDescripcion]);

  const pickMedia = async (mediaType: 'image' | 'video') => {
    let result;
    if (mediaType === 'image') {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    }
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newMedia = { 
        uri: asset.uri, 
        type: mediaType, 
        name: asset.fileName || `media_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`,
        uploading: true,
        url: undefined,
        path: undefined,
        extension: undefined,
        tipo_contenido: undefined,
        fullPath: undefined
      };
      
      // Agregar inmediatamente con estado de subida
      setMedia((prev) => [...prev, newMedia]);
      
      try {
        // Asegurar que siempre haya un folderId válido
        const draftWithId = await ensureRecipeFolderId(recipeDraft);
        if (draftWithId.folderId !== recipeDraft.folderId) {
          setRecipeDraft(draftWithId);
        }
        
        const nroPaso = isEditing && editIndex !== null ? editIndex + 1 : recipeDraft.pasos.length + 1;
        const fileName = newMedia.name;
        
        const tipo_contenido = mediaType === 'image' ? 'foto' : 'video';
        const multimediaObj = await handleUploadStepMedia(asset.uri, draftWithId.folderId || 'temp', nroPaso, fileName, true, tipo_contenido);
        // Actualizar el estado con el objeto multimedia completo
        setMedia((prev) => prev.map((m, idx) =>
          idx === prev.length - 1
            ? { ...m, uploading: false, ...multimediaObj, fullPath: multimediaObj?.path, path: 'https://ybdgsuobogchpjaczzcc.supabase.co/storage/v1/object/public/' + multimediaObj?.path  }
            : m
        ));
      } catch (error) {
        console.error('Error subiendo archivo:', error);
        // Remover el archivo si falló la subida
        setMedia((prev) => prev.filter((_, idx) => idx !== prev.length - 1));
        alert('Error subiendo archivo. Intenta de nuevo.');
      }
    }
  };

  const removeMedia = (idx: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddPaso = async () => {
    if (descripcion.trim().length === 0) return;
    
    // Procesar archivos que ya están subidos
    const multimedia = media
      .filter(m => m.url && !m.uploading && m.path && m.extension && m.tipo_contenido)
      .map(m => ({
        tipo_contenido: m.tipo_contenido,
        path: m.path,
        extension: m.extension,
        fullPath: m.fullPath || m.path
      }));
    
    if (isEditing && editIndex !== null) {
      setRecipeDraft(d => ({
        ...d,
        pasos: d.pasos.map((p, i) => i === editIndex ? { ...p, texto: descripcion, multimedia } : p)
      }));
      setDescripcion('');
      setIsEditing(false);
      setEditIndex(null);
      setMedia([]);
    } else {
      setRecipeDraft(d => ({
        ...d,
        pasos: [
          ...d.pasos,
          { nroPaso: d.pasos.length + 1, texto: descripcion, multimedia }
        ]
      }));
      setDescripcion('');
      setMedia([]);
    }
  };

  const handleFinalizar = () => {
    let nuevosPasos = recipeDraft.pasos;
    if (descripcion.trim().length > 0) {
      // Solo incluir archivos que ya están subidos
      const multimedia = media
        .filter(m => m.url && !m.uploading && m.path && m.extension && m.tipo_contenido)
        .map(m => ({
          tipo_contenido: m.tipo_contenido,
          path: m.path,
          extension: m.extension,
          fullPath: m.fullPath || m.path
        }));
      
      if (isEditing && editIndex !== null) {
        nuevosPasos = recipeDraft.pasos.map((p, i) => i === editIndex ? { ...p, texto: descripcion, multimedia } : p);
      } else {
        nuevosPasos = [
          ...recipeDraft.pasos,
          { nroPaso: recipeDraft.pasos.length + 1, texto: descripcion, multimedia }
        ];
      }
    }
    setRecipeDraft(d => ({ ...d, pasos: nuevosPasos }));
    (navigation as any).navigate('createRecipe', { pasos: nuevosPasos });
  };

  const handleEditPaso = (index: number) => {
    const paso = recipeDraft.pasos[index];
    setDescripcion(paso.texto);
    setIsEditing(true);
    setEditIndex(index);
    
    // Cargar archivos multimedia subidos existentes
    if (paso.multimedia && paso.multimedia.length > 0) {
      const existingMedia = paso.multimedia.map(m => ({
        uri: m.url || (m.path ? getSupabasePublicUrl(m.path) : undefined),
        type: m.tipo_contenido === 'foto' ? 'image' : 'video' as 'image' | 'video',
        name: (m.url || m.path || '').split('/').pop() || `media_${Date.now()}`,
        uploading: false,
        url: m.url || (m.path ? getSupabasePublicUrl(m.path) : undefined),
        path: m.path,
        extension: m.extension,
        tipo_contenido: m.tipo_contenido,
        fullPath: m.fullPath || m.path
      }));
      setMedia(existingMedia);
    } else {
      setMedia([]);
    }
  };

  const handleDeletePaso = (index: number) => {
    setRecipeDraft(d => ({
      ...d,
      pasos: d.pasos.filter((_, i) => i !== index).map((p, i) => ({ ...p, nroPaso: i + 1 }))
    }));
    if (isEditing && editIndex === index) {
      setDescripcion('');
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: theme.colors.primary }}>{'←'}</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Crear Receta</ThemedText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={styles.subtitle}>Instrucciones*</ThemedText>
        <ThemedText style={styles.pasoLabel}>Paso {isEditing && editIndex !== null ? editIndex + 1 : recipeDraft.pasos.length + 1}</ThemedText>
        <View style={styles.textAreaContainer}>
          <Text style={styles.textAreaLabel}>Descripción</Text>
          <TextInput
            style={styles.textArea}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={500}
            placeholder="Describe el paso..."
          />
          <Text style={styles.charCount}>{charCount}/500</Text>
        </View>
        <ThemedText style={styles.addMediaLabel}>Agregar Imagenes / Video</ThemedText>
        <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' }}>
          Los archivos se suben automáticamente a medida que los seleccionas
        </ThemedText>
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaBox} onPress={() => pickMedia('image')}><Text style={styles.mediaIcon}>🖼️</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaBox} onPress={() => pickMedia('video')}><Text style={styles.mediaIcon}>🎥</Text></TouchableOpacity>
        </View>
        {media.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            {media.map((m, idx) => (
              <View key={idx} style={{ position: 'relative', width: 80, height: 80, marginRight: 8 }}>
                {m.type === 'image' ? (
                  <Image source={{ uri: m.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 32 }}>🎥</Text>
                  </View>
                )}
                {/* Indicador de carga */}
                {m.uploading && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                {/* Check verde si ya está subido */}
                {m.url && !m.uploading && (
                  <View style={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#4CAF50', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => removeMedia(idx)} style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}>
                  <Text style={{ color: '#f00', fontWeight: 'bold', fontSize: 16 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.pasosList}>
          {recipeDraft.pasos.map((p, i) => (
            <View key={i} style={styles.pasoItem}>
              <Text style={styles.pasoNum}>Paso {i + 1}</Text>
              <Text style={styles.pasoDesc}>{p.texto}</Text>
              <View style={styles.pasoActions}>
                <TouchableOpacity onPress={() => handleEditPaso(i)} style={styles.actionBtn}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePaso(i)} style={styles.actionBtn}><Text style={[styles.actionText, { color: theme.colors.danger }]}>Eliminar</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <CustomButton
          text={isEditing ? 'Actualizar paso' : 'Agregar un paso mas'}
          onPress={handleAddPaso}
          variant="primary"
          disabled={descripcion.trim().length === 0}
          style={styles.addStepBtn}
        />
      </ScrollView>
      
      <View style={styles.footer}>
        <CustomButton text="Volver" onPress={() => navigation.goBack()} variant="secondary" style={styles.footerBtn} disabled={false} />
        <CustomButton text="Finalizar" onPress={handleFinalizar} variant="primary" style={styles.footerBtn} disabled={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { marginRight: 10 },
  title: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
  content: { padding: 20 },
  subtitle: { marginBottom: 10 },
  pasoLabel: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  textAreaContainer: { backgroundColor: '#fafafa', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  textAreaLabel: { color: '#888', marginBottom: 4 },
  textArea: { minHeight: 80, textAlignVertical: 'top', fontSize: 15, backgroundColor: '#f5f5f5', borderRadius: 6, padding: 8 },
  charCount: { alignSelf: 'flex-end', color: '#888', fontSize: 12 },
  addMediaLabel: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  mediaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  mediaBox: { flex: 1, height: 60, backgroundColor: '#eee', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  mediaIcon: { fontSize: 32, color: '#bbb' },
  addStepBtn: { marginTop: 10, marginBottom: 20 },
  pasosList: { marginTop: 10 },
  pasoItem: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginBottom: 10 },
  pasoNum: { fontWeight: 'bold', marginBottom: 2 },
  pasoDesc: { color: '#333', marginBottom: 6 },
  pasoActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { marginRight: 10 },
  actionText: { color: theme.colors.primary, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  footerBtn: { flex: 1, marginHorizontal: 5 },
});

export default AddStepScreen; 