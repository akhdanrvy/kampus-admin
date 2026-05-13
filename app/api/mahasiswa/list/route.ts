import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from('profiles') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch mahasiswa error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
