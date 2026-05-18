'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setFullName(profile.full_name)
      }
    }

    fetchUserAndProfile()
  }, [])

  if (!user) return null

  const displayName = fullName ?? user.email ?? 'Admin'

  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? 'A'

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {initials}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-[#64748b]">Halo,</span>
        <span className="text-sm font-medium text-[#0f172a] max-w-[180px] truncate">
          {displayName}
        </span>
      </div>
    </div>
  )
}
