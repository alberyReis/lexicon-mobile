const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const sourcePath = path.resolve(__dirname, '../assets/data/words_dictionary.json');
const databaseDirectory = path.resolve(__dirname, '../assets/database');
const databasePath = path.join(databaseDirectory, 'lexicon.db');
const dictionary = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const words = Object.keys(dictionary);

fs.mkdirSync(databaseDirectory, { recursive: true });

if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath);
}

const database = new DatabaseSync(databasePath);

try {
    database.exec(`
        CREATE TABLE words (
            id INTEGER PRIMARY KEY,
            word TEXT NOT NULL UNIQUE
        )
    `);

    const insertWord = database.prepare(`
        INSERT INTO words (word)
        VALUES (?)
    `);

    database.exec('BEGIN TRANSACTION');

    try {
        for (const word of words) {
            insertWord.run(word);
        }

        database.exec('COMMIT');
    } catch (error) {
        database.exec('ROLLBACK');
        throw error;
    }

    const result = database.prepare(`
        SELECT COUNT(*) AS total
        FROM words
    `).get();

    console.log(`Banco gerado com sucesso: ${databasePath}`);
    console.log(`Total de palavras: ${result.total}`);
} finally {
    database.close();
}