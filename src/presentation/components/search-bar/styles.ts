import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(12),
        paddingHorizontal: widthPixel(16),
        height: heightPixel(52),
        gap: widthPixel(12),
        borderWidth: 1,
        borderColor: COLORS.primary,
    },

    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: widthPixel(14),
        paddingVertical: 0,
    },
});