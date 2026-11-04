import { database } from './database';

export const initializeDatabase = async () => {
    await database.executeAsync(`
        CREATE TABLE IF NOT EXISTS favorites (
            word TEXT PRIMARY KEY
        );
    `);

    await database.executeAsync(`
        CREATE TABLE IF NOT EXISTS history (
            word TEXT PRIMARY KEY,
            viewed_at INTEGER NOT NULL
        );
    `);

    const result = await database.executeAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM words',
    );

    const total = result.rows.item(0)?.total ?? 0;

    console.log(`[SQLite] Total de palavras: ${total}`);
};
