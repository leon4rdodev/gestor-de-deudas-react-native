import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useClientContext } from "../context/ClientContext";
import { downloadDriveFile, searchFileInDrive } from "../hooks/useGoogleDrive";
import Feather from '@expo/vector-icons/Feather';

export default function RestoreBackupButtom(){
    const { setClients } = useClientContext();

    async function restoreData() {
        const dateBackup = new Date().toLocaleDateString();
        const fileId = await searchFileInDrive(`${dateBackup}.json`);

        if (fileId) {
            Alert.alert(`Descargando copia de seguridad: ${dateBackup}`, 'Los datos se descargarán en brebe, no cierres la aplicación.');
            const responseData = await downloadDriveFile(fileId);
            const jsonString = typeof responseData === 'string'
                ? responseData
                : JSON.stringify(responseData);

            setClients(jsonString);
            return;
        }

        Alert.alert('Error', 'No existe ninguna copia de seguridad en esta cuenta.')
    }

    return(
        <TouchableOpacity
            style={styles.button}
            onPress={restoreData}
        >
            <Feather name="download-cloud" size={22} color="#fff" />
            <Text style={styles.text}>Restaurar Datos</Text>
        </TouchableOpacity>
    );
}

export const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '100%',
        marginBottom: 16,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center' 
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});