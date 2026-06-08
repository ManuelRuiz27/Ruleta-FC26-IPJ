create table if not exists public.tournament_records (
  record_type text not null,
  record_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (record_type, record_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tournament_records_set_updated_at on public.tournament_records;
create trigger tournament_records_set_updated_at
before update on public.tournament_records
for each row execute function public.set_updated_at();

alter table public.tournament_records enable row level security;

drop policy if exists "anon_can_read_tournament_records" on public.tournament_records;
create policy "anon_can_read_tournament_records"
on public.tournament_records
for select
to anon
using (true);

drop policy if exists "anon_can_write_tournament_records" on public.tournament_records;
create policy "anon_can_write_tournament_records"
on public.tournament_records
for insert
to anon
with check (record_type in (
  'completed_municipal_result',
  'completed_regional_result',
  'completed_state_result',
  'qualified_player',
  'team_reassignment'
));

drop policy if exists "anon_can_update_tournament_records" on public.tournament_records;
create policy "anon_can_update_tournament_records"
on public.tournament_records
for update
to anon
using (record_type in (
  'completed_municipal_result',
  'completed_regional_result',
  'completed_state_result',
  'qualified_player',
  'team_reassignment'
))
with check (record_type in (
  'completed_municipal_result',
  'completed_regional_result',
  'completed_state_result',
  'qualified_player',
  'team_reassignment'
));

alter publication supabase_realtime add table public.tournament_records;
