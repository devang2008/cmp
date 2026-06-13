import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Make io globally accessible for API routes
  ;(global as any).io = io

  io.on('connection', (socket) => {

    // Deal chat room
    socket.on('join-deal', (dealId: string) => {
      socket.join(`deal-${dealId}`)
    })

    socket.on('leave-deal', (dealId: string) => {
      socket.leave(`deal-${dealId}`)
    })

    // Broadcast new message to deal room
    // (called from API route after saving to DB)
    socket.on('send-message', (data: {
      dealId: string
      message: Record<string, unknown>
    }) => {
      io.to(`deal-${data.dealId}`).emit('new-message', data.message)
    })

    // Typing indicator
    socket.on('typing', (data: {
      dealId: string
      alias: string
      isTyping: boolean
    }) => {
      socket.to(`deal-${data.dealId}`)
        .emit('user-typing', {
          alias: data.alias,
          isTyping: data.isTyping
        })
    })

    // Notification room
    socket.on('join-notifications', (alias: string) => {
      socket.join(`notifications-${alias}`)
    })

    // Moderator room — receives real-time alerts for new cert uploads
    socket.on('join-moderator-room', () => {
      socket.join('moderator-room')
    })

    socket.on('disconnect', () => {})
  })

  httpServer.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  httpServer.listen(port, () => {
    console.log(`> SHIELD ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO server active`)
  })
})
