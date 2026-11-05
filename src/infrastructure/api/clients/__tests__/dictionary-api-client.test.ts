import { dictionaryApiClient } from '../dictionary-api-client';

describe('DictionaryApiClient', () => {
    it('should configure the correct base URL', () => {
        expect(dictionaryApiClient.defaults.baseURL).toBe(
            'https://api.dictionaryapi.dev/api/v2/entries/en',
        );
    });

    it('should configure a 10-second timeout', () => {
        expect(dictionaryApiClient.defaults.timeout).toBe(10000);
    });

    it('should accept JSON responses', () => {
        expect(
            dictionaryApiClient.defaults.headers.common.Accept,
        ).toContain('application/json');
    });

    it('should use GET as the default request method', () => {
        expect(
            dictionaryApiClient.defaults.method ?? 'get',
        ).toBe('get');
    });
});
