import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    heading: {
        color: COLORS.text,
        fontSize: widthPixel(24),
        fontWeight: '700',
    },
    title: {
        color: COLORS.text,
        fontSize: widthPixel(18),
        fontWeight: '600',
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: widthPixel(14),
        fontWeight: '500',
    },
    body: {
        color: COLORS.text,
        fontSize: widthPixel(14),
        fontWeight: '400',
    },
    caption: {
        color: COLORS.secondary,
        fontSize: widthPixel(12),
        fontWeight: '400',
    },
    label: {
        color: COLORS.text,
        fontSize: widthPixel(12),
        fontWeight: '600',
    },
});
