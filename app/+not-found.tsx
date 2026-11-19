import React from 'react';
import { router } from 'expo-router';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { Texto } from '../src/components/Texto';

export default function NaoEncontrada() {
  return (
    <Tela>
      <Texto variante="titulo">Página não encontrada</Texto>
      <Texto>Esta tela não existe.</Texto>
      <Botao titulo="Ir para o início" icone="home" onPress={() => router.replace('/')} dica="Volta para a tela inicial" />
    </Tela>
  );
}
