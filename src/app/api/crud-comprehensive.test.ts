import test from 'node:test'
import assert from 'node:assert/strict'
import { GET as getDistricts, PUT as putDistricts } from './districts/route'
import { POST as syncDistricts } from './districts/sync/route'
import { GET as getSubmissions, POST as postSubmissions } from './submissions/route'
import { GET as getAnalytics } from './analytics/route'
import { GET as getExport } from './export/route'

test('Comprehensive End-to-End CRUD & Edge Cases Test Suite', async (t) => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DISTRICTS READ TESTS
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('1.1 GET /api/districts - should return all 4 pilot districts with correct schema', async () => {
    const res = await getDistricts()
    assert.strictEqual(res.status, 200)

    const json = await res.json()
    assert.strictEqual(json.data.length, 4)
    assert.ok(json.source)
    assert.ok(json.last_synced)

    const ids = json.data.map((d: { id: string }) => d.id).sort()
    assert.deepStrictEqual(ids, ['balige', 'habinsaran', 'laguboti', 'porsea'])

    // Validate fields on every district
    for (const d of json.data) {
      assert.ok(d.id)
      assert.ok(d.bps_code)
      assert.ok(d.name)
      assert.strictEqual(typeof d.latitude, 'number')
      assert.strictEqual(typeof d.longitude, 'number')
      assert.strictEqual(typeof d.population, 'number')
      assert.strictEqual(typeof d.total_budget_idr, 'number')
      assert.strictEqual(typeof d.infra_problem_pct, 'number')
      assert.strictEqual(typeof d.health_problem_pct, 'number')
      assert.strictEqual(typeof d.edu_problem_pct, 'number')
      assert.strictEqual(typeof d.social_problem_pct, 'number')
      assert.strictEqual(typeof d.budget_infra_pct, 'number')
      assert.strictEqual(typeof d.budget_health_pct, 'number')
      assert.strictEqual(typeof d.budget_edu_pct, 'number')
      assert.strictEqual(typeof d.budget_social_pct, 'number')
      assert.strictEqual(typeof d.overall_gap_score, 'number')
      assert.ok(['CRITICAL', 'WARNING', 'PROPORTIONAL'].includes(d.gap_status))
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DISTRICTS UPDATE TESTS (PUT /api/districts)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('2.1 PUT /api/districts - valid budget reallocation and total budget update', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'habinsaran',
        total_budget_idr: 28000000000,
        budget_infra_pct: 40,
        budget_health_pct: 25,
        budget_edu_pct: 20,
        budget_social_pct: 15,
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 200)

    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.id, 'habinsaran')
    assert.strictEqual(json.data.total_budget_idr, 28000000000)
    assert.strictEqual(json.data.budget_infra_pct, 40)
    assert.strictEqual(json.data.budget_health_pct, 25)
    assert.strictEqual(json.data.budget_edu_pct, 20)
    assert.strictEqual(json.data.budget_social_pct, 15)
    assert.ok(json.data.updated_at)
  })

  await t.test('2.2 PUT /api/districts - should reject if sum of percentages < 100', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'habinsaran',
        budget_infra_pct: 30,
        budget_health_pct: 20,
        budget_edu_pct: 20,
        budget_social_pct: 20, // sum = 90
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('100%'))
  })

  await t.test('2.3 PUT /api/districts - should reject if sum of percentages > 100', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'habinsaran',
        budget_infra_pct: 40,
        budget_health_pct: 30,
        budget_edu_pct: 25,
        budget_social_pct: 25, // sum = 120
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('100%'))
  })

  await t.test('2.4 PUT /api/districts - should reject negative percentages even if sum is 100', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'habinsaran',
        budget_infra_pct: -20,
        budget_health_pct: 120,
        budget_edu_pct: 0,
        budget_social_pct: 0, // sum is 100, but has negative
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('0% hingga 100%'))
  })

  await t.test('2.5 PUT /api/districts - should reject non-existent district ID', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'kecamatan_fiktif',
        budget_infra_pct: 25,
        budget_health_pct: 25,
        budget_edu_pct: 25,
        budget_social_pct: 25,
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('tidak ditemukan'))
  })

  await t.test('2.6 PUT /api/districts - should reject missing ID or non-numeric values', async () => {
    const reqNoId = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget_infra_pct: 25,
        budget_health_pct: 25,
        budget_edu_pct: 25,
        budget_social_pct: 25,
      }),
    })
    const resNoId = await putDistricts(reqNoId)
    assert.strictEqual(resNoId.status, 400)

    const reqBadTypes = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'balige',
        budget_infra_pct: 'dua puluh lima',
        budget_health_pct: 25,
        budget_edu_pct: 25,
        budget_social_pct: 25,
      }),
    })
    const resBadTypes = await putDistricts(reqBadTypes)
    assert.strictEqual(resBadTypes.status, 400)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BPS SYNC TESTS (POST /api/districts/sync)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('3.1 POST /api/districts/sync - executes fallback or live sync cleanly', async () => {
    const res = await syncDistricts()
    assert.strictEqual(res.status, 200)

    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.source === 'cached_snapshot' || json.source === 'live_bps_hybrid')
    assert.ok(json.last_synced)
    assert.strictEqual(json.data.length, 4)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CITIZEN SUBMISSIONS CREATE TESTS (POST /api/submissions)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('4.1 POST /api/submissions - valid citizen submission with notes', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'balige',
        alloc_infra_pct: 35,
        alloc_health_pct: 25,
        alloc_edu_pct: 20,
        alloc_social_pct: 20,
        notes: 'Pembangunan drainase dan revitalisasi fasilitas kesehatan pasar Balige.',
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 201)

    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.data.id.startsWith('sub-'))
    assert.strictEqual(json.data.district_id, 'balige')
    assert.strictEqual(json.data.alloc_infra_pct, 35)
    assert.strictEqual(json.data.notes, 'Pembangunan drainase dan revitalisasi fasilitas kesehatan pasar Balige.')
  })

  await t.test('4.2 POST /api/submissions - valid citizen submission without notes', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'laguboti',
        alloc_infra_pct: 25,
        alloc_health_pct: 25,
        alloc_edu_pct: 25,
        alloc_social_pct: 25,
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 201)

    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.district_id, 'laguboti')
    assert.strictEqual(json.data.notes, undefined)
  })

  await t.test('4.3 POST /api/submissions - reject if total not 100%', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'porsea',
        alloc_infra_pct: 30,
        alloc_health_pct: 30,
        alloc_edu_pct: 20,
        alloc_social_pct: 10, // 90%
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('100%'))
  })

  await t.test('4.4 POST /api/submissions - reject if negative percentages', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'porsea',
        alloc_infra_pct: -10,
        alloc_health_pct: 110,
        alloc_edu_pct: 0,
        alloc_social_pct: 0,
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('0% hingga 100%'))
  })

  await t.test('4.5 POST /api/submissions - reject notes > 200 characters', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'habinsaran',
        alloc_infra_pct: 25,
        alloc_health_pct: 25,
        alloc_edu_pct: 25,
        alloc_social_pct: 25,
        notes: 'X'.repeat(201),
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('200 karakter'))
  })

  await t.test('4.6 POST /api/submissions - reject invalid district_id', async () => {
    const req = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'kota_medan',
        alloc_infra_pct: 25,
        alloc_health_pct: 25,
        alloc_edu_pct: 25,
        alloc_social_pct: 25,
      }),
    })

    const res = await postSubmissions(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('tidak valid'))
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. CITIZEN SUBMISSIONS READ TESTS (GET /api/submissions)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('5.1 GET /api/submissions - fetch all and filter by district_id', async () => {
    const allRes = await getSubmissions(new Request('http://localhost/api/submissions'))
    assert.strictEqual(allRes.status, 200)
    const allJson = await allRes.json()
    assert.ok(allJson.total >= 5) // Initial seeded + test creations
    assert.ok(Array.isArray(allJson.data))

    // Filter by district
    const filterRes = await getSubmissions(new Request('http://localhost/api/submissions?district_id=balige'))
    assert.strictEqual(filterRes.status, 200)
    const filterJson = await filterRes.json()
    assert.ok(filterJson.total >= 1)
    for (const item of filterJson.data) {
      assert.strictEqual(item.district_id, 'balige')
    }

    // Limit check
    const limitRes = await getSubmissions(new Request('http://localhost/api/submissions?limit=2'))
    assert.strictEqual(limitRes.status, 200)
    const limitJson = await limitRes.json()
    assert.strictEqual(limitJson.data.length, 2)
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. ANALYTICS & DECISION ENGINE TESTS (GET /api/analytics)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('6.1 GET /api/analytics - dynamic aggregated averages and policy recommendations', async () => {
    const res = await getAnalytics()
    assert.strictEqual(res.status, 200)

    const json = await res.json()
    assert.strictEqual(json.aspirations.length, 4)

    for (const asp of json.aspirations) {
      assert.ok(['balige', 'habinsaran', 'laguboti', 'porsea'].includes(asp.district_id))
      assert.strictEqual(typeof asp.total_votes, 'number')
      assert.strictEqual(typeof asp.avg_infra_pct, 'number')
      assert.strictEqual(typeof asp.avg_health_pct, 'number')
      assert.strictEqual(typeof asp.avg_edu_pct, 'number')
      assert.strictEqual(typeof asp.avg_social_pct, 'number')
    }

    assert.ok(Array.isArray(json.recommendations))
    assert.ok(json.recommendations.length > 0)

    // Check sorted descending by gap_score
    for (let i = 0; i < json.recommendations.length - 1; i++) {
      assert.ok(json.recommendations[i].gap_score >= json.recommendations[i + 1].gap_score)
    }

    // Every recommendation must have actionable text and valid severity
    for (const rec of json.recommendations) {
      assert.ok(['CRITICAL', 'WARNING'].includes(rec.severity))
      assert.ok(rec.recommendation_text.length > 20)
      assert.ok(rec.district_name)
      assert.ok(rec.sector_label)
    }
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. OPEN DATA CSV EXPORT TESTS (GET /api/export)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('7.1 GET /api/export - valid CSV headers, content rows, and HTTP headers', async () => {
    const res = await getExport()
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('Content-Type'), 'text/csv; charset=utf-8')
    assert.ok(res.headers.get('Content-Disposition')?.includes('nalarpublik_toba_apbd_bps_2026.csv'))

    const csvText = await res.text()
    const lines = csvText.trim().split('\n')
    assert.strictEqual(lines.length, 5) // 1 header line + 4 district data lines

    const header = lines[0]
    assert.ok(header.includes('id,bps_code,name,population,total_budget_idr'))
    assert.ok(header.includes('overall_gap_score,gap_status'))

    // District rows contain pilot names
    assert.ok(csvText.includes('habinsaran'))
    assert.ok(csvText.includes('balige'))
    assert.ok(csvText.includes('laguboti'))
    assert.ok(csvText.includes('porsea'))
  })
})

