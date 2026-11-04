export type IWordListRepository = {
    getWords: (
        cursor: string | null,
        limit: number,
        search: string,
    ) => Promise<string[]>;
};