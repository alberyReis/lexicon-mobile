import axios from 'axios';

export const dictionaryApiClient = axios.create({
    baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
    timeout: 10000,
    headers: {
        Accept: 'application/json',
    },
});
