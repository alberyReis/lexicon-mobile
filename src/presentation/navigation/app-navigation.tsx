import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigation } from './main-tab-navigation';
import type { IRootStackParamList } from './navigation-types';
import { WordDetailsScreen } from '@/presentation/screens/word-details';

const Stack = createNativeStackNavigator<IRootStackParamList>();

export const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabNavigation}
                />
                <Stack.Screen
                    name="WordDetails"
                    component={WordDetailsScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
