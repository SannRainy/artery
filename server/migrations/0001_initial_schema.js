exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('username', 50).unique().notNullable()
    table.string('email', 100).unique().notNullable()
    table.string('password_hash', 255).notNullable()
    table.string('avatar_url', 255)
    table.text('bio')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('boards', (table) => {
    table.increments('id').primary()
    table.string('title', 100).notNullable()
    table.text('description')
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.boolean('is_private').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('pins', (table) => {
    table.increments('id').primary()
    table.string('title', 100).notNullable()
    table.text('description')
    table.string('image_url', 255).notNullable()
    table.string('link_url', 255)
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('board_pins', (table) => {
    table.increments('id').primary()
    table.integer('board_id').unsigned().references('id').inTable('boards').onDelete('CASCADE')
    table.integer('pin_id').unsigned().references('id').inTable('pins').onDelete('CASCADE')
    table.unique(['board_id', 'pin_id'])
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary()
    table.string('name', 50).unique().notNullable()
  })

  await knex.schema.createTable('pin_tags', (table) => {
    table.increments('id').primary()
    table.integer('pin_id').unsigned().references('id').inTable('pins').onDelete('CASCADE')
    table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE')
    table.unique(['pin_id', 'tag_id'])
  })

  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary()
    table.text('text').notNullable()
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.integer('pin_id').unsigned().references('id').inTable('pins').onDelete('CASCADE')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('likes', (table) => {
    table.increments('id').primary()
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.integer('pin_id').unsigned().references('id').inTable('pins').onDelete('CASCADE')
    table.unique(['user_id', 'pin_id'])
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('follows', (table) => {
    table.increments('id').primary()
    table.integer('follower_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.integer('following_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    table.unique(['follower_id', 'following_id'])
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('follows')
  await knex.schema.dropTableIfExists('likes')
  await knex.schema.dropTableIfExists('comments')
  await knex.schema.dropTableIfExists('pin_tags')
  await knex.schema.dropTableIfExists('tags')
  await knex.schema.dropTableIfExists('board_pins')
  await knex.schema.dropTableIfExists('pins')
  await knex.schema.dropTableIfExists('boards')
  await knex.schema.dropTableIfExists('users')
}