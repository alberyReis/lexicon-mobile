import { Heart } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import type { IWordCardProps } from '@/types/word-card/word-card-type';
import { styles } from './styles';

export const WordCard = ({
    word,
    phonetic,
    partOfSpeech,
    isFavorite,
    onPress,
    onToggleFavorite,
}: IWordCardProps) => {
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.content}
                onPress={onPress}
            >
                <Typography variant="title">
                    {word}
                </Typography>
                {phonetic && (
                    <Typography variant="caption">
                        {phonetic}
                    </Typography>
                )}
                {partOfSpeech && (
                    <Typography variant="label">
                        {partOfSpeech}
                    </Typography>
                )}
            </Pressable>
            <Pressable
                onPress={onToggleFavorite}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                    isFavorite
                        ? APP_STRINGS.wordCard.removeFavorite
                        : APP_STRINGS.wordCard.addFavorite
                }
            >
                <Heart
                    size={22}
                    color={isFavorite ? COLORS.primary : COLORS.secondary}
                    fill={isFavorite ? COLORS.primary : 'transparent'}
                />
            </Pressable>
        </View>
    );
};
