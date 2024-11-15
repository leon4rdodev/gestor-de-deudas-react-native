import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
    HomeScreen: undefined;
    UserDataScreen: { id: string };
    EditUserScreen: { id: string };
};

export type StackNavigationProps<RouteName extends keyof RootStackParamList> = {
    navigation: NativeStackNavigationProp<RootStackParamList, RouteName>;
    route: RouteProp<RootStackParamList, RouteName>;
};