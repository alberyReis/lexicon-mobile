import type { IWordMeaning } from '@/types/word-definition/word-definition-type';

export type IWordPhonetic = {
    text?: string;
    audio?: string;
};

export type IWordApiResponse = {
    word: string;
    phonetic?: string;
    phonetics: IWordPhonetic[];
    meanings: IWordMeaning[];
};
