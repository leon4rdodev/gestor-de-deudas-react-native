// src/components/UserCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { UserInfo } from '../types/auth.types';
import RestoreBackupButtom from './RestoreBackupButtom';
import AntDesign from '@expo/vector-icons/AntDesign';

interface UserCardProps {
    user: UserInfo;
    onLogout: () => Promise<void>;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onLogout }) => (
    <View style={styles.card}>
        <View style={styles.userInfo}>
            {user.picture && (
                <Image
                    source={{ uri: user.picture }}
                    style={styles.userImage}
                />
            )}
            <Text style={styles.userHeader}>¡Bienvenido!</Text>
            <Text style={styles.userInfoText}>{user.name}</Text>
            <Text style={[styles.userInfoText, { color: '#666' }]}>{user.email}</Text>
        </View>

        <RestoreBackupButtom />
        <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
        >
            <AntDesign name="logout" size={22} color="black" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
    </View>
);

export const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        margin: 16,
        alignItems: 'center',
        paddingBottom: 16,
        paddingTop: 30
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    userHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    userInfoText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#1a1a1a',
    },
    logoutButton: {
        backgroundColor: '#f5f6fa',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16
    },
    logoutText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});