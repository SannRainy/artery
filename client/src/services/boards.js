import api from './api'

export const getBoards = async (userId) => {
  const response = await api.get('/boards/me', {
    params: { user_id: userId }
  })
  return response.data
}

export const getBoardById = async (id) => {
  const response = await api.get(`/boards/${id}`)
  return response.data
}

export const createBoard = async (boardData) => {
  const response = await api.post('/boards', boardData)
  return response.data
}

export const updateBoard = async (id, boardData) => {
  const response = await api.put(`/boards/${id}`, boardData)
  return response.data
}

export const deleteBoard = async (id) => {
  await api.delete(`/boards/${id}`)
}

export const addPinToBoard = async (boardId, pinId) => {
  await api.post(`/boards/${boardId}/pins`, { pin_id: pinId })
}

export const removePinFromBoard = async (boardId, pinId) => {
  await api.delete(`/boards/${boardId}/pins/${pinId}`)
}