module.exports = async (fastify, opts) => {
  // Create pin
  fastify.post('/', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const { title, description, image_url, link_url, board_id, tags } = request.body
    
    const [pin] = await fastify.knex('pins')
      .insert({
        title,
        description,
        image_url,
        link_url,
        user_id: request.user.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*')

    if (board_id) {
      await fastify.knex('board_pins').insert({
        board_id,
        pin_id: pin.id
      })
    }

    if (tags && tags.length > 0) {
      const tagIds = []
      for (const tagName of tags) {
        let tag = await fastify.knex('tags')
          .where('name', tagName.toLowerCase())
          .first()
        
        if (!tag) {
          [tag] = await fastify.knex('tags')
            .insert({ name: tagName.toLowerCase() })
            .returning('*')
        }
        tagIds.push(tag.id)
      }

      await fastify.knex('pin_tags')
        .insert(tagIds.map(tag_id => ({
          pin_id: pin.id,
          tag_id
        })))
    }

    return pin
  })

  // Other pin routes...
}