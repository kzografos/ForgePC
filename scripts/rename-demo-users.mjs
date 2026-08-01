/**
 * ForgePC rebrand - move demo accounts off the old @kzproducts.dev domain.
 *
 * The Supabase SQL Editor cannot do this: auth.users is owned by
 * supabase_auth_admin and the editor session runs as `authenticated`, so a
 * direct UPDATE fails with 42501. The Admin API is the supported route, and it
 * keeps auth.identities in sync for us.
 *
 *   node scripts/rename-demo-users.mjs            # dry run, prints the plan
 *   node scripts/rename-demo-users.mjs --apply    # writes
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const OLD_DOMAIN = '@kzproducts.dev'
const NEW_DOMAIN = '@forgepc.dev'
const apply = process.argv.includes('--apply')

// Minimal .env reader - the file starts with a BOM, which trips naive parsers.
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trimStart().startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    }),
)

const url = env.SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
if (error) {
  console.error('listUsers failed:', error.message)
  process.exit(1)
}

const targets = data.users.filter((u) => u.email?.endsWith(OLD_DOMAIN))
if (targets.length === 0) {
  console.log(`No users on ${OLD_DOMAIN}. Nothing to do.`)
  process.exit(0)
}

console.log(`${apply ? 'Renaming' : '[dry run] Would rename'} ${targets.length} user(s):`)
for (const u of targets) {
  console.log(`  ${u.email} -> ${u.email.replace(OLD_DOMAIN, NEW_DOMAIN)}`)
}

if (!apply) {
  console.log('\nRe-run with --apply to write.')
  process.exit(0)
}

let failed = 0
for (const u of targets) {
  const newEmail = u.email.replace(OLD_DOMAIN, NEW_DOMAIN)

  // email_confirm keeps the account confirmed - without it Supabase parks the
  // change in email_change and waits for a confirmation click.
  const { error: authErr } = await admin.auth.admin.updateUserById(u.id, {
    email: newEmail,
    email_confirm: true,
  })
  if (authErr) {
    console.error(`  FAIL auth  ${u.email}: ${authErr.message}`)
    failed++
    continue
  }

  // profiles.email is a denormalised mirror maintained by handle_new_user();
  // it is not updated by the Admin API.
  const { error: profileErr } = await admin
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', u.id)
  if (profileErr) {
    console.error(`  FAIL profile ${u.email}: ${profileErr.message}`)
    failed++
    continue
  }

  console.log(`  ok ${u.email} -> ${newEmail}`)
}

// Read back so the output reflects the database, not our intentions.
const { data: after } = await admin.auth.admin.listUsers({ perPage: 1000 })
const { data: profiles } = await admin.from('profiles').select('id, email')
const profileById = new Map((profiles ?? []).map((p) => [p.id, p.email]))

console.log('\nVerification (auth email / profile email):')
for (const u of after.users) {
  const match = u.email === profileById.get(u.id) ? '' : '  <-- MISMATCH'
  console.log(`  ${u.email}  /  ${profileById.get(u.id) ?? '(no profile)'}${match}`)
}

process.exit(failed > 0 ? 1 : 0)
