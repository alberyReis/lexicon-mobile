import { database } from '@/infrastructure/database/database';
import type { IHistoryRepository } from './history-repository';

export const historyRepository: IHistoryRepository = {
    getHistory: async () => {
        const result = await database.executeAsync<{ word: string }>(
            `
                SELECT word
                FROM history
                ORDER BY viewed_at DESC
            `,
        );

        return result.rows._array.map((item) => item.word);
    },

    addToHistory: async (word) => {
        await database.executeAsync(
            `
                INSERT INTO history (word, viewed_at)
                VALUES (?, ?)
                ON CONFLICT(word)
                DO UPDATE SET viewed_at = excluded.viewed_at
            `,
            [word, Date.now()],
        );
    },

    clearHistory: async () => {
        await database.executeAsync(
            'DELETE FROM history',
        );
    },
};
