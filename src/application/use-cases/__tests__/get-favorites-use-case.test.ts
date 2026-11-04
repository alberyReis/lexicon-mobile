import { createGetFavoritesUseCase } from '../get-favorites-use-case';
import type { IFavoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository';

describe('GetFavoritesUseCase', () => {
    const getFavoritesMock = jest.fn();

    const repository: IFavoriteRepository = {
        getFavorites: getFavoritesMock,
        addFavorite: jest.fn(),
        removeFavorite: jest.fn(),
        isFavorite: jest.fn(),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return favorite words from the repository', async () => {
        const words = ['apple', 'banana', 'car'];
        getFavoritesMock.mockResolvedValue(words);
        const getFavorites = createGetFavoritesUseCase(repository);
        const result = await getFavorites();
        expect(result).toEqual(words);
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when there are no favorites', async () => {
        getFavoritesMock.mockResolvedValue([]);
        const getFavorites = createGetFavoritesUseCase(repository);
        const result = await getFavorites();
        expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
        getFavoritesMock.mockRejectedValue(
            new Error('Database error'),
        );
        const getFavorites = createGetFavoritesUseCase(repository);
        await expect(getFavorites()).rejects.toThrow(
            'Database error',
        );
    });
});
