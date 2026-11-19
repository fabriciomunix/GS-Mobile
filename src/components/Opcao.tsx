import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { cores, espaco, TOQUE_MINIMO } from '../theme';
import { Texto } from './Texto';

interface Props {
  rotulo: string;
  selecionada: boolean;
  onPress: () => void;
  dica?: string;
}

/** Opção de escolha única (botão de rádio) com área de toque grande. */
export function Opcao({ rotulo, selecionada, onPress, dica }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionada, selected: selecionada }}
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      style={({ pressed }) => [estilos.opcao, selecionada && estilos.selecionada, pressed && { opacity: 0.8 }]}
    >
      <Ionicons
        name={selecionada ? 'radio-button-on' : 'radio-button-off'}
        size={28}
        color={selecionada ? cores.primaria : cores.borda}
      />
      <Texto style={estilos.texto} negrito={selecionada}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  opcao: {
    minHeight: Math.max(TOQUE_MINIMO, 56),
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingHorizontal: espaco.md,
    borderWidth: 2,
    borderColor: '#C9CED6',
    borderRadius: 10,
    marginBottom: espaco.sm,
    backgroundColor: cores.superficie,
  },
  selecionada: { borderColor: cores.primaria, backgroundColor: '#E8F0FB' },
  texto: { flex: 1 },
});
