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
import { useHomeBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getWords: jest.fn(),
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        getCurrentUser: jest.fn(),
        onAuthStateChanged: jest.fn(),
        signOut: jest.fn(),
    },
}));

const getWordsMock = jest.mocked(container.getWords);
const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);

const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);

const useNavigationMock = jest.mocked(useNavigation);

describe('useHomeBuilder', () => {
    let queryClient: QueryClient;

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

    const renderHomeBuilder = async () => {
        const hook = await renderHook(
            () => useHomeBuilder(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(hook.result.current).not.toBeNull();
        });

        await waitFor(() => {
            expect(
                queryClient.getQueryState(
                    QUERY_KEYS.words(''),
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

        useNavigationMock.mockReturnValue({
            navigate: jest.fn(),
        } as never);

        getCurrentUserMock.mockReturnValue(
            authenticatedUser,
        );

        getWordsMock.mockResolvedValue([
            'apple',
            'banana',
        ]);

        getFavoritesMock.mockResolvedValue([]);

        toggleFavoriteMock.mockResolvedValue(true);
    });

    afterEach(async () => {
        await cleanup();
        await queryClient.cancelQueries();
        queryClient.clear();
    });

    it('should load the first page of words', async () => {
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.words).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(getWordsMock).toHaveBeenCalledWith(
            null,
            20,
            '',
        );
    });

    it('should expose the initial search value', async () => {
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        expect(result.current.search).toBe('');
    });

    it('should search words using the provided term', async () => {
        const { result } = await renderHomeBuilder();
        await act(async () => {
            result.current.setSearch('ban');
        });
        await waitFor(() => {
            expect(getWordsMock).toHaveBeenCalledWith(
                null,
                20,
                'ban',
            );
        });
        await waitFor(() => {
            expect(
                queryClient.getQueryState(
                    QUERY_KEYS.words('ban'),
                )?.fetchStatus,
            ).toBe('idle');
        });
        await waitFor(() => {
            expect(result.current.words).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(result.current.search).toBe('ban');
    });

    it('should load the next page when available', async () => {
        const firstPage = Array.from(
            { length: 20 },
            (_, index) => `word${index}`,
        );
        getWordsMock
            .mockResolvedValueOnce(firstPage)
            .mockResolvedValueOnce(['word20']);
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(true);
        });
        await act(async () => {
            result.current.loadMoreWords();
        });
        await waitFor(() => {
            expect(result.current.words).toHaveLength(21);
        });
        expect(getWordsMock).toHaveBeenCalledWith(
            'word19',
            20,
            '',
        );
    });

    it('should not load more words when there is no next page', async () => {
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.hasNextPage).toBe(false);
        });
        await act(async () => {
            result.current.loadMoreWords();
        });
        expect(getWordsMock).toHaveBeenCalledTimes(1);
    });

    it('should load favorite words for the authenticated user', async () => {
        getFavoritesMock.mockResolvedValue(['apple']);
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: QUERY_KEYS.favorites(userId),
            }),
        );
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
    });

    it('should toggle a favorite word', async () => {
        const { result } = await renderHomeBuilder();
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
            expect(queryClient.isMutating()).toBe(0);
        });
    });

    it('should invalidate favorites after toggling a word', async () => {
        getFavoritesMock
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['apple']);
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(getFavoritesMock).toHaveBeenCalledTimes(1);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(2);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
    });

    it('should expose the navigation object', async () => {
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        expect(result.current.navigation).toBeDefined();
        expect(result.current.navigation.navigate).toBeDefined();
    });

    it('should expose an error when loading words fails', async () => {
        getWordsMock.mockRejectedValue(
            new Error('Database error'),
        );
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it('should not fetch favorites without an authenticated user', async () => {
        getCurrentUserMock.mockReturnValue(null);
        const { result } = await renderHook(
            () => useHomeBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        expect(getFavoritesMock).not.toHaveBeenCalled();
        expect(result.current.favorites).toEqual([]);
    });

    it('should keep favorites cached under the authenticated user ID', async () => {
        getFavoritesMock.mockResolvedValue(['apple']);
        await renderHomeBuilder();
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites('another-user'),
            ),
        ).toBeUndefined();
    });

    it('should not toggle favorites without an authenticated user', async () => {
        getCurrentUserMock.mockReturnValue(null);
        const { result } = await renderHook(
            () => useHomeBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        expect(toggleFavoriteMock).not.toHaveBeenCalled();
        expect(getFavoritesMock).not.toHaveBeenCalled();
        expect(result.current.favorites).toEqual([]);
    });

    it('should not invalidate favorites when a mutation succeeds without a user ID', async () => {
        let resolveMutation!: (value: boolean) => void;
        toggleFavoriteMock.mockImplementation(
            () =>
                new Promise<boolean>(resolve => {
                    resolveMutation = resolve;
                }),
        );
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        const { result, rerender } = await renderHomeBuilder();
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(queryClient.isMutating()).toBe(1);
        });
        getCurrentUserMock.mockReturnValue(null);
        await act(async () => {
            rerender({});
        });
        await act(async () => {
            resolveMutation(true);
        });
        await waitFor(() => {
            expect(queryClient.isMutating()).toBe(0);
        });
        expect(toggleFavoriteMock).toHaveBeenCalledTimes(1);
        expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    });
});
