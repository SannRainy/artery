const fastify = require('fastify')({ logger: true })
const fastifyJwt = require('@fastify/jwt')
const fastifyCors = require('@fastify/cors')
const knexConfig = require('./knexfile')
const knex = require('knex')(knexConfig.development)

// Attach knex to fastify instance
fastify.decorate('knex', knex)

// Register plugins
fastify.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  sign: { expiresIn: '7d' }
})

// Authentication decorator
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
})

// Register routes
fastify.register(require('./routes/users'), { prefix: '/api/users' })
fastify.register(require('./routes/pins'), { prefix: '/api/pins' })
fastify.register(require('./routes/boards'), { prefix: '/api/boards' })
fastify.register(require('./routes/tags'), { prefix: '/api/tags' })

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', db: 'connected' }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    })
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()