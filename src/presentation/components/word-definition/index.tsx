import { View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import type { IWordDefinitionProps } from '@/types/word-definition/word-definition-type';

import { styles } from './styles';

export const WordDefinition = ({ meanings }: IWordDefinitionProps) => {
    return (
        <View style={styles.container}>
            {meanings.map((meaning, meaningIndex) => (
                <View
                    key={`${meaning.partOfSpeech}-${meaningIndex}`}
                    style={styles.meaningContainer}
                >
                    <Typography variant="title">
                        {meaning.partOfSpeech}
                    </Typography>
                    <View style={styles.definitionsContainer}>
                        {meaning.definitions.map((definition, definitionIndex) => (
                            <View
                                key={`${meaningIndex}-${definitionIndex}`}
                                style={styles.definitionContainer}
                            >
                                <Typography variant="body">
                                    {`${definitionIndex + 1}. ${definition.definition}`}
                                </Typography>
                                {definition.example && (
                                    <View style={styles.detailContainer}>
                                        <Typography variant="caption">
                                            {APP_STRINGS.wordDefinition.example}
                                        </Typography>
                                        <Typography variant="subtitle">
                                            {`"${definition.example}"`}
                                        </Typography>
                                    </View>
                                )}
                                {!!definition.synonyms?.length && (
                                    <View style={styles.detailContainer}>
                                        <Typography variant="caption">
                                            {APP_STRINGS.wordDefinition.synonyms}
                                        </Typography>
                                        <Typography variant="body">
                                            {definition.synonyms.join(', ')}
                                        </Typography>
                                    </View>
                                )}
                                {!!definition.antonyms?.length && (
                                    <View style={styles.detailContainer}>
                                        <Typography variant="caption">
                                            {APP_STRINGS.wordDefinition.antonyms}
                                        </Typography>
                                        <Typography variant="body">
                                            {definition.antonyms.join(', ')}
                                        </Typography>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};
