#!/usr/bin/env node
// Loads the compiled 980-sticker catalog into Supabase.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import:catalog
//   (or: node supabase/import-catalog.mjs path/to/catalog.json)
//
// The service_role key bypasses RLS and must NEVER be exposed in the browser.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    'Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).',
  )
  process.exit(1)
}

const seedArg = process.argv[2]
const seedPath = seedArg
  ? seedArg
  : fileURLToPath(new URL('./seed/catalog.json', import.meta.url))

let rows
try {
  rows = JSON.parse(readFileSync(seedPath, 'utf8'))
} catch (err) {
  console.error(`Could not read seed file at ${seedPath}:`, err.message)
  process.exit(1)
}

if (!Array.isArray(rows) || rows.length === 0) {
  console.error('Seed file is empty or not an array.')
  process.exit(1)
}

const payload = rows.map((r, i) => ({
  sticker_code: r.sticker_code,
  country: r.country ?? null,
  country_code: r.country_code,
  slot_no: r.slot_no ?? 0,
  type: r.type ?? 'regular',
  section: r.section ?? (r.country_code === 'FWC' ? 'special' : 'team'),
  label: r.label ?? null,
  page_no: r.page_no ?? null,
  sort_order: r.sort_order ?? i,
}))

const supabase = createClient(url, key, { auth: { persistSession: false } })

const CHUNK = 500
for (let i = 0; i < payload.length; i += CHUNK) {
  const slice = payload.slice(i, i + CHUNK)
  const { error } = await supabase
    .from('catalog')
    .upsert(slice, { onConflict: 'sticker_code' })
  if (error) {
    console.error('Upsert failed:', error.message)
    process.exit(1)
  }
  console.log(`Upserted ${Math.min(i + CHUNK, payload.length)}/${payload.length}`)
}

console.log(`Done. ${payload.length} stickers loaded into catalog.`)
