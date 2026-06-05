import { create } from 'zustand';
import { supabase } from './supabase';

// Helper: gera id local temporário
const uid = () => Date.now().toString() + Math.random().toString(36).slice(2);

const useStore = create((set, get) => ({
  // Estado
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
  loading: false,

  // ─── INIT: carrega tudo do Supabase ───
  init: async () => {
    set({ loading: true });
    const tabelas = [
      'clientes', 'profissionais', 'servicos', 'categorias',
      'agendamentos', 'agendamentos_cancelados', 'comandas',
      'pacotes', 'estoque', 'consumo_por_servico',
      'formas_pagamento', 'pendencias', 'caixa', 'configuracoes'
    ];
    const results = await Promise.all(tabelas.map(t => supabase.from(t).select('*')));
    const [
      clientes, profissionais, servicos, categorias,
      agendamentos, agendamentosCancelados, comandas,
      pacotes, estoque, consumoPorServico,
      formasPagamento, pendencias, caixa, configuracoes
    ] = results.map(r => r.data || []);

    const meta = configuracoes?.find(c => c.chave === 'meta_mensal');

    set({
      clientes,
      profissionais,
      servicos,
      categorias: categorias.map(c => c.nome),
      agendamentos,
      agendamentosCancelados,
      comandas: comandas.map(c => ({ ...c, itens: c.itens || [] })),
      pacotes,
      estoque,
      consumoPorServico,
      formasPagamento: formasPagamento.length > 0 ? formasPagamento.map(f => f.nome) : ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito'],
      pendencias,
      caixa,
      metaMensal: meta ? Number(meta.valor) : 0,
      loading: false,
    });
  },

  // ─── CLIENTES ───
  addCliente: async (cliente) => {
    const novo = { ...cliente, fotos: [], preferencias: '', alergias: '' };
    const { data, error } = await supabase.from('clientes').insert(novo).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ clientes: [...s.clientes, data] }));
  },
  updateCliente: async (id, dados) => {
    const { error } = await supabase.from('clientes').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ clientes: s.clientes.map(c => c.id === id ? { ...c, ...dados } : c) }));
  },
  deleteCliente: async (id) => {
    await supabase.from('clientes').delete().eq('id', id);
    set(s => ({ clientes: s.clientes.filter(c => c.id !== id) }));
  },

  // ─── PROFISSIONAIS ───
  addProfissional: async (prof) => {
    const { data, error } = await supabase.from('profissionais').insert(prof).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ profissionais: [...s.profissionais, data] }));
  },
  updateProfissional: async (id, dados) => {
    const { error } = await supabase.from('profissionais').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ profissionais: s.profissionais.map(p => p.id === id ? { ...p, ...dados } : p) }));
  },
  deleteProfissional: async (id) => {
    await supabase.from('profissionais').delete().eq('id', id);
    set(s => ({ profissionais: s.profissionais.filter(p => p.id !== id) }));
  },

  // ─── SERVIÇOS ───
  addServico: async (servico) => {
    const { data, error } = await supabase.from('servicos').insert(servico).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ servicos: [...s.servicos, data] }));
  },
  updateServico: async (id, dados) => {
    const { error } = await supabase.from('servicos').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ servicos: s.servicos.map(sv => sv.id === id ? { ...sv, ...dados } : sv) }));
  },
  deleteServico: async (id) => {
    await supabase.from('servicos').delete().eq('id', id);
    set(s => ({ servicos: s.servicos.filter(sv => sv.id !== id) }));
  },

  // ─── CATEGORIAS ───
  addCategoria: async (nome) => {
    const { error } = await supabase.from('categorias').insert({ nome });
    if (error) { console.error(error); return; }
    set(s => ({ categorias: [...s.categorias, nome] }));
  },
  deleteCategoria: async (nome) => {
    await supabase.from('categorias').delete().eq('nome', nome);
    set(s => ({ categorias: s.categorias.filter(c => c !== nome) }));
  },

  // ─── AGENDAMENTOS ───
  addAgendamento: async (ag) => {
    const { data, error } = await supabase.from('agendamentos').insert({ ...ag, status: 'ativo' }).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ agendamentos: [...s.agendamentos, data] }));
  },
  updateAgendamento: async (id, dados) => {
    const { error } = await supabase.from('agendamentos').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ agendamentos: s.agendamentos.map(a => a.id === id ? { ...a, ...dados } : a) }));
  },
  cancelarAgendamento: async (id, motivo) => {
    const ag = get().agendamentos.find(a => a.id === id);
    if (!ag) return;
    const cancelado = { ...ag, motivocancelamento: motivo, canceladoem: new Date().toISOString() };
    delete cancelado.id;
    await supabase.from('agendamentos').delete().eq('id', id);
    const { data } = await supabase.from('agendamentos_cancelados').insert(cancelado).select().single();
    set(s => ({
      agendamentos: s.agendamentos.filter(a => a.id !== id),
      agendamentosCancelados: [...s.agendamentosCancelados, data || cancelado],
    }));
  },

  // ─── COMANDAS ───
  addComanda: async (comanda) => {
    const { data, error } = await supabase.from('comandas').insert({ ...comanda, itens: comanda.itens || [] }).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ comandas: [...s.comandas, { ...data, itens: data.itens || [] }] }));
  },
  updateComanda: async (id, dados) => {
    const { error } = await supabase.from('comandas').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ comandas: s.comandas.map(c => c.id === id ? { ...c, ...dados } : c) }));
  },
  deleteComanda: async (id) => {
    await supabase.from('comandas').delete().eq('id', id);
    set(s => ({ comandas: s.comandas.filter(c => c.id !== id) }));
  },

  // ─── PACOTES ───
  addPacote: async (pacote) => {
    const { data, error } = await supabase.from('pacotes').insert(pacote).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ pacotes: [...s.pacotes, data] }));
  },
  updatePacote: async (id, dados) => {
    const { error } = await supabase.from('pacotes').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ pacotes: s.pacotes.map(p => p.id === id ? { ...p, ...dados } : p) }));
  },
  deletePacote: async (id) => {
    await supabase.from('pacotes').delete().eq('id', id);
    set(s => ({ pacotes: s.pacotes.filter(p => p.id !== id) }));
  },

  // ─── ESTOQUE ───
  addEstoque: async (item) => {
    const { data, error } = await supabase.from('estoque').insert(item).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ estoque: [...s.estoque, data] }));
  },
  updateEstoque: async (id, dados) => {
    const { error } = await supabase.from('estoque').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ estoque: s.estoque.map(e => e.id === id ? { ...e, ...dados } : e) }));
  },
  deleteEstoque: async (id) => {
    await supabase.from('estoque').delete().eq('id', id);
    set(s => ({ estoque: s.estoque.filter(e => e.id !== id) }));
  },

  addConsumo: async (consumo) => {
    const { data, error } = await supabase.from('consumo_por_servico').insert(consumo).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ consumoPorServico: [...s.consumoPorServico, data] }));
  },
  updateConsumo: async (id, dados) => {
    const { error } = await supabase.from('consumo_por_servico').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ consumoPorServico: s.consumoPorServico.map(c => c.id === id ? { ...c, ...dados } : c) }));
  },
  deleteConsumo: async (id) => {
    await supabase.from('consumo_por_servico').delete().eq('id', id);
    set(s => ({ consumoPorServico: s.consumoPorServico.filter(c => c.id !== id) }));
  },

  // ─── FORMAS DE PAGAMENTO ───
  addFormaPagamento: async (nome) => {
    const { error } = await supabase.from('formas_pagamento').insert({ nome });
    if (error) { console.error(error); return; }
    set(s => ({ formasPagamento: [...s.formasPagamento, nome] }));
  },
  deleteFormaPagamento: async (nome) => {
    await supabase.from('formas_pagamento').delete().eq('nome', nome);
    set(s => ({ formasPagamento: s.formasPagamento.filter(f => f !== nome) }));
  },

  // ─── META MENSAL ───
  setMetaMensal: async (valor) => {
    await supabase.from('configuracoes').upsert({ chave: 'meta_mensal', valor: String(valor) }, { onConflict: 'chave' });
    set({ metaMensal: valor });
  },

  // ─── PENDÊNCIAS ───
  addPendencia: async (p) => {
    const { data, error } = await supabase.from('pendencias').insert({ ...p, criadaem: new Date().toISOString(), resolvida: false }).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ pendencias: [...s.pendencias, data] }));
  },
  updatePendencia: async (id, dados) => {
    const { error } = await supabase.from('pendencias').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ pendencias: s.pendencias.map(p => p.id === id ? { ...p, ...dados } : p) }));
  },
  deletePendencia: async (id) => {
    await supabase.from('pendencias').delete().eq('id', id);
    set(s => ({ pendencias: s.pendencias.filter(p => p.id !== id) }));
  },

  // ─── CAIXA ───
  addCaixa: async (entry) => {
    const { data, error } = await supabase.from('caixa').insert(entry).select().single();
    if (error) { console.error(error); return; }
    set(s => ({ caixa: [...s.caixa, data] }));
  },
  updateCaixa: async (id, dados) => {
    const { error } = await supabase.from('caixa').update(dados).eq('id', id);
    if (error) { console.error(error); return; }
    set(s => ({ caixa: s.caixa.map(c => c.id === id ? { ...c, ...dados } : c) }));
  },
  deleteCaixa: async (id) => {
    await supabase.from('caixa').delete().eq('id', id);
    set(s => ({ caixa: s.caixa.filter(c => c.id !== id) }));
  },
}));

export default useStore;
