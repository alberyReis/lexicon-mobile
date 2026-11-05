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
import { useFavoritesBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getFavorites: jest.fn(),
        toggleFavorite: jest.fn(),
    },
}));

const getFavoritesMock = jest.mocked(container.getFavorites);
const toggleFavoriteMock = jest.mocked(container.toggleFavorite);
const useNavigationMock = jest.mocked(useNavigation);

describe('useFavoritesBuilder', () => {
    let queryClient: QueryClient;
    let navigateMock: jest.Mock;

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

        navigateMock = jest.fn();

        useNavigationMock.mockReturnValue({
            navigate: navigateMock,
        } as never);

        getFavoritesMock.mockResolvedValue([
            'apple',
            'banana',
        ]);

        toggleFavoriteMock.mockResolvedValue(false);
    });

    afterEach(() => {
        queryClient.clear();
    });

    it('should load favorite words', async () => {
        const { result } = await renderFavoritesBuilder();
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when there are no favorites', async () => {
        getFavoritesMock.mockResolvedValue([]);
        const { result } = await renderFavoritesBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        expect(result.current.favorites).toEqual([]);
    });

    it('should expose an error when loading favorites fails', async () => {
        getFavoritesMock.mockRejectedValue(
            new Error('Database error'),
        );
        const { result } = await renderFavoritesBuilder();
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
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
            .mockResolvedValueOnce(['apple', 'banana'])
            .mockResolvedValueOnce(['banana']);
        const { result } = await renderFavoritesBuilder();
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
                new Promise<boolean>((resolve) => {
                    resolveMutation = resolve;
                }),
        );
        const { result } = await renderFavoritesBuilder();
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
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
});
