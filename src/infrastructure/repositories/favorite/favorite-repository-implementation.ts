import { database } from '@/infrastructure/database/database';
import type { IFavoriteRepository } from './favorite-repository';

export const favoriteRepository: IFavoriteRepository = {
    getFavorites: async () => {
        const result = await database.executeAsync<{ word: string }>(
            'SELECT word FROM favorites ORDER BY word',
        );

        return result.rows._array.map((item) => item.word);
    },

    addFavorite: async (word) => {
        await database.executeAsync(
            'INSERT OR IGNORE INTO favorites (word) VALUES (?)',
            [word],
        );
    },

    removeFavorite: async (word) => {
        await database.executeAsync(
            'DELETE FROM favorites WHERE word = ?',
            [word],
        );
    },

    isFavorite: async (word) => {
        const result = await database.executeAsync<{ word: string }>(
            'SELECT word FROM favorites WHERE word = ? LIMIT 1',
            [word],
        );

        return result.rows._array.length > 0;
    },
};
