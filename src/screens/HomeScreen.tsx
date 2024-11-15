import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity,
    Keyboard,
} from "react-native";
import ClientsSummary from "../components/ClientsSumary";
import ClientCard from "../components/ClientCard";
import { useClientContext } from "../context/ClientContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RootStackParamList } from "../types/RootStackParamList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";

type Props = NativeStackScreenProps<RootStackParamList, "HomeScreen">;

export default function HomeScreen({ navigation }: Props) {
    const { clients } = useClientContext();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<TextInput>(null);

    const clientsWithDebt = clients
        .filter(client => client.debt > 0)
        .sort((a, b) => b.debt - a.debt);

    const filteredClients = clients.filter(client =>
        client.name
            .toLowerCase()
            .includes(searchQuery
            .toLowerCase())
    ).slice(0, 5);

    const totalDebt = clientsWithDebt.reduce((acc, client) => acc + client.debt, 0);

    const handleCardPress = (id: string) => {
        setIsSearching(false);
        setSearchQuery("");
        Keyboard.dismiss();
        navigation.navigate("UserDataScreen", { id });
    };

    const handleClearSearch = () => {
        setIsSearching(false);
        setSearchQuery("");
        Keyboard.dismiss();
    };

    useEffect(() => {
        if (isSearching) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isSearching]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isSearching ? (
                    <View style={styles.searchContainer}>
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            style={styles.clearIconContainer}
                        >
                            <MaterialIcons name="close" size={34} color="#000" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Colmado Gutierrez</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSearching(true);
                                setTimeout(() => {
                                    searchInputRef.current?.focus();
                                }, 100);
                            }}
                        >
                            <MaterialIcons name="search" size={40} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <KeyboardAwareFlatList
                data={isSearching ? filteredClients : clientsWithDebt.slice(0, 10)}
                renderItem={({ item }) => (
                    <ClientCard
                        item={item}
                        navigation={navigation}
                        onPress={() => handleCardPress(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    !isSearching ? (
                        <ClientsSummary clientsWithDebt={clientsWithDebt.length} totalDebt={totalDebt} />
                    ) : null
                }
                ListEmptyComponent={<Text style={styles.clientNotFound}>No hay clientes</Text>}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="always"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa'
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        height: 70,
        elevation: 1.5,
        zIndex: 1
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        backgroundColor: "#eee",
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    clearIconContainer: {
        position: "absolute",
        right: 15,
        top: 7,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        flex: 1,
        color: '#000'
    },
    listContent: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    clientNotFound:{
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333'
    }
});
