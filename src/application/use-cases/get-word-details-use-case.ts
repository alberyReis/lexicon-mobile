import type { IWordRepository } from '@/infrastructure/repositories/word-repository';

export const createGetWordDetailsUseCase = (
    wordRepository: IWordRepository,
) => {
    const execute = async (word: string) => {
        return wordRepository.getWord(word);
    };

    return {
        execute,
    };
};
