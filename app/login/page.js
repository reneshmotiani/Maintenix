'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Loader2, Cpu, Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function LoginInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.full_name}!`)
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.65 0.22 264), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.70 0.22 32), transparent)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}>
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">MachineAnalysis</h1>
            <p className="text-xs text-muted-foreground">AI Predictive Maintenance</p>
          </div>
        </div>

        <Card className="glass-card border-border/50 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: 'oklch(0.65 0.22 264)' }} />
              Sign In
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Access your machine monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@machineanalysis.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border/60 focus:border-primary transition-colors"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-secondary/50 border-border/60 focus:border-primary transition-colors pr-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold h-11 mt-2"
                style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.55 0.24 290))' }}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded-lg border border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium text-foreground/70">Default admin:</span>{' '}
                admin@machineanalysis.com / Admin@123
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Machine Analysis Platform · Industrial AI
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginInner />
    </Suspense>
  )
}
