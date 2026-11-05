import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { WordCard } from '../index';
import { APP_STRINGS } from '@/shared/constants/app-strings';

jest.mock('lucide-react-native', () => ({
    Heart: 'Heart',
}));

describe('WordCard', () => {
    const onPressMock = jest.fn();
    const onToggleFavoriteMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the word', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        expect(screen.getByText('apple')).toBeTruthy();
    });

    it('should call onPress when the word is pressed', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        fireEvent.press(screen.getByText('apple'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleFavorite when favorite button is pressed', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        fireEvent.press(
            screen.getByRole('button', {
                name: APP_STRINGS.wordCard.addFavorite,
            }),
        );
        expect(onToggleFavoriteMock).toHaveBeenCalledTimes(1);
    });

    it('should display add favorite accessibility label when not favorited', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: APP_STRINGS.wordCard.addFavorite,
            }),
        ).toBeTruthy();
    });

    it('should display remove favorite accessibility label when favorited', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={true}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        expect(
            screen.getByRole('button', {
                name: APP_STRINGS.wordCard.removeFavorite,
            }),
        ).toBeTruthy();
    });

    it('should not call onPress when favorite button is pressed', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        fireEvent.press(
            screen.getByRole('button', {
                name: APP_STRINGS.wordCard.addFavorite,
            }),
        );
        expect(onPressMock).not.toHaveBeenCalled();
        expect(onToggleFavoriteMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggleFavorite when word is pressed', async () => {
        await render(
            <WordCard
                word="apple"
                isFavorite={false}
                onPress={onPressMock}
                onToggleFavorite={onToggleFavoriteMock}
            />,
        );
        fireEvent.press(screen.getByText('apple'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
        expect(onToggleFavoriteMock).not.toHaveBeenCalled();
    });
});
