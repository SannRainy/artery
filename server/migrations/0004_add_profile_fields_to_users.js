// server/migrations/0004_add_profile_fields_to_users.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Menambahkan kolom baru untuk detail profil
    table.string('location', 255);
    table.string('nationality', 100);
    table.date('date_of_birth');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Perintah untuk membatalkan migrasi (rollback)
    table.dropColumn('location');
    table.dropColumn('nationality');
    table.dropColumn('date_of_birth');
  });
};