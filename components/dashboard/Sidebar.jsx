'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import {
  LayoutDashboard, Cpu, Bell, Wrench, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
  { href: '/dashboard/machines', label: 'Machines', icon: Cpu, permission: 'machines:read' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell, permission: 'alerts:read' },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench, permission: 'maintenance:read' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, permission: 'users:read' },
]

function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar({ alertCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const visibleNav = NAV_ITEMS.filter(item =>
    !item.permission || hasPermission(user?.role, item.permission)
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-border/50', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-foreground leading-none">MachineAI</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Predictive Maintenance</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleNav.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group sidebar-link',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.href === '/dashboard/alerts' && alertCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px] h-4 px-1.5">{alertCount}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* User */}
      <div className={cn('p-3', collapsed && 'flex justify-center')}>
        {!collapsed ? (
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
                {getInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.full_name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={logout}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={logout} className="w-8 h-8" title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-secondary border border-border items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        style={{ background: 'var(--sidebar)' }}
        className={cn(
          'hidden lg:flex flex-col relative border-r border-border/50 transition-all duration-300 shrink-0',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        style={{ background: 'var(--sidebar)' }}
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 z-40 border-r border-border/50 transition-transform duration-300 w-56',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
