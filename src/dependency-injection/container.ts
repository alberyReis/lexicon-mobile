import { createGetWordDetailsUseCase } from '@/application/use-cases/get-word-details-use-case';
import { wordRepository } from '@/infrastructure/repositories/word-repository-implementation';

export const container = {
    getWordDetails: createGetWordDetailsUseCase(wordRepository),
};
