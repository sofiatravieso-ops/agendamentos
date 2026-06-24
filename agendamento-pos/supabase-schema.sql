-- ============================================================
-- COLE ESTE ARQUIVO INTEIRO NO "SQL EDITOR" DO SUPABASE E CLIQUE EM "RUN"
-- ============================================================

create extension if not exists "uuid-ossp";

-- Tabela de horários disponíveis para cada teste
create table if not exists slots (
  id uuid primary key default uuid_generate_v4(),
  test_id text not null,           -- 'forca' | 'composicao' | 'cardio' | 'sangue'
  date date not null,
  time text,                       -- 'HH:MM' ou null (exame de sangue não tem horário fixo)
  capacity int not null default 1, -- quantas pessoas cabem nesse horário (sangue = 12 a 15)
  booked_count int not null default 0
);

create index if not exists idx_slots_test on slots(test_id);

-- Tabela de participantes
create table if not exists participants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  whatsapp text not null,
  created_at timestamptz not null default now()
);

-- Tabela de agendamentos (liga participante a um slot)
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references participants(id) on delete cascade,
  slot_id uuid not null references slots(id) on delete cascade,
  test_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_participant on bookings(participant_id);
create index if not exists idx_bookings_slot on bookings(slot_id);

-- Habilita Row Level Security
alter table slots enable row level security;
alter table participants enable row level security;
alter table bookings enable row level security;

-- Permite leitura pública dos horários (necessário para a tela de agendamento)
drop policy if exists "slots_select_public" on slots;
create policy "slots_select_public" on slots for select using (true);

-- As tabelas participants/bookings só são acessadas pelas rotas do servidor
-- (que usam a service role key), então não criamos políticas de escrita pública.

-- ------------------------------------------------------------
-- Função atômica para reservar um horário (evita duas pessoas
-- pegarem a mesma vaga ao mesmo tempo)
-- ------------------------------------------------------------
create or replace function book_slot(p_slot_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_capacity int;
  v_booked int;
begin
  select capacity, booked_count into v_capacity, v_booked
  from slots
  where id = p_slot_id
  for update;

  if v_booked >= v_capacity then
    return false;
  end if;

  update slots set booked_count = booked_count + 1 where id = p_slot_id;
  return true;
end;
$$;

-- Função para liberar um horário (usada quando a organizadora exclui um agendamento)
create or replace function release_slot(p_slot_id uuid)
returns void
language plpgsql
as $$
begin
  update slots
  set booked_count = greatest(booked_count - 1, 0)
  where id = p_slot_id;
end;
$$;
