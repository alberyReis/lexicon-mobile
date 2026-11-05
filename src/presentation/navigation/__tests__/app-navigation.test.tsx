import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react-native';
import { useAppNavigationBuilder } from '../builder';
import { AppNavigation } from '../app-navigation';

jest.mock('../builder', () => ({
    useAppNavigationBuilder: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({
        children,
    }: {
        children: ReactNode;
    }) => children,
}));

jest.mock('@react-navigation/native-stack', () => {
    const { View } = require('react-native');

    return {
        createNativeStackNavigator: () => ({
            Navigator: ({
                children,
            }: {
                children: ReactNode;
            }) => (
                <View testID="stack-navigator">
                    {children}
                </View>
            ),

            Screen: ({
                name,
            }: {
                name: string;
            }) => (
                <View testID={`screen-${name}`} />
            ),
        }),
    };
});

jest.mock('../main-tab-navigation', () => ({
    MainTabNavigation: () => null,
}));

jest.mock('@/presentation/screens/word-details', () => ({
    WordDetailsScreen: () => null,
}));

jest.mock('@/presentation/screens/login', () => ({
    LoginScreen: () => null,
}));

jest.mock('@/presentation/screens/register', () => ({
    RegisterScreen: () => null,
}));

const useAppNavigationBuilderMock = jest.mocked(
    useAppNavigationBuilder,
);

const authenticatedUser = {
    uid: 'user-123',
    email: 'test@example.com',
};

describe('AppNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should display a loading indicator while checking authentication', async () => {
        useAppNavigationBuilderMock.mockReturnValue({
            user: null,
            isLoading: true,
        });
        await render(<AppNavigation />);
        expect(
            screen.getByTestId('auth-loading-indicator'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('stack-navigator'),
        ).toBeNull();
    });

    it('should display authentication screens when user is not authenticated', async () => {
        useAppNavigationBuilderMock.mockReturnValue({
            user: null,
            isLoading: false,
        });
        await render(<AppNavigation />);
        expect(
            screen.getByTestId('screen-Login'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('screen-Register'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('screen-MainTabs'),
        ).toBeNull();
        expect(
            screen.queryByTestId('screen-WordDetails'),
        ).toBeNull();
    });

    it('should display authenticated screens when user is logged in', async () => {
        useAppNavigationBuilderMock.mockReturnValue({
            user: authenticatedUser,
            isLoading: false,
        });
        await render(<AppNavigation />);
        expect(
            screen.getByTestId('screen-MainTabs'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('screen-WordDetails'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('screen-Login'),
        ).toBeNull();
        expect(
            screen.queryByTestId('screen-Register'),
        ).toBeNull();
    });

    it('should hide authentication screens after login', async () => {
        useAppNavigationBuilderMock.mockReturnValue({
            user: null,
            isLoading: false,
        });
        const { rerender } = await render(
            <AppNavigation />,
        );
        expect(
            screen.getByTestId('screen-Login'),
        ).toBeTruthy();
        useAppNavigationBuilderMock.mockReturnValue({
            user: authenticatedUser,
            isLoading: false,
        });
        await rerender(<AppNavigation />);
        expect(
            screen.getByTestId('screen-MainTabs'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('screen-WordDetails'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('screen-Login'),
        ).toBeNull();
        expect(
            screen.queryByTestId('screen-Register'),
        ).toBeNull();
    });

    it('should return to authentication screens after logout', async () => {
        useAppNavigationBuilderMock.mockReturnValue({
            user: authenticatedUser,
            isLoading: false,
        });
        const { rerender } = await render(
            <AppNavigation />,
        );
        expect(
            screen.getByTestId('screen-MainTabs'),
        ).toBeTruthy();
        useAppNavigationBuilderMock.mockReturnValue({
            user: null,
            isLoading: false,
        });
        await rerender(<AppNavigation />);
        expect(
            screen.getByTestId('screen-Login'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('screen-Register'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('screen-MainTabs'),
        ).toBeNull();
        expect(
            screen.queryByTestId('screen-WordDetails'),
        ).toBeNull();
    });
});