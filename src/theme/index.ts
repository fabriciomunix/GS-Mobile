import type { NivelRisco } from '../types';

// Cores com contraste forte (texto x fundo ≥ 4,5:1, WCAG AA).
export const cores = {
  fundo: '#F4F6F8',
  superficie: '#FFFFFF',
  texto: '#111111',
  textoSecundario: '#3A3A3A',
  primaria: '#0B4F9C',
  primariaTexto: '#FFFFFF',
  borda: '#5E5E5E',
  perigo: '#B00020',
  perigoTexto: '#FFFFFF',
  sucesso: '#1B6E35',
  avisoFundo: '#FFF4CE',
  avisoTexto: '#3D2E00',
  foco: '#0B4F9C',
};

export interface CoresRisco {
  fundo: string;
  texto: string;
}

/** Verde / amarelo / laranja / vermelho — sempre acompanhados de texto e ícone. */
export const coresRisco: Record<NivelRisco, CoresRisco> = {
  NORMAL: { fundo: '#1B7F3B', texto: '#FFFFFF' },
  ATENCAO: { fundo: '#FFD23F', texto: '#111111' },
  ALERTA: { fundo: '#C2410C', texto: '#FFFFFF' },
  CRITICO: { fundo: '#B00020', texto: '#FFFFFF' },
};

// Fonte base 18 (mínimo pedido). Tamanhos respeitam a escala de fonte do sistema.
export const fontes = {
  pequena: 16,
  base: 18,
  media: 20,
  grande: 24,
  titulo: 28,
  enorme: 40,
};

export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/** Área mínima de toque (Android recomenda 48dp). */
export const TOQUE_MINIMO = 48;

/** Limite de ampliação de fonte para não quebrar o layout (200%). */
export const MAX_ESCALA_FONTE = 2;
