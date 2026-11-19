const dois = (n: number) => String(n).padStart(2, '0');

/** "19/11 às 14:05" — formatação manual (não depende de Intl). */
export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return 'sem informação';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'sem informação';
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)} às ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

/** Versão para leitores de tela: "dia 19/11, às 14 horas e 05 minutos". */
export function dataHoraFalada(iso: string | null | undefined): string {
  if (!iso) return 'sem informação de horário';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'sem informação de horário';
  return `dia ${dois(d.getDate())}/${dois(d.getMonth() + 1)}, às ${d.getHours()} horas e ${dois(d.getMinutes())} minutos`;
}

export function formatarNumero(valor: number, casas = 0): string {
  return valor.toFixed(casas).replace('.', ',');
}

/** Mantém só dígitos, para validar telefone. */
export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}
