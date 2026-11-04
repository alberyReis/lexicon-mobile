import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        gap: heightPixel(24),
    },
    meaningContainer: {
        gap: heightPixel(16),
    },
    definitionsContainer: {
        gap: heightPixel(16),
    },
    definitionContainer: {
        gap: heightPixel(10),
        paddingLeft: widthPixel(12),
        paddingVertical: heightPixel(12),
        borderLeftWidth: widthPixel(2),
        borderLeftColor: COLORS.primary,
    },
    detailContainer: {
        gap: heightPixel(4),
        paddingLeft: widthPixel(8),
    },
});
