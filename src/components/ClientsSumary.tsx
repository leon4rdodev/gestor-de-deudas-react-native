import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

interface ClientsSummaryProps {
    totalDebt: number;
    clientsWithDebt: number;
}

export default function ClientsSummary({ totalDebt, clientsWithDebt }: ClientsSummaryProps) {
    const formattedDebt = totalDebt.toLocaleString('es-DO');
    return (
        <>
        <View style={styles.debtSummary}>
            <View style={styles.iconRow}>
                <FontAwesome name="money" size={20} color="#000" />
                <Text style={styles.debtTotalLabel}>Deuda Total:</Text>
            </View>
            <Text style={styles.debtTotalAmount}>${formattedDebt}</Text>
            <View style={styles.iconRow}>
                <FontAwesome name="users" size={20} color="#000" />
                <Text style={styles.clientsWithDebt}>Clientes con deuda: {clientsWithDebt}</Text>
            </View>
        </View>
        { formattedDebt !== '0' &&
                <Text style={styles.separatorText}>Clientes con más deuda</Text>
        }
        </>
    );
};

const styles = StyleSheet.create({
    debtSummary: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    debtTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#44 4',
        marginLeft: 8,
    },
    debtTotalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#000',
    },
    clientsWithDebt: {
        fontSize: 16,
        color: '#555',
        marginLeft: 8,
    },
    separatorText: {
        marginBottom: 10,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    }
});
