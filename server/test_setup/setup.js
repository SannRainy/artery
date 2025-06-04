// server/__tests__/setup.js
const knex = require('knex');
const knexConfig = require('../knexfile'); // Pastikan path ini benar
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); 

const dbInstance = knex(knexConfig.test); // Gunakan konfigurasi database test

// Fungsi untuk membersihkan semua tabel yang relevan
async function cleanDB() {
  try {
    await dbInstance.raw('SET FOREIGN_KEY_CHECKS = 0');
    // Urutan penting untuk truncate karena foreign key
    const tables = ['follows', 'pin_comments', 'pin_likes', 'pin_tags', 'pins', 'boards', 'tags', 'users'];
    for (const table of tables) {
      await dbInstance(table).truncate();
    }
  } catch (error) {
    console.error("Error cleaning database in setup:", error);
    // Anda bisa melempar error agar tes berhenti jika pembersihan gagal
  } finally {
    await dbInstance.raw('SET FOREIGN_KEY_CHECKS = 1');
  }
}

const fixturesDir = path.join(__dirname, 'fixtures');
const testUploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'test_uploads_integration');

beforeAll(async () => {
  try {
    await dbInstance.migrate.latest();
    console.log("Migrations run successfully for test environment.");

    // Buat direktori fixtures dan uploads jika belum ada
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
    if (!fs.existsSync(testUploadsDir)) fs.mkdirSync(testUploadsDir, { recursive: true });
    
    // Buat file dummy jika diperlukan oleh tes
    if (!fs.existsSync(path.join(fixturesDir, 'test-image.jpg'))) {
        fs.writeFileSync(path.join(fixturesDir, 'test-image.jpg'), 'dummy image content');
    }
    if (!fs.existsSync(path.join(fixturesDir, 'test-avatar.png'))) {
        fs.writeFileSync(path.join(fixturesDir, 'test-avatar.png'), 'dummy avatar content');
    }

  } catch (error) {
    console.error("Fatal error during test setup (migrations or directory creation):", error);
    process.exit(1);
  }
});

beforeEach(async () => {
  await cleanDB();
});

afterAll(async () => {
  await dbInstance.destroy();

});
