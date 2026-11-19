/**
 * Consumo da API REST do Alerta Córrego (SOA/FastAPI ou C#/.NET — mesmo contrato).
 * Base configurável por EXPO_PUBLIC_API_URL (o app acrescenta "/api").
 *
 * Toda chamada usa fetch com timeout. Se a API estiver fora do ar (ou não configurada),
 * o app usa automaticamente os dados de demonstração de ./mock.ts — assim ele sempre funciona.
 */
import type { Alerta, Corrego, Leitura, Morador, NivelRisco, StatusCorrego } from '../types';
import { classificarRisco } from '../utils/risco';
import {
  mockAlertas,
  mockLeituras,
  mockListarCorregos,
  mockObterCorrego,
  mockSalvarMorador,
  mockSimularNovaLeitura,
  mockStatus,
} from './mock';

export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
const TIMEOUT_MS: number = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 5000;
/** Depois de uma falha de rede, espera este tempo antes de tentar a API de novo (evita várias esperas seguidas). */
const PAUSA_APOS_FALHA_MS = 20000;

export type Origem = 'api' | 'mock';

export interface Resultado<T> {
  dados: T;
  origem: Origem;
}

export class ErroHttp extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroHttp';
  }
}

let apiIndisponivelAte = 0;

/** Chamado pelo botão "Atualizar": tenta a API de novo imediatamente. */
export function forcarNovaTentativa(): void {
  apiIndisponivelAte = 0;
}

export function apiConfigurada(): boolean {
  return API_URL.length > 0;
}

