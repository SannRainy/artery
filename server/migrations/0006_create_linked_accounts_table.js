// server/migrations/0006_create_linked_accounts_table.js
exports.up = function(knex) {
  return knex.schema.createTable('linked_accounts', function(table) {
    table.increments('id').primary();
    table.integer('managing_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.integer('linked_user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Mencegah duplikasi
    table.unique(['managing_user_id', 'linked_user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('linked_accounts');
};