import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Transaction } from '../types/types';

interface ClientContextType {
    clients: Client[];
    setClients: (clients: Client[] | string) => void;
    addClient: (client: Omit<Client, 'debt' | 'transactions'>) => void;
    getClientById: (id: string) => Client | undefined;
    addTransaction: (clientId: string, transaction: Transaction) => void;
    deleteTransaction: (clientId: string, transaction: Transaction) => void;
    updateClient: (id: string, name: string, phone?: string) => void;
    deleteClient: (id: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const isValidClientData = (data: any): data is Client[] => {
    if (!Array.isArray(data)) return false;

    const isValidTransaction = (transaction: any): transaction is Transaction => {
        return (
            typeof transaction === 'object' &&
            typeof transaction.date === 'string' &&
            typeof transaction.amount === 'number' &&
            typeof transaction.type === 'string'
        );
    };

    const isValidClient = (client: any): client is Client => {
        return (
            typeof client === 'object' &&
            typeof client.id === 'string' &&
            typeof client.name === 'string' &&
            typeof client.debt === 'number' &&
            Array.isArray(client.transactions) &&
            client.transactions.every(isValidTransaction)
        );
    };

    return data.every(isValidClient);
};

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClientsState] = useState<Client[]>([]);

    const setClients = useCallback((newClients: Client[] | string) => {
        try {
            let parsedClients: Client[];
            if (typeof newClients === 'string') {
                parsedClients = JSON.parse(newClients);
                if (!isValidClientData(parsedClients)) {
                    throw new Error('Formato de datos inválido');
                }
            } else {
                if (!isValidClientData(newClients)) {
                    throw new Error('Formato de datos inválido');
                }
                parsedClients = newClients;
            }
            setClientsState(parsedClients);
        } catch (error) {
            console.error('Error al establecer clientes:', error);
            throw new Error(`Error al procesar los datos de clientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }, []);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const storedClients = await AsyncStorage.getItem('clients');
                if (storedClients) {
                    const parsedClients = JSON.parse(storedClients);
                    if (isValidClientData(parsedClients)) {
                        setClientsState(parsedClients);
                    } else {
                        console.error('Datos almacenados inválidos');
                        await AsyncStorage.removeItem('clients');
                    }
                }
            } catch (error) {
                console.error('Error al cargar clientes:', error);
            }
        };

        loadClients();
    }, []);

    useEffect(() => {
        const saveClients = async () => {
            try {
                await AsyncStorage.setItem('clients', JSON.stringify(clients));
            } catch (error) {
                console.error('Error al guardar clientes:', error);
            }
        };

        saveClients();
    }, [clients]);

    const addClient = useCallback((client: Omit<Client, 'debt' | 'transactions'>) => {
        const newClient: Client = {
            ...client,
            transactions: [],
            debt: 0
        };
        setClientsState((prevClients) => [...prevClients, newClient]);
    }, []);

    const getClientById = useCallback((id: string) => {
        return clients.find(client => client.id === id);
    }, [clients]);

    const addTransaction = useCallback((clientId: string, transaction: Transaction) => {
        setClientsState(prevClients =>
            prevClients.map(client => {
                if (client.id === clientId) {
                    const updatedTransactions = [transaction, ...client.transactions];

                    const newDebt = updatedTransactions.reduce((totalDebt, t) => {
                        return totalDebt + (t.type === 'Deuda' ? t.amount : -t.amount);
                    }, 0);

                    return {
                        ...client,
                        debt: newDebt,
                        transactions: newDebt === 0 ? [] : updatedTransactions
                    };
                }
                return client;
            })
        );
    }, []);

    const deleteTransaction = useCallback((clientId: string, transaction: Transaction) => {
            setClientsState(prevClients => {
                const clientIndex = prevClients.findIndex(client => client.id === clientId);
                if (clientIndex === -1) {
                    return prevClients;
                }
                const client = { ...prevClients[clientIndex] };
                const updatedTransactions = client.transactions.filter(t => t !== transaction);
                const newDebt = updatedTransactions.reduce((acc, t) => acc + (t.type === 'Deuda' ? t.amount : -t.amount), 0);
                if (newDebt < 0) {
                    client.debt = 0;
                    client.transactions = [];
                } else {
                    client.debt = newDebt;
                    client.transactions = updatedTransactions;
                }
                const newClients = [...prevClients];
                newClients[clientIndex] = client;
                return newClients;
            });
    }, []);

    const updateClient = useCallback((id: string, name: string, phone?: string) => {
        setClientsState(prevClients => {
            const clientIndex = prevClients.findIndex(client => client.id === id);
            if (clientIndex === -1) return prevClients;

            const updatedClient = {
                ...prevClients[clientIndex],
                name,
                phone
            };

            const newClients = [...prevClients];
            newClients[clientIndex] = updatedClient;

            return newClients;
        });
    }, []);

    const deleteClient = useCallback((id: string) => {
        setClientsState(prevClients => {
            return prevClients.filter(client => client.id !== id);
        });
    }, []);

    return (
        <ClientContext.Provider value={{
            clients,
            setClients,
            addClient,
            getClientById,
            addTransaction,
            deleteTransaction,
            updateClient,
            deleteClient
        }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClientContext must be used within a ClientProvider');
    }
    return context;
};