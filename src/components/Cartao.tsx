import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { cores, espaco } from '../theme';

export function Cartao({ style, ...rest }: ViewProps) {
  return <View style={[estilos.cartao, style]} {...rest} />;
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9CED6',
    padding: espaco.md,
    marginBottom: espaco.md,
  },
});
