import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      full_name,
      nim,
      phone,
      faculty,
      major,
      year_entry,
      student_status = 'active',
      role = 'student',
    } = body

    if (!email || !password || !full_name || !nim || !major || !year_entry) {
      return NextResponse.json(
        { error: 'Field wajib tidak lengkap' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, nim },
      })

    if (authError) {
      console.error('Auth create error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileData, error: profileError } = await (supabaseAdmin.from('profiles') as any)
      .upsert({
        id: userId,
        full_name,
        nim,
        email,
        phone: phone ?? null,
        faculty: faculty ?? null,
        major,
        year_entry: parseInt(year_entry),
        student_status,
        role,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Gagal membuat profil mahasiswa: ' + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, user: profileData })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    console.error('API error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, student_status } = await request.json()
    if (!id || !student_status) {
      return NextResponse.json({ error: 'id dan student_status wajib diisi' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from('profiles') as any)
      .update({ student_status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Update status error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    console.error('API error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
