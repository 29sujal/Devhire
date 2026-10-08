'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

let socket = null

export default function NotificationBell() {
  const { user } = useSelector((state) => state.auth)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user?._id) return

    // Connect to socket server
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('join', user._id)
    })

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 20))
      setUnread(prev => prev + 1)

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('DevHire', {
          body: notification.message,
          icon: '/favicon.ico',
        })
      }
    })

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      if (socket) socket.disconnect()
    }
  }, [user?._id])

  const statusColors = {
    shortlisted: '#22c55e',
    hired: '#a855f7',
    rejected: '#ef4444',
    viewed: '#eab308',
    applied: '#3b82f6',
  }

  const statusIcons = {
    shortlisted: '⭐',
    hired: '🎊',
    rejected: '📋',
    viewed: '👀',
    applied: '✅',
  }

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  if (!user || user.role !== 'seeker') return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => { setShowDropdown(!showDropdown); setUnread(0) }}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px' }}
      >
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{ position: 'absolute', top: '36px', right: 0, width: '340px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '14px' }}>Notifications</p>
            {notifications.length > 0 && (
              <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Clear all
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>No notifications yet</p>
                <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>You'll be notified when companies update your application</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: i < notifications.length - 1 ? '1px solid #1e293b' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${statusColors[n.status]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {statusIcons[n.status] || '📬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f1f5f9', fontSize: '13px', lineHeight: '1.5', marginBottom: '4px' }}>{n.message}</p>
                    <p style={{ color: '#475569', fontSize: '11px' }}>{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowDropdown(false)} />
      )}
    </div>
  )
}