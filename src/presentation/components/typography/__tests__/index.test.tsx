import {
    render,
    screen,
} from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Typography } from '../index';
import { styles } from '../styles';
import type { ITypographyVariant } from '@/types/typography/typography-type';

describe('Typography', () => {
    it('should render the provided text', async () => {
        await render(
            <Typography>Hello world</Typography>,
        );
        expect(screen.getByText('Hello world')).toBeTruthy();
    });

    it('should use the body variant by default', async () => {
        await render(
            <Typography>Default text</Typography>,
        );
        const text = screen.getByText('Default text');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual(styles.body);
    });

    it.each<ITypographyVariant>([
        'heading',
        'title',
        'subtitle',
        'body',
        'caption',
        'label',
    ])('should apply the %s variant styles', async (variant) => {
        await render(
            <Typography variant={variant}>
                Typography text
            </Typography>,
        );
        const text = screen.getByText('Typography text');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual(styles[variant]);
    });

    it('should apply custom styles', async () => {
        const customStyle = {
            fontSize: 20,
            color: '#FFFFFF',
        };
        await render(
            <Typography style={customStyle}>
                Custom text
            </Typography>,
        );
        const text = screen.getByText('Custom text');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual({
            ...styles.body,
            ...customStyle,
        });
    });

    it('should override variant styles with custom styles', async () => {
        const customStyle = {
            fontSize: 30,
            fontWeight: '900' as const,
        };
        await render(
            <Typography
                variant="title"
                style={customStyle}
            >
                Overridden text
            </Typography>,
        );
        const text = screen.getByText('Overridden text');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual({
            ...styles.title,
            ...customStyle,
        });
    });

    it('should render numeric children', async () => {
        await render(
            <Typography>123</Typography>,
        );
        expect(screen.getByText('123')).toBeTruthy();
    });

    it('should update the text when children change', async () => {
        const { rerender } = await render(
            <Typography>Original text</Typography>,
        );
        await rerender(
            <Typography>Updated text</Typography>,
        );
        expect(screen.getByText('Updated text')).toBeTruthy();
        expect(screen.queryByText('Original text')).toBeNull();
    });

    it('should update styles when the variant changes', async () => {
        const { rerender } = await render(
            <Typography variant="body">
                Dynamic text
            </Typography>,
        );
        await rerender(
            <Typography variant="heading">
                Dynamic text
            </Typography>,
        );
        const text = screen.getByText('Dynamic text');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual(styles.heading);
    });

    it('should update custom styles when props change', async () => {
        const { rerender } = await render(
            <Typography style={{ fontSize: 16 }}>
                Dynamic styles
            </Typography>,
        );
        await rerender(
            <Typography style={{ fontSize: 24 }}>
                Dynamic styles
            </Typography>,
        );
        const text = screen.getByText('Dynamic styles');
        expect(
            StyleSheet.flatten(text.props.style),
        ).toEqual({
            ...styles.body,
            fontSize: 24,
        });
    });
});
