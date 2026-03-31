'use client'
import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'oklch(0.65 0.22 264 / 0.1)' }}>
        <Wrench className="w-8 h-8" style={{ color: 'oklch(0.65 0.22 264)' }} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Maintenance Logs</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Full maintenance scheduling and log tracking coming soon.
        This will be built in the next phase with the AI agent integration.
      </p>
    </div>
  )
}
