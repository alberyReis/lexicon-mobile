import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { WordDetailsScreen } from '../index';
import { useWordDetailsBuilder } from '../builder';
import { APP_STRINGS } from '@/shared/constants/app-strings';

jest.mock('../builder', () => ({
    useWordDetailsBuilder: jest.fn(),
}));

jest.mock('@/presentation/components/word-details-header', () => ({
    WordDetailsHeader: ({
        word,
        phonetic,
        partOfSpeech,
        onGoBack,
    }: {
        word: string;
        phonetic?: string;
        partOfSpeech?: string;
        onGoBack: () => void;
    }) => {
        const { Pressable, Text, View } = require('react-native');

        return (
            <View>
                <Text>{word}</Text>
                {phonetic && <Text>{phonetic}</Text>}
                {partOfSpeech && <Text>{partOfSpeech}</Text>}

                <Pressable
                    testID="go-back-button"
                    onPress={onGoBack}
                >
                    <Text>Go back</Text>
                </Pressable>
            </View>
        );
    },
}));

jest.mock('@/presentation/components/word-definition', () => ({
    WordDefinition: ({
        meanings,
    }: {
        meanings: {
            partOfSpeech: string;
            definitions: { definition: string }[];
        }[];
    }) => {
        const { Text, View } = require('react-native');

        return (
            <View testID="word-definition">
                {meanings.map((meaning, index) => (
                    <View key={index}>
                        <Text>{meaning.partOfSpeech}</Text>

                        {meaning.definitions.map((definition, i) => (
                            <Text key={i}>
                                {definition.definition}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>
        );
    },
}));

const mockedUseWordDetailsBuilder = jest.mocked(
    useWordDetailsBuilder,
);

describe('WordDetailsScreen', () => {
    const handleGoBackMock = jest.fn();
    const refetchMock = jest.fn();

    const wordDetailsMock = {
        word: 'apple',
        phonetic: '/ˈæp.əl/',
        phonetics: [],
        meanings: [
            {
                partOfSpeech: 'noun',
                definitions: [
                    {
                        definition: 'A round fruit.',
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: wordDetailsMock,
            isLoading: false,
            isError: false,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
    });

    it('should render the selected word', async () => {
        await render(<WordDetailsScreen />);
        expect(
            screen.getByText('apple'),
        ).toBeTruthy();
    });

    it('should display a loading indicator', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: undefined,
            isLoading: true,
            isError: false,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.getByTestId('word-details-loading'),
        ).toBeTruthy();
    });

    it('should display an error message', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: undefined,
            isLoading: false,
            isError: true,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.getByText(
                APP_STRINGS.wordDetails.loadError,
            ),
        ).toBeTruthy();
    });

    it('should display the retry instruction on error', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: undefined,
            isLoading: false,
            isError: true,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.getByText(
                APP_STRINGS.wordDetails.retry,
            ),
        ).toBeTruthy();
    });

    it('should render word definitions', async () => {
        await render(<WordDetailsScreen />);
        expect(
            screen.getByTestId('word-definition'),
        ).toBeTruthy();
        expect(
            screen.getByText('A round fruit.'),
        ).toBeTruthy();
    });

    it('should display the word returned by the API', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'searched-word',
            wordDetails: wordDetailsMock,
            isLoading: false,
            isError: false,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.getByText('apple'),
        ).toBeTruthy();
        expect(
            screen.queryByText('searched-word'),
        ).toBeNull();
    });

    it('should use the original word when details are unavailable', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'banana',
            wordDetails: undefined,
            isLoading: false,
            isError: false,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.getByText('banana'),
        ).toBeTruthy();
    });

    it('should navigate back when pressing the back button', async () => {
        await render(<WordDetailsScreen />);
        fireEvent.press(
            screen.getByTestId('go-back-button'),
        );
        expect(
            handleGoBackMock,
        ).toHaveBeenCalledTimes(1);
    });

    it('should not render definitions while loading', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: undefined,
            isLoading: true,
            isError: false,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.queryByTestId('word-definition'),
        ).toBeNull();
    });

    it('should not render definitions when an error occurs', async () => {
        mockedUseWordDetailsBuilder.mockReturnValue({
            word: 'apple',
            wordDetails: undefined,
            isLoading: false,
            isError: true,
            refetch: refetchMock as ReturnType<
                typeof useWordDetailsBuilder
            >['refetch'],
            handleGoBack: handleGoBackMock,
        });
        await render(<WordDetailsScreen />);
        expect(
            screen.queryByTestId('word-definition'),
        ).toBeNull();
    });
});
