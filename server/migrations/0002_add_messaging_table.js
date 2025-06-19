
exports.up = async function(knex) {
  
  await knex.schema.createTable('conversations', (table) => {
    table.increments('id').primary();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  
  await knex.schema.createTable('conversation_participants', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    
    table.unique(['conversation_id', 'user_id']);
  });

  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.text('text').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversation_participants');
  await knex.schema.dropTableIfExists('conversations');
};