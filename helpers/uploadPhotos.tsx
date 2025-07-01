import { uploadFile } from '@/services/bucket';
import * as FileSystem from 'expo-file-system';

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

export const handleUploadStepMedia = async (uri: string, idReceta: string | number, nroPaso: number, fileName: string) => {
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
        // Path: recipes/{idReceta}/{nroPaso}/{fileName}
        const path = `${idReceta}/${nroPaso}/${fileName}`;
        // Usar bucket 'recipes'
        const response = await uploadFile(fileContent, path, undefined, fileExtension, contentType, 'recipes');
        return response?.fullPath;
    } catch (error: any) {
        throw Error(error?.message || String(error));
    }
};