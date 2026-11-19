import type { SQLiteDatabase } from 'expo-sqlite';

/** Versão do esquema (PRAGMA user_version). Aumente ao criar novas migrações. */
export const VERSAO_SCHEMA = 1;

const MIGRACAO_V1 = `
CREATE TABLE IF NOT EXISTS morador (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  corrego_id INTEGER NOT NULL,
  prioritario INTEGER NOT NULL DEFAULT 0,
  tipo_necessidade TEXT NOT NULL DEFAULT 'NENHUMA',
  remote_id INTEGER,
  atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS corrego_favorito (
  corrego_id INTEGER PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  bairro TEXT NOT NULL,
  adicionado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerta_historico (
  id INTEGER PRIMARY KEY NOT NULL,
  corrego_id INTEGER NOT NULL,
  corrego_nome TEXT NOT NULL,
  nivel_risco TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  nivel_agua_cm REAL NOT NULL,
  criado_em TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  recebido_em TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerta_historico_criado ON alerta_historico (criado_em DESC);
`;

/** Cria as tabelas (uma vez) e aplica migrações pendentes. */
export async function inicializarSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const versaoAtual = linha?.user_version ?? 0;

  if (versaoAtual < 1) {
    await db.execAsync(MIGRACAO_V1);
  }
  // if (versaoAtual < 2) { ... próximas migrações ... }

  if (versaoAtual < VERSAO_SCHEMA) {
    await db.execAsync(`PRAGMA user_version = ${VERSAO_SCHEMA}`);
  }
}
