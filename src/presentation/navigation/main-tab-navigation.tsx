import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, History, House } from 'lucide-react-native';
import { COLORS } from '@/shared/constants/colors';
import type { IMainTabParamList } from './navigation-types';
import { HomeScreen } from '../screens/home';

const Tab = createBottomTabNavigator<IMainTabParamList>();

export const MainTabNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'home',
                    tabBarIcon: ({ color, size }) => (
                        <House color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={() => null}
                options={{
                    tabBarLabel: 'favorites',
                    tabBarIcon: ({ color, size }) => (
                        <Heart color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={() => null}
                options={{
                    tabBarLabel: 'history',
                    tabBarIcon: ({ color, size }) => (
                        <History color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
