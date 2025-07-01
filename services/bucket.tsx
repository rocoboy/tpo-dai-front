import { createClient } from '@supabase/supabase-js';
import { env } from '../enviroment';

const supabase = createClient(env.SUPABASE_API_URL, env.SUPABASE_BUCKET_API_KEY)

export async function uploadFile(blobFile: any, filePathOrName: string, userId?: number, fileExtension?: string, contentType?: string, bucketName?: string) {
  // Si bucketName no se pasa, usar 'users' por defecto
  const bucket = bucketName || 'users';
  // Si se pasa userId, armar path como antes, si no, usar filePathOrName como path completo
  const path = userId !== undefined ? `${userId}/${filePathOrName}` : filePathOrName;
  try {
    const response = await supabase.storage.from(bucket).upload(path, blobFile, {
        contentType: contentType || (fileExtension ? `image/${fileExtension}` : 'application/octet-stream'),
        upsert: false,
    });
    console.log("errorsin", response.error?.cause, response.error?.message);
    return response.data;
  } catch (error ){
    console.log("errrore", error);
    throw Error("fallo");
  }
}