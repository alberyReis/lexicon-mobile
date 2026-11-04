import { createToggleFavoriteUseCase } from '../toggle-favorite-use-case';
import type { IFavoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository';

describe('ToggleFavoriteUseCase', () => {
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

    it('should add a word when it is not favorited', async () => {
        isFavoriteMock.mockResolvedValue(false);
        addFavoriteMock.mockResolvedValue(undefined);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        const result = await toggleFavorite('apple');
        expect(isFavoriteMock).toHaveBeenCalledWith('apple');
        expect(addFavoriteMock).toHaveBeenCalledWith('apple');
        expect(removeFavoriteMock).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should remove a word when it is already favorited', async () => {
        isFavoriteMock.mockResolvedValue(true);
        removeFavoriteMock.mockResolvedValue(undefined);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        const result = await toggleFavorite('banana');
        expect(isFavoriteMock).toHaveBeenCalledWith('banana');
        expect(removeFavoriteMock).toHaveBeenCalledWith('banana');
        expect(addFavoriteMock).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should propagate repository errors', async () => {
        isFavoriteMock.mockRejectedValue(
            new Error('Database error'),
        );
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        await expect(toggleFavorite('apple')).rejects.toThrow(
            'Database error',
        );
        expect(addFavoriteMock).not.toHaveBeenCalled();
        expect(removeFavoriteMock).not.toHaveBeenCalled();
    });
});
