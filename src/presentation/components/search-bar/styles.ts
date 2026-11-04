import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },

    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        paddingVertical: 0,
    },
});