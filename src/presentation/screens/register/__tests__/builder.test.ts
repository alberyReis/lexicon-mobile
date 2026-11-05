import { act, renderHook } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useRegisterBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        signUp: jest.fn(),
    },
}));

const useNavigationMock = jest.mocked(useNavigation);
const signUpMock = jest.mocked(firebaseAuthRepository.signUp);

const navigateMock = jest.fn();

const credentials = {
    email: 'test@example.com',
    password: '123456',
};

const user = {
    uid: 'user-123',
    email: credentials.email,
};

describe('useRegisterBuilder', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        useNavigationMock.mockReturnValue({
            navigate: navigateMock,
        } as never);
    });

    it('should initialize with default values', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        expect(result.current.email).toBe('');
        expect(result.current.password).toBe('');
        expect(result.current.confirmPassword).toBe('');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update email, password and confirmation', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        expect(result.current.email).toBe(credentials.email);
        expect(result.current.password).toBe(credentials.password);
        expect(result.current.confirmPassword).toBe(credentials.password);
    });

    it('should require all fields', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.requiredFields,
        );
        expect(signUpMock).not.toHaveBeenCalled();
    });

    it('should reject an email containing only whitespace', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail('   ');
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.requiredFields,
        );
        expect(signUpMock).not.toHaveBeenCalled();
    });

    it('should reject an invalid email', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail('invalid-email');
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.invalidEmail,
        );
        expect(signUpMock).not.toHaveBeenCalled();
    });

    it('should reject a password shorter than six characters', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword('12345');
            result.current.setConfirmPassword('12345');
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.shortPassword,
        );
        expect(signUpMock).not.toHaveBeenCalled();
    });

    it('should reject mismatched passwords', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword('654321');
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.passwordMismatch,
        );
        expect(signUpMock).not.toHaveBeenCalled();
    });

    it('should register with normalized email', async () => {
        signUpMock.mockResolvedValue(user);
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(`  ${credentials.email}  `);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(signUpMock).toHaveBeenCalledWith(credentials);
        expect(signUpMock).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe('');
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle an email already in use', async () => {
        signUpMock.mockRejectedValue({
            code: 'auth/email-already-in-use',
        });
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.emailAlreadyInUse,
        );
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle unexpected registration errors', async () => {
        signUpMock.mockRejectedValue(
            new Error('Registration failed'),
        );
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.register.registerError,
        );
        expect(result.current.isLoading).toBe(false);
    });

    it('should set loading while registering', async () => {
        let resolveSignUp!: (value: typeof user) => void;
        signUpMock.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveSignUp = resolve;
                }),
        );
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        let registerPromise!: Promise<void>;
        await act(async () => {
            registerPromise = result.current.handleRegister();
        });
        expect(result.current.isLoading).toBe(true);
        expect(signUpMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignUp(user);
            await registerPromise;
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should prevent multiple registrations while loading', async () => {
        let resolveSignUp!: (value: typeof user) => void;
        signUpMock.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveSignUp = resolve;
                }),
        );
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
            result.current.setConfirmPassword(credentials.password);
        });
        let registerPromise!: Promise<void>;
        await act(async () => {
            registerPromise = result.current.handleRegister();
        });
        expect(result.current.isLoading).toBe(true);
        await act(async () => {
            await result.current.handleRegister();
        });
        expect(signUpMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignUp(user);
            await registerPromise;
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('should navigate to the login screen', async () => {
        const { result } = await renderHook(() => useRegisterBuilder());
        await act(async () => {
            result.current.handleGoToLogin();
        });
        expect(navigateMock).toHaveBeenCalledWith('Login');
        expect(navigateMock).toHaveBeenCalledTimes(1);
    });
});