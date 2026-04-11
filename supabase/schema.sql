-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  role text not null default 'santri' check (role in ('santri', 'musyrif', 'admin')),
  community_code text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create daily_records table
create table daily_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  tahajud boolean default false,
  duha boolean default false,
  istigfar integer default 0,
  sholawat integer default 0,
  odoc boolean default false,
  odoc_title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Create subuh_verifications table
create table subuh_verifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  photo_url text not null,
  photo_taken_at timestamp with time zone not null,
  latitude decimal not null,
  longitude decimal not null,
  nearest_masjid text,
  masjid_distance integer,
  subuh_start timestamp with time zone,
  syuruq_time timestamp with time zone,
  verification_status text not null check (verification_status in ('verified_masjid', 'verified_time', 'failed')),
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table daily_records enable row level security;
alter table subuh_verifications enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Daily records policies
create policy "Users can view own daily records"
  on daily_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily records"
  on daily_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily records"
  on daily_records for update
  using (auth.uid() = user_id);

-- Musyrif and admin can view all records
create policy "Musyrif and admin can view all daily records"
  on daily_records for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('musyrif', 'admin')
    )
  );

-- Subuh verifications policies
create policy "Users can view own subuh verifications"
  on subuh_verifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own subuh verifications"
  on subuh_verifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subuh verifications"
  on subuh_verifications for update
  using (auth.uid() = user_id);

-- Musyrif and admin can view all subuh verifications
create policy "Musyrif and admin can view all subuh verifications"
  on subuh_verifications for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('musyrif', 'admin')
    )
  );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, community_code, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'community_code',
    'santri'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_daily_records_updated_at before update on daily_records
  for each row execute procedure update_updated_at_column();
