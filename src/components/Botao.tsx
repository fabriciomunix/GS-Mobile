import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { cores, espaco, fontes, TOQUE_MINIMO } from '../theme';
import { Texto } from './Texto';

type Variante = 'primario' | 'secundario' | 'perigo';

interface Props {
  titulo: string;
  onPress: () => void;
  /** O que acontece ao tocar — lido pelo TalkBack/VoiceOver. */
  dica?: string;
  /** Rótulo falado, se diferente do título. */
  rotuloAcessivel?: string;
  icone?: React.ComponentProps<typeof Ionicons>['name'];
  variante?: Variante;
  desabilitado?: boolean;
  carregando?: boolean;
  grande?: boolean;
}

/** Botão acessível: área de toque ≥ 56dp, texto grande, ícone + texto, estado informado ao leitor de tela. */
export function Botao({
  titulo,
  onPress,
  dica,
  rotuloAcessivel,
  icone,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
  grande = false,
}: Props) {
  const tema = TEMAS[variante];
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      hitSlop={8}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: tema.fundo, borderColor: tema.borda },
        grande && estilos.grande,
        pressed && estilos.pressionado,
        inativo && estilos.inativo,
      ]}
    >
      <View style={estilos.conteudo}>
        {icone ? <Ionicons name={icone} size={grande ? 30 : 24} color={tema.texto} accessibilityElementsHidden importantForAccessibility="no" /> : null}
        <Texto
          variante={grande ? 'subtitulo' : 'destaque'}
          cor={tema.texto}
          style={estilos.texto}
          accessibilityRole="none"
        >
          {carregando ? 'Aguarde...' : titulo}
        </Texto>
      </View>
    </Pressable>
  );
}

const TEMAS: Record<Variante, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: cores.primaria, texto: cores.primariaTexto, borda: cores.primaria },
  secundario: { fundo: cores.superficie, texto: cores.primaria, borda: cores.primaria },
  perigo: { fundo: cores.perigo, texto: cores.perigoTexto, borda: cores.perigo },
};

const estilos = StyleSheet.create({
  base: {
    minHeight: Math.max(TOQUE_MINIMO, 56),
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    justifyContent: 'center',
    marginVertical: espaco.xs,
  },
  grande: { minHeight: 72, paddingVertical: espaco.md },
  conteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espaco.sm },
  texto: { textAlign: 'center', fontSize: fontes.media, flexShrink: 1 },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.55 },
});
