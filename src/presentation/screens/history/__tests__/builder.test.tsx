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
import { useHistoryBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getHistory: jest.fn(),
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        getCurrentUser: jest.fn(),
    },
}));

const getHistoryMock = jest.mocked(container.getHistory);
const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);
const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);
const useNavigationMock = jest.mocked(useNavigation);

describe('useHistoryBuilder', () => {
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

    const renderHistoryBuilder = async () => {
        const hook = await renderHook(
            () => useHistoryBuilder(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(hook.result.current.isPending).toBe(false);
        });

        await waitFor(() => {
            expect(
                queryClient.getQueryState(
                    QUERY_KEYS.history(userId),
                )?.fetchStatus,
            ).toBe('idle');

            expect(
                queryClient.getQueryState(
                    QUERY_KEYS.favorites(userId),
                )?.fetchStatus,
            ).toBe('idle');
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

        getHistoryMock.mockResolvedValue([
            'apple',
            'banana',
        ]);

        getFavoritesMock.mockResolvedValue([
            'apple',
        ]);

        toggleFavoriteMock.mockResolvedValue(false);
    });

    afterEach(async () => {
        await cleanup();
        await queryClient.cancelQueries();
        queryClient.clear();
    });

    it('should load viewed words', async () => {
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.history).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(getHistoryMock).toHaveBeenCalledTimes(1);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.history(userId),
            ),
        ).toEqual(['apple', 'banana']);
    });

    it('should return an empty list when history is empty', async () => {
        getHistoryMock.mockResolvedValue([]);
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.history).toEqual([]);
        });
        expect(result.current.isPending).toBe(false);
    });

    it('should expose an error when loading history fails', async () => {
        getHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
        expect(result.current.isPending).toBe(false);
    });

    it('should load favorite words', async () => {
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
    });

    it('should navigate to word details', async () => {
        const { result } = await renderHistoryBuilder();
        await act(async () => {
            result.current.openWordDetails('banana');
        });
        expect(navigateMock).toHaveBeenCalledWith(
            'WordDetails',
            { word: 'banana' },
        );
    });

    it('should toggle a favorite word', async () => {
        const { result } = await renderHistoryBuilder();
        await act(async () => {
            result.current.toggleFavorite('banana');
        });
        await waitFor(() => {
            expect(toggleFavoriteMock).toHaveBeenCalledWith(
                'banana',
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
            .mockResolvedValueOnce(['apple'])
            .mockResolvedValueOnce(['apple', 'banana']);

        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        await act(async () => {
            result.current.toggleFavorite('banana');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(2);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple', 'banana']);
    });

    it('should expose the updating state during a mutation', async () => {
        let resolveMutation!: (value: boolean) => void;
        toggleFavoriteMock.mockImplementation(
            () =>
                new Promise<boolean>(resolve => {
                    resolveMutation = resolve;
                }),
        );
        const { result } = await renderHistoryBuilder();
        await act(async () => {
            result.current.toggleFavorite('banana');
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

    it('should refresh history when the query is invalidated', async () => {
        getHistoryMock
            .mockResolvedValueOnce(['apple'])
            .mockResolvedValueOnce(['apple', 'banana']);
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.history).toEqual([
                'apple',
            ]);
        });
        await act(async () => {
            await queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.history(userId),
            });
        });
        await waitFor(() => {
            expect(result.current.history).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(getHistoryMock).toHaveBeenCalledTimes(2);
    });

    it('should not fetch user data without authentication', async () => {
        getCurrentUserMock.mockReturnValue(null);
        const { result } = await renderHook(
            () => useHistoryBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.history).toEqual([]);
            expect(result.current.favorites).toEqual([]);
        });
        expect(getHistoryMock).not.toHaveBeenCalled();
        expect(getFavoritesMock).not.toHaveBeenCalled();
    });

    it('should isolate history and favorites by user ID', async () => {
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.history).toEqual([
                'apple',
                'banana',
            ]);

            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.history(userId),
            ),
        ).toEqual(['apple', 'banana']);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.history('another-user'),
            ),
        ).toBeUndefined();
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites('another-user'),
            ),
        ).toBeUndefined();
    });
});
