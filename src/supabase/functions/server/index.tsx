import { Hono } from 'npm:hono@4.3.11'
import { cors } from 'npm:hono@4.3.11/cors'
import { logger } from 'npm:hono@4.3.11/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

console.log('=== SERVER INITIALIZING ===')

const app = new Hono()

// CORS - must be first
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger())

console.log('Creating Supabase client...')
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
)

// Health check - simple test endpoint
app.get('/make-server-a8b30827/health', (c) => {
  console.log('Health check called')
  return c.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    message: 'Server is running!' 
  })
})

// Initialize storage (async, non-blocking)
setTimeout(async () => {
  try {
    console.log('Initializing storage...')
    const { data: buckets } = await supabase.storage.listBuckets()
    
    const avatarBucket = 'make-a8b30827-avatars'
    const chatBucket = 'make-a8b30827-chat-images'
    
    if (!buckets?.some(b => b.name === avatarBucket)) {
      await supabase.storage.createBucket(avatarBucket, { public: false })
      console.log('Created avatar bucket')
    }
    
    if (!buckets?.some(b => b.name === chatBucket)) {
      await supabase.storage.createBucket(chatBucket, { public: false })
      console.log('Created chat bucket')
    }
  } catch (e) {
    console.error('Storage init error:', e)
  }
}, 100)

// Initialize rooms (async, non-blocking)
setTimeout(async () => {
  try {
    console.log('Initializing rooms...')
    const existing = await kv.get('rooms')
    if (!existing) {
      const defaultRooms = [
        { id: 'general', name: 'General', description: 'General discussion' },
        { id: 'random', name: 'Random', description: 'Random chat' },
        { id: 'tech', name: 'Tech', description: 'Technology talk' },
        { id: 'gaming', name: 'Gaming', description: 'Gaming discussion' },
      ]
      await kv.set('rooms', defaultRooms)
      console.log('Default rooms created')
    }
  } catch (e) {
    console.error('Rooms init error:', e)
  }
}, 100)

