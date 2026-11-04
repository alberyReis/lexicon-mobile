export type IWordDefinition = {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
};

export type IWordMeaning = {
    partOfSpeech: string;
    definitions: IWordDefinition[];
};

export type IWordDefinitionProps = {
    meanings: IWordMeaning[];
};
