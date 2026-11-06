import type { ReactNode } from 'react';
import {
    act,
    cleanup,
    renderHook,
    waitFor,
} from '@testing-library/react-native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { container } from '@/dependency-injection/container';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useFavoritesBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        getCurrentUser: jest.fn(),
    },
}));

const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);
const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);
const useNavigationMock = jest.mocked(useNavigation);

describe('useFavoritesBuilder', () => {
    let queryClient: QueryClient;
    let navigateMock: jest.Mock;

    const userId = 'user-123';

    const authenticatedUser = {
        uid: userId,
        email: 'test@example.com',
    };

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    const renderFavoritesBuilder = async () => {
        const hook = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(hook.result.current.isPending).toBe(false);
        });

        return hook;
    };

    beforeEach(() => {
        jest.resetAllMocks();

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: Infinity,
                },
                mutations: {
                    retry: false,
                },
            },
        });

        navigateMock = jest.fn();

        useNavigationMock.mockReturnValue({
            navigate: navigateMock,
        } as never);

        getCurrentUserMock.mockReturnValue(
            authenticatedUser,
        );

        getFavoritesMock.mockResolvedValue([
            'apple',
            'banana',
        ]);

        toggleFavoriteMock.mockResolvedValue(false);
    });

    afterEach(async () => {
        await cleanup();
        await queryClient.cancelQueries();
        queryClient.clear();
    });

    it('should load favorite words', async () => {
        const { result } = await renderFavoritesBuilder();
        expect(result.current.favorites).toEqual([
            'apple',
            'banana',
        ]);
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple', 'banana']);
    });

    it('should return an empty list when there are no favorites', async () => {
        getFavoritesMock.mockResolvedValue([]);
        const { result } = await renderFavoritesBuilder();
        expect(result.current.favorites).toEqual([]);
        expect(result.current.isPending).toBe(false);
    });

    it('should expose an error when loading favorites fails', async () => {
        getFavoritesMock.mockRejectedValue(
            new Error('Database error'),
        );
        const { result } = await renderFavoritesBuilder();
        expect(result.current.isError).toBe(true);
        expect(result.current.isPending).toBe(false);
    });

    it('should navigate to word details', async () => {
        const { result } = await renderFavoritesBuilder();
        await act(async () => {
            result.current.openWordDetails('apple');
        });
        expect(navigateMock).toHaveBeenCalledWith(
            'WordDetails',
            { word: 'apple' },
        );
    });

    it('should toggle a favorite word', async () => {
        const { result } = await renderFavoritesBuilder();
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(toggleFavoriteMock).toHaveBeenCalledWith(
                'apple',
                expect.objectContaining({
                    client: expect.any(Object),
                }),
            );
        });
        await waitFor(() => {
            expect(result.current.isUpdating).toBe(false);
        });
    });

    it('should invalidate favorites after toggling a word', async () => {
        getFavoritesMock
            .mockResolvedValueOnce(['apple', 'banana'])
            .mockResolvedValueOnce(['banana']);
        const { result } = await renderFavoritesBuilder();
        expect(result.current.favorites).toEqual([
            'apple',
            'banana',
        ]);
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'banana',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(2);
    });

    it('should expose the updating state during a mutation', async () => {
        let resolveMutation!: (value: boolean) => void;
        toggleFavoriteMock.mockImplementation(
            () =>
                new Promise<boolean>(resolve => {
                    resolveMutation = resolve;
                }),
        );
        const { result } = await renderFavoritesBuilder();
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.isUpdating).toBe(true);
        });
        await act(async () => {
            resolveMutation(false);
        });
        await waitFor(() => {
            expect(result.current.isUpdating).toBe(false);
        });
    });

    it('should not fetch favorites without an authenticated user', async () => {
        getCurrentUserMock.mockReturnValue(null);
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([]);
        });
        expect(getFavoritesMock).not.toHaveBeenCalled();
    });

    it('should isolate favorites by authenticated user ID', async () => {
        const { result } = await renderFavoritesBuilder();
        expect(result.current.favorites).toEqual([
            'apple',
            'banana',
        ]);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple', 'banana']);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites('another-user'),
            ),
        ).toBeUndefined();
    });
});
