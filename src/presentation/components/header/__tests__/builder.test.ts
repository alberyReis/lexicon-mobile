import { act, renderHook } from '@testing-library/react-native';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useHeaderBuilder } from '../builder';

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        signOut: jest.fn(),
    },
}));

const signOutMock = jest.mocked(firebaseAuthRepository.signOut);

describe('useHeaderBuilder', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should initialize with default values', async () => {
        const { result } = await renderHook(() => useHeaderBuilder());
        expect(result.current.isLoggingOut).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should sign out successfully', async () => {
        signOutMock.mockResolvedValue(undefined);
        const { result } = await renderHook(() => useHeaderBuilder());
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(signOutMock).toHaveBeenCalledTimes(1);
        expect(result.current.isLoggingOut).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should handle sign out errors', async () => {
        signOutMock.mockRejectedValue(new Error('Sign out failed'));
        const { result } = await renderHook(() => useHeaderBuilder());
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(signOutMock).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe(
            APP_STRINGS.auth.logout.error,
        );
        expect(result.current.isLoggingOut).toBe(false);
    });

    it('should set loading while signing out', async () => {
        let resolveSignOut!: () => void;
        signOutMock.mockImplementation(
            () =>
                new Promise<void>(resolve => {
                    resolveSignOut = resolve;
                }),
        );
        const { result } = await renderHook(() => useHeaderBuilder());
        let logoutPromise!: Promise<void>;
        await act(async () => {
            logoutPromise = result.current.handleLogout();
        });
        expect(result.current.isLoggingOut).toBe(true);
        expect(signOutMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignOut();
            await logoutPromise;
        });
        expect(result.current.isLoggingOut).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should prevent multiple sign out requests while loading', async () => {
        let resolveSignOut!: () => void;
        signOutMock.mockImplementation(
            () =>
                new Promise<void>(resolve => {
                    resolveSignOut = resolve;
                }),
        );
        const { result } = await renderHook(() => useHeaderBuilder());
        let logoutPromise!: Promise<void>;
        await act(async () => {
            logoutPromise = result.current.handleLogout();
        });
        expect(result.current.isLoggingOut).toBe(true);
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(signOutMock).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveSignOut();
            await logoutPromise;
        });
        expect(result.current.isLoggingOut).toBe(false);
    });

    it('should clear previous errors when retrying sign out', async () => {
        signOutMock
            .mockRejectedValueOnce(new Error('First attempt failed'))
            .mockResolvedValueOnce(undefined);
        const { result } = await renderHook(() => useHeaderBuilder());
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.logout.error,
        );
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(signOutMock).toHaveBeenCalledTimes(2);
        expect(result.current.error).toBe('');
        expect(result.current.isLoggingOut).toBe(false);
    });

    it('should clear previous errors before the retry finishes', async () => {
        let resolveSignOut!: () => void;
        signOutMock
            .mockRejectedValueOnce(new Error('First attempt failed'))
            .mockImplementationOnce(
                () =>
                    new Promise<void>(resolve => {
                        resolveSignOut = resolve;
                    }),
            );
        const { result } = await renderHook(() => useHeaderBuilder());
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(result.current.error).toBe(
            APP_STRINGS.auth.logout.error,
        );
        let logoutPromise!: Promise<void>;
        await act(async () => {
            logoutPromise = result.current.handleLogout();
        });
        expect(result.current.error).toBe('');
        expect(result.current.isLoggingOut).toBe(true);
        await act(async () => {
            resolveSignOut();
            await logoutPromise;
        });
        expect(result.current.isLoggingOut).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('should allow another sign out after a failed attempt', async () => {
        signOutMock
            .mockRejectedValueOnce(new Error('Sign out failed'))
            .mockResolvedValueOnce(undefined);
        const { result } = await renderHook(() => useHeaderBuilder());
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(result.current.isLoggingOut).toBe(false);
        await act(async () => {
            await result.current.handleLogout();
        });
        expect(signOutMock).toHaveBeenCalledTimes(2);
        expect(result.current.isLoggingOut).toBe(false);
        expect(result.current.error).toBe('');
    });
});