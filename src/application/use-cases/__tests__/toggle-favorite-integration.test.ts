
import { database } from '@/infrastructure/database/database';
import { favoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository-implementation';
import { createToggleFavoriteUseCase } from '../toggle-favorite-use-case';

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
    },
}));

const mockedExecuteAsync = jest.mocked(database.executeAsync);

describe('ToggleFavorite Integration', () => {
    const favorites = new Set<string>();

    const toggleFavorite = createToggleFavoriteUseCase(
        favoriteRepository,
    );

    beforeEach(() => {
        favorites.clear();
        jest.clearAllMocks();

        mockedExecuteAsync.mockImplementation(
            async (query, params) => {
                const word = params?.[0] as string | undefined;

                if (query.includes('SELECT word FROM favorites WHERE')) {
                    const rows =
                        word && favorites.has(word)
                            ? [{ word }]
                            : [];

                    return {
                        rows: {
                            _array: rows,
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

    it('should add a word to favorites', async () => {
        const result = await toggleFavorite('apple');
        expect(result).toBe(true);
        expect(favorites.has('apple')).toBe(true);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['apple']);
    });

    it('should remove an existing favorite', async () => {
        favorites.add('apple');
        const result = await toggleFavorite('apple');
        expect(result).toBe(false);
        expect(favorites.has('apple')).toBe(false);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual([]);
    });

    it('should add and remove the same word', async () => {
        const firstResult = await toggleFavorite('banana');
        expect(firstResult).toBe(true);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['banana']);
        const secondResult = await toggleFavorite('banana');
        expect(secondResult).toBe(false);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual([]);
    });

    it('should preserve other favorites when removing a word', async () => {
        favorites.add('apple');
        favorites.add('banana');
        await toggleFavorite('apple');
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['banana']);
    });

    it('should return favorites in alphabetical order', async () => {
        await toggleFavorite('orange');
        await toggleFavorite('apple');
        await toggleFavorite('banana');
        const result = await favoriteRepository.getFavorites();
        expect(result).toEqual([
            'apple',
            'banana',
            'orange',
        ]);
    });

    it('should execute an insert query when adding a favorite', async () => {
        await toggleFavorite('apple');
        expect(mockedExecuteAsync).toHaveBeenCalledWith(
            'INSERT OR IGNORE INTO favorites (word) VALUES (?)',
            ['apple'],
        );
    });

    it('should execute a delete query when removing a favorite', async () => {
        favorites.add('apple');
        await toggleFavorite('apple');
        expect(mockedExecuteAsync).toHaveBeenCalledWith(
            'DELETE FROM favorites WHERE word = ?',
            ['apple'],
        );
    });
});
