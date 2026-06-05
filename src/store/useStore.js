import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  clientes: [],
  profissionais: [],
  servicos: [],
  categorias: [],
  agendamentos: [],
  agendamentosCancelados: [],
  comandas: [],
  pacotes: [],
  estoque: [],
  consumoPorServico: [],
  formasPagamento: ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito'],
  metaMensal: 0,
  pendencias: [],
  caixa: [],
};

const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // CLIENTES
      addCliente: (cliente) => set((s) => ({
        clientes: [...s.clientes, { ...cliente, id: Date.now().toString(), fotos: [], visitas: [], preferencias: '', alergias: '' }]
      })),
      updateCliente: (id, data) => set((s) => ({
        clientes: s.clientes.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter(c => c.id !== id) })),

      // PROFISSIONAIS
      addProfissional: (prof) => set((s) => ({
        profissionais: [...s.profissionais, { ...prof, id: Date.now().toString() }]
      })),
      updateProfissional: (id, data) => set((s) => ({
        profissionais: s.profissionais.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProfissional: (id) => set((s) => ({ profissionais: s.profissionais.filter(p => p.id !== id) })),

      // SERVIÇOS
      addServico: (servico) => set((s) => ({
        servicos: [...s.servicos, { ...servico, id: Date.now().toString() }]
      })),
      updateServico: (id, data) => set((s) => ({
        servicos: s.servicos.map(sv => sv.id === id ? { ...sv, ...data } : sv)
      })),
      deleteServico: (id) => set((s) => ({ servicos: s.servicos.filter(sv => sv.id !== id) })),

      // CATEGORIAS
      addCategoria: (cat) => set((s) => ({ categorias: [...s.categorias, cat] })),
      deleteCategoria: (cat) => set((s) => ({ categorias: s.categorias.filter(c => c !== cat) })),

      // AGENDAMENTOS
      addAgendamento: (ag) => set((s) => ({
        agendamentos: [...s.agendamentos, { ...ag, id: Date.now().toString(), status: 'ativo' }]
      })),
      updateAgendamento: (id, data) => set((s) => ({
        agendamentos: s.agendamentos.map(a => a.id === id ? { ...a, ...data } : a)
      })),
      cancelarAgendamento: (id, motivo) => set((s) => {
        const ag = s.agendamentos.find(a => a.id === id);
        if (!ag) return s;
        return {
          agendamentos: s.agendamentos.filter(a => a.id !== id),
          agendamentosCancelados: [...s.agendamentosCancelados, { ...ag, motivoCancelamento: motivo, canceladoEm: new Date().toISOString() }]
        };
      }),

      // COMANDAS
      addComanda: (comanda) => set((s) => ({
        comandas: [...s.comandas, { ...comanda, id: Date.now().toString(), itens: comanda.itens || [], total: comanda.total || 0 }]
      })),
      updateComanda: (id, data) => set((s) => ({
        comandas: s.comandas.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteComanda: (id) => set((s) => ({ comandas: s.comandas.filter(c => c.id !== id) })),

      // PACOTES
      addPacote: (pacote) => set((s) => ({
        pacotes: [...s.pacotes, { ...pacote, id: Date.now().toString() }]
      })),
      updatePacote: (id, data) => set((s) => ({
        pacotes: s.pacotes.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deletePacote: (id) => set((s) => ({ pacotes: s.pacotes.filter(p => p.id !== id) })),

      // ESTOQUE
      addEstoque: (item) => set((s) => ({
        estoque: [...s.estoque, { ...item, id: Date.now().toString() }]
      })),
      updateEstoque: (id, data) => set((s) => ({
        estoque: s.estoque.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEstoque: (id) => set((s) => ({ estoque: s.estoque.filter(e => e.id !== id) })),

      addConsumo: (consumo) => set((s) => ({
        consumoPorServico: [...s.consumoPorServico, { ...consumo, id: Date.now().toString() }]
      })),
      updateConsumo: (id, data) => set((s) => ({
        consumoPorServico: s.consumoPorServico.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteConsumo: (id) => set((s) => ({ consumoPorServico: s.consumoPorServico.filter(c => c.id !== id) })),

      // FORMAS DE PAGAMENTO
      addFormaPagamento: (forma) => set((s) => ({
        formasPagamento: [...s.formasPagamento, forma]
      })),
      deleteFormaPagamento: (forma) => set((s) => ({
        formasPagamento: s.formasPagamento.filter(f => f !== forma)
      })),

      // META MENSAL
      setMetaMensal: (valor) => set({ metaMensal: valor }),

      // PENDENCIAS
      addPendencia: (p) => set((s) => ({
        pendencias: [...s.pendencias, { ...p, id: Date.now().toString(), criadaEm: new Date().toISOString(), resolvida: false }]
      })),
      updatePendencia: (id, data) => set((s) => ({
        pendencias: s.pendencias.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deletePendencia: (id) => set((s) => ({ pendencias: s.pendencias.filter(p => p.id !== id) })),

      // CAIXA
      addCaixa: (entry) => set((s) => ({
        caixa: [...s.caixa, { ...entry, id: Date.now().toString() }]
      })),
      updateCaixa: (id, data) => set((s) => ({
        caixa: s.caixa.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCaixa: (id) => set((s) => ({ caixa: s.caixa.filter(c => c.id !== id) })),
    }),
    { name: 'estetica-storage' }
  )
);

export default useStore;
