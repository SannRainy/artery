export default function Button({ 
  children, 
  className = '', 
  variant = 'default', 
  ...props 
}) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
  
  const variants = {
    default: 'bg-primary text-white hover:bg-primary-dark',
    outline: 'border border-primary text-primary hover:bg-primary-light',
    icon: 'p-2 rounded-full hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
