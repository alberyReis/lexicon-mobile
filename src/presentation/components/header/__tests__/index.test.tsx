import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import lexiconLogo from '../../../../../assets/images/lexicon-logo.png';
import { Header } from '../index';
import { useHeaderBuilder } from '../builder';
import { styles } from '../styles';
import { APP_STRINGS } from '@/shared/constants/app-strings';

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');

    return {
        LogOut: View,
    };
});

jest.mock('../builder', () => ({
    useHeaderBuilder: jest.fn(),
}));

const useHeaderBuilderMock = jest.mocked(useHeaderBuilder);

const handleLogoutMock = jest.fn();

describe('Header', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        useHeaderBuilderMock.mockReturnValue({
            isLoggingOut: false,
            error: '',
            handleLogout: handleLogoutMock,
        });
    });

    it('should render the application title', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.home.title),
        ).toBeTruthy();
    });

    it('should render the application subtitle', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.appSubtitle),
        ).toBeTruthy();
    });

    it('should render the application logo', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(logo.props.source).toEqual(lexiconLogo);
    });

    it('should use contain resize mode for the logo', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(logo.props.resizeMode).toBe('contain');
    });

    it('should apply the configured logo styles', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(
            StyleSheet.flatten(logo.props.style),
        ).toEqual(styles.logo);
    });

    it('should render the title and subtitle together', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.home.title),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.appSubtitle),
        ).toBeTruthy();
    });

    it('should render the logout button', async () => {
        await render(<Header />);
        expect(
            screen.getByRole('button', {
                name: APP_STRINGS.auth.logout.button,
            }),
        ).toBeTruthy();
    });

    it('should call handleLogout when pressing the logout button', async () => {
        await render(<Header />);
        fireEvent.press(
            screen.getByRole('button', {
                name: APP_STRINGS.auth.logout.button,
            }),
        );
        expect(handleLogoutMock).toHaveBeenCalledTimes(1);
    });

    it('should disable the logout button while logging out', async () => {
        useHeaderBuilderMock.mockReturnValue({
            isLoggingOut: true,
            error: '',
            handleLogout: handleLogoutMock,
        });
        await render(<Header />);
        const logoutButton = screen.getByRole('button', {
            name: APP_STRINGS.auth.logout.button,
        });
        expect(logoutButton).toBeDisabled();
        fireEvent.press(logoutButton);
        expect(handleLogoutMock).not.toHaveBeenCalled();
    });

    it('should enable the logout button when not logging out', async () => {
        await render(<Header />);
        const logoutButton = screen.getByRole('button', {
            name: APP_STRINGS.auth.logout.button,
        });
        expect(logoutButton).toBeEnabled();
    });

    it('should display the logout error message', async () => {
        useHeaderBuilderMock.mockReturnValue({
            isLoggingOut: false,
            error: APP_STRINGS.auth.logout.error,
            handleLogout: handleLogoutMock,
        });
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.auth.logout.error),
        ).toBeTruthy();
    });

    it('should not display an error when there is no error', async () => {
        await render(<Header />);
        expect(
            screen.queryByText(APP_STRINGS.auth.logout.error),
        ).toBeNull();
    });
});