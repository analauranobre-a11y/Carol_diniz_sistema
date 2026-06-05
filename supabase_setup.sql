-- CLIENTES
create table if not exists clientes (
  id text primary key,
  nome text not null,
  telefone text,
  fotos text[] default '{}',
  preferencias text default '',
  alergias text default '',
  created_at timestamp with time zone default now()
);

-- PROFISSIONAIS
create table if not exists profissionais (
  id text primary key,
  nome text not null,
  telefone text,
  especialidade text,
  categorias text,
  horarios jsonb default '{}',
  comissao text,
  created_at timestamp with time zone default now()
);

-- SERVICOS
create table if not exists servicos (
  id text primary key,
  nome text not null,
  categoria text,
  descricao text,
  duracao integer default 60,
  valor numeric default 0,
  comissao text,
  custo numeric default 0,
  created_at timestamp with time zone default now()
);

-- CATEGORIAS
create table if not exists categorias (
  id serial primary key,
  nome text unique not null
);

-- AGENDAMENTOS
create table if not exists agendamentos (
  id text primary key,
  cliente_id text,
  nome_cliente text,
  servico_id text,
  nome_servico text,
  profissional_id text,
  nome_profissional text,
  data text,
  hora text,
  pagamento text default 'a_pagar',
  forma_pagamento text,
  valor numeric default 0,
  duracao integer default 60,
  obs text,
  status text default 'ativo',
  created_at timestamp with time zone default now()
);

-- AGENDAMENTOS CANCELADOS
create table if not exists agendamentos_cancelados (
  id text primary key,
  cliente_id text,
  nome_cliente text,
  servico_id text,
  nome_servico text,
  profissional_id text,
  nome_profissional text,
  data text,
  hora text,
  pagamento text,
  forma_pagamento text,
  valor numeric default 0,
  obs text,
  motivo_cancelamento text,
  cancelado_em text,
  created_at timestamp with time zone default now()
);

-- COMANDAS
create table if not exists comandas (
  id text primary key,
  cliente_id text,
  nome_cliente text,
  data text,
  itens jsonb default '[]',
  total numeric default 0,
  pagamento text default 'a_pagar',
  forma_pagamento text,
  obs text,
  created_at timestamp with time zone default now()
);

-- PACOTES
create table if not exists pacotes (
  id text primary key,
  nome text not null,
  valor numeric default 0,
  validade text,
  servicos_vinculados text[] default '{}',
  valor_sessao numeric default 0,
  qtd_sessoes text,
  created_at timestamp with time zone default now()
);

-- ESTOQUE
create table if not exists estoque (
  id text primary key,
  produto text not null,
  quantidade text,
  custo numeric default 0,
  created_at timestamp with time zone default now()
);

-- CONSUMO POR SERVICO
create table if not exists consumo_por_servico (
  id text primary key,
  servico_id text,
  nome_servico text,
  produto_id text,
  nome_produto text,
  quantidade text,
  created_at timestamp with time zone default now()
);

-- FORMAS DE PAGAMENTO
create table if not exists formas_pagamento (
  id serial primary key,
  nome text unique not null
);

-- Inserir formas padrão
insert into formas_pagamento (nome) values
  ('Dinheiro'), ('PIX'), ('Cartão de Débito'), ('Cartão de Crédito')
on conflict (nome) do nothing;

-- META MENSAL
create table if not exists configuracoes (
  id text primary key default 'global',
  meta_mensal numeric default 0
);
insert into configuracoes (id, meta_mensal) values ('global', 0)
on conflict (id) do nothing;

-- PENDENCIAS
create table if not exists pendencias (
  id text primary key,
  descricao text,
  resolvida boolean default false,
  criada_em text,
  created_at timestamp with time zone default now()
);

-- CAIXA
create table if not exists caixa (
  id text primary key,
  data text,
  profissional_id text,
  tipo text,
  abertura numeric default 0,
  status text default 'aberto',
  obs text,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS (Row Level Security) com acesso público para todas as tabelas
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
alter table configuracoes enable row level security;
alter table pendencias enable row level security;
alter table caixa enable row level security;

-- Policies de acesso público (qualquer um com o link acessa)
create policy "public_all" on clientes for all using (true) with check (true);
create policy "public_all" on profissionais for all using (true) with check (true);
create policy "public_all" on servicos for all using (true) with check (true);
create policy "public_all" on categorias for all using (true) with check (true);
create policy "public_all" on agendamentos for all using (true) with check (true);
create policy "public_all" on agendamentos_cancelados for all using (true) with check (true);
create policy "public_all" on comandas for all using (true) with check (true);
create policy "public_all" on pacotes for all using (true) with check (true);
create policy "public_all" on estoque for all using (true) with check (true);
create policy "public_all" on consumo_por_servico for all using (true) with check (true);
create policy "public_all" on formas_pagamento for all using (true) with check (true);
create policy "public_all" on configuracoes for all using (true) with check (true);
create policy "public_all" on pendencias for all using (true) with check (true);
create policy "public_all" on caixa for all using (true) with check (true);
