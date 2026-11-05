import {
    render,
    screen,
} from '@testing-library/react-native';
import { Heart } from 'lucide-react-native';
import { EmptyState } from '../index';

jest.mock('lucide-react-native', () => {
    const { Text } = require('react-native');

    return {
        BookSearch: () => (
            <Text testID="default-icon">Default icon</Text>
        ),
        Heart: () => (
            <Text testID="custom-icon">Custom icon</Text>
        ),
    };
});

describe('EmptyState', () => {
    it('should render the title', async () => {
        await render(
            <EmptyState title="No words found" />,
        );
        expect(
            screen.getByText('No words found'),
        ).toBeTruthy();
    });

    it('should render the description when provided', async () => {
        await render(
            <EmptyState
                title="No words found"
                description="Try searching for another word."
            />,
        );
        expect(
            screen.getByText('Try searching for another word.'),
        ).toBeTruthy();
    });

    it('should not render a description when omitted', async () => {
        await render(
            <EmptyState title="No words found" />,
        );
        expect(
            screen.queryByText('Try searching for another word.'),
        ).toBeNull();
    });

    it('should not render an empty description', async () => {
        await render(
            <EmptyState
                title="No words found"
                description=""
            />,
        );
        expect(
            screen.getByText('No words found'),
        ).toBeTruthy();
        expect(
            screen.queryByText(''),
        ).toBeNull();
    });

    it('should render the default icon', async () => {
        await render(
            <EmptyState title="No words found" />,
        );
        expect(
            screen.getByTestId('default-icon'),
        ).toBeTruthy();
    });

    it('should render a custom icon when provided', async () => {
        await render(
            <EmptyState
                title="No favorites yet"
                icon={Heart}
            />,
        );
        expect(
            screen.getByTestId('custom-icon'),
        ).toBeTruthy();
        expect(
            screen.queryByTestId('default-icon'),
        ).toBeNull();
    });

    it('should update the title when props change', async () => {
        const { rerender } = await render(
            <EmptyState title="No words found" />,
        );
        await rerender(
            <EmptyState title="No favorites yet" />,
        );
        expect(
            screen.getByText('No favorites yet'),
        ).toBeTruthy();
        expect(
            screen.queryByText('No words found'),
        ).toBeNull();
    });

    it('should update the description when props change', async () => {
        const { rerender } = await render(
            <EmptyState
                title="No words found"
                description="Try searching again."
            />,
        );
        await rerender(
            <EmptyState
                title="No words found"
                description="Your list is empty."
            />,
        );
        expect(
            screen.getByText('Your list is empty.'),
        ).toBeTruthy();
        expect(
            screen.queryByText('Try searching again.'),
        ).toBeNull();
    });
});
