import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { inicializarSchema } from './schema';

const NOME_BANCO = 'alerta_corrego.db';

let conexao: Promise<SQLiteDatabase> | null = null;

/**
 * expo-sqlite (SDK 52) não tem implementação nativa para web: um `import` estático do
 * módulo já quebra a prévia web. Nesse caso devolvemos um banco em memória (sempre vazio),
 * só para a prévia web não travar; no celular/emulador o SQLite real continua sendo usado.
 */
function criarBancoWeb(): SQLiteDatabase {
  return {
    execAsync: async () => undefined,
    runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
    getFirstAsync: async () => null,
    getAllAsync: async () => [],
    withTransactionAsync: async (tarefa: () => Promise<void>) => tarefa(),
  } as unknown as SQLiteDatabase;
}

/** Abre o banco SQLite (uma única vez) e garante que o esquema existe. */
export function getDb(): Promise<SQLiteDatabase> {
  if (!conexao) {
    conexao = (async () => {
      if (Platform.OS === 'web') {
        return criarBancoWeb();
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SQLite = require('expo-sqlite') as typeof import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync(NOME_BANCO);
      await inicializarSchema(db);
      return db;
    })().catch((erro) => {
      conexao = null; // permite tentar de novo
      throw erro;
    });
  }
  return conexao;
}
