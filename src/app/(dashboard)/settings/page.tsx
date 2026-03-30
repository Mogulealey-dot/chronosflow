'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { LogOut, User, Bell, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email ?? '')
        setName(user.user_metadata?.full_name ?? '')
      }
    }
    load()
  }, []) // eslint-disable-line

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    })
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Profile</h2>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:border-indigo-500/60 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</Label>
            <Input
              value={email}
              disabled
              className="bg-zinc-800/50 border-zinc-700 text-zinc-400 h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Preferences</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Idle detection', desc: 'Detect when you stop working and prompt to discard or keep idle time', key: 'idle' },
            { label: 'Browser notifications', desc: 'Get notified when Pomodoro sessions end', key: 'notif' },
            { label: 'Auto-start break', desc: 'Automatically start break timer after focus session', key: 'auto_break' },
          ].map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-zinc-200">{pref.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{pref.desc}</p>
              </div>
              <input type="checkbox" className="accent-indigo-500 w-4 h-4 mt-0.5 cursor-pointer" />
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-300">Account</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Sign out from all devices and end your current session.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </section>
    </div>
  )
}
