require('dotenv').config()
const express     = require('express')
const http        = require('http')
const { Server }  = require('socket.io')
const Redis       = require('ioredis')
const jwt         = require('jsonwebtoken')
const cors        = require('cors')

const app    = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin:      (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Redis pub/sub clients (separate connections for pub and sub)
const redisSubscriber = new Redis({
  host:     process.env.REDIS_HOST     || 'redis',
  port:     parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
})

const redisPub = new Redis({
  host:     process.env.REDIS_HOST     || 'redis',
  port:     parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
})

// Track connected users: userId → Set<socketId>
const connectedUsers = new Map()

// JWT verification middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')
  if (!token) return next(new Error('Authentication required'))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme')
    socket.userId = decoded.sub || decoded.id
    socket.userRole = decoded.role || 'client'
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.userId

  // Track connection
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set())
  }
  connectedUsers.get(userId).add(socket.id)

  // Join personal room
  socket.join(`user:${userId}`)

  console.log(`[Socket] User ${userId} connected (${socket.id})`)

  // Broadcast online status
  io.emit('user:online', { userId, online: true })

  // ─── Event: join conversation room ────────────────────────────────────────
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`)
  })

  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`)
  })

  // ─── Event: new message ───────────────────────────────────────────────────
  socket.on('message:send', async ({ conversationId, message }) => {
    if (!conversationId || !message) return

    // Broadcast to all in conversation except sender
    socket.to(`conversation:${conversationId}`).emit('message:new', {
      conversationId,
      message: {
        ...message,
        sender_id: userId,
        created_at: new Date().toISOString(),
      },
    })

    // Publish to Redis for Laravel to persist (optional webhook pattern)
    redisPub.publish('chamalcom:messages', JSON.stringify({
      event:           'message:new',
      conversation_id: conversationId,
      sender_id:       userId,
      message,
    }))
  })

  // ─── Event: typing indicator ──────────────────────────────────────────────
  socket.on('typing:start', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:start', { userId, conversationId })
  })

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId, conversationId })
  })

  // ─── Event: mark messages as read ─────────────────────────────────────────
  socket.on('message:read', ({ conversationId, messageIds }) => {
    socket.to(`conversation:${conversationId}`).emit('message:read', { userId, conversationId, messageIds })
  })

  // ─── Event: booking real-time update ──────────────────────────────────────
  socket.on('booking:watch', (bookingId) => {
    socket.join(`booking:${bookingId}`)
  })

  // ─── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const sockets = connectedUsers.get(userId)
    if (sockets) {
      sockets.delete(socket.id)
      if (sockets.size === 0) {
        connectedUsers.delete(userId)
        io.emit('user:offline', { userId, online: false })
      }
    }
    console.log(`[Socket] User ${userId} disconnected (${socket.id})`)
  })
})

// ─── Redis subscriber: Laravel → Socket.io bridge ─────────────────────────────
redisSubscriber.subscribe('chamalcom:notifications', 'chamalcom:bookings', (err, count) => {
  if (err) console.error('[Redis] Subscribe error:', err)
  else console.log(`[Redis] Subscribed to ${count} channel(s)`)
})

redisSubscriber.on('message', (channel, rawMsg) => {
  try {
    const payload = JSON.parse(rawMsg)

    if (channel === 'chamalcom:notifications') {
      const { event, user_id, data } = payload
      if (user_id) {
        io.to(`user:${user_id}`).emit(event, data)
        console.log(`[Redis→Socket] ${event} → user:${user_id}`)
      }
    }

    if (channel === 'chamalcom:bookings') {
      const { event, booking_id, user_id, owner_id, data } = payload
      if (booking_id) io.to(`booking:${booking_id}`).emit(event, data)
      if (user_id)    io.to(`user:${user_id}`).emit(event, data)
      if (owner_id)   io.to(`user:${owner_id}`).emit(event, data)
    }
  } catch (e) {
    console.error('[Redis] Parse error:', e)
  }
})

// ─── Health check endpoint ────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status:           'ok',
    connected_users:  connectedUsers.size,
    uptime:           process.uptime(),
    timestamp:        new Date().toISOString(),
  })
})

app.get('/stats', (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.SOCKET_API_KEY) return res.status(401).json({ error: 'Unauthorized' })

  res.json({
    connected_users: connectedUsers.size,
    user_ids:        Array.from(connectedUsers.keys()),
    sockets:         io.engine.clientsCount,
  })
})

// ─── Admin broadcast endpoint (called by Laravel) ─────────────────────────────
app.post('/broadcast', (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.SOCKET_API_KEY) return res.status(401).json({ error: 'Unauthorized' })

  const { room, event, data } = req.body
  if (!room || !event) return res.status(400).json({ error: 'room and event required' })

  io.to(room).emit(event, data)
  console.log(`[HTTP Broadcast] ${event} → ${room}`)
  res.json({ success: true, room, event })
})

const PORT = process.env.SOCKET_PORT || 3001
server.listen(PORT, () => {
  console.log(`[ChamalCom Socket.io] Listening on :${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Socket.io] SIGTERM received, shutting down...')
  server.close(() => {
    redisSubscriber.quit()
    redisPub.quit()
    process.exit(0)
  })
})
