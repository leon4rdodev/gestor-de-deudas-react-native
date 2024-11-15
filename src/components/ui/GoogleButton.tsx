import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface GoogleButtonProps {
    onPress: () => void;
    disabled: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress, disabled }) => (
    <TouchableOpacity
        style={styles.googleButton}
        disabled={disabled}
        onPress={onPress}
    >
        <View style={styles.buttonContent}>
            <AntDesign name="login" size={22} color="blue" />
            <Text style={styles.googleButtonText}>
                Continuar con Google
            </Text>
        </View>
    </TouchableOpacity>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        borderRadius: 50,
        width: width * 0.8,
        maxWidth: 340,
        padding: 14,
        elevation: 2,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleButtonText: {
        color: '#1a1a1a',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    googleIcon: {
        width: 24,
        height: 24,
    },
});