'use client'
import { Cpu, AlertTriangle, TrendingUp, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function StatsBar({ machines = [], alerts = [] }) {
  const total = machines.length
  const online = machines.filter(m => m.status === 'online').length
  const warning = machines.filter(m => m.status === 'warning').length
  const critical = machines.filter(m => m.status === 'critical').length
  const offline = machines.filter(m => m.status === 'offline').length
  const unackAlerts = alerts.filter(a => !a.acknowledged).length

  const avgRisk = machines.length
    ? machines.reduce((sum, m) => sum + (m.ai_analysis?.risk_score || 0), 0) / machines.length
    : 0

  const stats = [
    {
      label: 'Total Machines',
      value: total,
      icon: Cpu,
      color: 'oklch(0.65 0.22 264)',
      sub: `${online} online`,
    },
    {
      label: 'Active Alerts',
      value: unackAlerts,
      icon: AlertTriangle,
      color: 'oklch(0.70 0.22 32)',
      sub: `${alerts.length} total`,
      urgent: unackAlerts > 0,
    },
    {
      label: 'Avg Risk Score',
      value: `${avgRisk.toFixed(0)}%`,
      icon: TrendingUp,
      color: avgRisk > 60 ? 'oklch(0.70 0.22 32)' : avgRisk > 30 ? 'oklch(0.78 0.18 84)' : 'oklch(0.72 0.19 162)',
      sub: 'Across all machines',
    },
    {
      label: 'Critical Risk',
      value: critical + warning,
      icon: ShieldAlert,
      color: 'oklch(0.60 0.22 27)',
      sub: `${critical} critical · ${warning} warning`,
      urgent: critical > 0,
    },
    {
      label: 'Healthy',
      value: online,
      icon: CheckCircle2,
      color: 'oklch(0.72 0.19 162)',
      sub: `${offline} offline`,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className={cn(
              'glass-card border-border/50 transition-all hover:border-border',
              stat.urgent && 'border-orange-500/30'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.urgent ? stat.color : 'var(--foreground)' }}>
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
