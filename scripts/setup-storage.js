require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  console.log('\n📦 Setting up storage bucket...\n')

  // Create bucket
  const { data: bucket, error: createError } = await supabase.storage.createBucket('subuh-photos', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  })

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('✅ Bucket "subuh-photos" sudah ada')
    } else {
      console.log('❌ Error creating bucket:', createError.message)
      return
    }
  } else {
    console.log('✅ Bucket "subuh-photos" berhasil dibuat!')
  }

  // Set public access policy
  const { error: policyError } = await supabase.storage.from('subuh-photos').createSignedUrl('test.txt', 60)
  
  console.log('\n📋 Storage Policies:')
  console.log('✅ Bucket public: true (bisa akses foto langsung)')
  console.log('✅ File size limit: 5MB')
  
  console.log('\n🎉 Setup selesai!')
  console.log('\nSekarang bisa jalankan: npm run dev')
}

setupStorage()
