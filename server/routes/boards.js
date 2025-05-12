module.exports = async (fastify, opts) => {
  // Create a new board
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, is_private } = request.body

    const [board] = await fastify.knex('boards')
      .insert({
        title,
        description,
        is_private: is_private || false,
        user_id: request.user.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*')

    return board
  })

  // Get all boards for current user
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request) => {
    const boards = await fastify.knex('boards')
      .where('user_id', request.user.id)
      .orderBy('created_at', 'desc')

    return boards
  })

  // Get a single board with its pins
  fastify.get('/:id', async (request, reply) => {
    const board = await fastify.knex('boards')
      .where('boards.id', request.params.id)
      .first()

    if (!board) {
      return reply.code(404).send({ message: 'Board not found' })
    }

    if (board.is_private && (!request.user || board.user_id !== request.user.id)) {
      return reply.code(403).send({ message: 'Not authorized to view this board' })
    }

    const pins = await fastify.knex('board_pins')
      .where('board_id', board.id)
      .join('pins', 'board_pins.pin_id', 'pins.id')
      .select('pins.*')
      .orderBy('board_pins.created_at', 'desc')

    const user = await fastify.knex('users')
      .where('id', board.user_id)
      .select('id', 'username', 'avatar_url')
      .first()

    return {
      ...board,
      user,
      pins
    }
  })

  // Update a board
  fastify.put('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, is_private } = request.body

    const board = await fastify.knex('boards')
      .where({ id: request.params.id })
      .first()

    if (!board) {
      return reply.code(404).send({ message: 'Board not found' })
    }

    if (board.user_id !== request.user.id) {
      return reply.code(403).send({ message: 'Not authorized' })
    }

    const [updatedBoard] = await fastify.knex('boards')
      .where({ id: request.params.id })
      .update({
        title,
        description,
        is_private,
        updated_at: new Date()
      })
      .returning('*')

    return updatedBoard
  })

  // Delete a board
  fastify.delete('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const board = await fastify.knex('boards')
      .where({ id: request.params.id })
      .first()

    if (!board) {
      return reply.code(404).send({ message: 'Board not found' })
    }

    if (board.user_id !== request.user.id) {
      return reply.code(403).send({ message: 'Not authorized' })
    }

    await fastify.knex('boards')
      .where({ id: request.params.id })
      .del()

    return { message: 'Board deleted successfully' }
  })

  // Add pin to board
  fastify.post('/:id/pins', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { pin_id } = request.body

    const board = await fastify.knex('boards')
      .where({ id: request.params.id })
      .first()

    if (!board) {
      return reply.code(404).send({ message: 'Board not found' })
    }

    if (board.user_id !== request.user.id) {
      return reply.code(403).send({ message: 'Not authorized' })
    }

    const pin = await fastify.knex('pins')
      .where({ id: pin_id })
      .first()

    if (!pin) {
      return reply.code(404).send({ message: 'Pin not found' })
    }

    try {
      await fastify.knex('board_pins').insert({
        board_id: request.params.id,
        pin_id: pin_id,
        created_at: new Date()
      })

      return { message: 'Pin added to board successfully' }
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(400).send({ message: 'Pin already exists in this board' })
      }
      throw err
    }
  })

  // Remove pin from board
  fastify.delete('/:id/pins/:pin_id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const board = await fastify.knex('boards')
      .where({ id: request.params.id })
      .first()

    if (!board) {
      return reply.code(404).send({ message: 'Board not found' })
    }

    if (board.user_id !== request.user.id) {
      return reply.code(403).send({ message: 'Not authorized' })
    }

    await fastify.knex('board_pins')
      .where({
        board_id: request.params.id,
        pin_id: request.params.pin_id
      })
      .del()

    return { message: 'Pin removed from board successfully' }
  })
}