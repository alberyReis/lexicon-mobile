import { database } from '@/infrastructure/database/database';
import { favoriteRepository } from '../favorite-repository-implementation';

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
    },
}));

const executeAsyncMock = jest.mocked(database.executeAsync);

describe('FavoriteRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return favorite words from the database', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [
                    { word: 'apple' },
                    { word: 'banana' },
                ],
            },
        } as never);
        const result = await favoriteRepository.getFavorites();
        expect(result).toEqual(['apple', 'banana']);
        expect(executeAsyncMock).toHaveBeenCalledWith(
            'SELECT word FROM favorites ORDER BY word',
        );
    });

    it('should add a word to favorites', async () => {
        executeAsyncMock.mockResolvedValue({} as never);
        await favoriteRepository.addFavorite('apple');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            'INSERT OR IGNORE INTO favorites (word) VALUES (?)',
            ['apple'],
        );
    });

    it('should remove a word from favorites', async () => {
        executeAsyncMock.mockResolvedValue({} as never);
        await favoriteRepository.removeFavorite('apple');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            'DELETE FROM favorites WHERE word = ?',
            ['apple'],
        );
    });

    it('should return true when the word is favorited', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [{ word: 'apple' }],
            },
        } as never);
        const result = await favoriteRepository.isFavorite('apple');
        expect(result).toBe(true);
    });

    it('should return false when the word is not favorited', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [],
            },
        } as never);
        const result = await favoriteRepository.isFavorite('apple');
        expect(result).toBe(false);
    });

    it('should propagate database errors', async () => {
        executeAsyncMock.mockRejectedValue(
            new Error('Database error'),
        );
        await expect(
            favoriteRepository.getFavorites(),
        ).rejects.toThrow('Database error');
    });
});
