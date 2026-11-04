import { open } from 'react-native-nitro-sqlite';

export const database = open({
    name: 'lexicon.db',
});
