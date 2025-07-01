export interface Receta {
  id: number;
  nombre: string;
  autor: string;
  promedioCalificacion: number;
  votos: number;
  porciones: number;
  imagen: string;
  estado?: string; // Estado de la receta: 'aprobada' | 'pendiente'
} 

export interface Usuario {
  idUsuario: number;
  mail: string;
  nickname: string;
  password?: string; // Podría ser opcional si no siempre se retorna
  habilitado: string; // Considera usar un boolean si "Si" / "No" son los únicos valores
  nombre: string | null;
  apellido: string | null;
  direccion: string | null;
  avatar: string | null;
  tipoUsuario: string; // Considera un enum si los tipos son fijos (ej: "Usuario", "Admin")
}

export interface TipoReceta {
  idTipo: string; // UUID
  descripcion: string;
}

export interface Paso {
  idPaso: string; // UUID
  nroPaso: number;
  texto: string;
  multimedia: any[]; // Define un tipo más específico si sabes lo que contendrá
}

export interface IngredienteBase {
  idIngrediente: string; // UUID
  nombre: string;
}

export interface UnidadBase {
  idUnidad: string; // UUID
  descripcion: string;
}

export interface Utilizado {
  idUtilizado: string; // UUID
  ingrediente: IngredienteBase;
  unidad: UnidadBase;
  cantidad: number;
  observaciones: string;
}

export interface Foto {
  idFoto: string; // UUID
  extension: string;
  url: string;
}

// Interfaz principal para la Receta
export interface RecetaDetalle {
  idReceta: string; // UUID
  nombreReceta: string;
  promedioCalificacion: number;
  descripcionReceta: string;
  porciones: number;
  cantidadPersonas: number;
  usuario: Usuario;
  tipoReceta: TipoReceta;
  pasos: Paso[];
  utilizados: Utilizado[];
  fotos: Foto[];
  fechaCreacion: string; // Usar 'Date' si vas a parsear la cadena
  fechaModificacion: string; // Usar 'Date' si vas a parsear la cadena
  estado: string; // Considera un enum si los estados son fijos (ej: "aprobada", "pendiente")
}

export interface Calificacion {
  idCalificacion: string;
  valor: number;
  comentario?: string | null;
  autorizado: boolean;
  fecha: string;
  usuario: {
    idUsuario: number;
    nickname: string;
    nombre: string;
    apellido: string;
  };
}

// Interfaz para el resultado del escalado de ingredientes
export interface IngredienteEscalado {
  nombreIngrediente: string;
  unidad: string;
  cantidadOriginal: number;
  cantidadEscalada: number;
}

// Interfaz para ingredientes escalados en el frontend
export interface IngredienteEscaladoFrontend {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
}