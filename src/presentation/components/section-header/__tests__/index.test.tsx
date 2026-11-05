import {
    render,
    screen,
} from '@testing-library/react-native';
import { SectionHeader } from '../index';

describe('SectionHeader', () => {
    it('should render the provided title', async () => {
        await render(
            <SectionHeader title="Recent words" />,
        );
        expect(screen.getByText('Recent words')).toBeTruthy();
    });

    it('should render the provided description', async () => {
        await render(
            <SectionHeader
                title="Recent words"
                description="Words you have recently viewed"
            />,
        );
        expect(
            screen.getByText('Words you have recently viewed'),
        ).toBeTruthy();
    });

    it('should render without a description', async () => {
        await render(
            <SectionHeader title="Recent words" />,
        );
        expect(screen.getByText('Recent words')).toBeTruthy();
        expect(
            screen.queryByText('Words you have recently viewed'),
        ).toBeNull();
    });

    it('should not render an empty description', async () => {
        await render(
            <SectionHeader
                title="Recent words"
                description=""
            />,
        );
        expect(screen.getByText('Recent words')).toBeTruthy();
        expect(screen.queryByText('')).toBeNull();
    });

    it('should update the title when props change', async () => {
        const { rerender } = await render(
            <SectionHeader title="Recent words" />,
        );
        await rerender(
            <SectionHeader title="Favorite words" />,
        );
        expect(screen.getByText('Favorite words')).toBeTruthy();
        expect(screen.queryByText('Recent words')).toBeNull();
    });

    it('should update the description when props change', async () => {
        const { rerender } = await render(
            <SectionHeader
                title="Recent words"
                description="Previously viewed words"
            />,
        );
        await rerender(
            <SectionHeader
                title="Recent words"
                description="Your word history"
            />,
        );
        expect(screen.getByText('Your word history')).toBeTruthy();
        expect(
            screen.queryByText('Previously viewed words'),
        ).toBeNull();
    });

    it('should remove the description when it becomes undefined', async () => {
        const { rerender } = await render(
            <SectionHeader
                title="Recent words"
                description="Previously viewed words"
            />,
        );
        await rerender(
            <SectionHeader title="Recent words" />,
        );
        expect(
            screen.queryByText('Previously viewed words'),
        ).toBeNull();
        expect(screen.getByText('Recent words')).toBeTruthy();
    });
});
