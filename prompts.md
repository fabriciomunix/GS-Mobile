# Uso de IA no projeto (prompts.md)

Conforme as regras da Global Solution FIAP, registramos aqui o uso de Inteligência Artificial.

- **Ferramenta:** Claude (Anthropic), usado como **copiloto** de programação.
- **Como foi usado:** gerar a estrutura inicial do app, componentes acessíveis, camada de API com fallback e o módulo SQLite, a partir da ficha e do contrato REST definidos pelo grupo. Todo o código foi revisado e ajustado pelos integrantes.
- **Responsabilidade:** as decisões de problema, regra de risco, modelo de domínio e contrato da API são do grupo (FICHA.md, comum a Mobile, SOA, C# e QA).

## Principais prompts

1. "Crie um app Expo (SDK 52) com React Native, TypeScript e Expo Router para o projeto Alerta Córrego seguindo esta ficha, modelo de domínio, regra de risco e contrato REST: [conteúdo da FICHA.md]. Tudo em português do Brasil."
2. "Faça a camada `src/services/api.ts` com fetch e timeout, URL configurável por `EXPO_PUBLIC_API_URL`, e fallback automático para um mock local (`mock.ts`) com o mesmo seed da ficha quando a API estiver offline."
3. "Crie o módulo `src/database` com expo-sqlite (API assíncrona `openDatabaseAsync`/`runAsync`/`getAllAsync`) para salvar o cadastro do morador, córregos favoritos e histórico de alertas."
4. "Monte as telas Início (cartão grande de risco com cor, ícone e texto), Córregos + detalhe, Alertas (ativos + histórico), Meu Cadastro e Pedir ajuda (ligar 199 e 193 com Linking), usando abas e pilha."
5. "Revise a acessibilidade: accessibilityLabel/Role/Hint, área de toque mínima de 48dp, fonte base 18, contraste forte, respeitar a escala de fonte e não comunicar risco só por cor."
6. "Escreva o README com a ficha, como rodar, como apontar para a API SOA/C#, estrutura de pastas, prints e decisões de acessibilidade."
