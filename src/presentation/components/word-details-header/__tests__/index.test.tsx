import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { WordDetailsHeader } from '../index';
import { APP_STRINGS } from '@/shared/constants/app-strings';

jest.mock('lucide-react-native', () => ({
    ArrowLeft: 'ArrowLeft',
}));

describe('WordDetailsHeader', () => {
    const onGoBackMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the provided word', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        expect(screen.getByText('apple')).toBeTruthy();
    });

    it('should render the back button', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: APP_STRINGS.navigation.goBack,
            }),
        ).toBeTruthy();
    });

    it('should call onGoBack when pressing the back button', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        fireEvent.press(
            screen.getByRole('button', {
                name: APP_STRINGS.navigation.goBack,
            }),
        );
        expect(onGoBackMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onGoBack when pressing the word', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        fireEvent.press(screen.getByText('apple'));
        expect(onGoBackMock).not.toHaveBeenCalled();
    });

    it('should update the displayed word when props change', async () => {
        const { rerender } = await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        await rerender(
            <WordDetailsHeader
                word="banana"
                onGoBack={onGoBackMock}
            />,
        );
        expect(screen.getByText('banana')).toBeTruthy();
        expect(screen.queryByText('apple')).toBeNull();
    });

    it('should render an empty word', async () => {
        await render(
            <WordDetailsHeader
                word=""
                onGoBack={onGoBackMock}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: APP_STRINGS.navigation.goBack,
            }),
        ).toBeTruthy();
    });

    it('should use the button accessibility role', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        const backButton = screen.getByRole('button', {
            name: APP_STRINGS.navigation.goBack,
        });
        expect(backButton.props.accessibilityRole).toBe('button');
    });

    it('should use the configured hit slop', async () => {
        await render(
            <WordDetailsHeader
                word="apple"
                onGoBack={onGoBackMock}
            />,
        );
        const backButton = screen.getByRole('button', {
            name: APP_STRINGS.navigation.goBack,
        });
        expect(backButton.props.hitSlop).toBe(8);
    });
});
