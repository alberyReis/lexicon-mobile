import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useHomeBuilder } from '../builder';
import { HomeScreen } from '../index';

jest.mock('../builder', () => ({
    useHomeBuilder: jest.fn(),
}));

jest.mock('@/presentation/components/header', () => ({
    Header: () => {
        const { Text } = require('react-native');

        return <Text testID="home-header">Header</Text>;
    },
}));

jest.mock('@/presentation/components/search-bar', () => ({
    SearchBar: ({
        value,
        onChangeText,
    }: {
        value: string;
        onChangeText: (value: string) => void;
    }) => {
        const { TextInput } = require('react-native');

        return (
            <TextInput
                testID="search-bar"
                value={value}
                onChangeText={onChangeText}
            />
        );
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

const mockedUseHomeBuilder = jest.mocked(useHomeBuilder);

describe('HomeScreen', () => {
    const setSearchMock = jest.fn();
    const toggleFavoriteMock = jest.fn();
    const loadMoreWordsMock = jest.fn();
    const navigateMock = jest.fn();

    const createBuilderMock = (
        overrides: Partial<ReturnType<typeof useHomeBuilder>> = {},
    ): ReturnType<typeof useHomeBuilder> => ({
        search: '',
        setSearch: setSearchMock,
        words: ['apple', 'banana', 'orange'],
        favorites: ['banana'],
        toggleFavorite: toggleFavoriteMock,
        navigation: {
            navigate: navigateMock,
        } as unknown as ReturnType<typeof useHomeBuilder>['navigation'],
        isPending: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        loadMoreWords: loadMoreWordsMock,
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock(),
        );
    });

    it('should render the home header', async () => {
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('home-header'),
        ).toBeTruthy();
    });

    it('should render the search bar', async () => {
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('search-bar'),
        ).toBeTruthy();
    });

    it('should display the current search value', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                search: 'apple',
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('search-bar').props.value,
        ).toBe('apple');
    });

    it('should update the search when typing', async () => {
        await render(<HomeScreen />);
        fireEvent.changeText(
            screen.getByTestId('search-bar'),
            'banana',
        );
        expect(setSearchMock).toHaveBeenCalledWith('banana');
    });

    it('should render the section title and description', async () => {
        await render(<HomeScreen />);
        expect(
            screen.getByText(APP_STRINGS.home.wordsTitle),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.home.wordsDescription),
        ).toBeTruthy();
    });

    it('should render the list of words', async () => {
        await render(<HomeScreen />);
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

    it('should identify favorite words', async () => {
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('favorite-status-banana'),
        ).toHaveTextContent('favorite');
        expect(
            screen.getByTestId('favorite-status-apple'),
        ).toHaveTextContent('not-favorite');
    });

    it('should toggle a word favorite', async () => {
        await render(<HomeScreen />);
        fireEvent.press(
            screen.getByTestId('favorite-press-apple'),
        );
        expect(toggleFavoriteMock).toHaveBeenCalledWith('apple');
    });

    it('should navigate to word details when selecting a word', async () => {
        await render(<HomeScreen />);
        fireEvent.press(
            screen.getByTestId('word-press-apple'),
        );
        expect(navigateMock).toHaveBeenCalledWith(
            'WordDetails',
            { word: 'apple' },
        );
    });

    it('should display a loading indicator while loading words', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                isPending: true,
                words: [],
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('home-loading'),
        ).toBeTruthy();
    });

    it('should not render the word list while loading', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                isPending: true,
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.queryByTestId('word-card-apple'),
        ).toBeNull();
    });

    it('should display an empty state when no words are found', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                words: [],
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('empty-state'),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.emptyState.searchTitle),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.emptyState.searchDescription),
        ).toBeTruthy();
    });

    it('should not display the empty state when an error occurs', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                words: [],
                isError: true,
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.queryByTestId('empty-state'),
        ).toBeNull();
    });

    it('should load more words when reaching the end of the list', async () => {
        await render(<HomeScreen />);
        fireEvent(
            screen.getByTestId('home-word-list'),
            'onEndReached',
        );
        expect(loadMoreWordsMock).toHaveBeenCalledTimes(1);
    });

    it('should display a loading indicator while fetching the next page', async () => {
        mockedUseHomeBuilder.mockReturnValue(
            createBuilderMock({
                isFetchingNextPage: true,
            }),
        );
        await render(<HomeScreen />);
        expect(
            screen.getByTestId('home-pagination-loading'),
        ).toBeTruthy();
    });

    it('should not display the pagination indicator when not fetching', async () => {
        await render(<HomeScreen />);
        expect(
            screen.queryByTestId('home-pagination-loading'),
        ).toBeNull();
    });
});
