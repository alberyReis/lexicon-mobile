import { database } from './database';

export const initializeDatabase = async (): Promise<void> => {
    const result = await database.executeAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM words',
    );

    const total = result.rows.item(0)?.total ?? 0;

    console.log('[SQLite] Total de palavras:', total);

    if (total !== 370100) {
        throw new Error(
            `Quantidade de palavras inválida. Esperado: 370100. Encontrado: ${total}`,
        );
    }

    console.log('[SQLite] Banco pré-populado validado com sucesso.');
};