"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trophy, Flame, Target, Gift, Crown, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "mm-gamification";

interface GamificationState {
  points: number;
  completedChallenges: string[];
  completedAchievements: string[];
  streak: number;
  lastVisit: string;
}

function getDefaultState(): GamificationState {
  return {
    points: 0,
    completedChallenges: [],
    completedAchievements: [],
    streak: 1,
    lastVisit: new Date().toISOString().split("T")[0],
  };
}

function loadState(): GamificationState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as GamificationState;

    // Update streak based on last visit
    const today = new Date().toISOString().split("T")[0];
    const lastVisit = parsed.lastVisit;
    if (lastVisit !== today) {
      const last = new Date(lastVisit);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        parsed.streak += 1;
      } else if (diffDays > 1) {
        parsed.streak = 1;
      }
      parsed.lastVisit = today;
      // Reset daily challenges on new day
      parsed.completedChallenges = [];
    }

    return parsed;
  } catch {
    return getDefaultState();
  }
}

function saveState(state: GamificationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(name + "="));
}

const DAILY_CHALLENGES = [
  { id: "browse", icon: "\uD83D\uDC40", label: "Browse 3 products", points: 5 },
  { id: "review", icon: "\u2B50", label: "Write a review", points: 25 },
  { id: "share", icon: "\uD83D\uDCE4", label: "Share a product", points: 10 },
  { id: "refer", icon: "\uD83D\uDC65", label: "Refer a friend", points: 50 },
];

const ACHIEVEMENTS = [
  { id: "first_order", icon: "\uD83D\uDED2", label: "First Order", description: "Place your first order" },
  { id: "review_master", icon: "\u2B50", label: "Review Master", description: "Write 5 reviews" },
  { id: "loyalty_bronze", icon: "\uD83C\uDF31", label: "Seedling", description: "Reach Seedling tier" },
  { id: "big_spender", icon: "\uD83D\uDC8E", label: "Big Spender", description: "Spend $500+" },
  { id: "subscriber", icon: "\uD83D\uDD04", label: "Subscriber", description: "Start a subscription" },
  { id: "social_butterfly", icon: "\uD83E\uDD8B", label: "Social Butterfly", description: "Refer 3 friends" },
];

function getTier(pts: number) {
  if (pts >= 5000) return "harvest";
  if (pts >= 2000) return "flowering";
  if (pts >= 500) return "budding";
  return "seedling";
}

const tierColors: Record<string, string> = {
  seedling: "from-green-500 to-emerald-600",
  budding: "from-blue-500 to-indigo-600",
  flowering: "from-purple-500 to-violet-600",
  harvest: "from-amber-500 to-orange-600",
};

const tierIcons: Record<string, string> = {
  seedling: "\uD83C\uDF31",
  budding: "\uD83C\uDF3F",
  flowering: "\uD83C\uDF38",
  harvest: "\uD83C\uDF3E",
};

export function GamificationWidget() {
  const [state, setState] = useState<GamificationState>(getDefaultState);
  const [showAll, setShowAll] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(hasCookie("mm-session"));
    setState(loadState());
  }, []);

  const updateState = useCallback((updater: (prev: GamificationState) => GamificationState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const completeChallenge = useCallback(
    (id: string, points: number) => {
      updateState((prev) => {
        if (prev.completedChallenges.includes(id)) return prev;
        return {
          ...prev,
          points: prev.points + points,
          completedChallenges: [...prev.completedChallenges, id],
        };
      });
    },
    [updateState]
  );

  if (!mounted || !isAuthenticated) return null;

  const { points, completedChallenges, completedAchievements, streak } = state;
  const tier = getTier(points);

  return (
    <div className="bg-muted/50 rounded-2xl border border-border overflow-hidden">
      {/* Header with streak */}
      <div className={`bg-gradient-to-r ${tierColors[tier] || tierColors.seedling} p-5 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{tierIcons[tier] || "\uD83C\uDF31"}</span>
              <span className="text-foreground font-bold text-lg capitalize">{tier}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-foreground/80" />
                <span className="text-foreground font-bold text-xl">{points.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">pts</span>
              </div>
              <div className="h-4 w-px bg-foreground/20" />
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-foreground font-medium text-sm">{streak} Day Streak</span>
              </div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-7 h-7 text-foreground" />
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Daily Challenges
          </h3>
          <span className="text-xs text-muted-foreground">
            {completedChallenges.length}/{DAILY_CHALLENGES.length}
          </span>
        </div>
        <div className="space-y-2">
          {DAILY_CHALLENGES.map((challenge) => {
            const done = completedChallenges.includes(challenge.id);
            return (
              <button
                key={challenge.id}
                onClick={() => completeChallenge(challenge.id, challenge.points)}
                disabled={done}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  done
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-muted/30 border border-border hover:bg-muted cursor-pointer"
                }`}
              >
                <span className="text-lg">{challenge.icon}</span>
                <span className={`flex-1 text-sm text-left ${done ? "text-primary line-through" : "text-muted-foreground"}`}>
                  {challenge.label}
                </span>
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <span className="text-xs text-primary/60 font-medium">+{challenge.points} pts</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Achievements
          </h3>
          <span className="text-xs text-muted-foreground">
            {completedAchievements.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 3)).map((achievement) => {
            const done = completedAchievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                  done ? "bg-muted border border-primary/10" : "bg-muted/30 border border-border opacity-50"
                }`}
                title={achievement.description}
              >
                <span className={`text-2xl mb-1 ${done ? "" : "grayscale"}`}>{achievement.icon}</span>
                <span className={`text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                  {achievement.label}
                </span>
              </div>
            );
          })}
        </div>
        {!showAll && ACHIEVEMENTS.length > 3 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            Show {ACHIEVEMENTS.length - 3} more
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href="/rewards"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#CAF880]/10 to-emerald-500/10 border border-primary/20 text-primary text-sm font-medium hover:from-[#CAF880]/15 hover:to-emerald-500/15 transition-all flex items-center justify-center gap-2 group"
        >
          <Gift className="w-4 h-4" />
          View Rewards Program
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
