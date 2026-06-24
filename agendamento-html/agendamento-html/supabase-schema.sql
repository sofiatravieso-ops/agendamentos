-- ============================================================
-- COLE ESTE ARQUIVO INTEIRO NO "SQL EDITOR" DO SUPABASE E CLIQUE EM "RUN"
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- TABELAS
-- ------------------------------------------------------------

create table if not exists app_settings (
  key text primary key,
  value text not null
);

-- Defina aqui a senha do painel administrativo (troque "minhasenha123")
insert into app_settings (key, value) values ('admin_password', 'minhasenha123')
  on conflict (key) do nothing;

create table if not exists slots (
  id uuid primary key default uuid_generate_v4(),
  test_id text not null,
  date date not null,
  time text,
  capacity int not null default 1,
  booked_count int not null default 0
);
create index if not exists idx_slots_test on slots(test_id);

create table if not exists participants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  whatsapp text not null,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references participants(id) on delete cascade,
  slot_id uuid not null references slots(id) on delete cascade,
  test_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_bookings_participant on bookings(participant_id);
create index if not exists idx_bookings_slot on bookings(slot_id);

-- ------------------------------------------------------------
-- SEGURANÇA (RLS)
-- Página pública só pode: ler horários, criar participante, criar agendamento.
-- Tudo que é "admin" (ver tudo, excluir, importar) passa por função com senha.
-- ------------------------------------------------------------

alter table slots enable row level security;
alter table participants enable row level security;
alter table bookings enable row level security;

drop policy if exists "slots_select_public" on slots;
create policy "slots_select_public" on slots for select using (true);

drop policy if exists "participants_insert_public" on participants;
create policy "participants_insert_public" on participants for insert with check (true);

drop policy if exists "bookings_insert_public" on bookings;
create policy "bookings_insert_public" on bookings for insert with check (true);

-- (não criamos policy de select/delete pública para participants/bookings —
--  essas operações só acontecem através das funções abaixo, que conferem a senha)

-- ------------------------------------------------------------
-- FUNÇÕES
-- ------------------------------------------------------------

