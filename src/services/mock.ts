/**
 * Dados de demonstração (mock) — usados automaticamente quando a API está fora do ar
 * ou não foi configurada. Seguem o mesmo seed descrito na FICHA.md:
 * 2 córregos, 1 sensor cada, 6 moradores fictícios (3 prioritários) e algumas leituras.
 *
 * Também há uma pequena SIMULAÇÃO: cada toque em "Atualizar" no modo demonstração
 * gera uma nova leitura para o córrego, para mostrar todas as cores de risco no vídeo.
 */
import type { Alerta, Corrego, Leitura, Morador, Sensor, StatusCorrego } from '../types';
import { classificarRisco, geraAlerta, mensagemAlerta } from '../utils/risco';

const MINUTO = 60 * 1000;
const minutosAtras = (min: number) => new Date(Date.now() - min * MINUTO).toISOString();

const corregos: Corrego[] = [
  {
    id: 1,
    nome: 'Córrego Ponte Baixa',
    bairro: "M'Boi Mirim",
    latitude: -23.6766,
    longitude: -46.7676,
    nivelAlertaCm: 120,
    nivelCriticoCm: 180,
  },
  {
    id: 2,
    nome: 'Córrego Morro do S',
    bairro: 'Campo Limpo',
    latitude: -23.6489,
    longitude: -46.7612,
    nivelAlertaCm: 100,
    nivelCriticoCm: 160,
  },
];

const sensores: Sensor[] = [
  { id: 1, codigo: 'ESP32-PB-01', corregoId: 1, ativo: true, instaladoEm: '2025-09-01T10:00:00.000Z' },
  { id: 2, codigo: 'ESP32-MS-01', corregoId: 2, ativo: true, instaladoEm: '2025-09-02T10:00:00.000Z' },
];

let proximoIdLeitura = 1;
const leituras: Leitura[] = [];
function addLeitura(sensorId: number, nivelAguaCm: number, chuvaMmHora: number, registradaEm: string): Leitura {
  const l: Leitura = { id: proximoIdLeitura++, sensorId, nivelAguaCm, chuvaMmHora, registradaEm };
  leituras.push(l);
  return l;
}

// Ponte Baixa: água subindo na última hora (termina em ALERTA).
[
  [70, 5, 70],
  [78, 12, 60],
  [86, 22, 50],
  [95, 31, 40],
  [104, 35, 30],
  [113, 38, 20],
  [121, 40, 10],
  [128, 38, 2],
].forEach(([n, c, min]) => addLeitura(1, n, c, minutosAtras(min)));

// Morro do S: tranquilo (NORMAL).
[
  [40, 2, 60],
  [42, 3, 40],
  [44, 4, 20],
  [45, 4, 3],
].forEach(([n, c, min]) => addLeitura(2, n, c, minutosAtras(min)));

let proximoIdAlerta = 3;
const alertas: Alerta[] = [
  {
    id: 1,
    corregoId: 2,
    nivelRisco: 'ALERTA',
    mensagem: mensagemAlerta('ALERTA', 'Córrego Morro do S', 104),
    nivelAguaCm: 104,
    criadoEm: minutosAtras(60 * 26),
    ativo: false,
  },
  {
    id: 2,
    corregoId: 1,
    nivelRisco: 'ALERTA',
    mensagem: mensagemAlerta('ALERTA', 'Córrego Ponte Baixa', 121),
    nivelAguaCm: 121,
    criadoEm: minutosAtras(10),
    ativo: true,
  },
];

let proximoIdMorador = 7;
const moradores: Morador[] = [
  { id: 1, nome: 'Maria Aparecida (fictícia)', telefone: '11900000001', endereco: 'Rua das Flores, 10', corregoId: 1, prioritario: true, tipoNecessidade: 'IDOSO', criadoEm: minutosAtras(60 * 24 * 30) },
  { id: 2, nome: 'João Pereira (fictício)', telefone: '11900000002', endereco: 'Rua das Flores, 25', corregoId: 1, prioritario: true, tipoNecessidade: 'CADEIRANTE', criadoEm: minutosAtras(60 * 24 * 29) },
  { id: 3, nome: 'Ana Souza (fictícia)', telefone: '11900000003', endereco: 'Travessa do Córrego, 3', corregoId: 1, prioritario: false, tipoNecessidade: 'NENHUMA', criadoEm: minutosAtras(60 * 24 * 28) },
  { id: 4, nome: 'Seu Antônio (fictício)', telefone: '11900000004', endereco: 'Rua do Morro, 200', corregoId: 2, prioritario: true, tipoNecessidade: 'ACAMADO', criadoEm: minutosAtras(60 * 24 * 27) },
  { id: 5, nome: 'Carla Lima (fictícia)', telefone: '11900000005', endereco: 'Rua do Morro, 210', corregoId: 2, prioritario: false, tipoNecessidade: 'NENHUMA', criadoEm: minutosAtras(60 * 24 * 26) },
  { id: 6, nome: 'Pedro Santos (fictício)', telefone: '11900000006', endereco: 'Rua Campo Limpo, 5', corregoId: 2, prioritario: false, tipoNecessidade: 'NENHUMA', criadoEm: minutosAtras(60 * 24 * 25) },
];

