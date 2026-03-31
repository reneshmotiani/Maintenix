'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'

const MACHINE_TYPES = [
  'CNC Machine', 'Conveyor Belt', 'Compressor', 'Hydraulic Press',
  'Industrial Robot', 'Pump', 'Generator', 'Motor', 'HVAC Unit',
  'Boiler', 'Turbine', 'Lathe', 'Milling Machine', 'Welding Robot', 'Other'
]

export default function AddMachineDialog({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: '',
    location: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    installed_at: '',
    notes: '',
  })

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.type || !form.location) {
      toast.error('Name, type, and location are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add machine')
      toast.success(`Machine "${data.machine.name}" added successfully!`)
      setOpen(false)
      setForm({ name: '', type: '', location: '', model: '', manufacturer: '', serial_number: '', installed_at: '', notes: '' })
      onSuccess?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id="add-machine-btn"
          className="gap-2 font-semibold"
          style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}
        >
          <Plus className="w-4 h-4" />
          Add Machine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass-card border-border/60">
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
          <DialogDescription>Register a machine to start monitoring its health.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Machine Name *</Label>
              <Input id="name" name="name" placeholder="e.g. CNC-01" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="">Select type…</option>
                {MACHINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" name="location" placeholder="e.g. Hall A, Floor 2" value={form.location} onChange={handleChange} required />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" name="manufacturer" placeholder="e.g. Fanuc" value={form.manufacturer} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="e.g. CNC-6000X" value={form.model} onChange={handleChange} />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input id="serial_number" name="serial_number" placeholder="Optional" value={form.serial_number} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="installed_at">Installation Date</Label>
              <Input id="installed_at" name="installed_at" type="date" value={form.installed_at} onChange={handleChange} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Any additional notes…"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold"
              style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding…</> : 'Add Machine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
