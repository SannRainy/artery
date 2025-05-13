import { AuthProvider } from '../contexts/AuthContexts'  // Importing the AuthProvider to manage authentication state globally
import '../styles/global.css'  // Importing global styles for the application

// Main application component
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>  
      <Component {...pageProps} />  
    </AuthProvider>
  )
}

export default MyApp  // Exporting the main app component
