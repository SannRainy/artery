export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizes[size]}`} />
  )
}