
export const formatDate = (dateString, locale = 'id-ID') => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(locale, options)
}

export const getImageUrl = (url, defaultImg = '/img/default-pin.png') => {
  if (!url) {
    return defaultImg;
  }

  if (url.startsWith('http')) {
    return url;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
  return `${BASE_URL}${url}`;
};

export const truncateText = (text = '', maxLength = 100) => {
  if (typeof text !== 'string') return ''
  return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...'
}


export const getInitials = (name = '') => {
  if (!name.trim()) return ''
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0].toUpperCase())
    .join('')
}

export const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      resolve({ width: 800, height: 600 }) 
    }
    img.src = url
  })
}

export const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export const getPinterestLayout = (items = [], columns = 4) => {
  const result = Array.from({ length: columns }, () => [])
  items.forEach((item, index) => {
    result[index % columns].push(item)
  })
  return result
}

export function getDefaultAvatarUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://weuskrczzjbswnpsgbmp.supabase.co/storage/v1/object/public/uploads/default-avatar.png';
  }
  return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/uploads/default-avatar.png`;
}
