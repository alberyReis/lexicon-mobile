export type IWordDetailsHeaderProps = {
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    onPlayAudio?: () => void;
    onGoBack: () => void;
};