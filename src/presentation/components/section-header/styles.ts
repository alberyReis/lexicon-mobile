import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        gap: heightPixel(6),
    },
    title: {
        color: COLORS.text,
        fontSize: widthPixel(18),
        fontWeight: '600',
    },
    description: {
        color: COLORS.secondary,
        fontSize: widthPixel(13),
    },
});