import CustomButton from '@/components/Button';
import CameraModal from '@/components/CameraModal/camera';
import InputText from '@/components/InputText';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import theme from '@/constants/types';
import { useAppContext, UtilizadoReceta } from '@/context/Context';
import { buildSupabaseUrl } from '@/enviroment';
import { generateUniqueFolderId } from '@/helpers/uploadPhotos';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { uploadFile } from '@/services/bucket';
import { createRecipe, getAllRecipeTypes } from '@/services/receta';
import { FontAwesome } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackNavigationProp, RootStackParamList } from './navigationTypes';

const CreateRecipeScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'createRecipe'>>();
  const { modal, userData, recipeDraft, setRecipeDraft, clearRecipeDraft } = useAppContext();
  const { requireAuth } = useRequireAuth();
  const queryClient = useQueryClient();
  const [tiposReceta, setTiposReceta] = useState<{ idTipo: string; descripcion: string }[]>([]);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Mutation para crear receta
  const createRecipeMutation = useMutation({
    mutationFn: async (newRecipe: any) => {
      // Crear la receta (las fotos ya están subidas)
      const createdRecipe = await createRecipe(newRecipe, userData.token);
      console.log('Receta creada:', createdRecipe);
      return createdRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      modal.setType('dialog');
      modal.setDialogData({
        title: '¡Receta Creada!',
        subTitle: 'Tu receta ha sido enviada para revisión.',
        icon: 'check-circle',
        onButtonPress: () => {
          modal.setOpenModal(false);
          console.log('Fotos subidas:', recipeDraft.fotos);
          recipeDraft.pasos.forEach((p, idx) => {
            if (p.multimedia && p.multimedia.length > 0) {
              console.log(`Paso ${idx + 1} multimedia:`, p.multimedia.map(m => m.url));
            }
          });
          clearRecipeDraft();
          navigation.navigate("home");
        },
      });
      modal.setOpenModal(true);
    },
    onError: (error: any) => {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Error',
        subTitle: error.message || 'No se pudo crear la receta. Inténtalo de nuevo.',
        icon: 'exclamation-triangle',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    },
  });

  useEffect(() => {
    getAllRecipeTypes(userData.token, { userData, modal }).then((tipos) => {
      setTiposReceta(tipos);
    });
  }, [userData.token]);

  const handleGoBack = () => {
    clearRecipeDraft();
    navigation.goBack();
  };

  const handleAddIngredient = () => {
    requireAuth(() => {
      const idsYaAgregados = recipeDraft.utilizados.map(i => i.idIngrediente);
      modal.setType('addIngredient');
      modal.setModalProps({
        idsYaAgregados,
        onSubmit: (ingredient: any) => {
          setRecipeDraft(d => ({ ...d, utilizados: [...d.utilizados, ingredient] }));
          modal.setOpenModal(false);
        },
        onCancel: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    });
  };

  const handleEditIngredient = (index: any) => {
    modal.setType('addIngredient');
    modal.setModalProps({
      initial: recipeDraft.utilizados[index],
      onSubmit: (ingredient: any) => {
        setRecipeDraft(d => ({
          ...d,
          utilizados: d.utilizados.map((ing, i) => i === index ? ingredient : ing)
        }));
        modal.setOpenModal(false);
      },
      onCancel: () => modal.setOpenModal(false),
    });
    modal.setOpenModal(true);
  };

  const handleDeleteIngredient = (index: any) => {
    setRecipeDraft(d => ({
      ...d,
      utilizados: d.utilizados.filter((_, i) => i !== index)
    }));
  };

  const handleAddStep = () => {
    navigation.navigate('addStep');
  };

  useFocusEffect(
    React.useCallback(() => {
      const newPasos = route.params?.pasos;
      if (Array.isArray(newPasos)) {
        setRecipeDraft((d: any) => ({ ...d, pasos: newPasos }));
        navigation.setParams({ pasos: undefined });
      }
    }, [route, navigation])
  );

  const handleEditStep = (index: any) => {
    navigation.navigate('addStep', { editIndex: index });
  };

  const handleDeleteStep = (index: any) => {
    setRecipeDraft(d => ({
      ...d,
      pasos: d.pasos.filter((_, i) => i !== index)
    }));
  };

  const handlePublicar = () => {
    requireAuth(() => {
      if (!userData.token) {
        modal.setType('dialog');
        modal.setDialogData({
          title: 'Error',
          subTitle: 'Debes iniciar sesión para crear una receta.',
          icon: 'exclamation-triangle',
          onButtonPress: () => modal.setOpenModal(false),
        });
        modal.setOpenModal(true);
        return;
      }
      if (!recipeDraft.nombreReceta || !recipeDraft.descripcionReceta || !recipeDraft.porciones || recipeDraft.utilizados.length === 0 || recipeDraft.pasos.length === 0) {
        modal.setType('dialog');
        modal.setDialogData({
          title: 'Campos Incompletos',
          subTitle: 'Por favor, completa todos los campos obligatorios (*).',
          icon: 'exclamation-triangle',
          onButtonPress: () => modal.setOpenModal(false),
        });
        modal.setOpenModal(true);
        return;
      }

      // Preparar payload sin fotos (se subirán después)
      const payload = { 
        ...recipeDraft,
        fotos: recipeDraft.fotos || []
      };
      
      console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
      
      // Usar la mutation que maneja la creación y subida de fotos
      createRecipeMutation.mutate(payload);
    });
  };

  const handlePhotoTaken = async (photoUri: string) => {
    setUploadingPhoto(true);
    try {
      // Asegurar que siempre haya un folderId único en Supabase antes de subir la primera foto
      let draftWithId = recipeDraft;
      if (!draftWithId.folderId) {
        const folderId = await generateUniqueFolderId();
        draftWithId = { ...draftWithId, folderId };
        setRecipeDraft(draftWithId);
      }
      const fileExtension = photoUri.substring(photoUri.lastIndexOf('.') + 1) || 'jpg';
      const fileName = `principal.${fileExtension}`;
      // Subir la foto principal con upsert: true
      const fileData = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const fileContent = bytes.buffer;
      const path = `${draftWithId.folderId}/${fileName}`;
      const response = await uploadFile(fileContent, path, undefined, fileExtension, `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`, 'recipes', true);
      if (response?.fullPath) {
        const fullUrl = buildSupabaseUrl('recipes', response.fullPath);
        setRecipeDraft(d => ({
          ...d,
          fotos: [{ extension: fileExtension, path: fullUrl }],
        }));
      }
    } catch (e) {
      console.error('Error subiendo foto principal:', e);
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Error',
        subTitle: 'No se pudo subir la foto. Intenta de nuevo.',
        icon: 'exclamation-triangle',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    }
    setUploadingPhoto(false);
    setShowCamera(false);
  };

  const renderIngredient = ({ item, index }: { item: UtilizadoReceta, index: number }) => (
    <View style={styles.ingredientItem}>
      <ThemedText>{item.nombre}</ThemedText>
      <View style={styles.ingredientDetails}>
        <View style={styles.quantityContainer}>
          <ThemedText style={styles.quantityText}>{`${item.cantidad} ${item.descripcionUnidad}`}</ThemedText>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleEditIngredient(index)}>
          <FontAwesome name="pencil" size={18} color={theme.colors.dark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteIngredient(index)}>
          <FontAwesome name="trash" size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Determinar si hay alguna foto o multimedia subiendo
  const isAnyPhotoUploading = (
    (recipeDraft.fotos && recipeDraft.fotos.some(f => (f as any).uploading)) ||
    recipeDraft.pasos.some(p => Array.isArray((p as any).multimedia) && (p as any).multimedia.some((m: any) => m.uploading))
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color={theme.colors.light} />
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          {recipeDraft.fotos && recipeDraft.fotos.length > 0 ? (
            <TouchableOpacity style={styles.photoButton} onPress={() => setShowCamera(true)}>
              <Image source={{ uri: recipeDraft.fotos[0].path }} style={{ width: 120, height: 120, borderRadius: 10 }} />
              <ThemedText style={styles.photoText}>Cambiar Foto del Plato</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={() => setShowCamera(true)}>
              <FontAwesome name="camera" size={40} color={theme.colors.muted} />
              <ThemedText style={styles.photoText}>Publicar Foto del Plato Terminado</ThemedText>
              <ThemedText style={styles.photoSubText}>Comparte tu plato terminado con otros cocineros</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formContainer}>
          <ThemedText type="title" style={styles.title}>Crear Receta</ThemedText>

          <ThemedText>Título*</ThemedText>
          <InputText
            value={recipeDraft.nombreReceta}
            onChangeText={(v: any) => setRecipeDraft(d => ({ ...d, nombreReceta: v }))}
            placeHolder="Nombre de la receta...."
          />
          <ThemedText>Descripción</ThemedText>
          <InputText
            value={recipeDraft.descripcionReceta}
            onChangeText={(v: any) => setRecipeDraft(d => ({ ...d, descripcionReceta: v }))}
            placeHolder="Testeo de descripcion para cargar Receta"
          />

          {/* TIPO DE RECETA */}
          <ThemedText style={{ marginTop: 12, marginBottom: 4, color: '#888', fontSize: 13 }}>Tipo de Receta*</ThemedText>
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#f9f9f9' }}
              onPress={() => setShowTipoDropdown((v) => !v)}
            >
              <Text style={{ color: recipeDraft.idTipo ? '#222' : '#888' }}>
                {tiposReceta.find(t => t.idTipo === recipeDraft.idTipo)?.descripcion || 'Seleccionar tipo...'}
              </Text>
            </TouchableOpacity>
            {showTipoDropdown && (
              <View style={{ position: 'absolute', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, zIndex: 10 }}>
                <ScrollView style={{ maxHeight: 150 }}>
                  {tiposReceta.map(tipo => (
                    <TouchableOpacity key={tipo.idTipo} onPress={() => { setRecipeDraft(d => ({ ...d, idTipo: tipo.idTipo })); setShowTipoDropdown(false); }} style={{ padding: 10 }}>
                      <Text style={{ color: tipo.idTipo === recipeDraft.idTipo ? theme.colors.primary : '#222' }}>{tipo.descripcion}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* PORCIONES */}
          <ThemedText style={{ marginTop: 12, marginBottom: 4, color: '#888', fontSize: 13 }}>Porciones*</ThemedText>
          <InputText
            value={String(recipeDraft.porciones)}
            onChangeText={(v: any) => setRecipeDraft(d => ({ ...d, porciones: Number(v), cantidadPersonas: Number(v) }))}
            type="numeric"
          />

          {/* INGREDIENTES */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Ingredientes*</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
              <FontAwesome name="plus" size={14} color={theme.colors.light} />
              <Text style={styles.addButtonText}>Ingredientes</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recipeDraft.utilizados}
            renderItem={({ item, index }) => renderIngredient({ item, index })}
            keyExtractor={(item, index) => item.idIngrediente + '-' + index}
            scrollEnabled={false}
          />

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Instrucciones*</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
              <FontAwesome name="plus" size={14} color={theme.colors.light} />
              <Text style={styles.addButtonText}>Agregar pasos</Text>
            </TouchableOpacity>
          </View>
          {recipeDraft.pasos.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              {recipeDraft.pasos.map((p, i) => (
                <View key={i} style={{ backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>{`Paso ${i + 1}`}</Text>
                  <Text style={{ color: '#333', marginBottom: 6 }}>{p.texto}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => handleEditStep(i)}><Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Editar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteStep(i)}><Text style={{ color: theme.colors.danger, fontWeight: 'bold' }}>Eliminar</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <CustomButton text="Cancelar" onPress={handleGoBack} variant="secondary" disabled={createRecipeMutation.isPending || isAnyPhotoUploading} />
        <CustomButton 
          text="Publicar" 
          onPress={handlePublicar} 
          variant="primary" 
          disabled={createRecipeMutation.isPending || isAnyPhotoUploading} 
        />
      </View>
      {isAnyPhotoUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>
            Esperando que se suban todas las fotos...
          </ThemedText>
        </View>
      )}
      {createRecipeMutation.isPending && !isAnyPhotoUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>
            Creando receta...
          </ThemedText>
        </View>
      )}
      <CameraModal
        isOpen={showCamera}
        toogleOpen={() => setShowCamera(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    marginTop: 30,
  },
  photoSection: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  photoButton: {
    width: '100%',
    height: 150,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  photoText: {
    marginTop: 10,
    color: theme.colors.muted,
    fontWeight: 'bold',
  },
  photoSubText: {
    color: theme.colors.muted,
  },
  formContainer: {
    padding: 20,
    backgroundColor: theme.colors.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: theme.colors.light,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.buttonBorder,
    backgroundColor: theme.colors.light
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    marginBottom: 10,
  },
  ingredientDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 15,
  },
  quantityText: {
    color: theme.colors.light,
    fontWeight: 'bold',
  },
  iconButton: {
    marginLeft: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.light,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default CreateRecipeScreen; 