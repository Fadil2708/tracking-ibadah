// Badge Service - Handles badge calculations and database operations
import { createClient } from '@/lib/supabase';
import { BADGES, Badge, UserBadge } from '@/lib/badges';

export interface BadgeProgress {
  badge: Badge;
  progress: number;
  is_earned: boolean;
  percentage: number;
}

class BadgeService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // Get all badges with user progress
  async getUserBadges(userId: string): Promise<BadgeProgress[]> {
    try {
      // Fetch user's badge progress
      const { data: userBadges, error } = await this.supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }

      // Map badges with progress
      const badgeProgress: BadgeProgress[] = BADGES.map((badge) => {
        const userBadge = userBadges?.find((ub) => ub.badge_id === badge.id);
        const progress = userBadge?.progress || 0;
        const is_earned = userBadge?.is_earned || false;
        
        // Calculate percentage (cap at 100)
        const percentage = Math.min(
          (progress / badge.requirement.value) * 100,
          100
        );

        return {
          badge,
          progress,
          is_earned,
          percentage,
        };
      });

      // Sort by display order
      return badgeProgress.sort((a, b) => a.badge.order - b.badge.order);
    } catch (error) {
      console.error('Error in getUserBadges:', error);
      return [];
    }
  }

  // Get earned badges only
  async getEarnedBadges(userId: string): Promise<BadgeProgress[]> {
    const allBadges = await this.getUserBadges(userId);
    return allBadges.filter((b) => b.is_earned);
  }

  // Get badges by category
  async getBadgesByCategory(
    userId: string,
    category: string
  ): Promise<BadgeProgress[]> {
    const allBadges = await this.getUserBadges(userId);
    return allBadges.filter((b) => b.badge.category === category);
  }

  // Check and award badges manually (can be called from client)
  async checkAndAwardBadges(userId: string): Promise<void> {
    try {
      // Call the database function
      const { error } = await this.supabase.rpc('check_and_award_badges', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking badges:', error);
      }
    } catch (error) {
      console.error('Error in checkAndAwardBadges:', error);
    }
  }

  // Get badge statistics
  async getBadgeStats(userId: string): Promise<{
    totalEarned: number;
    totalBadges: number;
    completionPercentage: number;
    rarestBadge: Badge | null;
    latestBadge: Badge | null;
  }> {
    try {
      const allBadges = await this.getUserBadges(userId);
      const earnedBadges = allBadges.filter((b) => b.is_earned);

      // Get latest earned badge
      const latestBadge = earnedBadges.length > 0 
        ? earnedBadges[0].badge 
        : null;

      // Get rarest earned badge (by rarity order)
      const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
      const rarestBadge = earnedBadges.length > 0
        ? earnedBadges.reduce((rarest, current) => {
            const currentRarity = rarityOrder.indexOf(current.badge.rarity);
            const rarestRarity = rarityOrder.indexOf(rarest.badge.rarity);
            return currentRarity > rarestRarity ? current : rarest;
          }).badge
        : null;

      return {
        totalEarned: earnedBadges.length,
        totalBadges: allBadges.length,
        completionPercentage: allBadges.length > 0
          ? (earnedBadges.length / allBadges.length) * 100
          : 0,
        rarestBadge: rarestBadge || null,
        latestBadge: latestBadge || null,
      };
    } catch (error) {
      console.error('Error in getBadgeStats:', error);
      return {
        totalEarned: 0,
        totalBadges: BADGES.length,
        completionPercentage: 0,
        rarestBadge: null,
        latestBadge: null,
      };
    }
  }

  // Calculate streak for specific ibadah
  async calculateStreak(
    userId: string,
    ibadah: string
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_ibadah_streak', {
        p_user_id: userId,
        p_ibadah: ibadah,
      });

      if (error) {
        console.error('Error calculating streak:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in calculateStreak:', error);
      return 0;
    }
  }

  // Calculate total count for specific ibadah
  async calculateTotal(
    userId: string,
    ibadah: string
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_ibadah_total', {
        p_user_id: userId,
        p_ibadah: ibadah,
      });

      if (error) {
        console.error('Error calculating total:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in calculateTotal:', error);
      return 0;
    }
  }

  // Get recently earned badges (for notification display)
  async getRecentBadges(
    userId: string,
    limit: number = 5
  ): Promise<BadgeProgress[]> {
    try {
      const { data: userBadges, error } = await this.supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('is_earned', true)
        .order('earned_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent badges:', error);
        return [];
      }

      const badgeProgress: BadgeProgress[] = userBadges.map((userBadge) => {
        const badge = BADGES.find((b) => b.id === userBadge.badge_id);
        if (!badge) return null;

        return {
          badge,
          progress: userBadge.progress,
          is_earned: userBadge.is_earned,
          percentage: 100,
        };
      }).filter(Boolean) as BadgeProgress[];

      return badgeProgress;
    } catch (error) {
      console.error('Error in getRecentBadges:', error);
      return [];
    }
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
