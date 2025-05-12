module.exports = async (fastify, opts) => {
  // Get all tags
  fastify.get('/', async (request) => {
    const tags = await fastify.knex('tags')
      .select('*')
      .orderBy('name', 'asc')

    return tags
  })

  // Get popular tags
  fastify.get('/popular', async (request) => {
    const tags = await fastify.knex('pin_tags')
      .join('tags', 'pin_tags.tag_id', 'tags.id')
      .select('tags.id', 'tags.name')
      .count('* as count')
      .groupBy('tags.id', 'tags.name')
      .orderBy('count', 'desc')
      .limit(20)

    return tags
  })

  // Get pins by tag
  fastify.get('/:tag/pins', async (request) => {
    const { page = 1, limit = 30 } = request.query
    const offset = (page - 1) * limit

    const pins = await fastify.knex('pin_tags')
      .where('tags.name', request.params.tag.toLowerCase())
      .join('tags', 'pin_tags.tag_id', 'tags.id')
      .join('pins', 'pin_tags.pin_id', 'pins.id')
      .select('pins.*')
      .orderBy('pins.created_at', 'desc')
      .limit(limit)
      .offset(offset)

    const total = await fastify.knex('pin_tags')
      .where('tags.name', request.params.tag.toLowerCase())
      .join('tags', 'pin_tags.tag_id', 'tags.id')
      .count('* as count')
      .first()

    return {
      data: pins,   
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count)
      }
    }
  })
}