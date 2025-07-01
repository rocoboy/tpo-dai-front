import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export interface SavedRecipe {
  id: string; // ID de la receta guardada (para identificación local)
  originalId: string; // ID original de la receta en el servidor
  nombre: string;
  autor: string;
  porciones: number;
  promedioCalificacion: number;
  descripcionReceta: string;
  utilizados: any[];
  pasos: any[];
  // Estado de escalado
  ingredientesEscalados?: any[];
  porcionesEscaladas?: number;
  isEscalado?: boolean;
  // Metadata
  savedAt: number;
}

const SAVED_RECIPES_KEY = 'savedRecipes';
const MAX_SAVED_RECIPES = 10;

export const useSavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar recetas guardadas al inicializar
  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const stored = await SecureStore.getItemAsync(SAVED_RECIPES_KEY);
      if (stored) {
        setSavedRecipes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe: any, escalado?: {
    ingredientesEscalados?: any[];
    porcionesEscaladas?: number;
    isEscalado?: boolean;
  }) => {
    try {
      const newSavedRecipe: SavedRecipe = {
        id: recipe.idReceta || recipe.id,
        originalId: recipe.idReceta || recipe.id,
        nombre: recipe.nombreReceta || recipe.nombre,
        autor: recipe.usuario?.nickname || recipe.autor,
        porciones: recipe.porciones,
        promedioCalificacion: recipe.promedioCalificacion || 0,
        descripcionReceta: recipe.descripcionReceta || '',
        utilizados: recipe.utilizados || [],
        pasos: recipe.pasos || [],
        ingredientesEscalados: escalado?.ingredientesEscalados,
        porcionesEscaladas: escalado?.porcionesEscaladas,
        isEscalado: escalado?.isEscalado,
        savedAt: Date.now(),
      };

      const updatedRecipes = [newSavedRecipe, ...savedRecipes.filter(r => r.id !== newSavedRecipe.id)];
      
      // Mantener solo las últimas 10 recetas
      const limitedRecipes = updatedRecipes.slice(0, MAX_SAVED_RECIPES);
      
      await SecureStore.setItemAsync(SAVED_RECIPES_KEY, JSON.stringify(limitedRecipes));
      setSavedRecipes(limitedRecipes);
      
      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      return false;
    }
  };

  const removeRecipe = async (recipeId: string) => {
    try {
      const updatedRecipes = savedRecipes.filter(r => r.id !== recipeId);
      await SecureStore.setItemAsync(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
      return true;
    } catch (error) {
      console.error('Error removing recipe:', error);
      return false;
    }
  };

  const updateRecipeEscalado = async (recipeId: string, escalado: {
    ingredientesEscalados?: any[];
    porcionesEscaladas?: number;
    isEscalado?: boolean;
  }) => {
    try {
      const updatedRecipes = savedRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { 
              ...recipe, 
              ingredientesEscalados: escalado.ingredientesEscalados,
              porcionesEscaladas: escalado.porcionesEscaladas,
              isEscalado: escalado.isEscalado,
            }
          : recipe
      );
      
      await SecureStore.setItemAsync(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
      return true;
    } catch (error) {
      console.error('Error updating recipe escalado:', error);
      return false;
    }
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId);
  };

  const getSavedRecipe = (recipeId: string) => {
    return savedRecipes.find(r => r.id === recipeId);
  };

  const getOriginalRecipeId = (recipeId: string) => {
    const savedRecipe = savedRecipes.find(r => r.id === recipeId);
    return savedRecipe ? savedRecipe.originalId : recipeId;
  };

  return {
    savedRecipes,
    loading,
    saveRecipe,
    removeRecipe,
    updateRecipeEscalado,
    isRecipeSaved,
    getSavedRecipe,
    getOriginalRecipeId,
    loadSavedRecipes,
  };
}; 