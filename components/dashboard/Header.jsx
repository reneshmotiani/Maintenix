'use client'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { Bell, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/machines': 'Machines',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/maintenance': 'Maintenance',
  '/dashboard/settings': 'Settings',
}

export default function Header({ alertCount = 0, onRefresh }) {
  const { user } = useAuth()
  const pathname = usePathname()

  const title = Object.entries(PAGE_TITLES)
    .reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] || 'Dashboard'

  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{ background: 'oklch(0.13 0.01 264 / 0.9)', backdropFilter: 'blur(8px)' }}>
      {/* Title - with left padding on mobile for hamburger */}
      <div className="pl-10 lg:pl-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-[10px] text-muted-foreground hidden sm:block">{now}</p>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} className="w-8 h-8" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="w-8 h-8 relative">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] font-bold"
            >
              {alertCount > 9 ? '9+' : alertCount}
            </Badge>
          )}
        </Button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/50">
          <div className="text-right">
            <p className="text-xs font-medium text-foreground">{user?.full_name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
