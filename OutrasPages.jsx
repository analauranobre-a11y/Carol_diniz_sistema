import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Select, Btn, Card, SectionHeader, Badge, StatCard, fmt, fmtDate } from '../components/ui';

// ============ PACOTES ============
export function Pacotes() {
  const { pacotes, servicos, addPacote, updatePacote, deletePacote } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nome: '', valor: '', validade: '', servicosVinculados: [], valorSessao: '', qtdSessoes: '' });

  const toggleServico = (id, data, setData) => {
    const arr = data.servicosVinculados || [];
    setData({ ...data, servicosVinculados: arr.includes(id) ? arr.filter(s => s !== id) : [...arr, id] });
  };

  const ServicosCheck = ({ data, setData }) => (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {servicos.map(s => (
        <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input type="checkbox" checked={(data.servicosVinculados || []).includes(s.id)} onChange={() => toggleServico(s.id, data, setData)} className="accent-orange-500" />
          <span className="text-sm">{s.nome} — {fmt(s.valor)}</span>
        </label>
      ))}
    </div>
  );

  const submit = () => {
    if (!form.nome || !form.valor) return alert('Preencha nome e valor');
    addPacote(form);
    setForm({ nome: '', valor: '', validade: '', servicosVinculados: [], valorSessao: '', qtdSessoes: '' });
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader title="Pacotes" action={<Btn onClick={() => setShowForm(true)}>+ Novo Pacote</Btn>} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pacotes.map(p => (
          <Card key={p.id} onClick={() => { setSelected(p); setEditData({ ...p }); }} className="cursor-pointer hover:border-orange-200">
            <p className="font-semibold text-gray-800 mb-1">{p.nome}</p>
            <p className="text-xl font-bold text-orange-600 mb-2">{fmt(p.valor)}</p>
            <div className="text-xs text-gray-500 space-y-1">
              {p.validade && <p>⏱ Validade: {p.validade} dias</p>}
              {p.qtdSessoes && <p>📅 {p.qtdSessoes} sessões · {fmt(p.valorSessao)}/sessão</p>}
              {(p.servicosVinculados || []).length > 0 && <p>🔗 {p.servicosVinculados.map(id => servicos.find(s => s.id === id)?.nome).filter(Boolean).join(', ')}</p>}
            </div>
          </Card>
        ))}
        {pacotes.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Nenhum pacote cadastrado</div>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Pacote" size="lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Nome" required><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></FormField>
          <FormField label="Valor Total (R$)" required><Input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></FormField>
          <FormField label="Validade (dias)"><Input type="number" value={form.validade} onChange={e => setForm({ ...form, validade: e.target.value })} /></FormField>
          <FormField label="Valor por Sessão (R$)"><Input type="number" value={form.valorSessao} onChange={e => setForm({ ...form, valorSessao: e.target.value })} /></FormField>
          <FormField label="Qtd de Sessões"><Input type="number" value={form.qtdSessoes} onChange={e => setForm({ ...form, qtdSessoes: e.target.value })} /></FormField>
        </div>
        <FormField label="Serviços Vinculados"><ServicosCheck data={form} setData={setForm} /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar</Btn>
        </div>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditData(null); }} title="Editar Pacote" size="lg">
        {editData && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Nome"><Input value={editData.nome} onChange={e => setEditData({ ...editData, nome: e.target.value })} /></FormField>
              <FormField label="Valor Total (R$)"><Input type="number" value={editData.valor} onChange={e => setEditData({ ...editData, valor: e.target.value })} /></FormField>
              <FormField label="Validade (dias)"><Input type="number" value={editData.validade || ''} onChange={e => setEditData({ ...editData, validade: e.target.value })} /></FormField>
              <FormField label="Valor por Sessão (R$)"><Input type="number" value={editData.valorSessao || ''} onChange={e => setEditData({ ...editData, valorSessao: e.target.value })} /></FormField>
              <FormField label="Qtd de Sessões"><Input type="number" value={editData.qtdSessoes || ''} onChange={e => setEditData({ ...editData, qtdSessoes: e.target.value })} /></FormField>
            </div>
            <FormField label="Serviços Vinculados"><ServicosCheck data={editData} setData={setEditData} /></FormField>
            <div className="flex justify-between mt-4">
              <Btn variant="danger" onClick={() => { if (confirm('Excluir?')) { deletePacote(selected.id); setSelected(null); } }}>Excluir</Btn>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => { setSelected(null); setEditData(null); }}>Fechar</Btn>
                <Btn onClick={() => { updatePacote(selected.id, editData); setSelected(null); }}>Salvar</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============ ESTOQUE ============
