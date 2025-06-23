// server/migrations/0007_add_notification_settings_to_users.js
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.boolean('notifications_on_follow').defaultTo(true).notNullable();
    table.boolean('notifications_on_comment').defaultTo(true).notNullable();
    table.boolean('notifications_on_like').defaultTo(true).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('notifications_on_follow');
    table.dropColumn('notifications_on_comment');
    table.dropColumn('notifications_on_like');
  });
};