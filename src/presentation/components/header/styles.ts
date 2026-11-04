import { StyleSheet } from 'react-native';
import { heightPixel, widthPixel } from '@/shared/utils/responsive';

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
});
