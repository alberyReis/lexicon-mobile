import { useState } from 'react';
import { IWord } from '@/types/word/word-type';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';

const MOCK_WORDS: IWord[] = [
    { word: 'ability', phonetic: '/əˈbɪləti/', partOfSpeech: 'noun' },
    { word: 'achieve', phonetic: '/əˈtʃiːv/', partOfSpeech: 'verb' },
    { word: 'beautiful', phonetic: '/ˈbjuːtɪfəl/', partOfSpeech: 'adjective' },
    { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', partOfSpeech: 'noun' },
    { word: 'create', phonetic: '/kriˈeɪt/', partOfSpeech: 'verb' },
    { word: 'develop', phonetic: '/dɪˈveləp/', partOfSpeech: 'verb' },
    { word: 'dream', phonetic: '/driːm/', partOfSpeech: 'noun' },
    { word: 'effort', phonetic: '/ˈefərt/', partOfSpeech: 'noun' },
    { word: 'experience', phonetic: '/ɪkˈspɪriəns/', partOfSpeech: 'noun' },
    { word: 'freedom', phonetic: '/ˈfriːdəm/', partOfSpeech: 'noun' },
    { word: 'growth', phonetic: '/ɡroʊθ/', partOfSpeech: 'noun' },
    { word: 'happiness', phonetic: '/ˈhæpinəs/', partOfSpeech: 'noun' },
    { word: 'improve', phonetic: '/ɪmˈpruːv/', partOfSpeech: 'verb' },
    { word: 'journey', phonetic: '/ˈdʒɜːrni/', partOfSpeech: 'noun' },
    { word: 'knowledge', phonetic: '/ˈnɑːlɪdʒ/', partOfSpeech: 'noun' },
    { word: 'language', phonetic: '/ˈlæŋɡwɪdʒ/', partOfSpeech: 'noun' },
    { word: 'meaning', phonetic: '/ˈmiːnɪŋ/', partOfSpeech: 'noun' },
    { word: 'opportunity', phonetic: '/ˌɑːpərˈtuːnəti/', partOfSpeech: 'noun' },
    { word: 'progress', phonetic: '/ˈprɑːɡres/', partOfSpeech: 'noun' },
    { word: 'success', phonetic: '/səkˈses/', partOfSpeech: 'noun' },
] as const;

export const useHomeBuilder = () => {
    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const words = MOCK_WORDS.filter(({ word }) =>
        word.toLowerCase().includes(search.trim().toLowerCase()),
    );

    const toggleFavorite = (word: string) => {
        setFavorites((currentFavorites) =>
            currentFavorites.includes(word)
                ? currentFavorites.filter((favorite) => favorite !== word)
                : [...currentFavorites, word],
        );
    };

    return {
        search,
        setSearch,
        words,
        favorites,
        toggleFavorite,
        navigation,
    };
};
