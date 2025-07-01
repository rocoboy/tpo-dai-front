import { useAppContext } from '@/context/Context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BecomeStudentScreen from "./(auth)/(becomestudent)/becomeStudent";
import LoginScreen from './(auth)/(login)/login';
import RecoverPassword from './(auth)/(recover)/recoverPassword';
import RegisterScreen from './(auth)/(register)/register';
import ValidateScreen from './(auth)/(validate)/validate';
import CursoDetailScreen from './(home)/(cursoDetail)/cursoDetail';
import RecipeDetail from './(home)/(recipeDetail)/recipeDetail';
import HomeScreen from './(home)/home';
import AddStepScreen from './addStep';
import CreateRecipeScreen from './createRecipe';
import PerfilScreen from './perfil';
import QRScannerScreen from './qrScanner';
import WelcomeScreen from './welcome';

import React from 'react';
import { StyleSheet } from 'react-native';
import CursosScreen from './cursos';
import RecetasScreen from './recetas';

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
          <Stack.Screen name="welcome" component={WelcomeScreen} />
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