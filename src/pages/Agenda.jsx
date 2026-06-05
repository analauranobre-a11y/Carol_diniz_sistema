import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Modal, FormField, Input, Select, Btn, Badge, Card, SectionHeader, fmt } from '../components/ui';

const HORAS = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

const statusColor = (status) => {
  if (status === 'cancelado') return 'bg-red-100 border-l-4 border-red-400 text-red-800';
  if (status === 'pago') return 'bg-green-100 border-l-4 border-green-400 text-green-800';
  return 'bg-orange-50 border-l-4 border-orange-400 text-orange-800';
};

export default function Agenda() {
  const { agendamentos, clientes, profissionais, servicos, formasPagamento, addAgendamento, updateAgendamento, cancelarAgendamento } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [dataSel, setDataSel] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ clienteId: '', servicoId: '', profissionalId: '', data: dataSel, hora: '09:00', pagamento: 'a_pagar', formaPagamento: '', obs: '' });
  const [motivo, setMotivo] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const agsDia = agendamentos.filter(a => a.data === dataSel && a.status !== 'cancelado');

  const submit = () => {
    if (!form.clienteId || !form.servicoId || !form.profissionalId) return alert('Preencha todos os campos obrigatórios');
    const servico = servicos.find(s => s.id === form.servicoId);
    addAgendamento({ ...form, nomeCliente: clientes.find(c => c.id === form.clienteId)?.nome, nomeServico: servico?.nome, nomeProfissional: profissionais.find(p => p.id === form.profissionalId)?.nome, duracao: servico?.duracao || 60, valor: servico?.valor || 0 });
    setForm({ clienteId: '', servicoId: '', profissionalId: '', data: dataSel, hora: '09:00', pagamento: 'a_pagar', formaPagamento: '', obs: '' });
    setShowForm(false);
  };

  const saveEdit = () => {
    updateAgendamento(selected.id, editMode);
    setSelected(null);
    setEditMode(false);
  };

  const confirmarCancelamento = () => {
    cancelarAgendamento(selected.id, motivo);
    setSelected(null);
    setShowCancelConfirm(false);
    setMotivo('');
  };

  // Faturamento previsto
  const prevDiario = agsDia.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const semanaStart = new Date(); semanaStart.setDate(semanaStart.getDate() - semanaStart.getDay());
  const prevSemanal = agendamentos.filter(a => a.data >= semanaStart.toISOString().split('T')[0] && a.data <= new Date(semanaStart.getTime() + 6 * 86400000).toISOString().split('T')[0]).reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const prevMensal = agendamentos.filter(a => a.data?.startsWith(mesAtual)).reduce((s, a) => s + (Number(a.valor) || 0), 0);

  return (
    <div>
      <SectionHeader title="Agenda" action={
        <div className="flex gap-2 items-center">
          <Input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} className="w-40" />
          <Btn onClick={() => setShowForm(true)}>+ Agendamento</Btn>
        </div>
      } />

      {/* Previsão */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Previsão Diária', val: fmt(prevDiario) },
          { label: 'Previsão Semanal', val: fmt(prevSemanal) },
          { label: 'Previsão Mensal', val: fmt(prevMensal) },
        ].map(s => (
          <div key={s.label} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-xs text-orange-600 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-orange-700 mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Grid por profissional */}
      {profissionais.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Cadastre profissionais para ver o dashboard de agenda</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-16 text-left text-gray-500 font-normal py-2 pr-4">Hora</th>
                {profissionais.map(p => (
                  <th key={p.id} className="text-left px-2 py-2 font-semibold text-gray-700 min-w-40">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{p.nome?.[0]}</div>
                      {p.nome}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora => (
                <tr key={hora} className="border-t border-gray-50">
                  <td className="text-gray-400 text-xs py-2 pr-4 align-top pt-3">{hora}</td>
                  {profissionais.map(prof => {
                    const ag = agsDia.find(a => a.profissionalId === prof.id && a.hora === hora);
                    return (
                      <td key={prof.id} className="px-2 py-1 align-top">
                        {ag ? (
                          <div
                            className={`rounded-lg p-2 cursor-pointer text-xs ${statusColor(ag.pagamento)}`}
                            onClick={() => { setSelected(ag); setEditMode({ ...ag }); }}
                          >
                            <div className="font-semibold">{ag.nomeCliente}</div>
                            <div className="opacity-80">{ag.nomeServico}</div>
                            <div className="opacity-60">{fmt(ag.valor)}</div>
                          </div>
                        ) : (
                          <div className="h-8 rounded border border-dashed border-gray-100 hover:border-orange-200 transition-colors" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Agendamento */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Agendamento">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cliente" required>
            <Select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormField>
          <FormField label="Serviço" required>
            <Select value={form.servicoId} onChange={e => setForm({ ...form, servicoId: e.target.value })}>
              <option value="">Selecione...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - {fmt(s.valor)}</option>)}
            </Select>
          </FormField>
          <FormField label="Profissional" required>
            <Select value={form.profissionalId} onChange={e => setForm({ ...form, profissionalId: e.target.value })}>
              <option value="">Selecione...</option>
              {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </FormField>
          <FormField label="Data" required>
            <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
          </FormField>
          <FormField label="Horário" required>
            <Select value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })}>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </Select>
          </FormField>
          <FormField label="Pagamento">
            <Select value={form.pagamento} onChange={e => setForm({ ...form, pagamento: e.target.value })}>
              <option value="a_pagar">A Pagar</option>
              <option value="pago">Pago</option>
            </Select>
          </FormField>
          {form.pagamento === 'pago' && (
            <FormField label="Forma de Pagamento">
              <Select value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })}>
                <option value="">Selecione...</option>
                {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
            </FormField>
          )}
          <FormField label="Observações" className="col-span-2">
            <Input value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} placeholder="Informações adicionais..." />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
          <Btn onClick={submit}>Salvar Agendamento</Btn>
        </div>
      </Modal>

      {/* Modal Detalhes Agendamento */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setEditMode(false); }} title="Detalhes do Agendamento">
        {selected && editMode && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Cliente">
                <Select value={editMode.clienteId} onChange={e => setEditMode({ ...editMode, clienteId: e.target.value, nomeCliente: clientes.find(c => c.id === e.target.value)?.nome })}>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormField>
              <FormField label="Serviço">
                <Select value={editMode.servicoId} onChange={e => {
                  const sv = servicos.find(s => s.id === e.target.value);
                  setEditMode({ ...editMode, servicoId: e.target.value, nomeServico: sv?.nome, valor: sv?.valor });
                }}>
                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </Select>
              </FormField>
              <FormField label="Data">
                <Input type="date" value={editMode.data} onChange={e => setEditMode({ ...editMode, data: e.target.value })} />
              </FormField>
              <FormField label="Hora">
                <Select value={editMode.hora} onChange={e => setEditMode({ ...editMode, hora: e.target.value })}>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
              </FormField>
              <FormField label="Pagamento">
                <Select value={editMode.pagamento} onChange={e => setEditMode({ ...editMode, pagamento: e.target.value })}>
                  <option value="a_pagar">A Pagar</option>
                  <option value="pago">Pago</option>
                </Select>
              </FormField>
              {editMode.pagamento === 'pago' && (
                <FormField label="Forma">
                  <Select value={editMode.formaPagamento || ''} onChange={e => setEditMode({ ...editMode, formaPagamento: e.target.value })}>
                    <option value="">Selecione...</option>
                    {formasPagamento.map(f => <option key={f}>{f}</option>)}
                  </Select>
                </FormField>
              )}
              <FormField label="Obs" className="col-span-2">
                <Input value={editMode.obs || ''} onChange={e => setEditMode({ ...editMode, obs: e.target.value })} />
              </FormField>
            </div>
            <div className="flex justify-between mt-4">
              <Btn variant="danger" onClick={() => setShowCancelConfirm(true)}>Cancelar Agendamento</Btn>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => { setSelected(null); setEditMode(false); }}>Fechar</Btn>
                <Btn onClick={saveEdit}>Salvar Alterações</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Cancel */}
      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Confirmar Cancelamento" size="sm">
        <FormField label="Motivo do cancelamento">
          <Input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Descreva o motivo..." />
        </FormField>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setShowCancelConfirm(false)}>Voltar</Btn>
          <Btn variant="danger" onClick={confirmarCancelamento}>Confirmar Cancelamento</Btn>
        </div>
      </Modal>
    </div>
  );
}
