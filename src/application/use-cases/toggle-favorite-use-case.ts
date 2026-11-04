import type { IFavoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository';

export const createToggleFavoriteUseCase = (
    repository: IFavoriteRepository,
) => {
    return async (word: string): Promise<boolean> => {
        const isFavorite = await repository.isFavorite(word);

        if (isFavorite) {
            await repository.removeFavorite(word);
            return false;
        }

        await repository.addFavorite(word);

        return true;
    };
};
