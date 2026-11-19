import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { cores, fontes } from '../../src/theme';

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

function icone(nome: NomeIcone) {
  return ({ color }: { color: string }) => <Ionicons name={nome} size={28} color={color} />;
}

/** Navegação principal em abas (com ícone + texto em cada aba). */
export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.primariaTexto,
        headerTitleStyle: { fontSize: fontes.media, fontWeight: '700' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: '#4A4A4A',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: { minHeight: 68, paddingTop: 6, paddingBottom: 8 },
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: 'Alerta Córrego',
          tabBarIcon: icone('home'),
          tabBarAccessibilityLabel: 'Início: situação do meu córrego',
        }}
      />
      <Tabs.Screen
        name="corregos"
        options={{
          title: 'Córregos',
          tabBarIcon: icone('water'),
          tabBarAccessibilityLabel: 'Córregos: lista de córregos monitorados',
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: icone('notifications'),
          tabBarAccessibilityLabel: 'Alertas: alertas ativos e histórico',
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          title: 'Meu cadastro',
          tabBarIcon: icone('person'),
          tabBarAccessibilityLabel: 'Meu cadastro: seus dados e necessidade de ajuda',
        }}
      />
      <Tabs.Screen
        name="ajuda"
        options={{
          title: 'Ajuda',
          headerTitle: 'Pedir ajuda / O que fazer',
          tabBarIcon: icone('help-buoy'),
          tabBarAccessibilityLabel: 'Ajuda: o que fazer e telefones de emergência',
        }}
      />
    </Tabs>
  );
}
