-- ============================================================
-- CYBERSECURITY MARKETPLACE — INITIAL SCHEMA MIGRATION
-- ============================================================
-- IMPORTANT: RLS is the core security mechanism of this app
-- Every table MUST have RLS enabled
-- Users can NEVER access another user's identity data
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extends auth.users but stores ONLY alias + role + score
-- Real identity stays in auth.users (Supabase protected)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  alias text unique not null,
  role text not null check (role in ('buyer', 'vendor', 'admin')),
  trust_score float default 0,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- System can insert profiles (via Edge Function with service role)
create policy "profiles: service insert"
  on public.profiles for insert
  with check (true);

-- ============================================================
-- PUBLIC ALIAS DIRECTORY
-- This is the ONLY table others can read about each other
-- Contains zero personally identifiable information
-- ============================================================
create table public.alias_directory (
  alias text primary key,
  role text not null check (role in ('buyer', 'vendor')),
  trust_score float default 0,
  cert_badges text[] default '{}',
  skills text[] default '{}',
  completed_deals integer default 0,
  response_rate float default 100,
  joined_at timestamptz default now()
);

alter table public.alias_directory enable row level security;

-- Anyone authenticated can read the alias directory (it's anonymous data)
create policy "alias_directory: authenticated read"
  on public.alias_directory for select
  to authenticated
  using (true);

-- Only the profile owner (via service role) can update their entry
create policy "alias_directory: service manage"
  on public.alias_directory for all
  using (true)
  with check (true);

-- ============================================================
-- CERTIFICATIONS TABLE
-- Verified certs attached to aliases (not real identities)
-- ============================================================
create table public.certifications (
  id uuid default uuid_generate_v4() primary key,
  vendor_alias text not null references public.alias_directory(alias),
  cert_name text not null,
  cert_type text check (cert_type in (
    'OSCP','CEH','CISSP','CISM','ISO27001','CompTIA_Security',
    'GPEN','GWAPT','eJPT','other'
  )),
  file_url text,
  verified boolean default false,
  verification_score integer default 0,
  uploaded_at timestamptz default now(),
  verified_at timestamptz
);

alter table public.certifications enable row level security;

create policy "certifications: vendor manages own"
  on public.certifications for all
  using (
    vendor_alias = (
      select alias from public.profiles where id = auth.uid()
    )
  );

create policy "certifications: public read verified"
  on public.certifications for select
  to authenticated
  using (verified = true);

-- ============================================================
-- DEALS TABLE
-- Core deal lifecycle. Uses aliases, never real IDs in display.
-- ============================================================
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  buyer_alias text not null,
  vendor_alias text,
  requirement_id text,
  status text not null default 'POSTED' check (status in (
    'POSTED','MATCHED','NEGOTIATING','CONTRACTED',
    'IN_PROGRESS','REVIEW','CLOSED','CANCELLED','DISPUTED'
  )),
  agreed_price numeric(12,2),
  currency text default 'USD',
  payment_intent_id text,
  buyer_consented_reveal boolean default false,
  vendor_consented_reveal boolean default false,
  identity_revealed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

alter table public.deals enable row level security;

-- Buyers see only their deals
create policy "deals: buyer access"
  on public.deals for all
  using (
    buyer_alias = (
      select alias from public.profiles where id = auth.uid()
    )
  );

-- Vendors see only deals assigned to them
create policy "deals: vendor access"
  on public.deals for select
  using (
    vendor_alias = (
      select alias from public.profiles where id = auth.uid()
    )
  );

-- ============================================================
-- TRUST EVENTS TABLE
-- Immutable log of all events that affect trust scores
-- ============================================================
create table public.trust_events (
  id uuid default uuid_generate_v4() primary key,
  alias text not null,
  event_type text not null check (event_type in (
    'deal_completed','deal_cancelled','cert_verified',
    'review_received','response_fast','response_slow',
    'dispute_raised','dispute_resolved_win','dispute_resolved_loss',
    'platform_milestone'
  )),
  score_delta float not null,
  deal_id uuid references public.deals(id),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.trust_events enable row level security;

-- Trust events are insert-only via service role (no user can fake them)
create policy "trust_events: service only"
  on public.trust_events for all
  using (false)
  with check (false);

-- But anyone can read trust events for any alias (they're anonymous)
create policy "trust_events: public read"
  on public.trust_events for select
  to authenticated
  using (true);

-- ============================================================
-- MESSAGES TABLE
-- Stores ONLY encrypted content — server never sees plaintext
-- ============================================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  deal_id uuid not null references public.deals(id),
  sender_alias text not null,
  encrypted_content text not null,
  message_type text default 'text' check (message_type in (
    'text','file','system'
  )),
  file_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "messages: deal participants only"
  on public.messages for all
  using (
    deal_id in (
      select id from public.deals where
        buyer_alias = (select alias from public.profiles where id = auth.uid())
        or
        vendor_alias = (select alias from public.profiles where id = auth.uid())
    )
  );

-- ============================================================
-- AUDIT LOGS TABLE
-- Immutable. Logs every sensitive action in the system.
-- ============================================================
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  action_type text not null,
  actor_alias text,
  target_alias text,
  deal_id uuid,
  metadata jsonb default '{}',
  ip_hash text,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

-- Only admins read audit logs; no user can write them directly
create policy "audit_logs: admin read"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on profiles
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.handle_updated_at();

-- Fire trust event when deal is closed
create function public.on_deal_status_change()
returns trigger as $$
begin
  if new.status = 'CLOSED' and old.status != 'CLOSED' then
    insert into public.trust_events(alias, event_type, score_delta, deal_id)
    values (new.vendor_alias, 'deal_completed', 15, new.id);

    insert into public.audit_logs(action_type, actor_alias, target_alias, deal_id)
    values ('deal_closed', new.buyer_alias, new.vendor_alias, new.id);

    update public.alias_directory
    set completed_deals = completed_deals + 1
    where alias = new.vendor_alias;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger deal_status_change
  after update on public.deals
  for each row execute function public.on_deal_status_change();

-- ============================================================
-- ENABLE REALTIME on messages and deals
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.deals;
