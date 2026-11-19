import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { AvisoOffline } from '../../src/components/AvisoOffline';
import { Botao } from '../../src/components/Botao';
import { Carregando } from '../../src/components/Carregando';
import { Cartao } from '../../src/components/Cartao';
import { CartaoRisco } from '../../src/components/CartaoRisco';
import { SeloRisco } from '../../src/components/SeloRisco';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { alternarFavorito, ehFavorito } from '../../src/database';
import {
  forcarNovaTentativa,
  listarLeituras,
  obterCorrego,
  obterStatus,
  type Origem,
} from '../../src/services/api';
import { cores, espaco } from '../../src/theme';
import type { Corrego, Leitura, StatusCorrego } from '../../src/types';
import { dataHoraFalada, formatarDataHora, formatarNumero } from '../../src/utils/formatacao';
import { classificarRisco, INFO_RISCO } from '../../src/utils/risco';

export default function DetalheCorrego() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const corregoId = Number(id);

  const [corrego, setCorrego] = useState<Corrego | null>(null);
  const [status, setStatus] = useState<StatusCorrego | null>(null);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [favorito, setFavorito] = useState(false);
  const [origem, setOrigem] = useState<Origem>('api');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(
    async (manual: boolean) => {
      if (!Number.isFinite(corregoId)) return;
      if (manual) {
        setAtualizando(true);
        forcarNovaTentativa();
      }
      try {
        const resCorrego = await obterCorrego(corregoId);
        const resStatus = await obterStatus(corregoId, { corrego: resCorrego.dados, simularNovaLeitura: manual });
        const resLeituras = await listarLeituras(corregoId, 10);
        setCorrego(resCorrego.dados);
        setStatus(resStatus.dados);
        setLeituras(resLeituras.dados);
        setFavorito(await ehFavorito(corregoId));
        setOrigem([resCorrego, resStatus, resLeituras].some((r) => r.origem === 'mock') ? 'mock' : 'api');
        if (manual) {
          AccessibilityInfo.announceForAccessibility(`Atualizado. Risco ${INFO_RISCO[resStatus.dados.nivelRisco].rotulo}.`);
        }
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [corregoId]
  );

  useFocusEffect(
    useCallback(() => {
      carregar(false);
    }, [carregar])
  );

  async function onFavorito() {
    if (!corrego) return;
    const agora = await alternarFavorito(corrego);
    setFavorito(agora);
    AccessibilityInfo.announceForAccessibility(agora ? 'Córrego monitorado.' : 'Córrego removido dos monitorados.');
  }

  return (
    <Tela atualizando={atualizando} onAtualizar={() => carregar(true)}>
      <Stack.Screen options={{ title: corrego?.nome ?? 'Detalhes do córrego' }} />
      <AvisoOffline origem={origem} />

      {carregando ? (
        <Carregando />
      ) : !corrego ? (
        <Texto>Córrego não encontrado.</Texto>
      ) : (
        <>
          {status ? <CartaoRisco status={status} corrego={corrego} /> : null}

          <Botao
            titulo="Atualizar"
            icone="refresh"
            grande
            carregando={atualizando}
            onPress={() => carregar(true)}
            dica="Busca a leitura mais recente do sensor"
          />
          <Botao
            titulo={favorito ? 'Deixar de monitorar' : 'Monitorar este córrego'}
            icone={favorito ? 'star' : 'star-outline'}
            variante="secundario"
            onPress={onFavorito}
            dica="Salva ou remove este córrego da sua lista no celular"
          />

          <Cartao style={estilos.info}>
            <Texto variante="subtitulo">Sobre o córrego</Texto>
            <Texto>Bairro: {corrego.bairro}</Texto>
            <Texto>Nível de alerta: {corrego.nivelAlertaCm} cm</Texto>
            <Texto>Nível crítico: {corrego.nivelCriticoCm} cm</Texto>
          </Cartao>

          <Texto variante="subtitulo" style={estilos.tituloSecao}>
            Leituras recentes
          </Texto>
          {leituras.length === 0 ? <Texto>Nenhuma leitura registrada.</Texto> : null}
          {leituras.map((l) => {
            const risco = classificarRisco(l.nivelAguaCm, l.chuvaMmHora, corrego);
            return (
              <View
                key={l.id}
                style={estilos.leitura}
                accessible
                accessibilityLabel={`Leitura ${dataHoraFalada(l.registradaEm)}: água a ${Math.round(
                  l.nivelAguaCm
                )} centímetros, chuva de ${formatarNumero(l.chuvaMmHora)} milímetros por hora, risco ${INFO_RISCO[risco].rotulo}.`}
              >
                <View style={estilos.leituraTopo}>
                  <Ionicons name="time" size={20} color={cores.textoSecundario} />
                  <Texto negrito>{formatarDataHora(l.registradaEm)}</Texto>
                </View>
                <Texto>
                  Água: {Math.round(l.nivelAguaCm)} cm · Chuva: {formatarNumero(l.chuvaMmHora)} mm/h
                </Texto>
                <SeloRisco nivel={risco} />
              </View>
            );
          })}
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  info: { marginTop: espaco.md, gap: espaco.xs },
  tituloSecao: { marginBottom: espaco.sm },
  leitura: {
    backgroundColor: cores.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9CED6',
    padding: espaco.md,
    marginBottom: espaco.sm,
    gap: espaco.xs,
  },
  leituraTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs },
});
