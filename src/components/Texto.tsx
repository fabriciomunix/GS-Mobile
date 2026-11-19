import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { cores, fontes, MAX_ESCALA_FONTE } from '../theme';

type Variante = 'corpo' | 'titulo' | 'subtitulo' | 'destaque' | 'pequeno';

interface Props extends TextProps {
  variante?: Variante;
  cor?: string;
  negrito?: boolean;
}

/** Texto padrão do app: fonte base 18, contraste forte e respeita a escala de fonte do sistema. */
export function Texto({ variante = 'corpo', cor, negrito, style, ...rest }: Props) {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={MAX_ESCALA_FONTE}
      accessibilityRole={variante === 'titulo' || variante === 'subtitulo' ? 'header' : undefined}
      style={[estilos[variante], cor ? { color: cor } : null, negrito ? estilos.negrito : null, style]}
      {...rest}
    />
  );
}

const estilos = StyleSheet.create({
  corpo: { fontSize: fontes.base, lineHeight: fontes.base * 1.4, color: cores.texto },
  pequeno: { fontSize: fontes.pequena, lineHeight: fontes.pequena * 1.4, color: cores.textoSecundario },
  destaque: { fontSize: fontes.media, lineHeight: fontes.media * 1.35, color: cores.texto, fontWeight: '600' },
  subtitulo: { fontSize: fontes.grande, lineHeight: fontes.grande * 1.3, color: cores.texto, fontWeight: '700' },
  titulo: { fontSize: fontes.titulo, lineHeight: fontes.titulo * 1.25, color: cores.texto, fontWeight: '800' },
  negrito: { fontWeight: '700' },
});
