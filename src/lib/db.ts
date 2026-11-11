import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { District, CitizenSubmission, AggregatedAspiration, PolicyRecommendation, SectorKey, AdminUser } from '@/types'
import { calculateOverallGap, calculateGapStatus, calculateSectorGaps } from './gap-calculator'
import { INITIAL_DISTRICTS } from './data'

const DB_PATH = process.env.SQLITE_DB_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH)
  : path.join(process.cwd(), 'data', 'nalarpublik.db')
const DATA_DIR = path.dirname(DB_PATH)

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
      district_name TEXT,
      author TEXT DEFAULT 'Warga Toba',
      alloc_infra_pct REAL NOT NULL,
      alloc_health_pct REAL NOT NULL,
      alloc_edu_pct REAL NOT NULL,
      alloc_social_pct REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      CHECK (ROUND(alloc_infra_pct + alloc_health_pct + alloc_edu_pct + alloc_social_pct, 1) = 100)
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_district ON citizen_submissions(district_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON citizen_submissions(created_at);
  `)

  // Auto-migration columns if existing SQLite DB lacks author or district_name
  try {
    const cols = db.prepare('PRAGMA table_info(citizen_submissions)').all() as { name: string }[]
    const colNames = cols.map((c) => c.name)
    if (!colNames.includes('author')) {
      db.exec("ALTER TABLE citizen_submissions ADD COLUMN author TEXT DEFAULT 'Warga Toba'")
    }
    if (!colNames.includes('district_name')) {
      db.exec('ALTER TABLE citizen_submissions ADD COLUMN district_name TEXT')
    }
  } catch {
    // Table may have just been created with columns
  }
}

export const RICH_CITIZEN_SUBMISSIONS = [
  {
    id: 'sub-hab-1',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Desa Lumban Rau',
    alloc_infra_pct: 50,
    alloc_health_pct: 20,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Jalan penghubung antar desa di Habinsaran banyak yang longsor dan rusak berat. Truk pengangkut hasil tani sering terbalik saat musim hujan.',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'sub-hab-2',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Parsoburan',
    alloc_infra_pct: 45,
    alloc_health_pct: 25,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Mohon prioritas pengaspalan jalan usaha tani dataran tinggi dan tambahan tenaga perawat puskesmas pembantu desa.',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'sub-hab-3',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Borbor Julu',
    alloc_infra_pct: 55,
    alloc_health_pct: 15,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Jembatan kayu antar dusun sudah rapuh, anak sekolah harus memutar 5 kilometer tiap hari menyeberang sungai.',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'sub-por-1',
    district_id: 'porsea',
    district_name: 'Kecamatan Porsea',
    author: 'Warga Desa Siruar',
    alloc_infra_pct: 25,
    alloc_health_pct: 45,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Program penanganan stunting dan gizi balita di Porsea pesisir perlu ditingkatkan dan diberi susu formula serta PMT rutin.',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'sub-por-2',
    district_id: 'porsea',
    district_name: 'Kecamatan Porsea',
    author: 'Warga Patane I',
    alloc_infra_pct: 30,
    alloc_health_pct: 35,
    alloc_edu_pct: 20,
    alloc_social_pct: 15,
    notes: 'Puskesmas rawat inap Porsea butuh alat USG dan timbangan antropometri digital terkalibrasi untuk posyandu balita.',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'sub-lag-1',
    district_id: 'laguboti',
    district_name: 'Kecamatan Laguboti',
    author: 'Warga Desa Sitoluama',
    alloc_infra_pct: 30,
    alloc_health_pct: 20,
    alloc_edu_pct: 35,
    alloc_social_pct: 15,
    notes: 'Renovasi ruang kelas SD negeri yang plafonnya jebol dan penambahan sarana komputer/internet untuk siswa desa.',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'sub-lag-2',
    district_id: 'laguboti',
    district_name: 'Kecamatan Laguboti',
    author: 'Warga Pasar Laguboti',
    alloc_infra_pct: 25,
    alloc_health_pct: 20,
    alloc_edu_pct: 35,
    alloc_social_pct: 20,
    notes: 'Bantuan beasiswa anak petani berprestasi dan perbaikan sarana sanitasi MCK sekolah dasar pelosok.',
    created_at: new Date(Date.now() - 240 * 60000).toISOString(),
  },
  {
    id: 'sub-bal-1',
    district_id: 'balige',
    district_name: 'Kecamatan Balige',
    author: 'Warga Sangkar Nihuta',
    alloc_infra_pct: 35,
    alloc_health_pct: 25,
    alloc_edu_pct: 20,
    alloc_social_pct: 20,
    notes: 'Normalisasi saluran drainase perkotaan Balige agar tidak banjir saat hujan lebat dan pengelolaan sampah pasar tradisional.',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'sub-bal-2',
    district_id: 'balige',
    district_name: 'Kecamatan Balige',
    author: 'Warga Lumban Silintong',
    alloc_infra_pct: 35,
    alloc_health_pct: 20,
    alloc_edu_pct: 20,
    alloc_social_pct: 25,
    notes: 'Penerangan lampu jalan umum menuju sentra pantai Danau Toba dan bantuan bibit kopi arabika dataran tinggi.',
    created_at: new Date(Date.now() - 300 * 60000).toISOString(),
  },
]

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
  if (subCount.count < 9) {
    // If empty or only old partial dummy data, clean and insert full 9 rich submissions
    if (subCount.count > 0 && subCount.count < 9) {
      db.prepare('DELETE FROM citizen_submissions').run()
    }

    const insertSub = db.prepare(`
      INSERT INTO citizen_submissions (
        id, district_id, district_name, author, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes, created_at
      ) VALUES (
        @id, @district_id, @district_name, @author, @alloc_infra_pct, @alloc_health_pct, @alloc_edu_pct, @alloc_social_pct, @notes, @created_at
      )
    `)

    const insertManySubs = db.transaction((subs: typeof RICH_CITIZEN_SUBMISSIONS) => {
      for (const s of subs) {
        insertSub.run(s)
      }
    })

    insertManySubs(RICH_CITIZEN_SUBMISSIONS)
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number }
  if (adminCount.count === 0) {
    db.prepare(`
      INSERT INTO admins (id, email, password, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run('admin-default', 'admin@nalarpublik.id', 'AdminNalar2026!', 'Admin NalarPublik', 'admin')
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

export function formatSubmissionUi(sub: {
  id: string
  district_id: string
  district_name?: string | null
  author?: string | null
  alloc_infra_pct: number
  alloc_health_pct: number
  alloc_edu_pct: number
  alloc_social_pct: number
  notes?: string | null
  created_at: string
}): CitizenSubmission {
  const districtName =
    sub.district_name ||
    (sub.district_id === 'habinsaran'
      ? 'Kecamatan Habinsaran'
      : sub.district_id === 'porsea'
        ? 'Kecamatan Porsea'
        : sub.district_id === 'laguboti'
          ? 'Kecamatan Laguboti'
          : 'Kecamatan Balige')

  const author = sub.author || `Warga ${districtName}`

  const cleaned = author.replace(/warga|desa|kecamatan/gi, '').trim()
  const words = cleaned.split(/\s+/).filter(Boolean)
  let avatar = 'WT'
  if (words.length >= 2) {
    avatar = (words[0][0] + words[1][0]).toUpperCase()
  } else if (words.length === 1 && words[0].length >= 2) {
    avatar = words[0].slice(0, 2).toUpperCase()
  } else if (words.length === 1 && words[0].length === 1) {
    avatar = words[0].toUpperCase() + 'T'
  }

  const avatarBg =
    sub.district_id === 'habinsaran'
      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
      : sub.district_id === 'porsea'
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
        : sub.district_id === 'laguboti'
          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'

  const createdTime = new Date(sub.created_at).getTime()
  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdTime) / 60000))
  let timeAgo = 'Baru saja'
  if (diffMinutes >= 60 * 24) {
    const days = Math.floor(diffMinutes / (60 * 24))
    timeAgo = `${days} hari lalu`
  } else if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60)
    timeAgo = `${hours} jam lalu`
  } else if (diffMinutes > 1) {
    timeAgo = `${diffMinutes} menit lalu`
  }

  return {
    id: sub.id,
    district_id: sub.district_id,
    district_name: districtName,
    author,
    avatar,
    avatarBg,
    timeAgo,
    alloc_infra_pct: sub.alloc_infra_pct,
    alloc_health_pct: sub.alloc_health_pct,
    alloc_edu_pct: sub.alloc_edu_pct,
    alloc_social_pct: sub.alloc_social_pct,
    notes: sub.notes ?? undefined,
    created_at: sub.created_at,
  }
}

