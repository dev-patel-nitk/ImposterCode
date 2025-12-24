import { useState, useEffect } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { RoomSelection } from './components/RoomSelection'
import { SyntaxBreachGame } from './components/SyntaxBreachGame'
import { projectId, publicAnonKey } from './utils/supabase/info'

type Screen = 'auth' | 'rooms' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [currentRoom, setCurrentRoom] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    // Test server connectivity
    testServerConnection()
    
    // Check if user is already logged in
    const storedUserId = localStorage.getItem('chatUserId')
    const storedUsername = localStorage.getItem('chatUsername')
    const storedToken = localStorage.getItem('chatAccessToken')
    
    if (storedUserId && storedUsername && storedToken) {
      setUserId(storedUserId)
      setUsername(storedUsername)
      setAccessToken(storedToken)
      setScreen('rooms')
    }
  }, [])

  const testServerConnection = async () => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a8b30827/health`
      console.log('Testing server connection:', url)
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Server connection successful:', data)
      } else {
        console.error('❌ Server responded with error:', response.status, await response.text())
      }
    } catch (error) {
      console.error('❌ Server connection failed:', error)
      console.error('Server URL:', `https://${projectId}.supabase.co/functions/v1/make-server-a8b30827/`)
      console.error('This usually means the Supabase Edge Function is not deployed or not running')
    }
  }

  const handleAuthSuccess = (userId: string, username: string, accessToken: string) => {
    setUserId(userId)
    setUsername(username)
    setAccessToken(accessToken)
    
    // Store in localStorage
    localStorage.setItem('chatUserId', userId)
    localStorage.setItem('chatUsername', username)
    localStorage.setItem('chatAccessToken', accessToken)
    
    setScreen('rooms')
  }

  const handleRoomSelect = (roomId: string, roomName: string) => {
    setCurrentRoom({ id: roomId, name: roomName })
    setScreen('game')
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setScreen('rooms')
  }

  const handleLogout = () => {
    setUsername('')
    setUserId('')
    setAccessToken('')
    setCurrentRoom(null)
    
    // Clear localStorage
    localStorage.removeItem('chatUserId')
    localStorage.removeItem('chatUsername')
    localStorage.removeItem('chatAccessToken')
    
    setScreen('auth')
  }

  return (
    <>
      {screen === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} />}
      
      {screen === 'rooms' && (
        <RoomSelection
          username={username}
          userId={userId}
          onSelectRoom={handleRoomSelect}
          onLogout={handleLogout}
        />
      )}
      
      {screen === 'game' && currentRoom && (
        <SyntaxBreachGame
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          username={username}
          userId={userId}
          onLeave={handleLeaveRoom}
        />
      )}
    </>
  )
}
