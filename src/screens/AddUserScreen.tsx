import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useClientContext } from '../context/ClientContext';
import Notification from '../components/ui/Notification';
import Feather from '@expo/vector-icons/Feather';

export default function AddUserScreen() {
    const [name, setName] = useState("");
    const [debt, setDebt] = useState("");
    const [phone, setPhone] = useState("");
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const { addClient, addTransaction, clients } = useClientContext();

    const isValidPhoneNumber = (phone: string) => {
        const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
        return phoneRegex.test(phone);
    };

    const formatName = (name: string) => {
        return name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const formatNumberWithCommas = (value: string) => {
        return value.replace(/\D+/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleDebtChange = (text: string) => {
        const formattedDebt = formatNumberWithCommas(text);
        setDebt(formattedDebt);
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

    const handleAddClient = () => {
        if (name.trim() === "") {
            setNotification({ message: "El nombre es obligatorio", type: 'error' });
            return;
        }

        if (name.trim().length < 3) {
            setNotification({ message: "El nombre debe tener al menos 3 caracteres", type: 'error' });
            return;
        }

        const parsedDebt = parseFloat(debt.replace(/,/g, ''));
        if (debt !== "" && (isNaN(parsedDebt) || parsedDebt < 0)) {
            setNotification({ message: "La deuda debe ser un número válido y no negativa", type: 'error' });
            return;
        }

        if (parsedDebt > 50000) {
            setNotification({ message: "La deuda no puede ser mayor a 50,000", type: 'error' });
            return;
        }

        if (phone !== "" && !isValidPhoneNumber(phone)) {
            setNotification({ message: "El número de teléfono debe estar en el formato 000-000-0000", type: 'error' });
            return;
        }

        const formattedName = formatName(name);

        const clientExists = clients.some(client => client.name.toLowerCase() === formattedName.toLowerCase());

        if (clientExists) {
            setNotification({ message: "No se pueden agregar dos clientes con el mismo nombre", type: 'error' });
            return;
        }

        const newClient = {
            name: formattedName,
            phone,
            id: Math.random().toString(36).substr(2, 9), 
            transactions: []
        };

        addClient(newClient);

        if (parsedDebt > 0) {
            const newTransaction = {
                date: new Date().toISOString(),
                amount: parsedDebt,
                type: 'Deuda'
            };
            addTransaction(newClient.id, newTransaction);
        }

        setNotification({ message: "Cliente agregado con éxito", type: 'success' });
        setName("");
        setDebt("");
        setPhone("");
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
                    <Text style={styles.newClientTitle}>Nuevo Cliente</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre:"
                        value={name}
                        onChangeText={(text) => setName(text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ''))}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Deuda Inicial: (Opcional)"
                        value={debt}
                        onChangeText={handleDebtChange}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Número de Teléfono: (Opcional)"
                        value={phone}
                        onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                        keyboardType="phone-pad"
                        maxLength={12}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleAddClient}>
                        <Feather name="user-plus" size={22} color="#fff" />
                        <Text style={styles.buttonText}>Agregar</Text>
                        
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

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