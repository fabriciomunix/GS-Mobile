import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { Corrego, StatusCorrego } from '../types';
import { coresRisco, espaco, fontes } from '../theme';
import { dataHoraFalada, formatarDataHora, formatarNumero } from '../utils/formatacao';
import { INFO_RISCO, ORDEM_RISCO } from '../utils/risco';
import { Texto } from './Texto';

interface Props {
  status: StatusCorrego;
  corrego?: Corrego | null;
}

/**
 * Cartão grande de risco do córrego.
 * O risco é comunicado por COR + ÍCONE + TEXTO + barra de 4 níveis (não depende só da cor).
 * Para leitores de tela, o cartão é lido como uma única frase.
 */
export function CartaoRisco({ status, corrego }: Props) {
  const info = INFO_RISCO[status.nivelRisco];
  const cor = coresRisco[status.nivelRisco];
  const nivelNumero = ORDEM_RISCO[status.nivelRisco];
  const nome = corrego?.nome ?? `Córrego ${status.corregoId}`;

  const descricaoFalada =
    `${nome}. Risco ${info.rotulo}, nível ${nivelNumero} de 4. ${info.resumo} ` +
    `Água a ${Math.round(status.nivelAguaCm)} centímetros. ` +
    `Chuva de ${formatarNumero(status.chuvaMmHora)} milímetros por hora. ` +
    `Atualizado ${dataHoraFalada(status.registradaEm)}. ${info.oQueFazer}`;

  return (
    <View
      style={[estilos.cartao, { backgroundColor: cor.fundo }]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={descricaoFalada}
      accessibilityLiveRegion="polite"
    >
      <Texto cor={cor.texto} variante="destaque">
        {nome}
      </Texto>

      <View style={estilos.linhaRisco}>
        <Ionicons name={info.icone} size={56} color={cor.texto} />
        <View style={estilos.flex}>
          <Texto cor={cor.texto} style={estilos.rotuloPequeno}>
            RISCO
          </Texto>
          <Texto cor={cor.texto} style={estilos.rotulo}>
            {info.rotulo}
          </Texto>
        </View>
      </View>

      {/* Barra de 4 níveis: mostra a gravidade também pela quantidade de blocos preenchidos */}
      <View style={estilos.barra}>
        {[1, 2, 3, 4].map((n) => (
          <View
            key={n}
            style={[
              estilos.bloco,
              { borderColor: cor.texto },
              n <= nivelNumero ? { backgroundColor: cor.texto } : null,
            ]}
          />
        ))}
      </View>
      <Texto cor={cor.texto} negrito>
        Nível {nivelNumero} de 4 — {info.resumo}
      </Texto>

      <View style={estilos.medidas}>
        <View style={estilos.medida}>
          <Ionicons name="water" size={28} color={cor.texto} />
          <Texto cor={cor.texto} style={estilos.valor}>
            {Math.round(status.nivelAguaCm)} cm
          </Texto>
          <Texto cor={cor.texto}>nível da água</Texto>
        </View>
        <View style={estilos.medida}>
          <Ionicons name="rainy" size={28} color={cor.texto} />
          <Texto cor={cor.texto} style={estilos.valor}>
            {formatarNumero(status.chuvaMmHora)} mm/h
          </Texto>
          <Texto cor={cor.texto}>chuva</Texto>
        </View>
      </View>

      {corrego ? (
        <Texto cor={cor.texto}>
          Alerta a partir de {corrego.nivelAlertaCm} cm · Crítico a partir de {corrego.nivelCriticoCm} cm
        </Texto>
      ) : null}

      <View style={estilos.oQueFazer}>
        <Texto cor={cor.texto} negrito>
          O que fazer: {info.oQueFazer}
        </Texto>
      </View>

      <View style={estilos.linhaHora}>
        <Ionicons name="time" size={20} color={cor.texto} />
        <Texto cor={cor.texto}>Última leitura: {formatarDataHora(status.registradaEm)}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    borderRadius: 18,
    padding: espaco.lg,
    marginBottom: espaco.md,
    gap: espaco.sm,
    borderWidth: 2,
    borderColor: '#00000033',
  },
  linhaRisco: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  flex: { flex: 1 },
  rotuloPequeno: { fontSize: fontes.base, fontWeight: '700', letterSpacing: 1 },
  rotulo: { fontSize: fontes.enorme, lineHeight: fontes.enorme * 1.15, fontWeight: '900' },
  barra: { flexDirection: 'row', gap: espaco.xs },
  bloco: { flex: 1, height: 14, borderRadius: 4, borderWidth: 2 },
  medidas: { flexDirection: 'row', gap: espaco.md, marginTop: espaco.sm },
  medida: { flex: 1, alignItems: 'flex-start' },
  valor: { fontSize: fontes.titulo, lineHeight: fontes.titulo * 1.2, fontWeight: '800' },
  oQueFazer: { borderTopWidth: 1, borderTopColor: '#00000040', paddingTop: espaco.sm, marginTop: espaco.xs },
  linhaHora: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs },
});
