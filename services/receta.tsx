import { Calificacion, Receta } from '@/models/receta';
import { apiDelete, apiGet, apiPost } from './api';

export async function getTrendingsRecipes(context?: { userData: any; modal: any }): Promise<Receta[]> {
  return apiGet('/recipes/trendings', true, context);
}

export async function getRecipeById(id: string, token?: string, context?: { userData: any; modal: any }) {
  return apiGet(`/recipes/${id}`, !!token, context);
}

export async function getRecipeComments(recipeId: string, token: string, context?: { userData: any; modal: any }): Promise<Calificacion[]> {
  return apiGet(`/ratings/recipe/${recipeId}`, true, context);
}

export async function createRecipeComment(
  recipeId: string,
  valor: number,
  comentario: string,
  token: string,
  context?: { userData: any; modal: any }
): Promise<Calificacion> {
  return apiPost('/ratings', { idReceta: recipeId, valor, comentario }, true, context);
}

export async function addToFavorites(recipeId: string, token: string, context?: { userData: any; modal: any }): Promise<any> {
  return apiPost('/recipes/favorites', { idReceta: recipeId }, true, context);
}

export async function removeFromFavorites(recipeId: string, token: string, context?: { userData: any; modal: any }): Promise<any> {
  return apiDelete(`/recipes/favorites/${recipeId}`, true, context);
}

export async function getFavorites(token: string, context?: { userData?: any; modal?: any }): Promise<Receta[]> {
  return apiGet('/recipes/favorites', true, context);
}

// Función para escalar receta por ingrediente
export async function scaleRecipeByIngredient(
  recipeId: string,
  ingredientId: string,
  recetaCantidad: number,
  nuevaCantidad: number,
  token: string,
  context?: { userData: any; modal: any }
): Promise<any> {
  return apiPost('/recipes/scaleByIngredient', {
    recipeId,
    ingredientId,
    recetaCantidad,
    nuevaCantidad
  }, true, context);
}

// Función para escalar receta por porciones
export async function scaleRecipeByPortions(
  recipeId: string,
  targetPortions: number,
  token: string,
  context?: { userData: any; modal: any }
): Promise<any> {
  return apiPost('/recipes/scale', {
    recipeId,
    targetPortions
  }, true, context);
}

export async function getFilteredRecipes({ nombre, tipo, contieneIngrediente, sinIngrediente }: { nombre?: string; tipo?: string; contieneIngrediente?: string; sinIngrediente?: string }, context?: { userData?: any; modal?: any }): Promise<Receta[]> {
  const params = new URLSearchParams();
  if (nombre) params.append('nombre', nombre);
  if (tipo) params.append('tipo', tipo);
  if (contieneIngrediente) params.append('contieneIngrediente', contieneIngrediente);
  if (sinIngrediente) params.append('sinIngrediente', sinIngrediente);
  return apiGet(`/recipes/filter?${params.toString()}`, false, context);
}

export async function getUnidades(context?: { userData: any; modal: any }) {
  return apiGet('/recipes/units', false, context);
}

export async function getIngredientes(context?: { userData: any; modal: any }) {
  return apiGet('/recipes/ingredients', false, context);
}

export async function createRecipe(recipeData: any, token: string, context?: { userData: any; modal: any }) {
  if (!context) context = { userData: { token }, modal: undefined };
  if (!context.userData) context.userData = { token };
  else context.userData.token = token;
  return apiPost('/recipes', recipeData, true, context);
}

export async function getAllIngredientes(token: string, context?: { userData?: any; modal?: any }) {
  return apiGet('/ingredients', true, context);
}

export async function getAllUnidades(token: string, context?: { userData?: any; modal?: any }) {
  return apiGet('/units', true, context);
}

export async function getAllRecipeTypes(token: string, context?: { userData?: any; modal?: any }) {
  return apiGet('/recipeTypes', true, context);
}

export async function getMyRecipes(token: string, context?: { userData?: any; modal?: any }) {
  if (!context) context = { userData: { token } };
  if (!context.userData) context.userData = { token };
  else context.userData.token = token;
  return apiGet('/recipes/myRecipes', true, context);
} 