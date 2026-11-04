import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: widthPixel(12),
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        gap: widthPixel(12),
    },
    content: {
        flex: 1,
    },
});