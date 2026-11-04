import { database } from '@/infrastructure/database/database';
import type { IWordListRepository } from '@/infrastructure/repositories/word-list/word-list-repository';

export const wordListRepository: IWordListRepository = {
    getWords: async (cursor, limit) => {
        const result = await database.executeAsync<{ word: string }>(
            `
                SELECT word
                FROM words
                WHERE word > ?
                ORDER BY word
                LIMIT ?
            `,
            [cursor ?? '', limit],
        );

        return result.rows._array.map((item) => item.word);
    },
};