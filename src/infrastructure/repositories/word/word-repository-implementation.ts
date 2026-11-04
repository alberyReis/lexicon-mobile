import type { IWordRepository } from '@/infrastructure/repositories/word/word-repository';
import { dictionaryApiService } from '@/infrastructure/api/services/dictionary-api-service';
import type { IWordApiResponse } from '@/types/word-details/word-api-type';

export const wordRepository: IWordRepository = {
    getWord: async (word) => {
        const response = await dictionaryApiService.getWord(word);

        return response.map((item: IWordApiResponse) => ({
            word: item.word,
            phonetic: item.phonetic,
            phonetics: item.phonetics.map((phonetic) => ({
                text: phonetic.text,
                audio: phonetic.audio,
            })),
            meanings: item.meanings.map((meaning) => ({
                partOfSpeech: meaning.partOfSpeech,
                definitions: meaning.definitions.map((definition) => ({
                    definition: definition.definition,
                    example: definition.example,
                    synonyms: definition.synonyms,
                    antonyms: definition.antonyms,
                })),
            })),
        }));
    },
};
