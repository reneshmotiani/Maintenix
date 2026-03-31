'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission, getRoleLabel, getRoleBadgeColor } from '@/lib/rbac'
import { toast } from 'sonner'
import { Users, Plus, Loader2, UserCheck, UserX, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'operator' })

  const isAdmin = hasPermission(user?.role, 'users:read')

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleAddUser(e) {
    e.preventDefault()
    if (!form.email || !form.password || !form.full_name) {
      toast.error('All fields are required')
      return
    }
    setAddLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`User ${data.user.full_name} created!`)
      setAddOpen(false)
      setForm({ email: '', password: '', full_name: '', role: 'operator' })
      fetchUsers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-2">Settings are only available to administrators.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* User Management */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            User Management
            <Badge variant="secondary" className="text-[10px]">{users.length} users</Badge>
          </CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 text-xs"
                style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
                <Plus className="w-3.5 h-3.5" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/60">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="u-name">Full Name</Label>
                  <Input id="u-name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-email">Email</Label>
                  <Input id="u-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-password">Password</Label>
                  <Input id="u-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-role">Role</Label>
                  <select id="u-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="operator">Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={addLoading}
                    style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                      {u.id === user?.id && <span className="text-[9px] text-muted-foreground">(you)</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize', getRoleBadgeColor(u.role))}>
                      {getRoleLabel(u.role)}
                    </span>
                    {u.is_active
                      ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      : <UserX className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ['Version', '1.0.0-beta'],
            ['AI Provider', 'Google Gemini'],
            ['Database', 'Supabase PostgreSQL'],
            ['Auth', 'Custom sessions (pgcrypto)'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground">{k}</span>
              <span className="text-foreground font-medium">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
