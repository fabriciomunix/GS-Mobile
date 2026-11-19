// Tipos de domínio — espelham o modelo comum da FICHA.md (mesmos nomes no SOA e no C#).

export type NivelRisco = 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'CRITICO';

export type TipoNecessidade = 'NENHUMA' | 'IDOSO' | 'CADEIRANTE' | 'ACAMADO' | 'OUTRA';

export interface Corrego {
  id: number;
  nome: string;
  bairro: string;
  latitude: number;
  longitude: number;
  nivelAlertaCm: number;
  nivelCriticoCm: number;
}

export interface Sensor {
  id: number;
  codigo: string;
  corregoId: number;
  ativo: boolean;
  instaladoEm: string;
}

export interface Leitura {
  id: number;
  sensorId: number;
  nivelAguaCm: number;
  chuvaMmHora: number;
  registradaEm: string;
}

export interface Morador {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  corregoId: number;
  prioritario: boolean;
  tipoNecessidade: TipoNecessidade;
  criadoEm: string;
}

export interface Alerta {
  id: number;
  corregoId: number;
  nivelRisco: NivelRisco;
  mensagem: string;
  nivelAguaCm: number;
  criadoEm: string;
  ativo: boolean;
}

/** Resposta de GET /api/corregos/{id}/status */
export interface StatusCorrego {
  corregoId: number;
  nivelAguaCm: number;
  chuvaMmHora: number;
  nivelRisco: NivelRisco;
  registradaEm: string | null;
  ultimaLeitura: Leitura | null;
}

/** Cadastro do próprio morador, salvo no SQLite do celular. */
export interface MoradorLocal {
  nome: string;
  telefone: string;
  endereco: string;
  corregoId: number;
  prioritario: boolean;
  tipoNecessidade: TipoNecessidade;
  /** id do morador na API (quando o envio ao servidor deu certo) */
  remoteId: number | null;
  atualizadoEm: string;
}

/** Córrego favorito/monitorado salvo no SQLite. */
export interface CorregoFavorito {
  corregoId: number;
  nome: string;
  bairro: string;
  adicionadoEm: string;
}

/** Alerta guardado no histórico local (cache offline). */
export interface AlertaHistorico extends Alerta {
  corregoNome: string;
  recebidoEm: string;
}
