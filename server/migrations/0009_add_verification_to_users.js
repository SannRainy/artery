// server/migrations/0009_add_verification_to_users.js
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.boolean('is_verified').defaultTo(false).notNullable();
    table.string('verification_token', 255).nullable();
    table.timestamp('verification_token_expires').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('is_verified');
    table.dropColumn('verification_token');
    table.dropColumn('verification_token_expires');
  });
};