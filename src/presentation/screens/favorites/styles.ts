import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(16),
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(24),
        gap: heightPixel(12),
    },
});
