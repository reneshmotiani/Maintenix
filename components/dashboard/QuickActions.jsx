'use client'
import { Wrench, Zap, AlertOctagon, TrendingDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function generateQuickFixes(machines) {
  const fixes = []

  machines.forEach(machine => {
    const r = machine.latest_reading
    const ai = machine.ai_analysis
    if (!r) return

    if (r.temperature > 85) {
      fixes.push({
        id: `temp-${machine.id}`,
        machine: machine.name,
        machineId: machine.id,
        icon: Zap,
        severity: r.temperature > 95 ? 'critical' : 'high',
        label: `Temperature ${r.temperature.toFixed(0)}°C`,
        action: r.temperature > 95
          ? 'Shut down for cooling — risk of seizure'
          : 'Reduce load by 15% and check coolant flow',
      })
    }
    if (r.vibration > 8) {
      fixes.push({
        id: `vib-${machine.id}`,
        machine: machine.name,
        machineId: machine.id,
        icon: AlertOctagon,
        severity: r.vibration > 12 ? 'critical' : 'high',
        label: `Vibration ${r.vibration.toFixed(1)} mm/s`,
        action: 'Inspect bearings — abnormal vibration pattern detected',
      })
    }
    if (ai?.risk_score > 70) {
      fixes.push({
        id: `risk-${machine.id}`,
        machine: machine.name,
        machineId: machine.id,
        icon: TrendingDown,
        severity: ai.risk_score > 85 ? 'critical' : 'medium',
        label: `Risk ${ai.risk_score.toFixed(0)}%`,
        action: 'Schedule preventive maintenance in next shift',
      })
    }
  })

  // Sort by severity
  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  return fixes.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 6)
}

const SEVERITY_STYLES = {
  critical: { color: 'oklch(0.60 0.22 27)', bg: 'oklch(0.60 0.22 27 / 0.1)', border: 'oklch(0.60 0.22 27 / 0.25)' },
  high: { color: 'oklch(0.70 0.22 32)', bg: 'oklch(0.70 0.22 32 / 0.1)', border: 'oklch(0.70 0.22 32 / 0.25)' },
  medium: { color: 'oklch(0.78 0.18 84)', bg: 'oklch(0.78 0.18 84 / 0.1)', border: 'oklch(0.78 0.18 84 / 0.25)' },
  low: { color: 'oklch(0.72 0.19 162)', bg: 'oklch(0.72 0.19 162 / 0.1)', border: 'oklch(0.72 0.19 162 / 0.25)' },
}

export default function QuickActions({ machines = [] }) {
  const fixes = generateQuickFixes(machines)

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Quick Actions
          {fixes.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'oklch(0.70 0.22 32 / 0.15)', color: 'oklch(0.70 0.22 32)' }}>
              {fixes.length} suggested
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {fixes.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'oklch(0.72 0.19 162 / 0.15)' }}>
              <Wrench className="w-5 h-5" style={{ color: 'oklch(0.72 0.19 162)' }} />
            </div>
            <p className="text-sm font-medium text-foreground">No immediate actions needed</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">All machines operating normally</p>
          </div>
        ) : (
          fixes.map(fix => {
            const style = SEVERITY_STYLES[fix.severity]
            const Icon = fix.icon
            return (
              <div
                key={fix.id}
                className="flex items-start gap-3 p-2.5 rounded-lg border"
                style={{ background: style.bg, borderColor: style.border }}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${style.color}20` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold" style={{ color: style.color }}>
                      {fix.machine}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{fix.label}</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-snug">{fix.action}</p>
                </div>
                <Link href={`/dashboard/machines/${fix.machineId}`}>
                  <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </Link>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
