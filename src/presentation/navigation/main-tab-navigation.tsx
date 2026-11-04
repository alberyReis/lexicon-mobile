import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, History, House } from 'lucide-react-native';
import { FavoritesScreen } from '@/presentation/screens/favorites';
import { HistoryScreen } from '@/presentation/screens/history';
import { HomeScreen } from '@/presentation/screens/home';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';

import type { IMainTabParamList } from './navigation-types';

const Tab = createBottomTabNavigator<IMainTabParamList>();

export const MainTabNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.secondary,
                tabBarInactiveTintColor: COLORS.primary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: APP_STRINGS.navigation.home,
                    tabBarIcon: ({ color, size }) => (
                        <House color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: APP_STRINGS.navigation.favorites,
                    tabBarIcon: ({ color, size }) => (
                        <Heart color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarLabel: APP_STRINGS.navigation.history,
                    tabBarIcon: ({ color, size }) => (
                        <History color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
