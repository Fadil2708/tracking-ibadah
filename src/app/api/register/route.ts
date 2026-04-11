import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't prerender during build
export const dynamic = 'force-dynamic'

// Use service_role key to bypass email confirmation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { username, password, fullName, communityCode } = await request.json()

    if (!username || !password || !fullName || !communityCode) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    // Create user with Supabase Auth using service_role (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@ibadah.app`,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        username,
        full_name: fullName,
        community_code: communityCode,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      userId: authData.user?.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
