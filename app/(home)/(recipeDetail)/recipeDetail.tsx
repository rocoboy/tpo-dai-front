import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { useAppContext } from '@/context/Context';
import { Calificacion, IngredienteEscalado, IngredienteEscaladoFrontend, Paso, RecetaDetalle, Utilizado } from '@/models/receta';
import { addToFavorites, createRecipeComment, getFavorites, getRecipeById, getRecipeComments, removeFromFavorites, scaleRecipeByIngredient, scaleRecipeByPortions } from '@/services/receta';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RecipeDetailScreen({ navigation }: { navigation: any }) {
  const route = useRoute();
  const { recetaId } = route.params as { recetaId: string | number };
  const { userData, modal } = useAppContext();

  // Estados locales para el input de comentario y rating
  const [comentario, setComentario] = React.useState('');
  const [valor, setValor] = React.useState(5);

  // Estado para saber si la receta está en favoritos
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Estados para ingredientes y porciones escalados (temporales)
  const [ingredientesEscalados, setIngredientesEscalados] = React.useState<IngredienteEscaladoFrontend[]>([]);
  const [porcionesEscaladas, setPorcionesEscaladas] = React.useState<number>(0);
  const [isEscalado, setIsEscalado] = React.useState(false);

  // TODOS LOS HOOKS VAN PRIMERO
  const recetaDetalleQuery = useQuery({
    queryKey: ['recetaDetalle', String(recetaId), userData?.token],
    queryFn: () => getRecipeById(String(recetaId), userData?.token, { userData, modal }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const comentariosQuery = useQuery({
    queryKey: ['comentarios', String(recetaId), userData?.token],
    queryFn: () => getRecipeComments(String(recetaId), userData.token, { userData, modal }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const crearComentarioMutation = useMutation({
    mutationFn: async ({ valor, comentario }: { valor: number; comentario: string }) =>
      createRecipeComment(String(recetaId), valor, comentario, userData.token, { userData, modal }),
    onSuccess: () => {
      comentariosQuery.refetch();
      setComentario('');
      setValor(5);
      modal.setType("dialog");
      modal.setDialogData({icon: "info", title: "Comentario Creado!", subTitle: "Nuestros administradores van a revisar y aprobar tu comentario si cumple con nuestras normas"});
      modal.setOpenModal(true);
    },
    onError: (error) => {
      modal.setType("dialog");
      modal.setDialogData({icon: "exclamation-triangle", title: "Error", subTitle: error.message});
      modal.setOpenModal(true);
    }
  });

  // Query para obtener favoritos y verificar si esta receta está incluida
  const favoritesQuery = useQuery({
    queryKey: ['favorites', userData?.token],
    queryFn: () => getFavorites(userData.token, { userData, modal }),
    enabled: !!userData?.token,
  });

  // Mutation para agregar/quitar de favoritos
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return removeFromFavorites(String(recetaId), userData.token, { userData, modal });
      } else {
        return addToFavorites(String(recetaId), userData.token, { userData, modal });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      favoritesQuery.refetch();
      modal.setType("dialog");
      modal.setDialogData({
        icon: "info",
        title: isFavorite ? "Quitado de favoritos" : "Agregado a favoritos",
        subTitle: isFavorite ? "La receta fue quitada de tus favoritos" : "La receta fue agregada a tus favoritos"
      });
      modal.setOpenModal(true);
    },
    onError: (error) => {
      modal.setType("dialog");
      modal.setDialogData({
        icon: "exclamation-triangle",
        title: "Error",
        subTitle: error.message
      });
      modal.setOpenModal(true);
    }
  });

  // Verificar si la receta está en favoritos cuando se cargan los favoritos
  React.useEffect(() => {
    if (favoritesQuery.data && recetaDetalleQuery.data) {
      const isInFavorites = favoritesQuery.data.some((fav: any) => fav.id === recetaDetalleQuery.data.idReceta);
      setIsFavorite(isInFavorites);
    }
  }, [favoritesQuery.data, recetaDetalleQuery.data]);

  // Al cargar la receta, inicializar los estados locales
  React.useEffect(() => {
    if (recetaDetalleQuery.data) {
      setIngredientesEscalados(recetaDetalleQuery.data.utilizados.map((u: Utilizado) => ({
        id: u.ingrediente.idIngrediente,
        nombre: u.ingrediente.nombre,
        cantidad: u.cantidad,
        unidad: u.unidad.descripcion,
      })));
      setPorcionesEscaladas(recetaDetalleQuery.data.porciones);
      setIsEscalado(false);
    }
  }, [recetaDetalleQuery.data]);

  // Mutación para escalar por ingrediente
  const scaleByIngredientMutation = useMutation({
    mutationFn: async ({ ingredienteId, recetaCantidad, nuevaCantidad }: { ingredienteId: string; recetaCantidad: number; nuevaCantidad: number }) =>
      scaleRecipeByIngredient(String(recetaId), ingredienteId, recetaCantidad, nuevaCantidad, userData.token, { userData, modal }),
    onSuccess: (data: IngredienteEscalado[], variables) => {
      setIngredientesEscalados(data.map(item => ({
        id: item.nombreIngrediente, // Usar nombre como ID temporal
        nombre: item.nombreIngrediente,
        cantidad: item.cantidadEscalada,
        unidad: item.unidad,
      })));
      // Calcular nuevas porciones basado en el factor de escalado
      const factor = variables.nuevaCantidad / variables.recetaCantidad;
      setPorcionesEscaladas(Math.round(recetaDetalleQuery.data.porciones * factor * 100) / 100);
      setIsEscalado(true);
      modal.setOpenModal(false);
      modal.setType("dialog");
      modal.setDialogData({
        icon: "info",
        title: "Ingredientes recalculados",
        subTitle: "Los ingredientes han sido recalculados según la nueva cantidad"
      });
      modal.setOpenModal(true);
    },
    onError: (error) => {
      modal.setType("dialog");
      modal.setDialogData({
        icon: "exclamation-triangle",
        title: "Error",
        subTitle: error.message
      });
      modal.setOpenModal(true);
    }
  });

  // Mutación para escalar por porciones
  const scaleByPortionsMutation = useMutation({
    mutationFn: async (targetPortions: number) =>
      scaleRecipeByPortions(String(recetaId), targetPortions, userData.token, { userData, modal }),
    onSuccess: (data: IngredienteEscalado[]) => {
      setIngredientesEscalados(data.map(item => ({
        id: item.nombreIngrediente, // Usar nombre como ID temporal
        nombre: item.nombreIngrediente,
        cantidad: item.cantidadEscalada,
        unidad: item.unidad,
      })));
      setIsEscalado(true);
      modal.setOpenModal(false);
      modal.setType("dialog");
      modal.setDialogData({
        icon: "info",
        title: "Ingredientes recalculados",
        subTitle: "Los ingredientes han sido recalculados según las nuevas porciones"
      });
      modal.setOpenModal(true);
    },
    onError: (error) => {
      modal.setType("dialog");
      modal.setDialogData({
        icon: "exclamation-triangle",
        title: "Error",
        subTitle: error.message
      });
      modal.setOpenModal(true);
    }
  });

  // AHORA SÍ LOS EARLY RETURNS
  if (recetaDetalleQuery.isLoading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (recetaDetalleQuery.isError) return <Text style={{ color: 'red', marginTop: 40 }}>{(recetaDetalleQuery.error as any)?.message}</Text>;
  
  const receta = recetaDetalleQuery.data as RecetaDetalle | undefined;
  const comentarios = (comentariosQuery.data as Calificacion[]) || [];
  const comentarioLoading = crearComentarioMutation.status === 'pending';

  if (!receta) return <Text style={{ marginTop: 40 }}>No se encontró la receta.</Text>;

  const handleComentar = () => {
    if (userData.alias === 'invitado') {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Acceso Restringido',
        subTitle: 'Necesitas iniciar sesión para comentar en las recetas.',
        icon: 'exclamation-triangle',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    } else {
      crearComentarioMutation.mutate({ valor, comentario });
    }
  };

  const handleToggleFavorite = () => {
    if (!userData?.token) {
      modal.setType("dialog");
      modal.setDialogData({
        icon: "exclamation-triangle",
        title: "Acceso denegado",
        subTitle: "Debes iniciar sesión para agregar recetas a favoritos"
      });
      modal.setOpenModal(true);
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  // Handler para recalcular ingredientes
  const handleRecalcularIngrediente = (utilizado: Utilizado) => {
    modal.setType("recalcularIngredientes");
    modal.setModalProps({
      porciones: porcionesEscaladas,
      ingredientes: ingredientesEscalados.map(u => ({
        id: u.id,
        nombre: u.nombre,
        cantidad: u.cantidad,
        unidad: u.unidad,
      })),
      ingredienteOrigen: {
        id: utilizado.ingrediente.idIngrediente,
        nombre: utilizado.ingrediente.nombre,
        cantidad: utilizado.cantidad,
        unidad: utilizado.unidad.descripcion,
      },
      onSubmit: ({ ingredienteId, recetaCantidad, nuevaCantidad }: { ingredienteId: string; recetaCantidad: number; nuevaCantidad: number }) => {
        scaleByIngredientMutation.mutate({ ingredienteId, recetaCantidad, nuevaCantidad });
      }
    });
    modal.setOpenModal(true);
  };

  const handleEscalarPorciones = (targetPortions: number) => {
    scaleByPortionsMutation.mutate(targetPortions);
  };

  const handleOpenEscalarModal = () => {
    modal.setType("escalarPorciones");
    modal.setModalProps({
      porcionesActuales: porcionesEscaladas,
      onCancel: () => modal.setOpenModal(false),
      onSubmit: handleEscalarPorciones
    });
    modal.setOpenModal(true);
  };

  return (
    <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.headerImgContainer}>
        <Image source={require('@/assets/images/bigLogo.png')} style={styles.headerImg} />
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate("home" as never)}>
          <FontAwesome name="chevron-left" size={32} color={theme.colors.secondary} />
        </Pressable>
        <Pressable style={styles.favBtn} onPress={handleToggleFavorite}>
          <FontAwesome 
            name={isFavorite ? "heart" : "heart-o"} 
            size={32} 
            color={isFavorite ? "#ff4757" : theme.colors.secondary} 
          />
        </Pressable>
      </View>
      <View style={styles.contentCard}>
        <Text style={styles.recipeTitle}>{receta.nombreReceta}</Text>
        <View style={styles.recipeMetaRow}>
          <View style={styles.metaLeft}>
            <FontAwesome name="user-o" size={16} color={theme.colors.textLight} />
            <Text style={styles.metaText}>{receta.usuario.nickname}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaText}>{receta.porciones} Porciones</Text>
            <MaterialIcons name="restaurant-menu" size={16} color={theme.colors.textLight} style={{ marginHorizontal: 4 }} />
            <Text style={styles.metaText}>{receta.promedioCalificacion ?? 'N/A'}</Text>
            <FontAwesome name="star" size={16} color="#FFD700" style={{ marginLeft: 2 }} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{receta.descripcionReceta}</Text>
        <View style={styles.ingredientesHeaderRow}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <View style={styles.porcionesBox}>
            <Text style={styles.porcionesText}>{porcionesEscaladas} Porciones</Text>
            <FontAwesome name="balance-scale" size={18} color={theme.colors.textLight} style={{ marginLeft: 4, opacity: 0.3 }} />
            <Pressable 
              style={styles.scaleButton} 
              onPress={handleOpenEscalarModal}
            >
              <Text style={styles.scaleButtonText}>Escalar</Text>
            </Pressable>
            {isEscalado && (
              <Pressable 
                style={styles.resetButton} 
                onPress={() => {
                  if (recetaDetalleQuery.data) {
                    setIngredientesEscalados(recetaDetalleQuery.data.utilizados.map((u: Utilizado) => ({
                      id: u.ingrediente.idIngrediente,
                      nombre: u.ingrediente.nombre,
                      cantidad: u.cantidad,
                      unidad: u.unidad.descripcion,
                    })));
                    setPorcionesEscaladas(recetaDetalleQuery.data.porciones);
                    setIsEscalado(false);
                  }
                }}
              >
                <Text style={styles.resetButtonText}>Restaurar</Text>
              </Pressable>
            )}
          </View>
        </View>
        {ingredientesEscalados.length > 0 && ingredientesEscalados.map((ing: IngredienteEscaladoFrontend, idx: any) => (
          <View key={idx} style={[styles.ingredienteRow, isEscalado && styles.ingredienteRowEscalado]}>
            <Text style={styles.ingredienteNombre}>{ing.nombre}</Text>
            <Pressable style={styles.ingredienteCantidadBox} onPress={() => handleRecalcularIngrediente({
              ingrediente: { idIngrediente: ing.id, nombre: ing.nombre },
              cantidad: ing.cantidad,
              unidad: { idUnidad: ing.id, descripcion: ing.unidad },
            } as Utilizado)}>
              <Text style={styles.ingredienteCantidad}>{ing.cantidad} {ing.unidad}</Text>
            </Pressable>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Instrucciones</Text>
        <Image
          source={require('@/assets/images/bigLogo.png')}
          style={styles.instruccionesImg}
        />
        {receta.pasos.length > 0 && receta.pasos.sort((a, b) => a.nroPaso - b.nroPaso).map((inst: Paso, idx: any) => (
          <View key={idx} style={styles.instruccionRow}>
            <Text style={styles.instruccionPaso}>Paso {inst.nroPaso}:</Text>
            <Text style={styles.instruccionTexto}>{inst.texto}</Text>
          </View>
        ))}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Comentarios</Text>
          {comentarios.length === 0 && <Text style={{ color: '#888' }}>No hay comentarios aún.</Text>}
          {comentarios.length > 0 && comentarios.sort((a: Calificacion, b: Calificacion) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((c: Calificacion) => (
            <View key={c.idCalificacion} style={{ backgroundColor: '#f8f8f8', borderRadius: 8, padding: 10, marginBottom: 8, display: "flex", flexDirection: "row", alignItems:"center", gap: 15 }}>
              <FontAwesome name="user-o" size={28} color={theme.colors.primary} />
              <View  style={{display:"flex", flexDirection:"column", alignItems:"flex-start"}} >
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18  }}>{c.usuario.nickname}</Text>
                  <View style={{ flexDirection: 'row', paddingLeft: 10, alignItems: "center"}}>
                    <FontAwesome name="star" size={20} color="#FFD700" />
                    <Text style={{ marginLeft: 4, fontSize: 15 }}>{c.valor}</Text>
                  </View>
                </View>
                <Text style={{ color: '#aaa', fontSize: 12 }}>{new Date(c.fecha).toLocaleDateString()}</Text>
                <Text style={{ color: theme.colors.textDark, fontSize: 18 }}>{c.comentario}</Text>
              </View>
            </View>
          ))}
          <View style={{ marginTop: 16 }}>
            {userData.alias === 'invitado' ? (
              <View style={{ backgroundColor: '#f8f8f8', borderRadius: 8, padding: 15, marginTop: 10 }}>
                <Text style={{ color: '#666', textAlign: 'center', fontWeight: 'bold' }}>
                  Inicia sesión para comentar en esta receta
                </Text>
              </View>
            ) : (
              <View>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Dejá tu comentario:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ marginRight: 8 }}>Calificación:</Text>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Pressable key={v} onPress={() => setValor(v)} disabled={comentarioLoading}>
                      <FontAwesome name="star" size={30} color={valor >= v ? '#FFD700' : '#ccc'} style={{ marginHorizontal: 2 }} />
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  value={comentario}
                  onChangeText={setComentario}
                  placeholder="Escribe tu comentario..."
                  style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 6, borderWidth: 1, borderColor: '#eee', paddingVertical: 30 }}
                  editable={!comentarioLoading}
                />
                <CustomButton
                  text={comentarioLoading ? 'Enviando...' : 'Comentar'}
                  variant="primary"
                  onPress={handleComentar}
                  disabled={comentarioLoading || !comentario.trim()}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  headerImgContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#ccc',
  },
  headerImg: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    borderRadius: 30,
    padding: 10,
    elevation: 2,
  },
  favBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: -30,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: theme.colors.textDark,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    color: theme.colors.textDark,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 10,
  },
  ingredientesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  porcionesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  porcionesText: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  ingredienteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  ingredienteRowEscalado: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  ingredienteNombre: {
    fontSize: 15,
    color: theme.colors.textDark,
  },
  ingredienteCantidadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  ingredienteCantidad: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  instruccionesImg: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginVertical: 10,
  },
  instruccionRow: {
    marginBottom: 8,
  },
  instruccionPaso: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 14,
  },
  instruccionTexto: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  scaleButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  scaleButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
