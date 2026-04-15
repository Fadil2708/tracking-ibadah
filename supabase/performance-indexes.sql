-- Performance Indexes for Ibadah Tracker
-- Run this in your Supabase SQL Editor to improve query performance

-- Indexes for daily_records table
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date 
ON daily_records(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_records_date 
ON daily_records(date);

-- Indexes for subuh_verifications table
CREATE INDEX IF NOT EXISTS idx_subuh_verifications_user_date 
ON subuh_verifications(user_id, date);

CREATE INDEX IF NOT EXISTS idx_subuh_verifications_date 
ON subuh_verifications(date);

CREATE INDEX IF NOT EXISTS idx_subuh_verifications_status 
ON subuh_verifications(verification_status);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_community_role 
ON profiles(community_code, role);

CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Indexes for user_badges table
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
ON user_badges(user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_earned 
ON user_badges(user_id, is_earned);

CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at 
ON user_badges(user_id, earned_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date_complete 
ON daily_records(user_id, date) 
INCLUDE (tahajud, duha, istigfar, sholawat, odoc);

CREATE INDEX IF NOT EXISTS idx_subuh_verifications_user_date_complete 
ON subuh_verifications(user_id, date) 
INCLUDE (photo_url, verification_status, nearest_masjid);

-- Add these indexes if you have large datasets
-- CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
-- ON profiles(created_at DESC);

-- CREATE INDEX IF NOT EXISTS idx_daily_records_created_at 
-- ON daily_records(created_at DESC);
