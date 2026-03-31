'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'
import MachineCard from '@/components/dashboard/MachineCard'
import AddMachineDialog from '@/components/dashboard/AddMachineDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'online', 'warning', 'critical', 'offline']

export default function MachinesPage() {
  const { user } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await window.fetch('/api/machines')
      const data = await res.json()
      if (data.machines) setMachines(data.machines)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = machines.filter(m => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'all' ? machines.length : machines.filter(m => m.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">All Machines</h1>
          <p className="text-xs text-muted-foreground">{machines.length} machines registered</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetch(true)} disabled={refreshing} className="gap-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission(user?.role, 'machines:create') && (
            <AddMachineDialog onSuccess={() => fetch(true)} />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, type, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {s} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center border border-dashed border-border/50 rounded-xl">
          <Cpu className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">
            {machines.length === 0 ? 'No machines registered yet' : 'No machines match your filters'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {machines.length === 0 ? 'Add a machine to start monitoring.' : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(m => <MachineCard key={m.id} machine={m} />)}
        </div>
      )}
    </div>
  )
}
