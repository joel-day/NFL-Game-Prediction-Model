"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { TeamSelector } from "@/components/team-selector"
import { SimulationResults } from "@/components/simulation-results"
import { HistoricalDataModal } from "@/components/historical-data-modal"
import { useWebSocket } from "@/hooks/use-websocket"
import { TEAM_CODES, TEAM_NAMES, TEAM_COLORS, TEAM_OLDEST_YEAR } from "@/lib/teams"

export default function HomePage() {
  const [team1, setTeam1] = useState("MIN")
  const [team2, setTeam2] = useState("BUF")
  const [season1, setSeason1] = useState("2023")
  const [season2, setSeason2] = useState("2023")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyTeam, setHistoryTeam] = useState("ALL")
  const [historySeason, setHistorySeason] = useState("2023")
  const [autoFetch, setAutoFetch] = useState(false)

  const { sendMessage, socket, isConnected } = useWebSocket()

  const handleSimulate = () => {
    if (!isConnected) return
    setIsSimulating(true)
    setSimulationResults(null)
    sendMessage({
      action: "nfl_matchups_model",
      team: team1,
      opponent: team2,
      season1,
      season2,
    })
  }

  const handleViewTeamStats = (team: string, season: string) => {
    setHistoryTeam(team)
    setHistorySeason(season)
    setAutoFetch(true)
    setShowHistory(true)
  }

  const scrollToSimulator = () => {
    document.getElementById("simulator-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const { label, data } = JSON.parse(event.data)
        if (label === "model_results_team1_win_pct") {
          setSimulationResults({ team1, team2, season1, season2, winPct: data })
          setIsSimulating(false)
        } else if (label === "model_error") {
          setIsSimulating(false)
        }
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    }

    socket.addEventListener("message", handleMessage)
    return () => socket.removeEventListener("message", handleMessage)
  }, [socket, team1, team2, season1, season2])

  useEffect(() => {
    if (showHistory && autoFetch) setAutoFetch(false)
  }, [showHistory, autoFetch])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i)

  const getValidHistoricalYears = () => {
    if (historyTeam === "ALL") return years
    const oldestYear = TEAM_OLDEST_YEAR[historyTeam] || 1970
    return years.filter((year) => year >= oldestYear)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3">
            <Image src="/chalkjuice-logo.png" alt="ChalkJuice" width={180} height={40} className="h-8 w-auto" />
            <nav className="flex gap-1 justify-center md:justify-start">
              {["NFL", "NHL", "MLB", "NBA"].map((league) => (
                <Button
                  key={league}
                  variant={league === "NFL" ? "default" : "ghost"}
                  size="sm"
                  disabled={league !== "NFL"}
                  className="whitespace-nowrap text-xs md:text-sm"
                >
                  {league}
                  {league !== "NFL" && (
                    <span className="ml-1 md:ml-2 text-xs text-muted-foreground hidden sm:inline">(Coming Soon)</span>
                  )}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-4 pt-24 md:pt-16 -mb-[10vh] relative">
        <div className="max-w-4xl text-center space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tighter text-balance">
              NFL Matchup Prediction Engine
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto px-4">
              Simulate head-to-head NFL matchups using advanced analytics and historical data from 1970 to present
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12">
            {[
              { value: "100", label: "Simulations per matchup" },
              { value: "32", label: "NFL Teams" },
              { value: "50+", label: "Years of data" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={scrollToSimulator}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          aria-label="Scroll to simulator"
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
        </button>
      </section>

      {/* NFL Matchup Simulator Section */}
      <section
        id="simulator-section"
        className="px-4 pt-20 md:pt-16 relative z-10 overflow-hidden"
        style={{
          backgroundColor: "#dfc8aa",
          minHeight: simulationResults ? "auto" : "40vh",
          paddingBottom: simulationResults ? "2rem" : "1rem",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[0.1, 0.05].map((opacity, i) => (
            <svg key={i} className="absolute bottom-0 w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path
                fill={`rgba(255, 255, 255, ${opacity})`}
                d={
                  i === 0
                    ? "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    : "M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                }
                className={i === 0 ? "animate-wave" : "animate-wave-slow"}
              />
            </svg>
          ))}
        </div>

        <div className="container mx-auto max-w-4xl space-y-4 md:space-y-6 pt-4 relative z-10">
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-black">
              Select teams and click 'Go'.
            </h2>
            <p className="text-black/80 text-sm sm:text-base md:text-lg px-4">
              100 Monte Carlo simulations of this matchup are run to estimate win probabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            <TeamSelector
              label="Team 1"
              team={team1}
              season={season1}
              onTeamChange={setTeam1}
              onSeasonChange={setSeason1}
            />
            <TeamSelector
              label="Team 2"
              team={team2}
              season={season2}
              onTeamChange={setTeam2}
              onSeasonChange={setSeason2}
            />
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleSimulate}
              disabled={isSimulating || !isConnected}
              className="px-8 md:px-12 py-4 md:py-6 text-base md:text-lg bg-white hover:bg-white/90 text-black"
            >
              {isSimulating ? "Simulating..." : "Go"}
            </Button>
          </div>

          {simulationResults && <SimulationResults results={simulationResults} onViewStats={handleViewTeamStats} />}
        </div>
      </section>

      {/* Explore Historical Data Section */}
      <section className="min-h-[40vh] flex items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-balance">
              Explore Historical Data
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-balance max-w-2xl mx-auto px-4">
              Access decades of NFL game data, statistics, and historical matchups
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
            <div className="space-y-2 flex-1">
              <Label className="text-sm">Team</Label>
              <Select value={historyTeam} onValueChange={setHistoryTeam}>
                <SelectTrigger
                  className="w-full font-medium"
                  style={{
                    backgroundColor: historyTeam !== "ALL" ? TEAM_COLORS[historyTeam] : "#ffffff",
                    color: historyTeam !== "ALL" ? "#ffffff" : "#111827",
                    borderColor: historyTeam !== "ALL" ? TEAM_COLORS[historyTeam] : "#d1d5db",
                    borderWidth: "2px",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="bg-white text-gray-900 font-medium">
                    All Teams
                  </SelectItem>
                  {TEAM_CODES.map((code) => (
                    <SelectItem
                      key={code}
                      value={code}
                      className="font-medium"
                      style={{ backgroundColor: TEAM_COLORS[code], color: "#ffffff" }}
                    >
                      {TEAM_NAMES[code]} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 sm:flex-none">
              <Label className="text-sm">Season</Label>
              <Select value={historySeason} onValueChange={setHistorySeason}>
                <SelectTrigger className="border-gray-300 bg-white text-gray-900 w-full sm:w-32 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getValidHistoricalYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                size="lg"
                onClick={() => {
                  setAutoFetch(true)
                  setShowHistory(true)
                }}
                className="px-6 md:px-8 w-full sm:w-auto"
              >
                Fetch Data
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section
        className="min-h-[15vh] flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ backgroundColor: "#dfc8aa" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[0.1, 0.05].map((opacity, i) => (
            <svg key={i} className="absolute bottom-0 w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path
                fill={`rgba(255, 255, 255, ${opacity})`}
                d={
                  i === 0
                    ? "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    : "M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                }
                className={i === 0 ? "animate-wave" : "animate-wave-slow"}
              />
            </svg>
          ))}
        </div>

        <div className="relative z-10">
          <Image src="/chalkjuice-logo.png" alt="ChalkJuice" width={200} height={45} className="h-12 w-auto" />
        </div>
      </section>

      <HistoricalDataModal
        open={showHistory}
        onOpenChange={setShowHistory}
        sendMessage={sendMessage}
        socket={socket}
        initialTeam={historyTeam}
        initialSeason={historySeason}
        autoFetch={autoFetch}
      />
    </div>
  )
}
