import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Alert, StyleSheet } from 'react-native';
import { AvisoOffline } from '../../src/components/AvisoOffline';
import { Botao } from '../../src/components/Botao';
import { Carregando } from '../../src/components/Carregando';
import { Cartao } from '../../src/components/Cartao';
import { ItemAlerta } from '../../src/components/ItemAlerta';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { encerrarAusentes, limparHistorico, listarHistorico, salvarAlertas } from '../../src/database';
import { forcarNovaTentativa, listarAlertas, listarCorregos, type Origem } from '../../src/services/api';
import { espaco } from '../../src/theme';
import type { Alerta, AlertaHistorico } from '../../src/types';
import { ORDEM_RISCO } from '../../src/utils/risco';

export default function Alertas() {
  const [ativos, setAtivos] = useState<Alerta[]>([]);
  const [nomes, setNomes] = useState<Record<number, string>>({});
  const [historico, setHistorico] = useState<AlertaHistorico[]>([]);
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
      const mapaNomes: Record<number, string> = {};
      resCorregos.dados.forEach((c) => (mapaNomes[c.id] = c.nome));

      const resAlertas = await listarAlertas({ ativos: true });
      const lista = [...resAlertas.dados].sort(
        (a, b) => ORDEM_RISCO[b.nivelRisco] - ORDEM_RISCO[a.nivelRisco] || b.criadoEm.localeCompare(a.criadoEm)
      );

      // Cache offline: salva no SQLite e marca como encerrados os que saíram da lista de ativos
      await salvarAlertas(lista, mapaNomes);
      await encerrarAusentes(lista.map((a) => a.id));

      setNomes(mapaNomes);
      setAtivos(lista);
      setOrigem(resAlertas.origem);
      setHistorico(await listarHistorico());
    } catch {
      // Sem conexão e sem mock? Mostra pelo menos o histórico local.
      setHistorico(await listarHistorico().catch(() => []));
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

  function confirmarLimpeza() {
    Alert.alert('Limpar histórico', 'Apagar o histórico de alertas salvo neste celular?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await limparHistorico();
          setHistorico([]);
          AccessibilityInfo.announceForAccessibility('Histórico apagado.');
        },
      },
    ]);
  }

  return (
    <Tela atualizando={atualizando} onAtualizar={() => carregar(true)}>
      <Texto variante="titulo">Alertas</Texto>
      <AvisoOffline origem={origem} />

      <Botao
        titulo="Atualizar alertas"
        icone="refresh"
        carregando={atualizando}
        onPress={() => carregar(true)}
        dica="Busca os alertas ativos no servidor"
      />

      <Texto variante="subtitulo" style={estilos.secao}>
        Alertas ativos agora ({ativos.length})
      </Texto>
      {carregando ? <Carregando mensagem="Buscando alertas..." /> : null}
      {!carregando && ativos.length === 0 ? (
        <Cartao>
          <Texto>Nenhum alerta ativo no momento. Os córregos estão sem risco de transbordar.</Texto>
        </Cartao>
      ) : null}
      {ativos.map((a) => (
        <ItemAlerta
          key={`ativo-${a.id}`}
          corregoNome={nomes[a.corregoId] ?? `Córrego ${a.corregoId}`}
          nivelRisco={a.nivelRisco}
          mensagem={a.mensagem}
          nivelAguaCm={a.nivelAguaCm}
          criadoEm={a.criadoEm}
          ativo={a.ativo}
        />
      ))}

      <Texto variante="subtitulo" style={estilos.secao}>
        Histórico salvo no celular
      </Texto>
      <Texto variante="pequeno" style={estilos.explicacao}>
        Estes alertas ficam guardados no celular e podem ser vistos mesmo sem internet.
      </Texto>
      {historico.length === 0 ? (
        <Cartao>
          <Texto>Nenhum alerta recebido ainda.</Texto>
        </Cartao>
      ) : (
        historico.map((h) => (
          <ItemAlerta
            key={`hist-${h.id}`}
            corregoNome={h.corregoNome}
            nivelRisco={h.nivelRisco}
            mensagem={h.mensagem}
            nivelAguaCm={h.nivelAguaCm}
            criadoEm={h.criadoEm}
            ativo={h.ativo}
          />
        ))
      )}
      {historico.length > 0 ? (
        <Botao
          titulo="Limpar histórico"
          icone="trash"
          variante="secundario"
          onPress={confirmarLimpeza}
          dica="Pede confirmação e apaga os alertas guardados no celular"
        />
      ) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  secao: { marginTop: espaco.lg, marginBottom: espaco.sm },
  explicacao: { marginBottom: espaco.sm },
});
