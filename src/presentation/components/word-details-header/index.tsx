import { ArrowLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import type { IWordDetailsHeaderProps } from '@/types/word-details-header/word-details-header-type';
import { styles } from './styles';

export const WordDetailsHeader = ({
    word,
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
                    size={24}
                    color={COLORS.text}
                />
            </Pressable>
            <View style={styles.content}>
                <Typography variant="heading" style={styles.word}>
                    {word}
                </Typography>
            </View>
        </View>
    );
};