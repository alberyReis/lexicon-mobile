export type IWordPhoneticEntity = {
    text?: string;
    audio?: string;
};

export type IWordDefinitionEntity = {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
};

export type IWordMeaningEntity = {
    partOfSpeech: string;
    definitions: IWordDefinitionEntity[];
};

export type IWordDetailsEntity = {
    word: string;
    phonetic?: string;
    phonetics: IWordPhoneticEntity[];
    meanings: IWordMeaningEntity[];
};
