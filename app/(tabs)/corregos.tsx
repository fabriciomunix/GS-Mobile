import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { AvisoOffline } from '../../src/components/AvisoOffline';
import { Carregando } from '../../src/components/Carregando';
import { SeloRisco } from '../../src/components/SeloRisco';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { alternarFavorito, listarFavoritos } from '../../src/database';
import { forcarNovaTentativa, listarCorregos, obterStatus, type Origem } from '../../src/services/api';
import { cores, espaco, TOQUE_MINIMO } from '../../src/theme';
import type { Corrego, StatusCorrego } from '../../src/types';
import { INFO_RISCO } from '../../src/utils/risco';

interface ItemLista {
  corrego: Corrego;
  status: StatusCorrego | null;
  favorito: boolean;
}

export default function Corregos() {
  const [itens, setItens] = useState<ItemLista[]>([]);
  const [origem, setOrigem] = useState<Origem>('api');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async (manual: boolean) => {
    if (manual) {
      setAtualizando(true);
      forcarNovaTentativa();
    }
    try {
      const resCorregos = await listarCorregos();
      const favoritos = new Set((await listarFavoritos()).map((f) => f.corregoId));
      const statusLista = await Promise.all(
        resCorregos.dados.map((c) => obterStatus(c.id, { corrego: c }).catch(() => null))
      );
      const lista: ItemLista[] = resCorregos.dados.map((c, i) => ({
        corrego: c,
        status: statusLista[i]?.dados ?? null,
        favorito: favoritos.has(c.id),
      }));
      // Monitorados primeiro
      lista.sort((a, b) => Number(b.favorito) - Number(a.favorito) || a.corrego.nome.localeCompare(b.corrego.nome));
      setItens(lista);
      setOrigem(resCorregos.origem);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(false);
    }, [carregar])
  );

  async function onAlternarFavorito(c: Corrego) {
    const agora = await alternarFavorito(c);
    setItens((atual) => atual.map((it) => (it.corrego.id === c.id ? { ...it, favorito: agora } : it)));
    AccessibilityInfo.announceForAccessibility(
      agora ? `${c.nome} agora está nos seus córregos monitorados.` : `${c.nome} foi removido dos monitorados.`
    );
  }

  return (
    <Tela atualizando={atualizando} onAtualizar={() => carregar(true)}>
      <Texto variante="titulo">Córregos</Texto>
      <Texto style={estilos.intro}>
        Toque em um córrego para ver as leituras. Toque na estrela para monitorar.
      </Texto>
      <AvisoOffline origem={origem} />

      {carregando ? <Carregando mensagem="Carregando córregos..." /> : null}

      {!carregando && itens.length === 0 ? <Texto>Nenhum córrego encontrado.</Texto> : null}

      {itens.map(({ corrego, status, favorito }) => {
        const risco = status ? INFO_RISCO[status.nivelRisco].rotulo : 'sem leitura';
        return (
          <View key={corrego.id} style={estilos.item}>
            <Pressable
              style={({ pressed }) => [estilos.areaPrincipal, pressed && { opacity: 0.8 }]}
              onPress={() => router.push({ pathname: '/corrego/[id]', params: { id: String(corrego.id) } })}
              accessibilityRole="button"
              accessibilityLabel={`${corrego.nome}, bairro ${corrego.bairro}. Risco ${risco}${
                status ? `, água a ${Math.round(status.nivelAguaCm)} centímetros` : ''
              }.${favorito ? ' Monitorado.' : ''}`}
              accessibilityHint="Abre os detalhes e as leituras recentes deste córrego"
            >
              <Texto variante="destaque">{corrego.nome}</Texto>
              <Texto variante="pequeno">{corrego.bairro}</Texto>
              <View style={estilos.linha}>
                {status ? <SeloRisco nivel={status.nivelRisco} /> : <Texto>Sem leitura</Texto>}
                {status ? <Texto negrito>{Math.round(status.nivelAguaCm)} cm</Texto> : null}
                <Ionicons name="chevron-forward" size={24} color={cores.textoSecundario} style={estilos.seta} />
              </View>
            </Pressable>
            <Pressable
              onPress={() => onAlternarFavorito(corrego)}
              style={({ pressed }) => [estilos.estrela, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={favorito ? `Deixar de monitorar ${corrego.nome}` : `Monitorar ${corrego.nome}`}
              accessibilityHint="Salva ou remove este córrego da sua lista no celular"
              accessibilityState={{ selected: favorito }}
              hitSlop={8}
            >
              <Ionicons name={favorito ? 'star' : 'star-outline'} size={32} color={favorito ? '#8A5A00' : cores.borda} />
              <Texto variante="pequeno" style={estilos.textoEstrela}>
                {favorito ? 'Monitorado' : 'Monitorar'}
              </Texto>
            </Pressable>
          </View>
        );
      })}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  intro: { marginBottom: espaco.md },
  item: {
    flexDirection: 'row',
    backgroundColor: cores.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9CED6',
    marginBottom: espaco.md,
    overflow: 'hidden',
  },
  areaPrincipal: { flex: 1, padding: espaco.md, gap: espaco.xs, minHeight: TOQUE_MINIMO },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  seta: { marginLeft: 'auto' },
  estrela: {
    minWidth: 88,
    minHeight: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#C9CED6',
    paddingHorizontal: espaco.sm,
  },
  textoEstrela: { textAlign: 'center' },
});
