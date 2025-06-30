import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import InputText from '@/components/InputText';
import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { useAppContext, UtilizadoReceta } from '@/context/Context';
import { RootStackNavigationProp, RootStackParamList } from './navigationTypes';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecipe, getAllRecipeTypes } from '@/services/receta';

const CreateRecipeScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'createRecipe'>>();
  const { modal, userData, recipeDraft, setRecipeDraft, clearRecipeDraft } = useAppContext();
  const queryClient = useQueryClient();

  const [tiposReceta, setTiposReceta] = useState<{ idTipo: string; descripcion: string }[]>([]);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);

  // Mutation para crear receta
  const createRecipeMutation = useMutation({
    mutationFn: (newRecipe: any) => createRecipe(newRecipe, userData.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      modal.setType('dialog');
      modal.setDialogData({
        title: '¡Receta Creada!',
        subTitle: 'Tu receta ha sido enviada para revisión.',
        icon: 'check-circle',
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
    const payload = { ...recipeDraft };
    createRecipeMutation.mutate(payload);
    clearRecipeDraft();
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color={theme.colors.light} />
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton}>
            <FontAwesome name="camera" size={40} color={theme.colors.muted} />
            <ThemedText style={styles.photoText}>Publicar Foto del Plato Terminado</ThemedText>
            <ThemedText style={styles.photoSubText}>Comparte tu plato terminado con otros cocineros</ThemedText>
          </TouchableOpacity>
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

          /* TIPO DE RECETA */
          <ThemedText>Tipo de Receta*</ThemedText>
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

          /* PORCIONES */
          <ThemedText>Porciones*</ThemedText>
          <InputText
            value={String(recipeDraft.porciones)}
            onChangeText={(v: any) => setRecipeDraft(d => ({ ...d, porciones: Number(v), cantidadPersonas: Number(v) }))}
            type="numeric"
          />

          /* INGREDIENTES */
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
        <CustomButton text="Cancelar" onPress={handleGoBack} variant="secondary" disabled={false} />
        <CustomButton text="Publicar" onPress={handlePublicar} variant="primary" disabled={createRecipeMutation.isPending} />
      </View>
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
});

export default CreateRecipeScreen; 