export async function fetchComTimeout(url: string, init: RequestInit = {}, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...((init.headers as Record<string, string> | undefined) ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function chamarApi<T>(caminho: string, init?: RequestInit): Promise<T> {
  if (!apiConfigurada()) throw new Error('API não configurada (EXPO_PUBLIC_API_URL vazio).');
  if (Date.now() < apiIndisponivelAte) throw new Error('API indisponível no momento.');

  let resposta: Response;
  try {
    resposta = await fetchComTimeout(`${API_URL}/api${caminho}`, init);
  } catch (e) {
    apiIndisponivelAte = Date.now() + PAUSA_APOS_FALHA_MS;
    throw e;
  }
  if (!resposta.ok) {
    throw new ErroHttp(resposta.status, `Erro ${resposta.status} em ${caminho}`);
  }
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

/** Tenta a API; em qualquer falha usa o mock. Informa de onde veio o dado. */
async function comFallback<T>(chamada: () => Promise<T>, mock: () => T): Promise<Resultado<T>> {
  try {
    const dados = await chamada();
    return { dados, origem: 'api' };
  } catch (e) {
    if (__DEV__) console.log('[api] usando dados de demonstração:', (e as Error)?.message);
    return { dados: mock(), origem: 'mock' };
  }
}

// ---------- normalização (aceita pequenas diferenças entre SOA e C#) ----------

const NIVEIS: NivelRisco[] = ['NORMAL', 'ATENCAO', 'ALERTA', 'CRITICO'];

function paraNivelRisco(valor: unknown): NivelRisco | null {
  if (typeof valor !== 'string') return null;
  const v = valor
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return (NIVEIS as string[]).includes(v) ? (v as NivelRisco) : null;
}

type Bruto = Record<string, any>;

function normalizarLeitura(l: Bruto | null | undefined): Leitura | null {
  if (!l) return null;
  return {
    id: Number(l.id ?? 0),
    sensorId: Number(l.sensorId ?? 0),
    nivelAguaCm: Number(l.nivelAguaCm ?? 0),
    chuvaMmHora: Number(l.chuvaMmHora ?? 0),
    registradaEm: String(l.registradaEm ?? ''),
  };
}

function normalizarStatus(bruto: Bruto, corregoId: number, corrego?: Corrego | null): StatusCorrego {
  const ultima = normalizarLeitura(bruto.ultimaLeitura ?? bruto.leitura);
  const nivel = Number(bruto.nivelAguaCm ?? bruto.ultimoNivelCm ?? ultima?.nivelAguaCm ?? 0);
  const chuva = Number(bruto.chuvaMmHora ?? ultima?.chuvaMmHora ?? 0);
  const risco =
    paraNivelRisco(bruto.nivelRisco) ?? (corrego ? classificarRisco(nivel, chuva, corrego) : 'NORMAL');
  return {
    corregoId: Number(bruto.corregoId ?? corregoId),
    nivelAguaCm: nivel,
    chuvaMmHora: chuva,
    nivelRisco: risco,
    registradaEm: (bruto.registradaEm as string | undefined) ?? (bruto.atualizadoEm as string | undefined) ?? ultima?.registradaEm ?? null,
    ultimaLeitura: ultima,
  };
}

function normalizarAlerta(a: Bruto): Alerta {
  return {
    id: Number(a.id),
    corregoId: Number(a.corregoId),
    nivelRisco: paraNivelRisco(a.nivelRisco) ?? 'ALERTA',
    mensagem: String(a.mensagem ?? ''),
    nivelAguaCm: Number(a.nivelAguaCm ?? 0),
    criadoEm: String(a.criadoEm ?? new Date().toISOString()),
    ativo: Boolean(a.ativo),
  };
}

// ---------- endpoints ----------

/** GET /api/corregos */
export function listarCorregos(): Promise<Resultado<Corrego[]>> {
  return comFallback(() => chamarApi<Corrego[]>('/corregos'), mockListarCorregos);
}

/** GET /api/corregos/{id} */
export function obterCorrego(id: number): Promise<Resultado<Corrego | null>> {
  return comFallback(
    () => chamarApi<Corrego>(`/corregos/${id}`),
    () => mockObterCorrego(id)
  );
}

/**
 * GET /api/corregos/{id}/status
 * @param simularNovaLeitura no modo demonstração, gera uma nova leitura antes (botão "Atualizar").
 */
export async function obterStatus(
  corregoId: number,
  opcoes: { corrego?: Corrego | null; simularNovaLeitura?: boolean } = {}
): Promise<Resultado<StatusCorrego>> {
  return comFallback(
    async () => normalizarStatus(await chamarApi<Bruto>(`/corregos/${corregoId}/status`), corregoId, opcoes.corrego),
    () => {
      if (opcoes.simularNovaLeitura) mockSimularNovaLeitura(corregoId);
      return mockStatus(corregoId);
    }
  );
}

/** GET /api/leituras?corregoId=&limite= */
export function listarLeituras(corregoId: number, limite = 10): Promise<Resultado<Leitura[]>> {
  return comFallback(
    async () => {
      const brutas = await chamarApi<Bruto[]>(`/leituras?corregoId=${corregoId}&limite=${limite}`);
      return brutas
        .map((l) => normalizarLeitura(l))
        .filter((l): l is Leitura => l !== null)
        .sort((a, b) => b.registradaEm.localeCompare(a.registradaEm));
    },
    () => mockLeituras(corregoId, limite)
  );
}

/** GET /api/alertas?ativos=true&corregoId= */
export function listarAlertas(filtro: { ativos?: boolean; corregoId?: number } = {}): Promise<Resultado<Alerta[]>> {
  const params: string[] = [];
  if (filtro.ativos !== undefined) params.push(`ativos=${filtro.ativos}`);
  if (filtro.corregoId !== undefined) params.push(`corregoId=${filtro.corregoId}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return comFallback(
    async () => (await chamarApi<Bruto[]>(`/alertas${query}`)).map(normalizarAlerta),
    () => mockAlertas(filtro)
  );
}

/** POST /api/moradores (novo) ou PUT /api/moradores/{id} (atualização). */
export function enviarMorador(
  dados: Omit<Morador, 'id' | 'criadoEm'>,
  remoteId: number | null
): Promise<Resultado<Morador>> {
  return comFallback(
    () =>
      remoteId
        ? chamarApi<Morador>(`/moradores/${remoteId}`, { method: 'PUT', body: JSON.stringify(dados) })
        : chamarApi<Morador>('/moradores', { method: 'POST', body: JSON.stringify(dados) }),
    () => mockSalvarMorador(dados, remoteId)
  );
}
