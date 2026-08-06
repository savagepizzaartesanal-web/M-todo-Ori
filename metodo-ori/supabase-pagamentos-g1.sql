-- G1 pagamentos / entitlements do Metodo Ori.
-- Rode este SQL no Supabase antes de publicar backend que selecione
-- produto_1_completo_liberado em public.clientes.
--
-- Produto 1 permanece freemium:
-- - produto_1_liberado controla o acesso basico ao quiz/resultado/leitura inicial;
-- - produto_1_completo_liberado controla o unlock premium da leitura completa.

alter table public.clientes
add column if not exists produto_1_completo_liberado boolean not null default false;

comment on column public.clientes.produto_1_completo_liberado is
  'Libera o unlock premium do Produto 1 / Codigo das Deusas completo.';

create table if not exists public.payment_products (
  product_code text primary key,
  name text not null,
  grants_product text not null,
  provider text not null default 'mercado_pago',
  active boolean not null default false,
  amount_cents integer,
  currency text not null default 'BRL',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_products_grants_product_check
    check (grants_product in (
      'produto_1_completo_liberado',
      'produto_2_liberado',
      'produto_3_liberado'
    )),
  constraint payment_products_amount_check
    check (amount_cents is null or amount_cents > 0)
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  product_code text not null references public.payment_products(product_code),
  grants_product text not null,
  provider text not null default 'mercado_pago',
  status text not null default 'created',
  external_reference text not null unique,
  provider_preference_id text,
  provider_payment_id text,
  checkout_url text,
  amount_cents integer,
  currency text not null default 'BRL',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  constraint payment_orders_status_check
    check (status in (
      'created',
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'expired',
      'refunded',
      'error'
    )),
  constraint payment_orders_grants_product_check
    check (grants_product in (
      'produto_1_completo_liberado',
      'produto_2_liberado',
      'produto_3_liberado'
    )),
  constraint payment_orders_amount_check
    check (amount_cents is null or amount_cents > 0)
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago',
  provider_event_id text not null,
  event_type text,
  provider_payment_id text,
  payment_order_id uuid references public.payment_orders(id) on delete set null,
  processed boolean not null default false,
  processing_error text,
  payload_sanitized jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_webhook_events_provider_event_unique
    unique (provider, provider_event_id)
);

create index if not exists payment_orders_cliente_status_idx
  on public.payment_orders (cliente_id, status);

create index if not exists payment_orders_product_status_idx
  on public.payment_orders (product_code, status);

create unique index if not exists payment_orders_provider_payment_unique_idx
  on public.payment_orders (provider, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists payment_webhook_events_provider_payment_idx
  on public.payment_webhook_events (provider, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists payment_webhook_events_order_idx
  on public.payment_webhook_events (payment_order_id);

create index if not exists payment_webhook_events_processed_idx
  on public.payment_webhook_events (processed);

create index if not exists payment_webhook_events_created_at_idx
  on public.payment_webhook_events (created_at);

insert into public.payment_products (
  product_code,
  name,
  grants_product,
  active,
  amount_cents,
  currency
)
values
  (
    'produto_1_completo',
    'Codigo das Deusas - leitura completa',
    'produto_1_completo_liberado',
    false,
    null,
    'BRL'
  ),
  (
    'produto_2',
    'Dossie ORI',
    'produto_2_liberado',
    false,
    null,
    'BRL'
  ),
  (
    'produto_3',
    'Codigo Final',
    'produto_3_liberado',
    false,
    null,
    'BRL'
  )
on conflict (product_code) do update
set
  name = excluded.name,
  grants_product = excluded.grants_product,
  currency = excluded.currency,
  updated_at = now();

alter table public.payment_products enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_webhook_events enable row level security;

alter table public.payment_products force row level security;
alter table public.payment_orders force row level security;
alter table public.payment_webhook_events force row level security;

create or replace function public.current_user_is_ori_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clientes
    where user_id = auth.uid()
      and admin is true
  );
$$;

create or replace function public.set_payment_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_payment_products_updated_at on public.payment_products;
create trigger set_payment_products_updated_at
before update on public.payment_products
for each row
execute function public.set_payment_products_updated_at();

create or replace function public.set_payment_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_payment_orders_updated_at on public.payment_orders;
create trigger set_payment_orders_updated_at
before update on public.payment_orders
for each row
execute function public.set_payment_orders_updated_at();

create or replace function public.set_payment_webhook_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_payment_webhook_events_updated_at on public.payment_webhook_events;
create trigger set_payment_webhook_events_updated_at
before update on public.payment_webhook_events
for each row
execute function public.set_payment_webhook_events_updated_at();

create or replace function public.prevent_cliente_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if public.current_user_is_ori_admin() then
    return new;
  end if;

  if old.user_id is distinct from new.user_id
    and not (
      old.user_id is null
      and new.user_id = auth.uid()
      and lower(old.email) = lower(auth.jwt() ->> 'email')
    )
  then
    raise exception 'Clientes nao podem alterar user_id.';
  end if;

  if old.admin is distinct from new.admin then
    raise exception 'Clientes nao podem alterar permissao admin.';
  end if;

  if old.produto_1_completo_liberado is distinct from new.produto_1_completo_liberado then
    raise exception 'Clientes nao podem liberar o Produto 1 completo.';
  end if;

  if old.produto_2_liberado is distinct from new.produto_2_liberado then
    raise exception 'Clientes nao podem liberar o Produto 2.';
  end if;

  if old.produto_3_liberado is distinct from new.produto_3_liberado then
    raise exception 'Clientes nao podem liberar o Produto 3.';
  end if;

  if old.observacoes_admin is distinct from new.observacoes_admin then
    raise exception 'Clientes nao podem alterar observacoes administrativas.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_cliente_privilege_escalation on public.clientes;
create trigger prevent_cliente_privilege_escalation
before update on public.clientes
for each row
execute function public.prevent_cliente_privilege_escalation();

revoke all on table public.payment_products from anon;
revoke all on table public.payment_orders from anon;
revoke all on table public.payment_webhook_events from anon;

revoke all on table public.payment_products from authenticated;
revoke all on table public.payment_orders from authenticated;
revoke all on table public.payment_webhook_events from authenticated;
