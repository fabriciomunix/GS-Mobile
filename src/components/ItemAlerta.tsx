import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NivelRisco } from '../types';
import { coresRisco, espaco } from '../theme';
import { dataHoraFalada, formatarDataHora } from '../utils/formatacao';
import { INFO_RISCO } from '../utils/risco';
import { Cartao } from './Cartao';
import { SeloRisco } from './SeloRisco';
import { Texto } from './Texto';

interface Props {
  corregoNome: string;
  nivelRisco: NivelRisco;
  mensagem: string;
  nivelAguaCm: number;
  criadoEm: string;
  ativo: boolean;
}

export function ItemAlerta({ corregoNome, nivelRisco, mensagem, nivelAguaCm, criadoEm, ativo }: Props) {
  const situacao = ativo ? 'Alerta ativo' : 'Alerta encerrado';
  return (
    <Cartao
      style={[estilos.item, { borderLeftColor: coresRisco[nivelRisco].fundo }]}
      accessible
      accessibilityLabel={`${situacao}. ${corregoNome}. Risco ${INFO_RISCO[nivelRisco].rotulo}. ${mensagem}. Água a ${Math.round(nivelAguaCm)} centímetros, ${dataHoraFalada(criadoEm)}.`}
    >
      <View style={estilos.topo}>
        <SeloRisco nivel={nivelRisco} />
        <Texto variante="pequeno" negrito>
          {ativo ? 'ATIVO' : 'ENCERRADO'}
        </Texto>
      </View>
      <Texto variante="destaque">{corregoNome}</Texto>
      <Texto>{mensagem}</Texto>
      <Texto variante="pequeno">
        {Math.round(nivelAguaCm)} cm · {formatarDataHora(criadoEm)}
      </Texto>
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  item: { borderLeftWidth: 10, gap: espaco.xs },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
