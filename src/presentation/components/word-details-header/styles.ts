import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(24),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    backButton: {
        width: widthPixel(44),
        height: widthPixel(44),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(14),
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    content: {
        flex: 1,
        alignItems: 'flex-end',
        gap: heightPixel(10),
    },
    word: {
        width: '100%',
        fontSize: widthPixel(34),
        fontWeight: '800',
        letterSpacing: -0.7,
        textAlign: 'right',
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: widthPixel(12),
    },
    phonetic: {
        fontSize: widthPixel(14),
        letterSpacing: 0.3,
    },
    audioButton: {
        width: widthPixel(36),
        height: widthPixel(36),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(18),
    },
    partOfSpeechContainer: {
        alignSelf: 'flex-end',
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(6),
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(8),
    },
});
