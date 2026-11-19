import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Alert, Linking, Share, StyleSheet, View } from 'react-native';
import { Botao } from '../../src/components/Botao';
import { Cartao } from '../../src/components/Cartao';
import { SeloRisco } from '../../src/components/SeloRisco';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { obterMorador } from '../../src/database';
import { espaco, cores } from '../../src/theme';
import type { MoradorLocal, NivelRisco, TipoNecessidade } from '../../src/types';
import { INFO_RISCO } from '../../src/utils/risco';

const NECESSIDADE_TEXTO: Record<TipoNecessidade, string> = {
  NENHUMA: '',
  IDOSO: 'Sou uma pessoa idosa.',
  CADEIRANTE: 'Uso cadeira de rodas.',
  ACAMADO: 'Há uma pessoa acamada na casa.',
  OUTRA: 'Tenho uma necessidade especial.',
};

const NIVEIS: NivelRisco[] = ['ATENCAO', 'ALERTA', 'CRITICO'];

async function ligar(numero: string, servico: string) {
  try {
    await Linking.openURL(`tel:${numero}`);
  } catch {
    Alert.alert('Não foi possível ligar', `Ligue manualmente para ${numero} (${servico}).`);
  }
}

export default function Ajuda() {
  const [morador, setMorador] = useState<MoradorLocal | null>(null);

  useFocusEffect(
    useCallback(() => {
      obterMorador().then(setMorador).catch(() => setMorador(null));
    }, [])
  );

  async function avisarAlguem() {
    const partes = ['Preciso de ajuda para sair de casa por causa do alagamento do córrego.'];
    if (morador) {
      partes.push(`Endereço: ${morador.endereco}.`);
      if (NECESSIDADE_TEXTO[morador.tipoNecessidade]) partes.push(NECESSIDADE_TEXTO[morador.tipoNecessidade]);
      partes.push(`Meu telefone: ${morador.telefone}.`);
    }
    partes.push('(Mensagem enviada pelo app Alerta Córrego)');
    try {
      await Share.share({ message: partes.join(' ') });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente ligar para um vizinho ou familiar.');
    }
  }

  return (
    <Tela>
      <Texto variante="titulo">Em perigo? Ligue agora</Texto>

      <Botao
        titulo="Ligar 199 — Defesa Civil"
        icone="call"
        variante="perigo"
        grande
        onPress={() => ligar('199', 'Defesa Civil')}
        rotuloAcessivel="Ligar para 199, Defesa Civil"
        dica="Abre o telefone já com o número 199"
      />
      <Botao
        titulo="Ligar 193 — Bombeiros"
        icone="call"
        variante="perigo"
        grande
        onPress={() => ligar('193', 'Corpo de Bombeiros')}
        rotuloAcessivel="Ligar para 193, Corpo de Bombeiros"
        dica="Abre o telefone já com o número 193"
      />
      <Botao
        titulo="Ligar 192 — SAMU"
        icone="call"
        variante="secundario"
        onPress={() => ligar('192', 'SAMU')}
        rotuloAcessivel="Ligar para 192, SAMU, para emergência de saúde"
        dica="Abre o telefone já com o número 192"
      />
      <Botao
        titulo="Avisar um vizinho ou familiar"
        icone="share-social"
        variante="secundario"
        onPress={avisarAlguem}
        dica="Abre o WhatsApp, SMS ou outro app com uma mensagem pedindo ajuda e seu endereço"
      />
      {morador?.prioritario ? (
        <Texto variante="pequeno" style={estilos.nota}>
          Você está cadastrado como pessoa que precisa de ajuda para sair. A mensagem já inclui seu endereço.
        </Texto>
      ) : null}

      <Texto variante="subtitulo" style={estilos.secao}>
        O que fazer
      </Texto>
      {NIVEIS.map((n) => (
        <Cartao key={n} style={estilos.passo}>
          <SeloRisco nivel={n} />
          <Texto>{INFO_RISCO[n].oQueFazer}</Texto>
        </Cartao>
      ))}

      <Texto variante="subtitulo" style={estilos.secao}>
        Dicas importantes
      </Texto>
      <Cartao>
        {[
          'Não atravesse ruas alagadas, nem a pé nem de carro. 30 cm de água já podem arrastar uma pessoa.',
          'Desligue a energia elétrica e o gás antes de sair, se for seguro.',
          'Leve documentos, remédios, água e carregador em um saco plástico.',
          'Vá para um lugar alto e longe do córrego. Ajude vizinhos idosos e com deficiência.',
          'Não volte para casa até a Defesa Civil dizer que é seguro.',
          'Receba alertas oficiais: envie seu CEP por SMS para 40199 (Defesa Civil).',
        ].map((dica) => (
          <View key={dica} style={estilos.dica}>
            <Ionicons name="checkmark-circle" size={24} color={cores.sucesso} />
            <Texto style={estilos.flex}>{dica}</Texto>
          </View>
        ))}
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  secao: { marginTop: espaco.lg, marginBottom: espaco.sm },
  passo: { gap: espaco.sm },
  nota: { marginTop: espaco.xs },
  dica: { flexDirection: 'row', gap: espaco.sm, marginBottom: espaco.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
});
