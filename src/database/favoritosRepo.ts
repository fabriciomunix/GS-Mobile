import type { Corrego, CorregoFavorito } from '../types';
import { getDb } from './db';

interface LinhaFavorito {
  corrego_id: number;
  nome: string;
  bairro: string;
  adicionado_em: string;
}

export async function listarFavoritos(): Promise<CorregoFavorito[]> {
  const db = await getDb();
  const linhas = await db.getAllAsync<LinhaFavorito>('SELECT * FROM corrego_favorito ORDER BY adicionado_em ASC');
  return linhas.map((l) => ({ corregoId: l.corrego_id, nome: l.nome, bairro: l.bairro, adicionadoEm: l.adicionado_em }));
}

export async function ehFavorito(corregoId: number): Promise<boolean> {
  const db = await getDb();
  const l = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM corrego_favorito WHERE corrego_id = ?',
    [corregoId]
  );
  return (l?.total ?? 0) > 0;
}

export async function adicionarFavorito(c: Pick<Corrego, 'id' | 'nome' | 'bairro'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO corrego_favorito (corrego_id, nome, bairro, adicionado_em) VALUES (?, ?, ?, ?)',
    [c.id, c.nome, c.bairro, new Date().toISOString()]
  );
}

export async function removerFavorito(corregoId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM corrego_favorito WHERE corrego_id = ?', [corregoId]);
}

/** Liga/desliga o monitoramento. Retorna o novo estado (true = monitorado). */
export async function alternarFavorito(c: Pick<Corrego, 'id' | 'nome' | 'bairro'>): Promise<boolean> {
  if (await ehFavorito(c.id)) {
    await removerFavorito(c.id);
    return false;
  }
  await adicionarFavorito(c);
  return true;
}
