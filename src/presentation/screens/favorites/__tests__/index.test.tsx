import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { useFavoritesBuilder } from '../builder';
import { FavoritesScreen } from '../index';

jest.mock('../builder', () => ({
    useFavoritesBuilder: jest.fn(),
}));

jest.mock('@/presentation/components/header', () => ({
    Header: () => {
        const { Text } = require('react-native');

        return <Text testID="favorites-header">Header</Text>;
    },
}));

jest.mock('@/presentation/components/section-header', () => ({
    SectionHeader: ({
        title,
        description,
    }: {
        title: string;
        description?: string;
    }) => {
        const { Text, View } = require('react-native');

        return (
            <View>
                <Text>{title}</Text>
                {description && <Text>{description}</Text>}
            </View>
        );
    },
}));

jest.mock('@/presentation/components/word-card', () => ({
    WordCard: ({
        word,
        isFavorite,
        onPress,
        onToggleFavorite,
    }: {
        word: string;
        isFavorite: boolean;
        onPress: () => void;
        onToggleFavorite: () => void;
    }) => {
        const { Pressable, Text, View } = require('react-native');

        return (
            <View testID={`word-card-${word}`}>
                <Pressable
                    testID={`word-press-${word}`}
                    onPress={onPress}
                >
                    <Text>{word}</Text>
                </Pressable>

                <Text testID={`favorite-status-${word}`}>
                    {isFavorite ? 'favorite' : 'not-favorite'}
                </Text>

                <Pressable
                    testID={`favorite-press-${word}`}
                    onPress={onToggleFavorite}
                >
                    <Text>Toggle favorite</Text>
                </Pressable>
            </View>
        );
    },
}));

jest.mock('@/presentation/components/empty-state', () => ({
    EmptyState: ({
        title,
        description,
    }: {
        title: string;
        description?: string;
    }) => {
        const { Text, View } = require('react-native');

        return (
            <View testID="empty-state">
                <Text>{title}</Text>
                {description && <Text>{description}</Text>}
            </View>
        );
    },
}));

const mockedUseFavoritesBuilder = jest.mocked(useFavoritesBuilder);

describe('FavoritesScreen', () => {
    const toggleFavoriteMock = jest.fn();
    const openWordDetailsMock = jest.fn();

    const createBuilderMock = (
        overrides: Partial<ReturnType<typeof useFavoritesBuilder>> = {},
    ): ReturnType<typeof useFavoritesBuilder> => ({
        favorites: ['apple', 'banana', 'orange'],
        isPending: false,
        isError: false,
        isUpdating: false,
        toggleFavorite: toggleFavoriteMock,
        openWordDetails: openWordDetailsMock,
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock(),
        );
    });

    it('should render the header', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('favorites-header'),
        ).toBeTruthy();
    });

    it('should render the section title', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByText('Favoritos'),
        ).toBeTruthy();
    });

    it('should render the section description', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByText(
                'Suas palavras salvas para consultar depois.',
            ),
        ).toBeTruthy();
    });

    it('should render the favorite words', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('word-card-apple'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('word-card-banana'),
        ).toBeTruthy();
        expect(
            screen.getByTestId('word-card-orange'),
        ).toBeTruthy();
    });

    it('should mark all listed words as favorites', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('favorite-status-apple'),
        ).toHaveTextContent('favorite');
        expect(
            screen.getByTestId('favorite-status-banana'),
        ).toHaveTextContent('favorite');
        expect(
            screen.getByTestId('favorite-status-orange'),
        ).toHaveTextContent('favorite');
    });

    it('should remove a word from favorites', async () => {
        await render(<FavoritesScreen />);
        fireEvent.press(
            screen.getByTestId('favorite-press-apple'),
        );
        expect(toggleFavoriteMock).toHaveBeenCalledWith('apple');
    });

    it('should open word details when selecting a word', async () => {
        await render(<FavoritesScreen />);
        fireEvent.press(
            screen.getByTestId('word-press-banana'),
        );
        expect(openWordDetailsMock).toHaveBeenCalledWith('banana');
    });

    it('should display an empty state when there are no favorites', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                favorites: [],
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('empty-state'),
        ).toBeTruthy();
    });

    it('should display the empty state title and description', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                favorites: [],
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.getByText('Nenhum favorito ainda'),
        ).toBeTruthy();
        expect(
            screen.getByText(
                'Toque no coração de uma palavra para salvá-la aqui.',
            ),
        ).toBeTruthy();
    });

    it('should not display the empty state when favorites exist', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.queryByTestId('empty-state'),
        ).toBeNull();
    });

    it('should not display the empty state when an error occurs', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                favorites: [],
                isError: true,
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.queryByTestId('empty-state'),
        ).toBeNull();
    });

    it('should display a loading indicator while fetching favorites', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                favorites: [],
                isPending: true,
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('favorites-loading'),
        ).toBeTruthy();
    });

    it('should not render favorite words while loading', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                isPending: true,
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.queryByTestId('word-card-apple'),
        ).toBeNull();
    });

    it('should render the list when favorites are loaded', async () => {
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('favorites-word-list'),
        ).toBeTruthy();
    });

    it('should pass the updating state to the list', async () => {
        mockedUseFavoritesBuilder.mockReturnValue(
            createBuilderMock({
                isUpdating: true,
            }),
        );
        await render(<FavoritesScreen />);
        expect(
            screen.getByTestId('favorites-word-list').props.extraData,
        ).toBe(true);
    });
});
