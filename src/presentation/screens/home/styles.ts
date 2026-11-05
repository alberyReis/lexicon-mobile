import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        
    },
    content: {
        gap: heightPixel(20),
        paddingHorizontal: widthPixel(24),
    },
    listContent: {
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(24),
        gap: heightPixel(12),
        paddingHorizontal: widthPixel(24),
    },
});
