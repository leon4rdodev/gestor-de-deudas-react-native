import AsyncStorage from '@react-native-async-storage/async-storage';

const getAccessToken = async (): Promise<string | null> => {
    try {
        const storedData = await AsyncStorage.getItem('@auth_data');
        if (storedData) {
            const authData = JSON.parse(storedData);
            return authData.accessToken; 
        }
        return null;
    } catch (error) {
        console.error('Error al leer el token:', error);
        return null;
    }
};

export default getAccessToken;