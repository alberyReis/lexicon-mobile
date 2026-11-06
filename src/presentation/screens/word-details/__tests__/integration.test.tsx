import type { ReactNode } from 'react';
import {
    cleanup,
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
import { container } from '@/dependency-injection/container';
import { historyRepository } from '@/infrastructure/repositories/history/history-repository-implementation';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

import { useWordDetailsBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock(
    '@/infrastructure/repositories/word/word-repository-implementation',
    () => ({
        wordRepository: {
            getWordDetails: jest.fn(),
        },
    }),
);

jest.mock(
    '@/infrastructure/repositories/word-list/word-list-repository-implementation',
    () => ({
        wordListRepository: {
            getWords: jest.fn(),
        },
    }),
);

jest.mock(
    '@/infrastructure/repositories/favorite/favorite-repository-implementation',
    () => ({
        favoriteRepository: {
            getFavorites: jest.fn(),
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
            isFavorite: jest.fn(),
        },
    }),
);

jest.mock(
    '@/infrastructure/repositories/history/history-repository-implementation',
    () => ({
        historyRepository: {
            getHistory: jest.fn(),
            addToHistory: jest.fn(),
            clearHistory: jest.fn(),
        },
    }),
);

jest.mock(
    '@/infrastructure/repositories/firebase-auth-repository',
    () => ({
        firebaseAuthRepository: {
            getCurrentUser: jest.fn(),
        },
    }),
);

const useNavigationMock = jest.mocked(useNavigation);
const useRouteMock = jest.mocked(useRoute);

const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);

const getHistoryMock = jest.mocked(
    historyRepository.getHistory,
);

const addToHistoryMock = jest.mocked(
    historyRepository.addToHistory,
);

const mockUid = 'user-123';

describe('History Integration', () => {
    let queryClient: QueryClient;
    let timestamp: number;

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
        timestamp = 3000;

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

        getCurrentUserMock.mockReturnValue({
            uid: mockUid,
            email: 'test@example.com',
        });

        jest.spyOn(
            container.getWordDetails,
            'execute',
        ).mockResolvedValue([]);

        getHistoryMock.mockImplementation(async () => {
            return getOrderedHistory();
        });

        addToHistoryMock.mockImplementation(async word => {
            timestamp += 1000;
            history.set(word, timestamp);
        });
    });

    afterEach(async () => {
        await cleanup();
        queryClient.clear();
        jest.restoreAllMocks();
    });

    it('should register a viewed word in history', async () => {
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.has('apple')).toBe(true);
        });
        expect(addToHistoryMock).toHaveBeenCalledWith('apple');
    });

    it('should persist history through the repository', async () => {
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(history.has('apple')).toBe(true);
        });
        const words = await container.getHistory();
        expect(words).toEqual(['apple']);
        expect(getHistoryMock).toHaveBeenCalled();
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

    it('should invalidate the user history query after registering a word', async () => {
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: QUERY_KEYS.history(mockUid),
            });
        });
    });

    it('should keep existing history when persistence fails', async () => {
        history.set('banana', 1000);
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => { });
        addToHistoryMock.mockRejectedValueOnce(
            new Error('Firestore error'),
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
