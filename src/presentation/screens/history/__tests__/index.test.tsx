import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useHistoryBuilder } from '../builder';
import { HistoryScreen } from '../index';

jest.mock('../builder', () => ({
    useHistoryBuilder: jest.fn(),
}));

jest.mock('@/presentation/components/header', () => ({
    Header: () => {
        const { Text } = require('react-native');

        return <Text testID="history-header">Header</Text>;
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

const mockedUseHistoryBuilder = jest.mocked(useHistoryBuilder);

describe('HistoryScreen', () => {
    const toggleFavoriteMock = jest.fn();
    const openWordDetailsMock = jest.fn();

    const createBuilderMock = (
        overrides: Partial<ReturnType<typeof useHistoryBuilder>> = {},
    ): ReturnType<typeof useHistoryBuilder> => ({
        history: ['apple', 'banana', 'orange'],
        favorites: ['banana'],
        isPending: false,
        isError: false,
        isUpdating: false,
        toggleFavorite: toggleFavoriteMock,
        openWordDetails: openWordDetailsMock,
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock(),
        );
    });

    it('should render the header', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('history-header'),
        ).toBeTruthy();
    });

    it('should render the section title', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByText(APP_STRINGS.history.title),
        ).toBeTruthy();
    });

    it('should render the section description', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByText(APP_STRINGS.history.description),
        ).toBeTruthy();
    });

    it('should render the history words', async () => {
        await render(<HistoryScreen />);
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

    it('should identify favorite words in history', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('favorite-status-banana'),
        ).toHaveTextContent('favorite');
    });

    it('should identify words that are not favorites', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('favorite-status-apple'),
        ).toHaveTextContent('not-favorite');
        expect(
            screen.getByTestId('favorite-status-orange'),
        ).toHaveTextContent('not-favorite');
    });

    it('should toggle a word favorite status', async () => {
        await render(<HistoryScreen />);
        fireEvent.press(
            screen.getByTestId('favorite-press-apple'),
        );
        expect(toggleFavoriteMock).toHaveBeenCalledWith('apple');
        expect(toggleFavoriteMock).toHaveBeenCalledTimes(1);
    });

    it('should allow removing a favorite from history', async () => {
        await render(<HistoryScreen />);
        fireEvent.press(
            screen.getByTestId('favorite-press-banana'),
        );
        expect(toggleFavoriteMock).toHaveBeenCalledWith('banana');
    });

    it('should open word details when selecting a word', async () => {
        await render(<HistoryScreen />);
        fireEvent.press(
            screen.getByTestId('word-press-orange'),
        );
        expect(openWordDetailsMock).toHaveBeenCalledWith('orange');
        expect(openWordDetailsMock).toHaveBeenCalledTimes(1);
    });

    it('should display an empty state when history is empty', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                history: [],
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('empty-state'),
        ).toBeTruthy();
    });

    it('should display the empty history message', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                history: [],
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.getByText(APP_STRINGS.history.emptyTitle),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.history.emptyDescription),
        ).toBeTruthy();
    });

    it('should display an error message when history fails to load', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                history: [],
                isError: true,
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.getByText(APP_STRINGS.history.errorTitle),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.history.errorDescription),
        ).toBeTruthy();
    });

    it('should not display the empty history message when an error occurs', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                history: [],
                isError: true,
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.queryByText(APP_STRINGS.history.emptyTitle),
        ).toBeNull();
    });

    it('should not display the empty state when history exists', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.queryByTestId('empty-state'),
        ).toBeNull();
    });

    it('should display a loading indicator while fetching history', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                history: [],
                isPending: true,
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('history-loading'),
        ).toBeTruthy();
    });

    it('should not render history words while loading', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                isPending: true,
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.queryByTestId('word-card-apple'),
        ).toBeNull();
    });

    it('should render the history list when loading finishes', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('history-word-list'),
        ).toBeTruthy();
    });

    it('should disable scrolling while updating favorites', async () => {
        mockedUseHistoryBuilder.mockReturnValue(
            createBuilderMock({
                isUpdating: true,
            }),
        );
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('history-word-list').props.scrollEnabled,
        ).toBe(false);
    });

    it('should enable scrolling when favorites are not updating', async () => {
        await render(<HistoryScreen />);
        expect(
            screen.getByTestId('history-word-list').props.scrollEnabled,
        ).toBe(true);
    });
});
