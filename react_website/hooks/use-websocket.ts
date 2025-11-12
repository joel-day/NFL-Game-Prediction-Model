"use client"

import { useEffect, useRef, useState } from "react"

const WS_URL = "wss://7aqddsnx56.execute-api.us-east-2.amazonaws.com/prod/"
const HEARTBEAT_INTERVAL = 300000 // 5 minutes

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)

      heartbeatRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ action: "heartbeat" }))
        }
      }, HEARTBEAT_INTERVAL)
    }

    socket.onerror = (error) => console.error("WebSocket error:", error)

    socket.onclose = () => {
      setIsConnected(false)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (socket.readyState === WebSocket.OPEN) socket.close()
    }
  }, [])

  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    }
  }

  return { socket: socketRef.current, isConnected, sendMessage }
}
