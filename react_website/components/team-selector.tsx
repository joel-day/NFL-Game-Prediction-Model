"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { TEAM_CODES, TEAM_NAMES, TEAM_OLDEST_YEAR, TEAM_COLORS } from "@/lib/teams"

interface TeamSelectorProps {
  label: string
  team: string
  season: string
  onTeamChange: (team: string) => void
  onSeasonChange: (season: string) => void
}

export function TeamSelector({ label, team, season, onTeamChange, onSeasonChange }: TeamSelectorProps) {
  const currentYear = new Date().getFullYear()
  const teamOldestYear = Number.parseInt(TEAM_OLDEST_YEAR[team] || "1970")
  const years = Array.from({ length: currentYear - teamOldestYear + 1 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-base md:text-lg font-semibold text-gray-900">{label}</h3>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor={`team-${label}`} className="text-gray-700 text-sm">
            Team
          </Label>
          <Select value={team} onValueChange={onTeamChange}>
            <SelectTrigger
              id={`team-${label}`}
              className="bg-white border-gray-300 text-sm md:text-base"
              style={{
                backgroundColor: TEAM_COLORS[team],
                color: "#ffffff",
                fontWeight: "500",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_CODES.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                  className="hover:bg-gray-100 text-sm md:text-base"
                  style={{
                    backgroundColor: TEAM_COLORS[code],
                    color: "#ffffff",
                    fontWeight: "500",
                  }}
                >
                  {TEAM_NAMES[code]} ({code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full sm:w-28 md:w-32">
          <Label htmlFor={`season-${label}`} className="text-gray-700 text-sm">
            Season
          </Label>
          <Select value={season} onValueChange={onSeasonChange}>
            <SelectTrigger
              id={`season-${label}`}
              className="border-gray-300 bg-white text-gray-900 text-sm md:text-base"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
