import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import type { IWordDetailsHeaderProps } from '@/types/word-details-header/word-details-header-type';
import { styles } from './styles';

export const WordDetailsHeader = ({
    word,
    phonetic,
    partOfSpeech,
    onPlayAudio,
    onGoBack,
}: IWordDetailsHeaderProps) => {
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.backButton}
                onPress={onGoBack}
                accessibilityRole="button"
                accessibilityLabel={APP_STRINGS.navigation.goBack}
                hitSlop={8}
            >
                <ArrowLeft
                    size={22}
                    color={COLORS.text}
                />
            </Pressable>
            <View style={styles.content}>
                <Typography variant="heading" style={styles.word}>
                    {word}
                </Typography>
                <View style={styles.details}>
                    {phonetic && (
                        <Typography variant="subtitle" style={styles.phonetic}>
                            {phonetic}
                        </Typography>
                    )}
                    {onPlayAudio && (
                        <Pressable
                            style={styles.audioButton}
                            onPress={onPlayAudio}
                            accessibilityRole="button"
                            accessibilityLabel={APP_STRINGS.wordDetails.playAudio}
                            hitSlop={8}
                        >
                            <Volume2
                                size={18}
                                color={COLORS.text}
                            />
                        </Pressable>
                    )}
                </View>
                {partOfSpeech && (
                    <View style={styles.partOfSpeechContainer}>
                        <Typography variant="label">
                            {partOfSpeech}
                        </Typography>
                    </View>
                )}
            </View>
        </View>
    );
};