-- Reserva atômica de um horário (evita duas pessoas pegarem a mesma vaga)
create or replace function book_slot(p_slot_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_capacity int;
  v_booked int;
begin
  select capacity, booked_count into v_capacity, v_booked
  from slots where id = p_slot_id for update;

  if v_booked >= v_capacity then
    return false;
  end if;

  update slots set booked_count = booked_count + 1 where id = p_slot_id;
  return true;
end;
$$;

create or replace function release_slot(p_slot_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update slots set booked_count = greatest(booked_count - 1, 0) where id = p_slot_id;
end;
$$;

-- Verifica se um whatsapp já completou os 4 agendamentos. Usada antes de criar participante novo.
create or replace function find_existing_participant(p_whatsapp text)
returns table(id uuid, total_bookings bigint)
language sql
security definer
as $$
  select p.id, count(b.id) as total_bookings
  from participants p
  left join bookings b on b.participant_id = p.id
  where p.whatsapp = p_whatsapp
  group by p.id;
$$;

-- Cria (ou reaproveita) um agendamento de forma seguro e atômica.
-- Retorna json: {ok: bool, participant_id, error}
create or replace function create_booking(
  p_name text, p_whatsapp text, p_participant_id uuid,
  p_slot_id uuid, p_test_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_pid uuid := p_participant_id;
  v_existing record;
  v_dup uuid;
  v_ok boolean;
begin
  if v_pid is null then
    select id, total_bookings into v_existing from find_existing_participant(p_whatsapp) order by total_bookings desc limit 1;
    if v_existing.id is not null then
      if v_existing.total_bookings >= 4 then
        return jsonb_build_object('ok', false, 'error', 'Este WhatsApp já completou o agendamento de todos os testes.');
      end if;
      v_pid := v_existing.id;
    else
      insert into participants(name, whatsapp) values (p_name, p_whatsapp) returning id into v_pid;
    end if;
  end if;

  select id into v_dup from bookings where participant_id = v_pid and test_id = p_test_id;
  if v_dup is not null then
    return jsonb_build_object('ok', false, 'error', 'Você já agendou este teste.', 'participant_id', v_pid);
  end if;

  select book_slot(p_slot_id) into v_ok;
  if not v_ok then
    return jsonb_build_object('ok', false, 'error', 'Esse horário acabou de ser ocupado por outra pessoa. Escolha outro.', 'participant_id', v_pid);
  end if;

  insert into bookings(participant_id, slot_id, test_id) values (v_pid, p_slot_id, p_test_id);

  return jsonb_build_object('ok', true, 'participant_id', v_pid);
end;
$$;

-- Resumo de agendamentos de um participante (usado na tela de confirmação)
create or replace function get_my_bookings(p_participant_id uuid)
returns jsonb
language sql
security definer
as $$
  select jsonb_build_object(
    'participant', (select jsonb_build_object('id', id, 'name', name, 'whatsapp', whatsapp) from participants where id = p_participant_id),
    'bookings', coalesce((
      select jsonb_agg(jsonb_build_object(
        'test_id', b.test_id,
        'date', s.date,
        'time', s.time
      ))
      from bookings b join slots s on s.id = b.slot_id
      where b.participant_id = p_participant_id
    ), '[]'::jsonb)
  );
$$;

-- ---------- FUNÇÕES ADMINISTRATIVAS (exigem senha) ----------

create or replace function admin_check(p_password text)
returns boolean
language sql
security definer
as $$
  select exists(select 1 from app_settings where key = 'admin_password' and value = p_password);
$$;

create or replace function admin_get_all(p_password text)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not admin_check(p_password) then
    raise exception 'senha incorreta';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'whatsapp', p.whatsapp,
      'bookings', coalesce((
        select jsonb_agg(jsonb_build_object(
          'booking_id', b.id, 'test_id', b.test_id, 'slot_id', b.slot_id,
          'date', s.date, 'time', s.time
        ))
        from bookings b join slots s on s.id = b.slot_id
        where b.participant_id = p.id
      ), '[]'::jsonb)
    )), '[]'::jsonb)
    from participants p
  );
end;
$$;

create or replace function admin_delete_booking(p_password text, p_booking_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_slot_id uuid;
begin
  if not admin_check(p_password) then
    return jsonb_build_object('ok', false, 'error', 'Senha incorreta.');
  end if;

  select slot_id into v_slot_id from bookings where id = p_booking_id;
  if v_slot_id is null then
    return jsonb_build_object('ok', false, 'error', 'Agendamento não encontrado.');
  end if;

  delete from bookings where id = p_booking_id;
  perform release_slot(v_slot_id);

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function admin_delete_participant(p_password text, p_participant_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
begin
  if not admin_check(p_password) then
    return jsonb_build_object('ok', false, 'error', 'Senha incorreta.');
  end if;

  for r in select slot_id from bookings where participant_id = p_participant_id loop
    perform release_slot(r.slot_id);
  end loop;

  delete from participants where id = p_participant_id;

  return jsonb_build_object('ok', true);
end;
$$;

-- Importa (ou reimporta do zero) os horários a partir de um JSON.
-- ATENÇÃO: isso apaga todos os horários e agendamentos existentes!
create or replace function admin_import_slots(p_password text, p_data jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_test record;
  v_slot jsonb;
  v_count int := 0;
begin
  if not admin_check(p_password) then
    return jsonb_build_object('ok', false, 'error', 'Senha incorreta.');
  end if;

  delete from bookings;
  delete from slots;
  delete from participants;

  for v_test in select * from jsonb_each(p_data) loop
    for v_slot in select * from jsonb_array_elements(v_test.value->'slots') loop
      insert into slots(test_id, date, time, capacity, booked_count)
      values (
        v_test.key,
        (v_slot->>'date')::date,
        v_slot->>'time',
        coalesce((v_test.value->>'capacity_per_slot')::int, 1),
        0
      );
      v_count := v_count + 1;
    end loop;
  end loop;

  return jsonb_build_object('ok', true, 'total', v_count);
end;
$$;
