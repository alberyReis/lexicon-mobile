import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { heightPixel, widthPixel } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: widthPixel(28),
        paddingVertical: heightPixel(32),
    },
    header: {
        alignItems: 'center',
        gap: heightPixel(8),
        marginBottom: heightPixel(32),
    },
    title: {
        color: COLORS.text,
        fontSize: widthPixel(30),
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.secondary,
        fontSize: widthPixel(15),
        textAlign: 'center',
        lineHeight: heightPixel(22),
    },
    form: {
        gap: heightPixel(16),
    },
    field: {
        gap: heightPixel(8),
    },
    label: {
        color: COLORS.text,
        fontSize: widthPixel(14),
        fontWeight: '600',
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
    error: {
        color: '#EF4444',
        fontSize: widthPixel(13),
        textAlign: 'center',
    },
    button: {
        height: heightPixel(52),
        justifyContent: 'center',
        alignItems: 'center',
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: widthPixel(6),
        marginTop: heightPixel(28),
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