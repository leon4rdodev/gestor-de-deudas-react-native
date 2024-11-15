// src/components/WelcomeScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { GoogleButton } from './ui/GoogleButton';

interface WelcomeScreenProps {
    onLogin: () => void;
    isLoginDisabled: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, isLoginDisabled }) => (
    <View style={styles.content}>
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.subtitle}>Inicia sesión con tu cuenta de Google para guardar copias de seguridad de tus datos y o restablecerlos.</Text>
        </View>

        <GoogleButton
            onPress={onLogin}
            disabled={isLoginDisabled}
        />
    </View>
);

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        marginBottom: 20,
    },
    logo: {
        width: 90,
        height: 90,
        borderRadius: 50
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
})