import { Alert } from 'react-native';

export const handleError = (error: any, context: string) => {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(`Error en ${context}:`, error);
    Alert.alert("Error", `${context}: ${errorMessage}`);
};

export const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const response = await fetch('https://www.google.com', { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

export const makeRequest = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const isConnected = await checkNetworkConnection();
            if (!isConnected) throw new Error("No hay conexión a internet");

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers as Record<string, string>,
                    'Accept': 'application/json',
                    'Content-Type': options.method === 'PATCH' ? 'application/json' : (options.headers as Record<string, string>)?.['Content-Type'],
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
    
    throw lastError;
};