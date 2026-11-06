import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { District, CitizenSubmission, AggregatedAspiration, PolicyRecommendation, SectorKey } from '@/types'
import { calculateOverallGap, calculateGapStatus, calculateSectorGaps } from './gap-calculator'
import { INITIAL_DISTRICTS } from './data'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'nalarpublik.db')

let globalDb: Database.Database | null = null

export function getDb(): Database.Database {
  if (globalDb) return globalDb

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initDbSchema(db)
  seedInitialData(db)

  globalDb = db
  return globalDb
}

export function initDbSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      bps_code TEXT NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      population INTEGER NOT NULL,
      total_budget_idr INTEGER NOT NULL,
      infra_problem_pct REAL NOT NULL,
      health_problem_pct REAL NOT NULL,
      edu_problem_pct REAL NOT NULL,
      social_problem_pct REAL NOT NULL,
      budget_infra_pct REAL NOT NULL,
      budget_health_pct REAL NOT NULL,
      budget_edu_pct REAL NOT NULL,
      budget_social_pct REAL NOT NULL,
      bps_synced_at TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS citizen_submissions (
      id TEXT PRIMARY KEY,
      district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
      alloc_infra_pct REAL NOT NULL,
      alloc_health_pct REAL NOT NULL,
      alloc_edu_pct REAL NOT NULL,
      alloc_social_pct REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      CHECK (ROUND(alloc_infra_pct + alloc_health_pct + alloc_edu_pct + alloc_social_pct, 1) = 100)
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_district ON citizen_submissions(district_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON citizen_submissions(created_at);
  `)
}

export function seedInitialData(db: Database.Database): void {
  const districtCount = db.prepare('SELECT COUNT(*) as count FROM districts').get() as { count: number }
  if (districtCount.count === 0) {
    const insertDistrict = db.prepare(`
      INSERT INTO districts (
        id, bps_code, name, latitude, longitude, population, total_budget_idr,
        infra_problem_pct, health_problem_pct, edu_problem_pct, social_problem_pct,
        budget_infra_pct, budget_health_pct, budget_edu_pct, budget_social_pct,
        bps_synced_at, updated_at
      ) VALUES (
        @id, @bps_code, @name, @latitude, @longitude, @population, @total_budget_idr,
        @infra_problem_pct, @health_problem_pct, @edu_problem_pct, @social_problem_pct,
        @budget_infra_pct, @budget_health_pct, @budget_edu_pct, @budget_social_pct,
        datetime('now'), datetime('now')
      )
    `)

    const insertManyDistricts = db.transaction((districts: typeof INITIAL_DISTRICTS) => {
      for (const d of districts) {
        insertDistrict.run(d)
      }
    })

    insertManyDistricts(INITIAL_DISTRICTS)
  }

  const subCount = db.prepare('SELECT COUNT(*) as count FROM citizen_submissions').get() as { count: number }
  if (subCount.count === 0) {
    const insertSub = db.prepare(`
      INSERT INTO citizen_submissions (
        id, district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes, created_at
      ) VALUES (
        @id, @district_id, @alloc_infra_pct, @alloc_health_pct, @alloc_edu_pct, @alloc_social_pct, @notes, @created_at
      )
    `)

    const initialSubs = [
      {
        id: 'sub-1',
        district_id: 'habinsaran',
        alloc_infra_pct: 50,
        alloc_health_pct: 20,
        alloc_edu_pct: 15,
        alloc_social_pct: 15,
        notes: 'Jalan penghubung antar desa di Habinsaran banyak yang longsor dan rusak berat.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'sub-2',
        district_id: 'habinsaran',
        alloc_infra_pct: 45,
        alloc_health_pct: 25,
        alloc_edu_pct: 15,
        alloc_social_pct: 15,
        notes: 'Mohon prioritas pengaspalan jalan pertanian dan tambahan perawat puskesmas.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sub-3',
        district_id: 'porsea',
        alloc_infra_pct: 25,
        alloc_health_pct: 40,
        alloc_edu_pct: 20,
        alloc_social_pct: 15,
        notes: 'Program penanganan stunting dan gizi balita di Porsea perlu ditingkatkan.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'sub-4',
        district_id: 'laguboti',
        alloc_infra_pct: 30,
        alloc_health_pct: 20,
        alloc_edu_pct: 35,
        alloc_social_pct: 15,
        notes: 'Renovasi ruang kelas sekolah dasar dan fasilitas belajar siswa.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'sub-5',
        district_id: 'balige',
        alloc_infra_pct: 30,
        alloc_health_pct: 25,
        alloc_edu_pct: 25,
        alloc_social_pct: 20,
        notes: 'Drainase jalan perkotaan dan penataan ruang publik.',
        created_at: new Date(Date.now() - 9000000).toISOString(),
      },
    ]

    const insertManySubs = db.transaction((subs) => {
      for (const s of subs) {
        insertSub.run(s)
      }
    })

    insertManySubs(initialSubs)
  }
}

export function getAllDistricts(customDb?: Database.Database): District[] {
  const db = customDb || getDb()
  const rows = db.prepare('SELECT * FROM districts ORDER BY name ASC').all() as District[]

  return rows.map((d) => ({
    ...d,
    overall_gap_score: calculateOverallGap(d),
    gap_status: calculateGapStatus(d),
  }))
}

export function getDistrictById(id: string, customDb?: Database.Database): District | null {
  const db = customDb || getDb()
  const row = db.prepare('SELECT * FROM districts WHERE id = ?').get(id) as District | undefined
  if (!row) return null

  return {
    ...row,
    overall_gap_score: calculateOverallGap(row),
    gap_status: calculateGapStatus(row),
  }
}

export function updateDistrictBudget(
  id: string,
  budget: {
    budget_infra_pct: number
    budget_health_pct: number
    budget_edu_pct: number
    budget_social_pct: number
    total_budget_idr?: number
  },
  customDb?: Database.Database
): District {
  const db = customDb || getDb()

  const { budget_infra_pct, budget_health_pct, budget_edu_pct, budget_social_pct, total_budget_idr } = budget

  if (
    budget_infra_pct < 0 || budget_infra_pct > 100 ||
    budget_health_pct < 0 || budget_health_pct > 100 ||
    budget_edu_pct < 0 || budget_edu_pct > 100 ||
    budget_social_pct < 0 || budget_social_pct > 100
  ) {
    throw new Error('Alokasi anggaran setiap sektor harus bernilai antara 0% hingga 100%')
  }

  const total = Number((budget_infra_pct + budget_health_pct + budget_edu_pct + budget_social_pct).toFixed(2))

  if (total !== 100) {
    throw new Error('Total alokasi 4 sektor wajib berjumlah tepat 100%')
  }

  const existing = getDistrictById(id, db)
  if (!existing) {
    throw new Error(`Kecamatan dengan ID '${id}' tidak ditemukan`)
  }

  const newTotalBudget = typeof total_budget_idr === 'number' && total_budget_idr > 0 ? total_budget_idr : existing.total_budget_idr

  const stmt = db.prepare(`
    UPDATE districts
    SET
      total_budget_idr = @total_budget_idr,
      budget_infra_pct = @budget_infra_pct,
      budget_health_pct = @budget_health_pct,
      budget_edu_pct = @budget_edu_pct,
      budget_social_pct = @budget_social_pct,
      updated_at = datetime('now')
    WHERE id = @id
  `)

  stmt.run({
    id,
    total_budget_idr: newTotalBudget,
    budget_infra_pct,
    budget_health_pct,
    budget_edu_pct,
    budget_social_pct,
  })

  return getDistrictById(id, db)!
}

export function updateDistrictBpsSync(
  id: string,
  syncedAt: string,
  problemUpdates?: {
    infra_problem_pct?: number
    health_problem_pct?: number
    edu_problem_pct?: number
    social_problem_pct?: number
  },
  customDb?: Database.Database
): District {
  const db = customDb || getDb()
  const current = getDistrictById(id, db)
  if (!current) throw new Error(`Kecamatan '${id}' tidak ditemukan`)

  const stmt = db.prepare(`
    UPDATE districts
    SET
      infra_problem_pct = @infra_problem_pct,
      health_problem_pct = @health_problem_pct,
      edu_problem_pct = @edu_problem_pct,
      social_problem_pct = @social_problem_pct,
      bps_synced_at = @bps_synced_at,
      updated_at = datetime('now')
    WHERE id = @id
  `)

  stmt.run({
    id,
    infra_problem_pct: problemUpdates?.infra_problem_pct ?? current.infra_problem_pct,
    health_problem_pct: problemUpdates?.health_problem_pct ?? current.health_problem_pct,
    edu_problem_pct: problemUpdates?.edu_problem_pct ?? current.edu_problem_pct,
    social_problem_pct: problemUpdates?.social_problem_pct ?? current.social_problem_pct,
    bps_synced_at: syncedAt,
  })

  return getDistrictById(id, db)!
}

export function getAllSubmissions(
  customDb?: Database.Database,
  districtId?: string,
  limit = 50
): CitizenSubmission[] {
  const db = customDb || getDb()
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500))

  if (districtId) {
    return db
      .prepare('SELECT * FROM citizen_submissions WHERE district_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(districtId, safeLimit) as CitizenSubmission[]
  }

  return db
    .prepare('SELECT * FROM citizen_submissions ORDER BY created_at DESC LIMIT ?')
    .all(safeLimit) as CitizenSubmission[]
}

export function createCitizenSubmission(
  sub: {
    district_id: string
    alloc_infra_pct: number
    alloc_health_pct: number
    alloc_edu_pct: number
    alloc_social_pct: number
    notes?: string
  },
  customDb?: Database.Database
): CitizenSubmission {
  const db = customDb || getDb()

  const { district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes } = sub

  if (!district_id) {
    throw new Error('Kecamatan wajib dipilih')
  }

  const district = getDistrictById(district_id, db)
  if (!district) {
    throw new Error(`Kecamatan '${district_id}' tidak valid`)
  }

  if (
    alloc_infra_pct < 0 || alloc_infra_pct > 100 ||
    alloc_health_pct < 0 || alloc_health_pct > 100 ||
    alloc_edu_pct < 0 || alloc_edu_pct > 100 ||
    alloc_social_pct < 0 || alloc_social_pct > 100
  ) {
    throw new Error('Alokasi simulasi setiap sektor harus bernilai antara 0% hingga 100%')
  }

  const total = Number((alloc_infra_pct + alloc_health_pct + alloc_edu_pct + alloc_social_pct).toFixed(2))
  if (total !== 100) {
    throw new Error('Total alokasi simulasi wajib tepat 100%')
  }

  if (notes && notes.length > 200) {
    throw new Error('Catatan aspirasi maksimal 200 karakter')
  }

  const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const created_at = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO citizen_submissions (
      id, district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, district_id, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes || null, created_at)

  return {
    id,
    district_id,
    alloc_infra_pct,
    alloc_health_pct,
    alloc_edu_pct,
    alloc_social_pct,
    notes: notes || undefined,
    created_at,
  }
}

export function getAggregatedAspirations(customDb?: Database.Database): AggregatedAspiration[] {
  const db = customDb || getDb()
  const districts = getAllDistricts(db)

  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_votes,
      AVG(alloc_infra_pct) as avg_infra_pct,
      AVG(alloc_health_pct) as avg_health_pct,
      AVG(alloc_edu_pct) as avg_edu_pct,
      AVG(alloc_social_pct) as avg_social_pct
    FROM citizen_submissions
    WHERE district_id = ?
  `)

  return districts.map((d) => {
    const row = stmt.get(d.id) as {
      total_votes: number
      avg_infra_pct: number | null
      avg_health_pct: number | null
      avg_edu_pct: number | null
      avg_social_pct: number | null
    }

    const total_votes = row?.total_votes || 0

    return {
      district_id: d.id,
      total_votes,
      avg_infra_pct: total_votes ? Number((row.avg_infra_pct || 0).toFixed(1)) : 0,
      avg_health_pct: total_votes ? Number((row.avg_health_pct || 0).toFixed(1)) : 0,
      avg_edu_pct: total_votes ? Number((row.avg_edu_pct || 0).toFixed(1)) : 0,
      avg_social_pct: total_votes ? Number((row.avg_social_pct || 0).toFixed(1)) : 0,
    }
  })
}

