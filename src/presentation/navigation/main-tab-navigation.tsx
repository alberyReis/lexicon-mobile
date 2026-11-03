import { COLORS } from '@/shared/constants/colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { IMainTabParamList } from './navigation-types';

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
                component={() => null}
            />
            <Tab.Screen
                name="Favorites"
                component={() => null}
            />
            <Tab.Screen
                name="History"
                component={() => null}
            />
        </Tab.Navigator>
    );
};
