'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Bell, CheckCheck, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const SEVERITY_CONFIG = {
  low: { color: 'oklch(0.72 0.19 162)', bg: 'oklch(0.72 0.19 162 / 0.1)', label: 'Low' },
  medium: { color: 'oklch(0.78 0.18 84)', bg: 'oklch(0.78 0.18 84 / 0.1)', label: 'Medium' },
  high: { color: 'oklch(0.70 0.22 32)', bg: 'oklch(0.70 0.22 32 / 0.12)', label: 'High' },
  critical: { color: 'oklch(0.60 0.22 27)', bg: 'oklch(0.60 0.22 27 / 0.12)', label: 'Critical' },
}

export default function AlertFeed({ alerts = [], onAcknowledge }) {
  const [acknowledging, setAcknowledging] = useState(null)

  const unacked = alerts.filter(a => !a.acknowledged).slice(0, 8)

  async function handleAck(alertId) {
    setAcknowledging(alertId)
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Alert acknowledged')
      onAcknowledge?.()
    } catch {
      toast.error('Failed to acknowledge alert')
    } finally {
      setAcknowledging(null)
    }
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          Live Alerts
          {unacked.length > 0 && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">{unacked.length}</Badge>
          )}
        </CardTitle>
        <Link href="/dashboard/alerts">
          <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground">
            View all <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {unacked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCheck className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-foreground">All clear!</p>
            <p className="text-[11px] text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          unacked.map(alert => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2.5 rounded-lg border transition-colors"
                style={{ background: cfg.bg, borderColor: `${cfg.color}30` }}
              >
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: cfg.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground leading-tight">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground truncate">
                      {alert.machines?.name || 'Unknown machine'}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0"
                  onClick={() => handleAck(alert.id)}
                  disabled={acknowledging === alert.id}
                  title="Acknowledge"
                >
                  {acknowledging === alert.id
                    ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <CheckCheck className="w-3.5 h-3.5" style={{ color: cfg.color }} />}
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
