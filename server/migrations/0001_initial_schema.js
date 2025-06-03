exports.up = async (knex) => {
  // Table: users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 50).unique().notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('avatar_url', 255).defaultTo('https://example.com/default-avatar.png'); // Added
    table.string('bio', 500).defaultTo(''); // Added
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Table: pins
  await knex.schema.createTable('pins', (table) => {
    table.increments('id').primary();
    table.string('title', 100).notNullable();
    table.string('description', 1000); // Added, assuming nullable
    table.string('image_url', 255).notNullable(); // Corrected from 'image' to 'image_url'
    table.string('link_url', 255); // Added, assuming nullable
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable(); // user_id should probably be notNullable
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Table: tags (Added)
  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('name', 50).unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Table: pin_tags (Junction table - Added)
  await knex.schema.createTable('pin_tags', (table) => {
    table.increments('id').primary();
    table.integer('pin_id').unsigned().references('id').inTable('pins').onDelete('CASCADE');
    table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE');
    table.unique(['pin_id', 'tag_id']); // Prevent duplicate tag assignments
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Table: boards (Added)
  await knex.schema.createTable('boards', (table) => {
    table.increments('id').primary();
    table.string('title', 100).notNullable();
    table.string('description', 500);
    table.boolean('is_private').defaultTo(false);
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Table: follows (Added)
  await knex.schema.createTable('follows', (table) => {
    table.increments('id').primary();
    table.integer('follower_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.integer('following_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.unique(['follower_id', 'following_id']); // A user can only follow another user once
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('follows');
  await knex.schema.dropTableIfExists('boards');
  await knex.schema.dropTableIfExists('pin_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('pins');
  await knex.schema.dropTableIfExists('users');
};