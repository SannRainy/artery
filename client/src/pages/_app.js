import { AuthProvider } from '../contexts/AuthContexts'  // Importing the AuthProvider to manage authentication state globally
import '../styles/global.css'  // Importing global styles for the application

// Main application component
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>  // Wrapping the entire app with AuthProvider to manage authentication context
      <Component {...pageProps} />  // Rendering the page component with its specific props
    </AuthProvider>
  )
}

export default MyApp  // Exporting the main app component
