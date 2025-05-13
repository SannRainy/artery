import api from './api'

export const getTags = async () => {
  try {
    const response = await api.get('/tags')
    return response.data
  } catch (error) {
    console.error("Failed to fetch tags", error)
    throw new Error('Failed to load tags, please try again later.')
  }
}

export const getPopularTags = async () => {
  try {
    const response = await api.get('/tags/popular')
    return response.data
  } catch (error) {
    console.error("Failed to fetch popular tags", error)
    throw new Error('Failed to load popular tags, please try again later.')
  }
}

export const getPinsByTag = async (tag, page = 1, limit = 30) => {
  try {
    const response = await api.get(`/pins/tags/${tag}`, {
      params: { page, limit }
    })
    return response.data.data
  } catch (error) {
    console.error(`Failed to fetch pins by tag ${tag}`, error)
    throw new Error('Failed to load pins by tag, please try again later.')
  }
}
