import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 16,
    },
    logo: {
        width: 180,
        height: 100,
    },
    content: {
        alignItems: 'center',
        gap: 6,
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '600',
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: 13,
        textAlign: 'center',
    },
});
