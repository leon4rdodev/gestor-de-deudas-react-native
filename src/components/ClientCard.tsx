import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

interface Item {
    id: string;
    name: string;
    debt: number;
}

export default function ClientCard({ item, onPress }: { item: Item, navigation: any, onPress: () => void }) {
    const formattedDebt = item.debt.toLocaleString('es-DO');

    return (
        <TouchableOpacity style={styles.clientCard} onPress={onPress}>
            <View>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientDebt}>Deuda total: ${formattedDebt}</Text>
            </View>
            <View style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver detalles</Text>
                <FontAwesome name="angle-right" size={20} color="#000" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    clientCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 100,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    clientDebt: {
        fontSize: 14,
        color: '#333',
    },
    detailsButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: "row",
    },
    detailsButtonText: {
        color: '#000',
        fontWeight: "bold",
        marginEnd: 10,
    },
    listContent: {
        padding: 16,
    },
});
