import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Keyboard, Alert } from 'react-native';
import { useClientContext } from '../context/ClientContext';
import Notification from '../components/ui/Notification';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStackParamList';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Client, Transaction } from '../types/types';


type Props = NativeStackScreenProps<RootStackParamList, 'UserDataScreen'>;

export default function UserDataScreen({ route, navigation }: Props) {
    const { id } = route.params;
    const { getClientById, addTransaction, deleteTransaction, deleteClient } = useClientContext();
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState<'Deuda' | 'Abono'>('Deuda');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [client, setClient] = useState<Client>();

    useEffect(() => {
        const fetchedClient = getClientById(id);
        if (!fetchedClient) {
            navigation.goBack();
            return;
        }
        setClient(fetchedClient);
    }, [id, getClientById]);

    if (!client) {
        return <></>;
    }

    const formatNumberWithCommas = (value: string) => {
        const cleaned = value.replace(/\D+/g, '');
        const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return formatted;
    };

    const formatMoney = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return date.toLocaleString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase());
    };

    const handleAmountChange = (text: string) => {
        const formattedAmount = formatNumberWithCommas(text);
        setAmount(formattedAmount);
    };

    const handleAddTransaction = () => {
        Keyboard.dismiss();
        const parsedAmount = parseFloat(amount.replace(/,/g, ''));

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setNotification({ message: 'Por favor, ingrese un monto válido.', type: 'error' });
            return;
        }

        if (transactionType === 'Deuda' && parsedAmount > 50000) {
            setNotification({ message: 'No se puede agregar una deuda mayor a 50,000.', type: 'error' });
            return;
        }
        if (transactionType === 'Abono' && parsedAmount > client.debt) {
            setNotification({ message: 'El abono no puede ser mayor a la deuda pendiente.', type: 'error' });
            return;
        }

        const now = new Date();
        const formattedDate = now.toISOString();

        const newTransaction = {
            date: formattedDate,
            amount: parsedAmount,
            type: transactionType
        };

        addTransaction(client.id, newTransaction);
        setAmount('');
        setNotification({ message: 'Transacción agregada correctamente.', type: 'success' });
    };

    const handleDeleteClient = () => {
        if (client.debt === 0) {
            Alert.alert(
                'Confirmar Eliminación',
                '¿Estás seguro de que deseas eliminar este cliente? \n\nEsta acción no se puede revertir.',
                [
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteClient(client.id) },
                    { text: 'Cancelar', style: 'cancel' }
                ]
            );

            return;
        }

        Alert.alert(
            'Este cliente tiene deudas pendientes',
            'No se puede eliminar este cliente debido a que tiene deudas pendientes, intentalo nuevamente cuando el cliente salde su deuda por completo.'
        );
    };

    const handleUpdateClient = () => {
        navigation.navigate('EditUserScreen', { id: client.id });
    };

    const deleteTransactionAndNotification = (transaction: any) => {
        deleteTransaction(client.id, transaction)
        setNotification({ message: 'Transacción eliminada correctamente.', type: 'success' });
    };

    const confirmDeleteTransaction = (transaction: any) => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que deseas eliminar esta transacción? \n\nEsta acción no se puede revertir.',
            [
                { text: 'Eliminar', style: 'destructive', onPress: () => deleteTransactionAndNotification(transaction) },
                { text: 'Cancelar', style: 'cancel', onPress: () => { } }
            ]
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <View style={styles.container}>
                <View style={styles.clientInfo}>
                    <View>
                        <Text style={styles.clientName}>{client.name}</Text>
                        <Text style={styles.clientDebt}>Deuda total: ${formatMoney(client.debt)}</Text>
                        <Text style={styles.clientPhone}>Teléfono: {client.phone ? client.phone : '...'}</Text>
                    </View>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={handleUpdateClient}>
                            <FontAwesome6 name="edit" size={30} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDeleteClient}>
                            <Ionicons name="trash-bin-outline" size={30} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.transactionForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Monto de la transacción..."
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="number-pad"
                    />
                    <View style={styles.transactionTypeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                transactionType === 'Deuda' && styles.activeDeudaButton
                            ]}
                            onPress={() => setTransactionType('Deuda')}
                        >
                            <Text style={[styles.typeButtonText, transactionType === 'Deuda' && styles.activeTypeButtonText]}>Deuda</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                transactionType === 'Abono' && styles.activeAbonoButton
                            ]}
                            onPress={() => setTransactionType('Abono')}
                        >
                            <Text style={[styles.typeButtonText, transactionType === 'Abono' && styles.activeTypeButtonText]}>Abono</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addTransactionButton} onPress={handleAddTransaction}>
                        <MaterialIcons name="attach-money" size={22} color="#fff" />
                        <Text style={styles.addTransactionButtonText}>Agregar Transacción</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.transactionHistory}>
                    <Text style={styles.transactionTitle}>Historial de Transacciones</Text>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={client.transactions}
                        keyExtractor={(_item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.transactionCard}>
                                <View>
                                    <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
                                    <Text
                                        style={[
                                            styles.transactionAmount,
                                            item.type === 'Abono' ? styles.abonoAmount : styles.deudaAmount
                                        ]}
                                    >
                                        Monto: ${formatMoney(item.amount)}
                                    </Text>
                                    <Text style={styles.transactionType}>Tipo: {item.type}</Text>
                                </View>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteTransaction(item)}>
                                    <Ionicons name="trash-bin-outline" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.noResultsText}>No hay transacciones para mostrar. Si el cliente salda su deuda completa, el historial se reiniciará para ahorrar espacio en el dispositivo.</Text>}
                    />
                </View>
            </View>
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#f5f6fa'
    },
    clientInfo: {
        marginBottom: 16,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    clientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
    },
    clientDebt: {
        fontSize: 18,
        marginTop: 16,
        color: '#555',
    },
    clientPhone: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
    transactionForm: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    input: {
        padding: 14,
        marginBottom: 16,
        borderRadius: 10,
        backgroundColor: '#eee'
    },
    transactionTypeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 16
    },
    typeButton: {
        flex: 1,
        padding: 14,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    activeDeudaButton: {
        backgroundColor: '#FF6B6B',
    },
    activeAbonoButton: {
        backgroundColor: '#4CAF50',
    },
    typeButtonText: {
        color: '#000',
        fontWeight: 'bold'
    },
    activeTypeButtonText: {
        color: '#fff',
    },
    addTransactionButton: {
        backgroundColor: '#000',
        padding: 14,
        borderRadius: 10,
        gap: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    addTransactionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    transactionHistory: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222',
    },
    transactionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionDate: {
        fontSize: 14,
        color: '#222',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    deudaAmount: {
        color: '#FF6B6B',
    },
    abonoAmount: {
        color: '#4CAF50',
    },
    transactionType: {
        fontSize: 14,
        color: '#555',
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#777',
    },
    deleteButton: {
        marginRight: 16,
        position: 'absolute',
        right: 0
    },
    actionsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row-reverse',
        gap: 16,
        position: 'absolute',
        right: 16,
        top: 16
    }
});