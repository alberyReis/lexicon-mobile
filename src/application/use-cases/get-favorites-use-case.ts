import type { IFavoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository';

export const createGetFavoritesUseCase = (
    repository: IFavoriteRepository,
) => {
    return async (): Promise<string[]> => {
        return repository.getFavorites();
    };
};
