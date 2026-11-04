import type { IWordDetailsEntity } from '@/domain/entities/word-details-entity';

export type IWordRepository = {
    getWord: (word: string) => Promise<IWordDetailsEntity[]>;
};
