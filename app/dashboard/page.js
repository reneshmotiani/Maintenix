'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import MachineCard from '@/components/dashboard/MachineCard'
import StatsBar from '@/components/dashboard/StatsBar'
import AlertFeed from '@/components/dashboard/AlertFeed'
import QuickActions from '@/components/dashboard/QuickActions'
import AddMachineDialog from '@/components/dashboard/AddMachineDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user } = useAuth()
  const [machines, setMachines] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [mRes, aRes] = await Promise.all([
        fetch('/api/machines'),
        fetch('/api/alerts?acknowledged=false&limit=50'),
      ])
      const [mData, aData] = await Promise.all([mRes.json(), aRes.json()])
      if (mData.machines) setMachines(mData.machines)
      if (aData.alerts) setAlerts(aData.alerts)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(true), 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const canAddMachine = hasPermission(user?.role, 'machines:create')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Machine Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time health monitoring · auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canAddMachine && <AddMachineDialog onSuccess={() => fetchAll(true)} />}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsBar machines={machines} alerts={alerts} />
      )}

      {/* Machine grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          Machines
          {!loading && (
            <span className="text-[11px] text-muted-foreground font-normal">
              ({machines.length} registered)
            </span>
          )}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/50 rounded-xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'oklch(0.65 0.22 264 / 0.1)' }}>
              <Cpu className="w-7 h-7" style={{ color: 'oklch(0.65 0.22 264)' }} />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No machines yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {canAddMachine
                ? 'Add your first machine to start monitoring its health and performance.'
                : 'Ask an administrator to add machines to the system.'}
            </p>
            {canAddMachine && <AddMachineDialog onSuccess={() => fetchAll(true)} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {machines.map(machine => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom row — Alerts + Quick Actions */}
      {!loading && machines.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertFeed alerts={alerts} onAcknowledge={() => fetchAll(true)} />
          <QuickActions machines={machines} />
        </div>
      )}
    </div>
  )
}
