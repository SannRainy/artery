import api from './api'

export const getBoards = async (userId) => {
  try {
    const response = await api.get('/boards/me', {
      params: { user_id: userId }
    })
    return response.data
  } catch (error) {
    console.error("Failed to fetch boards", error)
    throw new Error('Failed to load boards, please try again later.')
  }
}

export const getBoardById = async (id) => {
  try {
    const response = await api.get(`/boards/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch board with id ${id}`, error)
    throw new Error('Failed to load board details, please try again later.')
  }
}

export const createBoard = async (boardData) => {
  try {
    const response = await api.post('/boards', boardData)
    return response.data
  } catch (error) {
    console.error("Failed to create board", error)
    throw new Error('Failed to create board, please try again later.')
  }
}

export const updateBoard = async (id, boardData) => {
  try {
    const response = await api.put(`/boards/${id}`, boardData)
    return response.data
  } catch (error) {
    console.error(`Failed to update board with id ${id}`, error)
    throw new Error('Failed to update board, please try again later.')
  }
}

export const deleteBoard = async (id) => {
  try {
    await api.delete(`/boards/${id}`)
  } catch (error) {
    console.error(`Failed to delete board with id ${id}`, error)
    throw new Error('Failed to delete board, please try again later.')
  }
}

export const addPinToBoard = async (boardId, pinId) => {
  try {
    await api.post(`/boards/${boardId}/pins`, { pin_id: pinId })
  } catch (error) {
    console.error(`Failed to add pin to board with id ${boardId}`, error)
    throw new Error('Failed to add pin to board, please try again later.')
  }
}

export const removePinFromBoard = async (boardId, pinId) => {
  try {
    await api.delete(`/boards/${boardId}/pins/${pinId}`)
  } catch (error) {
    console.error(`Failed to remove pin from board with id ${boardId}`, error)
    throw new Error('Failed to remove pin from board, please try again later.')
  }
}
