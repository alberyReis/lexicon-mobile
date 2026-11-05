import {
    render,
    screen,
} from '@testing-library/react-native';
import { WordDefinition } from '../index';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import type {
    IWordMeaning,
} from '@/types/word-definition/word-definition-type';

describe('WordDefinition', () => {
    const meaningsMock: IWordMeaning[] = [
        {
            partOfSpeech: 'noun',
            definitions: [
                {
                    definition: 'A round fruit.',
                    example: 'I ate an apple.',
                    synonyms: ['fruit', 'produce'],
                    antonyms: ['vegetable'],
                },
                {
                    definition: 'The fruit of an apple tree.',
                },
            ],
        },
        {
            partOfSpeech: 'verb',
            definitions: [
                {
                    definition: 'To apply something.',
                    example: 'Apply the solution.',
                },
            ],
        },
    ];

    it('should render the part of speech', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(screen.getByText('noun')).toBeTruthy();
        expect(screen.getByText('verb')).toBeTruthy();
    });

    it('should render all definitions', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(
            screen.getByText('1. A round fruit.'),
        ).toBeTruthy();
        expect(
            screen.getByText('2. The fruit of an apple tree.'),
        ).toBeTruthy();
        expect(
            screen.getByText('1. To apply something.'),
        ).toBeTruthy();
    });

    it('should restart definition numbering for each meaning', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(
            screen.getByText('1. A round fruit.'),
        ).toBeTruthy();
        expect(
            screen.getByText('1. To apply something.'),
        ).toBeTruthy();
    });

    it('should render examples when available', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(
            screen.getByText('"I ate an apple."'),
        ).toBeTruthy();
        expect(
            screen.getByText('"Apply the solution."'),
        ).toBeTruthy();
        expect(
            screen.getAllByText(
                APP_STRINGS.wordDefinition.example,
            ),
        ).toHaveLength(2);
    });

    it('should render synonyms when available', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(
            screen.getByText('fruit, produce'),
        ).toBeTruthy();
        expect(
            screen.getByText(
                APP_STRINGS.wordDefinition.synonyms,
            ),
        ).toBeTruthy();
    });

    it('should render antonyms when available', async () => {
        await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        expect(
            screen.getByText('vegetable'),
        ).toBeTruthy();
        expect(
            screen.getByText(
                APP_STRINGS.wordDefinition.antonyms,
            ),
        ).toBeTruthy();
    });

    it('should not render optional details when absent', async () => {
        const meanings: IWordMeaning[] = [
            {
                partOfSpeech: 'noun',
                definitions: [
                    {
                        definition: 'A simple definition.',
                    },
                ],
            },
        ];
        await render(
            <WordDefinition meanings={meanings} />,
        );
        expect(
            screen.getByText('1. A simple definition.'),
        ).toBeTruthy();
        expect(
            screen.queryByText(
                APP_STRINGS.wordDefinition.example,
            ),
        ).toBeNull();
        expect(
            screen.queryByText(
                APP_STRINGS.wordDefinition.synonyms,
            ),
        ).toBeNull();
        expect(
            screen.queryByText(
                APP_STRINGS.wordDefinition.antonyms,
            ),
        ).toBeNull();
    });

    it('should not render empty synonym or antonym sections', async () => {
        const meanings: IWordMeaning[] = [
            {
                partOfSpeech: 'noun',
                definitions: [
                    {
                        definition: 'A simple definition.',
                        synonyms: [],
                        antonyms: [],
                    },
                ],
            },
        ];
        await render(
            <WordDefinition meanings={meanings} />,
        );
        expect(
            screen.queryByText(
                APP_STRINGS.wordDefinition.synonyms,
            ),
        ).toBeNull();
        expect(
            screen.queryByText(
                APP_STRINGS.wordDefinition.antonyms,
            ),
        ).toBeNull();
    });

    it('should render an empty list without definitions', async () => {
        await render(
            <WordDefinition meanings={[]} />,
        );
        expect(screen.queryByText('noun')).toBeNull();
        expect(screen.queryByText('verb')).toBeNull();
    });
    it('should render a meaning with no definitions', async () => {
        const meanings: IWordMeaning[] = [
            {
                partOfSpeech: 'adjective',
                definitions: [],
            },
        ];
        await render(
            <WordDefinition meanings={meanings} />,
        );
        expect(
            screen.getByText('adjective'),
        ).toBeTruthy();
    });

    it('should update definitions when props change', async () => {
        const { rerender } = await render(
            <WordDefinition meanings={meaningsMock} />,
        );
        const updatedMeanings: IWordMeaning[] = [
            {
                partOfSpeech: 'adjective',
                definitions: [
                    {
                        definition: 'A new definition.',
                    },
                ],
            },
        ];
        await rerender(
            <WordDefinition meanings={updatedMeanings} />,
        );
        expect(
            screen.getByText('adjective'),
        ).toBeTruthy();
        expect(
            screen.getByText('1. A new definition.'),
        ).toBeTruthy();
        expect(screen.queryByText('noun')).toBeNull();
        expect(screen.queryByText('verb')).toBeNull();
    });
});
