import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { cores, espaco, fontes, MAX_ESCALA_FONTE } from '../theme';
import { Texto } from './Texto';

interface Props extends TextInputProps {
  rotulo: string;
  dica?: string;
  erro?: string | null;
}

/** Campo de formulário com rótulo visível, dica e mensagem de erro anunciada ao leitor de tela. */
export function CampoTexto({ rotulo, dica, erro, style, ...rest }: Props) {
  return (
    <View style={estilos.grupo}>
      <Texto negrito nativeID={`rotulo-${rotulo}`}>
        {rotulo}
      </Texto>
      {dica ? <Texto variante="pequeno">{dica}</Texto> : null}
      <TextInput
        accessibilityLabel={rotulo}
        accessibilityHint={dica}
        accessibilityLabelledBy={`rotulo-${rotulo}`}
        allowFontScaling
        maxFontSizeMultiplier={MAX_ESCALA_FONTE}
        placeholderTextColor="#5A5A5A"
        style={[estilos.campo, erro ? estilos.campoErro : null, style]}
        {...rest}
      />
      {erro ? (
        <Texto cor={cores.perigo} negrito accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espaco.md, gap: espaco.xs },
  campo: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    fontSize: fontes.base,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  campoErro: { borderColor: cores.perigo, borderWidth: 3 },
});
