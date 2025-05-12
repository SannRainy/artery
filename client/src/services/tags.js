import api from './api'

export const getTags = async () => {
  const response = await api.get('/tags')
  return response.data
}

export const getPopularTags = async () => {
  const response = await api.get('/tags/popular')
  return response.data
}

export const getPinsByTag = async (tag, page = 1, limit = 30) => {
  const response = await api.get(`/pins/tags/${tag}`, {
    params: { page, limit }
  })
  return response.data.data
}