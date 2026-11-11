import test from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import {
  initDbSchema,
  seedInitialData,
  getAllDistricts,
  getDistrictById,
  updateDistrictBudget,
  createCitizenSubmission,
  getAllSubmissions,
  getAggregatedAspirations,
  generatePolicyRecommendations,
  verifyAdminCredentials,
  updateAdminPassword,
} from './db.ts'

test('SQLite Database Operations & Business Logic', async (t) => {
  // Use in-memory SQLite database for test isolation
  const db = new Database(':memory:')
  initDbSchema(db)
  seedInitialData(db)

  await t.test('1. should seed 4 pilot districts with correct initial values', () => {
    const districts = getAllDistricts(db)
    assert.strictEqual(districts.length, 4)

    const habinsaran = districts.find((d) => d.id === 'habinsaran')
    assert.ok(habinsaran)
    assert.strictEqual(habinsaran.bps_code, '1212020')
    assert.strictEqual(habinsaran.name, 'Kecamatan Habinsaran')
    assert.strictEqual(habinsaran.gap_status, 'CRITICAL')
  })

  await t.test('2. should get district by id', () => {
    const balige = getDistrictById('balige', db)
    assert.ok(balige)
    assert.strictEqual(balige?.name, 'Kecamatan Balige')
    assert.strictEqual(balige?.total_budget_idr, 48500000000)

    const notFound = getDistrictById('nonexistent', db)
    assert.strictEqual(notFound, null)
  })

  await t.test('3. should update district budget and total_budget_idr when total is exactly 100%', () => {
    const updated = updateDistrictBudget(
      'habinsaran',
      {
        total_budget_idr: 25000000000,
        budget_infra_pct: 35,
        budget_health_pct: 25,
        budget_edu_pct: 20,
        budget_social_pct: 20,
      },
      db
    )

    assert.ok(updated)
    assert.strictEqual(updated.total_budget_idr, 25000000000)
    assert.strictEqual(updated.budget_infra_pct, 35)
    assert.strictEqual(updated.budget_health_pct, 25)
    assert.strictEqual(updated.budget_edu_pct, 20)
    assert.strictEqual(updated.budget_social_pct, 20)
  })

  await t.test('4. should fail to update district budget if total is not 100%', () => {
    assert.throws(
      () => {
        updateDistrictBudget(
          'habinsaran',
          {
            budget_infra_pct: 40,
            budget_health_pct: 20,
            budget_edu_pct: 20,
            budget_social_pct: 10, // total 90
          },
          db
        )
      },
      { message: /Total alokasi 4 sektor wajib berjumlah tepat 100%/ }
    )
  })

  await t.test('5. should create citizen submission and validate total 100%', () => {
    const sub = createCitizenSubmission(
      {
        district_id: 'balige',
        alloc_infra_pct: 30,
        alloc_health_pct: 30,
        alloc_edu_pct: 20,
        alloc_social_pct: 20,
        notes: 'Perbaikan jalan pasar Balige dan faskes puskesmas kota.',
      },
      db
    )

    assert.ok(sub.id)
    assert.strictEqual(sub.district_id, 'balige')
    assert.strictEqual(sub.alloc_infra_pct, 30)

    const all = getAllSubmissions(db, 'balige')
    assert.ok(all.some((s) => s.id === sub.id))
  })

  await t.test('6. should reject citizen submission if total is not 100% or notes > 200 chars', () => {
    assert.throws(
      () => {
        createCitizenSubmission(
          {
            district_id: 'balige',
            alloc_infra_pct: 50,
            alloc_health_pct: 50,
            alloc_edu_pct: 10,
            alloc_social_pct: 10, // total 120
            notes: 'Test',
          },
          db
        )
      },
      { message: /Total alokasi simulasi wajib tepat 100%/ }
    )

    assert.throws(
      () => {
        createCitizenSubmission(
          {
            district_id: 'balige',
            alloc_infra_pct: 25,
            alloc_health_pct: 25,
            alloc_edu_pct: 25,
            alloc_social_pct: 25,
            notes: 'A'.repeat(201),
          },
          db
        )
      },
      { message: /Catatan aspirasi maksimal 200 karakter/ }
    )
  })

  await t.test('7. should aggregate citizen aspirations and calculate policy recommendations', () => {
    const aspirations = getAggregatedAspirations(db)
    assert.strictEqual(aspirations.length, 4)

    const habAspiration = aspirations.find((a) => a.district_id === 'habinsaran')
    assert.ok(habAspiration)
    assert.ok(habAspiration.total_votes > 0)
    assert.ok(habAspiration.avg_infra_pct > 0)

    const recommendations = generatePolicyRecommendations(db)
    assert.ok(Array.isArray(recommendations))
    assert.ok(recommendations.length > 0)
    // Habinsaran or Porsea should have critical/warning recommendations
    const hasCritical = recommendations.some((r) => r.severity === 'CRITICAL' || r.severity === 'WARNING')
    assert.ok(hasCritical)
  })

  await t.test('8. should seed 9 rich citizen submissions with UI attributes', () => {
    const allSubs = getAllSubmissions(db)
    assert.ok(allSubs.length >= 9)

    const firstSub = allSubs[0]
    assert.ok(firstSub.district_name)
    assert.ok(firstSub.author)
    assert.ok(firstSub.avatar)
    assert.ok(firstSub.avatarBg)
    assert.ok(firstSub.timeAgo)
  })

  await t.test('9. should seed and verify admin credentials, and update password', () => {
    const valid = verifyAdminCredentials('admin@nalarpublik.id', 'AdminNalar2026!', db)
    assert.strictEqual(valid.valid, true)
    assert.strictEqual(valid.user?.email, 'admin@nalarpublik.id')
    assert.strictEqual(valid.user?.role, 'admin')

    const invalid = verifyAdminCredentials('admin@nalarpublik.id', 'WrongPass!', db)
    assert.strictEqual(invalid.valid, false)

    const updated = updateAdminPassword('admin@nalarpublik.id', 'NewSecret2026!', db)
    assert.strictEqual(updated, true)

    const checkNew = verifyAdminCredentials('admin@nalarpublik.id', 'NewSecret2026!', db)
    assert.strictEqual(checkNew.valid, true)
  })

  await t.test('10. should create citizen submission with custom author and district_name', () => {
    const sub = createCitizenSubmission(
      {
        district_id: 'habinsaran',
        district_name: 'Kecamatan Habinsaran',
        author: 'Warga Lumban Rau Julu',
        alloc_infra_pct: 40,
        alloc_health_pct: 20,
        alloc_edu_pct: 20,
        alloc_social_pct: 20,
        notes: 'Perbaikan jembatan utama antar desa.',
      },
      db
    )

    assert.strictEqual(sub.author, 'Warga Lumban Rau Julu')
    assert.strictEqual(sub.district_name, 'Kecamatan Habinsaran')
  })

  db.close()
})