// Sign up
app.post('/make-server-a8b30827/signup', async (c) => {
  try {
    console.log('Signup request received')
    const body = await c.req.json()
    const { email, password, username } = body
    
    if (!email || !password || !username) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const existing = await kv.get(`username:${username.toLowerCase()}`)
    if (existing) {
      return c.json({ error: 'Username already taken' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true
    })

    if (error) {
      console.error('Auth error:', error)
      return c.json({ error: error.message }, 400)
    }

    await kv.set(`username:${username.toLowerCase()}`, data.user.id)
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      username,
      email,
      avatarUrl: null,
      createdAt: Date.now()
    })

    console.log('User created:', username)
    return c.json({ success: true, userId: data.user.id, username })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get user
app.get('/make-server-a8b30827/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    console.log('Get user:', userId)
    const user = await kv.get(`user:${userId}`)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get rooms
app.get('/make-server-a8b30827/rooms', async (c) => {
  try {
    console.log('Get rooms request')
    const rooms = await kv.get('rooms') || []
    console.log('Returning rooms:', rooms.length)
    return c.json({ rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Join room
app.post('/make-server-a8b30827/join-room', async (c) => {
  try {
    const { roomId, username, userId } = await c.req.json()
    
    if (!roomId || !username || !userId) {
      return c.json({ error: 'Missing fields' }, 400)
    }

    const key = `room:${roomId}:users`
    const users = (await kv.get(key)) || []
    const filtered = users.filter((u: any) => u.userId !== userId)
    
    filtered.push({ 
      userId, 
      username, 
      joinedAt: Date.now(),
      lastActive: Date.now()
    })
    
    await kv.set(key, filtered)
    console.log('User joined room:', username, roomId)
    return c.json({ success: true })
  } catch (error) {
    console.error('Join room error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Leave room
app.post('/make-server-a8b30827/leave-room', async (c) => {
  try {
    const { roomId, userId } = await c.req.json()
    
    if (!roomId || !userId) {
      return c.json({ error: 'Missing fields' }, 400)
    }

    const key = `room:${roomId}:users`
    const users = (await kv.get(key)) || []
    const filtered = users.filter((u: any) => u.userId !== userId)
    
    await kv.set(key, filtered)
    return c.json({ success: true })
  } catch (error) {
    console.error('Leave room error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Send message
app.post('/make-server-a8b30827/send-message', async (c) => {
  try {
    const { roomId, username, userId, message, imageUrl } = await c.req.json()
    
    if (!roomId || !username || !userId) {
      return c.json({ error: 'Missing fields' }, 400)
    }

    const key = `room:${roomId}:messages`
    const messages = (await kv.get(key)) || []
    
    messages.push({
      id: `${userId}-${Date.now()}`,
      userId,
      username,
      message: message || '',
      imageUrl: imageUrl || null,
      timestamp: Date.now(),
    })
    
    if (messages.length > 100) {
      messages.shift()
    }
    
    await kv.set(key, messages)
    return c.json({ success: true })
  } catch (error) {
    console.error('Send message error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get messages
app.get('/make-server-a8b30827/messages/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const messages = (await kv.get(`room:${roomId}:messages`)) || []
    return c.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get active users
app.get('/make-server-a8b30827/active-users/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const users = (await kv.get(`room:${roomId}:users`)) || []
    return c.json({ users })
  } catch (error) {
    console.error('Get active users error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get code state
app.get('/make-server-a8b30827/code-editor/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const codeState = await kv.get(`room:${roomId}:code`)
    return c.json({ codeState: codeState || null })
  } catch (error) {
    console.error('Get code error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Update code
app.post('/make-server-a8b30827/update-code', async (c) => {
  try {
    const { roomId, code, language, theme, fontSize, userId, username } = await c.req.json()
    
    if (!roomId) {
      return c.json({ error: 'Missing roomId' }, 400)
    }

    const key = `room:${roomId}:code`
    const current = (await kv.get(key)) || {}
    
    const newState = {
      code: code !== undefined ? code : current.code || '',
      language: language !== undefined ? language : current.language || 'python',
      theme: theme !== undefined ? theme : current.theme || 'vs-dark',
      fontSize: fontSize !== undefined ? fontSize : current.fontSize || 14,
      lastUpdatedBy: username || current.lastUpdatedBy,
      lastUpdatedAt: Date.now(),
    }
    
    await kv.set(key, newState)
    return c.json({ success: true, codeState: newState })
  } catch (error) {
    console.error('Update code error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Typing status
app.post('/make-server-a8b30827/typing-status', async (c) => {
  try {
    const { roomId, userId, username, isTyping } = await c.req.json()
    
    if (!roomId || !userId) {
      return c.json({ error: 'Missing fields' }, 400)
    }

    const key = `room:${roomId}:typing`
    const typingUsers = (await kv.get(key)) || []
    
    if (isTyping) {
      const idx = typingUsers.findIndex((u: any) => u.userId === userId)
      const user = { userId, username, timestamp: Date.now() }
      
      if (idx >= 0) {
        typingUsers[idx] = user
      } else {
        typingUsers.push(user)
      }
      
      const now = Date.now()
      const active = typingUsers.filter((u: any) => now - u.timestamp < 5000)
      await kv.set(key, active)
    } else {
      const filtered = typingUsers.filter((u: any) => u.userId !== userId)
      await kv.set(key, filtered)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Typing status error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get typing users
app.get('/make-server-a8b30827/typing-users/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const key = `room:${roomId}:typing`
    const typingUsers = (await kv.get(key)) || []
    
    const now = Date.now()
    const active = typingUsers.filter((u: any) => now - u.timestamp < 5000)
    
    if (active.length !== typingUsers.length) {
      await kv.set(key, active)
    }
    
    return c.json({ typingUsers: active })
  } catch (error) {
    console.error('Get typing error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Upload avatar
app.post('/make-server-a8b30827/upload-avatar', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return c.json({ error: 'Missing file or userId' }, 400)
    }

    const ext = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${ext}`
    const bucket = 'make-a8b30827-avatars'

    const buffer = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return c.json({ error: 'Upload failed' }, 500)
    }

    const { data: urlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365)

    if (!urlData) {
      return c.json({ error: 'Failed to get URL' }, 500)
    }

    const user = await kv.get(`user:${userId}`)
    if (user) {
      user.avatarUrl = urlData.signedUrl
      await kv.set(`user:${userId}`, user)
    }

    return c.json({ success: true, avatarUrl: urlData.signedUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Upload chat image
app.post('/make-server-a8b30827/upload-chat-image', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return c.json({ error: 'Missing file or userId' }, 400)
    }

    const ext = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${ext}`
    const bucket = 'make-a8b30827-chat-images'

    const buffer = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return c.json({ error: 'Upload failed' }, 500)
    }

    const { data: urlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365)

    if (!urlData) {
      return c.json({ error: 'Failed to get URL' }, 500)
    }

    return c.json({ success: true, imageUrl: urlData.signedUrl })
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// ===== GAME ROUTES FOR SYNTAX: BREACH =====

// Join lobby
app.post('/make-server-a8b30827/join-lobby', async (c) => {
  try {
    const { roomId, username, userId, isHost } = await c.req.json()
    
    const key = `game:${roomId}:lobby`
    const players = (await kv.get(key)) || []
    const filtered = players.filter((p: any) => p.userId !== userId)
    
    filtered.push({
      userId,
      username,
      isHost,
      isReady: false,
      joinedAt: Date.now(),
    })
    
    await kv.set(key, filtered)
    return c.json({ success: true })
  } catch (error) {
    console.error('Join lobby error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Leave lobby
app.post('/make-server-a8b30827/leave-lobby', async (c) => {
  try {
    const { roomId, userId } = await c.req.json()
    
    const key = `game:${roomId}:lobby`
    const players = (await kv.get(key)) || []
    const filtered = players.filter((p: any) => p.userId !== userId)
    
    await kv.set(key, filtered)
    return c.json({ success: true })
  } catch (error) {
    console.error('Leave lobby error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get lobby players
app.get('/make-server-a8b30827/lobby-players/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const players = (await kv.get(`game:${roomId}:lobby`)) || []
    return c.json({ players })
  } catch (error) {
    console.error('Get lobby players error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Toggle ready
app.post('/make-server-a8b30827/toggle-ready', async (c) => {
  try {
    const { roomId, userId, isReady } = await c.req.json()
    
    const key = `game:${roomId}:lobby`
    const players = (await kv.get(key)) || []
    
    const player = players.find((p: any) => p.userId === userId)
    if (player) {
      player.isReady = isReady
      await kv.set(key, players)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Toggle ready error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Check if user is host
app.get('/make-server-a8b30827/check-host/:roomId/:userId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const userId = c.req.param('userId')
    
    const players = (await kv.get(`game:${roomId}:lobby`)) || []
    const player = players.find((p: any) => p.userId === userId)
    
    return c.json({ isHost: player?.isHost || false })
  } catch (error) {
    console.error('Check host error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Start game
app.post('/make-server-a8b30827/start-game', async (c) => {
  try {
    const { roomId } = await c.req.json()
    
    const lobbyPlayers = (await kv.get(`game:${roomId}:lobby`)) || []
    
    // Assign roles - 1 phantom per 3 players
    const phantomCount = Math.max(1, Math.floor(lobbyPlayers.length / 3))
    const shuffled = [...lobbyPlayers].sort(() => Math.random() - 0.5)
    
    // Task pool - simplified for now
    const taskIds = [
      'py_reverse_string', 'py_sum_array', 'py_fibonacci',
      'c_swap_values', 'c_factorial',
      'cpp_is_palindrome', 'cpp_find_max', 'cpp_binary_search'
    ]
    
    const gamePlayers = shuffled.map((p: any, index: number) => {
      // Assign 3 random tasks
      const playerTasks = [...taskIds].sort(() => Math.random() - 0.5).slice(0, 3)
      
      return {
        userId: p.userId,
        username: p.username,
        role: index < phantomCount ? 'phantom' : 'patcher',
        isAlive: true,
        tasks: playerTasks,
        completedTasks: 0,
      }
    })
    
    const gameState = {
      phase: 'coding',
      players: gamePlayers,
      tasks: taskIds,
      completedTasks: [],
      round: 1,
      winner: null,
    }
    
    await kv.set(`game:${roomId}:state`, gameState)
    
    // Clear lobby
    await kv.set(`game:${roomId}:lobby`, [])
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Start game error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get game state
app.get('/make-server-a8b30827/game-state/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const gameState = await kv.get(`game:${roomId}:state`)
    
    if (!gameState) {
      return c.json({ gameState: { phase: 'lobby' } })
    }
    
    return c.json({ gameState })
  } catch (error) {
    console.error('Get game state error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Complete task
app.post('/make-server-a8b30827/complete-task', async (c) => {
  try {
    const { roomId, userId, taskId } = await c.req.json()
    
    const gameState = await kv.get(`game:${roomId}:state`)
    if (!gameState) return c.json({ error: 'Game not found' }, 404)
    
    const player = gameState.players.find((p: any) => p.userId === userId)
    if (!player) return c.json({ error: 'Player not found' }, 404)
    
    // Add to completed tasks
    if (!gameState.completedTasks.includes(taskId)) {
      gameState.completedTasks.push(taskId)
      player.completedTasks++
    }
    
    // Check win condition - Patchers win if all tasks complete
    const totalTasks = gameState.players.reduce((sum: number, p: any) => sum + p.tasks.length, 0)
    if (gameState.completedTasks.length >= totalTasks) {
      gameState.phase = 'results'
      gameState.winner = 'patchers'
    }
    
    await kv.set(`game:${roomId}:state`, gameState)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Complete task error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Execute sabotage
app.post('/make-server-a8b30827/execute-sabotage', async (c) => {
  try {
    const { roomId, userId, sabotageId } = await c.req.json()
    
    console.log('Sabotage executed:', sabotageId)
    
    // Force meeting sabotage
    if (sabotageId === 'force_meeting') {
      const gameState = await kv.get(`game:${roomId}:state`)
      if (gameState) {
        gameState.phase = 'meeting'
        gameState.meetingReason = 'Emergency sabotage triggered'
        await kv.set(`game:${roomId}:state`, gameState)
        await kv.set(`game:${roomId}:votes`, {})
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Execute sabotage error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Call meeting
app.post('/make-server-a8b30827/call-meeting', async (c) => {
  try {
    const { roomId, userId, username } = await c.req.json()
    
    const gameState = await kv.get(`game:${roomId}:state`)
    if (!gameState) return c.json({ error: 'Game not found' }, 404)
    
    gameState.phase = 'meeting'
    gameState.meetingReason = 'Emergency meeting called'
    gameState.meetingCallerId = userId
    
    await kv.set(`game:${roomId}:state`, gameState)
    await kv.set(`game:${roomId}:votes`, {})
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Call meeting error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Cast vote
app.post('/make-server-a8b30827/cast-vote', async (c) => {
  try {
    const { roomId, userId, targetUserId } = await c.req.json()
    
    const votes = (await kv.get(`game:${roomId}:votes`)) || {}
    votes[userId] = targetUserId
    
    await kv.set(`game:${roomId}:votes`, votes)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Cast vote error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Get votes
app.get('/make-server-a8b30827/get-votes/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const votes = (await kv.get(`game:${roomId}:votes`)) || {}
    
    return c.json({ votes })
  } catch (error) {
    console.error('Get votes error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// Eliminate player
app.post('/make-server-a8b30827/eliminate-player', async (c) => {
  try {
    const { roomId, targetUserId } = await c.req.json()
    
    const gameState = await kv.get(`game:${roomId}:state`)
    if (!gameState) return c.json({ error: 'Game not found' }, 404)
    
    const player = gameState.players.find((p: any) => p.userId === targetUserId)
    if (player) {
      player.isAlive = false
    }
    
    // Check win conditions
    const alivePatchers = gameState.players.filter((p: any) => p.role === 'patcher' && p.isAlive).length
    const alivePhantoms = gameState.players.filter((p: any) => p.role === 'phantom' && p.isAlive).length
    
    // Phantoms win if they equal or outnumber Patchers
    if (alivePhantoms >= alivePatchers && alivePhantoms > 0) {
      gameState.phase = 'results'
      gameState.winner = 'phantoms'
    }
    // Phantoms win if all eliminated
    else if (alivePhantoms === 0) {
      gameState.phase = 'results'
      gameState.winner = 'patchers'
    }
    
    await kv.set(`game:${roomId}:state`, gameState)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Eliminate player error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// End meeting
app.post('/make-server-a8b30827/end-meeting', async (c) => {
  try {
    const { roomId } = await c.req.json()
    
    const gameState = await kv.get(`game:${roomId}:state`)
    if (!gameState) return c.json({ error: 'Game not found' }, 404)
    
    // Check if game is over
    if (gameState.winner) {
      gameState.phase = 'results'
    } else {
      gameState.phase = 'coding'
      gameState.round = (gameState.round || 1) + 1
    }
    
    await kv.set(`game:${roomId}:state`, gameState)
    await kv.set(`game:${roomId}:votes`, {})
    
    return c.json({ success: true })
  } catch (error) {
    console.error('End meeting error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

console.log('=== SERVER READY - Starting Deno.serve ===')

Deno.serve(app.fetch)