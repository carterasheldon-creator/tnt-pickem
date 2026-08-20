import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET() {
  const results: any = {}

  // Test 1: Supabase connection
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, is_admin')
      .eq('username', 'admin')
      .single()
    results.supabase = error ? `ERROR: ${error.message}` : `OK - found user: ${data?.username}`
  } catch (e: any) {
    results.supabase = `EXCEPTION: ${e.message}`
  }

  // Test 2: bcrypt
  try {
    const hash = await bcrypt.hash('test', 10)
    const valid = await bcrypt.compare('test', hash)
    results.bcrypt = valid ? 'OK' : 'FAILED'
  } catch (e: any) {
    results.bcrypt = `EXCEPTION: ${e.message}`
  }

  // Test 3: password check against real hash
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('username', 'admin')
      .single()
    if (user) {
      const valid = await bcrypt.compare('BFGpickem2025!', user.password_hash)
      results.passwordCheck = valid ? 'OK - password matches' : 'FAILED - password does not match'
    } else {
      results.passwordCheck = 'No user found'
    }
  } catch (e: any) {
    results.passwordCheck = `EXCEPTION: ${e.message}`
  }

  // Test 4: env vars present
  results.envVars = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nextauthSecret: !!process.env.NEXTAUTH_SECRET,
  }

  return NextResponse.json(results)
}
