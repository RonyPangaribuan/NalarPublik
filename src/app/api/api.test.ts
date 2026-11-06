import test from 'node:test'
import assert from 'node:assert/strict'
import { GET as getDistricts, PUT as putDistricts } from './districts/route'
import { POST as syncDistricts } from './districts/sync/route'
import { GET as getSubmissions, POST as postSubmissions } from './submissions/route'
import { GET as getAnalytics } from './analytics/route'
import { GET as getExport } from './export/route'

test('API Route Handlers with SQLite', async (t) => {
  await t.test('GET /api/districts returns all 4 districts with calculated gap status', async () => {
    const res = await getDistricts()
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.data.length, 4)
    assert.ok(json.source)
    assert.ok(json.last_synced)
  })

  await t.test('PUT /api/districts updates budget when sum is 100', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'laguboti',
        budget_infra_pct: 30,
        budget_health_pct: 30,
        budget_edu_pct: 20,
        budget_social_pct: 20,
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.strictEqual(json.data.budget_infra_pct, 30)
  })

  await t.test('PUT /api/districts returns 400 when sum is not 100', async () => {
    const req = new Request('http://localhost/api/districts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'laguboti',
        budget_infra_pct: 50,
        budget_health_pct: 30,
        budget_edu_pct: 20,
        budget_social_pct: 20, // 120%
      }),
    })

    const res = await putDistricts(req)
    assert.strictEqual(res.status, 400)
    const json = await res.json()
    assert.ok(json.error)
  })

  await t.test('POST /api/districts/sync executes BPS sync with fallback', async () => {
    const res = await syncDistricts()
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.success, true)
    assert.ok(json.source === 'live_bps_hybrid' || json.source === 'cached_snapshot')
    assert.strictEqual(json.data.length, 4)
  })

  await t.test('GET and POST /api/submissions', async () => {
    const postReq = new Request('http://localhost/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district_id: 'porsea',
        alloc_infra_pct: 25,
        alloc_health_pct: 35,
        alloc_edu_pct: 20,
        alloc_social_pct: 20,
        notes: 'Uji coba aspirasi warga via API',
      }),
    })

    const postRes = await postSubmissions(postReq)
    assert.strictEqual(postRes.status, 201)
    const postJson = await postRes.json()
    assert.strictEqual(postJson.success, true)
    assert.strictEqual(postJson.data.district_id, 'porsea')

    const getReq = new Request('http://localhost/api/submissions?district_id=porsea')
    const getRes = await getSubmissions(getReq)
    assert.strictEqual(getRes.status, 200)
    const getJson = await getRes.json()
    assert.ok(getJson.total >= 1)
  })

  await t.test('GET /api/analytics returns dynamic aspirations and recommendations', async () => {
    const res = await getAnalytics()
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.strictEqual(json.aspirations.length, 4)
    assert.ok(Array.isArray(json.recommendations))
  })

  await t.test('GET /api/export returns CSV file attachment', async () => {
    const res = await getExport()
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('Content-Type'), 'text/csv; charset=utf-8')
    const text = await res.text()
    assert.ok(text.includes('id,bps_code,name'))
    assert.ok(text.includes('habinsaran'))
  })
})