export function Estoque() {
  const { estoque, servicos, consumoPorServico, addEstoque, updateEstoque, deleteEstoque, addConsumo, updateConsumo, deleteConsumo } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showConsumo, setShowConsumo] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ produto: '', quantidade: '', custo: '' });
  const [consumoForm, setConsumoForm] = useState({ servicoId: '', produtoId: '', quantidade: '' });

  return (
    <div>
      <SectionHeader title="Estoque" action={
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => setShowConsumo(true)}>Consumo por Serviço</Btn>
          <Btn onClick={() => setShowForm(true)}>+ Produto</Btn>
        </div>
      } />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 pr-4">Produto</th><th className="py-3 pr-4">Quantidade</th><th className="py-3 pr-4">Custo Unit.</th><th className="py-3">Ações</th>
          </tr></thead>
          <tbody>
            {estoque.map(e => (
              editItem?.id === e.id ? (
                <tr key={e.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4"><Input value={editItem.produto} onChange={x => setEditItem({ ...editItem, produto: x.target.value })} /></td>
                  <td className="py-2 pr-4"><Input type="number" value={editItem.quantidade} onChange={x => setEditItem({ ...editItem, quantidade: x.target.value })} /></td>
                  <td className="py-2 pr-4"><Input type="number" value={editItem.custo} onChange={x => setEditItem({ ...editItem, custo: x.target.value })} /></td>
                  <td className="py-2 flex gap-2">
                    <Btn onClick={() => { updateEstoque(editItem.id, editItem); setEditItem(null); }}>✓</Btn>
                    <Btn variant="secondary" onClick={() => setEditItem(null)}>✕</Btn>
                  </td>
                </tr>
              ) : (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{e.produto}</td>
                  <td className="py-3 pr-4">{e.quantidade}</td>
                  <td className="py-3 pr-4">{fmt(e.custo)}</td>
                  <td className="py-3 flex gap-2">
                    <Btn variant="ghost" onClick={() => setEditItem({ ...e })}>✏️</Btn>
                    <Btn variant="ghost" onClick={() => { if (confirm('Excluir?')) deleteEstoque(e.id); }}>🗑️</Btn>
                  </td>
                </tr>
              )
            ))}
            {estoque.length === 0 && <tr><td colSpan={4} className="py-16 text-center text-gray-400">Nenhum produto no estoque</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Produto" size="sm">
        <FormField label="Produto" required><Input value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} /></FormField>
        <FormField label="Quantidade"><Input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} /></FormField>
        <FormField label="Custo Unitário (R$)"><Input type="number" value={form.custo} onChange={e => setForm({ ...form, custo: e.target.value })} /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={() => { if (!form.produto) return; addEstoque(form); setForm({ produto: '', quantidade: '', custo: '' }); setShowForm(false); }}>Salvar</Btn>
        </div>
      </Modal>

      <Modal isOpen={showConsumo} onClose={() => setShowConsumo(false)} title="Consumo por Serviço" size="lg">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <FormField label="Serviço">
            <Select value={consumoForm.servicoId} onChange={e => setConsumoForm({ ...consumoForm, servicoId: e.target.value })}>
              <option value="">Selecione...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          </FormField>
          <FormField label="Produto">
            <Select value={consumoForm.produtoId} onChange={e => setConsumoForm({ ...consumoForm, produtoId: e.target.value })}>
              <option value="">Selecione...</option>
              {estoque.map(e => <option key={e.id} value={e.id}>{e.produto}</option>)}
            </Select>
          </FormField>
          <FormField label="Qtd Consumida">
            <Input type="number" value={consumoForm.quantidade} onChange={e => setConsumoForm({ ...consumoForm, quantidade: e.target.value })} />
          </FormField>
        </div>
        <Btn onClick={() => { if (!consumoForm.servicoId || !consumoForm.produtoId) return; addConsumo({ ...consumoForm, nomeServico: servicos.find(s => s.id === consumoForm.servicoId)?.nome, nomeProduto: estoque.find(e => e.id === consumoForm.produtoId)?.produto }); setConsumoForm({ servicoId: '', produtoId: '', quantidade: '' }); }}>Adicionar</Btn>
        <div className="mt-4 space-y-2">
          {consumoPorServico.map(c => (
            <div key={c.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
              <div><p className="text-sm font-medium">{c.nomeServico}</p><p className="text-xs text-gray-400">{c.nomeProduto}</p></div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{c.quantidade} un</span>
                <button onClick={() => { if (confirm('Excluir?')) deleteConsumo(c.id); }} className="text-red-400 hover:text-red-600">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ============ COMISSOES ============
export function Comissoes() {
  const { agendamentos, profissionais, servicos } = useStore();
  const [filtro, setFiltro] = useState('mes');

  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = new Date().toISOString().slice(0, 7);
  const semanaStart = new Date(); semanaStart.setDate(semanaStart.getDate() - semanaStart.getDay());

  const agsFiltered = agendamentos.filter(a => {
    if (filtro === 'hoje') return a.data === hoje;
    if (filtro === 'semana') return a.data >= semanaStart.toISOString().split('T')[0];
    if (filtro === 'mes') return a.data?.startsWith(mesAtual);
    return true;
  }).filter(a => a.pagamento === 'pago');

  const comissoesPorProf = profissionais.map(prof => {
    const ags = agsFiltered.filter(a => a.profissionalId === prof.id);
    const detalhes = {};
    let total = 0;
    ags.forEach(a => {
      const sv = servicos.find(s => s.id === a.servicoId);
      const pct = Number(prof.comissao || sv?.comissao || 0) / 100;
      const val = Number(a.valor || 0) * pct;
      detalhes[a.nomeServico || 'Serviço'] = (detalhes[a.nomeServico || 'Serviço'] || 0) + val;
      total += val;
    });
    return { ...prof, total, detalhes };
  });

  return (
    <div>
      <SectionHeader title="Comissões" />
      <div className="flex gap-2 mb-6">
        {['hoje', 'semana', 'mes', 'tudo'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'hoje' ? 'Hoje' : f === 'semana' ? 'Semana' : f === 'mes' ? 'Mês' : 'Tudo'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {comissoesPorProf.map(p => (
          <Card key={p.id}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">{p.nome?.[0]}</div>
                <div><p className="font-semibold">{p.nome}</p><p className="text-xs text-gray-400">Comissão: {p.comissao || 0}%</p></div>
              </div>
              <div className="text-right"><p className="text-xl font-bold text-orange-600">{fmt(p.total)}</p><p className="text-xs text-gray-400">total a receber</p></div>
            </div>
            {Object.entries(p.detalhes).length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-1">
                {Object.entries(p.detalhes).map(([nome, val]) => (
                  <div key={nome} className="flex justify-between text-sm">
                    <span className="text-gray-600">{nome}</span>
                    <span className="font-medium text-gray-700">{fmt(val)}</span>
                  </div>
                ))}
              </div>
            )}
            {Object.entries(p.detalhes).length === 0 && <p className="text-sm text-gray-400 text-center py-2">Sem serviços no período</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============ RELATORIOS ============
export function Relatorios() {
  const { comandas, agendamentos, clientes, profissionais, servicos, pendencias, addPendencia, updatePendencia, deletePendencia } = useStore();
  const [filtro, setFiltro] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [novaPendencia, setNovaPendencia] = useState('');

  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = new Date().toISOString().slice(0, 7);

  const cs = useMemo(() => comandas.filter(c => {
    if (filtro === 'hoje') return c.data === hoje;
    if (filtro === 'semana') { const d = new Date(); d.setDate(d.getDate() - 7); return c.data >= d.toISOString().split('T')[0]; }
    if (filtro === 'mes') return c.data?.startsWith(mesAtual);
    if (filtro === 'custom') return c.data >= dataInicio && c.data <= dataFim;
    return true;
  }), [comandas, filtro, dataInicio, dataFim]);

  const fat = cs.filter(c => c.pagamento === 'pago').reduce((s, c) => s + Number(c.total || 0), 0);
  const emAberto = cs.filter(c => c.pagamento !== 'pago').reduce((s, c) => s + Number(c.total || 0), 0);
  const ticketMedio = cs.length > 0 ? fat / cs.filter(c => c.pagamento === 'pago').length : 0;

  const agsCancelados = agendamentos.filter(a => a.status === 'cancelado');

  // Por dia da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const porDia = diasSemana.map((d, i) => ({
    dia: d,
    valor: cs.filter(c => c.pagamento === 'pago' && new Date(c.data + 'T00:00:00').getDay() === i).reduce((s, c) => s + Number(c.total || 0), 0),
  }));
  const maxDia = Math.max(...porDia.map(d => d.valor), 1);

  // Formas pagamento
  const porForma = {};
  cs.filter(c => c.pagamento === 'pago').forEach(c => {
    const f = c.formaPagamento || 'Não informado';
    porForma[f] = (porForma[f] || 0) + Number(c.total || 0);
  });
  const aEmAberto = cs.filter(c => c.pagamento !== 'pago').reduce((s, c) => s + Number(c.total || 0), 0);

  // Top clientes
  const topClientes = clientes.map(cli => ({
    nome: cli.nome,
    total: cs.filter(c => c.clienteId === cli.id && c.pagamento === 'pago').reduce((s, c) => s + Number(c.total || 0), 0),
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // Top serviços
  const svCount = {};
  cs.forEach(c => { (c.itens || []).forEach(i => { svCount[i.nome] = (svCount[i.nome] || 0) + 1; }); });
  const topSvs = Object.entries(svCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Ranking profissionais
  const rankProf = profissionais.map(p => ({
    nome: p.nome,
    qtd: agendamentos.filter(a => a.profissionalId === p.id).length,
    fat: agendamentos.filter(a => a.profissionalId === p.id && a.pagamento === 'pago').reduce((s, a) => s + Number(a.valor || 0), 0),
  })).sort((a, b) => b.fat - a.fat);

  return (
    <div>
      <SectionHeader title="Relatórios" />
      <div className="flex gap-2 mb-6 flex-wrap">
        {['hoje', 'semana', 'mes', 'tudo', 'custom'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filtro === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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

      {/* Financeiro geral */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Faturamento" value={fmt(fat)} color="green" />
        <StatCard label="Em Aberto" value={fmt(emAberto)} color="orange" />
        <StatCard label="Comandas" value={cs.length} color="blue" />
        <StatCard label="Ticket Médio" value={fmt(ticketMedio)} color="gray" />
      </div>

      {/* Gráfico por dia da semana */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Faturamento por Dia da Semana</h3>
        <div className="flex items-end gap-2 h-32">
          {porDia.map(d => (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-orange-600 font-medium">{d.valor > 0 ? fmt(d.valor).replace('R$\u00a0', 'R$') : ''}</span>
              <div className="w-full bg-orange-100 rounded-t-md relative" style={{ height: `${(d.valor / maxDia) * 80 + (d.valor > 0 ? 8 : 0)}px`, minHeight: '4px' }}>
                <div className="absolute inset-0 bg-orange-400 rounded-t-md" />
              </div>
              <span className="text-xs text-gray-500">{d.dia}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Formas de Pagamento</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Em Aberto</span><span className="font-medium text-orange-600">{fmt(aEmAberto)}</span></div>
            {Object.entries(porForma).map(([f, v]) => (
              <div key={f} className="flex justify-between py-2 border-b border-gray-50 last:border-0"><span className="text-sm text-gray-600">{f}</span><span className="font-medium text-gray-700">{fmt(v)}</span></div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Top Clientes</h3>
          <div className="space-y-2">
            {topClientes.map((c, i) => (
              <div key={c.nome} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm flex-1">{c.nome}</span>
                <span className="font-bold text-orange-600">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Serviços Mais Vendidos</h3>
          <div className="space-y-2">
            {topSvs.map(([nome, qtd], i) => (
              <div key={nome} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm flex-1 truncate">{nome}</span>
                <span className="font-bold text-gray-700">{qtd}x</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 mb-4">Ranking de Profissionais</h3>
          <div className="space-y-2">
            {rankProf.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1"><p className="text-sm font-medium">{p.nome}</p><p className="text-xs text-gray-400">{p.qtd} serviços</p></div>
                <span className="font-bold text-orange-600">{fmt(p.fat)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pendências */}
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">Pendências em Aberto</h3>
        <div className="flex gap-2 mb-4">
          <Input value={novaPendencia} onChange={e => setNovaPendencia(e.target.value)} placeholder="Descreva a pendência..." className="flex-1" onKeyDown={e => { if (e.key === 'Enter' && novaPendencia.trim()) { addPendencia({ descricao: novaPendencia.trim() }); setNovaPendencia(''); } }} />
          <Btn onClick={() => { if (novaPendencia.trim()) { addPendencia({ descricao: novaPendencia.trim() }); setNovaPendencia(''); } }}>+ Adicionar</Btn>
        </div>
        <div className="space-y-2">
          {pendencias.filter(p => !p.resolvida).map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-orange-50 rounded-lg p-3">
              <input type="checkbox" checked={p.resolvida} onChange={() => updatePendencia(p.id, { resolvida: true })} className="accent-orange-500" />
              <span className="text-sm flex-1">{p.descricao}</span>
              <span className="text-xs text-gray-400">{fmtDate(p.criadaEm)}</span>
              <button onClick={() => { if (confirm('Excluir?')) deletePendencia(p.id); }} className="text-red-400 hover:text-red-600 text-xs">×</button>
            </div>
          ))}
          {pendencias.filter(p => !p.resolvida).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem pendências! 🎉</p>}
        </div>
      </Card>
    </div>
  );
}

// ============ VENDAS ============
export function Vendas() {
  const { agendamentos, clientes, updateAgendamento } = useStore();
  const [search, setSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const filtradas = agendamentos.filter(a => {
    const nome = a.nomeCliente?.toLowerCase() || '';
    const matchSearch = nome.includes(search.toLowerCase()) || a.nomeServico?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFiltro === 'todos' || a.status === statusFiltro || (statusFiltro === 'a_pagar' && a.pagamento === 'a_pagar');
    return matchSearch && matchStatus;
  }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  const statusLabel = { ativo: 'Realizada', cancelado: 'Cancelado', reagendado: 'Reagendado' };
  const statusColor = { ativo: 'green', cancelado: 'red', reagendado: 'blue' };

  return (
    <div>
      <SectionHeader title="Vendas" />
      <div className="flex gap-2 mb-6 flex-wrap">
        <Input placeholder="Buscar cliente ou serviço..." value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
        {['todos', 'ativo', 'cancelado', 'reagendado', 'a_pagar'].map(s => (
          <button key={s} onClick={() => setStatusFiltro(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${statusFiltro === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Realizadas' : s === 'cancelado' ? 'Canceladas' : s === 'reagendado' ? 'Reagendadas' : 'Em Aberto'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 pr-4">Cliente</th><th className="py-3 pr-4">Serviço</th><th className="py-3 pr-4">Valor</th>
            <th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Pagamento</th><th className="py-3 pr-4">Data</th><th className="py-3">Ações</th>
          </tr></thead>
          <tbody>
            {filtradas.map(a => (
              editId === a.id ? (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4">{a.nomeCliente}</td>
                  <td className="py-2 pr-4">{a.nomeServico}</td>
                  <td className="py-2 pr-4"><Input type="number" value={editData.valor} onChange={e => setEditData({ ...editData, valor: e.target.value })} className="w-24" /></td>
                  <td className="py-2 pr-4">
                    <Select value={editData.status || 'ativo'} onChange={e => setEditData({ ...editData, status: e.target.value })} className="w-28">
                      <option value="ativo">Realizada</option><option value="cancelado">Cancelada</option><option value="reagendado">Reagendada</option>
                    </Select>
                  </td>
                  <td className="py-2 pr-4">
                    <Select value={editData.pagamento} onChange={e => setEditData({ ...editData, pagamento: e.target.value })} className="w-24">
                      <option value="a_pagar">A Pagar</option><option value="pago">Pago</option>
                    </Select>
                  </td>
                  <td className="py-2 pr-4">{fmtDate(a.data)}</td>
                  <td className="py-2 flex gap-1">
                    <Btn onClick={() => { updateAgendamento(a.id, editData); setEditId(null); }}>✓</Btn>
                    <Btn variant="secondary" onClick={() => setEditId(null)}>✕</Btn>
                  </td>
                </tr>
              ) : (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{a.nomeCliente}</td>
                  <td className="py-3 pr-4 text-gray-600">{a.nomeServico}</td>
                  <td className="py-3 pr-4 font-semibold text-orange-600">{fmt(a.valor)}</td>
                  <td className="py-3 pr-4"><Badge color={statusColor[a.status] || 'gray'}>{statusLabel[a.status] || a.status}</Badge></td>
                  <td className="py-3 pr-4"><Badge color={a.pagamento === 'pago' ? 'green' : 'yellow'}>{a.pagamento === 'pago' ? 'Pago' : 'A pagar'}</Badge></td>
                  <td className="py-3 pr-4 text-gray-500">{fmtDate(a.data)}</td>
                  <td className="py-3"><Btn variant="ghost" onClick={() => { setEditId(a.id); setEditData({ ...a }); }}>✏️</Btn></td>
                </tr>
              )
            ))}
            {filtradas.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-gray-400">Nenhuma venda encontrada</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ CAIXA ============
export function Caixa() {
  const { caixa, comandas, profissionais, addCaixa, updateCaixa, deleteCaixa } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [form, setForm] = useState({ data: new Date().toISOString().split('T')[0], profissionalId: '', tipo: 'entrada', abertura: '', status: 'aberto', obs: '' });

  const totalDia = comandas.filter(c => c.data === new Date().toISOString().split('T')[0] && c.pagamento === 'pago').reduce((s, c) => s + Number(c.total || 0), 0);
  const totalAberto = comandas.filter(c => c.pagamento !== 'pago').reduce((s, c) => s + Number(c.total || 0), 0);

  return (
    <div>
      <SectionHeader title="Caixa" action={<Btn onClick={() => setShowForm(true)}>+ Abrir Caixa</Btn>} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Caixa Hoje" value={fmt(totalDia)} color="green" />
        <StatCard label="Em Aberto" value={fmt(totalAberto)} color="orange" />
        <StatCard label="Movimentos" value={caixa.length} color="gray" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 pr-4">Data</th><th className="py-3 pr-4">Profissional</th><th className="py-3 pr-4">Tipo</th>
            <th className="py-3 pr-4">Abertura</th><th className="py-3 pr-4">Status</th><th className="py-3">Ações</th>
          </tr></thead>
          <tbody>
            {caixa.map(c => (
              editId === c.id ? (
                <tr key={c.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4"><Input type="date" value={editData.data} onChange={e => setEditData({ ...editData, data: e.target.value })} className="w-36" /></td>
                  <td className="py-2 pr-4">
                    <Select value={editData.profissionalId || ''} onChange={e => setEditData({ ...editData, profissionalId: e.target.value })} className="w-36">
                      <option value="">Selecione...</option>
                      {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </Select>
                  </td>
                  <td className="py-2 pr-4">
                    <Select value={editData.tipo} onChange={e => setEditData({ ...editData, tipo: e.target.value })} className="w-28">
                      <option value="entrada">Entrada</option><option value="saida">Saída</option>
                    </Select>
                  </td>
                  <td className="py-2 pr-4"><Input type="number" value={editData.abertura} onChange={e => setEditData({ ...editData, abertura: e.target.value })} className="w-24" /></td>
                  <td className="py-2 pr-4">
                    <Select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} className="w-28">
                      <option value="aberto">Aberto</option><option value="fechado">Fechado</option>
                    </Select>
                  </td>
                  <td className="py-2 flex gap-1">
                    <Btn onClick={() => { updateCaixa(c.id, editData); setEditId(null); }}>✓</Btn>
                    <Btn variant="secondary" onClick={() => setEditId(null)}>✕</Btn>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4">{fmtDate(c.data)}</td>
                  <td className="py-3 pr-4">{profissionais.find(p => p.id === c.profissionalId)?.nome || '-'}</td>
                  <td className="py-3 pr-4"><Badge color={c.tipo === 'entrada' ? 'green' : 'red'}>{c.tipo}</Badge></td>
                  <td className="py-3 pr-4">{fmt(c.abertura)}</td>
                  <td className="py-3 pr-4"><Badge color={c.status === 'aberto' ? 'orange' : 'gray'}>{c.status}</Badge></td>
                  <td className="py-3 flex gap-1">
                    <Btn variant="ghost" onClick={() => { setEditId(c.id); setEditData({ ...c }); }}>✏️</Btn>
                    <Btn variant="ghost" onClick={() => { if (confirm('Excluir?')) deleteCaixa(c.id); }}>🗑️</Btn>
                  </td>
                </tr>
              )
            ))}
            {caixa.length === 0 && <tr><td colSpan={6} className="py-16 text-center text-gray-400">Nenhum lançamento de caixa</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Lançamento de Caixa" size="md">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Data"><Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></FormField>
          <FormField label="Profissional">
            <Select value={form.profissionalId} onChange={e => setForm({ ...form, profissionalId: e.target.value })}>
              <option value="">Selecione...</option>
              {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </FormField>
          <FormField label="Tipo">
            <Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="entrada">Entrada</option><option value="saida">Saída</option>
            </Select>
          </FormField>
          <FormField label="Valor de Abertura (R$)"><Input type="number" value={form.abertura} onChange={e => setForm({ ...form, abertura: e.target.value })} /></FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="aberto">Aberto</option><option value="fechado">Fechado</option>
            </Select>
          </FormField>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={() => { addCaixa(form); setForm({ data: new Date().toISOString().split('T')[0], profissionalId: '', tipo: 'entrada', abertura: '', status: 'aberto', obs: '' }); setShowForm(false); }}>Salvar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ============ CONFIGURACOES ============
export function Configuracoes() {
  const { formasPagamento, addFormaPagamento, deleteFormaPagamento } = useStore();
  const [nova, setNova] = useState('');

  return (
    <div>
      <SectionHeader title="Configurações" />
      <Card className="max-w-lg">
        <h3 className="font-semibold text-gray-700 mb-4">Formas de Pagamento</h3>
        <div className="space-y-2 mb-4">
          {formasPagamento.map(f => (
            <div key={f} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium">{f}</span>
              <button onClick={() => { if (confirm(`Excluir "${f}"?`)) deleteFormaPagamento(f); }} className="text-red-400 hover:text-red-600 text-sm">Remover</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={nova} onChange={e => setNova(e.target.value)} placeholder="Nova forma de pagamento..." className="flex-1" onKeyDown={e => { if (e.key === 'Enter' && nova.trim()) { addFormaPagamento(nova.trim()); setNova(''); } }} />
          <Btn onClick={() => { if (nova.trim()) { addFormaPagamento(nova.trim()); setNova(''); } }}>Adicionar</Btn>
        </div>
      </Card>
    </div>
  );
}
