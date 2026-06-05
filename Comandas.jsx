import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Select, Btn, Card, SectionHeader, Badge, fmt, fmtDate } from '../components/ui';

export default function Comandas() {
  const { comandas, clientes, servicos, pacotes, formasPagamento, addComanda, updateComanda, deleteComanda } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ clienteId: '', data: new Date().toISOString().split('T')[0], itens: [], pagamento: 'a_pagar', formaPagamento: '', obs: '' });
  const [novoItem, setNovoItem] = useState({ tipo: 'servico', servicoId: '', pacoteId: '', sessao: '', valor: '', descricao: '' });

  const filtradas = comandas.filter(c => {
    const cli = clientes.find(cl => cl.id === c.clienteId);
    return cli?.nome?.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search);
  });

  const calcTotal = (itens) => itens.reduce((s, i) => s + (Number(i.valor) || 0), 0);

  const addItem = (items, setItems) => {
    if (!novoItem.valor) return;
    const servico = servicos.find(s => s.id === novoItem.servicoId);
    const pacote = pacotes.find(p => p.id === novoItem.pacoteId);
    const item = {
      ...novoItem,
      id: Date.now().toString(),
      nome: novoItem.tipo === 'pacote' ? `Pacote: ${pacote?.nome} (Sessão ${novoItem.sessao})` : (novoItem.descricao || servico?.nome || 'Item'),
    };
    const updated = [...items, item];
    setItems(updated);
    setNovoItem({ tipo: 'servico', servicoId: '', pacoteId: '', sessao: '', valor: '', descricao: '' });
    return updated;
  };

  const submit = () => {
    if (!form.clienteId) return alert('Selecione uma cliente');
    if (form.itens.length === 0) return alert('Adicione pelo menos um item');
    addComanda({ ...form, total: calcTotal(form.itens), nomeCliente: clientes.find(c => c.id === form.clienteId)?.nome });
    setForm({ clienteId: '', data: new Date().toISOString().split('T')[0], itens: [], pagamento: 'a_pagar', formaPagamento: '', obs: '' });
    setShowForm(false);
  };

  const saveEdit = () => {
    updateComanda(selected.id, { ...editData, total: calcTotal(editData.itens) });
    setSelected(null);
    setEditData(null);
  };

  const statusBadge = (c) => {
    if (c.pagamento === 'pago') return <Badge color="green">Pago</Badge>;
    return <Badge color="yellow">Em aberto</Badge>;
  };

  const ItemForm = ({ items, setItems }) => (
    <div className="bg-gray-50 rounded-xl p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Adicionar Item</h4>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo">
          <Select value={novoItem.tipo} onChange={e => setNovoItem({ ...novoItem, tipo: e.target.value })}>
            <option value="servico">Serviço</option>
            <option value="pacote">Pacote</option>
            <option value="produto">Produto</option>
          </Select>
        </FormField>
        {novoItem.tipo === 'servico' && (
          <FormField label="Serviço">
            <Select value={novoItem.servicoId} onChange={e => {
              const sv = servicos.find(s => s.id === e.target.value);
              setNovoItem({ ...novoItem, servicoId: e.target.value, valor: sv?.valor || '' });
            }}>
              <option value="">Selecione...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          </FormField>
        )}
        {novoItem.tipo === 'pacote' && (
          <>
            <FormField label="Pacote">
              <Select value={novoItem.pacoteId} onChange={e => {
                const pk = pacotes.find(p => p.id === e.target.value);
                setNovoItem({ ...novoItem, pacoteId: e.target.value, valor: pk?.valorSessao || '' });
              }}>
                <option value="">Selecione...</option>
                {pacotes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </FormField>
            <FormField label="Número da Sessão">
              <Input type="number" value={novoItem.sessao} onChange={e => setNovoItem({ ...novoItem, sessao: e.target.value })} placeholder="Ex: 1" />
            </FormField>
          </>
        )}
        {novoItem.tipo === 'produto' && (
          <FormField label="Descrição">
            <Input value={novoItem.descricao} onChange={e => setNovoItem({ ...novoItem, descricao: e.target.value })} />
          </FormField>
        )}
        <FormField label="Valor (R$)">
          <Input type="number" step="0.01" value={novoItem.valor} onChange={e => setNovoItem({ ...novoItem, valor: e.target.value })} />
        </FormField>
      </div>
      <Btn variant="outline" onClick={() => addItem(items, setItems)} className="mt-2">+ Adicionar</Btn>

      {/* Lista de itens */}
      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map((item, i) => (
            <div key={item.id || i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-100">
              <span className="text-sm">{item.nome}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">{fmt(item.valor)}</span>
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs">×</button>
              </div>
            </div>
          ))}
          <div className="flex justify-end font-bold text-gray-800 pt-2 border-t border-gray-200">
            Total: {fmt(calcTotal(items))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <SectionHeader title="Comandas" action={
        <div className="flex gap-2">
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
          <Btn onClick={() => setShowForm(true)}>+ Nova Comanda</Btn>
        </div>
      } />

      <div className="space-y-3">
        {filtradas.length === 0 && <div className="text-center py-16 text-gray-400">Nenhuma comanda encontrada</div>}
        {filtradas.map(c => (
          <Card key={c.id} onClick={() => { setSelected(c); setEditData({ ...c, itens: [...(c.itens || [])] }); }} className="cursor-pointer hover:border-orange-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{c.nomeCliente || clientes.find(cl => cl.id === c.clienteId)?.nome || 'Cliente'}</p>
                <p className="text-xs text-gray-400">{fmtDate(c.data)} · {(c.itens || []).length} item(s)</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {(c.itens || []).map((it, i) => <span key={i} className="text-xs bg-gray-100 rounded px-2 py-0.5">{it.nome}</span>)}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xl font-bold text-orange-600">{fmt(c.total)}</p>
                {statusBadge(c)}
                {c.formaPagamento && <p className="text-xs text-gray-400">{c.formaPagamento}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nova Comanda */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Comanda" size="lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Cliente" required>
            <Select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormField>
          <FormField label="Data">
            <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
          </FormField>
        </div>
        <ItemForm items={form.itens} setItems={(itens) => setForm({ ...form, itens })} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Pagamento">
            <Select value={form.pagamento} onChange={e => setForm({ ...form, pagamento: e.target.value })}>
              <option value="a_pagar">Em Aberto</option>
              <option value="pago">Pago</option>
            </Select>
          </FormField>
          {form.pagamento === 'pago' && (
            <FormField label="Forma de Pagamento">
              <Select value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })}>
                <option value="">Selecione...</option>
                {formasPagamento.map(f => <option key={f}>{f}</option>)}
              </Select>
            </FormField>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar Comanda</Btn>
        </div>
      </Modal>

      {/* Modal Editar Comanda */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditData(null); }} title="Editar Comanda" size="lg">
        {editData && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Cliente">
                <Select value={editData.clienteId} onChange={e => setEditData({ ...editData, clienteId: e.target.value, nomeCliente: clientes.find(c => c.id === e.target.value)?.nome })}>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormField>
              <FormField label="Data">
                <Input type="date" value={editData.data} onChange={e => setEditData({ ...editData, data: e.target.value })} />
              </FormField>
            </div>
            <ItemForm items={editData.itens || []} setItems={(itens) => setEditData({ ...editData, itens })} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Pagamento">
                <Select value={editData.pagamento} onChange={e => setEditData({ ...editData, pagamento: e.target.value })}>
                  <option value="a_pagar">Em Aberto</option>
                  <option value="pago">Pago</option>
                </Select>
              </FormField>
              {editData.pagamento === 'pago' && (
                <FormField label="Forma de Pagamento">
                  <Select value={editData.formaPagamento || ''} onChange={e => setEditData({ ...editData, formaPagamento: e.target.value })}>
                    <option value="">Selecione...</option>
                    {formasPagamento.map(f => <option key={f}>{f}</option>)}
                  </Select>
                </FormField>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Btn variant="danger" onClick={() => { if (confirm('Excluir comanda?')) { deleteComanda(selected.id); setSelected(null); } }}>Excluir</Btn>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => { setSelected(null); setEditData(null); }}>Fechar</Btn>
                <Btn onClick={saveEdit}>Salvar</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
