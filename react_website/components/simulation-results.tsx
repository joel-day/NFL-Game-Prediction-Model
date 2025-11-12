"use client"

import { TEAM_COLORS, TEAM_NAMES } from "@/lib/teams"

interface SimulationResultsProps {
  results: {
    team1: string
    team2: string
    season1: string
    season2: string
    winPct: number
  }
  onViewStats: (team: string, season: string) => void
}

export function SimulationResults({ results, onViewStats }: SimulationResultsProps) {
  const team1Wins = Math.round(results.winPct * 100)
  const team2Wins = 100 - team1Wins
  const winner = team1Wins >= 50 ? results.team1 : results.team2
  const winnerPct = team1Wins >= 50 ? team1Wins : team2Wins

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Winner Announcement */}
      <div className="text-center space-y-3 md:space-y-4 p-6 md:p-8 border border-border rounded-lg bg-card">
        <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Predicted Winner</div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {TEAM_NAMES[winner]}
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-muted-foreground">
          {winnerPct} wins out of 100
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        <div
          className="p-4 md:p-6 rounded-lg space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 relative group"
          style={{ backgroundColor: TEAM_COLORS[results.team1] }}
          onClick={() => onViewStats(results.team1, results.season1)}
        >
          <div className="text-xs md:text-sm text-white font-medium">
            {TEAM_NAMES[results.team1]} ({results.season1})
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">{team1Wins}%</div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${team1Wins}%` }} />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-semibold text-sm md:text-lg px-2">View Team Stats</span>
          </div>
        </div>
        <div
          className="p-4 md:p-6 rounded-lg space-y-2 cursor-pointer transition-all duration-300 hover:scale-105 relative group"
          style={{ backgroundColor: TEAM_COLORS[results.team2] }}
          onClick={() => onViewStats(results.team2, results.season2)}
        >
          <div className="text-xs md:text-sm text-white font-medium">
            {TEAM_NAMES[results.team2]} ({results.season2})
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">{team2Wins}%</div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${team2Wins}%` }} />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-semibold text-sm md:text-lg px-2">View Team Stats</span>
          </div>
        </div>
      </div>
    </div>
  )
}