// Cenário de simulação (nível cm, chuva mm/h) — percorre NORMAL → CRÍTICO → NORMAL.
const CENARIO: Array<[number, number]> = [
  [150, 45], // ALERTA
  [186, 60], // CRÍTICO
  [165, 30], // ALERTA
  [110, 12], // ATENÇÃO
  [80, 4], // NORMAL
  [92, 34], // ATENÇÃO (pela chuva)
  [128, 38], // ALERTA
];
const passoSimulacao: Record<number, number> = {};

const clonar = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function sensorDoCorrego(corregoId: number): Sensor | undefined {
  return sensores.find((s) => s.corregoId === corregoId);
}

function leiturasDoCorrego(corregoId: number): Leitura[] {
  const idsSensores = sensores.filter((s) => s.corregoId === corregoId).map((s) => s.id);
  return leituras
    .filter((l) => idsSensores.includes(l.sensorId))
    .sort((a, b) => b.registradaEm.localeCompare(a.registradaEm));
}

export function mockListarCorregos(): Corrego[] {
  return clonar(corregos);
}

export function mockObterCorrego(id: number): Corrego | null {
  const c = corregos.find((x) => x.id === id);
  return c ? clonar(c) : null;
}

export function mockStatus(corregoId: number): StatusCorrego {
  const corrego = corregos.find((c) => c.id === corregoId) ?? corregos[0];
  const ultima = leiturasDoCorrego(corrego.id)[0] ?? null;
  const nivel = ultima?.nivelAguaCm ?? 0;
  const chuva = ultima?.chuvaMmHora ?? 0;
  return {
    corregoId: corrego.id,
    nivelAguaCm: nivel,
    chuvaMmHora: chuva,
    nivelRisco: classificarRisco(nivel, chuva, corrego),
    registradaEm: ultima?.registradaEm ?? null,
    ultimaLeitura: ultima ? clonar(ultima) : null,
  };
}

export function mockLeituras(corregoId: number, limite = 10): Leitura[] {
  return clonar(leiturasDoCorrego(corregoId).slice(0, limite));
}

export function mockAlertas(filtro: { ativos?: boolean; corregoId?: number } = {}): Alerta[] {
  return clonar(
    alertas
      .filter((a) => (filtro.ativos ? a.ativo : true))
      .filter((a) => (filtro.corregoId ? a.corregoId === filtro.corregoId : true))
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  );
}

export function mockSalvarMorador(dados: Omit<Morador, 'id' | 'criadoEm'>, id?: number | null): Morador {
  const existente = id ? moradores.find((m) => m.id === id) : undefined;
  if (existente) {
    Object.assign(existente, dados);
    return clonar(existente);
  }
  const novo: Morador = { ...dados, id: proximoIdMorador++, criadoEm: new Date().toISOString() };
  moradores.push(novo);
  return clonar(novo);
}

/**
 * Simula o ESP32 enviando uma nova leitura (como um POST /api/leituras).
 * Aplica a mesma regra da API: ALERTA/CRÍTICO gera um Alerta ativo; ao voltar
 * para NORMAL/ATENÇÃO, os alertas ativos do córrego são encerrados.
 */
export function mockSimularNovaLeitura(corregoId: number): Leitura | null {
  const corrego = corregos.find((c) => c.id === corregoId);
  const sensor = sensorDoCorrego(corregoId);
  if (!corrego || !sensor) return null;

  const passo = passoSimulacao[corregoId] ?? 0;
  passoSimulacao[corregoId] = (passo + 1) % CENARIO.length;
  let [nivel, chuva] = CENARIO[passo];
  if (corregoId !== 1) {
    // outros córregos: mesma curva, proporcional aos limites
    const fator = corrego.nivelAlertaCm / 120;
    nivel = Math.round(nivel * fator);
  }

  const leitura = addLeitura(sensor.id, nivel, chuva, new Date().toISOString());
  const risco = classificarRisco(nivel, chuva, corrego);

  alertas.filter((a) => a.corregoId === corregoId && a.ativo).forEach((a) => (a.ativo = false));
  if (geraAlerta(risco)) {
    alertas.push({
      id: proximoIdAlerta++,
      corregoId,
      nivelRisco: risco,
      mensagem: mensagemAlerta(risco, corrego.nome, nivel),
      nivelAguaCm: nivel,
      criadoEm: leitura.registradaEm,
      ativo: true,
    });
  }
  return clonar(leitura);
}
