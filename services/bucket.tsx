import { createClient } from '@supabase/supabase-js';
import { env } from '../enviroment';

const supabase = createClient(env.SUPABASE_API_URL, env.SUPABASE_BUCKET_API_KEY)

export async function uploadFile(blobFile: any, fileName: string, userId: number, fileExtension: string) {
  // Use the JS library to create a bucket.
  try {
    const response = await supabase.storage.from('users').upload(`${userId}/${fileName}`, blobFile, {
        contentType: `image/${fileExtension}`, 
        upsert: false,
    });

    console.log("errorsin", response.error?.cause, response.error?.message);
    return response.data;
  } catch (error ){
    console.log("errrore", error);

    throw Error("fallo");
  }
}