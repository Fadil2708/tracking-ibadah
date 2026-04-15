-- Badge System Migration
-- Adds badge/achievement system to Ibadah Tracker

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Create badges table (badge definitions)
create table if not exists badges (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  category text not null check (category in ('shalat', 'dzikir', 'consistency', 'milestone', 'special')),
  requirement_type text not null check (requirement_type in ('streak', 'total', 'count', 'special')),
  requirement_target text not null,
  requirement_value integer not null,
  requirement_condition text,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  display_order integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Create user_badges table (user's earned badges)
create table if not exists user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id text references badges(id) on delete cascade not null,
  earned_at timestamp with time zone default now(),
  progress integer not null default 0,
  is_earned boolean not null default false,
  unique(user_id, badge_id)
);

-- Enable Row Level Security
alter table badges enable row level security;
alter table user_badges enable row level security;

-- Badges are public (everyone can view)
create policy "Anyone can view badges"
  on badges for select
  using (true);

-- Users can view their own badge progress
create policy "Users can view own badges"
  on user_badges for select
  using (auth.uid() = user_id);

-- Users can insert their own badge progress
create policy "Users can insert own badges"
  on user_badges for insert
  with check (auth.uid() = user_id);

-- Users can update their own badge progress
create policy "Users can update own badges"
  on user_badges for update
  using (auth.uid() = user_id);

-- Insert all badge definitions
insert into badges (
  id, name, description, icon, category, 
  requirement_type, requirement_target, requirement_value, requirement_condition,
  rarity, display_order
) values
  -- Shalat Badges
  ('subuh_7', 'Pejuang Subuh', 'Sholat Subuh 7 hari berturut-turut', '🌅', 'shalat', 'streak', 'subuh', 7, null, 'common', 1),
  ('subuh_30', 'Konsisten Subuh', 'Sholat Subuh 30 hari berturut-turut', '☀️', 'shalat', 'streak', 'subuh', 30, null, 'rare', 2),
  ('subuh_100', 'Master Subuh', 'Sholat Subuh 100 hari berturut-turut', '👑', 'shalat', 'streak', 'subuh', 100, null, 'legendary', 3),
  ('tahajud_7', 'Mutahajjid', 'Sholat Tahajud 7 hari berturut-turut', '🌙', 'shalat', 'streak', 'tahajud', 7, null, 'rare', 4),
  ('tahajud_30', 'Penjaga Malam', 'Sholat Tahajud 30 hari berturut-turut', '✨', 'shalat', 'streak', 'tahajud', 30, null, 'epic', 5),
  ('duha_7', 'Pencari Berkah', 'Sholat Duha 7 hari berturut-turut', '🌞', 'shalat', 'streak', 'duha', 7, null, 'common', 6),
  ('duha_30', 'Istiqomah Duha', 'Sholat Duha 30 hari berturut-turut', '💫', 'shalat', 'streak', 'duha', 30, null, 'rare', 7),
  
  -- Dzikir Badges
  ('istigfar_100', 'Pemonohon Ampunan', 'Istigfar 100x dalam satu hari', '📿', 'dzikir', 'count', 'istigfar', 100, null, 'common', 8),
  ('istigfar_1000', 'Ahli Istigfar', 'Total istigfar 1000x', '🤲', 'dzikir', 'total', 'istigfar', 1000, null, 'rare', 9),
  ('sholawat_100', 'Pembaca Sholawat', 'Sholawat 100x dalam satu hari', '💚', 'dzikir', 'count', 'sholawat', 100, null, 'common', 10),
  ('sholawat_1000', 'Pecinta Nabi', 'Total sholawat 1000x', '🕌', 'dzikir', 'total', 'sholawat', 1000, null, 'rare', 11),
  
  -- Consistency Badges
  ('streak_7', 'Seminggu Penuh', 'Semua ibadah lengkap selama 7 hari', '⭐', 'consistency', 'streak', 'all', 7, null, 'common', 12),
  ('streak_30', 'Sebulan Penuh', 'Semua ibadah lengkap selama 30 hari', '🌟', 'consistency', 'streak', 'all', 30, null, 'epic', 13),
  ('streak_100', 'Streak Master', 'Semua ibadah lengkap selama 100 hari', '🏆', 'consistency', 'streak', 'all', 100, null, 'legendary', 14),
  
  -- Milestone Badges
  ('first_ibadah', 'Langkah Pertama', 'Mencatat ibadah pertama kali', '🎯', 'milestone', 'special', 'first_record', 1, null, 'common', 15),
  ('odoc_7', 'Pelajar Rajin', 'ODOC (One Day One Concept) 7 hari berturut-turut', '📚', 'milestone', 'streak', 'odoc', 7, null, 'rare', 16),
  ('odoc_30', 'Penuntut Ilmu', 'ODOC 30 hari berturut-turut', '🎓', 'milestone', 'streak', 'odoc', 30, null, 'epic', 17),
  
  -- Special Badges
  ('early_bird', 'Early Bird', 'Upload foto Subuh sebelum jam 5:30 pagi', '🐦', 'special', 'special', 'early_subuh', 1, 'photo_taken_before_0530', 'rare', 18),
  ('perfect_week', 'Pekan Sempurna', 'Semua ibadah lengkap dalam seminggu tanpa gagal', '💎', 'special', 'special', 'perfect_week', 1, null, 'epic', 19),
  ('ramadan_warrior', 'Pejuang Ramadhan', 'Lengkap semua ibadah selama 30 hari Ramadhan', '🌙', 'special', 'special', 'ramadan', 30, null, 'legendary', 20)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  category = excluded.category,
  requirement_type = excluded.requirement_type,
  requirement_target = excluded.requirement_target,
  requirement_value = excluded.requirement_value,
  requirement_condition = excluded.requirement_condition,
  rarity = excluded.rarity,
  display_order = excluded.display_order;

-- Create indexes for performance
create index if not exists idx_user_badges_user_id on user_badges(user_id);
create index if not exists idx_user_badges_badge_id on user_badges(badge_id);
create index if not exists idx_user_badges_earned_at on user_badges(earned_at desc);
create index if not exists idx_daily_records_user_id_date on daily_records(user_id, date);

-- Function to calculate streak for a specific ibadah
create or replace function calculate_ibadah_streak(
  p_user_id uuid,
  p_ibadah text
)
returns integer
language plpgsql
as $$
declare
  v_streak integer := 0;
  v_current_date date := current_date;
  v_has_ibadah boolean;
begin
  loop
    -- Check if user has this ibadah on the current date
    select case
      when p_ibadah = 'subuh' then exists (
        select 1 from subuh_verifications 
        where user_id = p_user_id and date = v_current_date
      )
      when p_ibadah = 'tahajud' then tahajud
      when p_ibadah = 'duha' then duha
      when p_ibadah = 'odoc' then odoc
      when p_ibadah = 'all' then (
        tahajud and duha and odoc 
        and exists (
          select 1 from subuh_verifications 
          where user_id = p_user_id and date = v_current_date
        )
      )
      else false
    end into v_has_ibadah
    from daily_records
    where user_id = p_user_id and date = v_current_date;
    
    if v_has_ibadah then
      v_streak := v_streak + 1;
      v_current_date := v_current_date - interval '1 day';
    else
      exit;
    end if;
    
    -- Safety limit (max 365 days)
    if v_streak >= 365 then
      exit;
    end if;
  end loop;
  
  return v_streak;
end;
$$;

-- Function to calculate total count for an ibadah
create or replace function calculate_ibadah_total(
  p_user_id uuid,
  p_ibadah text
)
returns integer
language plpgsql
as $$
declare
  v_total integer := 0;
begin
  if p_ibadah = 'istigfar' then
    select coalesce(sum(istigfar), 0) into v_total
    from daily_records
    where user_id = p_user_id;
  elsif p_ibadah = 'sholawat' then
    select coalesce(sum(sholawat), 0) into v_total
    from daily_records
    where user_id = p_user_id;
  end if;
  
  return v_total;
end;
$$;

-- Function to check and award badges
create or replace function check_and_award_badges(p_user_id uuid)
returns void
language plpgsql
as $$
declare
  v_badge record;
  v_progress integer;
  v_should_award boolean;
begin
  -- Loop through all badges
  for v_badge in select * from badges loop
    -- Check if user already has this badge
    if not exists (
      select 1 from user_badges 
      where user_id = p_user_id and badge_id = v_badge.id and is_earned = true
    ) then
      -- Calculate progress based on requirement type
      v_progress := 0;
      v_should_award := false;
      
      if v_badge.requirement_type = 'streak' then
        v_progress := calculate_ibadah_streak(p_user_id, v_badge.requirement_target);
        v_should_award := v_progress >= v_badge.requirement_value;
      
      elsif v_badge.requirement_type = 'total' then
        v_progress := calculate_ibadah_total(p_user_id, v_badge.requirement_target);
        v_should_award := v_progress >= v_badge.requirement_value;
      
      elsif v_badge.requirement_type = 'count' then
        -- Check if any single day has the required count
        if v_badge.requirement_target = 'istigfar' then
          select coalesce(max(istigfar), 0) into v_progress
          from daily_records
          where user_id = p_user_id;
        elsif v_badge.requirement_target = 'sholawat' then
          select coalesce(max(sholawat), 0) into v_progress
          from daily_records
          where user_id = p_user_id;
        end if;
        v_should_award := v_progress >= v_badge.requirement_value;
      
      elsif v_badge.requirement_type = 'special' then
        -- Special badges logic
        if v_badge.requirement_target = 'first_record' then
          select count(*) into v_progress
          from daily_records
          where user_id = p_user_id;
          v_should_award := v_progress >= 1;
        end if;
        -- Add more special badge logic here
      end if;
      
      -- Insert or update user badge
      if v_progress > 0 then
        insert into user_badges (user_id, badge_id, progress, is_earned)
        values (p_user_id, v_badge.id, v_progress, v_should_award)
        on conflict (user_id, badge_id) do update set
          progress = excluded.progress,
          is_earned = excluded.is_earned,
          earned_at = case when excluded.is_earned and not user_badges.is_earned then now() else user_badges.earned_at end;
      end if;
    end if;
  end loop;
end;
$$;

-- Trigger to check badges when daily record is updated
create or replace function check_badges_on_record_update()
returns trigger
language plpgsql
as $$
begin
  -- Check badges asynchronously (don't block the main operation)
  perform check_and_award_badges(new.user_id);
  return new;
end;
$$;

-- Drop existing trigger if exists
drop trigger if exists check_badges_on_daily_records on daily_records;

-- Create trigger
create trigger check_badges_on_daily_records
  after insert or update on daily_records
  for each row
  execute function check_badges_on_record_update();

-- Also check badges when subuh verification is added
drop trigger if exists check_badges_on_subuh_verifications on subuh_verifications;

create trigger check_badges_on_subuh_verifications
  after insert or update on subuh_verifications
  for each row
  execute function check_badges_on_record_update();
