export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      resolve({ width: 800, height: 600 }) // Default dimensions
    }
    img.src = url
  })
}

export const debounce = (func, delay) => {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export const getPinterestLayout = (items, columns = 4) => {
  const result = Array(columns).fill().map(() => [])
  items.forEach((item, index) => {
    result[index % columns].push(item)
  })
  return result
}