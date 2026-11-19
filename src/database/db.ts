import * as SQLite from 'expo-sqlite';
import { inicializarSchema } from './schema';

const NOME_BANCO = 'alerta_corrego.db';

let conexao: Promise<SQLite.SQLiteDatabase> | null = null;

/** Abre o banco SQLite (uma única vez) e garante que o esquema existe. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!conexao) {
    conexao = (async () => {
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
