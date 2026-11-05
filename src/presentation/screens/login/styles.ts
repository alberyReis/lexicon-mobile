import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { widthPixel, heightPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: widthPixel(28),
        gap: heightPixel(20),
    },
    header: {
        alignItems: 'center',
        gap: heightPixel(8),
        marginBottom: heightPixel(24),
    },
    title: {
        fontSize: widthPixel(32),
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: widthPixel(15),
        color: COLORS.secondary,
        textAlign: 'center',
    },
    form: {
        gap: heightPixel(16),
    },
    field: {
        gap: heightPixel(8),
    },
    label: {
        fontSize: widthPixel(14),
        fontWeight: '600',
        color: COLORS.text,
    },
    input: {
        height: heightPixel(52),
        paddingHorizontal: widthPixel(16),
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: widthPixel(12),
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize: widthPixel(15),
    },
    button: {
        height: heightPixel(52),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: widthPixel(12),
        backgroundColor: COLORS.secondary,
        marginTop: heightPixel(8),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: widthPixel(16),
        fontWeight: '700',
    },
    error: {
        color: '#EF4444',
        fontSize: widthPixel(13),
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: widthPixel(5),
        marginTop: heightPixel(12),
    },
    footerText: {
        color: COLORS.text,
        fontSize: widthPixel(14),
    },
    footerLink: {
        color: COLORS.secondary,
        fontSize: widthPixel(14),
        fontWeight: '700',
    },
});