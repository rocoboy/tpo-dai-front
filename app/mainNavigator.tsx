import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppContext } from '@/context/Context';
import HomeScreen from './(home)/home';
import LoginScreen from './(auth)/(login)/login';
import RegisterScreen from './(auth)/(register)/register';
import RecoverPassword from './(auth)/(recover)/recoverPassword';
import ValidateScreen from './(auth)/(validate)/validate';
import BecomeStudentScreen from "./(auth)/(becomestudent)/becomeStudent";
import RecipeDetail from './(home)/(recipeDetail)/recipeDetail';
import CursoDetailScreen from './(home)/(cursoDetail)/cursoDetail';
import QRScannerScreen from './qrScanner';
import PerfilScreen from './perfil';
import CreateRecipeScreen from './createRecipe';
import AddStepScreen from './addStep';

import CursosScreen from './cursos';
import RecetasScreen from './recetas';
import React from 'react';
import { StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { login: { isLoggedIn } } = useAppContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="home" component={HomeScreen} />
          <Stack.Screen name="recipeDetail" component={RecipeDetail} />
          <Stack.Screen name="cursoDetail" component={CursoDetailScreen} />
          <Stack.Screen name="qrScanner" component={QRScannerScreen} />
          <Stack.Screen name="cursos" component={CursosScreen} />
          <Stack.Screen name="recetas" component={RecetasScreen} />
          <Stack.Screen name="createRecipe" component={CreateRecipeScreen} />
          <Stack.Screen name="addStep" component={AddStepScreen} />
          <Stack.Screen name="becomeStudent" component={BecomeStudentScreen} />
          <Stack.Screen name="perfil" component={PerfilScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="login" component={LoginScreen} />
          <Stack.Screen name="becomeStudent" component={BecomeStudentScreen} />
          <Stack.Screen name="register" component={RegisterScreen} />
          <Stack.Screen name="recover" component={RecoverPassword} />
          <Stack.Screen name="validate" component={ValidateScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});