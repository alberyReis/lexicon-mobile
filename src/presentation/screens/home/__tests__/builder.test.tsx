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
import { useHomeBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getWords: jest.fn(),
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

const getWordsMock = jest.mocked(container.getWords);
const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);
const useNavigationMock = jest.mocked(useNavigation);

describe('useHomeBuilder', () => {
    let queryClient: QueryClient;

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

        useNavigationMock.mockReturnValue({
            navigate: jest.fn(),
        } as never);

        getWordsMock.mockResolvedValue(['apple', 'banana']);
        getFavoritesMock.mockResolvedValue([]);
        toggleFavoriteMock.mockResolvedValue(true);
    });

    afterEach(() => {
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
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
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

    it('should load favorite words', async () => {
        getFavoritesMock.mockResolvedValue(['apple']);
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
    });

    it('should toggle a favorite word', async () => {
        const { result } = await renderHomeBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(toggleFavoriteMock).toHaveBeenCalledWith(
                'apple',
                expect.any(Object),
            );
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
});
