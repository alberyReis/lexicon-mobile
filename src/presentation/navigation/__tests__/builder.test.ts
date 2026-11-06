import { createElement, type ReactNode } from 'react';
import {
    act,
    cleanup,
    renderHook,
} from '@testing-library/react-native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';

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
    let queryClient: QueryClient;
    let authStateCallback: (user: IAuthUser | null) => void;

    const authenticatedUser: IAuthUser = {
        uid: 'user-123',
        email: 'test@example.com',
    };

    const anotherUser: IAuthUser = {
        uid: 'user-456',
        email: 'another@example.com',
    };

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                children,
            );
    };

    const renderNavigationBuilder = async () => {
        return await renderHook(
            () => useAppNavigationBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
    };

    beforeEach(() => {
        jest.resetAllMocks();

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
                mutations: {
                    retry: false,
                },
            },
        });

        onAuthStateChangedMock.mockImplementation(callback => {
            authStateCallback = callback;

            return unsubscribeMock;
        });
    });

    afterEach(async () => {
        await cleanup();
        queryClient.clear();
    });

    it('should initialize with loading state', async () => {
        const { result } = await renderNavigationBuilder();
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(true);
    });

    it('should subscribe to authentication changes', async () => {
        await renderNavigationBuilder();
        expect(onAuthStateChangedMock).toHaveBeenCalledTimes(1);
        expect(onAuthStateChangedMock).toHaveBeenCalledWith(
            expect.any(Function),
        );
    });

    it('should update the user after authentication', async () => {
        const { result } = await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(result.current.user).toEqual(authenticatedUser);
        expect(result.current.isLoading).toBe(false);
    });

    it('should finish loading when there is no authenticated user', async () => {
        const { result } = await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(null);
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it('should update the user when authentication changes', async () => {
        const { result } = await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(result.current.user).toEqual(authenticatedUser);
        await act(async () => {
            authStateCallback(anotherUser);
        });
        expect(result.current.user).toEqual(anotherUser);
        expect(result.current.isLoading).toBe(false);
    });

    it('should clear the user after logout', async () => {
        const { result } = await renderNavigationBuilder();
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
        const { unmount } = await renderNavigationBuilder();
        await act(async () => {
            await unmount();
        });
        expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });

    it('should clear cached data after authentication', async () => {
        queryClient.setQueryData(
            ['favorites', 'previous-user'],
            ['apple'],
        );
        expect(
            queryClient.getQueryData(['favorites', 'previous-user']),
        ).toEqual(['apple']);
        await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        expect(
            queryClient.getQueryData(['favorites', 'previous-user']),
        ).toBeUndefined();
    });

    it('should clear cached data after logout', async () => {
        const { result } = await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        queryClient.setQueryData(
            ['favorites', authenticatedUser.uid],
            ['apple'],
        );
        queryClient.setQueryData(
            ['history', authenticatedUser.uid],
            ['banana'],
        );
        await act(async () => {
            authStateCallback(null);
        });
        expect(
            queryClient.getQueryData([
                'favorites',
                authenticatedUser.uid,
            ]),
        ).toBeUndefined();
        expect(
            queryClient.getQueryData([
                'history',
                authenticatedUser.uid,
            ]),
        ).toBeUndefined();
        expect(result.current.user).toBeNull();
    });

    it('should isolate cached data when switching users', async () => {
        const { result } = await renderNavigationBuilder();
        await act(async () => {
            authStateCallback(authenticatedUser);
        });
        queryClient.setQueryData(
            ['favorites', authenticatedUser.uid],
            ['apple'],
        );
        await act(async () => {
            authStateCallback(anotherUser);
        });
        expect(
            queryClient.getQueryData([
                'favorites',
                authenticatedUser.uid,
            ]),
        ).toBeUndefined();
        expect(result.current.user).toEqual(anotherUser);
    });
});
