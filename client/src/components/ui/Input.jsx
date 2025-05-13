// src/components/ui/Input.js

export default function Input({ label, error, ...rest }) {
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={rest.name} className="text-sm font-semibold text-gray-700">{label}</label>}
      <input
        {...rest}
        className={`mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </div>
  )
}
