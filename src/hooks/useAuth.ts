import { useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { UserInfo, GoogleAuthConfig } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNetworkConnection } from '../utils/utils';
import { Alert } from 'react-native';

interface StoredAuthData {
    user: UserInfo;
    accessToken: string;
    refreshToken: string;
    expirationDate: string;
}

const TOKEN_REFRESH_THRESHOLD_MINUTES = 10;
const AUTH_STORAGE_KEY = '@auth_data';

export const useAuth = (config: GoogleAuthConfig) => {
    const [accessToken, setAccessToken] = useState<string>('');
    const [refreshToken, setRefreshToken] = useState<string>('');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [request, response, promptAsync] = Google.useAuthRequest(config);

    /**
   * Verifica si el token está cerca de su expiración (dentro de los últimos X minutos definidos).
   * @param expirationDate Fecha de expiración del token en formato ISO.
   * @returns Booleano que indica si el token está cerca de expirar.
   */
    const isTokenNearExpiration = useCallback((expirationDate: string): boolean => {
        const expiration = new Date(expirationDate);
        const now = new Date();
        const thresholdTime = new Date(expiration.getTime() - TOKEN_REFRESH_THRESHOLD_MINUTES * 60 * 1000);
        return now >= thresholdTime;
    }, []);


    /**
     * Carga los datos de autenticación almacenados localmente y verifica si el token necesita ser refrescado.
     */
    const loadAndCheckAuth = async () => {
        try {
            const storedAuthData = await loadStoredAuthData();

            if (!storedAuthData) return;

            setUserInfo(storedAuthData.user);
            setAccessToken(storedAuthData.accessToken);
            setRefreshToken(storedAuthData.refreshToken);

            if (isTokenNearExpiration(storedAuthData.expirationDate)) {
                await refreshTokenAsync(storedAuthData.refreshToken, config.clientId);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Llama a la función `loadStoredAuthData` para recuperar los datos de autenticación desde el almacenamiento local.
     * @returns {Promise<StoredAuthData | null>} Los datos de autenticación almacenados o null si no existen.
     */
    useEffect(() => {
        loadAndCheckAuth();
    }, []);

    /**
     * Efecto que maneja la respuesta del proceso de autenticación con Google.
     */
    useEffect(() => {
        if (response?.type === 'success' && response.authentication) {
            const { accessToken, refreshToken } = response.authentication;
            if (accessToken && refreshToken) {
                handleAuthentication(accessToken, refreshToken);
            } else {
                console.error('AccessToken or RefreshToken is undefined');
            }
        }
    }, [response]);

    /**
     * Almacena los datos de autenticación en el almacenamiento local de manera segura.
     * @param user Información del usuario.
     * @param accessToken Token de acceso.
     * @param refreshToken Token de refresco.
     * @param expirationDate Fecha de expiración del token de acceso.
     */
    const storeAuthData = async (user: UserInfo, accessToken: string, refreshToken: string, expirationDate: string): Promise<void> => {
        try {
            const authData: StoredAuthData = {
                user,
                accessToken,
                refreshToken,
                expirationDate,
            };

            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw error;
        }
    };

    /**
     * Recupera los datos de autenticación almacenados en el almacenamiento local.
     * @returns {Promise<StoredAuthData | null>} Los datos de autenticación o null si no existen.
     */
    const loadStoredAuthData = async (): Promise<StoredAuthData | null> => {
        try {
            const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
            return null;
        } catch (error) {
            console.error('Error loading stored auth data:', error);
            return null;
        }
    };

    /**
     * Maneja el proceso de autenticación con Google, incluyendo la obtención de la información del usuario y el almacenamiento de los tokens.
     * @param accessToken Token de acceso obtenido tras la autenticación.
     * @param refreshToken Token de refresco.
     */
    const handleAuthentication = async (accessToken: string, refreshToken: string): Promise<void> => {
        try {
            setIsLoading(true);
            const user = await getUserInfo(accessToken);
            const tokenExpirationDate = new Date(
                new Date().getTime() + 3599 * 1000
            ).toISOString();

            await storeAuthData(user, accessToken, refreshToken, tokenExpirationDate);
            setUserInfo(user);
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Obtiene la información del usuario desde Google utilizando el token de acceso.
     * @param accessToken Token de acceso.
     * @returns {Promise<UserInfo>} Información del usuario.
     */
    const getUserInfo = async (accessToken: string): Promise<UserInfo> => {
        if (!accessToken) throw new Error('AccessToken no proporcionado');

        try {
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                throw new Error(`Error getting user info: ${response.status}`);
            }

            const userInfo: UserInfo = await response.json();
            return userInfo;
        } catch (error) {
            handleError(error);
            throw error;
        }
    };

    /**
     * Refresca el token de acceso utilizando el token de refresco.
     * @param refreshToken Token de refresco.
     * @param clientId ID del cliente utilizado para la autenticación con Google.
     */
    const refreshTokenAsync = async (refreshToken: string, clientId: string) => {
        const haveNetworkConnection = await checkNetworkConnection();
        if (!haveNetworkConnection) return; 
        
        try {
            const tokenResult = await AuthSession.refreshAsync(
                {
                    clientId: clientId,
                    refreshToken: refreshToken,
                },
                {
                    tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
                }
            );

            tokenResult.refreshToken = refreshToken;

            const expiresIn = tokenResult.expiresIn ?? 3599;

            const user = await getUserInfo(tokenResult.accessToken);

            await storeAuthData(
                user,
                tokenResult.accessToken,
                tokenResult.refreshToken,
                new Date(
                    new Date().getTime() + expiresIn * 1000
                ).toISOString()
            );

            // console.log('Token refrescado:', tokenResult.accessToken, 'Expira en:', expiresIn);
            setAccessToken(tokenResult.accessToken);
            setUserInfo(user);
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    };


    /**
     * Maneja el cierre de sesión del usuario, eliminando los datos de autenticación almacenados.
     */
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setUserInfo(null);
            setAccessToken('');
            setRefreshToken('');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const checkAndRefreshToken = async  (): Promise<boolean> =>{
        try {
            const storedAuthData = await loadStoredAuthData();

            if (!storedAuthData) return false;

            if (isTokenNearExpiration(storedAuthData.expirationDate)) {
                await refreshTokenAsync(storedAuthData.refreshToken, config.clientId);
            }
        } catch (error) {
            handleError(error);
            Alert.alert('Ha ocurrido un error', 'Ha ocurrido un error inesperado mientras se intentaba hacer la copia de seguridad: ' + error);
            return false;
        }
        return true;
    }

    /**
     * Maneja los errores en el proceso de autenticación.
     * @param error Error capturado.
     */
    const handleError = (error: unknown) => {
        console.error('Authentication error:', error);
        setIsLoading(false);
    };

    return {
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        request,
        promptAsync,
        handleLogout,
        checkAndRefreshToken
    };
};
