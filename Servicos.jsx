import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Select, Textarea, Btn, Card, SectionHeader, Badge, fmt } from '../components/ui';

export default function Servicos() {
  const { servicos, categorias, addServico, updateServico, deleteServico, addCategoria, deleteCategoria } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [form, setForm] = useState({ nome: '', categoria: '', descricao: '', duracao: 60, valor: '', comissao: '', custo: '' });
  const [search, setSearch] = useState('');

  const filtered = servicos.filter(s => s.nome?.toLowerCase().includes(search.toLowerCase()));

  const submit = () => {
    if (!form.nome || !form.valor) return alert('Nome e valor são obrigatórios');
    addServico(form);
    setForm({ nome: '', categoria: '', descricao: '', duracao: 60, valor: '', comissao: '', custo: '' });
    setShowForm(false);
  };

  const saveEdit = () => {
    updateServico(selected.id, editData);
    setSelected({ ...selected, ...editData });
  };

  const FormServico = ({ data, setData }) => (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Nome do Serviço" required><Input value={data.nome} onChange={e => setData({ ...data, nome: e.target.value })} /></FormField>
      <FormField label="Categoria">
        <div className="flex gap-2">
          <Select value={data.categoria} onChange={e => setData({ ...data, categoria: e.target.value })} className="flex-1">
            <option value="">Sem categoria</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
      </FormField>
      <FormField label="Duração (min)" required>
        <Input type="number" value={data.duracao} onChange={e => setData({ ...data, duracao: Number(e.target.value) })} />
      </FormField>
      <FormField label="Valor (R$)" required><Input type="number" step="0.01" value={data.valor} onChange={e => setData({ ...data, valor: e.target.value })} /></FormField>
      <FormField label="% Comissão"><Input type="number" value={data.comissao || ''} onChange={e => setData({ ...data, comissao: e.target.value })} placeholder="Ex: 30" /></FormField>
      <FormField label="Custo (R$)"><Input type="number" step="0.01" value={data.custo || ''} onChange={e => setData({ ...data, custo: e.target.value })} /></FormField>
      <FormField label="Descrição" className="col-span-2">
        <Textarea value={data.descricao || ''} onChange={e => setData({ ...data, descricao: e.target.value })} placeholder="Descrição do serviço..." />
      </FormField>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Serviços" action={
        <div className="flex gap-2">
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
          <Btn onClick={() => setShowForm(true)}>+ Novo Serviço</Btn>
        </div>
      } />

      {/* Categorias */}
      <div className="mb-6 bg-orange-50 rounded-xl p-4 border border-orange-100">
        <h3 className="text-sm font-semibold text-orange-700 mb-3">Categorias</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {categorias.map(c => (
            <span key={c} className="inline-flex items-center gap-1 bg-white border border-orange-200 rounded-full px-3 py-1 text-xs text-orange-700">
              {c}
              <button onClick={() => deleteCategoria(c)} className="text-orange-400 hover:text-red-500 ml-1">×</button>
            </span>
          ))}
          {categorias.length === 0 && <span className="text-xs text-gray-400">Nenhuma categoria</span>}
        </div>
        <div className="flex gap-2">
          <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="Nova categoria..." className="w-48" onKeyDown={e => { if (e.key === 'Enter' && novaCategoria.trim()) { addCategoria(novaCategoria.trim()); setNovaCategoria(''); } }} />
          <Btn variant="outline" onClick={() => { if (novaCategoria.trim()) { addCategoria(novaCategoria.trim()); setNovaCategoria(''); } }}>Adicionar</Btn>
        </div>
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <Card key={s.id} onClick={() => { setSelected(s); setEditData({ ...s }); }} className="cursor-pointer hover:border-orange-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{s.nome}</p>
                {s.categoria && <Badge color="orange">{s.categoria}</Badge>}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-600">{fmt(s.valor)}</p>
                <p className="text-xs text-gray-400">{s.duracao} min</p>
              </div>
            </div>
            {s.descricao && <p className="text-xs text-gray-500 truncate">{s.descricao}</p>}
            <div className="flex gap-3 mt-2 text-xs text-gray-400">
              {s.comissao && <span>Comissão: {s.comissao}%</span>}
              {s.custo && <span>Custo: {fmt(s.custo)}</span>}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Nenhum serviço cadastrado</div>}
      </div>

      {/* Modal Novo */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Serviço" size="lg">
        <FormServico data={form} setData={setForm} />
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar</Btn>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditData(null); }} title="Editar Serviço" size="lg">
        {editData && (
          <div>
            <FormServico data={editData} setData={setEditData} />
            <div className="flex justify-between mt-4">
              <Btn variant="danger" onClick={() => { if (confirm('Excluir serviço?')) { deleteServico(selected.id); setSelected(null); } }}>Excluir</Btn>
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
