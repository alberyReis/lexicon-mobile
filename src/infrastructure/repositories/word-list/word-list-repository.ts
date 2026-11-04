export type IWordListRepository = {
    getWords: (
        cursor: string | null,
        limit: number,
    ) => Promise<string[]>;
};