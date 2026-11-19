import type { Corrego, NivelRisco } from '../types';

/**
 * Regra de classificação de risco — IGUAL em todas as partes (Mobile, SOA, C#):
 * - nível >= nivelCriticoCm                         → CRITICO
 * - nível >= nivelAlertaCm                          → ALERTA
 * - nível >= 0.75 × nivelAlertaCm ou chuva >= 30 mm/h → ATENCAO
 * - caso contrário                                  → NORMAL
 */
export const CHUVA_ATENCAO_MM_HORA = 30;
export const FATOR_ATENCAO = 0.75;

export function classificarRisco(
  nivelAguaCm: number,
  chuvaMmHora: number,
  limites: Pick<Corrego, 'nivelAlertaCm' | 'nivelCriticoCm'>
): NivelRisco {
  if (nivelAguaCm >= limites.nivelCriticoCm) return 'CRITICO';
  if (nivelAguaCm >= limites.nivelAlertaCm) return 'ALERTA';
  if (nivelAguaCm >= FATOR_ATENCAO * limites.nivelAlertaCm || chuvaMmHora >= CHUVA_ATENCAO_MM_HORA) {
    return 'ATENCAO';
  }
  return 'NORMAL';
}

export const ORDEM_RISCO: Record<NivelRisco, number> = {
  NORMAL: 1,
  ATENCAO: 2,
  ALERTA: 3,
  CRITICO: 4,
};

export function geraAlerta(nivel: NivelRisco): boolean {
  return nivel === 'ALERTA' || nivel === 'CRITICO';
}

/** Ícones (Ionicons) para que o risco não seja comunicado só pela cor. */
export type IconeRisco = 'checkmark-circle' | 'eye' | 'warning' | 'alert-circle';

export interface InfoRisco {
  rotulo: string;
  icone: IconeRisco;
  /** frase curta, em linguagem simples */
  resumo: string;
  /** o que a pessoa deve fazer agora */
  oQueFazer: string;
}

export const INFO_RISCO: Record<NivelRisco, InfoRisco> = {
  NORMAL: {
    rotulo: 'NORMAL',
    icone: 'checkmark-circle',
    resumo: 'O córrego está em nível seguro.',
    oQueFazer: 'Nenhuma ação necessária. Fique de olho se começar a chover forte.',
  },
  ATENCAO: {
    rotulo: 'ATENÇÃO',
    icone: 'eye',
    resumo: 'A água está subindo ou chove forte.',
    oQueFazer: 'Separe documentos, remédios e celular carregado. Fique atento ao app.',
  },
  ALERTA: {
    rotulo: 'ALERTA',
    icone: 'warning',
    resumo: 'O córrego pode transbordar em breve.',
    oQueFazer: 'Prepare-se para sair. Se você precisa de ajuda para sair, peça agora.',
  },
  CRITICO: {
    rotulo: 'CRÍTICO',
    icone: 'alert-circle',
    resumo: 'Risco de transbordar agora.',
    oQueFazer: 'Saia de casa e vá para um lugar alto. Ligue 199 (Defesa Civil) ou 193 (Bombeiros).',
  },
};

export function mensagemAlerta(nivel: NivelRisco, corregoNome: string, nivelAguaCm: number): string {
  const info = INFO_RISCO[nivel];
  return `${info.rotulo}: ${corregoNome} com ${Math.round(nivelAguaCm)} cm. ${info.oQueFazer}`;
}
