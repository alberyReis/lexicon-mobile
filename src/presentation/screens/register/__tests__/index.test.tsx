import { fireEvent, render, screen } from '@testing-library/react-native';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useRegisterBuilder } from '../builder';
import { RegisterScreen } from '../index';

jest.mock('../builder', () => ({
    useRegisterBuilder: jest.fn(),
}));

const useRegisterBuilderMock = jest.mocked(useRegisterBuilder);

const setEmailMock = jest.fn();
const setPasswordMock = jest.fn();
const setConfirmPasswordMock = jest.fn();
const handleRegisterMock = jest.fn();
const handleGoToLoginMock = jest.fn();

const createBuilderMock = (
    overrides: Partial<ReturnType<typeof useRegisterBuilder>> = {},
): ReturnType<typeof useRegisterBuilder> => ({
    email: '',
    setEmail: setEmailMock,
    password: '',
    setPassword: setPasswordMock,
    confirmPassword: '',
    setConfirmPassword: setConfirmPasswordMock,
    isLoading: false,
    error: '',
    handleRegister: handleRegisterMock,
    handleGoToLogin: handleGoToLoginMock,
    ...overrides,
});

describe('RegisterScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock(),
        );
    });

    it('should render the registration title and subtitle', async () => {
        await render(<RegisterScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.register.title),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.register.subtitle),
        ).toBeTruthy();
    });

    it('should render all form labels', async () => {
        await render(<RegisterScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.register.emailLabel),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.register.passwordLabel),
        ).toBeTruthy();
        expect(
            screen.getByText(
                APP_STRINGS.auth.register.confirmPasswordLabel,
            ),
        ).toBeTruthy();
    });

    it('should render all form inputs', async () => {
        await render(<RegisterScreen />);
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.emailPlaceholder,
            ),
        ).toBeTruthy();
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.passwordPlaceholder,
            ),
        ).toBeTruthy();
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.confirmPasswordPlaceholder,
            ),
        ).toBeTruthy();
    });

    it('should display the form values', async () => {
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            }),
        );
        await render(<RegisterScreen />);
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.emailPlaceholder,
            ).props.value,
        ).toBe('test@example.com');
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.passwordPlaceholder,
            ).props.value,
        ).toBe('password123');
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.confirmPasswordPlaceholder,
            ).props.value,
        ).toBe('password123');
    });

    it('should update the email when typing', async () => {
        await render(<RegisterScreen />);
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.emailPlaceholder,
            ),
            'test@example.com',
        );
        expect(setEmailMock).toHaveBeenCalledWith(
            'test@example.com',
        );
    });

    it('should update the password when typing', async () => {
        await render(<RegisterScreen />);
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.passwordPlaceholder,
            ),
            'password123',
        );
        expect(setPasswordMock).toHaveBeenCalledWith(
            'password123',
        );
    });

    it('should update the password confirmation when typing', async () => {
        await render(<RegisterScreen />);
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.auth.register.confirmPasswordPlaceholder,
            ),
            'password123',
        );
        expect(setConfirmPasswordMock).toHaveBeenCalledWith(
            'password123',
        );
    });

    it('should configure the email input correctly', async () => {
        await render(<RegisterScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.emailPlaceholder,
        );
        expect(emailInput.props.keyboardType).toBe('email-address');
        expect(emailInput.props.autoCapitalize).toBe('none');
        expect(emailInput.props.autoCorrect).toBe(false);
        expect(emailInput.props.autoComplete).toBe('email');
    });

    it('should hide the password characters', async () => {
        await render(<RegisterScreen />);
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.passwordPlaceholder,
        );
        expect(passwordInput.props.secureTextEntry).toBe(true);
        expect(passwordInput.props.autoComplete).toBe('new-password');
    });

    it('should hide the confirmation password characters', async () => {
        await render(<RegisterScreen />);
        const confirmPasswordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.confirmPasswordPlaceholder,
        );
        expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
        expect(confirmPasswordInput.props.autoComplete).toBe('new-password');
    });

    it('should call handleRegister when pressing submit', async () => {
        await render(<RegisterScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.register.submit),
        );
        expect(handleRegisterMock).toHaveBeenCalledTimes(1);
    });

    it('should navigate to login when pressing sign in', async () => {
        await render(<RegisterScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.register.signIn),
        );
        expect(handleGoToLoginMock).toHaveBeenCalledTimes(1);
    });

    it('should display an error message', async () => {
        const errorMessage = 'As senhas não coincidem';
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                error: errorMessage,
            }),
        );
        await render(<RegisterScreen />);
        expect(screen.getByText(errorMessage)).toBeTruthy();
    });

    it('should not display an error when there is no error', async () => {
        await render(<RegisterScreen />);
        expect(
            screen.queryByText('As senhas não coincidem'),
        ).toBeNull();
    });

    it('should disable all inputs while loading', async () => {
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<RegisterScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.emailPlaceholder,
        );
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.passwordPlaceholder,
        );
        const confirmPasswordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.confirmPasswordPlaceholder,
        );
        expect(emailInput.props.editable).toBe(false);
        expect(passwordInput.props.editable).toBe(false);
        expect(confirmPasswordInput.props.editable).toBe(false);
    });

    it('should enable all inputs when not loading', async () => {
        await render(<RegisterScreen />);
        const emailInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.emailPlaceholder,
        );
        const passwordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.passwordPlaceholder,
        );
        const confirmPasswordInput = screen.getByPlaceholderText(
            APP_STRINGS.auth.register.confirmPasswordPlaceholder,
        );
        expect(emailInput.props.editable).toBe(true);
        expect(passwordInput.props.editable).toBe(true);
        expect(confirmPasswordInput.props.editable).toBe(true);
    });

    it('should display loading instead of submit text', async () => {
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<RegisterScreen />);
        expect(
            screen.queryByText(APP_STRINGS.auth.register.submit),
        ).toBeNull();
    });

    it('should disable the register button while loading', async () => {
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<RegisterScreen />);
        const registerButton = screen.getByTestId('register-button');
        expect(
            registerButton.props.accessibilityState?.disabled,
        ).toBe(true);
        fireEvent.press(registerButton);
        expect(handleRegisterMock).not.toHaveBeenCalled();
    });

    it('should disable login navigation while loading', async () => {
        useRegisterBuilderMock.mockReturnValue(
            createBuilderMock({
                isLoading: true,
            }),
        );
        await render(<RegisterScreen />);
        fireEvent.press(
            screen.getByText(APP_STRINGS.auth.register.signIn),
        );
        expect(handleGoToLoginMock).not.toHaveBeenCalled();
    });

    it('should render the login footer', async () => {
        await render(<RegisterScreen />);
        expect(
            screen.getByText(APP_STRINGS.auth.register.hasAccount),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.auth.register.signIn),
        ).toBeTruthy();
    });
});
