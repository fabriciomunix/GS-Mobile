import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Botao } from '../../src/components/Botao';
import { CampoTexto } from '../../src/components/CampoTexto';
import { Carregando } from '../../src/components/Carregando';
import { Cartao } from '../../src/components/Cartao';
import { Opcao } from '../../src/components/Opcao';
import { Tela } from '../../src/components/Tela';
import { Texto } from '../../src/components/Texto';
import { adicionarFavorito, obterMorador, salvarMorador } from '../../src/database';
import { enviarMorador, listarCorregos } from '../../src/services/api';
import { cores, espaco, TOQUE_MINIMO } from '../../src/theme';
import type { Corrego, TipoNecessidade } from '../../src/types';
import { formatarDataHora, somenteDigitos } from '../../src/utils/formatacao';

const TIPOS: Array<{ valor: TipoNecessidade; rotulo: string }> = [
  { valor: 'NENHUMA', rotulo: 'Não tenho necessidade especial' },
  { valor: 'IDOSO', rotulo: 'Pessoa idosa' },
  { valor: 'CADEIRANTE', rotulo: 'Uso cadeira de rodas' },
  { valor: 'ACAMADO', rotulo: 'Pessoa acamada' },
  { valor: 'OUTRA', rotulo: 'Outra necessidade' },
];

interface Erros {
  nome?: string;
  telefone?: string;
  endereco?: string;
  corrego?: string;
}

