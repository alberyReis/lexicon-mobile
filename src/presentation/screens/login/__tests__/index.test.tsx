import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useLoginBuilder } from '../builder';
import { LoginScreen } from '../index';

jest.mock('../builder', () => ({
    useLoginBuilder: jest.fn(),
}));

const useLoginBuilderMock = jest.mocked(useLoginBuilder);

const setEmailMock = jest.fn();
const setPasswordMock = jest.fn();
const handleLoginMock = jest.fn();
const handleGoToRegisterMock = jest.fn();

const createBuilderMock = (
    overrides: Partial<ReturnType<typeof useLoginBuilder>> = {},
): ReturnType<typeof useLoginBuilder> => ({
    email: '',
    setEmail: setEmailMock,
    password: '',
    setPassword: setPasswordMock,
    isLoading: false,
    error: '',
    handleLogin: handleLoginMock,
    handleGoToRegister: handleGoToRegisterMock,
    ...overrides,
});

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useLoginBuilderMock.mockReturnValue(createBuilderMock());
    });

    it('should render the login title and subtitle', async () => {
        await render(<LoginScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.login.title),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.login.subtitle),
        ).toBeTruthy();
    });

    it('should render the email and password labels', async () => {
        await render(<LoginScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.login.emailLabel),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.login.passwordLabel),
        ).toBeTruthy();
    });

    it('should render the email and password inputs', async () => {
        await render(<LoginScreen />);
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.emailPlaceholder,
            ),
        ).toBeTruthy();
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.passwordPlaceholder,
            ),
        ).toBeTruthy();
    });

    it('should display the email and password values', async () => {
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                email: 'test@example.com',
                password: 'password123',
            }),
        );
        await render(<LoginScreen />);
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.emailPlaceholder,
            ).props.value,
        ).toBe('test@example.com');
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.passwordPlaceholder,
            ).props.value,
        ).toBe('password123');
    });

    it('should update the email when typing', async () => {
        await render(<LoginScreen />);
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.emailPlaceholder,
            ),
            'test@example.com',
        );
        expect(setEmailMock).toHaveBeenCalledWith('test@example.com');
    });

    it('should update the password when typing', async () => {
        await render(<LoginScreen />);
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.login.passwordPlaceholder,
            ),
            'password123',
        );
        expect(setPasswordMock).toHaveBeenCalledWith('password123');
    });

    it('should configure the email input correctly', async () => {
        await render(<LoginScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.emailPlaceholder,
        );
        expect(emailInput.props.keyboardType).toBe('email-address');
        expect(emailInput.props.autoCapitalize).toBe('none');
        expect(emailInput.props.autoCorrect).toBe(false);
        expect(emailInput.props.autoComplete).toBe('email');
    });

    it('should hide the password characters', async () => {
        await render(<LoginScreen />);
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.passwordPlaceholder,
        );

        expect(passwordInput.props.secureTextEntry).toBe(true);
        expect(passwordInput.props.autoComplete).toBe('password');
    });

    it('should call handleLogin when pressing the login button', async () => {
        await render(<LoginScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.login.submit),
        );
        expect(handleLoginMock).toHaveBeenCalledTimes(1);
    });

    it('should navigate to register when pressing sign up', async () => {
        await render(<LoginScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.login.signUp),
        );
        expect(handleGoToRegisterMock).toHaveBeenCalledTimes(1);
    });

    it('should display an error message when authentication fails', async () => {
        const errorMessage = 'E-mail ou senha inválidos';
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                error: errorMessage,
            }),
        );
        await render(<LoginScreen />);
        expect(screen.getByText(errorMessage)).toBeTruthy();
    });

    it('should not display an error when there is no error', async () => {
        await render(<LoginScreen />);
        expect(
            screen.queryByText('E-mail ou senha inválidos'),
        ).toBeNull();
    });

    it('should disable inputs while loading', async () => {
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<LoginScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.emailPlaceholder,
        );
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.passwordPlaceholder,
        );
        expect(emailInput.props.editable).toBe(false);
        expect(passwordInput.props.editable).toBe(false);
    });

    it('should enable inputs when not loading', async () => {
        await render(<LoginScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.emailPlaceholder,
        );
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.login.passwordPlaceholder,
        );
        expect(emailInput.props.editable).toBe(true);
        expect(passwordInput.props.editable).toBe(true);
    });

    it('should display the loading indicator instead of submit text', async () => {
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<LoginScreen />);
        expect(
            screen.queryByText(APP_STRINGS.auth.login.submit),
        ).toBeNull();
        expect(
            screen.getByText(APP_STRINGS.auth.login.signUp),
        ).toBeTruthy();
    });

    it('should disable the login button while loading', async () => {
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<LoginScreen />);
        const loginButton = screen.getByTestId('login-button');
        expect(
            loginButton.props.accessibilityState?.disabled,
        ).toBe(true);
        fireEvent.press(loginButton);
        expect(handleLoginMock).not.toHaveBeenCalled();
    });

    it('should disable registration navigation while loading', async () => {
        useLoginBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<LoginScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.login.signUp),
        );
        expect(handleGoToRegisterMock).not.toHaveBeenCalled();
    });

    it('should render the registration footer', async () => {
        await render(<LoginScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.login.noAccount),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.login.signUp),
        ).toBeTruthy();
    });

    it('should render the login screen on iOS', async () => {
        const originalPlatform = Platform.OS;
        try {
            Platform.OS = 'ios';
            await render(<LoginScreen />);
            expect(
                screen.getByText(APP_STRINGS.auth.login.title),
            ).toBeTruthy();
            expect(
                screen.getByPlaceholderText(
                    APP_STRINGS.auth.login.emailPlaceholder,
                ),
            ).toBeTruthy();
        } finally {
            Platform.OS = originalPlatform;
        }
    });

    it('should render the login screen on Android', async () => {
        const originalPlatform = Platform.OS;
        try {
            Platform.OS = 'android';
            await render(<LoginScreen />);
            expect(
                screen.getByText(APP_STRINGS.auth.login.title),
            ).toBeTruthy();
            expect(
                screen.getByPlaceholderText(
                    APP_STRINGS.auth.login.passwordPlaceholder,
                ),
            ).toBeTruthy();
        } finally {
            Platform.OS = originalPlatform;
        }
    });
});
