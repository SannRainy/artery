// client/src/components/ui/Button.jsx

export default function Button({
  children,
  className = '',
  variant = 'default',
  as: Component = 'button', 
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm'

  const variants = {

    default: 'bg-primary text-white hover:bg-primary-dark',
    outline: 'border border-primary text-primary hover:bg-primary-light',
    icon: 'p-2 rounded-full hover:bg-gray-100 focus:ring-offset-0',
    danger: 'bg-red-500 text-white hover:bg-red-600',

    secondary: 'bg-gray-800 text-white hover:bg-black',
    'light-outline': 'bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200' 
  }

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}