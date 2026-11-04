import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: widthPixel(12),
        paddingTop: heightPixel(4),
        paddingBottom: heightPixel(16),
    },
    indicator: {
        width: widthPixel(4),
        borderRadius: widthPixel(4),
        backgroundColor: COLORS.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: heightPixel(5),
    },
    title: {
        fontSize: widthPixel(20),
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    description: {
        fontSize: widthPixel(13),
        lineHeight: heightPixel(19),
    },
});
