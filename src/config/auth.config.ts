import { GoogleAuthConfig } from "../types/auth.types";

export const googleAuthConfig: GoogleAuthConfig = {
    clientId: 'Debes generar un androidClientId desde google cloud console y ponerlo aquí...',  
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'openid',
        'profile', 
        'email',
    ],
};