export default function Cadastro() {
  const [corregos, setCorregos] = useState<Corrego[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [corregoId, setCorregoId] = useState<number | null>(null);
  const [prioritario, setPrioritario] = useState(false);
  const [tipoNecessidade, setTipoNecessidade] = useState<TipoNecessidade>('NENHUMA');
  const [remoteId, setRemoteId] = useState<number | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [resCorregos, m] = await Promise.all([listarCorregos(), obterMorador()]);
      setCorregos(resCorregos.dados);
      if (m) {
        setNome(m.nome);
        setTelefone(m.telefone);
        setEndereco(m.endereco);
        setCorregoId(m.corregoId);
        setPrioritario(m.prioritario);
        setTipoNecessidade(m.tipoNecessidade);
        setRemoteId(m.remoteId);
        setAtualizadoEm(m.atualizadoEm);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function escolherTipo(t: TipoNecessidade) {
    setTipoNecessidade(t);
    // Quem tem necessidade especial normalmente precisa de ajuda para sair
    if (t !== 'NENHUMA') setPrioritario(true);
  }

  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().length < 3) e.nome = 'Escreva seu nome (pelo menos 3 letras).';
    const digitos = somenteDigitos(telefone);
    if (digitos.length < 10 || digitos.length > 11) e.telefone = 'Escreva o telefone com DDD. Exemplo: 11 91234 5678.';
    if (endereco.trim().length < 5) e.endereco = 'Escreva sua rua e número.';
    if (corregoId === null) e.corrego = 'Escolha o córrego mais perto da sua casa.';
    return e;
  }

  async function salvar() {
    setMensagem(null);
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0 || corregoId === null) {
      AccessibilityInfo.announceForAccessibility('Há campos para corrigir. ' + Object.values(e).join(' '));
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        telefone: somenteDigitos(telefone),
        endereco: endereco.trim(),
        corregoId,
        prioritario,
        tipoNecessidade,
      };

      // 1) Tenta enviar para a API (POST/PUT /api/moradores). Só guarda o id se veio do servidor real.
      const res = await enviarMorador(dados, remoteId);
      const novoRemoteId = res.origem === 'api' ? res.dados?.id ?? remoteId : remoteId;

      // 2) Salva SEMPRE no SQLite do celular
      const salvo = await salvarMorador({ ...dados, remoteId: novoRemoteId });
      setRemoteId(novoRemoteId);
      setAtualizadoEm(salvo.atualizadoEm);

      // 3) O córrego do cadastro passa a ser monitorado
      const c = corregos.find((x) => x.id === corregoId);
      if (c) await adicionarFavorito(c);

      const texto =
        res.origem === 'api'
          ? 'Cadastro salvo no celular e enviado ao servidor do Alerta Córrego.'
          : 'Cadastro salvo no celular. O servidor está fora do ar; os dados ficam guardados aqui.';
      setMensagem(texto);
      AccessibilityInfo.announceForAccessibility(texto);
    } catch {
      const texto = 'Não foi possível salvar. Tente de novo.';
      setMensagem(texto);
      AccessibilityInfo.announceForAccessibility(texto);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Tela>
        <Carregando mensagem="Abrindo seu cadastro..." />
      </Tela>
    );
  }

  return (
    <Tela>
      <Texto variante="titulo">Meu cadastro</Texto>
      <Texto style={estilos.intro}>
        Seus dados ficam guardados neste celular. Use dados fictícios na demonstração. Não pedimos CPF.
      </Texto>
      {atualizadoEm ? <Texto variante="pequeno">Última atualização: {formatarDataHora(atualizadoEm)}</Texto> : null}

      <CampoTexto
        rotulo="Nome"
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Maria da Silva"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        erro={erros.nome}
        returnKeyType="next"
      />
      <CampoTexto
        rotulo="Telefone com DDD"
        dica="Para a Defesa Civil ou vizinhos ligarem para você"
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Ex.: 11 91234 5678"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        erro={erros.telefone}
      />
      <CampoTexto
        rotulo="Endereço"
        dica="Rua, número e ponto de referência"
        value={endereco}
        onChangeText={setEndereco}
        placeholder="Ex.: Rua das Flores, 10 — perto da ponte"
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        multiline
        erro={erros.endereco}
      />

      <Texto variante="subtitulo" style={estilos.secao} nativeID="titulo-corrego">
        Córrego perto da sua casa
      </Texto>
      <View accessibilityRole="radiogroup" accessibilityLabel="Córrego perto da sua casa">
        {corregos.map((c) => (
          <Opcao
            key={c.id}
            rotulo={`${c.nome} — ${c.bairro}`}
            selecionada={corregoId === c.id}
            onPress={() => setCorregoId(c.id)}
          />
        ))}
      </View>
      {erros.corrego ? (
        <Texto cor={cores.perigo} negrito accessibilityRole="alert">
          {erros.corrego}
        </Texto>
      ) : null}

      <Texto variante="subtitulo" style={estilos.secao}>
        Ajuda para sair de casa
      </Texto>
      <Pressable
        onPress={() => setPrioritario((p) => !p)}
        accessibilityRole="switch"
        accessibilityLabel="Preciso de ajuda para sair de casa em caso de enchente"
        accessibilityHint="Se ligado, você entra na lista de moradores prioritários do seu córrego"
        accessibilityState={{ checked: prioritario }}
        style={({ pressed }) => [estilos.linhaSwitch, prioritario && estilos.linhaSwitchLigada, pressed && { opacity: 0.85 }]}
      >
        <View style={estilos.flex}>
          <Texto negrito>Preciso de ajuda para sair</Texto>
          <Texto variante="pequeno">{prioritario ? 'SIM — você é prioridade' : 'NÃO'}</Texto>
        </View>
        <Switch
          value={prioritario}
          onValueChange={setPrioritario}
          trackColor={{ false: '#8A8A8A', true: cores.primaria }}
          thumbColor={cores.superficie}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Pressable>

      <Texto variante="destaque" style={estilos.secao}>
        Tipo de necessidade
      </Texto>
      <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de necessidade">
        {TIPOS.map((t) => (
          <Opcao key={t.valor} rotulo={t.rotulo} selecionada={tipoNecessidade === t.valor} onPress={() => escolherTipo(t.valor)} />
        ))}
      </View>

      <Botao
        titulo="Salvar cadastro"
        icone="checkmark-circle"
        grande
        carregando={salvando}
        onPress={salvar}
        dica="Salva seus dados no celular e tenta enviar ao servidor"
      />

      {mensagem ? (
        <Cartao accessibilityRole="alert" accessibilityLiveRegion="polite" style={estilos.mensagem}>
          <Texto negrito>{mensagem}</Texto>
        </Cartao>
      ) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  intro: { marginBottom: espaco.sm },
  secao: { marginTop: espaco.md, marginBottom: espaco.sm },
  flex: { flex: 1 },
  linhaSwitch: {
    minHeight: Math.max(TOQUE_MINIMO, 64),
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderWidth: 2,
    borderColor: '#C9CED6',
    borderRadius: 12,
    backgroundColor: cores.superficie,
  },
  linhaSwitchLigada: { borderColor: cores.primaria, backgroundColor: '#E8F0FB' },
  mensagem: { marginTop: espaco.md, borderColor: cores.sucesso, borderWidth: 2 },
});
