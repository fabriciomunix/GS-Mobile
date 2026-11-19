import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { cores, espaco } from '../theme';

interface Props {
  children: React.ReactNode;
  atualizando?: boolean;
  onAtualizar?: () => void;
}

/** Contêiner rolável padrão das telas (com "puxar para atualizar" opcional). */
export function Tela({ children, atualizando = false, onAtualizar }: Props) {
  return (
    <ScrollView
      style={estilos.fundo}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onAtualizar ? (
          <RefreshControl refreshing={atualizando} onRefresh={onAtualizar} accessibilityLabel="Puxe para atualizar" />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl * 2 },
});
