// client/src/components/ui/Button.jsx

export default function Button({
  children,
  className = '',
  variant = 'default',
  as: Component = 'button', 
  ...props
}) {

  const baseClasses = 'inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-base'

  const variants = {

    default: 'bg-primary text-white hover:bg-primary-dark',

    danger: 'bg-primary text-white hover:bg-primary-dark',

    'light-outline': 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100',

    outline: 'border border-primary text-primary hover:bg-primary-light',
    icon: 'p-2 rounded-full hover:bg-gray-100 focus:ring-offset-0',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300'
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