import { Search } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import type { ISearchBarProps } from '@/types/search-bar/search-bar-type';

import { styles } from './styles';

export const SearchBar = ({ value, onChangeText }: ISearchBarProps) => {
    return (
        <View style={styles.container}>
            <Search
                color={COLORS.secondary}
                size={20}
            />

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={APP_STRINGS.home.searchPlaceholder}
                placeholderTextColor={COLORS.secondary}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
        </View>
    );
};