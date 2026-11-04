
import { StyleSheet } from 'react-native';

import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: widthPixel(24),
    },
    content: {
        flexGrow: 1,
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(32),
        gap: heightPixel(24),
    },
    feedbackContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(40),
        gap: heightPixel(16),
    },
});
