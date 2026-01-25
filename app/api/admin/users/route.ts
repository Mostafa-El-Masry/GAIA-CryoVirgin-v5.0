import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/supabaseServer'

export async function GET() {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}