import { resetDatabaseToDefaults } from '../src/lib/db'

try {
  console.log('[NalarPublik DB] Mereset database SQLite ke data awal...')
  resetDatabaseToDefaults()
  console.log('[NalarPublik DB] Berhasil! Database telah dikembalikan ke kondisi default seed.')
} catch (error) {
  console.error('[NalarPublik DB] Gagal mereset database:', error)
  process.exit(1)
}
