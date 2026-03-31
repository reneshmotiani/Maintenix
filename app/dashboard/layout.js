'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  const fetchAlertCount = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?acknowledged=false&limit=100')
      if (res.ok) {
        const data = await res.json()
        setAlertCount(data.alerts?.length || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (user) {
      fetchAlertCount()
      const interval = setInterval(fetchAlertCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user, fetchAlertCount])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar alertCount={alertCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header alertCount={alertCount} onRefresh={fetchAlertCount} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
