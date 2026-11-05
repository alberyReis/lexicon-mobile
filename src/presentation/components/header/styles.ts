import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { heightPixel, widthPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(24),
        paddingHorizontal: widthPixel(20),
        gap: heightPixel(20),
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: widthPixel(64),
        height: widthPixel(64),
    },
    logoutButton: {
        width: widthPixel(44),
        height: widthPixel(44),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: widthPixel(16),
        backgroundColor: COLORS.surface,
    },
    content: {
        alignItems: 'center',
        gap: heightPixel(6),
    },
    errorContainer: {
        alignItems: 'center',
        paddingHorizontal: widthPixel(12),
    },
});