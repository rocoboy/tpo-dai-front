// Recipe models will be added here when needed
export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  // Add more fields as needed
}

export interface Ingrediente {
    idIngrediente: string;
    nombre: string;
}

export interface Unidad {
    idUnidad: string;
    descripcion: string;
    abreviatura: string;
}

export interface IngredienteUtilizado {
    ingrediente: Ingrediente;
    unidad: Unidad;
    cantidad: number;
    observaciones?: string;
}

export interface Receta {
    idReceta: string;
    nombreReceta: string;
    descripcionReceta: string;
    // ... add other recipe fields as needed
} 