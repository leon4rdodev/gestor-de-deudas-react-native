import React from 'react';
import { SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { googleAuthConfig } from '../config/auth.config';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { UserCard } from '../components/UserCard';
import { StyleSheet } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function UserScreen() {
    const {
        userInfo,
        isLoading,
        request,
        promptAsync,
        handleLogout,
    } = useAuth(googleAuthConfig);
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }
    if (!userInfo) {
        return (
            <SafeAreaView style={styles.container}>
                <WelcomeScreen
                    onLogin={() => promptAsync()}
                    isLoginDisabled={!request}
                />
            </SafeAreaView>
        );
    }
    // Si hay userInfo, mostrar la pantalla del usuario
    return (
        <SafeAreaView style={styles.container}>
            <UserCard
                user={userInfo}
                onLogout={handleLogout}
            />
        </SafeAreaView>
    );
}
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    }
});