import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Botao } from '../src/components/Botao';
import { Carregando } from '../src/components/Carregando';
import { Texto } from '../src/components/Texto';
import { getDb } from '../src/database';
import { cores, espaco, fontes } from '../src/theme';

/** Layout raiz: abre o banco SQLite (cria as tabelas) antes de mostrar as telas. */
export default function LayoutRaiz() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setErro(null);
    getDb()
      .then(() => ativo && setPronto(true))
      .catch((e: unknown) => ativo && setErro(e instanceof Error ? e.message : String(e)));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {erro ? (
        <View style={estilos.centro}>
          <Texto variante="subtitulo">Não foi possível abrir os dados do celular.</Texto>
          <Texto>{erro}</Texto>
          <Botao titulo="Tentar de novo" icone="refresh" onPress={() => setTentativa((t) => t + 1)} dica="Tenta abrir o banco de dados novamente" />
        </View>
      ) : !pronto ? (
        <View style={estilos.centro}>
          <Carregando mensagem="Preparando o aplicativo..." />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: cores.primaria },
            headerTintColor: cores.primariaTexto,
            headerTitleStyle: { fontSize: fontes.media, fontWeight: '700' },
            contentStyle: { backgroundColor: cores.fundo },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Voltar' }} />
          <Stack.Screen name="corrego/[id]" options={{ title: 'Detalhes do córrego' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Página não encontrada' }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: espaco.lg, gap: espaco.md, backgroundColor: cores.fundo },
});
