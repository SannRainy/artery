const bcrypt = require('bcrypt')

module.exports = async (fastify, opts) => {
  // Register user
  fastify.post('/register', async (request, reply) => {
    const { username, email, password } = request.body
    
    const userExists = await fastify.knex('users')
      .where({ email })
      .orWhere({ username })
      .first()
    
    if (userExists) {
      return reply.code(400).send({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const [user] = await fastify.knex('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*')

    const token = fastify.jwt.sign({ id: user.id })
    return { user, token }
  })

  // Login user
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body

    const user = await fastify.knex('users')
      .where({ email })
      .first()

    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return reply.code(401).send({ message: 'Invalid credentials' })
    }

    const token = fastify.jwt.sign({ id: user.id })
    return { user, token }
  })

  // Get current user
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request) => {
    return await fastify.knex('users')
      .where({ id: request.user.id })
      .first()
  })

  // Other user routes...
}