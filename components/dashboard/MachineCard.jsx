'use client'
import Link from 'next/link'
import { Thermometer, Activity, Gauge, Zap, AlertTriangle, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, RISK_CONFIG, getRiskLevel, formatSensorValue } from '@/lib/statusConfig'

export default function MachineCard({ machine }) {
  const { latest_reading: reading, ai_analysis: ai } = machine
  const statusCfg = STATUS_CONFIG[machine.status] || STATUS_CONFIG.offline
  const riskScore = ai?.risk_score ?? null
  const riskLevel = ai?.risk_level || (riskScore != null ? getRiskLevel(riskScore) : 'low')
  const riskCfg = RISK_CONFIG[riskLevel] || RISK_CONFIG.low

  return (
    <Link href={`/dashboard/machines/${machine.id}`}>
      <Card
        className={cn(
          'glass-card border transition-all duration-200 hover:scale-[1.01] hover:shadow-xl cursor-pointer group',
          machine.status === 'critical' && 'pulse-critical',
          machine.status === 'warning' && 'pulse-warning',
        )}
        style={{ borderColor: statusCfg.border }}
      >
        {/* Status bar top */}
        <div className="h-1 rounded-t-xl" style={{ background: statusCfg.color }} />

        <CardHeader className="pb-2 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {machine.name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">{machine.type}</p>
            </div>
            <div
              className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
            >
              <span
                className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot,
                  machine.status !== 'offline' ? 'animate-pulse' : '')}
              />
              {statusCfg.label}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <MapPin className="w-2.5 h-2.5" />
            <span className="truncate">{machine.location}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {/* Sensor readings */}
          <div className="grid grid-cols-2 gap-2">
            <SensorItem
              icon={<Thermometer className="w-3 h-3" />}
              label="Temp"
              value={formatSensorValue(reading?.temperature, '°C')}
              alert={reading?.temperature > 85}
            />
            <SensorItem
              icon={<Activity className="w-3 h-3" />}
              label="Vibration"
              value={formatSensorValue(reading?.vibration, ' mm/s')}
              alert={reading?.vibration > 8}
            />
            <SensorItem
              icon={<Gauge className="w-3 h-3" />}
              label="RPM"
              value={formatSensorValue(reading?.rpm, '', 0)}
              alert={false}
            />
            <SensorItem
              icon={<Zap className="w-3 h-3" />}
              label="Power"
              value={formatSensorValue(reading?.power_consumption, ' kW')}
              alert={false}
            />
          </div>

          {/* Risk score */}
          {riskScore != null && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground font-medium">Risk Score</span>
                <span className="text-[10px] font-bold" style={{ color: riskCfg.color }}>
                  {riskScore.toFixed(0)}% · {riskCfg.label}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', riskCfg.barClass)}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Predicted failure */}
          {ai?.predicted_failure_at && (
            <div className="flex items-center gap-1.5 text-[10px] rounded-lg px-2 py-1.5"
              style={{ background: 'oklch(0.70 0.22 32 / 0.1)', border: '1px solid oklch(0.70 0.22 32 / 0.20)' }}>
              <Clock className="w-3 h-3 shrink-0" style={{ color: 'oklch(0.70 0.22 32)' }} />
              <span style={{ color: 'oklch(0.70 0.22 32)' }}>
                Predicted failure: {new Date(ai.predicted_failure_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function SensorItem({ icon, label, value, alert }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 p-1.5 rounded-md',
      alert ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-muted/40'
    )}>
      <span className={alert ? 'text-orange-400' : 'text-muted-foreground'}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground leading-none">{label}</p>
        <p className={cn('text-[11px] font-semibold leading-tight', alert ? 'text-orange-300' : 'text-foreground')}>
          {value}
        </p>
      </div>
      {alert && <AlertTriangle className="w-2.5 h-2.5 text-orange-400 ml-auto shrink-0" />}
    </div>
  )
}