interface RawSubmissionRow {
  id: string
  district_id: string
  district_name?: string | null
  author?: string | null
  alloc_infra_pct: number
  alloc_health_pct: number
  alloc_edu_pct: number
  alloc_social_pct: number
  notes?: string | null
  created_at: string
}

export function getAllSubmissions(
  customDb?: Database.Database,
  districtId?: string,
  limit = 50
): CitizenSubmission[] {
  const db = customDb || getDb()
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500))

  let rows: RawSubmissionRow[]
  if (districtId) {
    rows = db
      .prepare('SELECT * FROM citizen_submissions WHERE district_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(districtId, safeLimit) as RawSubmissionRow[]
  } else {
    rows = db
      .prepare('SELECT * FROM citizen_submissions ORDER BY created_at DESC LIMIT ?')
      .all(safeLimit) as RawSubmissionRow[]
  }

  return rows.map((r) => formatSubmissionUi(r))
}

export function createCitizenSubmission(
  sub: {
    district_id: string
    alloc_infra_pct: number
    alloc_health_pct: number
    alloc_edu_pct: number
    alloc_social_pct: number
    notes?: string
    author?: string
    district_name?: string
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
  const district_name = sub.district_name || district.name
  const author = sub.author || `Warga ${district.name}`

  const stmt = db.prepare(`
    INSERT INTO citizen_submissions (
      id, district_id, district_name, author, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, district_id, district_name, author, alloc_infra_pct, alloc_health_pct, alloc_edu_pct, alloc_social_pct, notes || null, created_at)

  return formatSubmissionUi({
    id,
    district_id,
    district_name,
    author,
    alloc_infra_pct,
    alloc_health_pct,
    alloc_edu_pct,
    alloc_social_pct,
    notes: notes || null,
    created_at,
  })
}

// ── Admin Functions ──────────────────────────────────────────────────────────
export function getAdminByEmail(email: string, customDb?: Database.Database): AdminUser | null {
  const db = customDb || getDb()
  const row = db
    .prepare('SELECT id, email, name, role, created_at FROM admins WHERE lower(email) = lower(?)')
    .get(email.trim()) as AdminUser | undefined
  return row || null
}

export function verifyAdminCredentials(
  email: string,
  password: string,
  customDb?: Database.Database
): { valid: boolean; user?: AdminUser } {
  const db = customDb || getDb()
  const adminEmail = email.trim().toLowerCase()
  const row = db
    .prepare('SELECT id, email, password, name, role, created_at FROM admins WHERE lower(email) = ?')
    .get(adminEmail) as (AdminUser & { password: string }) | undefined

  if (!row) {
    return { valid: false }
  }

  const isValid = row.password === password
  if (!isValid) {
    return { valid: false }
  }

  return {
    valid: true,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
    },
  }
}

export function updateAdminPassword(
  email: string,
  newPassword: string,
  customDb?: Database.Database
): boolean {
  const db = customDb || getDb()
  const adminEmail = email.trim().toLowerCase()
  const res = db
    .prepare('UPDATE admins SET password = ? WHERE lower(email) = ?')
    .run(newPassword, adminEmail)
  return res.changes > 0
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
    DELETE FROM admins;
    DELETE FROM citizen_submissions;
    DELETE FROM districts;
  `)
  seedInitialData(db)
}

