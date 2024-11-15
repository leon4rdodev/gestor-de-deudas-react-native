import getAccessToken from '../utils/getAccessToken';
import { makeRequest } from '../utils/utils';

const BASE_URL = 'https://www.googleapis.com/drive/v3/';

/**
 * Realiza una solicitud con fetch utilizando el token de acceso.
 * @param {string} url - La URL de la solicitud.
 * @param {RequestInit} options - Opciones para la solicitud fetch.
 * @returns {Promise<any>} - La respuesta en formato JSON.
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
    const token = await getAccessToken();
    if (!token) {
        console.error('No se pudo obtener el token de acceso');
        throw new Error('Token de acceso no disponible');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${BASE_URL}${url}`, options);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la solicitud:', errorData);
        throw new Error(errorData.error?.message || 'Error en la solicitud');
    }

    return response.json();
};

/**
 * Busca un archivo en Google Drive.
 * @param {string} fileName - Nombre del archivo que se desea buscar.
 * @returns {Promise<string | false>} - Devuelve el ID del archivo si se encuentra, o false si no se encuentra.
 */
export const searchFileInDrive = async (fileName: string): Promise<string | false> => {
    const params = new URLSearchParams({
        q: `name='${fileName}' and trashed=false`,
        fields: 'files(id, name)',
    });

    try {
        const data = await fetchWithAuth(`files?${params.toString()}`);
        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error al buscar el archivo en Google Drive:', error);
        return false;
    }
};

/**
 * Crea una carpeta en Google Drive dentro de una carpeta padre y devuelve su ID.
 * @param {string} folderName - Nombre de la carpeta a crear.
 * @param {string} parentFolderId - ID de la carpeta padre donde se creará la nueva carpeta.
 * @returns {Promise<string>} - ID de la carpeta creada.
 */
export const createFolderInDrive = async (folderName: string, parentFolderId?: string): Promise<string> => {
    const metadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
        metadata.parents = [parentFolderId];
    }

    try {
        const data = await fetchWithAuth('files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        });

        if (data.id) {
            return data.id;
        } else {
            throw new Error('No se pudo obtener el ID de la carpeta creada');
        }
    } catch (error) {
        console.error('Error al crear la carpeta en Google Drive:', error);
        throw error;
    }
};


/**
 * Busca una carpeta en Google Drive por su nombre dentro de una carpeta específica y devuelve su ID.
 * @param {string} folderName - Nombre de la carpeta que se desea buscar.
 * @param {string} [parentFolderId] - (Opcional) ID de la carpeta padre donde se debe buscar la carpeta.
 * @returns {Promise<string | false>} - Devuelve el ID de la carpeta si se encuentra, o false si no se encuentra.
 */
export const searchFolderInDrive = async (folderName: string, parentFolderId?: string): Promise<string | false> => {
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    // Si se proporciona un parentFolderId, añadirlo a la consulta
    if (parentFolderId) {
        query += ` and '${parentFolderId}' in parents`;
    }

    const params = new URLSearchParams({
        q: query,
        fields: 'files(id, name)',
    });

    try {
        const data = await fetchWithAuth(`files?${params.toString()}`);
        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error al buscar la carpeta en Google Drive:', error);
        return false;
    }
};

/**
 * Sube o actualiza un archivo en Google Drive.
 *
 * Esta función primero busca un archivo en Google Drive por su nombre. Si el archivo existe, 
 * actualiza su contenido; si no existe, lo crea en la carpeta especificada y luego sube el contenido.
 * El archivo se almacena en formato JSON.
 *
 * @param {string} folderId - El ID de la carpeta de Google Drive donde se almacenará el archivo.
 * @param {string} fileName - El nombre del archivo a crear o actualizar en Google Drive.
 * @param {any} content - El contenido que se desea subir o actualizar en el archivo. Este se convierte en JSON.
 * @returns {Promise<any>} - Una promesa que se resuelve con la respuesta en formato JSON del archivo creado o actualizado.
 * @throws {Error} - Lanza un error si ocurre un problema durante la solicitud o el manejo del archivo.
 */
export const uploadOrUpdateFile = async (folderId: string, fileName: string, content: any) => {

    const token = await getAccessToken();

    try {
        const existingFile = await searchFileInDrive(fileName);
        const method = existingFile ? 'PATCH' : 'POST';
        const url = existingFile
            ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile}?uploadType=media`
            : 'https://www.googleapis.com/upload/drive/v3/files';

        const fileContent = JSON.stringify(content);

        if (existingFile) {
            const response = await makeRequest(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: fileContent
            });

            return await response.json();
        } else {
            const metadata = {
                name: fileName,
                parents: [folderId],
                mimeType: 'application/json'
            };

            const createResponse = await makeRequest(
                'https://www.googleapis.com/drive/v3/files',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(metadata)
                }
            );

            const fileData = await createResponse.json();

            const updateResponse = await makeRequest(
                `https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: fileContent
                }
            );

            return await updateResponse.json();
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Descarga un archivo desde Google Drive.
 *
 * Esta función utiliza el ID del archivo proporcionado para realizar una solicitud y 
 * descargar su contenido desde Google Drive. El contenido se devuelve como un objeto JSON.
 *
 * @param {string} fileId - El ID del archivo en Google Drive que se desea descargar.
 * @returns {Promise<any>} - Una promesa que se resuelve con el contenido del archivo en formato JSON.
 * @throws {Error} - Lanza un error si ocurre un problema durante la solicitud o al procesar el archivo.
 *
 * Ejemplo de uso:
 * 
 * ```ts
 * const fileId = '1A2B3C4D5E6F';
 * try {
 *   const fileContent = await downloadDriveFile(fileId);
 *   console.log('Contenido del archivo:', fileContent);
 * } catch (error) {
 *   console.error('Error al descargar el archivo:', error);
 * }
 * ```
 */
export const downloadDriveFile = async (fileId: string): Promise<any> => {
    const token = await getAccessToken();

    try {
        const response = await makeRequest(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const text = await response.text();
        return JSON.parse(text);
    } catch (error) {
        throw error;
    }
}
