const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Store userId -> socketId mapping
  const userSockets = new Map()

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    // User identifies themselves after connecting
    socket.on('join', (userId) => {
      userSockets.set(userId, socket.id)
      socket.join(`user_${userId}`)
      console.log(`User ${userId} joined room user_${userId}`)
    })

    socket.on('disconnect', () => {
      userSockets.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userSockets.delete(userId)
        }
      })
      console.log('Socket disconnected:', socket.id)
    })
  })

  // Make io accessible globally for API routes
  global.io = io
  global.userSockets = userSockets

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})