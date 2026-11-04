import { createGetWordDetailsUseCase } from '@/application/use-cases/get-word-details-use-case';
import { createGetWordsUseCase } from '@/application/use-cases/get-words-use-case';
import { wordRepository } from '@/infrastructure/repositories/word/word-repository-implementation';
import { wordListRepository } from '@/infrastructure/repositories/word-list/word-list-repository-implementation';

export const container = {
    getWordDetails: createGetWordDetailsUseCase(wordRepository),
    getWords: createGetWordsUseCase(wordListRepository),
};