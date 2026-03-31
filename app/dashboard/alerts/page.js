'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, CheckCheck, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SEVERITY_CONFIG = {
  low: { color: 'oklch(0.72 0.19 162)', bg: 'oklch(0.72 0.19 162 / 0.1)', border: 'oklch(0.72 0.19 162 / 0.25)', label: 'Low' },
  medium: { color: 'oklch(0.78 0.18 84)', bg: 'oklch(0.78 0.18 84 / 0.1)', border: 'oklch(0.78 0.18 84 / 0.25)', label: 'Medium' },
  high: { color: 'oklch(0.70 0.22 32)', bg: 'oklch(0.70 0.22 32 / 0.1)', border: 'oklch(0.70 0.22 32 / 0.25)', label: 'High' },
  critical: { color: 'oklch(0.60 0.22 27)', bg: 'oklch(0.60 0.22 27 / 0.12)', border: 'oklch(0.60 0.22 27 / 0.30)', label: 'Critical' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [acknowledging, setAcknowledging] = useState(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts?limit=100')
      const data = await res.json()
      if (data.alerts) setAlerts(data.alerts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  async function handleAck(id) {
    setAcknowledging(id)
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Alert acknowledged')
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
    } catch {
      toast.error('Failed to acknowledge')
    } finally {
      setAcknowledging(null)
    }
  }

  const active = alerts.filter(a => !a.acknowledged)
  const resolved = alerts.filter(a => a.acknowledged)

  function AlertRow({ alert }) {
    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border transition-all"
        style={{ background: cfg.bg, borderColor: cfg.border }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
              style={{ background: `${cfg.color}20`, color: cfg.color }}>
              {cfg.label}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {alert.machines?.name || 'Unknown'}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {new Date(alert.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>
          <p className="text-sm text-foreground/80">{alert.message}</p>
          {alert.machines && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {alert.machines.type} · {alert.machines.location}
            </p>
          )}
        </div>
        {!alert.acknowledged && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs gap-1 h-7"
            onClick={() => handleAck(alert.id)}
            disabled={acknowledging === alert.id}
          >
            {acknowledging === alert.id
              ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <CheckCheck className="w-3.5 h-3.5" />}
            Ack
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">Alerts</h1>
        <p className="text-xs text-muted-foreground">
          {active.length} active · {resolved.length} resolved
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="active" className="gap-2 text-xs">
            Active
            {active.length > 0 && <Badge variant="destructive" className="text-[10px] h-4 px-1">{active.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">
            Resolved ({resolved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            : active.length === 0
            ? <div className="flex flex-col items-center py-12 text-center border border-dashed border-border/50 rounded-xl">
                <CheckCheck className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="font-medium text-foreground">No active alerts</p>
                <p className="text-sm text-muted-foreground mt-1">All machines are operating normally</p>
              </div>
            : active.map(a => <AlertRow key={a.id} alert={a} />)
          }
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            : resolved.length === 0
            ? <div className="py-12 text-center text-muted-foreground text-sm">No resolved alerts yet</div>
            : resolved.map(a => <AlertRow key={a.id} alert={a} />)
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
