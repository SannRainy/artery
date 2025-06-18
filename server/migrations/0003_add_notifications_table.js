exports.up = async function(knex) {
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    
    // Siapa yang menerima notifikasi ini
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Siapa yang melakukan aksi (misal: yang me-like atau follow)
    table.integer('actor_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Jenis notifikasi
    table.enum('type', ['like', 'comment', 'follow']).notNullable();
    
    // ID dari entitas terkait (misal: pin_id)
    table.integer('entity_id').unsigned();
    
    // Status sudah dibaca atau belum
    table.boolean('is_read').defaultTo(false);
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('notifications');
};