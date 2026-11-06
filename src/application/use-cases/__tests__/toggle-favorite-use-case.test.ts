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

        addFavoriteMock.mockResolvedValue(undefined);
        removeFavoriteMock.mockResolvedValue(undefined);
    });

    it('should add a word when it is not favorited', async () => {
        isFavoriteMock.mockResolvedValue(false);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        const result = await toggleFavorite('apple');
        expect(isFavoriteMock).toHaveBeenCalledWith('apple');
        expect(isFavoriteMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).toHaveBeenCalledWith('apple');
        expect(addFavoriteMock).toHaveBeenCalledTimes(1);
        expect(removeFavoriteMock).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should remove a word when it is already favorited', async () => {
        isFavoriteMock.mockResolvedValue(true);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        const result = await toggleFavorite('banana');
        expect(isFavoriteMock).toHaveBeenCalledWith('banana');
        expect(isFavoriteMock).toHaveBeenCalledTimes(1);
        expect(removeFavoriteMock).toHaveBeenCalledWith('banana');
        expect(removeFavoriteMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should propagate errors when checking favorite status', async () => {
        isFavoriteMock.mockRejectedValue(
            new Error('Firestore error'),
        );
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Firestore error');
        expect(addFavoriteMock).not.toHaveBeenCalled();
        expect(removeFavoriteMock).not.toHaveBeenCalled();
    });

    it('should propagate errors when adding a favorite', async () => {
        isFavoriteMock.mockResolvedValue(false);
        addFavoriteMock.mockRejectedValue(
            new Error('Failed to add favorite'),
        );
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Failed to add favorite');
        expect(isFavoriteMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).toHaveBeenCalledTimes(1);
        expect(removeFavoriteMock).not.toHaveBeenCalled();
    });

    it('should propagate errors when removing a favorite', async () => {
        isFavoriteMock.mockResolvedValue(true);
        removeFavoriteMock.mockRejectedValue(
            new Error('Failed to remove favorite'),
        );
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Failed to remove favorite');
        expect(isFavoriteMock).toHaveBeenCalledTimes(1);
        expect(removeFavoriteMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).not.toHaveBeenCalled();
    });

    it('should not fetch the favorites list when toggling a word', async () => {
        isFavoriteMock.mockResolvedValue(false);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        await toggleFavorite('apple');
        expect(getFavoritesMock).not.toHaveBeenCalled();
    });

    it('should toggle the same word on consecutive executions', async () => {
        isFavoriteMock
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        const firstResult = await toggleFavorite('apple');
        const secondResult = await toggleFavorite('apple');
        expect(firstResult).toBe(true);
        expect(secondResult).toBe(false);
        expect(isFavoriteMock).toHaveBeenCalledTimes(2);
        expect(addFavoriteMock).toHaveBeenCalledTimes(1);
        expect(addFavoriteMock).toHaveBeenCalledWith('apple');
        expect(removeFavoriteMock).toHaveBeenCalledTimes(1);
        expect(removeFavoriteMock).toHaveBeenCalledWith('apple');
    });

    it('should wait for the repository operation to complete', async () => {
        isFavoriteMock.mockResolvedValue(false);
        let resolveOperation!: () => void;
        addFavoriteMock.mockImplementation(
            () =>
                new Promise<void>(resolve => {
                    resolveOperation = resolve;
                }),
        );
        const toggleFavorite = createToggleFavoriteUseCase(repository);
        let completed = false;
        const operation = toggleFavorite('apple').then(() => {
            completed = true;
        });
        await Promise.resolve();
        await Promise.resolve();
        expect(addFavoriteMock).toHaveBeenCalledTimes(1);
        expect(completed).toBe(false);
        resolveOperation();
        await operation;
        expect(completed).toBe(true);
    });
});
