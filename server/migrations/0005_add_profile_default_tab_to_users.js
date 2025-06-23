// server/migrations/0005_add_profile_default_tab_to_users.js
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('profile_default_tab', 50).defaultTo('pins').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('profile_default_tab');
  });
};