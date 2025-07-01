import BottomBar from '@/components/BottomBar';
import theme from '@/constants/types';
import { useAppContext } from '@/context/Context';
import { Curso } from '@/models/curso';
import { Receta } from '@/models/receta';
import { getCursos } from '@/services/curso';
import { getTrendingsRecipes } from '@/services/receta';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';
import NetInfo from '@react-native-community/netinfo';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { FlatList, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function CursoCard({ curso, navigation }: { curso: Curso, navigation: any }) {
  const { userData, modal: { setType, setDialogData, setOpenModal } } = useAppContext();
  const cronograma = curso.cronogramas[0];

  const handlePress = () => {
    if (userData.alias === 'invitado') {
      setType('dialog');
      setDialogData({
        title: 'Acceso Restringido',
        subTitle: 'Necesitas iniciar sesión para ver los detalles del curso.',
        icon: 'exclamation-triangle',
        onButtonPress: () => setOpenModal(false),
      });
      setOpenModal(true);
    } else {
      navigation.navigate('cursoDetail', { idCurso: curso.idCurso });
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={styles.titulo}>{curso.nombre}</Text>
        <View style={styles.badgePresencial}><Text style={styles.badgeText}>{curso.modalidad.toUpperCase()}</Text></View>
      </View>
      <View style={styles.row}>
        <Text style={styles.fechas}>{cronograma?.fechaInicio} → {cronograma?.fechaFin}</Text>
        <Text style={styles.precio}>$ {curso.precio.toLocaleString('es-AR')}</Text>
      </View>
      <Text style={styles.sede}>{cronograma?.sede}</Text>
      <Text style={styles.horario}>{cronograma?.dias?.join(', ')} {cronograma?.horario}</Text>
      <Text style={styles.vacantes}>Vacantes: {cronograma?.vacantes}</Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { login: { setIsLoggedIn }, userData, modal } = useAppContext();
  const [isConnected, setIsConnected] = React.useState(true);
  const [recetas, setRecetas] = React.useState<Receta[]>([]);
  const [cursos, setCursos] = React.useState<Curso[]>([]);
  const { mutate: fetchRecetas, isPending: isLoadingRecetas } = useMutation({
    mutationFn: () => getTrendingsRecipes({ userData, modal }),
    onSuccess: (data) => {
      setRecetas(data)
    },
    onError: () => setRecetas([]),
  });
  const { mutate: fetchCursos, isPending: isLoadingCursos } = useMutation({
    mutationFn: getCursos,
    onSuccess: (data: Curso[]) => setCursos(data),
    onError: () => setCursos([]),
  });

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (isConnected) {
      fetchRecetas();
      fetchCursos();
    }
  }, [isConnected]);

  async function removeSession() {
    await SecureStore.deleteItemAsync('userSession');
    setIsLoggedIn(false);
  }

  return (
    <View style={styles.body}>
      {!isConnected ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontSize: 18 }}>No hay conexión a internet. No se puede usar la aplicación.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <Pressable style={styles.logoutBtn} onPress={removeSession}>
              <Text style={styles.logoutText}>{userData.alias === 'invitado' ? 'Salir' : 'Cerrar sesión'}</Text>
            </Pressable>
            <ImageBackground
              source={require('@/assets/images/welcome-card.png')}
              style={styles.welcomeCard}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.welcomeText}>Hola <Text style={styles.highlight}>{userData.alias}!</Text></Text>
                  <Text style={styles.subtitle}>Bienvenido a la NutriApp{"\n"}Nos Alegra Verte</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP 3 Recetas</Text>
            {isLoadingRecetas ? (
              <Text>Cargando recetas...</Text>
            ) : (
              <View style={styles.recetasRow}>
                {recetas.slice(0, 2).map((receta) => (
                  <View key={receta.id} style={styles.recetaCardSmall}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                        <Image
                          source={receta.imagen ? { uri: receta.imagen } : require('@/assets/images/bigLogo.png')}
                          style={styles.recetaImgSmall}
                        />
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginVertical: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                            <Text style={{ marginRight: 6 }}>🍴 {receta.porciones ?? 1}</Text>
                            <Text style={{ marginRight: 6 }}>⭐ {receta.promedioCalificacion ?? 1}</Text>
                          </View>
                          <Text onPress={() => navigation.navigate('recipeDetail' as never, { recetaId: receta.id })} style={styles.link}>Ir a la Receta</Text>
                        </View>
                      </View>
                      <Text style={styles.recetaTitleSmall}>{receta.nombre}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <FontAwesome name="user" size={16} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.recetaAutorSmall}>{receta.autor}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {recetas[2] && (
              <View style={styles.recetaCardLarge}>
                <Image source={recetas[2].imagen ? { uri: recetas[2].imagen } : require('@/assets/images/bigLogo.png')} style={styles.recetaImgLarge} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recetaTitleLarge}>{recetas[2].nombre}</Text>
                  <Text style={styles.recetaAutorLarge}>👤 {recetas[2].autor}</Text>
                  <Text style={styles.recetaAutorLarge}>🍴 {recetas[2].porciones} Porciones  ⭐ {recetas[2].promedioCalificacion ?? 1}</Text>
                </View>
                <View style={{display: "flex", flexDirection:"row", alignItems: "flex-end",  height: "100%"}}>
                  <Text style={styles.link} onPress={() => navigation.navigate('recipeDetail' as never, { recetaId: recetas[2].id })}>Ir a la Receta</Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cursos de Cocina</Text>
            {isLoadingCursos ? (
              <Text>Cargando cursos...</Text>
            ) : (
              <FlatList
                data={cursos}
                keyExtractor={item => item.idCurso}
                renderItem={({ item }) => <CursoCard curso={item} navigation={navigation} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{  paddingVertical: 8, gap: 30, marginHorizontal: 1 }}
              />
            )}
          </View>
        </ScrollView>
      )}
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  logoutBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.buttonBorder,
  },
  logoutText: {
    color: theme.colors.textDark,
    fontSize: 13,
  },
  welcomeCard: {
    borderWidth: 0.3,
    borderRadius: 10,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  highlight: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  welcomeImg: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  recetasRow: {
    display: "flex",
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
    justifyContent: "space-between"
  },
  recetaCardSmall: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  recetaImgSmall: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  recetaTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  recetaAutorSmall: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontSize: 11,
  },
  recetaCardLarge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    paddingVertical: 20
  },
  recetaImgLarge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  recetaTitleLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  recetaAutorLarge: {
    gap: 30,
    fontSize: 12,
    color: theme.colors.textLight,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 378,
    maxWidth: 378,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgePresencial: {
    backgroundColor: '#A5D6A7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 13,
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 'auto',
  },
  fechas: {
    fontSize: 14,
    color: '#444',
  },
  sede: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  horario: {
    fontSize: 13,
    color: '#888',
  },
  vacantes: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});
