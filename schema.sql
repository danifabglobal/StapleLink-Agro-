-- STAPLELINK Agro MVP schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor after creating a project.
create extension if not exists pgcrypto;

create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  community text not null,
  crop text not null check (crop in ('Rice','Tomato')),
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists public.harvest_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_name text not null,
  crop text not null check (crop in ('Rice','Tomato')),
  community text not null,
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  harvest_date date not null,
  status text not null default 'Available',
  created_at timestamptz not null default now()
);

create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  crop text not null check (crop in ('Rice','Tomato')),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  delivery_location text not null,
  needed_by date not null,
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  produce text not null check (produce in ('Rice','Tomato')),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  origin text not null,
  destination text not null,
  transporter text not null,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now()
);

-- DEVELOPMENT-ONLY access policies for the prototype.
-- Before handling real farmer/buyer personal data, enable Supabase Auth,
-- restrict access by role, and replace these permissive policies.
alter table public.farmers enable row level security;
alter table public.harvest_listings enable row level security;
alter table public.buyer_requests enable row level security;
alter table public.deliveries enable row level security;

create policy "prototype public read farmers" on public.farmers for select to anon, authenticated using (true);
create policy "prototype public insert farmers" on public.farmers for insert to anon, authenticated with check (true);
create policy "prototype public update farmers" on public.farmers for update to anon, authenticated using (true) with check (true);

create policy "prototype public read harvest" on public.harvest_listings for select to anon, authenticated using (true);
create policy "prototype public insert harvest" on public.harvest_listings for insert to anon, authenticated with check (true);
create policy "prototype public update harvest" on public.harvest_listings for update to anon, authenticated using (true) with check (true);

create policy "prototype public read requests" on public.buyer_requests for select to anon, authenticated using (true);
create policy "prototype public insert requests" on public.buyer_requests for insert to anon, authenticated with check (true);
create policy "prototype public update requests" on public.buyer_requests for update to anon, authenticated using (true) with check (true);

create policy "prototype public read deliveries" on public.deliveries for select to anon, authenticated using (true);
create policy "prototype public insert deliveries" on public.deliveries for insert to anon, authenticated with check (true);
create policy "prototype public update deliveries" on public.deliveries for update to anon, authenticated using (true) with check (true);
