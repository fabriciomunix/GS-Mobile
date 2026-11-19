import type { Alerta, AlertaHistorico, NivelRisco } from '../types';
import { getDb } from './db';

interface LinhaAlerta {
  id: number;
  corrego_id: number;
  corrego_nome: string;
  nivel_risco: string;
  mensagem: string;
  nivel_agua_cm: number;
  criado_em: string;
  ativo: number;
  recebido_em: string;
}

/**
 * Guarda alertas recebidos no histórico local (cache offline).
 * Se o alerta já existe, atualiza só o status "ativo" e mantém a data em que foi recebido.
 */
export async function salvarAlertas(alertas: Alerta[], nomesCorregos: Record<number, string>): Promise<void> {
  if (alertas.length === 0) return;
  const db = await getDb();
  const agora = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const a of alertas) {
      await db.runAsync(
        `INSERT INTO alerta_historico (id, corrego_id, corrego_nome, nivel_risco, mensagem, nivel_agua_cm, criado_em, ativo, recebido_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET ativo = excluded.ativo, mensagem = excluded.mensagem`,
        [
          a.id,
          a.corregoId,
          nomesCorregos[a.corregoId] ?? `Córrego ${a.corregoId}`,
          a.nivelRisco,
          a.mensagem,
          a.nivelAguaCm,
          a.criadoEm,
          a.ativo ? 1 : 0,
          agora,
        ]
      );
    }
  });
}

/**
 * Marca como encerrados no histórico os alertas que estavam ativos mas não vieram
 * mais na lista de ativos da API (ex.: o córrego voltou ao normal).
 */
export async function encerrarAusentes(idsAtivos: number[], corregoId?: number): Promise<void> {
  const db = await getDb();
  const filtroCorrego = corregoId !== undefined ? ' AND corrego_id = ?' : '';
  const marcadores = idsAtivos.map(() => '?').join(', ');
  const filtroIds = idsAtivos.length ? ` AND id NOT IN (${marcadores})` : '';
  const params: number[] = [...(corregoId !== undefined ? [corregoId] : []), ...idsAtivos];
  await db.runAsync(`UPDATE alerta_historico SET ativo = 0 WHERE ativo = 1${filtroCorrego}${filtroIds}`, params);
}

export async function listarHistorico(limite = 50): Promise<AlertaHistorico[]> {
  const db = await getDb();
  const linhas = await db.getAllAsync<LinhaAlerta>(
    'SELECT * FROM alerta_historico ORDER BY criado_em DESC LIMIT ?',
    [limite]
  );
  return linhas.map((l) => ({
    id: l.id,
    corregoId: l.corrego_id,
    corregoNome: l.corrego_nome,
    nivelRisco: l.nivel_risco as NivelRisco,
    mensagem: l.mensagem,
    nivelAguaCm: l.nivel_agua_cm,
    criadoEm: l.criado_em,
    ativo: l.ativo === 1,
    recebidoEm: l.recebido_em,
  }));
}

export async function limparHistorico(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM alerta_historico');
}
