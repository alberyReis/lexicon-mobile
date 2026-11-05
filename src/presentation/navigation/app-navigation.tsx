import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigation } from './main-tab-navigation';
import { WordDetailsScreen } from '@/presentation/screens/word-details';
import { LoginScreen } from '@/presentation/screens/login';
import { RegisterScreen } from '@/presentation/screens/register';
import { COLORS } from '@/shared/constants/colors';
import type { IRootStackParamList } from './navigation-types';
import { useAppNavigationBuilder } from './builder';

const Stack = createNativeStackNavigator<IRootStackParamList>();

export const AppNavigation = () => {
    const { user, isLoading } = useAppNavigationBuilder();

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.background,
                }}
            >
                <ActivityIndicator
                    testID="auth-loading-indicator"
                    size="large"
                    color={COLORS.secondary}
                />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabNavigation}
                        />
                        <Stack.Screen
                            name="WordDetails"
                            component={WordDetailsScreen}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};