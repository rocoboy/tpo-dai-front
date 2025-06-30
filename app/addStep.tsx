import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { useAppContext } from '@/context/Context';

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

  useEffect(() => {
    setCharCount(initialDescripcion.length);
  }, [initialDescripcion]);

  const handleAddPaso = () => {
    if (descripcion.trim().length === 0) return;
    if (isEditing && editIndex !== null) {
      setRecipeDraft(d => ({
        ...d,
        pasos: d.pasos.map((p, i) => i === editIndex ? { ...p, texto: descripcion } : p)
      }));
      setDescripcion('');
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setRecipeDraft(d => ({
        ...d,
        pasos: [
          ...d.pasos,
          { nroPaso: d.pasos.length + 1, texto: descripcion, multimedia: [] }
        ]
      }));
      setDescripcion('');
    }
  };

  const handleFinalizar = () => {
    let nuevosPasos = recipeDraft.pasos;
    if (descripcion.trim().length > 0) {
      if (isEditing && editIndex !== null) {
        nuevosPasos = recipeDraft.pasos.map((p, i) => i === editIndex ? { ...p, texto: descripcion } : p);
      } else {
        nuevosPasos = [
          ...recipeDraft.pasos,
          { nroPaso: recipeDraft.pasos.length + 1, texto: descripcion, multimedia: [] }
        ];
      }
    }
    setRecipeDraft(d => ({ ...d, pasos: nuevosPasos }));
    (navigation as any).navigate('createRecipe', { pasos: nuevosPasos });
  };

  const handleEditPaso = (index: number) => {
    setDescripcion(recipeDraft.pasos[index].texto);
    setIsEditing(true);
    setEditIndex(index);
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
        <View style={styles.mediaRow}>
          <View style={styles.mediaBox}><Text style={styles.mediaIcon}>🖼️</Text></View>
          <View style={styles.mediaBox}><Text style={styles.mediaIcon}>🎥</Text></View>
        </View>
        
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