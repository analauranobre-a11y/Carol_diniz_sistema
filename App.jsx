import React, { useState } from 'react';
import Agenda from './pages/Agenda';
import Clientes from './pages/Clientes';
import Profissionais from './pages/Profissionais';
import Servicos from './pages/Servicos';
import Comandas from './pages/Comandas';
import Financeiro from './pages/Financeiro';
import { Pacotes, Estoque, Comissoes, Relatorios, Vendas, Caixa, Configuracoes } from './pages/OutrasPages';

const NAV = [
  { id: 'agenda', label: 'Agenda', icon: '📅' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'profissionais', label: 'Profissionais', icon: '💆' },
  { id: 'comandas', label: 'Comandas', icon: '📋' },
  { id: 'financeiro', label: 'Financeiro', icon: '💰' },
  { id: 'servicos', label: 'Serviços', icon: '✨' },
  { id: 'pacotes', label: 'Pacotes', icon: '🎁' },
  { id: 'comissoes', label: 'Comissões', icon: '💵' },
  { id: 'relatorios', label: 'Relatórios', icon: '📊' },
  { id: 'vendas', label: 'Vendas', icon: '🛒' },
  { id: 'caixa', label: 'Caixa', icon: '🏦' },
  { id: 'estoque', label: 'Estoque', icon: '📦' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
];

const PAGES = {
  agenda: Agenda,
  clientes: Clientes,
  profissionais: Profissionais,
  comandas: Comandas,
  financeiro: Financeiro,
  servicos: Servicos,
  pacotes: Pacotes,
  comissoes: Comissoes,
  relatorios: Relatorios,
  vendas: Vendas,
  caixa: Caixa,
  estoque: Estoque,
  configuracoes: Configuracoes,
};

export default function App() {
  const [page, setPage] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const Page = PAGES[page] || Agenda;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shrink-0 shadow-sm`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
            <span className="text-white text-lg">✦</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-gray-800 text-sm leading-none">Studio</p>
              <p className="text-orange-500 text-xs font-medium">Estética</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all mx-0 ${
                page === item.id
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 flex items-center justify-center"
        >
          <span>{sidebarOpen ? '◀' : '▶'}</span>
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Page />
        </div>
      </main>
    </div>
  );
}
