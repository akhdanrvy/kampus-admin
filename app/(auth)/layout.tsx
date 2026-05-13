'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] text-[#0f172a]">
        {children}
      </main>
    </div>
  )
}
