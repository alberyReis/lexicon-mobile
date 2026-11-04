import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(12),
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(14),
        gap: widthPixel(12),
    },
    content: {
        flex: 1,
        gap: heightPixel(4),
    },
    word: {
        color: COLORS.text,
        fontSize: widthPixel(16),
        fontWeight: '600',
    },
    phonetic: {
        color: COLORS.secondary,
        fontSize: widthPixel(13),
    },
    partOfSpeech: {
        color: COLORS.secondary,
        fontSize: widthPixel(12),
        fontStyle: 'italic',
    },
});