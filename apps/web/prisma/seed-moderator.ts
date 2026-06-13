/**
 * seed-moderator.ts
 * 
 * Creates the initial moderator account in PostgreSQL.
 * Moderator accounts are NEVER created via public signup.
 * 
 * Usage:
 *   npx ts-node --project tsconfig.server.json prisma/seed-moderator.ts
 * 
 * Required env vars (in .env.local):
 *   MODERATOR_EMAIL       — e.g. mod@shield.local
 *   MODERATOR_PASSWORD    — strong password (min 12 chars recommended)
 *   DATABASE_URL          — PostgreSQL connection string
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Load .env.local for local development
const path = require('path')
const fs = require('fs')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.substring(0, eqIndex).trim()
    const value = trimmed.substring(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://shield:shieldpass@localhost:5432/shield_marketplace'
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const email = process.env.MODERATOR_EMAIL
    const password = process.env.MODERATOR_PASSWORD

    if (!email || !password) {
      console.error('❌ Missing MODERATOR_EMAIL or MODERATOR_PASSWORD in environment variables.')
      console.error('   Add them to apps/web/.env.local and try again.')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ MODERATOR_PASSWORD must be at least 8 characters.')
      process.exit(1)
    }

    const alias = 'shield-moderator'

    // Check if moderator already exists
    const existing = await prisma.user.findFirst({
      where: { role: 'moderator' }
    })

    if (existing) {
      console.log(`⚠️  Moderator account already exists: ${existing.alias}`)
      console.log('   Skipping seed. Delete the existing moderator first if you need to re-create.')
      return
    }

    // Check if alias is taken
    const aliasExists = await prisma.user.findUnique({
      where: { alias }
    })

    if (aliasExists) {
      console.error(`❌ Alias "${alias}" is already in use by a non-moderator account.`)
      process.exit(1)
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create moderator user
    const moderator = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password_hash,
        alias,
        role: 'moderator',
        email_verified: true,
        onboarding_complete: true,
        trust_score: 100,
      }
    })

    // Create alias directory entry
    await prisma.aliasDirectory.create({
      data: {
        alias,
        role: 'moderator',
        trust_score: 100,
        cert_badges: [],
        skills: ['platform-moderation', 'cert-review'],
        completed_deals: 0,
        response_rate: 100,
      }
    })

    console.log('✅ Moderator account created successfully!')
    console.log(`   Alias:  ${moderator.alias}`)
    console.log(`   Email:  ${moderator.email}`)
    console.log(`   Role:   ${moderator.role}`)
    console.log(`   ID:     ${moderator.id}`)
    console.log('')
    console.log('   Login at: /auth/login with the moderator email & password.')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
