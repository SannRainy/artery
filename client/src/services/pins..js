import api from './api'

export const getPins = async (page = 1, limit = 30) => {
  const response = await api.get('/pins', {
    params: { page, limit }
  })
  return response.data.data
}

export const getPinById = async (id) => {
  const response = await api.get(`/pins/${id}`)
  return response.data
}

export const createPin = async (formData) => {
  const response = await api.post('/pins', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const likePin = async (pinId) => {
  await api.post(`/pins/${pinId}/like`)
}

export const unlikePin = async (pinId) => {
  await api.delete(`/pins/${pinId}/like`)
}