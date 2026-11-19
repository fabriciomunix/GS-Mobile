import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { NivelRisco } from '../types';
import { coresRisco, espaco } from '../theme';
import { INFO_RISCO } from '../utils/risco';
import { Texto } from './Texto';

/** Selo pequeno de risco: cor + ícone + texto (nunca só cor). */
export function SeloRisco({ nivel }: { nivel: NivelRisco }) {
  const info = INFO_RISCO[nivel];
  const cor = coresRisco[nivel];
  return (
    <View
      style={[estilos.selo, { backgroundColor: cor.fundo }]}
      accessible
      accessibilityLabel={`Risco ${info.rotulo}`}
    >
      <Ionicons name={info.icone} size={20} color={cor.texto} />
      <Texto cor={cor.texto} negrito>
        {info.rotulo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.xs,
    paddingHorizontal: espaco.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#00000055',
  },
});
