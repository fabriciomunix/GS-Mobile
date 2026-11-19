export { getDb } from './db';
export { inicializarSchema, VERSAO_SCHEMA } from './schema';
export { obterMorador, salvarMorador, excluirMorador } from './moradorRepo';
export { listarFavoritos, ehFavorito, adicionarFavorito, removerFavorito, alternarFavorito } from './favoritosRepo';
export { salvarAlertas, encerrarAusentes, listarHistorico, limparHistorico } from './alertasRepo';
