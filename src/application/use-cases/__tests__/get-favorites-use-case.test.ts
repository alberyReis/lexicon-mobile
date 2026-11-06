import { createGetFavoritesUseCase } from '../get-favorites-use-case';
import type { IFavoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository';

describe('GetFavoritesUseCase', () => {
    const getFavoritesMock = jest.fn();
    const addFavoriteMock = jest.fn();
    const removeFavoriteMock = jest.fn();
    const isFavoriteMock = jest.fn();

    const repository: IFavoriteRepository = {
        getFavorites: getFavoritesMock,
        addFavorite: addFavoriteMock,
        removeFavorite: removeFavoriteMock,
        isFavorite: isFavoriteMock,
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
        expect(getFavoritesMock).toHaveBeenCalledWith();
    });

    it('should return an empty array when there are no favorites', async () => {
        getFavoritesMock.mockResolvedValue([]);
        const getFavorites = createGetFavoritesUseCase(repository);
        const result = await getFavorites();
        expect(result).toEqual([]);
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
        getFavoritesMock.mockRejectedValue(
            new Error('Firestore error'),
        );
        const getFavorites = createGetFavoritesUseCase(repository);
        await expect(
            getFavorites(),
        ).rejects.toThrow('Firestore error');
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
    });

    it('should not modify favorites when fetching words', async () => {
        getFavoritesMock.mockResolvedValue(['apple']);
        const getFavorites = createGetFavoritesUseCase(repository);
        await getFavorites();
        expect(getFavoritesMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).not.toHaveBeenCalled();
        expect(removeFavoriteMock).not.toHaveBeenCalled();
        expect(isFavoriteMock).not.toHaveBeenCalled();
    });

    it('should fetch favorites on every execution', async () => {
        getFavoritesMock
            .mockResolvedValueOnce(['apple'])
            .mockResolvedValueOnce(['apple', 'banana']);
        const getFavorites = createGetFavoritesUseCase(repository);
        const firstResult = await getFavorites();
        const secondResult = await getFavorites();
        expect(firstResult).toEqual(['apple']);
        expect(secondResult).toEqual(['apple', 'banana']);
        expect(getFavoritesMock).toHaveBeenCalledTimes(2);
    });
});
