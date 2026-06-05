import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Textarea, Btn, Card, SectionHeader, Badge, fmtDate, fmt } from '../components/ui';

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente, agendamentos, servicos } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '' });
  const fileRef = useRef();

  const filtered = clientes.filter(c => c.nome?.toLowerCase().includes(search.toLowerCase()) || c.telefone?.includes(search));

  const submit = () => {
    if (!form.nome) return alert('Nome é obrigatório');
    addCliente(form);
    setForm({ nome: '', telefone: '' });
    setShowForm(false);
  };

  const openCliente = (c) => {
    setSelected(c);
    setEditData({ ...c });
  };

  const saveEdit = () => {
    updateCliente(selected.id, editData);
    setSelected({ ...selected, ...editData });
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const novas = [...(editData.fotos || []), ev.target.result];
      setEditData({ ...editData, fotos: novas });
    };
    reader.readAsDataURL(file);
  };

  const visitasCliente = selected ? agendamentos.filter(a => a.clienteId === selected.id) : [];
  const servicosRealizados = visitasCliente.reduce((acc, a) => {
    const key = a.nomeServico;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const totalGasto = visitasCliente.reduce((s, a) => s + (Number(a.valor) || 0), 0);

  return (
    <div>
      <SectionHeader title="Clientes" action={
        <div className="flex gap-2">
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-56" />
          <Btn onClick={() => setShowForm(true)}>+ Nova Cliente</Btn>
        </div>
      } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} onClick={() => openCliente(c)} className="hover:border-orange-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                {c.nome?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{c.nome}</p>
                <p className="text-xs text-gray-400">{c.telefone || 'Sem telefone'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{agendamentos.filter(a => a.clienteId === c.id).length} visitas</p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Nenhuma cliente encontrada</div>}
      </div>

      {/* Form Nova Cliente */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Cliente" size="sm">
        <FormField label="Nome" required><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" /></FormField>
        <FormField label="Telefone"><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar</Btn>
        </div>
      </Modal>

      {/* Modal Detalhes Cliente */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditData(null); }} title={selected?.nome} size="lg">
        {selected && editData && (
          <div className="space-y-6">
            {/* Fotos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700">Fotos</h3>
                <Btn variant="outline" onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1">+ Foto</Btn>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(editData.fotos || []).map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={f} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center"
                      onClick={() => setEditData({ ...editData, fotos: editData.fotos.filter((_, j) => j !== i) })}
                    >×</button>
                  </div>
                ))}
                {(editData.fotos || []).length === 0 && <p className="text-sm text-gray-400">Nenhuma foto</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nome"><Input value={editData.nome} onChange={e => setEditData({ ...editData, nome: e.target.value })} /></FormField>
              <FormField label="Telefone"><Input value={editData.telefone || ''} onChange={e => setEditData({ ...editData, telefone: e.target.value })} /></FormField>
              <FormField label="Preferências" className="col-span-2"><Textarea value={editData.preferencias || ''} onChange={e => setEditData({ ...editData, preferencias: e.target.value })} placeholder="Preferências da cliente..." /></FormField>
              <FormField label="Alergias" className="col-span-2"><Textarea value={editData.alergias || ''} onChange={e => setEditData({ ...editData, alergias: e.target.value })} placeholder="Alergias e restrições..." /></FormField>
            </div>

            {/* Visitas */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Histórico de Visitas ({visitasCliente.length})</h3>
              <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto">
                {visitasCliente.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sem visitas registradas</p>
                ) : (
                  <div className="space-y-2">
                    {visitasCliente.map(v => (
                      <div key={v.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100">
                        <div>
                          <p className="text-sm font-medium">{v.nomeServico}</p>
                          <p className="text-xs text-gray-400">{fmtDate(v.data)} - {v.hora} · {v.nomeProfissional}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-orange-600">{fmt(v.valor)}</p>
                          <Badge color={v.pagamento === 'pago' ? 'green' : 'yellow'}>{v.pagamento === 'pago' ? 'Pago' : 'A pagar'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <span className="text-gray-500">Total gasto: <strong className="text-orange-600">{fmt(totalGasto)}</strong></span>
                <span className="text-gray-500">Serviços: {Object.entries(servicosRealizados).map(([k, v]) => `${k} (${v}x)`).join(', ') || '-'}</span>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Btn variant="danger" onClick={() => { if (confirm('Excluir cliente?')) { deleteCliente(selected.id); setSelected(null); } }}>Excluir</Btn>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => { setSelected(null); setEditData(null); }}>Fechar</Btn>
                <Btn onClick={saveEdit}>Salvar Alterações</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
