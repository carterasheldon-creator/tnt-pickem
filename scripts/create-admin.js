// Run this once to create your admin account:
// node scripts/create-admin.js
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const { data, error } = await supabase
    .from('users')
    .insert({
      username: ADMIN_USERNAME,
      password_hash: hash,
      is_admin: true,
      initial_picks: 0,
      remaining_picks: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Admin account created: username="${ADMIN_USERNAME}" password="${ADMIN_PASSWORD}"`)
    console.log('Change this password after first login!')
  }
}

main()
