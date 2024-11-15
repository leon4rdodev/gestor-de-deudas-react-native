import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { uploadOrUpdateFile, createFolderInDrive, searchFolderInDrive } from '../hooks/useGoogleDrive';
import { useClientContext } from '../context/ClientContext';
import { checkNetworkConnection } from '../utils/utils';
import { useAuth } from '../hooks/useAuth';
import { googleAuthConfig } from '../config/auth.config';

export default function BackupService() {
    const { clients } = useClientContext();
    const isFirstRender = useRef(true);
    const { checkAndRefreshToken } = useAuth(googleAuthConfig);

    async function createBackup() {
        const haveNetworkConnection = await checkNetworkConnection();
        if(!haveNetworkConnection) return; 

        const checkAccessToken = await checkAndRefreshToken();
        if(!checkAccessToken) return;

        let folderBackups = await searchFolderInDrive('Colmado Gutierrez Backups');
        if (!folderBackups) {
            folderBackups = await createFolderInDrive('Colmado Gutierrez Backups');
        }

        try {
            const dateBackup = new Date().toLocaleDateString();
            const folderBackupId = await searchFolderInDrive(dateBackup, folderBackups);

            if (folderBackupId) {
                await uploadOrUpdateFile(dateBackup, `${dateBackup}.json`, clients);
                return;
            }

            const backup = await createFolderInDrive(dateBackup, folderBackups);
            await uploadOrUpdateFile(backup, `${dateBackup}.json`, clients);
        } catch (error) {
            console.error('Error al crear el respaldo:', error);
        }
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if(clients.length >= 10){
            createBackup();
        }
    }, [clients]);

    return <View />;
}
