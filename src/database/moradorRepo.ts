import type { MoradorLocal, TipoNecessidade } from '../types';
import { getDb } from './db';

interface LinhaMorador {
  nome: string;
  telefone: string;
  endereco: string;
  corrego_id: number;
  prioritario: number;
  tipo_necessidade: string;
  remote_id: number | null;
  atualizado_em: string;
}

/** Retorna o cadastro do morador deste celular (ou null se ainda não cadastrou). */
export async function obterMorador(): Promise<MoradorLocal | null> {
  const db = await getDb();
  const l = await db.getFirstAsync<LinhaMorador>('SELECT * FROM morador WHERE id = 1');
  if (!l) return null;
  return {
    nome: l.nome,
    telefone: l.telefone,
    endereco: l.endereco,
    corregoId: l.corrego_id,
    prioritario: l.prioritario === 1,
    tipoNecessidade: l.tipo_necessidade as TipoNecessidade,
    remoteId: l.remote_id,
    atualizadoEm: l.atualizado_em,
  };
}

/** Cria ou atualiza o cadastro (sempre uma linha, id = 1). */
export async function salvarMorador(m: Omit<MoradorLocal, 'atualizadoEm'>): Promise<MoradorLocal> {
  const db = await getDb();
  const atualizadoEm = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO morador (id, nome, telefone, endereco, corrego_id, prioritario, tipo_necessidade, remote_id, atualizado_em)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nome = excluded.nome,
       telefone = excluded.telefone,
       endereco = excluded.endereco,
       corrego_id = excluded.corrego_id,
       prioritario = excluded.prioritario,
       tipo_necessidade = excluded.tipo_necessidade,
       remote_id = excluded.remote_id,
       atualizado_em = excluded.atualizado_em`,
    [m.nome, m.telefone, m.endereco, m.corregoId, m.prioritario ? 1 : 0, m.tipoNecessidade, m.remoteId, atualizadoEm]
  );
  return { ...m, atualizadoEm };
}

export async function excluirMorador(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM morador WHERE id = 1');
}
