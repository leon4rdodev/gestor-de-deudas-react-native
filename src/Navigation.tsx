import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackParamList } from "./types/RootStackParamList";

import HomeScreen from "./screens/HomeScreen";
import AddUserScreen from "./screens/AddUserScreen";
import UserScreen from "./screens/UserScreen";
import UserDataScreen from "./screens/UserDataScreen";

import { icons } from "../assets/Icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import getAccessToken from "./utils/getAccessToken";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import EditUserScreen from "./screens/EditUserScreen";

const Tab = createBottomTabNavigator();
const HomeStackNavigator = createNativeStackNavigator<RootStackParamList>();

const MyHomeStack = () => {
    return (
        <HomeStackNavigator.Navigator
            initialRouteName="HomeScreen"
        >
            <HomeStackNavigator.Screen
                name="HomeScreen"
                options={{
                    headerShown: false
                }}
                component={HomeScreen}
            />
            <HomeStackNavigator.Screen
                name="UserDataScreen"
                component={UserDataScreen}
                options={{
                    animation: 'slide_from_right',
                    headerShown: false
                }}
            />
            <HomeStackNavigator.Screen 
                name="EditUserScreen"
                component={EditUserScreen}
                options={{
                    animation: 'slide_from_right',
                    headerShown: false
                }}
            />
        </HomeStackNavigator.Navigator>
    )
}

const MyTabs = () => {
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkAccessToken = async () => {
            const token = await getAccessToken();
            if (token) {
                setInitialRoute('Home');
            } else {
                setInitialRoute('UserScreen');
            }
        };

        checkAccessToken();
    }, []);

    if (!initialRoute) {
        return <LoadingSpinner />;
    }

    return (
        <Tab.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#777',
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    height: 65,
                    paddingBottom: 5,
                },
                tabBarLabelStyle: { fontSize: 14 },
            }}
        >
            <Tab.Screen
                name="Home"
                component={MyHomeStack}
                options={{
                    tabBarIcon: (props) => icons.index(props),
                    tabBarLabel: "Inicio",
                    headerShown: false,
                    
                }}
                
            />
            <Tab.Screen
                name="AddUserScreen"
                component={AddUserScreen}
                options={{
                    tabBarIcon: (props) => icons.create(props),
                    tabBarLabel: "Agregar",
                    headerShown: false
                }}
            />
            <Tab.Screen
                name="UserScreen"
                component={UserScreen}
                options={{
                    tabBarIcon: (props) => icons.profile(props),
                    tabBarLabel: "Cuenta",
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    );
};

const Navigation = () => {
    return (
        <NavigationContainer>
            <MyTabs />
        </NavigationContainer>
    );
};

export default Navigation;