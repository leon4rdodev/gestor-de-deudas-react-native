import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={[styles.notification, type === 'success' ? styles.success : styles.error]}
        >
            <Ionicons
                name={type === 'success' ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={24}
                color="#fff"
                style={styles.icon}
            />
            <Text style={styles.message}>{message}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 20,
        left: '5%',
        right: '5%',
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    error: {
        backgroundColor: '#F44336',
    },
    message: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
    },
    icon: {
        marginRight: 10,
    },
});

export default Notification;
