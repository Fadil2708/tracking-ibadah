require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Connecting to Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('\n🔍 Testing connection...')
  
  const { data, error } = await supabase.from('profiles').select('count').limit(1)
  
  if (error) {
    console.log('⚠️  Connection test result:', error.message)
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('\n📝 Tables belum dibuat. Perlu menjalankan schema SQL.')
      console.log('\n📋 Cara setup database:')
      console.log('1. Buka https://supabase.com/dashboard/project/dcjoshcbdsvexzhohsdq/sql')
      console.log('2. Copy paste isi file supabase/schema.sql')
      console.log('3. Klik Run')
    } else if (error.message.includes('JWT') || error.message.includes('API key') || error.message.includes('Unauthorized')) {
      console.log('\n❌ API key tidak valid. Periksa kembali keys di Settings → API')
    }
  } else {
    console.log('✅ Connection successful!')
  }
}

async function main() {
  try {
    await testConnection()
  } catch (err) {
    console.error('Error:', err.message)
  }
  process.exit(0)
}

main()
