import type { ComponentType, ReactNode } from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { FavoritesScreen } from '@/presentation/screens/favorites';
import { HistoryScreen } from '@/presentation/screens/history';
import { HomeScreen } from '@/presentation/screens/home';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import { MainTabNavigation } from '../main-tab-navigation';

type ITabIconProps = {
    color: string;
    size: number;
};

type ITabScreenOptions = {
    tabBarLabel: string;
    tabBarIcon: (props: ITabIconProps) => ReactNode;
};

type ITabNavigatorOptions = {
    headerShown: boolean;
    tabBarActiveTintColor: string;
    tabBarInactiveTintColor: string;
    tabBarStyle: {
        backgroundColor: string;
    };
};

type ITabScreenProps = {
    name: string;
    component: ComponentType<any>;
    options: ITabScreenOptions;
};

const mockTabScreens: ITabScreenProps[] = [];

let mockNavigatorOptions: ITabNavigatorOptions | undefined;

jest.mock('@react-navigation/bottom-tabs', () => {
    const { View } = require('react-native');

    return {
        createBottomTabNavigator: () => ({
            Navigator: ({
                children,
                screenOptions,
            }: {
                children: ReactNode;
                screenOptions: ITabNavigatorOptions;
            }) => {
                mockNavigatorOptions = screenOptions;

                return (
                    <View testID="tab-navigator">
                        {children}
                    </View>
                );
            },

            Screen: (props: ITabScreenProps) => {
                mockTabScreens.push(props);

                return (
                    <View testID={`tab-${props.name}`} />
                );
            },
        }),
    };
});

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');

    return {
        House: ({ color, size }: ITabIconProps) => (
            <View
                testID="icon-house"
                accessibilityLabel={`${color}-${size}`}
            />
        ),

        Heart: ({ color, size }: ITabIconProps) => (
            <View
                testID="icon-heart"
                accessibilityLabel={`${color}-${size}`}
            />
        ),

        History: ({ color, size }: ITabIconProps) => (
            <View
                testID="icon-history"
                accessibilityLabel={`${color}-${size}`}
            />
        ),
    };
});

jest.mock('@/presentation/screens/home', () => ({
    HomeScreen: () => null,
}));

jest.mock('@/presentation/screens/favorites', () => ({
    FavoritesScreen: () => null,
}));

jest.mock('@/presentation/screens/history', () => ({
    HistoryScreen: () => null,
}));

describe('MainTabNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockTabScreens.length = 0;
        mockNavigatorOptions = undefined;
    });

    it('should render the tab navigator', async () => {
        await render(<MainTabNavigation />);
        expect(
            screen.getByTestId('tab-navigator'),
        ).toBeTruthy();
    });

    it('should render all three tabs', async () => {
        await render(<MainTabNavigation />);
        expect(
            screen.getByTestId('tab-Home'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('tab-Favorites'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('tab-History'),
        ).toBeTruthy();
        expect(mockTabScreens).toHaveLength(3);
    });

    it('should register tabs in the correct order', async () => {
        await render(<MainTabNavigation />);
        expect(
            mockTabScreens.map(tab => tab.name),
        ).toEqual([
            'Home',
            'Favorites',
            'History',
        ]);
    });

    it('should associate each tab with its correct screen', async () => {
        await render(<MainTabNavigation />);
        expect(mockTabScreens[0].component).toBe(HomeScreen);
        expect(mockTabScreens[1].component).toBe(FavoritesScreen);
        expect(mockTabScreens[2].component).toBe(HistoryScreen);
    });

    it('should configure the correct tab labels', async () => {
        await render(<MainTabNavigation />);
        expect(
            mockTabScreens[0].options.tabBarLabel,
        ).toBe(APP_STRINGS.navigation.home);
        expect(
            mockTabScreens[1].options.tabBarLabel,
        ).toBe(APP_STRINGS.navigation.favorites);
        expect(
            mockTabScreens[2].options.tabBarLabel,
        ).toBe(APP_STRINGS.navigation.history);
    });

    it('should hide the default navigation header', async () => {
        await render(<MainTabNavigation />);
        expect(
            mockNavigatorOptions?.headerShown,
        ).toBe(false);
    });

    it('should configure active and inactive tab colors', async () => {
        await render(<MainTabNavigation />);
        expect(
            mockNavigatorOptions?.tabBarActiveTintColor,
        ).toBe(COLORS.secondary);
        expect(
            mockNavigatorOptions?.tabBarInactiveTintColor,
        ).toBe(COLORS.primary);
    });

    it('should configure the tab bar background color', async () => {
        await render(<MainTabNavigation />);
        expect(
            mockNavigatorOptions?.tabBarStyle.backgroundColor,
        ).toBe(COLORS.surface);
    });

    it('should render the home tab icon with correct properties', async () => {
        await render(<MainTabNavigation />);
        const icon = mockTabScreens[0].options.tabBarIcon({
            color: COLORS.secondary,
            size: 24,
        });
        await render(<>{icon}</>);
        expect(
            screen.getByTestId('icon-house').props.accessibilityLabel,
        ).toBe(`${COLORS.secondary}-24`);
    });

    it('should render the favorites tab icon with correct properties', async () => {
        await render(<MainTabNavigation />);
        const icon = mockTabScreens[1].options.tabBarIcon({
            color: COLORS.primary,
            size: 20,
        });
        await render(<>{icon}</>);
        expect(
            screen.getByTestId('icon-heart').props.accessibilityLabel,
        ).toBe(`${COLORS.primary}-20`);
    });

    it('should render the history tab icon with correct properties', async () => {
        await render(<MainTabNavigation />);
        const icon = mockTabScreens[2].options.tabBarIcon({
            color: COLORS.secondary,
            size: 28,
        });
        await render(<>{icon}</>);
        expect(
            screen.getByTestId('icon-history').props.accessibilityLabel,
        ).toBe(`${COLORS.secondary}-28`);
    });
});