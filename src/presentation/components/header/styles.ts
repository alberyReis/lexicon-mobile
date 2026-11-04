import { StyleSheet } from 'react-native';

import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: heightPixel(24),
        gap: heightPixel(16),
    },
    logo: {
        width: widthPixel(180),
        height: heightPixel(100),
    },
    content: {
        alignItems: 'center',
        gap: heightPixel(6),
    },
    title: {
        color: COLORS.text,
        fontSize: widthPixel(20),
        fontWeight: '600',
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: widthPixel(13),
        textAlign: 'center',
    },
});