export function generatePolicyRecommendations(customDb?: Database.Database): PolicyRecommendation[] {
  const db = customDb || getDb()
  const districts = getAllDistricts(db)
  const aspirations = getAggregatedAspirations(db)

  const recommendations: PolicyRecommendation[] = []

  const sectorLabels: Record<SectorKey, string> = {
    infra: 'Infrastruktur Jalan',
    health: 'Kesehatan & Stunting',
    education: 'Pendidikan & Ruang Kelas',
    social: 'Sosial & Pengentasan Kemiskinan',
  }

  for (const d of districts) {
    const asp = aspirations.find((a) => a.district_id === d.id)
    const gaps = calculateSectorGaps(d)

    for (const g of gaps) {
      if (g.gap >= 10) {
        const severity = g.gap >= 20 ? 'CRITICAL' : 'WARNING'
        const aspPct =
          g.sector === 'infra'
            ? asp?.avg_infra_pct || 0
            : g.sector === 'health'
              ? asp?.avg_health_pct || 0
              : g.sector === 'education'
                ? asp?.avg_edu_pct || 0
                : asp?.avg_social_pct || 0

        const recommendedShift = Math.max(5, Number((g.gap - 15).toFixed(1)))
        const lowestGapSector = [...gaps].sort((a, b) => a.gap - b.gap)[0]

        recommendations.push({
          district_id: d.id,
          district_name: d.name,
          sector: g.sector,
          sector_label: sectorLabels[g.sector],
          problem_pct: g.problemPct,
          current_budget_pct: g.budgetPct,
          citizen_aspiration_pct: aspPct,
          gap_score: g.gap,
          severity,
          recommendation_text: `Tingkat masalah ${sectorLabels[g.sector].toLowerCase()} sebesar ${g.problemPct}%, sedangkan anggaran APBD hanya ${g.budgetPct}% (Aspirasi warga: ${aspPct}%). Disarankan realokasi minimal +${recommendedShift}% ke sektor ${g.label} dialihkan dari efisiensi pos ${lowestGapSector.label}.`,
        })
      }
    }
  }

  return recommendations.sort((a, b) => b.gap_score - a.gap_score)
}

export function resetDatabaseToDefaults(customDb?: Database.Database): void {
  const db = customDb || getDb()
  db.exec(`
    DELETE FROM citizen_submissions;
    DELETE FROM districts;
  `)
  seedInitialData(db)
}

