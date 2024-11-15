import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useClientContext } from '../context/ClientContext';
import Notification from '../components/ui/Notification';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStackParamList';
import Feather from '@expo/vector-icons/Feather';

type Props = NativeStackScreenProps<RootStackParamList, 'EditUserScreen'>;

export default function EditUserScreen({ route, navigation }: Props) {
    const { id } = route.params;
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const nameInputRef = useRef<TextInput>(null);
    const { getClientById, updateClient } = useClientContext();

    useEffect(() => {
        const client = getClientById(id);
        if (!client) {
            navigation.goBack();
            return;
        }
        setName(client.name);
        setPhone(client.phone ?? '');

        nameInputRef.current?.focus();
    }, [id, getClientById]);

    const isValidPhoneNumber = (phone: string) => {
        const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
        return phoneRegex.test(phone);
    };

    const formatName = (name: string) => {
        return name
            .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D+/g, "");
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

        if (match) {
            let formatted = match[1];
            if (match[2]) formatted += `-${match[2]}`;
            if (match[3]) formatted += `-${match[3]}`;
            return formatted;
        }
        return value;
    };

    const handleUpdateClient = () => {
        if (name.trim() === "") {
            setNotification({ message: "El nombre es obligatorio", type: 'error' });
            return;
        }

        if (name.trim().length < 3) {
            setNotification({ message: "El nombre debe tener al menos 3 caracteres", type: 'error' });
            return;
        }

        if (phone !== "" && !isValidPhoneNumber(phone)) {
            setNotification({ message: "El número de teléfono debe estar en el formato 000-000-0000", type: 'error' });
            return;
        }

        if (name.length > 17) {
            setNotification({ message: "El nombre es demasiado largo", type: 'error' });
            return;
        }

        const formattedName = formatName(name);
        const formattedPhone = formatPhoneNumber(phone);

        updateClient(id, formattedName, formattedPhone ?? '')
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <View style={styles.containerForm}>
                <View style={styles.formContainer}>
                    <Text style={styles.newClientTitle}>Actualizar Información</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre:"
                        value={name}
                        onChangeText={(text) => setName(text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ''))}
                        ref={nameInputRef}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Número de Teléfono:"
                        value={phone}
                        onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                        keyboardType="phone-pad"
                        maxLength={12}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleUpdateClient}>
                        <Feather name="user-check" size={22} color="#fff" />
                        <Text style={styles.buttonText}>Actualizar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    newClientTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        marginBottom: 30,
        textAlign: 'center'
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#f5f6fa'
    },

    containerForm: {
        flex: 1,
        marginTop: 90,
        alignItems: 'center',
    },
    formContainer: {
        justifyContent: 'center',
        padding: 16,
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    input: {
        padding: 14,
        marginBottom: 16,
        borderRadius: 10,
        backgroundColor: '#eee'
    },
    button: {
        backgroundColor: "#000",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});