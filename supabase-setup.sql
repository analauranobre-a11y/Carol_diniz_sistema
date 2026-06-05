-- =============================================
-- SCRIPT COMPLETO - STUDIO ESTÉTICA
-- Cole isso no SQL Editor do Supabase
-- =============================================

-- CLIENTES
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text,
  fotos jsonb default '[]',
  preferencias text default '',
  alergias text default '',
  created_at timestamptz default now()
);

-- PROFISSIONAIS
create table if not exists profissionais (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text,
  especialidade text,
  categorias text,
  horarios jsonb default '{}',
  comissao text,
  created_at timestamptz default now()
);

-- SERVIÇOS
create table if not exists servicos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  categoria text,
  descricao text,
  duracao integer default 60,
  valor numeric(10,2),
  comissao text,
  custo numeric(10,2),
  created_at timestamptz default now()
);

-- CATEGORIAS
create table if not exists categorias (
  id uuid default gen_random_uuid() primary key,
  nome text unique not null,
  created_at timestamptz default now()
);

-- AGENDAMENTOS
create table if not exists agendamentos (
  id uuid default gen_random_uuid() primary key,
  clienteid text,
  nomecliente text,
  servicoid text,
  nomeservico text,
  profissionalid text,
  nomeprofissional text,
  data date,
  hora text,
  pagamento text default 'a_pagar',
  formapagamento text,
  valor numeric(10,2),
  duracao integer,
  obs text,
  status text default 'ativo',
  created_at timestamptz default now()
);

-- AGENDAMENTOS CANCELADOS
create table if not exists agendamentos_cancelados (
  id uuid default gen_random_uuid() primary key,
  clienteid text,
  nomecliente text,
  servicoid text,
  nomeservico text,
  profissionalid text,
  nomeprofissional text,
  data date,
  hora text,
  pagamento text,
  valor numeric(10,2),
  obs text,
  motivocancelamento text,
  canceladoem timestamptz,
  created_at timestamptz default now()
);

-- COMANDAS
create table if not exists comandas (
  id uuid default gen_random_uuid() primary key,
  clienteid text,
  nomecliente text,
  data date,
  itens jsonb default '[]',
  total numeric(10,2) default 0,
  pagamento text default 'a_pagar',
  formapagamento text,
  obs text,
  created_at timestamptz default now()
);

-- PACOTES
create table if not exists pacotes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  valor numeric(10,2),
  validade text,
  servicosvinculados jsonb default '[]',
  valorsessao numeric(10,2),
  qtdsessoes text,
  created_at timestamptz default now()
);

-- ESTOQUE
create table if not exists estoque (
  id uuid default gen_random_uuid() primary key,
  produto text not null,
  quantidade numeric(10,2),
  custo numeric(10,2),
  created_at timestamptz default now()
);

-- CONSUMO POR SERVIÇO
create table if not exists consumo_por_servico (
  id uuid default gen_random_uuid() primary key,
  servicoid text,
  nomeservico text,
  produtoid text,
  nomeproduto text,
  quantidade numeric(10,2),
  created_at timestamptz default now()
);

-- FORMAS DE PAGAMENTO
create table if not exists formas_pagamento (
  id uuid default gen_random_uuid() primary key,
  nome text unique not null,
  created_at timestamptz default now()
);

-- Inserir formas padrão
insert into formas_pagamento (nome) values
  ('Dinheiro'), ('PIX'), ('Cartão de Débito'), ('Cartão de Crédito')
on conflict (nome) do nothing;

-- PENDÊNCIAS
create table if not exists pendencias (
  id uuid default gen_random_uuid() primary key,
  descricao text not null,
  resolvida boolean default false,
  criadaem timestamptz default now(),
  created_at timestamptz default now()
);

-- CAIXA
create table if not exists caixa (
  id uuid default gen_random_uuid() primary key,
  data date,
  profissionalid text,
  tipo text,
  abertura numeric(10,2),
  status text default 'aberto',
  obs text,
  created_at timestamptz default now()
);

-- CONFIGURAÇÕES (meta mensal etc)
create table if not exists configuracoes (
  id uuid default gen_random_uuid() primary key,
  chave text unique not null,
  valor text,
  created_at timestamptz default now()
);

-- =============================================
-- LIBERAR ACESSO PÚBLICO (RLS)
-- =============================================

alter table clientes enable row level security;
alter table profissionais enable row level security;
alter table servicos enable row level security;
alter table categorias enable row level security;
alter table agendamentos enable row level security;
alter table agendamentos_cancelados enable row level security;
alter table comandas enable row level security;
alter table pacotes enable row level security;
alter table estoque enable row level security;
alter table consumo_por_servico enable row level security;
alter table formas_pagamento enable row level security;
alter table pendencias enable row level security;
alter table caixa enable row level security;
alter table configuracoes enable row level security;

-- Políticas de acesso público (qualquer pessoa com o link acessa)
create policy "acesso publico" on clientes for all using (true) with check (true);
create policy "acesso publico" on profissionais for all using (true) with check (true);
create policy "acesso publico" on servicos for all using (true) with check (true);
create policy "acesso publico" on categorias for all using (true) with check (true);
create policy "acesso publico" on agendamentos for all using (true) with check (true);
create policy "acesso publico" on agendamentos_cancelados for all using (true) with check (true);
create policy "acesso publico" on comandas for all using (true) with check (true);
create policy "acesso publico" on pacotes for all using (true) with check (true);
create policy "acesso publico" on estoque for all using (true) with check (true);
create policy "acesso publico" on consumo_por_servico for all using (true) with check (true);
create policy "acesso publico" on formas_pagamento for all using (true) with check (true);
create policy "acesso publico" on pendencias for all using (true) with check (true);
create policy "acesso publico" on caixa for all using (true) with check (true);
create policy "acesso publico" on configuracoes for all using (true) with check (true);
