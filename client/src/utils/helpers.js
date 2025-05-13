// Format tanggal lokal misalnya: "13 Mei 2025"
export const formatDate = (dateString, locale = 'id-ID') => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(locale, options)
}

// Potong teks panjang dengan batas default 100 karakter
export const truncateText = (text = '', maxLength = 100) => {
  if (typeof text !== 'string') return ''
  return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...'
}

// Ambil inisial dari nama pengguna, misal: "John Doe" → "JD"
export const getInitials = (name = '') => {
  if (!name.trim()) return ''
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0].toUpperCase())
    .join('')
}

// Ambil dimensi gambar dari URL, fallback ke default jika error
export const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      resolve({ width: 800, height: 600 }) // fallback jika gagal
    }
    img.src = url
  })
}

// Fungsi debounce: tunda eksekusi hingga tidak ada input baru dalam delay ms
export const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// Bagi array item ke dalam kolom layout Pinterest-style
export const getPinterestLayout = (items = [], columns = 4) => {
  const result = Array.from({ length: columns }, () => [])
  items.forEach((item, index) => {
    result[index % columns].push(item)
  })
  return result
}
