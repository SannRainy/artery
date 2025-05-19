import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContexts'
import { FiSearch, FiPlus, FiUser } from 'react-icons/fi'
import Button from '../ui/Button'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-primary font-bold text-xl">
          Artery
        </Link>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="icon" title="Create Pin">
                <FiPlus size={20} />
              </Button>
              <div className="relative group">
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" aria-label="User menu">
                  <FiUser size={18} />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href={`/users/${user.id}`} className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to log out?")) {
                        logout()
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
