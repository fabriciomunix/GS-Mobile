import React, { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { AvisoOffline } from '../../src/components/AvisoOffline';
import { Botao } from '../../src/components/Botao';
import { Carregando } from '../../src/components/Carregando';
import { Cartao } from '../../src/components/Cartao';
import { CartaoRisco } from '../../src/components/CartaoRisco';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { encerrarAusentes, listarFavoritos, obterMorador, salvarAlertas } from '../../src/database';
import { forcarNovaTentativa, listarAlertas, obterCorrego, obterStatus, type Origem } from '../../src/services/api';
import { cores, espaco } from '../../src/theme';
import type { Alerta, Corrego, MoradorLocal, StatusCorrego } from '../../src/types';
import { INFO_RISCO, ORDEM_RISCO } from '../../src/utils/risco';

const CORREGO_PADRAO = 1;

export default function Inicio() {
  const [morador, setMorador] = useState<MoradorLocal | null>(null);
  const [corrego, setCorrego] = useState<Corrego | null>(null);
  const [status, setStatus] = useState<StatusCorrego | null>(null);
  const [alertaAtivo, setAlertaAtivo] = useState<Alerta | null>(null);
  const [origem, setOrigem] = useState<Origem>('api');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiraCarga = useRef(true);

  const carregar = useCallback(async (manual: boolean) => {
    if (manual) {
      setAtualizando(true);
      forcarNovaTentativa();
    } else if (primeiraCarga.current) {
      setCarregando(true);
    }
    setErro(null);
    try {
      const m = await obterMorador();
      const favoritos = await listarFavoritos();
      const corregoId = m?.corregoId ?? favoritos[0]?.corregoId ?? CORREGO_PADRAO;

      const resCorrego = await obterCorrego(corregoId);
      const resStatus = await obterStatus(corregoId, { corrego: resCorrego.dados, simularNovaLeitura: manual });
      const resAlertas = await listarAlertas({ ativos: true, corregoId });

      // Guarda os alertas recebidos no histórico local (SQLite)
      const nome = resCorrego.dados?.nome ?? `Córrego ${corregoId}`;
      await salvarAlertas(resAlertas.dados, { [corregoId]: nome });
      await encerrarAusentes(
        resAlertas.dados.map((a) => a.id),
        corregoId
      );

      setMorador(m);
      setCorrego(resCorrego.dados);
      setStatus(resStatus.dados);
      setAlertaAtivo(resAlertas.dados[0] ?? null);
      setOrigem(resStatus.origem === 'mock' || resCorrego.origem === 'mock' ? 'mock' : 'api');

      if (manual) {
        AccessibilityInfo.announceForAccessibility(
          `Atualizado. Risco ${INFO_RISCO[resStatus.dados.nivelRisco].rotulo}, água a ${Math.round(resStatus.dados.nivelAguaCm)} centímetros.`
        );
      }
    } catch (e) {
      setErro('Não foi possível carregar as informações. Tente de novo.');
      if (__DEV__) console.warn(e);
    } finally {
      primeiraCarga.current = false;
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(false);
    }, [carregar])
  );

  const riscoAlto = status ? ORDEM_RISCO[status.nivelRisco] >= ORDEM_RISCO.ALERTA : false;

  return (
    <Tela atualizando={atualizando} onAtualizar={() => carregar(true)}>
      <Texto variante="titulo">{morador ? `Olá, ${primeiroNome(morador.nome)}` : 'Olá!'}</Texto>
      <Texto style={estilos.subtitulo}>Veja como está o córrego perto da sua casa.</Texto>

      <AvisoOffline origem={origem} />

      {carregando ? (
        <Carregando mensagem="Buscando o nível do córrego..." />
      ) : erro ? (
        <Cartao accessibilityRole="alert">
          <Texto negrito cor={cores.perigo}>
            {erro}
          </Texto>
        </Cartao>
      ) : status ? (
        <CartaoRisco status={status} corrego={corrego} />
      ) : null}

      <Botao
        titulo="Atualizar"
        icone="refresh"
        grande
        carregando={atualizando}
        onPress={() => carregar(true)}
        dica="Busca a leitura mais recente do sensor do córrego"
      />

      {riscoAlto && morador?.prioritario ? (
        <Cartao style={estilos.cartaoAjuda} accessibilityRole="alert">
          <Texto variante="subtitulo" cor={cores.perigo}>
            Você precisa de ajuda para sair?
          </Texto>
          <Texto>
            No seu cadastro você marcou que precisa de ajuda. Peça ajuda agora, antes de a água subir mais.
          </Texto>
          <Botao
            titulo="Pedir ajuda agora"
            icone="help-buoy"
            variante="perigo"
            onPress={() => router.push('/ajuda')}
            dica="Abre a tela com telefones de emergência e opção de avisar alguém"
          />
        </Cartao>
      ) : null}

      {alertaAtivo ? (
        <Cartao accessible accessibilityLabel={`Alerta ativo: ${alertaAtivo.mensagem}`}>
          <Texto variante="destaque">Alerta ativo</Texto>
          <Texto>{alertaAtivo.mensagem}</Texto>
        </Cartao>
      ) : null}

      {!morador ? (
        <Cartao>
          <Texto variante="destaque">Você ainda não fez seu cadastro</Texto>
          <Texto>
            Cadastre-se para escolher o córrego da sua rua e avisar se você precisa de ajuda para sair de casa.
          </Texto>
          <Botao
            titulo="Fazer meu cadastro"
            icone="person"
            variante="secundario"
            onPress={() => router.push('/cadastro')}
            dica="Abre o formulário de cadastro"
          />
        </Cartao>
      ) : null}

      <Botao
        titulo="O que fazer em caso de enchente"
        icone="help-buoy"
        variante="secundario"
        onPress={() => router.push('/ajuda')}
        dica="Abre orientações simples e telefones de emergência"
      />
      {corrego ? (
        <Botao
          titulo="Ver leituras recentes"
          icone="water"
          variante="secundario"
          onPress={() => router.push({ pathname: '/corrego/[id]', params: { id: String(corrego.id) } })}
          dica={`Abre os detalhes do ${corrego.nome}`}
        />
      ) : null}
    </Tela>
  );
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

const estilos = StyleSheet.create({
  subtitulo: { marginBottom: espaco.md },
  cartaoAjuda: { borderColor: cores.perigo, borderWidth: 3 },
});
