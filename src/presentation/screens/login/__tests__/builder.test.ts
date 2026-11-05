import { act, renderHook } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useLoginBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        signIn: jest.fn(),
    },
}));

const useNavigationMock = jest.mocked(useNavigation);
const signInMock = jest.mocked(firebaseAuthRepository.signIn);

const navigateMock = jest.fn();

const credentials = {
    email: 'test@example.com',
    password: '123456',
};

const user = {
    uid: 'user-123',
    email: credentials.email,
};

describe('useLoginBuilder', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        useNavigationMock.mockReturnValue({
            navigate: navigateMock,
        } as never);
    });

    it('should initialize with default values', async () => {
        const { result } = await renderHook(() => useLoginBuilder());
        expect(result.current.email).toBe('');
        expect(result.current.password).toBe('');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should update email and password', async () => {
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
        });
        expect(result.current.email).toBe(credentials.email);
        expect(result.current.password).toBe(credentials.password);
    });

    it('should require email and password', async () => {
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            await result.current.handleLogin();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.login.requiredFields,
        );
        expect(signInMock).not.toHaveBeenCalled();
    });

    it('should reject an email containing only whitespace', async () => {
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail('   ');
            result.current.setPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleLogin();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.login.requiredFields,
        );
        expect(signInMock).not.toHaveBeenCalled();
    });

    it('should authenticate with normalized email', async () => {
        signInMock.mockResolvedValue(user);
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail(`  ${credentials.email}  `);
            result.current.setPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleLogin();
        });
        expect(signInMock).toHaveBeenCalledWith(credentials);
        expect(signInMock).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe('');
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle authentication errors', async () => {
        signInMock.mockRejectedValue(
            new Error('Invalid credentials'),
        );
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
        });
        await act(async () => {
            await result.current.handleLogin();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.login.invalidCredentials,
        );
        expect(result.current.isLoading).toBe(false);
    });

    it('should set loading while authenticating', async () => {
        let resolveSignIn!: (value: typeof user) => void;
        signInMock.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveSignIn = resolve;
                }),
        );
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
        });
        let loginPromise!: Promise<void>;
        await act(async () => {
            loginPromise = result.current.handleLogin();
        });
        expect(result.current.isLoading).toBe(true);
        expect(signInMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignIn(user);
            await loginPromise;
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should prevent multiple login attempts while loading', async () => {
        let resolveSignIn!: (value: typeof user) => void;
        signInMock.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveSignIn = resolve;
                }),
        );
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.setEmail(credentials.email);
            result.current.setPassword(credentials.password);
        });
        let loginPromise!: Promise<void>;
        await act(async () => {
            loginPromise = result.current.handleLogin();
        });
        expect(result.current.isLoading).toBe(true);
        await act(async () => {
            await result.current.handleLogin();
        });
        expect(signInMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignIn(user);
            await loginPromise;
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('should navigate to the register screen', async () => {
        const { result } = await renderHook(() => useLoginBuilder());
        await act(async () => {
            result.current.handleGoToRegister();
        });
        expect(navigateMock).toHaveBeenCalledWith('Register');
        expect(navigateMock).toHaveBeenCalledTimes(1);
    });
});