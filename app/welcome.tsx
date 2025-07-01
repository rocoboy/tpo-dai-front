import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { Receta } from '@/models/receta';
import { getTrendingsRecipes } from '@/services/receta';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [recetas, setRecetas] = React.useState<Receta[]>([]);

  const { mutate: fetchRecetas, isPending: isLoadingRecetas } = useMutation({
    mutationFn: () => getTrendingsRecipes({ userData: { token: "" }, modal: { setType: () => {}, setDialogData: () => {}, setOpenModal: () => {} } }),
    onSuccess: (data) => {
      setRecetas(data);
    },
    onError: () => setRecetas([]),
  });

  React.useEffect(() => {
    fetchRecetas();
  }, []);

  const handleIngresar = () => {
    navigation.navigate('login' as never);
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Últimas Recetas</Text>
      </View>

      {/* Sección de recetas */}
      <View style={styles.recipesSection}>
        {isLoadingRecetas ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando recetas...</Text>
          </View>
        ) : (
          <View style={styles.recipesContainer}>
            {recetas.slice(0, 3).map((receta, index) => (
              <View key={receta.id} style={styles.recipeCard}>
                <Image 
                  source={require('@/assets/images/bigLogo.png')} 
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeTitle}>{receta.nombre}</Text>
                  <Text style={styles.recipeAutor}>👤 {receta.autor}</Text>
                  <Text style={styles.recipeMeta}>🍴 {receta.porciones} Porciones  ⭐ {receta.promedioCalificacion ?? 1}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Botón de ingresar */}
      <View style={styles.buttonContainer}>
        <CustomButton
          text="Ingresar"
          variant="primary"
          onPress={handleIngresar}
          disabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  recipesSection: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textLight,
  },
  recipesContainer: {
    gap: 15,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  recipeAutor: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  recipeMeta: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
}); 