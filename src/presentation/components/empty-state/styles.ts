
import { StyleSheet } from 'react-native';

import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(40),
        gap: heightPixel(20),
    },

    iconContainer: {
        width: widthPixel(88),
        height: widthPixel(88),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(44),
        borderWidth: 1,
        borderColor: COLORS.primary,
    },

    content: {
        alignItems: 'center',
        gap: heightPixel(8),
        paddingHorizontal: widthPixel(24),
    },

    description: {
        textAlign: 'center',
    },
});
