'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let globalSocket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        {
          withCredentials: true,
          transports: ['websocket', 'polling']
        }
      )
    }

    socketRef.current = globalSocket

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    globalSocket.on('connect', handleConnect)
    globalSocket.on('disconnect', handleDisconnect)

    if (globalSocket.connected) {
      setIsConnected(true)
    }

    return () => {
      globalSocket?.off('connect', handleConnect)
      globalSocket?.off('disconnect', handleDisconnect)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected
  }
}
