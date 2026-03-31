'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Cpu, MapPin, Calendar, Tag, Thermometer, Activity, Gauge, Zap, Droplets, Volume2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, RISK_CONFIG, getRiskLevel, formatSensorValue } from '@/lib/statusConfig'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

const SENSOR_FIELDS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f97316', icon: Thermometer, threshold: 85 },
  { key: 'vibration', label: 'Vibration', unit: ' mm/s', color: '#8b5cf6', icon: Activity, threshold: 8 },
  { key: 'rpm', label: 'RPM', unit: '', color: '#3b82f6', icon: Gauge, threshold: null },
  { key: 'power_consumption', label: 'Power', unit: ' kW', color: '#10b981', icon: Zap, threshold: null },
  { key: 'oil_level', label: 'Oil Level', unit: '%', color: '#f59e0b', icon: Droplets, threshold: 20 },
  { key: 'noise_level', label: 'Noise', unit: ' dB', color: '#ec4899', icon: Volume2, threshold: 90 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card border border-border/60 p-2.5 rounded-lg text-[11px]">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toFixed?.(2) ?? p.value}
        </p>
      ))}
    </div>
  )
}

export default function MachineDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`/api/machines/${id}`)
      if (!res.ok) { toast.error('Machine not found'); return }
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { machine, readings, alerts, analyses } = data
  const statusCfg = STATUS_CONFIG[machine.status] || STATUS_CONFIG.offline
  const latestReading = readings?.[0]
  const latestAI = analyses?.[0]
  const riskScore = latestAI?.risk_score ?? null
  const riskLevel = latestAI?.risk_level || (riskScore != null ? getRiskLevel(riskScore) : 'low')
  const riskCfg = RISK_CONFIG[riskLevel]

  // Prepare chart data — reverse readings so oldest first
  const chartData = [...(readings || [])].reverse().map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    vibration: r.vibration,
    rpm: r.rpm,
    power_consumption: r.power_consumption,
  }))

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{machine.name}</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot, machine.status !== 'offline' && 'animate-pulse')} />
              {statusCfg.label}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{machine.type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{machine.location}</span>
            {machine.manufacturer && <span>{machine.manufacturer} {machine.model}</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="gap-2 text-xs shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Risk Score Banner */}
      {riskScore != null && (
        <div className="p-4 rounded-xl border"
          style={{ background: `${riskCfg.color}10`, borderColor: `${riskCfg.color}30` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: riskCfg.color }}>
              {riskCfg.label} — {riskScore.toFixed(0)}% probability of failure
            </span>
            {latestAI?.predicted_failure_at && (
              <span className="text-xs text-muted-foreground">
                Predicted: {new Date(latestAI.predicted_failure_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
          </div>
          <Progress value={riskScore} className="h-2"
            style={{ '--progress-color': riskCfg.color }} />
          {latestAI?.explanation && (
            <p className="text-xs text-muted-foreground mt-2 italic">"{latestAI.explanation}"</p>
          )}
        </div>
      )}

      {/* Sensor readings grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Latest Readings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SENSOR_FIELDS.map(field => {
            const value = latestReading?.[field.key]
            const isAlert = field.threshold && value != null &&
              (field.key === 'oil_level' ? value < field.threshold : value > field.threshold)
            const Icon = field.icon
            return (
              <Card key={field.key}
                className={cn('glass-card border-border/50 transition-colors', isAlert && 'border-orange-500/40')}
                style={isAlert ? { background: 'oklch(0.70 0.22 32 / 0.08)' } : {}}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: isAlert ? 'oklch(0.70 0.22 32)' : field.color }} />
                    <span className="text-[10px] text-muted-foreground">{field.label}</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: isAlert ? 'oklch(0.70 0.22 32)' : 'var(--foreground)' }}>
                    {formatSensorValue(value, field.unit, field.key === 'rpm' ? 0 : 1)}
                  </p>
                  {isAlert && <p className="text-[9px] text-orange-400 mt-0.5">⚠ Threshold exceeded</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sensor History (last {readings.length} readings)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.012 264)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 264)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.55 0.01 264)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f97316" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#8b5cf6" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="rpm" name="RPM" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI recommendations */}
      {latestAI?.recommended_actions?.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              🤖 AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestAI.recommended_actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
                <p className="text-sm text-foreground/80">{typeof action === 'string' ? action : action.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent alerts */}
      {alerts?.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Alerts ({alerts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-2 py-1.5 text-xs border-b border-border/30 last:border-0">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', alert.acknowledged ? 'bg-muted-foreground' : 'bg-orange-400')} />
                <span className="flex-1 text-foreground/80">{alert.message}</span>
                <span className="text-muted-foreground shrink-0">
                  {new Date(alert.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
