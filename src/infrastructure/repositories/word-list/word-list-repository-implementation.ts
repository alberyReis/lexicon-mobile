import { database } from '@/infrastructure/database/database';
import type { IWordListRepository } from './word-list-repository';

export const wordListRepository: IWordListRepository = {
    getWords: async (cursor, limit, search) => {
        const result = await database.executeAsync<{ word: string }>(
            `
                SELECT word
                FROM words
                WHERE word > ?
                  AND word LIKE ? ESCAPE '\\'
                ORDER BY word
                LIMIT ?
            `,
            [
                cursor ?? '',
                `${search.trim().replace(/[\\%_]/g, '\\$&')}%`,
                limit,
            ],
        );

        return result.rows._array.map((item) => item.word);
    },
};
