// Status helpers for machines
export const STATUS_CONFIG = {
  online: {
    label: 'Online',
    color: 'oklch(0.72 0.19 162)',
    bg: 'oklch(0.72 0.19 162 / 0.15)',
    border: 'oklch(0.72 0.19 162 / 0.30)',
    pulse: 'pulse-online',
    dot: 'bg-emerald-400',
  },
  warning: {
    label: 'Warning',
    color: 'oklch(0.78 0.18 84)',
    bg: 'oklch(0.78 0.18 84 / 0.12)',
    border: 'oklch(0.78 0.18 84 / 0.30)',
    pulse: 'pulse-warning',
    dot: 'bg-yellow-400',
  },
  critical: {
    label: 'Critical',
    color: 'oklch(0.70 0.22 32)',
    bg: 'oklch(0.70 0.22 32 / 0.12)',
    border: 'oklch(0.70 0.22 32 / 0.30)',
    pulse: 'pulse-critical',
    dot: 'bg-orange-400',
  },
  offline: {
    label: 'Offline',
    color: 'oklch(0.50 0.008 264)',
    bg: 'oklch(0.22 0.008 264)',
    border: 'oklch(0.30 0.008 264)',
    pulse: '',
    dot: 'bg-zinc-500',
  },
}

export const RISK_CONFIG = {
  low: {
    label: 'Low Risk',
    color: 'oklch(0.72 0.19 162)',
    barClass: 'risk-bar-low',
    range: [0, 30],
  },
  medium: {
    label: 'Medium Risk',
    color: 'oklch(0.78 0.18 84)',
    barClass: 'risk-bar-medium',
    range: [31, 60],
  },
  high: {
    label: 'High Risk',
    color: 'oklch(0.70 0.22 32)',
    barClass: 'risk-bar-high',
    range: [61, 80],
  },
  critical: {
    label: 'Critical Risk',
    color: 'oklch(0.60 0.22 27)',
    barClass: 'risk-bar-critical',
    range: [81, 100],
  },
}

export function getRiskLevel(score) {
  if (score <= 30) return 'low'
  if (score <= 60) return 'medium'
  if (score <= 80) return 'high'
  return 'critical'
}

export function formatSensorValue(value, unit, decimals = 1) {
  if (value == null) return '—'
  return `${Number(value).toFixed(decimals)}${unit}`
}
