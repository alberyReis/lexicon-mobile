import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(20),
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
        justifyContent: 'center',
    },
    word: {
        width: '100%',
        fontSize: widthPixel(30),
        fontWeight: '800',
        letterSpacing: -0.7,
        textAlign: 'right',
    },
});