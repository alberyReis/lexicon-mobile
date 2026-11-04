import type { IWordListRepository } from '@/infrastructure/repositories/word-list/word-list-repository';

export const createGetWordsUseCase = (
    repository: IWordListRepository,
) => {
    return async (
        cursor: string | null,
        limit: number = 20,
    ): Promise<string[]> => {
        return repository.getWords(cursor, limit);
    };
};