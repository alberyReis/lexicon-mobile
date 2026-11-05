import { act, renderHook } from '@testing-library/react-native';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import type { IAuthUser } from '@/types/auth/auth-type';
import { useAppNavigationBuilder } from '../builder';

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        onAuthStateChanged: jest.fn(),
    },
}));

const onAuthStateChangedMock = jest.mocked(
    firebaseAuthRepository.onAuthStateChanged,
);

const unsubscribeMock = jest.fn();

describe('useAppNavigationBuilder', () => {
    let authStateCallback: (user: IAuthUser | null) => void;

    const authenticatedUser: IAuthUser = {
        uid: 'user-123',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.resetAllMocks();

        onAuthStateChangedMock.mockImplementation(callback => {
            authStateCallback = callback;

            return unsubscribeMock;
        });
    });

    it('should initialize with loading state', async () => {
        const { result } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(true);
    });

    it('should subscribe to authentication changes', async () => {
        await renderHook(() => useAppNavigationBuilder());
        expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1);
        expect(onAuthStateChangedMock).toHaveBeenCalledWith(
            expect.any(Function),
        );
    });

    it('should update the user after authentication', async () => {
        const { result } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(result.current.user).toEqual(authenticatedUser);
        expect(result.current.isLoading).toBe(false);
    });

    it('should finish loading when there is no authenticated user', async () => {
        const { result } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        await act(async () => {
            authStateCallback(null);
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('should update the user when authentication changes', async () => {
        const { result } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(result.current.user).toEqual(authenticatedUser);
        const anotherUser: IAuthUser = {
            uid: 'user-456',
            email: 'another@example.com',
        };
        await act(async () => {
            authStateCallback(anotherUser);
        });
        expect(result.current.user).toEqual(anotherUser);
        expect(result.current.isLoading).toBe(false);
    });

    it('should clear the user after logout', async () => {
        const { result } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(result.current.user).toEqual(authenticatedUser);
        await act(async () => {
            authStateCallback(null);
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('should unsubscribe when the hook is unmounted', async () => {
        const { unmount } = await renderHook(
            () => useAppNavigationBuilder(),
        );
        await act(async () => {
            await unmount();
        });
        expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });
});