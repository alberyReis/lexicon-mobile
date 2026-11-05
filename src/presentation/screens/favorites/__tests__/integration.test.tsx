import type { ReactNode } from 'react';
import {
    act,
    renderHook,
    waitFor,
} from '@testing-library/react-native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/infrastructure/database/database';
import { useFavoritesBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
    },
}));

const executeAsyncMock = jest.mocked(database.executeAsync);
const useNavigationMock = jest.mocked(useNavigation);

describe('Favorites Integration', () => {
    let queryClient: QueryClient;

    const favorites = new Set<string>();

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        favorites.clear();

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

        useNavigationMock.mockReturnValue({
            navigate: jest.fn(),
        } as never);

        executeAsyncMock.mockImplementation(
            async (query, params) => {
                const word = params?.[0] as string | undefined;

                if (query.includes('SELECT word FROM favorites WHERE')) {
                    return {
                        rows: {
                            _array:
                                word && favorites.has(word)
                                    ? [{ word }]
                                    : [],
                        },
                    } as unknown as Awaited<
                        ReturnType<typeof database.executeAsync>
                    >;
                }

                if (query.includes('SELECT word FROM favorites ORDER BY')) {
                    return {
                        rows: {
                            _array: [...favorites]
                                .sort()
                                .map((item) => ({ word: item })),
                        },
                    } as unknown as Awaited<
                        ReturnType<typeof database.executeAsync>
                    >;
                }

                if (query.includes('INSERT OR IGNORE INTO favorites')) {
                    if (word) {
                        favorites.add(word);
                    }
                }

                if (query.includes('DELETE FROM favorites WHERE')) {
                    if (word) {
                        favorites.delete(word);
                    }
                }

                return {
                    rows: {
                        _array: [],
                    },
                } as unknown as Awaited<
                    ReturnType<typeof database.executeAsync>
                >;
            },
        );
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('should load favorites from the repository', async () => {
        favorites.add('apple');
        favorites.add('banana');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(executeAsyncMock).toHaveBeenCalledWith(
            'SELECT word FROM favorites ORDER BY word',
        );
    });

    it('should add a favorite and update the query cache', async () => {
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual(['apple']);
        });
        expect(favorites.has('apple')).toBe(true);
        expect(
            queryClient.getQueryData(['favorites']),
        ).toEqual(['apple']);
    });

    it('should remove a favorite and update the query cache', async () => {
        favorites.add('apple');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual(['apple']);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([]);
        });
        expect(favorites.has('apple')).toBe(false);
        expect(
            queryClient.getQueryData(['favorites']),
        ).toEqual([]);
    });

    it('should preserve other favorites when toggling a word', async () => {
        favorites.add('apple');
        favorites.add('banana');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual(['banana']);
        });
        expect(favorites.has('banana')).toBe(true);
    });

    it('should not update favorites when the mutation fails', async () => {
        favorites.add('apple');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual(['apple']);
        });
        executeAsyncMock.mockRejectedValueOnce(
            new Error('Database error'),
        );
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.isUpdating).toBe(false);
        });
        expect(result.current.favorites).toEqual(['apple']);
        expect(favorites.has('apple')).toBe(true);
        expect(
            queryClient.getQueryData(['favorites']),
        ).toEqual(['apple']);
    });
});
