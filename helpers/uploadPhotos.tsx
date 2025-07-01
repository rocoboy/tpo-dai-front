import { env } from '@/enviroment';
import { uploadFile } from '@/services/bucket';
import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

const supabase = createClient(env.SUPABASE_API_URL, env.SUPABASE_BUCKET_API_KEY);

// Helper seguro para armar la URL pública de Supabase sin duplicar el bucket
const SUPABASE_PUBLIC_BASE = 'https://ybdgsuobogchpjaczzcc.supabase.co/storage/v1/object/public/';
export function getSupabasePublicUrl(path: string) {
  return SUPABASE_PUBLIC_BASE + path;
}

export const handleUploadPhoto = async (frontURI: string, backURI: string, id: number) => {
    if (frontURI.length == 0 || backURI.length == 0) {
        throw Error("Error alguna de las imagenes no esta cargada");
    }
    try {
        const frontBase64Data = await FileSystem.readAsStringAsync(frontURI, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const backBase64Data = await FileSystem.readAsStringAsync(backURI, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const frontbinaryString = atob(frontBase64Data);
        const backbinaryString = atob(backBase64Data);

        const frontBytes = new Uint8Array(frontbinaryString.length);
        const backBytes = new Uint8Array(backbinaryString.length);

        for (let i = 0; i < frontbinaryString.length; i++) {
            frontBytes[i] = frontbinaryString.charCodeAt(i);
        }
        for (let i = 0; i < backbinaryString.length; i++) {
            backBytes[i] = backbinaryString.charCodeAt(i);
        }
        const frontFileContent = frontBytes.buffer;
        const backFileContent = backBytes.buffer;

        const frontFileExtension = frontURI.substring(frontURI.lastIndexOf(".") + 1);
        const backFileExtension = backURI.substring(backURI.lastIndexOf(".") + 1);

        const responsefront = await uploadFile(frontFileContent, "frente", id, frontFileExtension || 'jpg');
        const responseBack = await uploadFile(backFileContent, "dorso", id, backFileExtension || 'jpg');

        return {pathBack: responseBack?.fullPath, pathFront: responsefront?.fullPath};
    } catch (error: any) {
        throw Error(error?.message || String(error));
    }
};

export const handleUploadStepMedia = async (uri: string, folderId: string, nroPaso: number, fileName: string, upsert: boolean = false, tipo_contenido: 'foto' | 'video') => {
  if (!uri) throw Error("No hay archivo para subir");
  try {
    const fileExtension = uri.substring(uri.lastIndexOf(".") + 1).toLowerCase();
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const fileContent = bytes.buffer;
    // Detectar contentType
    let contentType = '';
    if (["jpg","jpeg","png","webp","gif"].includes(fileExtension)) {
      contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    } else if (["mp4","mov","avi","webm","mkv"].includes(fileExtension)) {
      contentType = `video/${fileExtension}`;
    } else {
      contentType = 'application/octet-stream';
    }
    // Path: recipes/{folderId}/{nroPaso}/{fileName}
    const path = `${folderId}/${nroPaso}/${fileName}`;
    // Usar bucket 'recipes'
    const response = await uploadFile(fileContent, path, undefined, fileExtension, contentType, 'recipes', upsert);
    if (response?.fullPath) {
      // Devuelvo objeto DTO + url pública para la UI
      return {
        path: response.fullPath,
        url: getSupabasePublicUrl(response.fullPath),
        extension: contentType,
        tipo_contenido
      };
    }
    return undefined;
  } catch (error: any) {
    throw Error(error?.message || String(error));
  }
};

// Función para generar ID único aleatorio
export const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `recipe_${timestamp}_${random}`;
};

// Función para verificar si una carpeta existe en el bucket
export const checkFolderExists = async (folderPath: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from('recipes')
      .list(folderPath, { limit: 1 });
    
    if (error) {
      console.log('Error checking folder:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.log('Error checking folder:', error);
    return false;
  }
};

// Función para generar un ID único que no exista en el bucket
export const generateUniqueFolderId = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const folderId = generateUniqueId();
    const exists = await checkFolderExists(folderId);
    
    if (!exists) {
      console.log('ID único generado:', folderId);
      return folderId;
    }
    
    attempts++;
    console.log(`Intento ${attempts}: ID ${folderId} ya existe, generando nuevo...`);
  }
  
  // Si no se puede generar uno único después de 10 intentos, usar timestamp + random
  const fallbackId = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  console.log('Usando ID de respaldo:', fallbackId);
  return fallbackId;
};