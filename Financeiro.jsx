import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { StatCard, Card, SectionHeader, fmt, fmtDate, Input, Btn, Modal, FormField } from '../components/ui';

const mes = (d) => d?.slice(0, 7);
const hoje = () => new Date().toISOString().split('T')[0];
const mesAtual = () => new Date().toISOString().slice(0, 7);

export default function Financeiro() {
  const { comandas, agendamentos, clientes, servicos, profissionais, metaMensal, setMetaMensal } = useStore();
  const [filtro, setFiltro] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [editMeta, setEditMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState('');

  const comandasFiltradas = useMemo(() => {
    const h = hoje(); const m = mesAtual();
    return comandas.filter(c => {
      if (filtro === 'hoje') return c.data === h;
      if (filtro === 'semana') { const d = new Date(c.data); const now = new Date(); const diff = (now - d) / 86400000; return diff >= 0 && diff <= 7; }
      if (filtro === 'mes') return c.data?.startsWith(m);
      if (filtro === 'custom') return c.data >= dataInicio && c.data <= dataFim;
      return true;
    });
  }, [comandas, filtro, dataInicio, dataFim]);

  const faturamento = comandasFiltradas.filter(c => c.pagamento === 'pago').reduce((s, c) => s + (Number(c.total) || 0), 0);
  const emAberto = comandasFiltradas.filter(c => c.pagamento !== 'pago').reduce((s, c) => s + (Number(c.total) || 0), 0);

  // Caixa do dia
  const caixaDia = comandas.filter(c => c.data === hoje() && c.pagamento === 'pago').reduce((s, c) => s + (Number(c.total) || 0), 0);

  // Top clientes
  const gastosPorCliente = clientes.map(cli => ({
    nome: cli.nome,
    total: comandas.filter(c => c.clienteId === cli.id && c.pagamento === 'pago').reduce((s, c) => s + (Number(c.total) || 0), 0),
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // Serviços mais vendidos
  const servicosVendidos = {};
  comandasFiltradas.forEach(c => {
    (c.itens || []).forEach(item => {
      servicosVendidos[item.nome] = (servicosVendidos[item.nome] || 0) + 1;
    });
  });
  const topServicos = Object.entries(servicosVendidos).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Por forma de pagamento
  const porForma = {};
  comandasFiltradas.filter(c => c.pagamento === 'pago').forEach(c => {
    const f = c.formaPagamento || 'Não informado';
    porForma[f] = (porForma[f] || 0) + Number(c.total || 0);
  });

  // Ranking profissionais
  const rankProfissionais = profissionais.map(p => {
    const ags = agendamentos.filter(a => a.profissionalId === p.id);
    const fat = ags.filter(a => a.pagamento === 'pago').reduce((s, a) => s + (Number(a.valor) || 0), 0);
    return { nome: p.nome, qtd: ags.length, faturamento: fat };
  }).sort((a, b) => b.faturamento - a.faturamento);

  const metaPct = metaMensal > 0 ? Math.min((faturamento / metaMensal) * 100, 100) : 0;

  return (
    <div>
      <SectionHeader title="Financeiro" />

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['hoje', 'semana', 'mes', 'tudo', 'custom'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'hoje' ? 'Hoje' : f === 'semana' ? 'Semana' : f === 'mes' ? 'Mês' : f === 'tudo' ? 'Tudo' : 'Personalizado'}
          </button>
        ))}
        {filtro === 'custom' && (
          <div className="flex gap-2">
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-36" />
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-36" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Faturamento" value={fmt(faturamento)} color="green" />
        <StatCard label="Em Aberto" value={fmt(emAberto)} color="orange" />
        <StatCard label="Caixa Hoje" value={fmt(caixaDia)} color="blue" />
        <StatCard label="Comandas" value={comandasFiltradas.length} color="gray" />
      </div>

      {/* Meta Mensal */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Meta Mensal</h3>
          <Btn variant="ghost" onClick={() => { setNovaMeta(metaMensal); setEditMeta(true); }} className="text-xs">Editar Meta</Btn>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Realizado: <strong className="text-green-600">{fmt(faturamento)}</strong></span>
          <span className="text-gray-500">Meta: <strong>{fmt(metaMensal)}</strong></span>
          <span className="text-gray-500">Falta: <strong className="text-orange-600">{fmt(Math.max(0, metaMensal - faturamento))}</strong></span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500" style={{ width: `${metaPct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{metaPct.toFixed(1)}% atingido</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Clientes */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Top Clientes</h3>
          <div className="space-y-3">
            {gastosPorCliente.map((c, i) => (
              <div key={c.nome} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.nome}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${gastosPorCliente[0]?.total > 0 ? (c.total / gastosPorCliente[0].total) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-orange-600">{fmt(c.total)}</span>
              </div>
            ))}
            {gastosPorCliente.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
          </div>
        </Card>

        {/* Serviços mais vendidos */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Serviços Mais Vendidos</h3>
          <div className="space-y-3">
            {topServicos.map(([nome, qtd], i) => (
              <div key={nome} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{nome}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${topServicos[0]?.[1] > 0 ? (qtd / topServicos[0][1]) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700">{qtd}x</span>
              </div>
            ))}
            {topServicos.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
          </div>
        </Card>

        {/* Por Forma de Pagamento */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Por Forma de Pagamento</h3>
          <div className="space-y-2">
            {Object.entries(porForma).map(([forma, val]) => (
              <div key={forma} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{forma}</span>
                <span className="font-semibold text-orange-600">{fmt(val)}</span>
              </div>
            ))}
            {Object.keys(porForma).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem pagamentos no período</p>}
          </div>
        </Card>

        {/* Ranking Profissionais */}
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Ranking de Profissionais</h3>
          <div className="space-y-3">
            {rankProfissionais.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.qtd} serviços</p>
                </div>
                <span className="text-sm font-bold text-orange-600">{fmt(p.faturamento)}</span>
              </div>
            ))}
            {rankProfissionais.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
          </div>
        </Card>
      </div>

      {/* Modal Meta */}
      <Modal isOpen={editMeta} onClose={() => setEditMeta(false)} title="Editar Meta Mensal" size="sm">
        <FormField label="Meta (R$)">
          <Input type="number" value={novaMeta} onChange={e => setNovaMeta(e.target.value)} placeholder="Ex: 10000" />
        </FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setEditMeta(false)}>Cancelar</Btn>
          <Btn onClick={() => { setMetaMensal(Number(novaMeta)); setEditMeta(false); }}>Salvar</Btn>
        </div>
      </Modal>
    </div>
  );
}
