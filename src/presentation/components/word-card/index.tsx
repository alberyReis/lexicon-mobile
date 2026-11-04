import { Pressable, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { COLORS } from '@/shared/constants/colors';
import type { IWordCardProps } from '@/types/word-card/word-card-type';
import { styles } from './styles';
import { APP_STRINGS } from '@/shared/constants/app-strings';

export const WordCard = ({
    word,
    phonetic,
    partOfSpeech,
    isFavorite,
    onPress,
    onToggleFavorite,
}: IWordCardProps) => {
    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.content}>
                <Text style={styles.word}>
                    {word}
                </Text>
                {phonetic && (
                    <Text style={styles.phonetic}>
                        {phonetic}
                    </Text>
                )}
                {partOfSpeech && (
                    <Text style={styles.partOfSpeech}>
                        {partOfSpeech}
                    </Text>
                )}
            </View>
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
        </Pressable>
    );
};