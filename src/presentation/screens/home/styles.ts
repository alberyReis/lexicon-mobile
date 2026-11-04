import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: widthPixel(24),
    },
});