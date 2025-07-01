import { NativeStackNavigationProp } from '@react-navigation/native-stack';
export type RootStackParamList = {
  welcome: undefined;
  home: undefined;
  recipeDetail: { recetaId: number };
  cursoDetail: { cursoId: number };
  qrScanner: undefined;
  cursos: undefined;
  recetas: undefined;
  createRecipe?: { pasos?: { descripcion: string }[] };
  addStep?: { pasos?: { descripcion: string }[]; editIndex?: number | null };
  becomeStudent: undefined;
  perfil: undefined;
  // Pantallas de auth
  login: undefined;
  register: undefined;
  recover: undefined;
  validate: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>; 