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
        throw Error(error);

    }
};