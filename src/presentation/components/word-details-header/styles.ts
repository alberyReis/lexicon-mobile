import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(16),
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: widthPixel(20),
        paddingVertical: heightPixel(24),
        gap: widthPixel(16),
    },
    content: {
        flex: 1,
        gap: heightPixel(8),
    },
    word: {
        fontSize: widthPixel(30),
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    partOfSpeechContainer: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.background,
        borderRadius: widthPixel(6),
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(5),
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    audioButton: {
        width: widthPixel(48),
        height: widthPixel(48),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: widthPixel(24),
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: widthPixel(44),
        height: widthPixel(44),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        borderRadius: widthPixel(12),
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
});
