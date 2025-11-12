"use client"

import { useState, useEffect, useRef } from "react"
import { Maximize2, Minimize2, X, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TEAM_CODES, TEAM_NAMES, TEAM_COLORS, TEAM_OLDEST_YEAR } from "@/lib/teams"

interface SortConfig {
  column: number
  direction: "asc" | "desc"
}

interface HistoricalDataModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sendMessage: (message: any) => void
  socket: WebSocket | null
  initialTeam?: string
  initialSeason?: string
  autoFetch?: boolean
}

export function HistoricalDataModal({
  open,
  onOpenChange,
  sendMessage,
  socket,
  initialTeam = "ALL",
  initialSeason = "2023",
  autoFetch = false,
}: HistoricalDataModalProps) {
  const [season, setSeason] = useState(initialSeason)
  const [team, setTeam] = useState(initialTeam)
  const [displayedTeam, setDisplayedTeam] = useState<string>("ALL")
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const dataBuffer = useRef<any[]>([])
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i)

  useEffect(() => {
    if (!open) {
      setData([])
      setHeaders([])
      setIsLoading(false)
      setIsFullscreen(false)
      setSortConfig(null)
      setSeason("2023")
      setTeam("ALL")
      setDisplayedTeam("ALL")
      dataBuffer.current = []
    }
  }, [open])

  useEffect(() => {
    if (open && autoFetch) {
      setSeason(initialSeason)
      setTeam(initialTeam)
      setDisplayedTeam(initialTeam)
      setTimeout(() => fetchData(initialTeam, initialSeason), 100)
    }
  }, [open, initialTeam, initialSeason, autoFetch])

  const fetchData = (teamCode?: string, seasonYear?: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    const queryTeam = teamCode || team
    const querySeason = seasonYear || season

    if (queryTeam !== "ALL") {
      const teamOldestYear = Number.parseInt(TEAM_OLDEST_YEAR[queryTeam] || "1970")
      const selectedYear = Number.parseInt(querySeason)

      if (selectedYear < teamOldestYear) {
        alert(
          `${TEAM_NAMES[queryTeam]} did not exist in ${querySeason}. The team was established in ${teamOldestYear}.`,
        )
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setData([])
    setHeaders([])
    setSortConfig(null)
    dataBuffer.current = []
    setDisplayedTeam(queryTeam)

    const query =
      queryTeam === "ALL"
        ? `SELECT * FROM "nfl"."nfl_games_all" WHERE season = ${querySeason};`
        : `SELECT * FROM "nfl"."nfl_games_all" WHERE season = ${querySeason} AND team = '${queryTeam}';`

    sendMessage({ action: "nfl_all_games", query })
  }

  useEffect(() => {
    if (!socket || !open) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const { label, data: responseData } = JSON.parse(event.data)

        if (label === "headers") {
          setHeaders(responseData)
        } else if (label === "chunk") {
          dataBuffer.current.push(...responseData)
        } else if (label === "last_chunk") {
          dataBuffer.current.push(...responseData)
          setData([...dataBuffer.current])
          dataBuffer.current = []
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    }

    socket.addEventListener("message", handleMessage)
    return () => socket.removeEventListener("message", handleMessage)
  }, [socket, open])

  const handleSort = (columnIndex: number) => {
    const direction = sortConfig?.column === columnIndex && sortConfig.direction === "asc" ? "desc" : "asc"
    setSortConfig({ column: columnIndex, direction })

    const sortedData = [...data].sort((a, b) => {
      const aVal = a[columnIndex]
      const bVal = b[columnIndex]

      if (!isNaN(aVal) && !isNaN(bVal)) {
        return direction === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
      }

      return direction === "asc"
        ? String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
        : String(bVal).toLowerCase().localeCompare(String(aVal).toLowerCase())
    })

    setData(sortedData)
  }

  const modalClasses = isFullscreen
    ? "!w-screen !h-screen !max-w-none !max-h-none"
    : "!w-[95vw] !h-[90vh] !max-w-none !max-h-[90vh]"
  const modalBgColor = displayedTeam !== "ALL" ? TEAM_COLORS[displayedTeam] : "#dfc8aa"
  const borderColor = team !== "ALL" ? TEAM_COLORS[team] : "#d1d5db"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${modalClasses} overflow-hidden text-white border-none flex flex-col select-none outline-none focus:outline-none focus-visible:outline-none p-4 md:p-6`}
        style={{ backgroundColor: modalBgColor }}
        showCloseButton={false}
      >
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1 md:gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>

        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle className="text-white text-lg md:text-xl">Historical NFL Game Data</DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            Query historical NFL game data by season and team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-start gap-3 md:gap-4 pl-0 sm:pl-4">
            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-white text-sm">Season</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="border-gray-300 bg-white text-gray-900 w-full sm:w-32 font-medium text-sm md:text-base">
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

            <div className="space-y-2 w-full sm:flex-1 sm:max-w-xs">
              <Label className="text-white text-sm">Team</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger
                  className="w-full font-medium text-sm md:text-base"
                  style={{
                    backgroundColor: team !== "ALL" ? TEAM_COLORS[team] : "#ffffff",
                    color: team !== "ALL" ? "#ffffff" : "#111827",
                    borderColor,
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

            <div className="flex items-end w-full sm:w-auto">
              <Button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="bg-white hover:bg-white/90 w-full sm:w-auto text-sm md:text-base"
                style={{ color: modalBgColor }}
              >
                {isLoading ? "Loading..." : "Fetch Data"}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          )}

          {!isLoading && headers.length > 0 && (
            <div className="border border-white/20 rounded-lg overflow-hidden bg-white max-h-[calc(90vh-200px)]">
              <div
                className="overflow-x-scroll overflow-y-auto max-h-full select-none outline-none"
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  outline: "none",
                }}
                onWheel={(e) => {
                  if (e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.scrollLeft += e.deltaY
                  }
                }}
              >
                <table
                  className="w-full text-xs sm:text-sm select-text"
                  style={{ userSelect: "text", WebkitUserSelect: "text", MozUserSelect: "text" }}
                >
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      {headers.map((header, i) => (
                        <th
                          key={i}
                          className={`px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-200 transition-colors ${
                            header.toLowerCase().includes("date") ? "min-w-[120px] sm:min-w-[140px]" : ""
                          }`}
                          onClick={() => handleSort(i)}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                            <span className="text-xs sm:text-sm">{header}</span>
                            {sortConfig?.column === i &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((row, i) => (
                        <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                          {row.map((cell: any, j: number) => (
                            <td
                              key={j}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 whitespace-nowrap text-xs sm:text-sm"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500 text-sm">
                          Click "Fetch Data" to load historical games
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
