import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Select, Btn, Card, SectionHeader, Badge } from '../components/ui';

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORAS_DIA = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

const defaultHorarios = () => Object.fromEntries(DIAS.map(d => [d, { ativo: false, inicio: '09:00', fim: '18:00' }]));

export default function Profissionais() {
  const { profissionais, addProfissional, updateProfissional, deleteProfissional, servicos } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nome: '', telefone: '', especialidade: '', categorias: '', horarios: defaultHorarios(), comissao: '' });

  const submit = () => {
    if (!form.nome) return alert('Nome é obrigatório');
    addProfissional(form);
    setForm({ nome: '', telefone: '', especialidade: '', categorias: '', horarios: defaultHorarios(), comissao: '' });
    setShowForm(false);
  };

  const saveEdit = () => {
    updateProfissional(selected.id, editData);
    setSelected({ ...selected, ...editData });
  };

  const toggleDia = (dia, data, setData) => {
    setData({ ...data, horarios: { ...data.horarios, [dia]: { ...data.horarios[dia], ativo: !data.horarios[dia]?.ativo } } });
  };

  const HorariosForm = ({ data, setData }) => (
    <div className="space-y-2">
      {DIAS.map(dia => (
        <div key={dia} className="flex items-center gap-3">
          <label className="flex items-center gap-2 w-28">
            <input type="checkbox" checked={data.horarios?.[dia]?.ativo || false} onChange={() => toggleDia(dia, data, setData)} className="accent-orange-500" />
            <span className="text-sm">{dia}</span>
          </label>
          {data.horarios?.[dia]?.ativo && (
            <div className="flex gap-2 items-center">
              <Select value={data.horarios[dia].inicio} onChange={e => setData({ ...data, horarios: { ...data.horarios, [dia]: { ...data.horarios[dia], inicio: e.target.value } } })} className="w-28">
                {HORAS_DIA.map(h => <option key={h}>{h}</option>)}
              </Select>
              <span className="text-gray-400 text-sm">até</span>
              <Select value={data.horarios[dia].fim} onChange={e => setData({ ...data, horarios: { ...data.horarios, [dia]: { ...data.horarios[dia], fim: e.target.value } } })} className="w-28">
                {HORAS_DIA.map(h => <option key={h}>{h}</option>)}
              </Select>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHeader title="Profissionais" action={<Btn onClick={() => setShowForm(true)}>+ Novo Profissional</Btn>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profissionais.map(p => (
          <Card key={p.id} onClick={() => { setSelected(p); setEditData({ ...p, horarios: p.horarios || defaultHorarios() }); }} className="cursor-pointer hover:border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-lg">
                {p.nome?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{p.nome}</p>
                <p className="text-xs text-gray-400">{p.especialidade || 'Sem especialidade'}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              {p.telefone && <p>📱 {p.telefone}</p>}
              {p.categorias && <p>🏷️ {p.categorias}</p>}
              {p.comissao && <p>💰 Comissão: {p.comissao}%</p>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {DIAS.filter(d => p.horarios?.[d]?.ativo).map(d => (
                <Badge key={d} color="orange">{d.slice(0, 3)}</Badge>
              ))}
            </div>
          </Card>
        ))}
        {profissionais.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Nenhum profissional cadastrado</div>}
      </div>

      {/* Form Novo */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Profissional" size="lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Nome" required><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></FormField>
          <FormField label="Telefone"><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></FormField>
          <FormField label="Especialidade"><Input value={form.especialidade} onChange={e => setForm({ ...form, especialidade: e.target.value })} /></FormField>
          <FormField label="Categorias que atende"><Input value={form.categorias} onChange={e => setForm({ ...form, categorias: e.target.value })} placeholder="Ex: Pele, Unhas, Cabelo" /></FormField>
          <FormField label="% Comissão padrão"><Input type="number" value={form.comissao} onChange={e => setForm({ ...form, comissao: e.target.value })} placeholder="Ex: 30" /></FormField>
        </div>
        <FormField label="Horários de Atendimento">
          <HorariosForm data={form} setData={setForm} />
        </FormField>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar</Btn>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditData(null); }} title={selected?.nome} size="lg">
        {selected && editData && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Nome"><Input value={editData.nome} onChange={e => setEditData({ ...editData, nome: e.target.value })} /></FormField>
              <FormField label="Telefone"><Input value={editData.telefone || ''} onChange={e => setEditData({ ...editData, telefone: e.target.value })} /></FormField>
              <FormField label="Especialidade"><Input value={editData.especialidade || ''} onChange={e => setEditData({ ...editData, especialidade: e.target.value })} /></FormField>
              <FormField label="Categorias"><Input value={editData.categorias || ''} onChange={e => setEditData({ ...editData, categorias: e.target.value })} /></FormField>
              <FormField label="% Comissão">
                <Input type="number" value={editData.comissao || ''} onChange={e => setEditData({ ...editData, comissao: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Horários de Atendimento">
              <HorariosForm data={editData} setData={setEditData} />
            </FormField>
            <div className="flex justify-between mt-6">
              <Btn variant="danger" onClick={() => { if (confirm('Excluir profissional?')) { deleteProfissional(selected.id); setSelected(null); } }}>Excluir</Btn>
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
