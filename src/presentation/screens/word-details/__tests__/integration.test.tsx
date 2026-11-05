import type { ReactNode } from 'react';
import {
    renderHook,
    waitFor,
} from '@testing-library/react-native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import { database } from '@/infrastructure/database/database';
import { container } from '@/dependency-injection/container';
import { useWordDetailsBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
    },
}));

jest.mock(
    '@/infrastructure/repositories/word/word-repository-implementation',
    () => ({
        wordRepository: {
            getWordDetails: jest.fn(),
        },
    }),
);

const executeAsyncMock = jest.mocked(database.executeAsync);
const useNavigationMock = jest.mocked(useNavigation);
const useRouteMock = jest.mocked(useRoute);

describe('History Integration', () => {
    let queryClient: QueryClient;

    const history = new Map<string, number>();

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    const getOrderedHistory = () => {
        return [...history.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([word]) => word);
    };

    const renderWordDetailsBuilder = async () => {
        const hook = await renderHook(
            () => useWordDetailsBuilder(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(hook.result.current).not.toBeNull();
            expect(hook.result.current.isLoading).toBe(false);
        });

        return hook;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        history.clear();

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
            goBack: jest.fn(),
        } as never);

        useRouteMock.mockReturnValue({
            params: {
                word: 'apple',
            },
        } as never);

        jest.spyOn(
            container.getWordDetails,
            'execute',
        ).mockResolvedValue([]);

        executeAsyncMock.mockImplementation(
            async (query, params) => {
                const sql = query.trim();

                if (
                    sql.includes('SELECT word') &&
                    sql.includes('FROM history')
                ) {
                    return {
                        rows: {
                            _array: getOrderedHistory().map((word) => ({
                                word,
                            })),
                        },
                    } as unknown as Awaited<
                        ReturnType<typeof database.executeAsync>
                    >;
                }

                if (sql.includes('INSERT INTO history')) {
                    const word = params?.[0] as string;
                    const viewedAt = params?.[1] as number;

                    history.set(word, viewedAt);
                }

                if (sql.includes('DELETE FROM history')) {
                    history.clear();
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
        jest.restoreAllMocks();
    });

    it('should register a viewed word in history', async () => {
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.has('apple')).toBe(true);
        });
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO history'),
            ['apple', expect.any(Number)],
        );
    });

    it('should persist history through the repository', async () => {
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.has('apple')).toBe(true);
        });
        const words = await container.getHistory();
        expect(words).toEqual(['apple']);
    });

    it('should update the timestamp without duplicating a word', async () => {
        history.set('apple', 500);
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.get('apple')).toBeGreaterThan(500);
        });
        expect(history.size).toBe(1);
        expect(getOrderedHistory()).toEqual(['apple']);
    });

    it('should move a revisited word to the top of history', async () => {
        history.set('apple', 1000);
        history.set('banana', 2000);
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.get('apple')).toBeGreaterThan(2000);
        });
        const words = await container.getHistory();
        expect(words).toEqual(['apple', 'banana']);
    });

    it('should invalidate the history query after registering a word', async () => {
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ['history'],
            });
        });
    });

    it('should keep existing history when persistence fails', async () => {
        history.set('banana', 1000);
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => { });
        executeAsyncMock.mockRejectedValueOnce(
            new Error('Database error'),
        );
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[History] Failed to register word:',
                expect.any(Error),
            );
        });
        expect(getOrderedHistory()).toEqual(['banana']);
    });
});
