
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

import { container } from '@/dependency-injection/container';

import { useHistoryBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getHistory: jest.fn(),
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

const getHistoryMock = jest.mocked(container.getHistory);
const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);
const useNavigationMock = jest.mocked(useNavigation);

describe('useHistoryBuilder', () => {
    let queryClient: QueryClient;
    let navigateMock: jest.Mock;

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
            expect(hook.result.current).not.toBeNull();
        });

        await waitFor(() => {
            expect(queryClient.getQueryState(['history'])?.fetchStatus)
                .toBe('idle');

            expect(queryClient.getQueryState(['favorites'])?.fetchStatus)
                .toBe('idle');
        });

        return hook;
    };

    beforeEach(() => {
        jest.clearAllMocks();

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

        navigateMock = jest.fn();

        useNavigationMock.mockReturnValue({
            navigate: navigateMock,
        } as never);

        getHistoryMock.mockResolvedValue([
            'apple',
            'banana',
        ]);

        getFavoritesMock.mockResolvedValue([
            'apple',
        ]);

        toggleFavoriteMock.mockResolvedValue(false);
    });

    afterEach(() => {
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
    });

    it('should return an empty list when history is empty', async () => {
        getHistoryMock.mockResolvedValue([]);
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        expect(result.current.history).toEqual([]);
    });

    it('should expose an error when loading history fails', async () => {
        getHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it('should load favorite words', async () => {
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
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
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        await act(async () => {
            result.current.toggleFavorite('banana');
        });
        await waitFor(() => {
            expect(toggleFavoriteMock).toHaveBeenCalledWith(
                'banana',
                expect.any(Object),
            );
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
    });

    it('should expose the updating state during a mutation', async () => {
        let resolveMutation!: (value: boolean) => void;
        toggleFavoriteMock.mockImplementation(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveMutation = resolve;
                }),
        );
        const { result } = await renderHistoryBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
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
                queryKey: ['history'],
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
});
