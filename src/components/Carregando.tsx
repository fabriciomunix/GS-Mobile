import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { cores, espaco } from '../theme';
import { Texto } from './Texto';

export function Carregando({ mensagem = 'Carregando informações...' }: { mensagem?: string }) {
  return (
    <View style={estilos.caixa} accessible accessibilityRole="progressbar" accessibilityLabel={mensagem} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={cores.primaria} />
      <Texto style={estilos.texto}>{mensagem}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { alignItems: 'center', padding: espaco.lg, gap: espaco.sm },
  texto: { textAlign: 'center' },
});
