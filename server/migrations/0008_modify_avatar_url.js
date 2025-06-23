// server/migrations/0008_modify_avatar_url.js
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('avatar_url', 255).defaultTo('https://weuskrczzjbswnpsgbmp.supabase.co/storage/v1/object/public/avatars/default-avatar.gif').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('avatar_url', 255).defaultTo('/img/default-avatar.png').alter();
  });
};