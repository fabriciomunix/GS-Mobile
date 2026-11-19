import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { Origem } from '../services/api';
import { cores, espaco } from '../theme';
import { Texto } from './Texto';

/** Aviso exibido quando a API não respondeu e o app está mostrando dados de demonstração. */
export function AvisoOffline({ origem }: { origem: Origem }) {
  if (origem !== 'mock') return null;
  const mensagem = 'Sem conexão com o servidor. Mostrando dados de demonstração.';
  return (
    <View style={estilos.caixa} accessible accessibilityRole="alert" accessibilityLabel={mensagem} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline" size={26} color={cores.avisoTexto} />
      <Texto cor={cores.avisoTexto} style={estilos.texto}>
        {mensagem}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.avisoFundo,
    borderColor: cores.avisoTexto,
    borderWidth: 1,
    borderRadius: 10,
    padding: espaco.sm,
    marginBottom: espaco.md,
  },
  texto: { flex: 1 },
});
