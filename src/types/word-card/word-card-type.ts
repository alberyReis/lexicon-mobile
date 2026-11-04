export type IWordCardProps = {
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    isFavorite: boolean;
    onPress: () => void;
    onToggleFavorite: () => void;
};